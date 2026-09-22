import api from "./api";

export interface Question {
    id: string | number;
    question: string;
    category: "Technical" | "Behavioral" | "System Design" | "Problem Solving" | string;
    difficulty: "Easy" | "Medium" | "Hard" | string;
    skill?: string;
    reason?: string;
}

export interface InterviewSessionConfig {
    target_role: string;
    interview_type: string;
    difficulty: string;
    duration_minutes: number;
    question_count: number;
    focus_areas: string[];
}

export interface InterviewSessionResponse {
    session_id: string | number;
    config: InterviewSessionConfig;
    questions: Question[];
    status: "active" | "completed" | string;
    created_at?: string;
}

export interface AnswerSubmission {
    session_id: string | number;
    question_id: string | number;
    answer_text: string;
    question?: string;
    skill?: string;
    difficulty?: string;
    audio_duration_seconds?: number;
}

export interface AnswerEvaluationResponse {
    question_id: string | number;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    technical_accuracy?: number;
    communication_score?: number;
    missing_concepts?: string[];
    suggested_improvement?: string;
}

// 1. Analyze Job Description
export const analyzeJdApi = async (text: string) => {
    const response = await api.post("/api/jd/analyze", { text });
    return response.data;
};

// 2. Analyze Matching
export const analyzeMatchingApi = async (resumeId?: number, jdId?: number) => {
    const response = await api.post("/api/matching/analyze", {
        resume_id: resumeId,
        job_description_id: jdId,
    });
    return response.data;
};

// 3. Create Interview Session
export const createInterviewSessionApi = async (params: {
    resume_id: number;
    job_description_id: number;
    match_result_id: number;
    interview_type?: string;
}) => {
    const response = await api.post("/api/interview/session", params);
    return response.data;
};

// 4. Generate Questions
export const generateQuestionsApi = async (sessionId: number) => {
    const response = await api.post("/api/interview/questions", {
        session_id: sessionId,
    });
    return response.data;
};

// 5. Submit & Evaluate Answer
export const submitInterviewAnswer = async (
    submission: AnswerSubmission,
): Promise<AnswerEvaluationResponse> => {
    const response = await api.post("/api/interview/evaluate", {
        session_id: Number(submission.session_id),
        question_id: Number(submission.question_id),
        answer: submission.answer_text,
        question: submission.question,
        skill: submission.skill,
        difficulty: submission.difficulty,
    });

    const data = response.data;
    return {
        question_id: submission.question_id,
        score: Math.round(data.overall_score || 0),
        feedback: data.feedback || "",
        strengths: data.strengths || [],
        improvements: data.weaknesses || data.missing_concepts || [],
        technical_accuracy: data.technical_accuracy,
        communication_score: data.communication_score,
        missing_concepts: data.missing_concepts,
        suggested_improvement: data.suggested_improvement,
    };
};

// Legacy compatibility helper
export const startInterviewSession = async (
    config: InterviewSessionConfig,
): Promise<InterviewSessionResponse> => {
    return {
        session_id: "demo-session-1",
        config,
        questions: [],
        status: "active",
    };
};

export const endInterviewSession = async (
    sessionId: string | number,
): Promise<{ success: boolean; session_id: string | number }> => {
    return { success: true, session_id: sessionId };
};

// 6. Generate Report
export const generateReportApi = async (sessionId: number) => {
    const response = await api.post("/api/interview/report", {
        session_id: sessionId,
    });
    return response.data;
};

// 7. Generate Skill Analysis
export const generateSkillAnalysisApi = async (sessionId: number) => {
    const response = await api.post("/api/interview/skill-analysis", {
        session_id: sessionId,
    });
    return response.data;
};

// 8. Generate Improvement Plan
export const generateImprovementPlanApi = async (sessionId: number) => {
    const response = await api.post("/api/interview/improvement-plan", {
        session_id: sessionId,
    });
    return response.data;
};

