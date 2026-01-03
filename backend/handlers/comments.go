package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"topicnest-backend/db"
	"topicnest-backend/middleware"
	"topicnest-backend/models"

	"github.com/gorilla/mux"
)

// GetComments returns comments for a post
func GetComments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	postIDStr := vars["id"]

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid post ID"})
		return
	}

	user := middleware.GetUserFromContext(r)

	// Get top-level comments
	rows, err := db.DB.Query(`
		SELECT c.id, c.content, c.post_id, c.parent_id, c.upvotes, c.downvotes, c.created_at,
			   u.id, u.username, u.karma, u.created_at
		FROM comments c
		JOIN users u ON c.author_id = u.id
		WHERE c.post_id = $1 AND c.parent_id IS NULL
		ORDER BY c.created_at DESC
	`, postID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Database error"})
		return
	}
	defer rows.Close()

	comments := []*models.Comment{}
	for rows.Next() {
		c, err := scanComment(rows, user)
		if err != nil {
			continue
		}
		// Load replies
		c.Replies = loadReplies(c.ID, user)
		comments = append(comments, c)
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: comments})
}

func scanComment(rows *sql.Rows, user *models.User) (*models.Comment, error) {
	var c models.Comment
	var author models.User
	var parentID sql.NullInt64

	err := rows.Scan(
		&c.ID, &c.Content, &c.PostID, &parentID, &c.Upvotes, &c.Downvotes, &c.CreatedAt,
		&author.ID, &author.Username, &author.Karma, &author.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if parentID.Valid {
		pid := int(parentID.Int64)
		c.ParentID = &pid
	}
	c.Author = &author

	// Get user's vote if authenticated
	if user != nil {
		var voteType string
		err := db.DB.QueryRow(`
			SELECT vote_type FROM votes WHERE user_id = $1 AND comment_id = $2
		`, user.ID, c.ID).Scan(&voteType)
		if err == nil {
			c.UserVote = &voteType
		}
	}

	return &c, nil
}

func loadReplies(parentID int, user *models.User) []*models.Comment {
	rows, err := db.DB.Query(`
		SELECT c.id, c.content, c.post_id, c.parent_id, c.upvotes, c.downvotes, c.created_at,
			   u.id, u.username, u.karma, u.created_at
		FROM comments c
		JOIN users u ON c.author_id = u.id
		WHERE c.parent_id = $1
		ORDER BY c.created_at ASC
	`, parentID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	replies := []*models.Comment{}
	for rows.Next() {
		c, err := scanComment(rows, user)
		if err != nil {
			continue
		}
		// Recursively load nested replies
		c.Replies = loadReplies(c.ID, user)
		replies = append(replies, c)
	}
	return replies
}

// CreateComment creates a new comment on a post
func CreateComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user := middleware.GetUserFromContext(r)
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Authentication required"})
		return
	}

	vars := mux.Vars(r)
	postID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid post ID"})
		return
	}

	var req models.CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid request body"})
		return
	}

	if req.Content == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Content is required"})
		return
	}

	// Create comment
	var c models.Comment
	var parentID sql.NullInt64
	if req.ParentID != nil {
		parentID = sql.NullInt64{Int64: int64(*req.ParentID), Valid: true}
	}

	err = db.DB.QueryRow(`
		INSERT INTO comments (content, author_id, post_id, parent_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id, content, post_id, upvotes, downvotes, created_at
	`, req.Content, user.ID, postID, parentID).Scan(
		&c.ID, &c.Content, &c.PostID, &c.Upvotes, &c.Downvotes, &c.CreatedAt,
	)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to create comment"})
		return
	}

	c.Author = user
	c.ParentID = req.ParentID

	// Update comment count on post
	db.DB.Exec("UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1", postID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: c})
}

// VoteComment handles voting on a comment
func VoteComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user := middleware.GetUserFromContext(r)
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Authentication required"})
		return
	}

	vars := mux.Vars(r)
	commentID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid comment ID"})
		return
	}

	var req models.VoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid request body"})
		return
	}

	// Start transaction
	tx, err := db.DB.Begin()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Database error"})
		return
	}
	defer tx.Rollback()

	// Get existing vote
	var existingVote string
	err = tx.QueryRow(`SELECT vote_type FROM votes WHERE user_id = $1 AND comment_id = $2`, user.ID, commentID).Scan(&existingVote)
	hasExistingVote := err == nil

	// Remove existing vote effects
	if hasExistingVote {
		if existingVote == "up" {
			tx.Exec("UPDATE comments SET upvotes = upvotes - 1 WHERE id = $1", commentID)
		} else {
			tx.Exec("UPDATE comments SET downvotes = downvotes - 1 WHERE id = $1", commentID)
		}
		tx.Exec("DELETE FROM votes WHERE user_id = $1 AND comment_id = $2", user.ID, commentID)
	}

	// Add new vote
	if req.VoteType == "up" || req.VoteType == "down" {
		tx.Exec(`INSERT INTO votes (user_id, comment_id, vote_type) VALUES ($1, $2, $3)`, user.ID, commentID, req.VoteType)
		if req.VoteType == "up" {
			tx.Exec("UPDATE comments SET upvotes = upvotes + 1 WHERE id = $1", commentID)
		} else {
			tx.Exec("UPDATE comments SET downvotes = downvotes + 1 WHERE id = $1", commentID)
		}
	}

	if err = tx.Commit(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to vote"})
		return
	}

	// Get updated comment
	var upvotes, downvotes int
	db.DB.QueryRow("SELECT upvotes, downvotes FROM comments WHERE id = $1", commentID).Scan(&upvotes, &downvotes)

	json.NewEncoder(w).Encode(models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"upvotes":   upvotes,
			"downvotes": downvotes,
			"userVote":  req.VoteType,
		},
	})
}

// UpdateComment updates an existing comment (only by author)
func UpdateComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user := middleware.GetUserFromContext(r)
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Authentication required"})
		return
	}

	vars := mux.Vars(r)
	commentID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid comment ID"})
		return
	}

	// Check if user is the author
	var authorID int
	err = db.DB.QueryRow("SELECT author_id FROM comments WHERE id = $1", commentID).Scan(&authorID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Comment not found"})
		return
	}

	if authorID != user.ID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "You can only edit your own comments"})
		return
	}

	var req models.UpdateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid request body"})
		return
	}

	if req.Content == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Content is required"})
		return
	}

	// Update comment
	_, err = db.DB.Exec("UPDATE comments SET content = $1 WHERE id = $2", req.Content, commentID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to update comment"})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: map[string]interface{}{
		"id":      commentID,
		"content": req.Content,
	}})
}

// DeleteComment deletes a comment (only by author)
func DeleteComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user := middleware.GetUserFromContext(r)
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Authentication required"})
		return
	}

	vars := mux.Vars(r)
	commentID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid comment ID"})
		return
	}

	// Check if user is the author and get post_id for comment count update
	var authorID, postID int
	err = db.DB.QueryRow("SELECT author_id, post_id FROM comments WHERE id = $1", commentID).Scan(&authorID, &postID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Comment not found"})
		return
	}

	if authorID != user.ID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "You can only delete your own comments"})
		return
	}

	// Delete comment (child replies will cascade)
	_, err = db.DB.Exec("DELETE FROM comments WHERE id = $1", commentID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to delete comment"})
		return
	}

	// Update comment count on post
	db.DB.Exec("UPDATE posts SET comment_count = comment_count - 1 WHERE id = $1", postID)

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: map[string]interface{}{
		"deleted": true,
		"id":      commentID,
	}})
}
