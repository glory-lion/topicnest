package handlers

import (
	"encoding/json"
	"net/http"

	"topicnest-backend/db"
	"topicnest-backend/models"

	"github.com/gorilla/mux"
)

// GetCommentsByPost returns all comments for a post
func GetCommentsByPost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID := vars["postId"]

	rows, err := db.DB.Query(`
		SELECT c.id, c.post_id, c.user_id, c.content, c.upvotes, c.created_at, c.updated_at,
			   u.id, u.username, u.bio, u.avatar_url, u.created_at
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.post_id = $1
		ORDER BY c.created_at ASC
	`, postID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch comments")
		return
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		var author models.User

		err := rows.Scan(
			&comment.ID, &comment.PostID, &comment.UserID, &comment.Content, &comment.Upvotes, &comment.CreatedAt, &comment.UpdatedAt,
			&author.ID, &author.Username, &author.Bio, &author.AvatarURL, &author.CreatedAt,
		)
		if err != nil {
			continue
		}

		comment.Author = &author
		// Set legacy field for frontend compatibility
		comment.Users = &author
		comments = append(comments, comment)
	}

	if comments == nil {
		comments = []models.Comment{}
	}

	respondJSON(w, http.StatusOK, comments)
}

// CreateComment creates a new comment on a post
func CreateComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID := vars["postId"]

	// Get user_id from context
	val := r.Context().Value("user_id")
	if val == nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	userID := val.(string)

	var body struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if body.Content == "" {
		respondError(w, http.StatusBadRequest, "Content is required")
		return
	}

	var comment models.Comment
	err := db.DB.QueryRow(`
		INSERT INTO comments (post_id, user_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, post_id, user_id, content, upvotes, created_at, updated_at
	`, postID, userID, body.Content).Scan(
		&comment.ID, &comment.PostID, &comment.UserID, &comment.Content, &comment.Upvotes, &comment.CreatedAt, &comment.UpdatedAt,
	)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create comment: "+err.Error())
		return
	}

	// Fetch author info
	user, _ := getUserByID(userID)
	comment.Author = user

	respondJSON(w, http.StatusCreated, comment)
}

// UpdateComment updates an existing comment
func UpdateComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID := vars["id"]

	var req models.UpdateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Content == "" {
		respondError(w, http.StatusBadRequest, "Content is required")
		return
	}

	var comment models.Comment
	err := db.DB.QueryRow(`
		UPDATE comments SET content = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, post_id, user_id, content, upvotes, created_at, updated_at
	`, req.Content, commentID).Scan(
		&comment.ID, &comment.PostID, &comment.UserID, &comment.Content, &comment.Upvotes, &comment.CreatedAt, &comment.UpdatedAt,
	)
	if err != nil {
		respondError(w, http.StatusNotFound, "Comment not found")
		return
	}

	respondJSON(w, http.StatusOK, comment)
}

// DeleteComment deletes a comment
func DeleteComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID := vars["id"]

	result, err := db.DB.Exec("DELETE FROM comments WHERE id = $1", commentID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete comment")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		respondError(w, http.StatusNotFound, "Comment not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Comment deleted successfully"})
}

// UpvoteComment upvotes a comment
func UpvoteComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID := vars["id"]

	var comment models.Comment
	err := db.DB.QueryRow(`
		UPDATE comments SET upvotes = upvotes + 1 WHERE id = $1
		RETURNING id, post_id, user_id, content, upvotes, created_at, updated_at
	`, commentID).Scan(
		&comment.ID, &comment.PostID, &comment.UserID, &comment.Content, &comment.Upvotes, &comment.CreatedAt, &comment.UpdatedAt,
	)
	if err != nil {
		respondError(w, http.StatusNotFound, "Comment not found")
		return
	}

	respondJSON(w, http.StatusOK, comment)
}

