# AI Interview Intelligence Platform

> An end-to-end, AI-powered mock interview and career intelligence system that parses candidate resumes, analyzes job descriptions, performs semantic skill matching, dynamically generates tailored interview questions, and provides real-time scoring and personalized preparation roadmaps.

[![Frontend Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-interview-intelligence-platform-mocha.vercel.app/)
[![Backend Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://ai-interview-intelligence-platform-sqgy.onrender.com/)
[![Database on Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![AI Model](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

## 🌐 Live Deployments

- **Frontend Application**: [https://ai-interview-intelligence-platform-mocha.vercel.app/](https://ai-interview-intelligence-platform-mocha.vercel.app/)
- **Backend API Documentation**: [https://ai-interview-intelligence-platform-sqgy.onrender.com/docs](https://ai-interview-intelligence-platform-sqgy.onrender.com/docs)
- **API Health Check**: [https://ai-interview-intelligence-platform-sqgy.onrender.com/health](https://ai-interview-intelligence-platform-sqgy.onrender.com/health)

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started Locally](#-getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Security & Production Configuration](#-security--production-configuration)

---

## 🚀 Key Features

- **Resume Parsing & Extraction**: Instant extraction of structured candidate profiles from PDF and DOCX files.
- **Job Description Analysis**: Automated breakdown of technical requirements, required skills, and seniority levels.
- **Intelligent Candidate-Job Matching**: Semantic matching engine evaluating match percentage, strengths, and missing skills.
- **Adaptive Question Generator**: Dynamically crafts personalized technical, behavioral, and scenario-based questions powered by Google Gemini.
- **Interactive Interview Simulation**: Conducts live mock interviews with timer controls and speech-to-text / manual typing support.
- **Deep Answer Evaluation**: Rigorous AI scoring across technical accuracy, clarity, completeness, strengths, and weaknesses.
- **Feedback & Learning Roadmap**: Comprehensive performance reports with actionable learning roadmaps to bridge identified skill gaps.

---

## 🏗 System Architecture

```
                               +-----------------------------+
                               |     Vercel (Free Tier)      |
                               |    React 19 + Vite 8 SPA    |
                               +--------------+--------------+
                                              |
                        HTTPS REST Requests   | (Bearer JWT)
                                              v
                               +-----------------------------+
                               |    Render (Free Web Svc)    |
                               |   FastAPI + Uvicorn ASGI    |
                               +------+---------------+------+
                                      |               |
                         SQLAlchemy / |               | Google GenAI SDK
                         PostgreSQL   |               |
                                      v               v
                     +--------------------+   +---------------------+
                     | Supabase (Free DB) |   |  Google AI Studio   |
                     |   PostgreSQL 15+   |   | Gemini Flash Models |
                     +--------------------+   +---------------------+
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19, Vite 8, TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router 7 (SPA with client-side rewrites)
- **State & Data Fetching**: TanStack React Query v5, Axios
- **Charts & Visualization**: Recharts

### Backend
- **Framework**: FastAPI, Uvicorn (ASGI)
- **Authentication**: Stateless JWT (`python-jose`), Passlib with `bcrypt`
- **ORM & Database**: SQLAlchemy 2, Alembic, `psycopg2-binary`
- **Validation**: Pydantic v2, Pydantic-Settings, Email-Validator
- **Document Processing**: PyPDF2, python-docx
- **Machine Learning**: Scikit-Learn, NumPy, Pandas

### Cloud Infrastructure (100% Free Tiers)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render (Web Service)
- **Database**: Supabase (Cloud PostgreSQL)
- **AI Intelligence**: Google Gemini API via Google AI Studio

---

## 🗄 Database Schema

The platform utilizes 10 relational tables managed via SQLAlchemy ORM:

1. `users` — Authentication credentials, user profiles, and timestamps.
2. `resumes` — Uploaded documents, extracted raw text, and structured AI profiles.
3. `job_descriptions` — Stored target roles, parsed skill requirements, and metadata.
4. `match_results` — Alignment score, skill overlap, and gap analysis.
5. `interview_sessions` — Interview configuration, type, state, and status tracking.
6. `interview_questions` — Questions curated specifically for candidate/role pairing.
7. `interview_answers` — User responses, timers, and transcriptions.
8. `skill_analyses` — Granular breakdown of candidate competencies.
9. `interview_reports` — Consolidated candidate evaluation reports and final scores.
10. `improvement_plans` — AI-generated learning roadmaps and study suggestions.

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.11 recommended)
- **Git**
- A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/sahithi-manda/AI_Interview_Intelligence_Platform.git
cd AI_Interview_Intelligence_Platform/Backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Configure your `Backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=your_secure_random_jwt_secret
```

Initialize tables and run the server:
```bash
python create_tables.py
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

```bash
# In a new terminal window
cd AI_Interview_Intelligence_Platform/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Ensure `frontend/.env` points to your backend:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend (`Backend/.env` / Render Dashboard)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require` |
| `GEMINI_API_KEY` | Google AI Studio API key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini Flash model name | `gemini-2.5-flash-lite` |
| `JWT_SECRET_KEY` | Secret key for JWT token signing | `your-super-secret-jwt-key` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `https://ai-interview-intelligence-platform-mocha.vercel.app` |

### Frontend (`frontend/.env` / Vercel Dashboard)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of deployed FastAPI backend | `https://ai-interview-intelligence-platform-sqgy.onrender.com` |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/` | API status and root greeting | No |
| `GET` | `/health` | Health and database connectivity status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT access token | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |
| `POST` | `/api/resumes/upload` | Upload resume file (PDF / DOCX) | Yes |
| `POST` | `/api/resumes/{id}/analyze` | Trigger AI profile extraction | Yes |
| `POST` | `/api/jd/analyze` | Parse and structure Job Description | Yes |
| `POST` | `/api/matching/analyze` | Match resume profile against JD | Yes |
| `POST` | `/api/interview/session` | Create new interview session | Yes |
| `POST` | `/api/interview/generate` | Generate adaptive question set | Yes |
| `POST` | `/api/interview/evaluate` | Submit answer for AI scoring & feedback | Yes |
| `POST` | `/api/report/generate` | Generate comprehensive session report | Yes |
| `POST` | `/api/improvement/generate` | Generate personalized learning roadmap | Yes |

---

## 🛡 Security & Production Configuration

- **Zero Secrets in Source Control**: All API keys, passwords, and tokens are strictly excluded via `.gitignore`.
- **Database Connection Pooling**: Built with `pool_pre_ping=True` and connection pooler routing for Supabase stability.
- **CORS Protection**: Restricted to authorized production domains (`*.vercel.app`) and configured local development environments.
- **Client-Side Routing**: SPA rewrites configured in `vercel.json` to prevent 404s on browser reloads.
