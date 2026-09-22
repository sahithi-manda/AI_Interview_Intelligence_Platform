import io
import uuid
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.resume import CandidateProfile, Education, Project, Experience
from app.schemas.jd import JobDescription
from app.schemas.matching import MatchResult
from app.schemas.interview import InterviewQuestionSet, InterviewQuestion
from app.schemas.answer import AnswerEvaluation
from app.schemas.followup import FollowUpResponse, FollowUpQuestion
from app.schemas.skill_analysis import SkillAnalysis
from app.schemas.interview_report import InterviewReport
from app.schemas.improvement import ImprovementPlan

client = TestClient(app)


@pytest.fixture
def auth_users():
    user1_email = f"user1_{uuid.uuid4().hex[:8]}@example.com"
    user2_email = f"user2_{uuid.uuid4().hex[:8]}@example.com"
    password = "StrongPassword123!"

    # Register user 1
    r1 = client.post("/api/auth/register", json={"name": "Alice Candidate", "email": user1_email, "password": password})
    assert r1.status_code == 200, r1.text
    token1 = r1.json()["access_token"]

    # Register user 2
    r2 = client.post("/api/auth/register", json={"name": "Bob Intruder", "email": user2_email, "password": password})
    assert r2.status_code == 200, r2.text
    token2 = r2.json()["access_token"]

    return {
        "user1": {"email": user1_email, "headers": {"Authorization": f"Bearer {token1}"}},
        "user2": {"email": user2_email, "headers": {"Authorization": f"Bearer {token2}"}}
    }


