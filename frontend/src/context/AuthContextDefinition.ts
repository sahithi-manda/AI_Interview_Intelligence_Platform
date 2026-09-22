import { createContext } from "react";
import type { AuthData, User } from "../types/auth";

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (authData: AuthData) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
