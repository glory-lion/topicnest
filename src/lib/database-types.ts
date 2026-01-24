export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    username: string
                    bio: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    username: string
                    bio?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    bio?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    icon: string | null
                    gradient: string | null
                    glow_color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    icon?: string | null
                    gradient?: string | null
                    glow_color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    icon?: string | null
                    gradient?: string | null
                    glow_color?: string | null
                    created_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    title: string
                    content: string
                    image_url: string | null
                    category_id: string
                    user_id: string
                    upvotes: number
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    image_url?: string | null
                    category_id: string
                    user_id: string
                    upvotes?: number
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    image_url?: string | null
                    category_id?: string
                    user_id?: string
                    upvotes?: number
                    created_at?: string
                    updated_at?: string | null
                }
            }
            comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    content: string
                    upvotes: number
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    content: string
                    upvotes?: number
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    content?: string
                    upvotes?: number
                    created_at?: string
                    updated_at?: string | null
                }
            }
            bookmarks: {
                Row: {
                    id: string
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']

// Extended types with relations
export type PostWithRelations = Post & {
    users: User | null
    categories: Category | null
    comments?: { id: string }[]
}

export type CommentWithUser = Comment & {
    users: User | null
}

export type BookmarkWithPost = Bookmark & {
    posts: PostWithRelations | null
}

export type UserWithStats = User & {
    post_count?: number
    comment_count?: number
}

