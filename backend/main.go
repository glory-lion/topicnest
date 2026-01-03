package main

import (
	"log"
	"net/http"

	"topicnest-backend/db"
	"topicnest-backend/handlers"
	"topicnest-backend/middleware"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
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

	// Auth routes
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST")
	api.HandleFunc("/auth/logout", handlers.Logout).Methods("POST")
	api.HandleFunc("/auth/me", handlers.GetMe).Methods("GET")

	// Community routes
	api.HandleFunc("/communities", handlers.GetCommunities).Methods("GET")
	api.HandleFunc("/communities/{name}", handlers.GetCommunity).Methods("GET")

	// Post routes
	api.HandleFunc("/posts", handlers.GetPosts).Methods("GET")
	api.HandleFunc("/posts", middleware.RequireAuth(handlers.CreatePost)).Methods("POST")
	api.HandleFunc("/posts/{id}", handlers.GetPost).Methods("GET")
	api.HandleFunc("/posts/{id}", middleware.RequireAuth(handlers.UpdatePost)).Methods("PUT")
	api.HandleFunc("/posts/{id}", middleware.RequireAuth(handlers.DeletePost)).Methods("DELETE")
	api.HandleFunc("/posts/{id}/vote", middleware.RequireAuth(handlers.VotePost)).Methods("POST")
	api.HandleFunc("/posts/{id}/comments", handlers.GetComments).Methods("GET")
	api.HandleFunc("/posts/{id}/comments", middleware.RequireAuth(handlers.CreateComment)).Methods("POST")

	// Comment routes
	api.HandleFunc("/comments/{id}/vote", middleware.RequireAuth(handlers.VoteComment)).Methods("POST")
	api.HandleFunc("/comments/{id}", middleware.RequireAuth(handlers.UpdateComment)).Methods("PUT")
	api.HandleFunc("/comments/{id}", middleware.RequireAuth(handlers.DeleteComment)).Methods("DELETE")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	// Start server
	log.Println("TopicNest API server starting on http://localhost:8080")
	log.Println("Frontend should connect to: http://localhost:8080/api")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
