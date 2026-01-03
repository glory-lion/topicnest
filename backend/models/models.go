package models

import "time"

// User represents a forum user
type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Karma     int       `json:"karma"`
	CreatedAt time.Time `json:"createdAt"`
}

// Session represents a user session
type Session struct {
	ID        int       `json:"id"`
	UserID    int       `json:"userId"`
	Token     string    `json:"token"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
}

// Community represents a forum community/topic
type Community struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	DisplayName string    `json:"displayName"`
	Description string    `json:"description"`
	Members     int       `json:"members"`
	CreatedAt   time.Time `json:"createdAt"`
}

// Post represents a forum post
type Post struct {
	ID           int        `json:"id"`
	Title        string     `json:"title"`
	Content      string     `json:"content,omitempty"`
	ImageURL     string     `json:"imageUrl,omitempty"`
	Author       *User      `json:"author"`
	Community    *Community `json:"community"`
	AuthorID     int        `json:"-"`
	CommunityID  int        `json:"-"`
	Upvotes      int        `json:"upvotes"`
	Downvotes    int        `json:"downvotes"`
	CommentCount int        `json:"commentCount"`
	IsOC         bool       `json:"isOC"`
	UserVote     *string    `json:"userVote"`
	CreatedAt    time.Time  `json:"createdAt"`
}

// Comment represents a comment on a post
type Comment struct {
	ID        int        `json:"id"`
	Content   string     `json:"content"`
	Author    *User      `json:"author"`
	PostID    int        `json:"postId"`
	ParentID  *int       `json:"parentId,omitempty"`
	Upvotes   int        `json:"upvotes"`
	Downvotes int        `json:"downvotes"`
	Replies   []*Comment `json:"replies,omitempty"`
	UserVote  *string    `json:"userVote"`
	CreatedAt time.Time  `json:"createdAt"`
}

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
	Title       string `json:"title"`
	Content     string `json:"content"`
	CommunityID int    `json:"communityId"`
	IsOC        bool   `json:"isOC"`
}

// CreateCommentRequest represents a request to create a comment
type CreateCommentRequest struct {
	Content  string `json:"content"`
	ParentID *int   `json:"parentId,omitempty"`
}

// VoteRequest represents a vote request
type VoteRequest struct {
	VoteType string `json:"voteType"` // "up", "down", or "none"
}

// UpdatePostRequest represents a request to update a post
type UpdatePostRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

// UpdateCommentRequest represents a request to update a comment
type UpdateCommentRequest struct {
	Content string `json:"content"`
}

// APIResponse is a generic API response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
