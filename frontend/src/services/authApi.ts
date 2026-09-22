import api from "./api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginUser {
    id: string | number;
    name: string;
    email: string;
}

export interface BackendAuthResponse {
    message: string;
    access_token: string;
    token_type: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: LoginUser;
}

export const loginUser = async (
    data: LoginRequest,
): Promise<LoginResponse> => {
    const response = await api.post<BackendAuthResponse>(
        "/api/auth/login",
        data,
    );

    const token = response.data.access_token;
    localStorage.setItem("auth", JSON.stringify({ access_token: token }));

    // Fetch user profile from /api/auth/me
    const userRes = await api.get<LoginUser>("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
    });

    return {
        access_token: token,
        token_type: response.data.token_type,
        user: userRes.data,
    };
};

export const getCurrentUser = async (): Promise<LoginUser> => {
    const response = await api.get<LoginUser>("/api/auth/me");
    return response.data;
};