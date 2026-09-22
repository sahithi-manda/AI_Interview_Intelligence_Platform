import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreparation } from "../context/PreparationContext";
import {
    submitInterviewAnswer,
    generateReportApi,
    generateQuestionsApi,
    generateSkillAnalysisApi,
    generateImprovementPlanApi,
} from "../services/interviewApi";

interface Question {
    id?: number | string;
    question: string;
    category: string;
    difficulty: string;
}

const defaultQuestions: Question[] = [
    {
        id: 1,
        question:
            "Can you explain the difference between state and props in React and when you would use each?",
        category: "Technical",
        difficulty: "Medium",
    },
    {
        id: 2,
        question:
            "Tell me about a challenging technical problem you faced in one of your projects and how you solved it.",
        category: "Behavioral",
        difficulty: "Medium",
    },
    {
        id: 3,
        question:
            "How would you design a scalable REST API for an application with millions of users?",
        category: "System Design",
        difficulty: "Hard",
    },
    {
        id: 4,
        question:
            "How would you optimize a React application that has started experiencing performance issues?",
        category: "Problem Solving",
        difficulty: "Medium",
    },
    {
        id: 5,
        question:
            "Describe a situation where you disagreed with a teammate about a technical decision. How did you handle it?",
        category: "Behavioral",
        difficulty: "Medium",
    },
];

const interviewTips = [
    "Structure your answer clearly and explain your reasoning step by step.",
    "Use specific examples from your projects or previous experience.",
    "For technical questions, explain trade-offs instead of giving only one solution.",
    "Take a moment to think before answering. A thoughtful response is better than a rushed one.",
    "For behavioral questions, explain the situation, your actions, and the outcome.",
];

