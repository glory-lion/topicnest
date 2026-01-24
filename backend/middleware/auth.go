package middleware

import (
	"context"
	"net/http"
	"strings"

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
// For simplicity, we use the user ID directly as the token
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		token := ""

		// Check Authorization header first
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// If no token, continue without user (some endpoints allow unauthenticated access)
		if token == "" {
			next.ServeHTTP(w, r)
			return
		}

		// For simplicity, the token IS the user ID
		// In production, you'd want proper JWT or session tokens
		var user models.User
		err := db.DB.QueryRow(`
			SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = $1
		`, token).Scan(&user.ID, &user.Username, &user.Bio, &user.AvatarURL, &user.CreatedAt)

		if err != nil {
			// Invalid token, continue without user
			next.ServeHTTP(w, r)
			return
		}

		// Add user and user_id to context
		ctx := context.WithValue(r.Context(), UserContextKey, &user)
		ctx = context.WithValue(ctx, "user_id", user.ID)
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
