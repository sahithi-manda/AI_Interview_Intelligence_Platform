/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import type {
    CandidateProfile,
    CompletedInterview,
    InterviewConfig,
    MatchAnalysis,
    RoadmapStage,
    TargetJob,
} from "./PreparationContextDefinition";
import { PreparationContext } from "./PreparationContextDefinition";

export { usePreparation } from "../hooks/usePreparation";
export { PreparationContext };
export type {
    CandidateProfile,
    CompletedInterview,
    InterviewConfig,
    MatchAnalysis,
    RoadmapStage,
    TargetJob,
};

const defaultProfile: CandidateProfile = {
    name: "Demo Candidate",
    email: "demo@example.com",
    phone: "+91 98765 43210",
    summary:
        "Software developer with experience building full-stack applications using modern frontend and backend technologies. Strong interest in AI-powered systems, APIs, and scalable application development.",
    skills: [
        "Python",
        "JavaScript",
        "TypeScript",
        "React",
        "FastAPI",
        "Node.js",
        "REST APIs",
        "SQL",
        "Git",
        "Docker",
        "Machine Learning",
        "AI",
    ],
    experience: [
        {
            role: "Software Developer Intern",
            company: "Technology Company",
            duration: "2025 – Present",
            responsibilities: [
                "Built responsive web applications using React and TypeScript.",
                "Developed REST APIs and integrated frontend applications with backend services.",
                "Worked with databases and authentication systems.",
            ],
        },
        {
            role: "Student Developer",
            company: "Academic Projects",
            duration: "2024 – 2025",
            responsibilities: [
                "Developed AI and software engineering projects.",
                "Designed application architecture and reusable components.",
            ],
        },
    ],
    projects: [
        {
            name: "AI Interview Intelligence Platform",
            description:
                "An AI-powered interview preparation platform that analyzes resumes, job descriptions, interview performance, and skill gaps.",
            technologies: ["React", "TypeScript", "FastAPI", "Python", "Gemini"],
        },
        {
            name: "AI Career Assistant",
            description:
                "An intelligent assistant designed to help users understand career opportunities and prepare for technical interviews.",
            technologies: ["Python", "Machine Learning", "APIs"],
        },
    ],
    education: [
        {
            degree: "Bachelor of Technology",
            institution: "University",
            year: "2022 – 2026",
        },
    ],
    certifications: [
        "Python Programming",
        "Full Stack Development",
        "Machine Learning Fundamentals",
    ],
    achievements: [
        "Developed multiple AI-powered software projects.",
        "Built full-stack applications using modern technologies.",
        "Participated in technical project development and hackathons.",
    ],
};

const defaultTargetJob: TargetJob = {
    jobTitle: "Senior Full Stack Developer",
    company: "TechNova",
    experience: "2–4 years",
    description:
        "We are looking for a Full Stack Developer to build scalable web applications. The ideal candidate should have strong experience with React, TypeScript, Python, FastAPI, REST APIs, SQL, and modern cloud technologies.",
    skills: [
        "React",
        "TypeScript",
        "Python",
        "FastAPI",
        "REST APIs",
        "SQL",
        "Docker",
        "Git",
        "Kubernetes",
        "AWS",
    ],
    analyzed: true,
};

const defaultMatchAnalysis: MatchAnalysis = {
    overallScore: 84,
    breakdown: {
        technical: 91,
        experience: 84,
        projects: 88,
        requirements: 73,
    },
    matchedSkills: ["Python", "React", "TypeScript", "FastAPI", "REST APIs", "SQL", "Docker", "Git"],
    missingSkills: ["Kubernetes", "AWS", "Redis"],
    strengths: [
        "Strong full-stack development experience",
        "Good alignment with the required technical stack",
        "Relevant project experience",
        "Strong API and backend fundamentals",
    ],
    weaknesses: [
        "Limited cloud infrastructure experience",
        "No clear Kubernetes experience",
        "Redis experience is not demonstrated",
    ],
};

const defaultInterviewConfig: InterviewConfig = {
    role: "Senior Full Stack Developer",
    type: "Mixed",
    difficulty: "Medium",
    duration: "30 minutes",
    questionCount: "5",
    focusAreas: ["Technical", "Problem Solving", "Behavioral"],
};

