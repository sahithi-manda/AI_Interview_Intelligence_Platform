export interface User {
    id: string | number;
    name: string;
    email: string;
}

export interface AuthData {
    user: User;
    access_token: string;
}