function InterviewRoom() {
    const navigate = useNavigate();
    const { interviewConfig, addCompletedInterview, activeSessionId } = usePreparation();

    const [fetchedQuestions, setFetchedQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (activeSessionId) {
            generateQuestionsApi(activeSessionId)
                .then((res) => {
                    if (res?.questions && Array.isArray(res.questions) && res.questions.length > 0) {
                        setFetchedQuestions(
                            res.questions.map((q: Question) => ({
                                id: q.id,
                                question: q.question,
                                category: q.category || "Technical",
                                difficulty: q.difficulty || "Medium",
                            })),
                        );
                    }
                })
                .catch((e) => {
                    console.error("Could not fetch session questions:", e);
                });
        }
    }, [activeSessionId]);

    const questions = fetchedQuestions.length > 0 ? fetchedQuestions : defaultQuestions;
    const totalQuestions = questions.length;

    const question = questions[currentQuestion] || questions[0];
    const progress = useMemo(
        () => ((currentQuestion + 1) / totalQuestions) * 100,
        [currentQuestion, totalQuestions],
    );

    const tip = interviewTips[currentQuestion % interviewTips.length];

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds,
        ).padStart(2, "0")}`;
    };

    useEffect(() => {
        if (isFinished) return;
        const timer = window.setInterval(() => {
            setElapsedSeconds((current) => current + 1);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [isFinished]);

    const finishInterviewSession = async () => {
        setIsFinished(true);
        setIsRecording(false);

        let finalScore = 85;

        if (activeSessionId) {
            try {
                const reportRes = await generateReportApi(activeSessionId);
                if (reportRes?.overall_score) {
                    finalScore = Math.round(reportRes.overall_score);
                }
                // Generate skill analysis and improvement plan in background
                generateSkillAnalysisApi(activeSessionId).catch(() => {});
                generateImprovementPlanApi(activeSessionId).catch(() => {});
            } catch (e) {
                console.error("Failed to generate report:", e);
            }
        }

        // Save result to context
        addCompletedInterview({
            id: activeSessionId ? `int-${activeSessionId}` : `int-${Date.now()}`,
            role: interviewConfig.role || "Senior Full Stack Developer",
            type: interviewConfig.type || "Mixed",
            date: "Just now",
            score: finalScore,
            duration: formatTime(elapsedSeconds),
            difficulty: interviewConfig.difficulty || "Medium",
            questionsCount: totalQuestions,
        });
        navigate("/results");
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || isThinking) return;

        setIsThinking(true);
        setIsRecording(false);

        if (activeSessionId) {
            try {
                await submitInterviewAnswer({
                    session_id: activeSessionId,
                    question_id: question.id || currentQuestion + 1,
                    answer_text: answer,
                    question: question.question,
                    skill: question.category,
                    difficulty: question.difficulty,
                });
            } catch (e) {
                console.error("Failed to evaluate answer via backend:", e);
            }
        }

        if (currentQuestion === totalQuestions - 1) {
            await finishInterviewSession();
            setIsThinking(false);
            return;
        }

        setCurrentQuestion((current) => current + 1);
        setAnswer("");
        setIsThinking(false);
    };


    const handleEndInterview = () => {
        if (isThinking) return;
        finishInterviewSession();
    };

    const toggleRecording = () => {
        if (isThinking) return;
        setIsRecording((current) => !current);
        if (!isRecording && !answer) {
            setAnswer("I would approach this by first analyzing the requirements...");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium tracking-wide text-gray-500">
                        LIVE INTERVIEW
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        AI Interview Room
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        {interviewConfig.role} · {interviewConfig.type} Interview ({interviewConfig.difficulty})
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Timer */}
                    <div
                        className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950 px-4 py-3"
                        aria-label={`Interview elapsed time ${formatTime(elapsedSeconds)}`}
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                        </span>
                        <span className="font-mono text-sm text-gray-300">
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleEndInterview}
                        disabled={isThinking}
                        className="rounded-xl border border-gray-800 bg-gray-950 px-5 py-3 text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        End Interview
                    </button>
                </div>
            </section>

            {/* Progress Bar */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">
                            Question {currentQuestion + 1} of {totalQuestions}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                            Keep going — you're making progress.
                        </p>
                    </div>
                    <span className="text-sm text-gray-500">
                        {Math.round(progress)}% complete
                    </span>
                </div>

                <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-gray-800"
                    role="progressbar"
                    aria-valuenow={currentQuestion + 1}
                    aria-valuemin={1}
                    aria-valuemax={totalQuestions}
                    aria-label="Interview progress"
                >
                    <div
                        className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </section>

            {/* Main Area */}
            <section className="grid gap-6 lg:grid-cols-3">
                {/* AI Avatar */}
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium tracking-wide text-gray-500">
                        AI INTERVIEWER
                    </p>

                    <div className="mt-6 flex flex-col items-center text-center">
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-gray-700 bg-black">
                            <div className="absolute inset-3 rounded-full border border-gray-800" />
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-black">
                                AI
                            </div>
                        </div>

                        <h2 className="mt-6 text-xl font-semibold">AI Interviewer</h2>
                        <p className="mt-2 text-sm text-gray-500">Adaptive Interviewer</p>

                        <div className="mt-6 w-full rounded-xl border border-gray-800 bg-black p-4 text-left">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
                                Current focus
                            </p>
                            <p className="mt-2 text-sm font-medium text-gray-300">
                                {question.category}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                                Difficulty · {question.difficulty}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                            AI interviewer is active
                        </div>
                    </div>
                </div>

                {/* Question & Answer Box */}
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 sm:p-8 lg:col-span-2">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm font-medium tracking-wide text-gray-500">
                                QUESTION {String(currentQuestion + 1).padStart(2, "0")}
                            </p>
                            <h2 className="mt-4 text-2xl font-semibold leading-relaxed text-white sm:text-3xl">
                                {question.question}
                            </h2>
                        </div>
                        <span className="w-fit shrink-0 rounded-full border border-gray-800 bg-black px-3 py-1.5 text-xs text-gray-500">
                            {question.category}
                        </span>
                    </div>

                    {/* AI Thinking Indicator */}
                    {isThinking && (
                        <div
                            className="mt-8 flex items-center gap-4 rounded-xl border border-gray-800 bg-black p-4"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex gap-1">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:150ms]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:300ms]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-300">
                                    AI is evaluating your response...
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                    Reviewing your reasoning and answer quality.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Answer TextArea */}
                    <div className="mt-8">
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <label htmlFor="answer" className="text-sm font-medium text-gray-300">
                                Your answer
                            </label>
                            <span className="text-xs text-gray-600">
                                {answer.length} characters
                            </span>
                        </div>

                        <textarea
                            id="answer"
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            disabled={isThinking}
                            rows={9}
                            placeholder="Take your time and explain your answer clearly..."
                            className="w-full resize-none rounded-2xl border border-gray-800 bg-black px-5 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <p className="mt-2 text-xs text-gray-600">
                            Tip: explain your thinking, mention trade-offs, and support your answer with examples.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex flex-col gap-4 border-t border-gray-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={toggleRecording}
                            disabled={isThinking}
                            className={`flex items-center justify-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium transition ${
                                isRecording
                                    ? "border-white bg-white text-black"
                                    : "border-gray-800 bg-black text-gray-400 hover:border-gray-600 hover:text-white"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                            <span
                                className={`h-3 w-3 rounded-full ${
                                    isRecording ? "animate-pulse bg-black" : "bg-white"
                                }`}
                            />
                            {isRecording ? "Stop Recording" : "Start Voice Recording"}
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmitAnswer}
                            disabled={!answer.trim() || isThinking}
                            className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isThinking
                                ? "Analyzing..."
                                : currentQuestion === totalQuestions - 1
                                ? "Finish Interview →"
                                : "Submit & Continue →"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Tip */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                        ✦
                    </div>
                    <div>
                        <p className="text-sm font-medium tracking-wide text-gray-500">INTERVIEW TIP</p>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{tip}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default InterviewRoom;