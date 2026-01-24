package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"topicnest-backend/db"
	"topicnest-backend/models"

	"github.com/gorilla/mux"
)

// GetPosts returns all posts
func GetPosts(w http.ResponseWriter, r *http.Request) {
	categoryID := r.URL.Query().Get("category_id")

	var query string
	var args []interface{}

	if categoryID != "" {
		query = `
			SELECT p.id, p.title, p.content, p.image_url, p.category_id, p.user_id, p.upvotes, p.created_at, p.updated_at,
				   u.id, u.username, u.bio, u.avatar_url, u.created_at,
				   c.id, c.name, c.slug, c.description, c.icon, c.gradient, c.glow_color, c.created_at,
				   (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
			FROM posts p
			LEFT JOIN users u ON p.user_id = u.id
			LEFT JOIN categories c ON p.category_id = c.id
			WHERE p.category_id = $1
			ORDER BY p.created_at DESC
		`
		args = append(args, categoryID)
	} else {
		query = `
			SELECT p.id, p.title, p.content, p.image_url, p.category_id, p.user_id, p.upvotes, p.created_at, p.updated_at,
				   u.id, u.username, u.bio, u.avatar_url, u.created_at,
				   c.id, c.name, c.slug, c.description, c.icon, c.gradient, c.glow_color, c.created_at,
				   (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
			FROM posts p
			LEFT JOIN users u ON p.user_id = u.id
			LEFT JOIN categories c ON p.category_id = c.id
			ORDER BY p.created_at DESC
		`
	}

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch posts")
		return
	}
	defer rows.Close()

	posts := scanPosts(rows)
	respondJSON(w, http.StatusOK, posts)
}

// GetPostsByCategory returns posts by category slug
func GetPostsByCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	slug := vars["slug"]

	rows, err := db.DB.Query(`
		SELECT p.id, p.title, p.content, p.image_url, p.category_id, p.user_id, p.upvotes, p.created_at, p.updated_at,
			   u.id, u.username, u.bio, u.avatar_url, u.created_at,
			   c.id, c.name, c.slug, c.description, c.icon, c.gradient, c.glow_color, c.created_at,
			   (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE c.slug = $1
		ORDER BY p.created_at DESC
	`, slug)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch posts")
		return
	}
	defer rows.Close()

	posts := scanPosts(rows)
	respondJSON(w, http.StatusOK, posts)
}

// GetPostsByUser returns posts by user ID
func GetPostsByUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	rows, err := db.DB.Query(`
		SELECT p.id, p.title, p.content, p.image_url, p.category_id, p.user_id, p.upvotes, p.created_at, p.updated_at,
			   u.id, u.username, u.bio, u.avatar_url, u.created_at,
			   c.id, c.name, c.slug, c.description, c.icon, c.gradient, c.glow_color, c.created_at,
			   (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.user_id = $1
		ORDER BY p.created_at DESC
	`, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch posts")
		return
	}
	defer rows.Close()

	posts := scanPosts(rows)
	respondJSON(w, http.StatusOK, posts)
}

// GetPost returns a single post by ID
func GetPost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID := vars["id"]

	var post models.Post
	var author models.User
	var category models.Category

	err := db.DB.QueryRow(`
		SELECT p.id, p.title, p.content, p.image_url, p.category_id, p.user_id, p.upvotes, p.created_at, p.updated_at,
			   u.id, u.username, u.bio, u.avatar_url, u.created_at,
			   c.id, c.name, c.slug, c.description, c.icon, c.gradient, c.glow_color, c.created_at,
			   (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.id = $1
	`, postID).Scan(
		&post.ID, &post.Title, &post.Content, &post.ImageURL, &post.CategoryID, &post.UserID, &post.Upvotes, &post.CreatedAt, &post.UpdatedAt,
		&author.ID, &author.Username, &author.Bio, &author.AvatarURL, &author.CreatedAt,
		&category.ID, &category.Name, &category.Slug, &category.Description, &category.Icon, &category.Gradient, &category.GlowColor, &category.CreatedAt,
		&post.CommentCount,
	)
	if err != nil {
		respondError(w, http.StatusNotFound, "Post not found")
		return
	}

	post.Author = &author
	post.Category = &category
	// Set legacy fields for frontend compatibility
	post.Users = &author
	post.Categories = &category

	respondJSON(w, http.StatusOK, post)
}

