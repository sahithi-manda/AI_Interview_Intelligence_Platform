import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreparation } from "../hooks/usePreparation";
import { analyzeMatchingApi } from "../services/interviewApi";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

function Matching() {
    const navigate = useNavigate();
    const { profile, targetJob, matchAnalysis, setMatchAnalysis, activeResumeId, activeJdId, setActiveMatchId } = usePreparation();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(true);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError("");

        try {
            const resumeIdNum = typeof activeResumeId === "number" ? activeResumeId : undefined;
            const res = await analyzeMatchingApi(
                resumeIdNum,
                activeJdId ? activeJdId : undefined,
            );

            if (res.match_result_id) {
                setActiveMatchId(res.match_result_id);
            }

            if (res.match_result) {
                const mr = res.match_result;
                setMatchAnalysis({
                    overallScore: Math.round(mr.overall_match || 0),
                    breakdown: {
                        technical: Math.round(mr.skills_match || 0),
                        experience: Math.round(mr.experience_match || 0),
                        projects: Math.round(mr.education_match || 0),
                        requirements: Math.round(mr.overall_match || 0),
                    },
                    matchedSkills: mr.matched_skills || [],
                    missingSkills: mr.missing_skills || [],
                    strengths: mr.strengths || [],
                    weaknesses: mr.weaknesses || mr.recommendations || [],
                });
            }

            setAnalyzed(true);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Matching analysis failed.";
            setError(errorMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-medium text-gray-500">RESUME + JOB ANALYSIS</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight">Job Match</h1>
                    <p className="mt-3 max-w-2xl text-gray-400">
                        Understand how closely your experience matches the target role and identify the skills you should improve.
                    </p>
                </div>
                {analyzed && (
                    <Badge variant="success">Match Score: {matchAnalysis.overallScore}%</Badge>
                )}
            </section>

            {/* Selected profile and role */}
            <section className="grid gap-5 lg:grid-cols-2">
                {/* Resume summary card */}
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium text-gray-500">YOUR PROFILE</p>
                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white font-bold text-black">
                            {profile.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-semibold">{profile.name}</h2>
                            <p className="mt-1 text-sm text-gray-500">Candidate Profile</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {profile.skills.slice(0, 6).map((skill: string) => (
                            <span
                                key={skill}
                                className="rounded-full border border-gray-800 bg-black px-3 py-1.5 text-xs text-gray-400"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/resume")}
                        className="mt-6 text-sm font-medium text-gray-400 transition hover:text-white"
                    >
                        Review resume →
                    </button>
                </div>

                {/* Job summary card */}
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <p className="text-sm font-medium text-gray-500">TARGET ROLE</p>
                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-xl">
                            💼
                        </div>
                        <div>
                            <h2 className="font-semibold">{targetJob.jobTitle}</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {targetJob.company || "Target Company"} · {targetJob.experience}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {targetJob.skills.slice(0, 6).map((skill: string) => (
                            <span
                                key={skill}
                                className="rounded-full border border-gray-800 bg-black px-3 py-1.5 text-xs text-gray-400"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/job-description")}
                        className="mt-6 text-sm font-medium text-gray-400 transition hover:text-white"
                    >
                        Review job description →
                    </button>
                </div>
            </section>

            {/* Analyze trigger */}
            <section className="flex flex-col justify-between gap-5 rounded-2xl border border-gray-800 bg-gray-950 p-6 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-gray-500">AI MATCH ANALYSIS</p>
                    <h2 className="mt-2 text-xl font-semibold">Compare your profile with this role</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        The analysis considers skills, experience, projects, and role requirements.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="shrink-0 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isAnalyzing ? "Analyzing Match..." : "Re-Analyze Match"}
                </button>
            </section>

            {error && (
                <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}


            {analyzed ? (
                <>
                    {/* Score section */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Circle Score */}
                            <div className="flex flex-col items-center justify-center border-b border-gray-800 pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                                <p className="text-sm font-medium text-gray-500">OVERALL MATCH</p>
                                <div className="mt-5 flex h-40 w-40 items-center justify-center rounded-full border-8 border-gray-800 bg-black">
                                    <div className="text-center">
                                        <p className="text-5xl font-bold">{matchAnalysis.overallScore}</p>
                                        <p className="mt-1 text-sm text-gray-500">/ 100</p>
                                    </div>
                                </div>
                                <p className="mt-5 text-lg font-semibold">
                                    {matchAnalysis.overallScore >= 80 ? "Strong Match" : "Moderate Match"}
                                </p>
                                <p className="mt-2 text-center text-sm text-gray-500">
                                    Your profile aligns well with this role.
                                </p>
                            </div>

                            {/* Breakdown */}
                            <div className="lg:col-span-2">
                                <h2 className="text-xl font-semibold">Match breakdown</h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    Here's how your profile performs across key areas.
                                </p>

                                <div className="mt-7 space-y-6">
                                    <div>
                                        <div className="mb-2 flex justify-between text-sm">
                                            <span>Technical Skills</span>
                                            <span className="text-gray-500">{matchAnalysis.breakdown.technical}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-800">
                                            <div
                                                className="h-2 rounded-full bg-white"
                                                style={{ width: `${matchAnalysis.breakdown.technical}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex justify-between text-sm">
                                            <span>Experience</span>
                                            <span className="text-gray-500">{matchAnalysis.breakdown.experience}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-800">
                                            <div
                                                className="h-2 rounded-full bg-white"
                                                style={{ width: `${matchAnalysis.breakdown.experience}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex justify-between text-sm">
                                            <span>Projects</span>
                                            <span className="text-gray-500">{matchAnalysis.breakdown.projects}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-800">
                                            <div
                                                className="h-2 rounded-full bg-white"
                                                style={{ width: `${matchAnalysis.breakdown.projects}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex justify-between text-sm">
                                            <span>Role Requirements</span>
                                            <span className="text-gray-500">{matchAnalysis.breakdown.requirements}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-800">
                                            <div
                                                className="h-2 rounded-full bg-white"
                                                style={{ width: `${matchAnalysis.breakdown.requirements}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Matched vs Missing Skills */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        {/* Matched */}
                        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                            <p className="text-sm font-medium text-gray-500">STRONG MATCHES</p>
                            <h2 className="mt-2 text-xl font-semibold">Skills you already have</h2>
                            <div className="mt-6 space-y-3">
                                {matchAnalysis.matchedSkills.map((skill: string) => (
                                    <div
                                        key={skill}
                                        className="flex items-center justify-between rounded-xl border border-gray-800 bg-black p-4"
                                    >
                                        <span className="text-sm text-gray-300">{skill}</span>
                                        <span className="text-sm text-gray-500">✓ Matched</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Missing */}
                        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                            <p className="text-sm font-medium text-gray-500">SKILL GAPS</p>
                            <h2 className="mt-2 text-xl font-semibold">Skills to strengthen</h2>
                            <div className="mt-6 space-y-3">
                                {matchAnalysis.missingSkills.map((skill: string) => (
                                    <div
                                        key={skill}
                                        className="flex items-center justify-between rounded-xl border border-gray-800 bg-black p-4"
                                    >
                                        <span className="text-sm text-gray-300">{skill}</span>
                                        <span className="text-sm text-gray-500">Gap</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Strengths + Weaknesses */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                            <p className="text-sm font-medium text-gray-500">STRENGTHS</p>
                            <h2 className="mt-2 text-xl font-semibold">Where you stand out</h2>
                            <div className="mt-6 space-y-3">
                                {matchAnalysis.strengths.map((strength: string) => (
                                    <div key={strength} className="rounded-xl border border-gray-800 bg-black p-4">
                                        <p className="text-sm leading-6 text-gray-400">✓ {strength}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                            <p className="text-sm font-medium text-gray-500">AREAS TO IMPROVE</p>
                            <h2 className="mt-2 text-xl font-semibold">Before the interview</h2>
                            <div className="mt-6 space-y-3">
                                {matchAnalysis.weaknesses.map((weakness: string) => (
                                    <div key={weakness} className="rounded-xl border border-gray-800 bg-black p-4">
                                        <p className="text-sm leading-6 text-gray-400">→ {weakness}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Recommendation & Actions */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                                ✦
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">AI RECOMMENDATION</p>
                                <h2 className="mt-2 text-xl font-semibold">You're ready to start practicing</h2>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                                    Your technical foundation is strong enough to begin interview preparation. Spend some time reviewing cloud technologies and distributed systems before targeting this role.
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => navigate("/interview")}
                                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                            >
                                Start Interview →
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
                </>
            ) : (
                <EmptyState
                    title="No Match Analysis Available"
                    description="Run the match analysis above to compare your resume skills against the target job description."
                    actionLabel="Run Analysis"
                    onAction={handleAnalyze}
                />
            )}
        </div>
    );
}

export default Matching;