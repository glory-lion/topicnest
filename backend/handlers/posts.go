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

// GetPosts returns posts with optional filtering
func GetPosts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get query params
	communityName := r.URL.Query().Get("community")
	limitStr := r.URL.Query().Get("limit")

	limit := 20
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Build query
	query := `
		SELECT p.id, p.title, p.content, p.image_url, p.upvotes, p.downvotes, 
			   p.comment_count, p.is_oc, p.created_at,
			   u.id, u.username, u.karma, u.created_at,
			   c.id, c.name, c.display_name, c.description, c.members, c.created_at
		FROM posts p
		JOIN users u ON p.author_id = u.id
		JOIN communities c ON p.community_id = c.id
	`

	var args []interface{}
	if communityName != "" {
		query += " WHERE c.name = $1"
		args = append(args, communityName)
	}

	query += " ORDER BY p.created_at DESC LIMIT $" + strconv.Itoa(len(args)+1)
	args = append(args, limit)

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Database error"})
		return
	}
	defer rows.Close()

	user := middleware.GetUserFromContext(r)
	posts := []models.Post{}

	for rows.Next() {
		var p models.Post
		var author models.User
		var community models.Community
		var content, imageURL sql.NullString

		err := rows.Scan(
			&p.ID, &p.Title, &content, &imageURL, &p.Upvotes, &p.Downvotes,
			&p.CommentCount, &p.IsOC, &p.CreatedAt,
			&author.ID, &author.Username, &author.Karma, &author.CreatedAt,
			&community.ID, &community.Name, &community.DisplayName, &community.Description, &community.Members, &community.CreatedAt,
		)
		if err != nil {
			continue
		}

		p.Content = content.String
		p.ImageURL = imageURL.String
		p.Author = &author
		p.Community = &community

		// Get user's vote if authenticated
		if user != nil {
			var voteType string
			err := db.DB.QueryRow(`
				SELECT vote_type FROM votes WHERE user_id = $1 AND post_id = $2
			`, user.ID, p.ID).Scan(&voteType)
			if err == nil {
				p.UserVote = &voteType
			}
		}

		posts = append(posts, p)
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: posts})
}

// GetPost returns a single post by ID
func GetPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid post ID"})
		return
	}

	var p models.Post
	var author models.User
	var community models.Community
	var content, imageURL sql.NullString

	err = db.DB.QueryRow(`
		SELECT p.id, p.title, p.content, p.image_url, p.upvotes, p.downvotes, 
			   p.comment_count, p.is_oc, p.created_at,
			   u.id, u.username, u.karma, u.created_at,
			   c.id, c.name, c.display_name, c.description, c.members, c.created_at
		FROM posts p
		JOIN users u ON p.author_id = u.id
		JOIN communities c ON p.community_id = c.id
		WHERE p.id = $1
	`, id).Scan(
		&p.ID, &p.Title, &content, &imageURL, &p.Upvotes, &p.Downvotes,
		&p.CommentCount, &p.IsOC, &p.CreatedAt,
		&author.ID, &author.Username, &author.Karma, &author.CreatedAt,
		&community.ID, &community.Name, &community.DisplayName, &community.Description, &community.Members, &community.CreatedAt,
	)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Post not found"})
		return
	}

	p.Content = content.String
	p.ImageURL = imageURL.String
	p.Author = &author
	p.Community = &community

	// Get user's vote if authenticated
	user := middleware.GetUserFromContext(r)
	if user != nil {
		var voteType string
		err := db.DB.QueryRow(`
			SELECT vote_type FROM votes WHERE user_id = $1 AND post_id = $2
		`, user.ID, p.ID).Scan(&voteType)
		if err == nil {
			p.UserVote = &voteType
		}
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: p})
}

