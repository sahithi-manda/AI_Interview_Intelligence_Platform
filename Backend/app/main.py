import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine
from app.api.auth import router as auth_router
from app.api.resume import router as resume_router
from app.api.jd import router as jd_router
from app.api.matching import router as matching_router
from app.api.interview import router as interview_router
from app.api.answer import router as answer_router
from app.api.followup import router as followup_router
from app.api.skill_analysis import router as skill_analysis_router
from app.api.report import router as report_router
from app.api.improvement import router as improvement_router
from app.api.interview_session import router as interview_session_router


from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database tables exist
    try:
        from app.database.database import Base, engine
        from app.models.user import User  # noqa: F401
        from app.models.resume import Resume  # noqa: F401
        from app.models.job_description import JobDescription  # noqa: F401
        from app.models.match_result import MatchResult  # noqa: F401
        from app.models.interview_session import InterviewSession  # noqa: F401
        from app.models.interview_question import InterviewQuestion  # noqa: F401
        from app.models.interview_answer import InterviewAnswer  # noqa: F401
        from app.models.skill_analysis import SkillAnalysisModel  # noqa: F401
        from app.models.interview_report import InterviewReportModel  # noqa: F401
        from app.models.improvement_plan import ImprovementPlanModel  # noqa: F401

        Base.metadata.create_all(bind=engine)
        print("[INFO] Database tables verified/created successfully.")
    except Exception as e:
        print(f"[WARN] Error during database table auto-creation: {e}")
    yield


app = FastAPI(
    title="AI Interview Intelligence API",
    description="AI-powered adaptive interview backend",
    version="1.0.0",
    lifespan=lifespan
)


# -----------------------------
# CORS CONFIGURATION
# -----------------------------

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080"
]

frontend_env = os.getenv("FRONTEND_URL")
if frontend_env:
    for url in frontend_env.split(","):
        trimmed = url.strip()
        if trimmed and trimmed not in allowed_origins:
            allowed_origins.append(trimmed)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# API ROUTES
# -----------------------------

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(jd_router)
app.include_router(matching_router)

app.include_router(interview_router)
app.include_router(answer_router)
app.include_router(followup_router)
app.include_router(skill_analysis_router)
app.include_router(report_router)
app.include_router(improvement_router)

app.include_router(interview_session_router)


# -----------------------------
# ROOT
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "AI Interview Intelligence API is running!",
        "status": "success"
    }


# -----------------------------
# HEALTH CHECK
# -----------------------------

@app.get("/health")
def health_check():
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status
    }