// GetBookmarksByUser returns all bookmarks for a user
func GetBookmarksByUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	rows, err := db.DB.Query(`
		SELECT b.id, b.user_id, b.post_id, b.created_at,
			   p.id, p.title, p.content, p.image_url, p.category_id, p.user_id, p.upvotes, p.created_at, p.updated_at,
			   u.id, u.username, u.bio, u.avatar_url, u.created_at,
			   c.id, c.name, c.slug, c.description, c.icon, c.gradient, c.glow_color, c.created_at
		FROM bookmarks b
		LEFT JOIN posts p ON b.post_id = p.id
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE b.user_id = $1
		ORDER BY b.created_at DESC
	`, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch bookmarks")
		return
	}
	defer rows.Close()

	var bookmarks []models.Bookmark
	for rows.Next() {
		var bookmark models.Bookmark
		var post models.Post
		var author models.User
		var category models.Category

		err := rows.Scan(
			&bookmark.ID, &bookmark.UserID, &bookmark.PostID, &bookmark.CreatedAt,
			&post.ID, &post.Title, &post.Content, &post.ImageURL, &post.CategoryID, &post.UserID, &post.Upvotes, &post.CreatedAt, &post.UpdatedAt,
			&author.ID, &author.Username, &author.Bio, &author.AvatarURL, &author.CreatedAt,
			&category.ID, &category.Name, &category.Slug, &category.Description, &category.Icon, &category.Gradient, &category.GlowColor, &category.CreatedAt,
		)
		if err != nil {
			continue
		}

		post.Author = &author
		post.Category = &category
		// Set legacy fields for frontend compatibility
		post.Users = &author
		post.Categories = &category

		bookmark.Post = &post
		// Set legacy field for bookmark
		bookmark.Posts = &post

		bookmarks = append(bookmarks, bookmark)
	}

	if bookmarks == nil {
		bookmarks = []models.Bookmark{}
	}

	respondJSON(w, http.StatusOK, bookmarks)
}

// AddBookmark adds a bookmark for a user
func AddBookmark(w http.ResponseWriter, r *http.Request) {
	// Get user_id from context
	val := r.Context().Value("user_id")
	if val == nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	userID := val.(string)

	var body struct {
		PostID string `json:"post_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var bookmark models.Bookmark
	err := db.DB.QueryRow(`
		INSERT INTO bookmarks (user_id, post_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, post_id) DO NOTHING
		RETURNING id, user_id, post_id, created_at
	`, userID, body.PostID).Scan(&bookmark.ID, &bookmark.UserID, &bookmark.PostID, &bookmark.CreatedAt)
	if err != nil {
		// May have been a conflict, return success anyway
		respondJSON(w, http.StatusOK, map[string]string{"message": "Bookmark added"})
		return
	}

	respondJSON(w, http.StatusCreated, bookmark)
}

// RemoveBookmark removes a bookmark
func RemoveBookmark(w http.ResponseWriter, r *http.Request) {
	// Get user_id from context
	val := r.Context().Value("user_id")
	var userID string
	if val != nil {
		userID = val.(string)
	} else {
		userID = r.URL.Query().Get("user_id")
	}

	postID := r.URL.Query().Get("post_id")

	if userID == "" || postID == "" {
		respondError(w, http.StatusBadRequest, "user_id and post_id are required")
		return
	}

	_, err := db.DB.Exec("DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2", userID, postID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to remove bookmark")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Bookmark removed"})
}

// IsPostBookmarked checks if a post is bookmarked by a user
func IsPostBookmarked(w http.ResponseWriter, r *http.Request) {
	// Get user_id from context
	val := r.Context().Value("user_id")
	var userID string
	if val != nil {
		userID = val.(string)
	} else {
		userID = r.URL.Query().Get("user_id")
	}

	postID := r.URL.Query().Get("post_id")

	if userID == "" || postID == "" {
		respondError(w, http.StatusBadRequest, "user_id and post_id are required")
		return
	}

	var count int
	err := db.DB.QueryRow("SELECT COUNT(*) FROM bookmarks WHERE user_id = $1 AND post_id = $2", userID, postID).Scan(&count)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to check bookmark")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"bookmarked": count > 0})
}

// Helper function for JSON responses
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// Helper function for error responses
func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, models.APIResponse{
		Success: false,
		Error:   message,
	})
}
