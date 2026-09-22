import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreparation } from "../hooks/usePreparation";
import { analyzeJdApi } from "../services/interviewApi";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

function JobDescription() {
    const navigate = useNavigate();
    const { targetJob, updateTargetJob, setActiveJdId } = usePreparation();

    const [jobTitle, setJobTitle] = useState(targetJob.jobTitle);
    const [company, setCompany] = useState(targetJob.company);
    const [experience, setExperience] = useState(targetJob.experience);
    const [description, setDescription] = useState(targetJob.description);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(targetJob.analyzed);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        if (!description.trim()) {
            setError("Please fill in the job description text.");
            return;
        }

        setError("");
        setIsAnalyzing(true);
        setAnalyzed(false);

        try {
            const res = await analyzeJdApi(description);
            if (res.job_description_id) {
                setActiveJdId(res.job_description_id);
            }

            const analysis = res.analysis || {};
            const extractedSkills = [
                ...(analysis.required_skills || []),
                ...(analysis.preferred_skills || []),
            ];

            const updatedTitle = analysis.job_title || jobTitle || "Target Position";
            const updatedCompany = analysis.company || company || "Target Company";
            const updatedExp = analysis.experience_required || experience || "Not specified";

            setJobTitle(updatedTitle);
            setCompany(updatedCompany);
            setExperience(updatedExp);

            updateTargetJob({
                jobTitle: updatedTitle,
                company: updatedCompany,
                experience: updatedExp,
                description,
                skills: extractedSkills.length > 0 ? extractedSkills : ["React", "TypeScript", "Python", "FastAPI"],
                analyzed: true,
            });

            setAnalyzed(true);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Job description analysis failed.";
            setError(errorMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleClear = () => {
        setJobTitle("");
        setCompany("");
        setExperience("0–2 years");
        setDescription("");
        setAnalyzed(false);
        setError("");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-medium text-gray-500">TARGET ROLE</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight">Job Description</h1>
                    <p className="mt-3 max-w-2xl text-gray-400">
                        Add a job description to understand what the role requires and compare it with your professional profile.
                    </p>
                </div>
                {analyzed && (
                    <Badge variant="success">✓ Job description analyzed</Badge>
                )}
            </section>

            {/* Job details */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">ROLE DETAILS</p>
                        <h2 className="mt-2 text-xl font-semibold">Tell us about the opportunity</h2>
                    </div>
                    {description && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs text-gray-500 hover:text-white"
                        >
                            Clear Form
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                    <div>
                        <label htmlFor="jobTitle" className="mb-2 block text-sm font-medium text-gray-300">
                            Job Title
                        </label>
                        <input
                            id="jobTitle"
                            value={jobTitle}
                            onChange={(event) => setJobTitle(event.target.value)}
                            placeholder="e.g. Senior Full Stack Developer"
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="company" className="mb-2 block text-sm font-medium text-gray-300">
                            Company
                        </label>
                        <input
                            id="company"
                            value={company}
                            onChange={(event) => setCompany(event.target.value)}
                            placeholder="e.g. TechNova"
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="experience" className="mb-2 block text-sm font-medium text-gray-300">
                            Experience Required
                        </label>
                        <select
                            id="experience"
                            value={experience}
                            onChange={(event) => setExperience(event.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition focus:border-gray-500"
                        >
                            <option>0–2 years</option>
                            <option>2–4 years</option>
                            <option>4–6 years</option>
                            <option>6+ years</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <div className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3">
                            <p className="text-xs uppercase tracking-wider text-gray-600">Analysis status</p>
                            <p className="mt-1 text-sm text-gray-300">
                                {analyzed ? "✓ Job description analyzed" : "Ready to analyze"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-300">
                        Job Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={8}
                        placeholder="Paste the complete job description here..."
                        className="w-full resize-y rounded-xl border border-gray-800 bg-black px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-500"
                    />
                    <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <span>Paste the complete job posting for better analysis.</span>
                        <span>{description.length} characters</span>
                    </div>
                </div>

                {/* Analyze Action */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isAnalyzing ? "Analyzing with AI..." : "Analyze Job Description"}
                    </button>
                </div>
            </section>

            {/* Analysis Output */}
            {analyzed ? (
                <>
                    {/* Overview */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">AI JOB ANALYSIS</p>
                                <h2 className="mt-2 text-2xl font-semibold">{targetJob.jobTitle}</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {targetJob.company || "Target Company"} · {targetJob.experience}
                                </p>
                            </div>
                            <div className="rounded-full border border-gray-800 px-4 py-2 text-sm text-gray-400">
                                AI analyzed
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-gray-800 bg-black p-5">
                                <p className="text-sm text-gray-500">Technical Focus</p>
                                <p className="mt-3 text-2xl font-bold">High</p>
                                <p className="mt-1 text-xs text-gray-600">Strong engineering requirements</p>
                            </div>
                            <div className="rounded-xl border border-gray-800 bg-black p-5">
                                <p className="text-sm text-gray-500">Experience</p>
                                <p className="mt-3 text-2xl font-bold">{targetJob.experience}</p>
                                <p className="mt-1 text-xs text-gray-600">Expected experience level</p>
                            </div>
                            <div className="rounded-xl border border-gray-800 bg-black p-5">
                                <p className="text-sm text-gray-500">Skills Identified</p>
                                <p className="mt-3 text-2xl font-bold">{targetJob.skills.length}</p>
                                <p className="mt-1 text-xs text-gray-600">Technical skills detected</p>
                            </div>
                            <div className="rounded-xl border border-gray-800 bg-black p-5">
                                <p className="text-sm text-gray-500">Interview Focus</p>
                                <p className="mt-3 text-2xl font-bold">Full Stack</p>
                                <p className="mt-1 text-xs text-gray-600">Likely interview direction</p>
                            </div>
                        </div>
                    </section>

                    {/* Skills */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <p className="text-sm font-medium text-gray-500">REQUIREMENTS</p>
                        <h2 className="mt-2 text-xl font-semibold">Skills detected from the job</h2>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {targetJob.skills.map((skill: string) => (
                                <span
                                    key={skill}
                                    className="rounded-full border border-gray-800 bg-black px-4 py-2 text-sm text-gray-300"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Progression to Job Match */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500">NEXT STEP</p>
                                <h2 className="mt-2 text-xl font-semibold">Compare this role with your resume</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                    See which skills you already have, where your experience matches, and what gaps you should work on before the interview.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/matching")}
                                className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                            >
                                Compare Resume →
                            </button>
                        </div>
                    </section>
                </>
            ) : (
                <EmptyState
                    title="No Job Analysis Available"
                    description="Paste a job description above and click 'Analyze Job Description' to extract role details, technical skills, and interview focus areas."
                    actionLabel="Paste Sample Job"
                    onAction={() => {
                        setJobTitle("Senior Full Stack Developer");
                        setCompany("TechNova");
                        setExperience("2–4 years");
                        setDescription(
                            "We are looking for a Full Stack Developer to build scalable web applications using React, TypeScript, Python, FastAPI, REST APIs, SQL, Docker, and Kubernetes.",
                        );
                    }}
                />
            )}
        </div>
    );
}

export default JobDescription;