// CreatePost creates a new post
func CreatePost(w http.ResponseWriter, r *http.Request) {
	// Get user_id from context (set by AuthMiddleware)
	val := r.Context().Value("user_id")
	if val == nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	userID := val.(string)

	var req models.CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Title == "" || req.Content == "" || req.CategoryID == "" {
		respondError(w, http.StatusBadRequest, "Title, content, and category_id are required")
		return
	}

	var post models.Post
	err := db.DB.QueryRow(`
		INSERT INTO posts (title, content, image_url, category_id, user_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, title, content, image_url, category_id, user_id, upvotes, created_at, updated_at
	`, req.Title, req.Content, req.ImageURL, req.CategoryID, userID).Scan(
		&post.ID, &post.Title, &post.Content, &post.ImageURL, &post.CategoryID, &post.UserID, &post.Upvotes, &post.CreatedAt, &post.UpdatedAt,
	)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create post: "+err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, post)
}

// UpdatePost updates an existing post
func UpdatePost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID := vars["id"]

	var req models.UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	_, err := db.DB.Exec(`
		UPDATE posts SET title = $1, content = $2, image_url = $3, updated_at = NOW()
		WHERE id = $4
	`, req.Title, req.Content, req.ImageURL, postID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update post")
		return
	}

	// Fetch updated post
	var post models.Post
	err = db.DB.QueryRow(`
		SELECT id, title, content, image_url, category_id, user_id, upvotes, created_at, updated_at
		FROM posts WHERE id = $1
	`, postID).Scan(&post.ID, &post.Title, &post.Content, &post.ImageURL, &post.CategoryID, &post.UserID, &post.Upvotes, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		respondError(w, http.StatusNotFound, "Post not found")
		return
	}

	respondJSON(w, http.StatusOK, post)
}

// DeletePost deletes a post
func DeletePost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID := vars["id"]

	result, err := db.DB.Exec("DELETE FROM posts WHERE id = $1", postID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete post")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		respondError(w, http.StatusNotFound, "Post not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Post deleted successfully"})
}

// UpvotePost upvotes a post
func UpvotePost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID := vars["id"]

	var post models.Post
	err := db.DB.QueryRow(`
		UPDATE posts SET upvotes = upvotes + 1 WHERE id = $1
		RETURNING id, title, content, image_url, category_id, user_id, upvotes, created_at, updated_at
	`, postID).Scan(&post.ID, &post.Title, &post.Content, &post.ImageURL, &post.CategoryID, &post.UserID, &post.Upvotes, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		respondError(w, http.StatusNotFound, "Post not found")
		return
	}

	respondJSON(w, http.StatusOK, post)
}

// SearchPosts searches posts by query
func SearchPosts(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		respondJSON(w, http.StatusOK, []models.Post{})
		return
	}

	searchQuery := "%" + strings.ToLower(query) + "%"

	rows, err := db.DB.Query(`
		SELECT p.id, p.title, p.content, p.image_url, p.category_id, p.user_id, p.upvotes, p.created_at, p.updated_at,
			   u.id, u.username, u.bio, u.avatar_url, u.created_at,
			   c.id, c.name, c.slug, c.description, c.icon, c.gradient, c.glow_color, c.created_at,
			   (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE LOWER(p.title) LIKE $1 
		   OR LOWER(p.content) LIKE $1
		   OR LOWER(c.name) LIKE $1
		   OR LOWER(u.username) LIKE $1
		ORDER BY p.created_at DESC
	`, searchQuery)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to search posts")
		return
	}
	defer rows.Close()

	posts := scanPosts(rows)
	respondJSON(w, http.StatusOK, posts)
}

// Helper function to scan posts from rows
func scanPosts(rows interface {
	Next() bool
	Scan(...interface{}) error
}) []models.Post {
	var posts []models.Post
	for rows.Next() {
		var post models.Post
		var author models.User
		var category models.Category

		err := rows.Scan(
			&post.ID, &post.Title, &post.Content, &post.ImageURL, &post.CategoryID, &post.UserID, &post.Upvotes, &post.CreatedAt, &post.UpdatedAt,
			&author.ID, &author.Username, &author.Bio, &author.AvatarURL, &author.CreatedAt,
			&category.ID, &category.Name, &category.Slug, &category.Description, &category.Icon, &category.Gradient, &category.GlowColor, &category.CreatedAt,
			&post.CommentCount,
		)
		if err != nil {
			continue
		}

		post.Author = &author
		post.Category = &category
		// Set legacy fields for frontend compatibility
		post.Users = &author
		post.Categories = &category
		posts = append(posts, post)
	}

	if posts == nil {
		posts = []models.Post{}
	}
	return posts
}
