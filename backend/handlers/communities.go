package handlers

import (
	"net/http"

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
