import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authApi";


function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const res = await loginUser({ email, password });

            login({
                user: res.user,
                access_token: res.access_token,
            });

            navigate("/dashboard");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Invalid email or password.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthLayout
            subtitle="Sign in to continue your interview journey."
        >
            <Card>
                <h2 className="mb-6 text-2xl font-semibold">
                    Welcome back
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                    />

                    {error && (
                        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-white hover:underline"
                    >
                        Create one
                    </Link>
                </div>
            </Card>
        </AuthLayout>
    );
}

export default Login;