// CreatePost creates a new post
func CreatePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user := middleware.GetUserFromContext(r)
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Authentication required"})
		return
	}

	var req models.CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid request body"})
		return
	}

	if req.Title == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Title is required"})
		return
	}

	// Get community
	var community models.Community
	err := db.DB.QueryRow(`
		SELECT id, name, display_name, description, members, created_at 
		FROM communities WHERE id = $1
	`, req.CommunityID).Scan(&community.ID, &community.Name, &community.DisplayName, &community.Description, &community.Members, &community.CreatedAt)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Community not found"})
		return
	}

	// Create post
	var p models.Post
	err = db.DB.QueryRow(`
		INSERT INTO posts (title, content, author_id, community_id, is_oc)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, title, content, upvotes, downvotes, comment_count, is_oc, created_at
	`, req.Title, req.Content, user.ID, req.CommunityID, req.IsOC).Scan(
		&p.ID, &p.Title, &p.Content, &p.Upvotes, &p.Downvotes, &p.CommentCount, &p.IsOC, &p.CreatedAt,
	)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to create post"})
		return
	}

	p.Author = user
	p.Community = &community

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: p})
}

// VotePost handles voting on a post
func VotePost(w http.ResponseWriter, r *http.Request) {
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
	err = tx.QueryRow(`SELECT vote_type FROM votes WHERE user_id = $1 AND post_id = $2`, user.ID, postID).Scan(&existingVote)
	hasExistingVote := err == nil

	// Remove existing vote effects
	if hasExistingVote {
		if existingVote == "up" {
			tx.Exec("UPDATE posts SET upvotes = upvotes - 1 WHERE id = $1", postID)
		} else {
			tx.Exec("UPDATE posts SET downvotes = downvotes - 1 WHERE id = $1", postID)
		}
		tx.Exec("DELETE FROM votes WHERE user_id = $1 AND post_id = $2", user.ID, postID)
	}

	// Add new vote
	if req.VoteType == "up" || req.VoteType == "down" {
		tx.Exec(`INSERT INTO votes (user_id, post_id, vote_type) VALUES ($1, $2, $3)`, user.ID, postID, req.VoteType)
		if req.VoteType == "up" {
			tx.Exec("UPDATE posts SET upvotes = upvotes + 1 WHERE id = $1", postID)
		} else {
			tx.Exec("UPDATE posts SET downvotes = downvotes + 1 WHERE id = $1", postID)
		}
	}

	if err = tx.Commit(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to vote"})
		return
	}

	// Get updated post
	var upvotes, downvotes int
	db.DB.QueryRow("SELECT upvotes, downvotes FROM posts WHERE id = $1", postID).Scan(&upvotes, &downvotes)

	json.NewEncoder(w).Encode(models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"upvotes":   upvotes,
			"downvotes": downvotes,
			"userVote":  req.VoteType,
		},
	})
}

// UpdatePost updates an existing post (only by author)
func UpdatePost(w http.ResponseWriter, r *http.Request) {
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

	// Check if user is the author
	var authorID int
	err = db.DB.QueryRow("SELECT author_id FROM posts WHERE id = $1", postID).Scan(&authorID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Post not found"})
		return
	}

	if authorID != user.ID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "You can only edit your own posts"})
		return
	}

	var req models.UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid request body"})
		return
	}

	// Update post
	_, err = db.DB.Exec(`
		UPDATE posts SET title = $1, content = $2 WHERE id = $3
	`, req.Title, req.Content, postID)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to update post"})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: map[string]interface{}{
		"id":      postID,
		"title":   req.Title,
		"content": req.Content,
	}})
}

// DeletePost deletes a post (only by author)
func DeletePost(w http.ResponseWriter, r *http.Request) {
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

	// Check if user is the author
	var authorID int
	err = db.DB.QueryRow("SELECT author_id FROM posts WHERE id = $1", postID).Scan(&authorID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Post not found"})
		return
	}

	if authorID != user.ID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "You can only delete your own posts"})
		return
	}

	// Delete post (comments and votes will cascade)
	_, err = db.DB.Exec("DELETE FROM posts WHERE id = $1", postID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to delete post"})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: map[string]interface{}{
		"deleted": true,
		"id":      postID,
	}})
}
