# TopicNest 🦅

TopicNest is a modern, high performance community forum which features a sleek, responsive interface for real time discussions, user profiles, and category based post management.

## ✨ Features

### Community & Content
- **Topic-Based Discussions** - Users can create posts within specific topics.
- **Create Custom Topics** - Users can create new discussion topics with custom names, descriptions, and icons.
- **Rich Media** - Users can upload photos to posts and set profile pictures.
- **Interactive Comments** - Each post has a dedicated comment section for discussions.


### User Interaction
- **Engagement** - Users can like both posts and comments.
- **Content Control** - Full edit and delete capabilities for user's own posts and comments.
- **Bookmarks** - Users can bookmark posts and comments for easy access later.
- **Search** - Integrated search bar to find relevant content.

### Profile Manager
- **Activity Dashboard** - View total count of posts, comments, and interactions.
- **Content History** - Access a complete history of posted contents and bookmarked items.

---

## 🚀 Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS (for modern UI components)
- **Backend**: Go (Golang) 1.24, Gorilla Mux
- **Database**: PostgreSQL (Supabase)
- **Driver**: pgx (PostgreSQL Driver and Toolkit)

---

## 🛠️ Project Structure

```
topicnest/
├── backend/
│   ├── handlers/    # Business logic & request handlers
│   ├── middleware/  # HTTP middleware (CORS, logging)
│   ├── models/      # Data definitions and structs
│   ├── db/          # Database connection
│   └── main.go      # Backend server entry point
├── src/
│   ├── app/
│   │   ├── create/      # Post creation page
│   │   ├── forum/       # Forum listing views
│   │   ├── profile/     # User profile management
│   │   ├── search/      # Search functionality
│   │   ├── topic/       # Topic-based post filtering
│   │   ├── layout.tsx   # Root application layout
│   │   └── page.tsx     # Landing page
│   ├── components/  # Shared components (Header, Modals)
│   └── lib/         # API clients and utilities
├── supabase-schema.sql  # Database structure
└── README.md
```

---

## ⚡️ Installation

1. Clone the repository:

```bash
git clone https://github.com/glory-lion/topicnest.git
cd topicnest
```

2. Database Setup:

- Create a project on [Supabase](https://supabase.com).
- Copy the contents of `supabase-schema.sql` and run them in the Supabase SQL Editor.

3. Backend Configuration:

```bash
cd backend
cp .env.example .env
# Update DATABASE_URL in .env with your Supabase connection string
go run .
```

4. Frontend Configuration:

```bash
# Open a new terminal in the project root
npm install
npm run dev
```

5. Access the App:

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🤖 AI Usage Declaration
In accordance with the CVWO assignment guidelines, I have documented the use of AI tools in this project below.

**Purposes of Usage**:
- **Research & Comparison**: I used AI to research the technical differences between various PostgreSQL drivers (like `lib/pq` vs `pgx`) and to understand how Supabase's connection pooling (Supavisor) affects Go applications.
- **Learning & Concepts**: I used AI as a tutor to better understand Go's interface system and to learn the best practices for handling asynchronous data fetching in React 19.
- **Code Review**: I used AI to review the code I wrote for the authentication and post-management components to check for potential security vulnerabilities or performance bottlenecks.
- **Debugging Guidance**: When encountering complex database connection errors, I used AI to help interpret the error logs. This research allowed me to manually implement the required `simple_protocol` configuration and driver migration to fix the issues.

In summary, AI was used as a tutor to learn and as a substitution for traditional search engines, ensuring that I remained the primary author and decision-maker for all code implementation.


---

**Developed by**: Glory Charity Lion