package main

import (
	"log"
	"net/http"
	"os"

	"topicnest-backend/db"
	"topicnest-backend/handlers"
	"topicnest-backend/middleware"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// Initialize database
	if err := db.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Create router
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api").Subrouter()

	// Apply auth middleware to all routes
	api.Use(middleware.AuthMiddleware)

	// ============ AUTH ROUTES ============
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/logout", handlers.Logout).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/me", handlers.GetMe).Methods("GET", "OPTIONS")

	// ============ USER ROUTES ============
	api.HandleFunc("/users", handlers.GetOrCreateUser).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/{id}", handlers.GetUserByID).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}", handlers.UpdateUser).Methods("PUT", "OPTIONS")
	api.HandleFunc("/users/username/{username}", handlers.GetUserByUsername).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/stats", handlers.GetUserWithStats).Methods("GET", "OPTIONS")
	api.HandleFunc("/users/{id}/posts", handlers.GetPostsByUser).Methods("GET", "OPTIONS")

	// ============ CATEGORY ROUTES ============
	api.HandleFunc("/categories", handlers.GetCategories).Methods("GET", "OPTIONS")
	api.HandleFunc("/categories/{id}", handlers.GetCategoryByID).Methods("GET", "OPTIONS")
	api.HandleFunc("/categories/slug/{slug}", handlers.GetCategoryBySlug).Methods("GET", "OPTIONS")

	// ============ POST ROUTES ============
	api.HandleFunc("/posts", handlers.GetPosts).Methods("GET", "OPTIONS")
	api.HandleFunc("/posts", handlers.CreatePost).Methods("POST", "OPTIONS")
	api.HandleFunc("/posts/search", handlers.SearchPosts).Methods("GET", "OPTIONS")
	api.HandleFunc("/posts/category/{slug}", handlers.GetPostsByCategory).Methods("GET", "OPTIONS")
	api.HandleFunc("/posts/{id}", handlers.GetPost).Methods("GET", "OPTIONS")
	api.HandleFunc("/posts/{id}", handlers.UpdatePost).Methods("PUT", "OPTIONS")
	api.HandleFunc("/posts/{id}", handlers.DeletePost).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/posts/{id}/upvote", handlers.UpvotePost).Methods("POST", "OPTIONS")

	// ============ COMMENT ROUTES ============
	api.HandleFunc("/posts/{postId}/comments", handlers.GetCommentsByPost).Methods("GET", "OPTIONS")
	api.HandleFunc("/posts/{postId}/comments", handlers.CreateComment).Methods("POST", "OPTIONS")
	api.HandleFunc("/comments/{id}", handlers.UpdateComment).Methods("PUT", "OPTIONS")
	api.HandleFunc("/comments/{id}", handlers.DeleteComment).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/comments/{id}/upvote", handlers.UpvoteComment).Methods("POST", "OPTIONS")

	// ============ BOOKMARK ROUTES ============
	api.HandleFunc("/users/{userId}/bookmarks", handlers.GetBookmarksByUser).Methods("GET", "OPTIONS")
	api.HandleFunc("/bookmarks", handlers.AddBookmark).Methods("POST", "OPTIONS")
	api.HandleFunc("/bookmarks", handlers.RemoveBookmark).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/bookmarks/check", handlers.IsPostBookmarked).Methods("GET", "OPTIONS")

	// Setup CORS - allow all origins
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: false,
	})

	handler := c.Handler(r)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("============================================")
	log.Println("TopicNest Go API Server")
	log.Println("============================================")
	log.Printf("Server starting on port %s\n", port)
	log.Println("============================================")
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
