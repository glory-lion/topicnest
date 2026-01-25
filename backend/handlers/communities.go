package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"topicnest-backend/db"
	"topicnest-backend/models"

	"github.com/gorilla/mux"
)

// GetCategories returns all categories
func GetCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`
		SELECT id, name, slug, description, icon, gradient, glow_color, created_at 
		FROM categories 
		ORDER BY name ASC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var cat models.Category
		err := rows.Scan(&cat.ID, &cat.Name, &cat.Slug, &cat.Description, &cat.Icon, &cat.Gradient, &cat.GlowColor, &cat.CreatedAt)
		if err != nil {
			continue
		}
		categories = append(categories, cat)
	}

	if categories == nil {
		categories = []models.Category{}
	}

	respondJSON(w, http.StatusOK, categories)
}

// GetCategoryByID returns a category by ID
func GetCategoryByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	categoryID := vars["id"]

	var cat models.Category
	err := db.DB.QueryRow(`
		SELECT id, name, slug, description, icon, gradient, glow_color, created_at 
		FROM categories 
		WHERE id = $1
	`, categoryID).Scan(&cat.ID, &cat.Name, &cat.Slug, &cat.Description, &cat.Icon, &cat.Gradient, &cat.GlowColor, &cat.CreatedAt)
	if err != nil {
		respondError(w, http.StatusNotFound, "Category not found")
		return
	}

	respondJSON(w, http.StatusOK, cat)
}

// GetCategoryBySlug returns a category by slug
func GetCategoryBySlug(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	slug := vars["slug"]

	var cat models.Category
	err := db.DB.QueryRow(`
		SELECT id, name, slug, description, icon, gradient, glow_color, created_at 
		FROM categories 
		WHERE slug = $1
	`, slug).Scan(&cat.ID, &cat.Name, &cat.Slug, &cat.Description, &cat.Icon, &cat.Gradient, &cat.GlowColor, &cat.CreatedAt)
	if err != nil {
		respondError(w, http.StatusNotFound, "Category not found")
		return
	}

	respondJSON(w, http.StatusOK, cat)
}

// Curated gradient collection for new categories
var gradientPalettes = []struct {
	Gradient  string
	GlowColor string
}{
	{"linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "rgba(102, 126, 234, 0.5)"},
	{"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "rgba(240, 147, 251, 0.5)"},
	{"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", "rgba(79, 172, 254, 0.5)"},
	{"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", "rgba(67, 233, 123, 0.5)"},
	{"linear-gradient(135deg, #fa709a 0%, #fee140 100%)", "rgba(250, 112, 154, 0.5)"},
	{"linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", "rgba(161, 140, 209, 0.5)"},
	{"linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", "rgba(252, 182, 159, 0.5)"},
	{"linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", "rgba(255, 154, 158, 0.5)"},
	{"linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", "rgba(161, 196, 253, 0.5)"},
	{"linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", "rgba(252, 182, 159, 0.5)"},
	{"linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)", "rgba(253, 219, 146, 0.5)"},
	{"linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)", "rgba(137, 247, 254, 0.5)"},
	{"linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", "rgba(224, 195, 252, 0.5)"},
	{"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "rgba(240, 147, 251, 0.5)"},
	{"linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)", "rgba(250, 208, 196, 0.5)"},
	{"linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)", "rgba(255, 234, 167, 0.5)"},
	{"linear-gradient(135deg, #74ebd5 0%, #acb6e5 100%)", "rgba(116, 235, 213, 0.5)"},
	{"linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)", "rgba(106, 17, 203, 0.5)"},
	{"linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)", "rgba(255, 107, 107, 0.5)"},
	{"linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)", "rgba(238, 156, 167, 0.5)"},
}

// CreateCategory creates a new category
func CreateCategory(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string  `json:"name"`
		Description *string `json:"description,omitempty"`
		Icon        *string `json:"icon,omitempty"`
		Gradient    *string `json:"gradient,omitempty"`
		GlowColor   *string `json:"glow_color,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "Category name is required")
		return
	}

	// Generate slug from name
	slug := strings.ToLower(req.Name)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "&", "and")

	// Set default icon if not provided
	defaultIcon := "📁"
	if req.Icon == nil {
		req.Icon = &defaultIcon
	}

	// Generate random gradient if not provided
	if req.Gradient == nil || req.GlowColor == nil {
		// Use slug hash for deterministic but distributed randomness
		// This ensures different categories get different gradients
		hash := 0
		for _, char := range slug {
			hash = (hash*31 + int(char)) % len(gradientPalettes)
		}
		// Add time-based offset for additional randomness
		timeOffset := int(time.Now().Unix()) % len(gradientPalettes)
		randomIndex := (hash + timeOffset) % len(gradientPalettes)
		randomPalette := gradientPalettes[randomIndex]

		if req.Gradient == nil {
			req.Gradient = &randomPalette.Gradient
		}
		if req.GlowColor == nil {
			req.GlowColor = &randomPalette.GlowColor
		}
	}

	// Insert new category
	var newCategory models.Category
	err := db.DB.QueryRow(`
		INSERT INTO categories (name, slug, description, icon, gradient, glow_color)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, name, slug, description, icon, gradient, glow_color, created_at
	`, req.Name, slug, req.Description, req.Icon, req.Gradient, req.GlowColor).Scan(
		&newCategory.ID, &newCategory.Name, &newCategory.Slug,
		&newCategory.Description, &newCategory.Icon, &newCategory.Gradient,
		&newCategory.GlowColor, &newCategory.CreatedAt,
	)
	if err != nil {
		// Check if it's a unique constraint violation
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			respondError(w, http.StatusConflict, "A category with this name already exists")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create category")
		return
	}

	respondJSON(w, http.StatusCreated, newCategory)
}

// DeleteCategory deletes a category
func DeleteCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		respondError(w, http.StatusBadRequest, "Category ID is required")
		return
	}

	// MANUAL CASCADE DELETION
	// We delete all related data manually to ensure deletion succeeds even if
	// database Foreign Key constraints are missing "ON DELETE CASCADE".

	// 1. Delete bookmarks related to posts in this category
	_, _ = db.DB.Exec("DELETE FROM bookmarks WHERE post_id IN (SELECT id FROM posts WHERE category_id = $1)", id)

	// 2. Delete comments related to posts in this category
	_, _ = db.DB.Exec("DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE category_id = $1)", id)

	// 3. Delete votes related to posts in this category
	_, _ = db.DB.Exec("DELETE FROM votes WHERE post_id IN (SELECT id FROM posts WHERE category_id = $1)", id)

	// 4. Delete posts in this category
	_, err := db.DB.Exec("DELETE FROM posts WHERE category_id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete associated posts: "+err.Error())
		return
	}

	// 5. Finally delete the category
	result, err := db.DB.Exec("DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete category: "+err.Error())
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to check deletion status")
		return
	}

	if rowsAffected == 0 {
		respondError(w, http.StatusNotFound, "Category not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Category deleted successfully"})
}
