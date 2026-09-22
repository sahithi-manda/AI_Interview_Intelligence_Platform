import api from "./api";

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface RegisterUser {
    id: string | number;
    name: string;
    email: string;
}

export interface BackendAuthResponse {
    message: string;
    access_token: string;
    token_type: string;
}

export interface RegisterResponse {
    access_token: string;
    token_type: string;
    user: RegisterUser;
}

export const registerUser = async (
    data: RegisterRequest,
): Promise<RegisterResponse> => {
    const response = await api.post<BackendAuthResponse>(
        "/api/auth/register",
        data,
    );

    const token = response.data.access_token;
    localStorage.setItem("auth", JSON.stringify({ access_token: token }));

    // Fetch user profile from /api/auth/me
    const userRes = await api.get<RegisterUser>("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
    });

    return {
        access_token: token,
        token_type: response.data.token_type,
        user: userRes.data,
    };
};