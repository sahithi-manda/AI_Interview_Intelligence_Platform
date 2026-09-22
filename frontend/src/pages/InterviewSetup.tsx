import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreparation } from "../context/PreparationContext";
import { createInterviewSessionApi, generateQuestionsApi, analyzeMatchingApi } from "../services/interviewApi";
import Badge from "../components/ui/Badge";

function InterviewSetup() {
    const navigate = useNavigate();
    const {
        targetJob,
        interviewConfig,
        updateInterviewConfig,
        activeResumeId,
        activeJdId,
        activeMatchId,
        setActiveSessionId,
    } = usePreparation();

    const [role, setRole] = useState(targetJob.jobTitle || interviewConfig.role);
    const [interviewType, setInterviewType] = useState(interviewConfig.type);
    const [difficulty, setDifficulty] = useState(interviewConfig.difficulty);
    const [duration, setDuration] = useState(interviewConfig.duration);
    const [questionCount, setQuestionCount] = useState(interviewConfig.questionCount);
    const [focusAreas, setFocusAreas] = useState<string[]>(interviewConfig.focusAreas);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");

    const toggleFocusArea = (area: string) => {
        setFocusAreas((current) =>
            current.includes(area)
                ? current.filter((item) => item !== area)
                : [...current, area],
        );
    };

    const handleStartInterview = async () => {
        setIsCreating(true);
        setError("");

        updateInterviewConfig({
            role,
            type: interviewType,
            difficulty,
            duration,
            questionCount,
            focusAreas,
        });

        try {
            let resId = typeof activeResumeId === "number" ? activeResumeId : undefined;
            let jdId = activeJdId || undefined;
            let matchId = activeMatchId || undefined;

            if (!matchId || !resId || !jdId) {
                const matchRes = await analyzeMatchingApi(resId, jdId);
                if (matchRes) {
                    resId = matchRes.resume_id;
                    jdId = matchRes.job_description_id;
                    matchId = matchRes.match_result_id;
                }
            }

            if (resId && jdId && matchId) {
                const sessionRes = await createInterviewSessionApi({
                    resume_id: resId,
                    job_description_id: jdId,
                    match_result_id: matchId,
                    interview_type: interviewType.toLowerCase(),
                });
                if (sessionRes.session_id) {
                    setActiveSessionId(sessionRes.session_id);
                    await generateQuestionsApi(sessionRes.session_id);
                }
            }
            navigate("/interview/room");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to create session";
            setError(msg);
            navigate("/interview/room");
        } finally {
            setIsCreating(false);
        }
    };


    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-medium text-gray-500">INTERVIEW PREPARATION</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight">Interview Setup</h1>
                    <p className="mt-3 max-w-2xl text-gray-400">
                        Configure your mock interview. The AI interviewer will adapt the session based on your profile and selected role.
                    </p>
                </div>
                <Badge variant="success">Candidate & Job Profile Connected</Badge>
            </section>

            {/* Target role */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <p className="text-sm font-medium text-gray-500">TARGET ROLE</p>
                <h2 className="mt-2 text-xl font-semibold">What are you preparing for?</h2>

                <div className="mt-6">
                    <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-300">
                        Role Title
                    </label>
                    <input
                        id="role"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-500"
                        placeholder="e.g. Software Engineer"
                    />
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-gray-800 bg-black p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
                        ✓
                    </div>
                    <div>
                        <p className="text-sm font-medium">Resume and job profile connected</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Questions will be personalized using your candidate data.
                        </p>
                    </div>
                </div>
            </section>

            {/* Interview type */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">INTERVIEW TYPE</p>
                    <h2 className="mt-2 text-xl font-semibold">Choose your interview style</h2>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            title: "Technical",
                            description: "Technical concepts and coding logic",
                            icon: "⌘",
                        },
                        {
                            title: "Behavioral",
                            description: "Experience and situational questions",
                            icon: "◉",
                        },
                        {
                            title: "System Design",
                            description: "Architecture and scalability",
                            icon: "◇",
                        },
                        {
                            title: "Mixed",
                            description: "A complete interview simulation",
                            icon: "✦",
                        },
                    ].map((item) => {
                        const selected = interviewType === item.title;
                        return (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => setInterviewType(item.title)}
                                className={`rounded-2xl border p-5 text-left transition ${
                                    selected
                                        ? "border-white bg-white text-black"
                                        : "border-gray-800 bg-black text-white hover:border-gray-600"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xl">{item.icon}</span>
                                    {selected && <span className="text-sm">✓</span>}
                                </div>
                                <h3 className="mt-5 font-semibold">{item.title}</h3>
                                <p className={`mt-2 text-sm leading-5 ${selected ? "text-gray-600" : "text-gray-500"}`}>
                                    {item.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Difficulty */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <p className="text-sm font-medium text-gray-500">DIFFICULTY</p>
                <h2 className="mt-2 text-xl font-semibold">How challenging should it be?</h2>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {[
                        {
                            title: "Easy",
                            description: "Fundamentals and confidence building",
                        },
                        {
                            title: "Medium",
                            description: "Real-world interview difficulty",
                        },
                        {
                            title: "Hard",
                            description: "Challenging senior-level questions",
                        },
                    ].map((item) => {
                        const selected = difficulty === item.title;
                        return (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => setDifficulty(item.title)}
                                className={`rounded-2xl border p-5 text-left transition ${
                                    selected
                                        ? "border-white bg-white text-black"
                                        : "border-gray-800 bg-black hover:border-gray-600"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    {selected && <span>✓</span>}
                                </div>
                                <p className={`mt-2 text-sm ${selected ? "text-gray-600" : "text-gray-500"}`}>
                                    {item.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Duration and Questions */}
            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium text-gray-500">DURATION</p>
                    <h2 className="mt-2 text-xl font-semibold">How long do you want to practice?</h2>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {["15 minutes", "30 minutes", "45 minutes"].map((item) => {
                            const selected = duration === item;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setDuration(item)}
                                    className={`rounded-xl border px-3 py-3 text-sm transition ${
                                        selected
                                            ? "border-white bg-white font-semibold text-black"
                                            : "border-gray-800 bg-black text-gray-400 hover:border-gray-600"
                                    }`}
                                >
                                    {item.replace(" minutes", " min")}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium text-gray-500">QUESTIONS</p>
                    <h2 className="mt-2 text-xl font-semibold">Number of questions</h2>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {["5", "10", "15"].map((item) => {
                            const selected = questionCount === item;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setQuestionCount(item)}
                                    className={`rounded-xl border px-3 py-3 text-sm transition ${
                                        selected
                                            ? "border-white bg-white font-semibold text-black"
                                            : "border-gray-800 bg-black text-gray-400 hover:border-gray-600"
                                    }`}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Focus areas */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <p className="text-sm font-medium text-gray-500">FOCUS AREAS</p>
                <h2 className="mt-2 text-xl font-semibold">What should the interviewer focus on?</h2>
                <p className="mt-2 text-sm text-gray-500">Select one or more areas.</p>

                <div className="mt-6 flex flex-wrap gap-3">
                    {["Technical", "Problem Solving", "Behavioral", "Communication", "System Design", "Projects"].map((area) => {
                        const selected = focusAreas.includes(area);
                        return (
                            <button
                                key={area}
                                type="button"
                                onClick={() => toggleFocusArea(area)}
                                className={`rounded-full border px-4 py-2 text-sm transition ${
                                    selected
                                        ? "border-white bg-white text-black"
                                        : "border-gray-800 bg-black text-gray-400 hover:border-gray-600"
                                }`}
                            >
                                {selected ? "✓ " : ""}
                                {area}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Session Summary & Action */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <p className="text-sm font-medium text-gray-500">SESSION SUMMARY</p>
                <h2 className="mt-2 text-xl font-semibold">Your interview configuration</h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-800 bg-black p-4">
                        <p className="text-xs text-gray-600">TYPE</p>
                        <p className="mt-2 text-sm font-medium">{interviewType}</p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-black p-4">
                        <p className="text-xs text-gray-600">DIFFICULTY</p>
                        <p className="mt-2 text-sm font-medium">{difficulty}</p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-black p-4">
                        <p className="text-xs text-gray-600">DURATION</p>
                        <p className="mt-2 text-sm font-medium">{duration}</p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-black p-4">
                        <p className="text-xs text-gray-600">QUESTIONS</p>
                        <p className="mt-2 text-sm font-medium">{questionCount}</p>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex flex-col justify-between gap-5 border-t border-gray-800 pt-7 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium">Ready when you are.</p>
                        <p className="mt-1 text-sm text-gray-500">
                            The AI interviewer will adapt questions based on your responses.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleStartInterview}
                        disabled={focusAreas.length === 0 || isCreating}
                        className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isCreating ? "Starting Session..." : "Start Interview →"}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default InterviewSetup;