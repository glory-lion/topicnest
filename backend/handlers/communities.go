package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"topicnest-backend/db"
	"topicnest-backend/models"
)

// GetCommunities returns all communities
func GetCommunities(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.DB.Query(`
		SELECT id, name, display_name, description, members, created_at 
		FROM communities 
		ORDER BY members DESC
	`)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Database error"})
		return
	}
	defer rows.Close()

	var communities []models.Community
	for rows.Next() {
		var c models.Community
		err := rows.Scan(&c.ID, &c.Name, &c.DisplayName, &c.Description, &c.Members, &c.CreatedAt)
		if err != nil {
			continue
		}
		communities = append(communities, c)
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: communities})
}

// GetCommunity returns a single community by name
func GetCommunity(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	name := vars["name"]

	var c models.Community
	err := db.DB.QueryRow(`
		SELECT id, name, display_name, description, members, created_at 
		FROM communities WHERE name = $1
	`, name).Scan(&c.ID, &c.Name, &c.DisplayName, &c.Description, &c.Members, &c.CreatedAt)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.APIResponse{Success: false, Error: "Community not found"})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{Success: true, Data: c})
}