def test_full_pipeline_with_ownership_and_validation(auth_users):
    u1_headers = auth_users["user1"]["headers"]
    u2_headers = auth_users["user2"]["headers"]

    # ----------------------------------------------------
    # 1. RESUME UPLOAD (User 1)
    # ----------------------------------------------------
    dummy_pdf_content = b"%PDF-1.4 dummy resume content with skills Python FastAPI PostgreSQL"
    upload_res = client.post(
        "/api/resumes/upload",
        headers=u1_headers,
        files={"file": ("resume.pdf", io.BytesIO(dummy_pdf_content), "application/pdf")}
    )
    # If PDF parser complains about header on dummy bytes, test with text or mock extractor
    if upload_res.status_code != 200:
        with patch("app.api.resume.extract_resume_text", return_value="Alice Developer\nPython, FastAPI, PostgreSQL"):
            with patch("app.api.resume.clean_resume_text", return_value="Alice Developer Python FastAPI PostgreSQL"):
                upload_res = client.post(
                    "/api/resumes/upload",
                    headers=u1_headers,
                    files={"file": ("resume.pdf", io.BytesIO(dummy_pdf_content), "application/pdf")}
                )
    assert upload_res.status_code == 200, upload_res.text
    file_id = upload_res.json()["file_id"]

    # Test invalid file extension
    bad_upload = client.post(
        "/api/resumes/upload",
        headers=u1_headers,
        files={"file": ("resume.exe", io.BytesIO(b"executable"), "application/octet-stream")}
    )
    assert bad_upload.status_code == 400

    # ----------------------------------------------------
    # 2. RESUME ANALYSIS (User 1)
    # ----------------------------------------------------
    mock_candidate_profile = CandidateProfile(
        name="Alice Candidate",
        email="alice@example.com",
        skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
        education=[Education(degree="B.S. Computer Science", institution="Tech University", year="2024")],
        projects=[Project(name="Interview AI", description="AI interview platform", technologies=["FastAPI", "Gemini"])],
        experience=[Experience(company="Acme Corp", role="Software Engineer Intern", duration="3 months", responsibilities=["Built REST APIs"])],
        summary="Skilled backend engineer with Python experience"
    )

    with patch("app.api.resume.analyze_resume_with_ai", return_value=mock_candidate_profile):
        analyze_resume_res = client.post(f"/api/resumes/{file_id}/analyze", headers=u1_headers)
        assert analyze_resume_res.status_code == 200
        assert analyze_resume_res.json()["candidate_profile"]["name"] == "Alice Candidate"

    # User 2 cannot analyze User 1's resume
    unauth_resume_analysis = client.post(f"/api/resumes/{file_id}/analyze", headers=u2_headers)
    assert unauth_resume_analysis.status_code == 404

    # ----------------------------------------------------
    # 3. JOB DESCRIPTION ANALYSIS (User 1)
    # ----------------------------------------------------
    # Test empty JD rejection
    empty_jd_res = client.post("/api/jd/analyze", headers=u1_headers, json={"text": "   "})
    assert empty_jd_res.status_code == 400

    mock_jd_profile = JobDescription(
        job_title="Backend Developer",
        company="Global Tech",
        experience_required="1-2 years",
        education_required="Bachelor's in CS",
        required_skills=["Python", "FastAPI", "SQLAlchemy"],
        preferred_skills=["Docker", "AWS"],
        responsibilities=["Develop APIs", "Optimize database queries"],
        qualifications=["Knowledge of REST APIs"],
        summary="Looking for a talented Backend Developer"
    )

    with patch("app.api.jd.analyze_jd_with_ai", return_value=mock_jd_profile):
        jd_res = client.post(
            "/api/jd/analyze",
            headers=u1_headers,
            json={"text": "We are looking for a Backend Developer with Python, FastAPI, and SQLAlchemy skills."}
        )
        assert jd_res.status_code == 200
        jd_id = jd_res.json()["job_description_id"]
        assert jd_id > 0

    # ----------------------------------------------------
    # 4. RESUME-JD MATCHING (User 1)
    # ----------------------------------------------------
    mock_match_result = MatchResult(
        overall_match=85.0,
        skills_match=90.0,
        experience_match=80.0,
        education_match=100.0,
        matched_skills=["Python", "FastAPI", "Docker"],
        missing_skills=["AWS", "SQLAlchemy"],
        strengths=["Strong Python foundation", "API experience"],
        weaknesses=["Missing AWS experience"],
        recommendations=["Gain AWS cloud experience"]
    )

    with patch("app.api.matching.match_resume_with_jd", return_value=mock_match_result):
        # Match using explicit candidate and job
        match_res = client.post(
            "/api/matching/analyze",
            headers=u1_headers,
            json={
                "candidate": mock_candidate_profile.model_dump(),
                "job": mock_jd_profile.model_dump()
            }
        )
        assert match_res.status_code == 200
        match_result_id = match_res.json()["match_result_id"]
        resume_id = match_res.json()["resume_id"]
        assert match_result_id > 0

    # ----------------------------------------------------
    # 5. CREATE INTERVIEW SESSION (User 1)
    # ----------------------------------------------------
    session_res = client.post(
        "/api/interview/session",
        headers=u1_headers,
        json={
            "resume_id": resume_id,
            "job_description_id": jd_id,
            "match_result_id": match_result_id,
            "interview_type": "technical"
        }
    )
    assert session_res.status_code == 200, session_res.text
    session_id = session_res.json()["session_id"]
    assert session_res.json()["status"] == "created"

    # User 2 cannot create session using User 1's IDs
    u2_session_tamper = client.post(
        "/api/interview/session",
        headers=u2_headers,
        json={
            "resume_id": resume_id,
            "job_description_id": jd_id,
            "match_result_id": match_result_id,
            "interview_type": "technical"
        }
    )
    assert u2_session_tamper.status_code == 404

    # ----------------------------------------------------
    # 6. QUESTION GENERATION (User 1)
    # ----------------------------------------------------
    mock_questions = InterviewQuestionSet(
        questions=[
            InterviewQuestion(
                question="Explain how dependency injection works in FastAPI.",
                category="Technical",
                difficulty="Medium",
                skill="FastAPI",
                reason="Tests FastAPI understanding"
            ),
            InterviewQuestion(
                question="How do you handle migrations in SQLAlchemy?",
                category="Skill Gap",
                difficulty="Medium",
                skill="SQLAlchemy",
                reason="Checks missing skill"
            )
        ]
    )

    with patch("app.api.interview.generate_interview_questions", return_value=mock_questions):
        # Generate questions passing session_id (automatically loading candidate/job/match_result from DB)
        q_gen_res = client.post(
            "/api/interview/questions",
            headers=u1_headers,
            json={"session_id": session_id}
        )
        assert q_gen_res.status_code == 200, q_gen_res.text
        q_data = q_gen_res.json()
        assert q_data["question_count"] == 2
        question_id = q_data["questions"][0]["id"]
        assert q_data["questions"][0]["question_order"] == 1
        assert q_data["questions"][1]["question_order"] == 2

    # User 2 cannot generate questions for User 1's session
    u2_q_tamper = client.post(
        "/api/interview/questions",
        headers=u2_headers,
        json={"session_id": session_id}
    )
    assert u2_q_tamper.status_code == 404

    # ----------------------------------------------------
    # 7. ANSWER SUBMISSION & EVALUATION (User 1)
    # ----------------------------------------------------
    # Empty answer should fail
    empty_ans = client.post(
        "/api/interview/evaluate",
        headers=u1_headers,
        json={
            "session_id": session_id,
            "question_id": question_id,
            "answer": "   "
        }
    )
    assert empty_ans.status_code == 400

    mock_evaluation = AnswerEvaluation(
        overall_score=88.0,
        technical_accuracy=90.0,
        communication_score=85.0,
        strengths=["Clear explanation of Depends syntax", "Good example"],
        weaknesses=["Could mention sub-dependencies"],
        missing_concepts=["Yield dependencies for cleanup"],
        feedback="Great answer with clear examples.",
        suggested_improvement="Study generator-based dependencies."
    )

    with patch("app.api.answer.evaluate_answer", return_value=mock_evaluation):
        eval_res = client.post(
            "/api/interview/evaluate",
            headers=u1_headers,
            json={
                "session_id": session_id,
                "question_id": question_id,
                "answer": "FastAPI uses the Depends() function to declare dependencies in path operations."
            }
        )
        assert eval_res.status_code == 200, eval_res.text
        assert eval_res.json()["overall_score"] == 88.0

    # User 2 cannot evaluate answer for User 1's session
    u2_eval_tamper = client.post(
        "/api/interview/evaluate",
        headers=u2_headers,
        json={
            "session_id": session_id,
            "question_id": question_id,
            "answer": "FastAPI uses Depends."
        }
    )
    assert u2_eval_tamper.status_code == 404

    # ----------------------------------------------------
    # 8. ADAPTIVE FOLLOW-UP (User 1)
    # ----------------------------------------------------
    mock_followup = FollowUpResponse(
        follow_up=FollowUpQuestion(
            question="How would you use a yield dependency in FastAPI to manage database session lifecycle?",
            category="Technical",
            difficulty="Hard",
            skill="FastAPI",
            reason="Digs deeper into the missing concept identified in previous evaluation."
        )
    )

    with patch("app.api.followup.generate_follow_up", return_value=mock_followup):
        followup_res = client.post(
            "/api/interview/follow-up",
            headers=u1_headers,
            json={
                "session_id": session_id,
                "question_id": question_id
            }
        )
        assert followup_res.status_code == 200, followup_res.text
        assert "yield dependency" in followup_res.json()["follow_up"]["question"]

    # User 2 cannot request follow-up for User 1's session
    u2_followup_tamper = client.post(
        "/api/interview/follow-up",
        headers=u2_headers,
        json={
            "session_id": session_id,
            "question_id": question_id
        }
    )
    assert u2_followup_tamper.status_code == 404

    # ----------------------------------------------------
    # 9. SKILL ANALYSIS (User 1)
    # ----------------------------------------------------
    mock_skill_analysis = SkillAnalysis(
        strong_skills=["Python", "FastAPI"],
        weak_skills=["SQLAlchemy"],
        missing_skills=["AWS"],
        technical_weaknesses=["Advanced database connection pooling"],
        communication_weaknesses=["Could be more structured with STAR method"],
        priority_areas=["SQLAlchemy migrations", "AWS deployments"],
        overall_readiness_score=82.0,
        summary="Candidate shows strong API fundamentals with moderate database experience."
    )

    with patch("app.api.skill_analysis.analyze_skills", return_value=mock_skill_analysis):
        sa_res = client.post(
            "/api/interview/skill-analysis",
            headers=u1_headers,
            json={"session_id": session_id}
        )
        assert sa_res.status_code == 200, sa_res.text
        assert sa_res.json()["overall_readiness_score"] == 82.0

    # User 2 cannot access or trigger skill analysis on User 1's session
    u2_sa_tamper = client.post(
        "/api/interview/skill-analysis",
        headers=u2_headers,
        json={"session_id": session_id}
    )
    assert u2_sa_tamper.status_code == 404

    # ----------------------------------------------------
    # 10. INTERVIEW REPORT (User 1)
    # ----------------------------------------------------
    mock_report = InterviewReport(
        overall_score=85.0,
        technical_score=88.0,
        communication_score=82.0,
        strong_areas=["Backend API Design", "FastAPI architecture"],
        weak_areas=["Cloud deployment"],
        missing_skills=["AWS"],
        interview_summary="Strong performance on backend fundamentals and framework architecture.",
        hiring_recommendation="Hire for Junior/Mid Backend Engineer",
        improvement_areas=["AWS Cloud", "Advanced ORM"]
    )

    with patch("app.api.report.generate_interview_report", return_value=mock_report):
        report_res = client.post(
            "/api/interview/report",
            headers=u1_headers,
            json={"session_id": session_id}
        )
        assert report_res.status_code == 200, report_res.text
        assert report_res.json()["overall_score"] == 85.0

    # User 2 cannot access or generate report on User 1's session
    u2_report_tamper = client.post(
        "/api/interview/report",
        headers=u2_headers,
        json={"session_id": session_id}
    )
    assert u2_report_tamper.status_code == 404

    # ----------------------------------------------------
    # 11. PERSONALIZED IMPROVEMENT PLAN (User 1)
    # ----------------------------------------------------
    mock_plan = ImprovementPlan(
        priority_skills=["AWS", "SQLAlchemy"],
        learning_goals=["Master Docker containerization on AWS ECS", "Implement Alembic migrations"],
        practice_areas=["Cloud infrastructure", "Database performance optimization"],
        project_recommendations=["Deploy Interview Intelligence backend to AWS ECS with RDS"],
        interview_practice=["Practice system design scenarios for scalable APIs"],
        short_term_goals=["Complete AWS beginner tutorial", "Set up Alembic in local project"],
        long_term_goals=["Achieve AWS Cloud Practitioner certification", "Contribute to open source FastAPI projects"],
        personalized_plan="Focus on cloud deployment and database scaling to transition from entry level to senior backend roles."
    )

    with patch("app.api.improvement.generate_improvement_plan", return_value=mock_plan):
        plan_res = client.post(
            "/api/interview/improvement-plan",
            headers=u1_headers,
            json={"session_id": session_id}
        )
        assert plan_res.status_code == 200, plan_res.text
        assert len(plan_res.json()["priority_skills"]) == 2

    # User 2 cannot access or generate improvement plan on User 1's session
    u2_plan_tamper = client.post(
        "/api/interview/improvement-plan",
        headers=u2_headers,
        json={"session_id": session_id}
    )
    assert u2_plan_tamper.status_code == 404

    # ----------------------------------------------------
    # 12. DIRECT DATABASE PERSISTENCE VERIFICATION
    # ----------------------------------------------------
    from app.database.database import SessionLocal
    from app.models.interview_session import InterviewSession as DbSession
    from app.models.interview_question import InterviewQuestion as DbQuestion
    from app.models.interview_answer import InterviewAnswer as DbAnswer
    from app.models.skill_analysis import SkillAnalysisModel as DbSkillAnalysis
    from app.models.interview_report import InterviewReportModel as DbReport
    from app.models.improvement_plan import ImprovementPlanModel as DbPlan

    db = SessionLocal()
    try:
        # Check session completion and score
        sess = db.query(DbSession).filter(DbSession.id == session_id).first()
        assert sess is not None
        assert sess.status == "completed"
        assert sess.overall_score == 85
        assert "Strong performance" in sess.summary

        # Check answers table
        ans_rows = db.query(DbAnswer).filter(DbAnswer.session_id == session_id).all()
        assert len(ans_rows) == 1
        assert ans_rows[0].question_id == question_id
        assert ans_rows[0].overall_score == 88.0
        assert ans_rows[0].feedback == "Great answer with clear examples."

        # Check questions table (2 initial + 1 follow-up)
        q_rows = db.query(DbQuestion).filter(DbQuestion.session_id == session_id).order_by(DbQuestion.question_order).all()
        assert len(q_rows) == 3
        assert q_rows[0].question_order == 1
        assert q_rows[1].question_order == 2
        assert q_rows[2].question_order == 3
        assert q_rows[2].category == "Technical"

        # Check skill analysis persistence
        sa_rows = db.query(DbSkillAnalysis).filter(DbSkillAnalysis.session_id == session_id).all()
        assert len(sa_rows) >= 1
        assert sa_rows[0].overall_readiness_score == 82.0

        # Check report persistence
        rep_rows = db.query(DbReport).filter(DbReport.session_id == session_id).all()
        assert len(rep_rows) == 1
        assert rep_rows[0].overall_score == 85.0
        assert rep_rows[0].hiring_recommendation == "Hire for Junior/Mid Backend Engineer"

        # Check improvement plan persistence
        plan_rows = db.query(DbPlan).filter(DbPlan.session_id == session_id).all()
        assert len(plan_rows) == 1
        assert "Focus on cloud deployment" in plan_rows[0].personalized_plan

    finally:
        db.close()


