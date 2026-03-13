# Masternow Productivity Platform

Masternow is a Notion-inspired productivity platform designed to help users plan their courses using YouTube tutorials, track daily tasks, and manage their learning journey all in one place.

## Tech Stack Overview
- **Frontend**: React, Vite, Tailwind CSS, React Router, React Beautiful DnD
- **Backend**: Node.js, Express, Prisma (PostgreSQL), Passport.js (Google OAuth 2.0)
- **Database**: Neon Serverless Postgres
- **Authentication**: JWT & Google OAuth 2.0 (Google Cloud Console)

## Features Completed So Far

### 1. UI & Theming
- Built a deeply customized, Notion-inspired design system with both Light and Dark modes.
- Ensured absolute code quality modularity and professional styling (no emojis, simple modern typography).
- Created a dynamic interactive Sidebar with profile insights and live dates.
- Refined Dashboard layout to include course statistics and YouTube video thumbnail previews with embedded notes snippets.

### 2. Interactive Kanban To-Do List
- Implemented a fully functional Drag-and-Drop state-managed Kanban board.
- Features columns for: *To Do*, *In Progress*, and *Completed*.
- Features task line clamping for neat descriptions, and quick task deletion.

### 3. Backend & Database Architecture
- Set up an Express backend running on Port `5001`.
- Designed robust Prisma schemas for `User`, `Course`, `LectureItem`, and `Task`.
- Seamlessly configured Prisma Client V6 to connect to the Neon PostgreSQL cloud database.

### 4. Authentication Flow
- Implemented Google OAuth 2.0 using the `passport-google-oauth20` strategy.
- Set up `jsonwebtoken` for secure backend API validation.
- Created fully operational frontend routing to catch and store the JWT upon Google callback, allowing the user to view personalized dashboards without exposing credentials.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- A Neon Postgres Database
- Google Cloud Console API credentials (with `http://localhost:5174` as origin and `http://localhost:5001/auth/google/callback` as a Redirect URI).

### Installation

**1. Clone the repository**

**2. Backend Setup:**
Navigate to the `/backend` folder:
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
DATABASE_URL="your-neon-postgres-url"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
JWT_SECRET="your-secure-secret"
```
Generate Prisma & Start up the server:
```bash
npx prisma generate
npm run dev
```

**3. Frontend Setup:**
Navigate to the `/frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

Your frontend should now spin up at `http://localhost:5174` and interact smoothly with the backend at `http://localhost:5001`.

## Next Steps Planned 
- Implementing full CRUD APIs for the Task Kanban Board.
- Integrating YouTube Data API logic to fetch and schedule playlists locally on the platform.
- Integrating Google Drive API to export and save course notes.
# masternow-productivity-testing
