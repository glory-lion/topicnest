package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var DB *sql.DB

// Initialize connects to the Supabase PostgreSQL database
func Initialize() error {
	// Get database connection string from environment
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		// Try to use a local PostgreSQL database as fallback
		log.Println("WARNING: DATABASE_URL not set. Attempting to use local PostgreSQL...")
		connStr = "host=localhost dbname=topicnest sslmode=disable"
	}

	var err error
	// Use 'pgx' driver with simple_protocol to disable prepared statements.
	// This is required for compatibility with PGBouncer/Supavisor in transaction mode.
	fullConnStr := connStr
	if !strings.Contains(fullConnStr, "?") {
		fullConnStr += "?default_query_exec_mode=simple_protocol"
	} else if !strings.Contains(fullConnStr, "default_query_exec_mode") {
		fullConnStr += "&default_query_exec_mode=simple_protocol"
	}

	DB, err = sql.Open("pgx", fullConnStr)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)

	// Test the connection
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w\n\nMake sure your DATABASE_URL is correct and your Supabase project is accessible", err)
	}

	log.Println("✅ Connected to PostgreSQL database")

	// Skip schema initialization since tables already exist in Supabase
	// The existing Supabase schema is used directly
	log.Println("Using existing Supabase database schema")

	return nil
}

// initSchema creates the necessary tables if they don't exist
func initSchema() error {
	schema := `
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
		username VARCHAR(50) UNIQUE NOT NULL,
		bio TEXT,
		avatar_url TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);

	-- Categories table
	CREATE TABLE IF NOT EXISTS categories (
		id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		slug VARCHAR(100) UNIQUE NOT NULL,
		description TEXT,
		icon VARCHAR(20),
		gradient VARCHAR(100),
		glow_color VARCHAR(50),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);

	-- Posts table
	CREATE TABLE IF NOT EXISTS posts (
		id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
		title VARCHAR(300) NOT NULL,
		content TEXT NOT NULL,
		image_url TEXT,
		category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		upvotes INTEGER DEFAULT 0,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE
	);

	-- Comments table
	CREATE TABLE IF NOT EXISTS comments (
		id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
		post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		content TEXT NOT NULL,
		upvotes INTEGER DEFAULT 0,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE
	);

	-- Bookmarks table
	CREATE TABLE IF NOT EXISTS bookmarks (
		id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		UNIQUE(user_id, post_id)
	);

	-- Insert default categories if they don't exist
	INSERT INTO categories (name, slug, description, icon, gradient, glow_color) VALUES
		('Technology', 'technology', 'Discuss the latest in tech, gadgets, and innovation', '💻', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'rgba(102, 126, 234, 0.5)'),
		('Gaming', 'gaming', 'Connect with fellow gamers and discuss your favorite games', '🎮', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'rgba(240, 147, 251, 0.5)'),
		('Art & Design', 'art-design', 'Share and appreciate creative works and design inspiration', '🎨', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'rgba(79, 172, 254, 0.5)'),
		('Music', 'music', 'Discover new music and discuss your favorite artists', '🎵', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'rgba(67, 233, 123, 0.5)'),
		('Movies & TV', 'movies-tv', 'Reviews, recommendations, and discussions about entertainment', '🎬', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 'rgba(250, 112, 154, 0.5)'),
		('Books', 'books', 'Book reviews, recommendations, and literary discussions', '📚', 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'rgba(161, 140, 209, 0.5)')
	ON CONFLICT (slug) DO NOTHING;
	`

	_, err := DB.Exec(schema)
	if err != nil {
		log.Printf("Schema initialization warning: %v", err)
		// Don't fail on schema errors - tables might already exist
	}

	log.Println("Database schema initialized")
	return nil
}

// Close closes the database connection
func Close() {
	if DB != nil {
		DB.Close()
	}
}
