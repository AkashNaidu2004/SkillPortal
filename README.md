# SkillPortal – Skill Assessment & SHL Practice Platform

A production-ready full-stack web application for SHL-style assessments with real-time proctoring, analytics, and admin management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS v4 |
| Backend | Node.js, Express.js (MVC architecture) |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| UI/UX | Framer Motion, Recharts, Monaco Editor, react-hot-toast |

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running on `localhost:27017`

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed    # Seeds demo data (categories, tests, questions, users)
npm run dev     # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:3000
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@skillportal.com | student123 |
| Admin | admin@skillportal.com | admin123 |

## Project Structure

```
SkillPortal/
├── backend/
│   ├── controllers/     # Auth, Category, Test, Question, Result
│   ├── middleware/       # JWT auth, admin role check
│   ├── models/           # Mongoose schemas (User, Category, Test, Question, Result)
│   ├── routes/           # Express route files
│   ├── seed.js           # Database seeder
│   └── server.js         # Entry point
├── frontend/
│   ├── app/
│   │   ├── login/        # Login page
│   │   ├── register/     # Register page
│   │   ├── dashboard/    # Student dashboard
│   │   ├── tests/        # Test listing by category
│   │   ├── test/         # Test engine (MCQ + coding)
│   │   ├── result/       # Result summary
│   │   ├── analytics/    # Performance analytics (Recharts)
│   │   └── admin/        # Admin panel (categories, tests, questions)
│   ├── components/       # Header, UI primitives
│   ├── context/          # AuthContext
│   └── lib/              # API utility
```

## Features

- **Authentication**: JWT-based login/register with role-based routing
- **Student Dashboard**: Category grid, stats cards, recent activity feed
- **Test Engine**: Timer, question navigation, MCQ selection, Monaco code editor
- **Proctoring**: Tab switch + window blur + fullscreen detection (3 warnings → auto-submit)
- **Results**: Score breakdown, accuracy bar, answer review
- **Analytics**: Bar chart, line chart, radar chart, strengths/weaknesses
- **Admin Panel**: Full CRUD for categories, tests, and questions (MCQ + coding)
