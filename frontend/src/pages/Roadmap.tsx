import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreparation } from "../hooks/usePreparation";
import type { RoadmapStage } from "../context/PreparationContextDefinition";
import { getRoadmap, type UserRoadmapResponse, type SkillGapItem } from "../services/roadmapApi";
import Badge from "../components/ui/Badge";

function Roadmap() {
    const navigate = useNavigate();
    const { targetJob, matchAnalysis, roadmapStages, toggleRoadmapStage, activeSessionId } = usePreparation();

    const [aiRoadmap, setAiRoadmap] = useState<UserRoadmapResponse | null>(null);

    useEffect(() => {
        if (activeSessionId) {
            getRoadmap(activeSessionId)
                .then((res) => {
                    if (res) {
                        setAiRoadmap(res);
                    }
                })
                .catch((err) => console.error("Could not fetch roadmap:", err));
        }
    }, [activeSessionId]);

    const completedStages = roadmapStages.filter((s: RoadmapStage) => s.status === "Completed").length;
    const roadmapProgress = Math.round((completedStages / roadmapStages.length) * 100);

    const defaultSkillGaps: SkillGapItem[] = [
        {
            id: "gap-1",
            name: "Kubernetes",
            priority: "High",
            current_score: 42,
            target_score: 85,
            score: 42,
            description: "Learn container orchestration, deployments, services, and scaling.",
        },
        {
            id: "gap-2",
            name: "AWS",
            priority: "High",
            current_score: 48,
            target_score: 85,
            score: 48,
            description: "Focus on core cloud services, deployment, storage, and networking.",
        },
        {
            id: "gap-3",
            name: "System Design",
            priority: "High",
            current_score: 69,
            target_score: 85,
            score: 69,
            description: "Practice designing scalable and reliable distributed systems.",
        },
        {
            id: "gap-4",
            name: "Redis",
            priority: "Medium",
            current_score: 55,
            target_score: 80,
            score: 55,
            description: "Understand caching, sessions, queues, and fast key-value storage.",
        },
    ];

    const skillGaps: SkillGapItem[] = aiRoadmap?.skill_gaps?.length
        ? aiRoadmap.skill_gaps
        : defaultSkillGaps;

    const getStatusStyle = (status: "Completed" | "In Progress" | "Upcoming") => {
        if (status === "Completed") return "border-white bg-white text-black";
        if (status === "In Progress") return "border-gray-600 bg-gray-900 text-white";
        return "border-gray-800 bg-black text-gray-500";
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section>
                <p className="text-sm font-medium text-gray-500">PERSONALIZED PREPARATION</p>
                <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Career Roadmap</h1>
                        <p className="mt-3 max-w-2xl text-gray-400">
                            Follow your personalized preparation plan and focus on the skills that will have the biggest impact on your interview readiness.
                        </p>
                    </div>
                    <Badge variant="default">{targetJob.jobTitle || "Senior Full Stack Developer"}</Badge>
                </div>
            </section>

            {/* Readiness overview */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Circle readiness */}
                    <div className="flex items-center gap-6 border-b border-gray-800 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-gray-800 bg-black">
                            <div className="text-center">
                                <p className="text-3xl font-bold">{matchAnalysis.overallScore}%</p>
                                <p className="mt-1 text-xs text-gray-600">Ready</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">CURRENT READINESS</p>
                            <h2 className="mt-2 text-xl font-semibold">Strong Progress</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                You're making good progress toward your target role.
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ROADMAP PROGRESS</p>
                                <h2 className="mt-2 text-xl font-semibold">
                                    {completedStages} of {roadmapStages.length} weeks completed
                                </h2>
                            </div>
                            <span className="text-2xl font-bold">{roadmapProgress}%</span>
                        </div>

                        <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-800">
                            <div
                                className="h-full rounded-full bg-white transition-all duration-500"
                                style={{ width: `${roadmapProgress}%` }}
                            />
                        </div>

                        <div className="mt-4 flex justify-between text-xs text-gray-600">
                            <span>Started</span>
                            <span>Target: Interview Ready</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Priority skill gaps */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">PRIORITY SKILL GAPS</p>
                    <h2 className="mt-2 text-xl font-semibold">Focus on what matters most</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        These areas currently have the biggest impact on your target-role readiness.
                    </p>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                    {skillGaps.map((skill: SkillGapItem) => {
                        const score = skill.current_score ?? skill.score ?? 0;
                        return (
                            <div key={skill.name} className="rounded-2xl border border-gray-800 bg-black p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">{skill.name}</h3>
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs ${
                                                    skill.priority === "High"
                                                        ? "border-gray-600 text-white"
                                                        : "border-gray-800 text-gray-500"
                                                }`}
                                            >
                                                {skill.priority}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-gray-500">{skill.description}</p>
                                    </div>
                                    <span className="text-xl font-bold">{score}%</span>
                                </div>

                                <div className="mt-5 h-2 rounded-full bg-gray-800">
                                    <div
                                        className="h-2 rounded-full bg-white"
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Weekly roadmap items */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">LEARNING PLAN</p>
                    <h2 className="mt-2 text-xl font-semibold">Your preparation roadmap</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Complete each stage to gradually improve your interview readiness.
                    </p>
                </div>

                <div className="mt-8 space-y-5">
                    {roadmapStages.map((item: RoadmapStage, index: number) => (
                        <div key={item.week} className="rounded-2xl border border-gray-800 bg-black p-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                                <div className="flex items-center gap-4 lg:w-28 lg:shrink-0 lg:flex-col lg:items-start">
                                    <span
                                        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${getStatusStyle(
                                            item.status,
                                        )}`}
                                    >
                                        {item.week}
                                    </span>
                                    <span className="text-xs text-gray-600">{item.status}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                        <div>
                                            <h3 className="text-lg font-semibold">{item.title}</h3>
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                                {item.description}
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold">{item.progress}%</span>
                                    </div>

                                    <div className="mt-5 h-2 rounded-full bg-gray-800">
                                        <div
                                            className="h-2 rounded-full bg-white transition-all duration-300"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {item.skills.map((skill: string) => (
                                            <span
                                                key={skill}
                                                className="rounded-full border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-500"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-5 flex flex-col justify-between gap-4 border-t border-gray-800 pt-5 sm:flex-row sm:items-center">
                                        <p className="text-xs text-gray-600">
                                            {item.status === "Completed"
                                                ? "This stage is complete."
                                                : item.status === "In Progress"
                                                ? "Keep practicing to complete this stage."
                                                : "Start this stage when you're ready."}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => toggleRoadmapStage(index)}
                                            className="w-fit rounded-xl border border-gray-800 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
                                        >
                                            {item.status === "Completed"
                                                ? "Mark In Progress"
                                                : item.status === "In Progress"
                                                ? "Mark Complete"
                                                : "Start Week"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Practice & Actions */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500">KEEP PREPARING</p>
                        <h2 className="mt-2 text-xl font-semibold">Continue your interview journey</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Review your performance or practice another interview.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate("/analytics")}
                            className="rounded-xl border border-gray-800 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
                        >
                            View Analytics
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/interview")}
                            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                        >
                            Practice Interview →
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Roadmap;