const defaultInterviewHistory: CompletedInterview[] = [
    {
        id: "int-1",
        role: "Senior Full Stack Developer",
        type: "Mixed",
        date: "Today",
        score: 84,
        duration: "18:42",
        difficulty: "Medium",
        questionsCount: 5,
    },
    {
        id: "int-2",
        role: "React Developer",
        type: "Technical",
        date: "5 days ago",
        score: 82,
        duration: "24:10",
        difficulty: "Medium",
        questionsCount: 8,
    },
    {
        id: "int-3",
        role: "Software Engineer",
        type: "Behavioral",
        date: "1 week ago",
        score: 78,
        duration: "15:30",
        difficulty: "Easy",
        questionsCount: 5,
    },
];

const defaultRoadmapStages: RoadmapStage[] = [
    {
        week: "Week 1",
        title: "Strengthen Core Development",
        description:
            "Review the fundamentals that form the foundation of your target full-stack role.",
        skills: ["React", "TypeScript", "Python", "REST APIs"],
        status: "Completed",
        progress: 100,
    },
    {
        week: "Week 2",
        title: "Improve Backend & API Skills",
        description:
            "Practice designing reliable APIs, handling databases, authentication, and backend architecture.",
        skills: ["FastAPI", "SQL", "Authentication", "API Design"],
        status: "In Progress",
        progress: 65,
    },
    {
        week: "Week 3",
        title: "Learn Cloud & Infrastructure",
        description:
            "Build confidence with cloud infrastructure and deployment concepts required for modern applications.",
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        status: "Upcoming",
        progress: 0,
    },
    {
        week: "Week 4",
        title: "System Design Preparation",
        description:
            "Practice designing scalable systems and explaining architectural decisions during interviews.",
        skills: ["System Design", "Caching", "Load Balancing", "Distributed Systems"],
        status: "Upcoming",
        progress: 0,
    },
];

export const PreparationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<CandidateProfile>(defaultProfile);
    const [targetJob, setTargetJob] = useState<TargetJob>(defaultTargetJob);
    const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis>(defaultMatchAnalysis);
    const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(defaultInterviewConfig);
    const [interviewHistory, setInterviewHistory] = useState<CompletedInterview[]>(defaultInterviewHistory);
    const [roadmapStages, setRoadmapStages] = useState<RoadmapStage[]>(defaultRoadmapStages);

    const [activeResumeId, setActiveResumeId] = useState<string | number | null>(null);
    const [activeJdId, setActiveJdId] = useState<number | null>(null);
    const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

    const updateProfile = (updated: Partial<CandidateProfile>) => {
        setProfile((prev) => ({ ...prev, ...updated }));
    };

    const updateTargetJob = (updated: Partial<TargetJob>) => {
        setTargetJob((prev) => {
            const newJob = { ...prev, ...updated };
            if (updated.skills || updated.jobTitle) {
                const jobSkills = newJob.skills || [];
                const candidateSkills = profile.skills || [];
                const matched = jobSkills.filter((s) =>
                    candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase()),
                );
                const missing = jobSkills.filter(
                    (s) => !candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase()),
                );
                const score = Math.round((matched.length / Math.max(jobSkills.length, 1)) * 100);
                setMatchAnalysis((prevMatch) => ({
                    ...prevMatch,
                    overallScore: Math.max(score, 60),
                    matchedSkills: matched.length > 0 ? matched : prevMatch.matchedSkills,
                    missingSkills: missing.length > 0 ? missing : prevMatch.missingSkills,
                }));
            }
            return newJob;
        });
    };

    const updateInterviewConfig = (updated: Partial<InterviewConfig>) => {
        setInterviewConfig((prev) => ({ ...prev, ...updated }));
    };

    const addCompletedInterview = (interview: CompletedInterview) => {
        setInterviewHistory((prev) => [interview, ...prev]);
    };

    const toggleRoadmapStage = (index: number) => {
        setRoadmapStages((current) =>
            current.map((item, itemIndex) => {
                if (itemIndex !== index) return item;
                if (item.status === "Completed") {
                    return { ...item, status: "In Progress", progress: 65 };
                }
                if (item.status === "In Progress") {
                    return { ...item, status: "Completed", progress: 100 };
                }
                return { ...item, status: "In Progress", progress: 25 };
            }),
        );
    };

    return (
        <PreparationContext.Provider
            value={{
                profile,
                targetJob,
                matchAnalysis,
                interviewConfig,
                interviewHistory,
                roadmapStages,
                activeResumeId,
                activeJdId,
                activeMatchId,
                activeSessionId,
                updateProfile,
                updateTargetJob,
                setMatchAnalysis,
                updateInterviewConfig,
                addCompletedInterview,
                toggleRoadmapStage,
                setActiveResumeId,
                setActiveJdId,
                setActiveMatchId,
                setActiveSessionId,
            }}
        >
            {children}
        </PreparationContext.Provider>
    );
};

