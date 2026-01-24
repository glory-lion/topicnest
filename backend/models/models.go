package models

import "time"

// User represents a forum user
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Bio       *string   `json:"bio,omitempty"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// Category represents a forum category/topic
type Category struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description,omitempty"`
	Icon        *string   `json:"icon,omitempty"`
	Gradient    *string   `json:"gradient,omitempty"`
	GlowColor   *string   `json:"glow_color,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// Post represents a forum post
type Post struct {
	ID         string     `json:"id"`
	Title      string     `json:"title"`
	Content    string     `json:"content"`
	ImageURL   *string    `json:"image_url,omitempty"`
	CategoryID string     `json:"category_id"`
	UserID     string     `json:"user_id"`
	Upvotes    int        `json:"upvotes"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at,omitempty"`
	// Joined fields
	Author       *User     `json:"author,omitempty"`
	Category     *Category `json:"category,omitempty"`
	CommentCount int       `json:"comment_count,omitempty"`
	// Legacy fields for frontend compatibility
	Users      *User     `json:"users,omitempty"`
	Categories *Category `json:"categories,omitempty"`
}

// Comment represents a comment on a post
type Comment struct {
	ID        string     `json:"id"`
	PostID    string     `json:"post_id"`
	UserID    string     `json:"user_id"`
	Content   string     `json:"content"`
	Upvotes   int        `json:"upvotes"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
	// Joined fields
	Author *User `json:"author,omitempty"`
	// Legacy fields for frontend compatibility
	Users *User `json:"users,omitempty"`
}

// Bookmark represents a user's bookmarked post
type Bookmark struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	PostID    string    `json:"post_id"`
	CreatedAt time.Time `json:"created_at"`
	// Joined fields
	Post *Post `json:"post,omitempty"`
	// Legacy fields for frontend compatibility
	Posts *Post `json:"posts,omitempty"`
}

// ============ REQUEST/RESPONSE TYPES ============

// LoginRequest represents a login request body
type LoginRequest struct {
	Username string `json:"username"`
}

// LoginResponse represents a login response
type LoginResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

// CreatePostRequest represents a request to create a new post
type CreatePostRequest struct {
	Title      string  `json:"title"`
	Content    string  `json:"content"`
	CategoryID string  `json:"category_id"`
	ImageURL   *string `json:"image_url,omitempty"`
}

// UpdatePostRequest represents a request to update a post
type UpdatePostRequest struct {
	Title    string  `json:"title"`
	Content  string  `json:"content"`
	ImageURL *string `json:"image_url,omitempty"`
}

// CreateCommentRequest represents a request to create a comment
type CreateCommentRequest struct {
	Content string `json:"content"`
}

// UpdateCommentRequest represents a request to update a comment
type UpdateCommentRequest struct {
	Content string `json:"content"`
}

// UpdateUserRequest represents a request to update user profile
type UpdateUserRequest struct {
	Bio       *string `json:"bio,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
}

// APIResponse is a generic API response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// UserStats includes user with post and comment counts
type UserStats struct {
	User
	PostCount    int `json:"post_count"`
	CommentCount int `json:"comment_count"`
}
