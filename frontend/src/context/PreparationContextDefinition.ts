import { createContext } from "react";

export interface CandidateProfile {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    experience: {
        role: string;
        company: string;
        duration: string;
        responsibilities: string[];
    }[];
    projects: {
        name: string;
        description: string;
        technologies: string[];
    }[];
    education: {
        degree: string;
        institution: string;
        year: string;
    }[];
    certifications: string[];
    achievements: string[];
}

export interface TargetJob {
    jobTitle: string;
    company: string;
    experience: string;
    description: string;
    skills: string[];
    analyzed: boolean;
}

export interface MatchAnalysis {
    overallScore: number;
    breakdown: {
        technical: number;
        experience: number;
        projects: number;
        requirements: number;
    };
    matchedSkills: string[];
    missingSkills: string[];
    strengths: string[];
    weaknesses: string[];
}

export interface InterviewConfig {
    role: string;
    type: string;
    difficulty: string;
    duration: string;
    questionCount: string;
    focusAreas: string[];
}

export interface CompletedInterview {
    id: string;
    role: string;
    type: string;
    date: string;
    score: number;
    duration: string;
    difficulty: string;
    questionsCount: number;
}

export interface RoadmapStage {
    week: string;
    title: string;
    description: string;
    skills: string[];
    status: "Completed" | "In Progress" | "Upcoming";
    progress: number;
}

export interface PreparationContextType {
    profile: CandidateProfile;
    targetJob: TargetJob;
    matchAnalysis: MatchAnalysis;
    interviewConfig: InterviewConfig;
    interviewHistory: CompletedInterview[];
    roadmapStages: RoadmapStage[];
    activeResumeId: string | number | null;
    activeJdId: number | null;
    activeMatchId: number | null;
    activeSessionId: number | null;
    updateProfile: (updated: Partial<CandidateProfile>) => void;
    updateTargetJob: (updated: Partial<TargetJob>) => void;
    setMatchAnalysis: React.Dispatch<React.SetStateAction<MatchAnalysis>>;
    updateInterviewConfig: (updated: Partial<InterviewConfig>) => void;
    addCompletedInterview: (interview: CompletedInterview) => void;
    toggleRoadmapStage: (index: number) => void;
    setActiveResumeId: (id: string | number | null) => void;
    setActiveJdId: (id: number | null) => void;
    setActiveMatchId: (id: number | null) => void;
    setActiveSessionId: (id: number | null) => void;
}

export const PreparationContext = createContext<PreparationContextType | undefined>(undefined);

