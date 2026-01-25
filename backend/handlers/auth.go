package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"topicnest-backend/db"
	"topicnest-backend/models"

	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

// Login handles user login with password verification
func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Username == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Username and password are required")
		return
	}

	// Get user by username
	user, err := getUserByUsername(req.Username)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	// Check if password_hash exists (backward compatibility for users without passwords)
	if user.PasswordHash == nil || *user.PasswordHash == "" {
		respondError(w, http.StatusUnauthorized, "Please set a password for your account")
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Password))
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	// Password correct, return user and token
	respondJSON(w, http.StatusOK, models.LoginResponse{
		User:  user,
		Token: user.ID,
	})
}

// Logout handles user logout
func Logout(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// GetMe returns the current authenticated user
func GetMe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id")
	if userID == nil {
		respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	user, err := getUserByID(userID.(string))
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(w, http.StatusOK, user)
}

// GetOrCreateUser creates a user if not exists (SIGNUP), returns existing user otherwise
func GetOrCreateUser(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Username == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Username and password are required")
		return
	}

	// Check if user already exists
	_, err := getUserByUsername(req.Username)
	if err == nil {
		// User exists
		respondError(w, http.StatusConflict, "Username already taken")
		return
	}

	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	passwordHashStr := string(passwordHash)

	// Create new user with password
	var newUser models.User
	err = db.DB.QueryRow(`
		INSERT INTO users (username, password_hash) VALUES ($1, $2)
		RETURNING id, username, bio, avatar_url, created_at
	`, req.Username, passwordHashStr).Scan(&newUser.ID, &newUser.Username, &newUser.Bio, &newUser.AvatarURL, &newUser.CreatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			respondError(w, http.StatusConflict, "Username already taken")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Return user and token (auto-login after signup)
	respondJSON(w, http.StatusCreated, models.LoginResponse{
		User:  &newUser,
		Token: newUser.ID,
	})
}

// GetUserByID returns a user by their ID
func GetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	user, err := getUserByID(userID)
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(w, http.StatusOK, user)
}

// GetUserByUsername returns a user by their username
func GetUserByUsername(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	user, err := getUserByUsername(username)
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(w, http.StatusOK, user)
}

// GetUserWithStats returns a user with their post and comment counts
func GetUserWithStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	user, err := getUserByID(userID)
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}

	// Get post count
	var postCount int
	err = db.DB.QueryRow("SELECT COUNT(*) FROM posts WHERE user_id = $1", userID).Scan(&postCount)
	if err != nil {
		postCount = 0
	}

	// Get comment count
	var commentCount int
	err = db.DB.QueryRow("SELECT COUNT(*) FROM comments WHERE user_id = $1", userID).Scan(&commentCount)
	if err != nil {
		commentCount = 0
	}

	stats := models.UserStats{
		User:         *user,
		PostCount:    postCount,
		CommentCount: commentCount,
	}

	respondJSON(w, http.StatusOK, stats)
}

// UpdateUser updates a user's profile
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Update user
	_, err := db.DB.Exec(`
		UPDATE users SET bio = COALESCE($1, bio), avatar_url = COALESCE($2, avatar_url)
		WHERE id = $3
	`, req.Bio, req.AvatarURL, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	user, err := getUserByID(userID)
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(w, http.StatusOK, user)
}

// ============ HELPER FUNCTIONS ============

func getOrCreateUserByUsername(username string) (*models.User, error) {
	// Try to get existing user
	user, err := getUserByUsername(username)
	if err == nil {
		return user, nil
	}

	// Create new user
	var newUser models.User
	err = db.DB.QueryRow(`
		INSERT INTO users (username) VALUES ($1)
		RETURNING id, username, bio, avatar_url, created_at
	`, username).Scan(&newUser.ID, &newUser.Username, &newUser.Bio, &newUser.AvatarURL, &newUser.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &newUser, nil
}

func getUserByID(id string) (*models.User, error) {
	var user models.User
	err := db.DB.QueryRow(`
		SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = $1
	`, id).Scan(&user.ID, &user.Username, &user.Bio, &user.AvatarURL, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func getUserByUsername(username string) (*models.User, error) {
	trimmedUsername := strings.TrimSpace(username)
	var user models.User
	err := db.DB.QueryRow(`
		SELECT id, username, bio, avatar_url, created_at, password_hash FROM users WHERE LOWER(username) = LOWER($1)
	`, trimmedUsername).Scan(&user.ID, &user.Username, &user.Bio, &user.AvatarURL, &user.CreatedAt, &user.PasswordHash)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
