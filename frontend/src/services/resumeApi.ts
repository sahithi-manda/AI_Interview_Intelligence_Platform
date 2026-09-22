import api from "./api";

export interface ResumeUploadResponse {
    success: boolean;
    file_id: string;
    filename: string;
    file_type: string;
    text_length: number;
    extracted_text: string;
}

export interface CandidateProfile {
    name: string;
    email: string;
    phone: string;

    education: {
        degree: string;
        institution: string;
        year: string;
    }[];

    skills: string[];

    projects: {
        name: string;
        description: string;
        technologies: string[];
    }[];

    experience: {
        company: string;
        role: string;
        duration: string;
        responsibilities: string[];
    }[];

    certifications: string[];

    achievements: string[];

    summary: string;
}

export interface ResumeAnalyzeResponse {
    success: boolean;
    file_id: string;
    candidate_profile: CandidateProfile;
}

export const uploadResume = async (
    file: File,
): Promise<ResumeUploadResponse> => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post<ResumeUploadResponse>(
        "/api/resumes/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    );

    return response.data;
};

export const analyzeResume = async (
    fileId: string | number,
): Promise<ResumeAnalyzeResponse> => {
    const response = await api.post<ResumeAnalyzeResponse>(
        `/api/resumes/${fileId}/analyze`,
    );

    return response.data;
};