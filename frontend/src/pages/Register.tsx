import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/registerApi";


function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError("");

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const res = await registerUser({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            login({
                user: res.user,
                access_token: res.access_token,
            });

            navigate("/dashboard");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "User registration failed.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthLayout
            subtitle="Create your account and start preparing smarter."
        >
            <Card>
                <h2 className="mb-6 text-2xl font-semibold">
                    Create your account
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Full Name */}
                    <Input
                        id="name"
                        type="text"
                        label="Full Name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                    />

                    {/* Email */}
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

                    {/* Password */}
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                    />

                    {/* Confirm Password */}
                    <Input
                        id="confirmPassword"
                        type="password"
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                    />

                    {/* Error */}
                    {error && (
                        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        loading={loading}
                    >
                        Create Account
                    </Button>
                </form>

                {/* Login link */}
                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-white hover:underline"
                    >
                        Sign in
                    </Link>
                </div>
            </Card>
        </AuthLayout>
    );
}

export default Register;