import os
import time
import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.database import SessionLocal
from app.models.interview_session import InterviewSession
from app.models.interview_answer import InterviewAnswer
from app.models.skill_analysis import SkillAnalysisModel
from app.models.interview_report import InterviewReportModel
from app.models.improvement_plan import ImprovementPlanModel

client = TestClient(app)


def test_live_end_to_end_pipeline():
    # 1. REGISTER
    unique_email = f"live_test_{uuid.uuid4().hex[:8]}@example.com"
    reg = client.post(
        "/api/auth/register",
        json={"name": "Live Candidate", "email": unique_email, "password": "Password123!"}
    )
    assert reg.status_code == 200, reg.text

    # 2. LOGIN
    login = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "Password123!"}
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. GET /ME
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200, me.text
    assert me.json()["email"] == unique_email

    # 4. UPLOAD RESUME
    sample_resume_text = (
        "John Doe\n"
        "Email: john.doe@example.com\n"
        "Phone: +1-555-0199\n\n"
        "SUMMARY:\n"
        "Backend Python developer with experience in FastAPI, PostgreSQL, and building REST APIs.\n\n"
        "SKILLS:\n"
        "Python, FastAPI, PostgreSQL, Git, Docker, REST APIs\n\n"
        "EDUCATION:\n"
        "B.S. in Computer Science, State University, 2023\n\n"
        "EXPERIENCE:\n"
        "Junior Developer at SoftCorp (2023 - Present)\n"
        "- Built asynchronous REST APIs using FastAPI\n"
        "- Managed PostgreSQL database schemas and optimized SQL queries\n\n"
        "PROJECTS:\n"
        "Job Matching Portal\n"
        "- Designed candidate scoring engine using Python and FastAPI\n"
    )

    # Create a small valid docx or use a text mock in PyPDF2/docx
    import docx
    temp_docx_path = "temp_test_resume.docx"
    doc = docx.Document()
    for paragraph in sample_resume_text.split("\n\n"):
        doc.add_paragraph(paragraph)
    doc.save(temp_docx_path)

    try:
        with open(temp_docx_path, "rb") as f:
            upload_res = client.post(
                "/api/resumes/upload",
                headers=headers,
                files={"file": ("temp_test_resume.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
            )
        assert upload_res.status_code == 200, upload_res.text
        file_id = upload_res.json()["file_id"]
    finally:
        if os.path.exists(temp_docx_path):
            os.remove(temp_docx_path)

    # 5. ANALYZE RESUME (Live Gemini)
    time.sleep(2)
    print("Analyzing resume with Gemini...")
    analyze_res = client.post(f"/api/resumes/{file_id}/analyze", headers=headers)
    assert analyze_res.status_code == 200, analyze_res.text
    candidate_profile = analyze_res.json()["candidate_profile"]
    assert len(candidate_profile["skills"]) > 0

    # 6. ANALYZE JD (Live Gemini)
    time.sleep(2)
    print("Analyzing JD with Gemini...")
    sample_jd_text = (
        "Role: Junior Backend Engineer\n"
        "Company: CloudScale Inc.\n"
        "Requirements:\n"
        "- 1+ years of experience with Python and FastAPI\n"
        "- Experience with PostgreSQL database management\n"
        "- Understanding of REST API design and Git version control\n"
        "Nice to have:\n"
        "- Docker containerization\n"
        "- AWS Cloud services\n"
        "Responsibilities:\n"
        "- Develop and test secure REST APIs\n"
        "- Collaborate with cross-functional engineering teams\n"
    )
    jd_res = client.post("/api/jd/analyze", headers=headers, json={"text": sample_jd_text})
    assert jd_res.status_code == 200, jd_res.text
    jd_id = jd_res.json()["job_description_id"]
    job_profile = jd_res.json()["analysis"]

    # 7. MATCH (Live Gemini)
    time.sleep(2)
    print("Matching with Gemini...")
    match_res = client.post(
        "/api/matching/analyze",
        headers=headers,
        json={"candidate": candidate_profile, "job": job_profile}
    )
    assert match_res.status_code == 200, match_res.text
    match_result_id = match_res.json()["match_result_id"]
    resume_id = match_res.json()["resume_id"]
    match_data = match_res.json()["match_result"]
    assert 0 <= match_data["overall_match"] <= 100

    # 8. CREATE SESSION
    sess_res = client.post(
        "/api/interview/session",
        headers=headers,
        json={
            "resume_id": resume_id,
            "job_description_id": jd_id,
            "match_result_id": match_result_id,
            "interview_type": "technical"
        }
    )
    assert sess_res.status_code == 200, sess_res.text
    session_id = sess_res.json()["session_id"]
    assert sess_res.json()["status"] == "created"

    # 9. GENERATE QUESTIONS (Live Gemini)
    time.sleep(2)
    print("Generating questions with Gemini...")
    q_res = client.post(
        "/api/interview/questions",
        headers=headers,
        json={"session_id": session_id}
    )
    assert q_res.status_code == 200, q_res.text
    questions = q_res.json()["questions"]
    assert len(questions) > 0
    first_q = questions[0]
    q_id = first_q["id"]

    # 10. EVALUATE ANSWER (Live Gemini)
    time.sleep(2)
    print("Evaluating answer with Gemini...")
    eval_res = client.post(
        "/api/interview/evaluate",
        headers=headers,
        json={
            "session_id": session_id,
            "question_id": q_id,
            "answer": "In FastAPI, dependencies are injected using the Depends() keyword in route parameters. This allows for clean separation of database sessions, authentication checks, and request parsing."
        }
    )
    assert eval_res.status_code == 200, eval_res.text
    eval_data = eval_res.json()
    assert 0 <= eval_data["overall_score"] <= 100

    # 11. FOLLOW-UP QUESTION (Live Gemini)
    time.sleep(2)
    print("Generating follow-up with Gemini...")
    followup_res = client.post(
        "/api/interview/follow-up",
        headers=headers,
        json={
            "session_id": session_id,
            "question_id": q_id
        }
    )
    assert followup_res.status_code == 200, followup_res.text
    assert "question" in followup_res.json()["follow_up"]

    # 12. SKILL ANALYSIS (Live Gemini)
    time.sleep(2)
    print("Analyzing skills with Gemini...")
    sa_res = client.post(
        "/api/interview/skill-analysis",
        headers=headers,
        json={"session_id": session_id}
    )
    assert sa_res.status_code == 200, sa_res.text
    sa_data = sa_res.json()
    assert 0 <= sa_data["overall_readiness_score"] <= 100

    # 13. REPORT (Live Gemini)
    time.sleep(2)
    print("Generating report with Gemini...")
    rep_res = client.post(
        "/api/interview/report",
        headers=headers,
        json={"session_id": session_id}
    )
    assert rep_res.status_code == 200, rep_res.text
    rep_data = rep_res.json()
    assert 0 <= rep_data["overall_score"] <= 100

    # 14. IMPROVEMENT PLAN (Live Gemini)
    time.sleep(2)
    print("Generating improvement plan with Gemini...")
    plan_res = client.post(
        "/api/interview/improvement-plan",
        headers=headers,
        json={"session_id": session_id}
    )
    assert plan_res.status_code == 200, plan_res.text
    plan_data = plan_res.json()
    assert len(plan_data["priority_skills"]) >= 0

    # 15. VERIFY DATABASE PERSISTENCE
    db = SessionLocal()
    try:
        sess = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        assert sess.status == "completed"
        assert sess.overall_score is not None

        ans = db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session_id).first()
        assert ans is not None
        assert ans.overall_score is not None

        sa = db.query(SkillAnalysisModel).filter(SkillAnalysisModel.session_id == session_id).first()
        assert sa is not None

        rep = db.query(InterviewReportModel).filter(InterviewReportModel.session_id == session_id).first()
        assert rep is not None

        plan = db.query(ImprovementPlanModel).filter(ImprovementPlanModel.session_id == session_id).first()
        assert plan is not None

        print("\nAll database records verified successfully in PostgreSQL!")
    finally:
        db.close()
