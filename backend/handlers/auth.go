package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"topicnest-backend/db"
	"topicnest-backend/middleware"
	"topicnest-backend/models"
)

// generateToken creates a random session token
func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Login handles username-only authentication (like when2meet)
func Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Invalid request body"})
		return
	}

	if req.Username == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Username is required"})
		return
	}

	// Find or create user
	var user models.User
	err := db.DB.QueryRow(`
		SELECT id, username, karma, created_at FROM users WHERE username = $1
	`, req.Username).Scan(&user.ID, &user.Username, &user.Karma, &user.CreatedAt)

	if err == sql.ErrNoRows {
		// Create new user
		err = db.DB.QueryRow(`
			INSERT INTO users (username) VALUES ($1)
			RETURNING id, username, karma, created_at
		`, req.Username).Scan(&user.ID, &user.Username, &user.Karma, &user.CreatedAt)
		
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to create user"})
			return
		}
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Database error"})
		return
	}

	// Generate session token
	token, err := generateToken()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to generate token"})
		return
	}

	// Create session (expires in 30 days)
	expiresAt := time.Now().Add(30 * 24 * time.Hour)
	_, err = db.DB.Exec(`
		INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)
	`, user.ID, token, expiresAt)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Failed to create session"})
		return
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	json.NewEncoder(w).Encode(models.APIResponse{
		Success: true,
		Data: models.LoginResponse{
			User:  &user,
			Token: token,
		},
	})
}

// GetMe returns the current authenticated user
func GetMe(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user := middleware.GetUserFromContext(r)
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Not authenticated"})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Success: true,
		Data:    user,
	})
}

// Logout invalidates the current session
func Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get token from cookie or header
	token := ""
	cookie, err := r.Cookie("session_token")
	if err == nil {
		token = cookie.Value
	}

	if token != "" {
		db.DB.Exec("DELETE FROM sessions WHERE token = $1", token)
	}

	// Clear cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	})

	json.NewEncoder(w).Encode(models.APIResponse{Success: true})
}
