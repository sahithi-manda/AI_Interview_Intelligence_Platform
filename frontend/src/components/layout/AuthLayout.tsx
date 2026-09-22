import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    subtitle: string;
}

function AuthLayout({ children, subtitle }: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-black px-4 py-12 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">
                        AI Interview Intelligence
                    </h1>

                    <p className="mt-3 text-gray-400">
                        {subtitle}
                    </p>
                </div>

                {/* Page content */}
                {children}
            </div>
        </main>
    );
}

export default AuthLayout;