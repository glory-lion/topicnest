package db

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// Initialize connects to the database and runs the schema
func Initialize() error {
	// Get database connection string from environment or use default
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "host=localhost dbname=topicnest sslmode=disable"
	}

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test the connection
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Connected to PostgreSQL database")

	// Run schema
	if err = runSchema(); err != nil {
		return fmt.Errorf("failed to run schema: %w", err)
	}

	return nil
}

func runSchema() error {
	// Get the directory of the current file
	execPath, err := os.Executable()
	if err != nil {
		// Fallback to current directory
		execPath = "."
	}
	
	// Try multiple possible schema locations
	possiblePaths := []string{
		filepath.Join(filepath.Dir(execPath), "db", "schema.sql"),
		filepath.Join(".", "db", "schema.sql"),
		filepath.Join("..", "db", "schema.sql"),
	}

	var schemaPath string
	var schemaSQL []byte

	for _, path := range possiblePaths {
		schemaSQL, err = ioutil.ReadFile(path)
		if err == nil {
			schemaPath = path
			break
		}
	}

	if schemaPath == "" {
		log.Println("Warning: schema.sql not found, skipping schema initialization")
		return nil
	}

	log.Printf("Running schema from: %s\n", schemaPath)
	
	_, err = DB.Exec(string(schemaSQL))
	if err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
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
