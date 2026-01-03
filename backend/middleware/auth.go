package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"topicnest-backend/db"
	"topicnest-backend/models"
)

type contextKey string

const UserContextKey contextKey = "user"

// GetUserFromContext retrieves the user from the request context
func GetUserFromContext(r *http.Request) *models.User {
	user, ok := r.Context().Value(UserContextKey).(*models.User)
	if !ok {
		return nil
	}
	return user
}

// AuthMiddleware checks for valid session token and attaches user to context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header or cookie
		token := ""
		
		// Check Authorization header first
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}
		
		// Fall back to cookie
		if token == "" {
			cookie, err := r.Cookie("session_token")
			if err == nil {
				token = cookie.Value
			}
		}

		// If no token, continue without user (some endpoints allow unauthenticated access)
		if token == "" {
			next.ServeHTTP(w, r)
			return
		}

		// Look up session
		var userID int
		var expiresAt time.Time
		err := db.DB.QueryRow(`
			SELECT user_id, expires_at FROM sessions WHERE token = $1
		`, token).Scan(&userID, &expiresAt)

		if err != nil {
			// Invalid token, continue without user
			next.ServeHTTP(w, r)
			return
		}

		// Check if session expired
		if time.Now().After(expiresAt) {
			// Delete expired session
			db.DB.Exec("DELETE FROM sessions WHERE token = $1", token)
			next.ServeHTTP(w, r)
			return
		}

		// Get user
		var user models.User
		err = db.DB.QueryRow(`
			SELECT id, username, karma, created_at FROM users WHERE id = $1
		`, userID).Scan(&user.ID, &user.Username, &user.Karma, &user.CreatedAt)

		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), UserContextKey, &user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireAuth is a middleware that requires authentication
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := GetUserFromContext(r)
		if user == nil {
			http.Error(w, `{"success":false,"error":"Authentication required"}`, http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}
