import api from "./api";

export interface QuestionEvaluationResult {
    number: number;
    question_id: string;
    category: string;
    question: string;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
}

export interface DimensionPerformance {
    dimension: string;
    score: number;
    description: string;
}

export interface EvaluationSummary {
    session_id: string;
    target_role: string;
    overall_score: number;
    performance_breakdown: DimensionPerformance[];
    question_results: QuestionEvaluationResult[];
    overall_strengths: string[];
    key_improvements: string[];
    ai_recommendation: string;
    completed_at: string;
}

export const getEvaluationResults = async (
    sessionId: string | number,
): Promise<EvaluationSummary> => {
    const response = await api.post("/api/interview/report", {
        session_id: Number(sessionId),
    });

    const data = response.data;
    return {
        session_id: String(sessionId),
        target_role: "Senior Full Stack Developer",
        overall_score: Math.round(data.overall_score || 0),
        performance_breakdown: [
            {
                dimension: "Technical Skills",
                score: Math.round(data.technical_score || 0),
                description: "Technical concepts and practical implementation.",
            },
            {
                dimension: "Communication",
                score: Math.round(data.communication_score || 0),
                description: "Clear explanations and answer structuring.",
            },
        ],
        question_results: [],
        overall_strengths: data.strong_areas || [],
        key_improvements: data.improvement_areas || data.weak_areas || [],
        ai_recommendation: data.hiring_recommendation || data.interview_summary || "",
        completed_at: new Date().toISOString(),
    };
};

export const generateAIEvaluationReport = async (
    sessionId: string | number,
): Promise<{ success: boolean; report_url?: string; summary: EvaluationSummary }> => {
    const summary = await getEvaluationResults(sessionId);
    return {
        success: true,
        summary,
    };
};
