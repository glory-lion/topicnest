# TopicNest 🦅

TopicNest is a modern, high-performance community forum application which features a sleek, responsive interface for real time discussions, user profiles, and category based post management.

## 🚀 Technlogy Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS (for modern UI components)
- **Backend**: Go (Golang) 1.24, Gorilla Mux
- **Database**: PostgreSQL (Supabase)
- **Driver**: pgx (PostgreSQL Driver and Toolkit)

---

## 🛠️ Project Structure
- `/src`: Frontend React components and Next.js pages.
- `/backend`: Go API server handling business logic and database interactions.
- `supabase-schema.sql`: Database schema definition for PostgreSQL.

---

## 🏃 Setup Instructions

Follow these steps to get TopicNest running locally.

### 1. Prerequisites
- **Node.js** (v20 or higher)
- **Go** (v1.24 or higher)
- A **PostgreSQL** database (Supabase is recommended for easy setup)

### 2. Database Setup
1. Create a new PostgreSQL database (e.g., on [Supabase](https://supabase.com)).
2. Execute the contents of `supabase-schema.sql` (found in the root directory) in your SQL editor to create the necessary tables and initial data.
3. **Important (Supabase Users)**: If you encounter permission errors (403 or 401), run the scripts in `fix-rls-policies.sql` to ensure the application has the necessary permissions to read/write data.

### 3. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set the `DATABASE_URL` environment variable. Ensure it includes the `default_query_exec_mode=simple_protocol` parameter for compatibility with connection poolers (like Supavisor):
   ```bash
   export DATABASE_URL="postgres://postgres.[USER]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&default_query_exec_mode=simple_protocol"
   ```
3. Run the backend server:
   ```bash
   go run .
   ```
   The API will be available at `http://localhost:8080/api`.

> ⚠️ **Note on Security**: Never commit your actual database password to GitHub. This project uses environment variables (`DATABASE_URL`) to handle sensitive credentials securely.


### 4. Frontend Configuration
1. Open a new terminal in the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env.local` file if you want to change the API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features for Grading
- **User Authentication**: Simple username-based login.
- **Dynamic Feed**: Real-time listing of posts with pagination (by category or user).
- **Advanced Search**: Search for posts, topics (categories), or people using the centralized search bar.
- **Profile Management**: Customizable user bios and avatars.
- **Engagement**: Create posts, leave comments, and upvote content.
- **Responsive Design**: Fully optimized for both desktop and mobile viewing.

---

## 🤖 AI Usage Declaration
In accordance with the CVWO assignment guidelines, I have documented the use of AI tools in this project below.

**Tools Used**: Antigravity (AI Coding Assistant)

**Purposes of Usage**:
- **Research & Comparison**: I used AI to research the technical differences between various PostgreSQL drivers (like `lib/pq` vs `pgx`) and to understand how Supabase's connection pooling (Supavisor) affects Go applications.
- **Learning & Concepts**: I used AI as a tutor to better understand Go's interface system and to learn the best practices for handling asynchronous data fetching in React 19.
- **Code Review**: I used AI to review the code I wrote for the authentication and post-management components to check for potential security vulnerabilities or performance bottlenecks.
- **Debugging Guidance**: When encountering complex database connection errors, I used AI to help interpret the error logs. This research allowed me to manually implement the required `simple_protocol` configuration and driver migration to fix the issues.

In summary, AI was used as a tutor to learn and as a substitution for traditional search engines, ensuring that I remained the primary author and decision-maker for all code implementation.


---

**Developed by**: Glory Charity Lion