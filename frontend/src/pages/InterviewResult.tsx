import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreparation } from "../context/PreparationContext";
import { generateReportApi } from "../services/interviewApi";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";

interface PerformanceItem {
    label: string;
    score: number;
    description: string;
}

interface QuestionResult {
    number: number;
    category: string;
    question: string;
    score: number;
    feedback: string;
}

interface InterviewReportData {
    overall_score?: number;
    technical_score?: number;
    communication_score?: number;
    strong_areas?: string[];
    weak_areas?: string[];
    missing_skills?: string[];
    interview_summary?: string;
    hiring_recommendation?: string;
    improvement_areas?: string[];
}

function InterviewResult() {
    const navigate = useNavigate();
    const { targetJob, interviewConfig, interviewHistory, activeSessionId } = usePreparation();

    const [reportData, setReportData] = useState<InterviewReportData | null>(null);

    useEffect(() => {
        if (activeSessionId) {
            generateReportApi(activeSessionId)
                .then((res) => {
                    if (res) {
                        setReportData(res);
                    }
                })
                .catch((err) => console.error("Could not fetch report:", err));
        }
    }, [activeSessionId]);

    const latestInterview = interviewHistory[0];
    const overallScore = reportData?.overall_score
        ? Math.round(reportData.overall_score)
        : latestInterview?.score || 84;
    const roleTitle = latestInterview?.role || targetJob.jobTitle || "Senior Full Stack Developer";

    const techScore = reportData?.technical_score ? Math.round(reportData.technical_score) : 88;
    const commScore = reportData?.communication_score ? Math.round(reportData.communication_score) : 76;

    const performance: PerformanceItem[] = [
        {
            label: "Technical Skills",
            score: techScore,
            description: "Strong understanding of technical concepts and practical implementation.",
        },
        {
            label: "Communication",
            score: commScore,
            description: "Clear answers with an opportunity to improve structure and precision.",
        },
    ];

    const questionResults: QuestionResult[] = [
        {
            number: 1,
            category: "Technical",
            question: "Can you explain the difference between state and props in React?",
            score: 88,
            feedback: "Good understanding of the concepts. The explanation was technically accurate and easy to follow.",
        },
        {
            number: 2,
            category: "Behavioral",
            question: "Tell me about a challenging technical problem you faced.",
            score: 82,
            feedback: "Good example with relevant experience. The answer could be more structured using the STAR method.",
        },
        {
            number: 3,
            category: "System Design",
            question: "How would you design a scalable REST API for millions of users?",
            score: 79,
            feedback: "Good fundamentals. Consider discussing caching, load balancing, database scaling, and failure handling in greater depth.",
        },
        {
            number: 4,
            category: "Problem Solving",
            question: "How would you optimize a React application experiencing performance issues?",
            score: 86,
            feedback: "Strong practical approach with relevant optimization techniques and good technical reasoning.",
        },
        {
            number: 5,
            category: "Behavioral",
            question: "Describe a disagreement with a teammate about a technical decision.",
            score: 81,
            feedback: "Good communication and professionalism. Add more detail about how the disagreement was resolved.",
        },
    ];

    const strengths = reportData?.strong_areas?.length
        ? reportData.strong_areas
        : [
              "Strong technical fundamentals",
              "Good understanding of full-stack development",
              "Practical problem-solving approach",
              "Relevant project examples",
          ];

    const improvements = reportData?.improvement_areas?.length
        ? reportData.improvement_areas
        : reportData?.weak_areas?.length
        ? reportData.weak_areas
        : [
              "Structure behavioral answers more clearly",
              "Explain system design decisions in greater depth",
              "Reduce hesitation when answering complex questions",
              "Use measurable outcomes when describing projects",
          ];

    const aiSummaryText =
        reportData?.interview_summary ||
        reportData?.hiring_recommendation ||
        "You demonstrated strong technical knowledge and practical engineering experience. Your biggest opportunity is improving answer structure and communication during behavioral and system design questions.";

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Strong";
        if (score >= 70) return "Good";
        return "Needs Work";
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-medium tracking-wide text-gray-500">INTERVIEW COMPLETE</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Interview Results</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        Review your performance, understand your strengths, and see what you should focus on before your next interview.
                    </p>
                </div>
                <Badge variant="success">Interview Completed</Badge>
            </section>

            {/* Overall Score */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Score Circle */}
                    <div className="flex flex-col items-center justify-center border-b border-gray-800 pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                        <p className="text-sm font-medium tracking-wide text-gray-500">OVERALL SCORE</p>
                        <div
                            className="mt-6 flex h-44 w-44 items-center justify-center rounded-full border-8 border-gray-800 bg-black"
                            aria-label={`Overall interview score ${overallScore} out of 100`}
                        >
                            <div className="text-center">
                                <p className="text-6xl font-bold tracking-tight">{overallScore}</p>
                                <p className="mt-1 text-sm text-gray-600">/ 100</p>
                            </div>
                        </div>

                        <Badge variant="success" className="mt-5">
                            {getScoreLabel(overallScore)} Performance
                        </Badge>
                        <p className="mt-3 max-w-xs text-center text-sm leading-6 text-gray-600">
                            You're showing good interview readiness. Keep practicing the areas highlighted below.
                        </p>
                    </div>

                    {/* Session Summary */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div>
                                <p className="text-sm font-medium tracking-wide text-gray-500">SESSION SUMMARY</p>
                                <h2 className="mt-2 text-xl font-semibold">{roleTitle}</h2>
                                <p className="mt-1 text-sm text-gray-600">Completed mock interview session</p>
                            </div>
                            <Badge>{interviewConfig.type || "Mixed"} Interview</Badge>
                        </div>

                        <div className="mt-7 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-gray-800 bg-black p-5">
                                <p className="text-sm text-gray-500">Questions</p>
                                <p className="mt-3 text-2xl font-bold">{latestInterview?.questionsCount || 5}</p>
                                <p className="mt-1 text-xs text-gray-600">Completed</p>
                            </div>

                            <div className="rounded-xl border border-gray-800 bg-black p-5">
                                <p className="text-sm text-gray-500">Duration</p>
                                <p className="mt-3 text-2xl font-bold">{latestInterview?.duration || "18:42"}</p>
                                <p className="mt-1 text-xs text-gray-600">Session time</p>
                            </div>

                            <div className="rounded-xl border border-gray-800 bg-black p-5">
                                <p className="text-sm text-gray-500">Difficulty</p>
                                <p className="mt-3 text-2xl font-bold">{interviewConfig.difficulty || "Medium"}</p>
                                <p className="mt-1 text-xs text-gray-600">Adaptive level</p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-gray-800 bg-black p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                                    ✦
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">AI Summary</p>
                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        {aiSummaryText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Performance breakdown */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium tracking-wide text-gray-500">PERFORMANCE BREAKDOWN</p>
                    <h2 className="mt-2 text-xl font-semibold">How you performed</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Your performance across the main interview evaluation dimensions.
                    </p>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                    {performance.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-gray-800 bg-black p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium text-white">{item.label}</p>
                                    <p className="mt-2 max-w-sm text-xs leading-5 text-gray-600">{item.description}</p>
                                </div>
                                <span className="shrink-0 text-2xl font-bold">{item.score}%</span>
                            </div>
                            <ProgressBar value={item.score} className="mt-5" />
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-gray-700">Performance</span>
                                <span className="text-xs font-medium text-gray-500">{getScoreLabel(item.score)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Question Review */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium tracking-wide text-gray-500">QUESTION REVIEW</p>
                    <h2 className="mt-2 text-xl font-semibold">Question-by-question performance</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Review the AI feedback for each question from your interview session.
                    </p>
                </div>

                <div className="mt-7 space-y-4">
                    {questionResults.map((result) => (
                        <article key={result.number} className="rounded-2xl border border-gray-800 bg-black p-5 sm:p-6">
                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                                <div className="flex min-w-0 gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-gray-300">
                                        {String(result.number).padStart(2, "0")}
                                    </div>
                                    <div className="min-w-0">
                                        <Badge>{result.category}</Badge>
                                        <h3 className="mt-3 font-medium leading-6 text-white">{result.question}</h3>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-4 md:block md:text-right">
                                    <div>
                                        <p className="text-2xl font-bold">{result.score}%</p>
                                        <p className="mt-1 text-xs text-gray-600">{getScoreLabel(result.score)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <ProgressBar value={result.score} />
                            </div>
                            <div className="mt-5 border-t border-gray-800 pt-4">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-600">AI Feedback</p>
                                <p className="mt-2 text-sm leading-6 text-gray-500">{result.feedback}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Strengths & Improvements */}
            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium tracking-wide text-gray-500">YOUR STRENGTHS</p>
                    <h2 className="mt-2 text-xl font-semibold">What you did well</h2>
                    <div className="mt-6 space-y-3">
                        {strengths.map((strength: string) => (
                            <div key={strength} className="flex items-start gap-3 rounded-xl border border-gray-800 bg-black p-4">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm text-gray-300">
                                    ✓
                                </span>
                                <p className="text-sm leading-6 text-gray-400">{strength}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium tracking-wide text-gray-500">AREAS TO IMPROVE</p>
                    <h2 className="mt-2 text-xl font-semibold">Focus on these next</h2>
                    <div className="mt-6 space-y-3">
                        {improvements.map((improvement: string) => (
                            <div key={improvement} className="flex items-start gap-3 rounded-xl border border-gray-800 bg-black p-4">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm text-gray-300">
                                    →
                                </span>
                                <p className="text-sm leading-6 text-gray-400">{improvement}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recommendation & Navigation */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                        ✦
                    </div>
                    <div>
                        <p className="text-sm font-medium tracking-wide text-gray-500">AI RECOMMENDATION</p>
                        <h2 className="mt-2 text-xl font-semibold">Improve answer structure before your next interview</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                            Your technical foundation is already strong. Spend your next preparation session practicing structured behavioral answers and explaining system design decisions step by step.
                        </p>
                    </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                        type="button"
                        onClick={() => navigate("/interview")}
                        className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                    >
                        Retry Interview →
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/analytics")}
                        className="rounded-xl border border-gray-800 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
                    >
                        View Analytics
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/roadmap")}
                        className="rounded-xl border border-gray-800 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
                    >
                        View Roadmap
                    </button>
                </div>
            </section>

            {/* Bottom Actions */}
            <section className="grid gap-4 border-t border-gray-800 pt-8 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-xl border border-gray-800 bg-gray-950 px-5 py-4 text-left text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white"
                >
                    ← Back to Dashboard
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/roadmap")}
                    className="rounded-xl border border-gray-800 bg-gray-950 px-5 py-4 text-left text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white sm:text-right"
                >
                    Continue to Roadmap →
                </button>
            </section>
        </div>
    );
}

export default InterviewResult;