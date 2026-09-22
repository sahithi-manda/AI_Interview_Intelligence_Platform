import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { usePreparation } from "../context/PreparationContext";
import type { CompletedInterview } from "../context/PreparationContextDefinition";
import EmptyState from "../components/ui/EmptyState";

function Analytics() {
    const navigate = useNavigate();
    const { interviewHistory, matchAnalysis } = usePreparation();

    const scoreHistory = interviewHistory.length > 0
        ? interviewHistory.map((item: CompletedInterview, idx: number) => ({
              interview: `Session ${interviewHistory.length - idx}`,
              score: item.score,
          })).reverse()
        : [
              { interview: "Interview 1", score: 68 },
              { interview: "Interview 2", score: 72 },
              { interview: "Interview 3", score: 76 },
              { interview: "Interview 4", score: 79 },
              { interview: "Interview 5", score: 82 },
              { interview: "Interview 6", score: 84 },
          ];

    const avgScore = Math.round(
        scoreHistory.reduce((acc: number, curr: { score: number }) => acc + curr.score, 0) / Math.max(scoreHistory.length, 1),
    );

    const skillPerformance = [
        { skill: "Technical Skills", score: matchAnalysis.breakdown.technical },
        { skill: "Problem Solving", score: matchAnalysis.breakdown.projects },
        { skill: "Communication", score: matchAnalysis.breakdown.requirements },
        { skill: "Confidence", score: 81 },
        { skill: "System Design", score: 69 },
        { skill: "Behavioral", score: 74 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-medium text-gray-500">PERFORMANCE INSIGHTS</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight">Analytics</h1>
                    <p className="mt-3 max-w-2xl text-gray-400">
                        Track your interview performance, understand your strengths, and identify the areas that need more preparation.
                    </p>
                </div>
            </section>

            {/* Overview cards */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm text-gray-500">Overall Readiness</p>
                    <p className="mt-3 text-4xl font-bold">{matchAnalysis.overallScore}%</p>
                    <p className="mt-2 text-xs text-gray-500">+16% since your first interview</p>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm text-gray-500">Average Score</p>
                    <p className="mt-3 text-4xl font-bold">{avgScore}%</p>
                    <p className="mt-2 text-xs text-gray-500">Across {scoreHistory.length} interviews</p>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm text-gray-500">Interviews Completed</p>
                    <p className="mt-3 text-4xl font-bold">{scoreHistory.length}</p>
                    <p className="mt-2 text-xs text-gray-500">Recent practice sessions</p>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm text-gray-500">Strongest Area</p>
                    <p className="mt-3 text-2xl font-bold">Technical</p>
                    <p className="mt-2 text-xs text-gray-500">Current score · {matchAnalysis.breakdown.technical}%</p>
                </div>
            </section>

            {/* Score trend */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-500">PERFORMANCE TREND</p>
                        <h2 className="mt-2 text-xl font-semibold">Interview score progression</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Your performance has consistently improved across recent interview sessions.
                        </p>
                    </div>
                    <div className="rounded-full border border-gray-800 bg-black px-4 py-2 text-sm text-gray-400">
                        +16% improvement
                    </div>
                </div>

                <div className="mt-8 h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scoreHistory}>
                            <XAxis
                                dataKey="interview"
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[50, 100]}
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#030712",
                                    border: "1px solid #1f2937",
                                    borderRadius: "12px",
                                    color: "#ffffff",
                                }}
                                labelStyle={{ color: "#9ca3af" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#ffffff"
                                strokeWidth={3}
                                dot={{ r: 5, fill: "#ffffff" }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Skill performance */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">SKILL PERFORMANCE</p>
                    <h2 className="mt-2 text-xl font-semibold">Performance by skill</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Understand which interview areas are strongest and which need more preparation.
                    </p>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                    {skillPerformance.map((item) => (
                        <div key={item.skill} className="rounded-2xl border border-gray-800 bg-black p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{item.skill}</span>
                                <span className="text-sm font-semibold">{item.score}%</span>
                            </div>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-800">
                                <div
                                    className="h-full rounded-full bg-white transition-all"
                                    style={{ width: `${item.score}%` }}
                                />
                            </div>
                            <p className="mt-3 text-xs text-gray-600">
                                {item.score >= 85
                                    ? "Strong performance"
                                    : item.score >= 75
                                    ? "Good performance"
                                    : "Needs more practice"}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent interviews */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">INTERVIEW HISTORY</p>
                        <h2 className="mt-2 text-xl font-semibold">Recent interviews</h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/results")}
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        View latest →
                    </button>
                </div>

                {interviewHistory.length > 0 ? (
                    <div className="mt-6 divide-y divide-gray-800">
                        {interviewHistory.map((interview: CompletedInterview) => (
                            <div
                                key={interview.id}
                                className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                            >
                                <div>
                                    <p className="text-sm font-medium">{interview.role}</p>
                                    <p className="mt-1 text-xs text-gray-600">
                                        {interview.type} · {interview.date}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden w-32 sm:block">
                                        <div className="h-2 rounded-full bg-gray-800">
                                            <div
                                                className="h-2 rounded-full bg-white"
                                                style={{ width: `${interview.score}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="rounded-full border border-gray-800 px-4 py-2 text-sm font-semibold">
                                        {interview.score}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Interview History Yet"
                        description="Complete your first practice interview to begin recording analytics and score trends."
                        actionLabel="Start First Interview"
                        onAction={() => navigate("/interview")}
                    />
                )}
            </section>

            {/* AI Insights & Actions */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                        ✦
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">AI PERFORMANCE INSIGHT</p>
                        <h2 className="mt-2 text-xl font-semibold">You're improving consistently</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                            Your interview score has increased steadily across your recent sessions. Your strongest area is technical knowledge, while system design and communication remain the biggest opportunities for improvement.
                        </p>
                    </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => navigate("/interview")}
                        className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                    >
                        Practice Again →
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/roadmap")}
                        className="rounded-xl border border-gray-800 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
                    >
                        View Skill Roadmap
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Analytics;