def test_matching_with_explicit_ids(auth_users):
    u1_headers = auth_users["user1"]["headers"]

    # 1. Upload & Analyze Resume
    with patch("app.api.resume.extract_resume_text", return_value="Dev text"):
        with patch("app.api.resume.clean_resume_text", return_value="Dev text"):
            upload_res = client.post(
                "/api/resumes/upload",
                headers=u1_headers,
                files={"file": ("profile.docx", io.BytesIO(b"docx content"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
            )
    assert upload_res.status_code == 200
    file_id = upload_res.json()["file_id"]

    mock_profile = CandidateProfile(
        name="Bob Builder",
        skills=["Python", "PostgreSQL"],
        summary="Experienced database developer"
    )
    with patch("app.api.resume.analyze_resume_with_ai", return_value=mock_profile):
        client.post(f"/api/resumes/{file_id}/analyze", headers=u1_headers)

    # Fetch resume id from DB
    from app.database.database import SessionLocal
    from app.models.resume import Resume as DbResume
    db = SessionLocal()
    resume_rec = db.query(DbResume).filter(DbResume.file_id == file_id).first()
    db_resume_id = resume_rec.id
    db.close()

    # 2. Analyze JD
    mock_jd = JobDescription(
        job_title="DB Admin",
        required_skills=["PostgreSQL"],
        summary="Seeking DBA"
    )
    with patch("app.api.jd.analyze_jd_with_ai", return_value=mock_jd):
        jd_res = client.post("/api/jd/analyze", headers=u1_headers, json={"text": "Seeking DBA with PostgreSQL"})
    jd_id = jd_res.json()["job_description_id"]

    # 3. Match passing only resume_id and job_description_id
    mock_match = MatchResult(
        overall_match=92.0,
        skills_match=95.0,
        experience_match=90.0,
        education_match=90.0,
        matched_skills=["PostgreSQL"]
    )
    with patch("app.api.matching.match_resume_with_jd", return_value=mock_match):
        match_res = client.post(
            "/api/matching/analyze",
            headers=u1_headers,
            json={
                "resume_id": db_resume_id,
                "job_description_id": jd_id
            }
        )
        assert match_res.status_code == 200
        assert match_res.json()["resume_id"] == db_resume_id
        assert match_res.json()["job_description_id"] == jd_id
        assert match_res.json()["match_result"]["overall_match"] == 92.0

