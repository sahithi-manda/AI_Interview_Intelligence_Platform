import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePreparation } from "../hooks/usePreparation";
import type { CompletedInterview } from "../context/PreparationContextDefinition";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";

function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { matchAnalysis, interviewHistory } = usePreparation();

    const userName = user?.name || "Candidate";

    const stats = [
        {
            label: "Interviews",
            value: String(interviewHistory.length),
            description: "Practice sessions",
        },
        {
            label: "Average Score",
            value: `${Math.round(
                interviewHistory.reduce((acc: number, curr: CompletedInterview) => acc + curr.score, 0) /
                    Math.max(interviewHistory.length, 1),
            )}%`,
            description: "Across interviews",
        },
        {
            label: "Skills Matched",
            value: String(matchAnalysis.matchedSkills.length),
            description: "Against target role",
        },
        {
            label: "Skill Gaps",
            value: String(matchAnalysis.missingSkills.length),
            description: "Areas to improve",
        },
    ];

    const performance = [
        { label: "Technical", value: matchAnalysis.breakdown.technical },
        { label: "Problem Solving", value: matchAnalysis.breakdown.projects },
        { label: "Communication", value: matchAnalysis.breakdown.requirements },
        { label: "Behavioral", value: 81 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-medium text-gray-500">DASHBOARD</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight">
                        Welcome back, {userName.split(" ")[0]} 👋
                    </h1>
                    <p className="mt-3 max-w-2xl text-gray-400">
                        Track your interview preparation, identify skill gaps, and improve your readiness with AI-powered insights.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={logout}
                    className="w-fit rounded-xl border border-gray-800 bg-gray-950 px-5 py-3 text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white"
                >
                    Sign Out
                </button>
            </section>

            {/* Readiness */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500">INTERVIEW READINESS</p>
                        <h2 className="mt-2 text-2xl font-semibold">You're making strong progress</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                            Your current preparation level is based on interview performance, skill coverage, and recent practice.
                        </p>
                    </div>

                    <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border border-gray-700 bg-black">
                        <span className="text-3xl font-bold">{matchAnalysis.overallScore}%</span>
                        <span className="mt-1 text-xs text-gray-600">Ready</span>
                    </div>
                </div>

                <div className="mt-7">
                    <ProgressBar value={matchAnalysis.overallScore} showLabel label="Overall readiness" />
                </div>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                        <p className="mt-2 text-xs text-gray-600">{stat.description}</p>
                    </div>
                ))}
            </section>

            {/* Performance + AI Recommendation */}
            <section className="grid gap-6 lg:grid-cols-3">
                {/* Performance */}
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">PERFORMANCE</p>
                            <h2 className="mt-2 text-xl font-semibold">Skill performance</h2>
                        </div>
                        <Badge variant="success">Strong</Badge>
                    </div>

                    <div className="mt-7 space-y-6">
                        {performance.map((item) => (
                            <ProgressBar key={item.label} value={item.value} showLabel label={item.label} />
                        ))}
                    </div>
                </div>

                {/* AI Recommendation */}
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium text-gray-500">AI RECOMMENDATION</p>
                    <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
                        ✦
                    </div>
                    <h2 className="mt-5 text-xl font-semibold">Focus on system design</h2>
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        Your technical fundamentals are strong. Improving system design depth could have the biggest impact on your overall interview readiness.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/roadmap")}
                        className="mt-6 rounded-xl border border-gray-800 px-5 py-3 text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white"
                    >
                        View Roadmap →
                    </button>
                </div>
            </section>

            {/* Recent Interviews */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500">ACTIVITY</p>
                        <h2 className="mt-2 text-xl font-semibold">Recent interviews</h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/analytics")}
                        className="w-fit text-sm font-medium text-gray-400 transition hover:text-white"
                    >
                        View analytics →
                    </button>
                </div>

                <div className="mt-6 divide-y divide-gray-800">
                    {interviewHistory.map((interview: CompletedInterview) => (
                        <div
                            key={interview.id}
                            className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="font-medium">{interview.role}</p>
                                    <Badge>{interview.type}</Badge>
                                </div>
                                <p className="mt-2 text-xs text-gray-600">{interview.date}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">Score</span>
                                <span className="text-xl font-bold">{interview.score}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <div>
                    <p className="text-sm font-medium text-gray-500">QUICK ACTIONS</p>
                    <h2 className="mt-2 text-xl font-semibold">Continue preparing</h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                        type="button"
                        onClick={() => navigate("/resume")}
                        className="rounded-2xl border border-gray-800 bg-gray-950 p-6 text-left transition hover:border-gray-600 hover:bg-gray-900"
                    >
                        <span className="text-xl">▤</span>
                        <p className="mt-5 font-semibold">Update Resume</p>
                        <p className="mt-2 text-sm text-gray-600">Improve your candidate profile.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/matching")}
                        className="rounded-2xl border border-gray-800 bg-gray-950 p-6 text-left transition hover:border-gray-600 hover:bg-gray-900"
                    >
                        <span className="text-xl">◈</span>
                        <p className="mt-5 font-semibold">Check Job Match</p>
                        <p className="mt-2 text-sm text-gray-600">Compare your skills with a role.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/interview")}
                        className="rounded-2xl border border-gray-800 bg-gray-950 p-6 text-left transition hover:border-gray-600 hover:bg-gray-900"
                    >
                        <span className="text-xl">◉</span>
                        <p className="mt-5 font-semibold">Start Interview</p>
                        <p className="mt-2 text-sm text-gray-600">Practice with your AI interviewer.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/roadmap")}
                        className="rounded-2xl border border-gray-800 bg-gray-950 p-6 text-left transition hover:border-gray-600 hover:bg-gray-900"
                    >
                        <span className="text-xl">→</span>
                        <p className="mt-5 font-semibold">View Roadmap</p>
                        <p className="mt-2 text-sm text-gray-600">Work on your highest-priority gaps.</p>
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;