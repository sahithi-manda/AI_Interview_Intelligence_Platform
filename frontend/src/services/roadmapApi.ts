import api from "./api";

export interface SkillGapItem {
    id: string;
    name: string;
    priority: "High" | "Medium" | "Low";
    current_score: number;
    target_score: number;
    score?: number;
    description: string;
}

export interface RoadmapStageItem {
    id: string;
    stage_number: number;
    title: string;
    description: string;
    skills: string[];
    status: "Completed" | "In Progress" | "Upcoming";
    progress_percentage: number;
}

export interface UserRoadmapResponse {
    user_id: string;
    target_role: string;
    overall_readiness: number;
    roadmap_progress: number;
    skill_gaps: SkillGapItem[];
    stages: RoadmapStageItem[];
    ai_insight: string;
}

export const getRoadmap = async (sessionId?: number): Promise<UserRoadmapResponse> => {
    if (sessionId) {
        try {
            const response = await api.post("/api/interview/improvement-plan", {
                session_id: sessionId,
            });
            const data = response.data;

            const prioritySkills = data.priority_skills || [];
            const skillGaps: SkillGapItem[] = prioritySkills.map((skill: string, idx: number) => ({
                id: `gap-${idx}`,
                name: skill,
                priority: idx === 0 ? "High" : "Medium",
                current_score: 50,
                target_score: 90,
                description: data.practice_areas?.[idx] || `Practice and strengthen your expertise in ${skill}.`,
            }));

            const learningGoals = data.learning_goals || [];
            const stages: RoadmapStageItem[] = learningGoals.map((goal: string, idx: number) => ({
                id: `stage-${idx + 1}`,
                stage_number: idx + 1,
                title: `Stage ${idx + 1}: ${goal}`,
                description: data.personalized_plan || goal,
                skills: prioritySkills,
                status: idx === 0 ? "In Progress" : "Upcoming",
                progress_percentage: idx === 0 ? 50 : 0,
            }));

            return {
                user_id: "current",
                target_role: "Target Role",
                overall_readiness: 75,
                roadmap_progress: 25,
                skill_gaps: skillGaps,
                stages: stages.length > 0 ? stages : [],
                ai_insight: data.personalized_plan || "Follow your customized improvement plan to maximize interview success.",
            };
        } catch {
            // Fallback gracefully if session has no persisted improvement plan
        }
    }

    return {
        user_id: "current",
        target_role: "Full Stack Developer",
        overall_readiness: 84,
        roadmap_progress: 40,
        skill_gaps: [],
        stages: [],
        ai_insight: "Complete a mock interview session to generate a customized AI learning roadmap.",
    };
};

export const updateStageStatus = async (
    stageId: string,
    status: "Completed" | "In Progress" | "Upcoming",
): Promise<{ success: boolean; stage: RoadmapStageItem }> => {
    return {
        success: true,
        stage: {
            id: stageId,
            stage_number: 1,
            title: "Roadmap Stage",
            description: "Updated status",
            skills: [],
            status,
            progress_percentage: status === "Completed" ? 100 : status === "In Progress" ? 50 : 0,
        },
    };
};
