import { useRef, useState } from "react";
import { usePreparation } from "../hooks/usePreparation";
import { uploadResume, analyzeResume } from "../services/resumeApi";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

function Resume() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { profile, updateProfile, setActiveResumeId } = usePreparation();


    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");

    const handleFile = async (file: File) => {
        const validTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        const validExtension =
            file.name.toLowerCase().endsWith(".pdf") ||
            file.name.toLowerCase().endsWith(".docx");

        if (!validTypes.includes(file.type) && !validExtension) {
            setUploadMessage("Please upload a PDF or DOCX file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadMessage("File size must be less than 5 MB.");
            return;
        }

        setSelectedFile(file);
        setIsAnalyzing(true);
        setUploadMessage("Uploading resume to backend...");

        try {
            const uploadRes = await uploadResume(file);
            if (uploadRes.file_id) {
                setActiveResumeId(uploadRes.file_id);
            }
            setUploadMessage("Analyzing resume with Gemini AI...");
            const analyzeRes = await analyzeResume(uploadRes.file_id);

            if (analyzeRes.candidate_profile) {
                updateProfile(analyzeRes.candidate_profile);
                setUploadMessage("Resume uploaded and candidate profile extracted successfully!");
            } else {
                setUploadMessage("Resume uploaded, but profile analysis returned empty data.");
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Failed to parse resume.";
            setUploadMessage(`Error: ${errorMsg}`);
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadMessage("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section>
                <p className="text-sm font-medium text-gray-500">YOUR PROFESSIONAL PROFILE</p>
                <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Resume</h1>
                        <p className="mt-3 max-w-2xl text-gray-400">
                            Manage your resume and review the professional profile extracted by AI.
                        </p>
                    </div>
                    <Badge variant="success">✓ Resume analyzed</Badge>
                </div>
            </section>

            {/* Resume upload */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-lg font-semibold">Your Resume</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload a new version whenever you want to update your profile.
                        </p>
                    </div>

                    {selectedFile && (
                        <button
                            type="button"
                            onClick={removeFile}
                            className="w-fit text-sm text-gray-500 transition hover:text-white"
                        >
                            Remove
                        </button>
                    )}
                </div>

                {!selectedFile ? (
                    <div
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`mt-6 rounded-2xl border-2 border-dashed p-10 text-center transition ${
                            isDragging
                                ? "border-white bg-gray-900"
                                : "border-gray-800 bg-black hover:border-gray-600"
                        }`}
                    >
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-2xl">
                            📄
                        </div>
                        <h3 className="mt-5 font-semibold">Upload your latest resume</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Drag and drop your file here or choose it from your computer.
                        </p>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                        >
                            Choose Resume
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="mt-4 text-xs text-gray-600">PDF or DOCX · Maximum 5 MB</p>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-gray-800 bg-black p-5 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
                                📄
                            </div>
                            <div>
                                <p className="font-medium">{selectedFile.name}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <Badge variant={isAnalyzing ? "default" : "success"}>
                            {isAnalyzing ? "Analyzing..." : "Ready to analyze"}
                        </Badge>
                    </div>
                )}

                {uploadMessage && (
                    <p className="mt-4 text-sm text-gray-400">{uploadMessage}</p>
                )}
            </section>

            {/* Candidate profile */}
            {profile ? (
                <>
                    <section className="grid gap-6 lg:grid-cols-3">
                        {/* Profile card */}
                        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black">
                                {profile.name.charAt(0)}
                            </div>
                            <h2 className="mt-5 text-2xl font-semibold">{profile.name}</h2>
                            <p className="mt-2 text-sm text-gray-500">Software Developer</p>

                            <div className="mt-6 space-y-3 border-t border-gray-800 pt-6">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-600">Email</p>
                                    <p className="mt-1 break-all text-sm text-gray-300">{profile.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-600">Phone</p>
                                    <p className="mt-1 text-sm text-gray-300">{profile.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:col-span-2">
                            <p className="text-sm font-medium text-gray-500">PROFESSIONAL SUMMARY</p>
                            <h2 className="mt-2 text-xl font-semibold">About the candidate</h2>
                            <p className="mt-5 leading-7 text-gray-400">{profile.summary}</p>

                            <div className="mt-7 rounded-xl border border-gray-800 bg-black p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900">
                                        ✦
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">AI Profile Insight</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Strong full-stack and AI-oriented profile
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Skills */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <div>
                            <p className="text-sm font-medium text-gray-500">TECHNICAL PROFILE</p>
                            <h2 className="mt-2 text-xl font-semibold">Skills</h2>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {profile.skills.map((skill: string) => (
                                <Badge key={skill}>{skill}</Badge>
                            ))}
                        </div>
                    </section>

                    {/* Experience */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <div>
                            <p className="text-sm font-medium text-gray-500">WORK HISTORY</p>
                            <h2 className="mt-2 text-xl font-semibold">Experience</h2>
                        </div>
                        <div className="mt-7 space-y-8">
                            {profile.experience.map((experience: { role: string; company: string; duration: string; responsibilities: string[] }) => (
                                <div
                                    key={`${experience.role}-${experience.company}`}
                                    className="relative border-l border-gray-800 pl-6"
                                >
                                    <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-white" />
                                    <div className="flex flex-col justify-between gap-2 md:flex-row">
                                        <div>
                                            <h3 className="font-semibold">{experience.role}</h3>
                                            <p className="mt-1 text-sm text-gray-500">{experience.company}</p>
                                        </div>
                                        <span className="text-sm text-gray-600">{experience.duration}</span>
                                    </div>
                                    <ul className="mt-4 space-y-2">
                                        {experience.responsibilities.map((responsibility: string) => (
                                            <li key={responsibility} className="text-sm leading-6 text-gray-400">
                                                • {responsibility}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                        <div>
                            <p className="text-sm font-medium text-gray-500">PROJECT EXPERIENCE</p>
                            <h2 className="mt-2 text-xl font-semibold">Projects</h2>
                        </div>
                        <div className="mt-7 grid gap-5 md:grid-cols-2">
                            {profile.projects.map((project: { name: string; description: string; technologies: string[] }) => (
                                <div key={project.name} className="rounded-2xl border border-gray-800 bg-black p-5">
                                    <h3 className="font-semibold">{project.name}</h3>
                                    <p className="mt-3 text-sm leading-6 text-gray-500">{project.description}</p>
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {project.technologies.map((tech: string) => (
                                            <Badge key={tech}>{tech}</Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <EmptyState
                    title="No Profile Extracted"
                    description="Upload your resume above to generate a candidate profile."
                    actionLabel="Upload Resume"
                    onAction={() => fileInputRef.current?.click()}
                />
            )}
        </div>
    );
}

export default Resume;