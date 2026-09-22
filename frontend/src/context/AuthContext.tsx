/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, type ReactNode } from "react";
import type { AuthData, User } from "../types/auth";
import { AuthContext } from "./AuthContextDefinition";
import { getCurrentUser } from "../services/authApi";

export { useAuth } from "../hooks/useAuth";
export { AuthContext };

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedAuth = localStorage.getItem("auth");
            if (storedAuth) {
                const authData: AuthData = JSON.parse(storedAuth);
                return authData.user || null;
            }
        } catch {
            localStorage.removeItem("auth");
        }
        return null;
    });

    const [token, setToken] = useState<string | null>(() => {
        try {
            const storedAuth = localStorage.getItem("auth");
            if (storedAuth) {
                const authData: AuthData = JSON.parse(storedAuth);
                return authData.access_token || null;
            }
        } catch {
            localStorage.removeItem("auth");
        }
        return null;
    });

    const logout = () => {
        localStorage.removeItem("auth");
        setUser(null);
        setToken(null);
    };

    useEffect(() => {
        if (token && !user) {
            getCurrentUser()
                .then((me) => {
                    setUser(me);
                    const storedAuth = localStorage.getItem("auth");
                    const existing = storedAuth ? JSON.parse(storedAuth) : {};
                    localStorage.setItem("auth", JSON.stringify({ ...existing, user: me }));
                })
                .catch(() => {
                    logout();
                });
        }
    }, [token, user]);

    const login = (authData: AuthData) => {
        localStorage.setItem("auth", JSON.stringify(authData));
        setUser(authData.user);
        setToken(authData.access_token);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user && !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}