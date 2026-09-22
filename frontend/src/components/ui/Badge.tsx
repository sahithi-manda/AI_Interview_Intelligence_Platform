import type { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info";
    className?: string;
}

function Badge({
    children,
    variant = "default",
    className = "",
}: BadgeProps) {
    const variants = {
        default:
            "border-gray-800 bg-gray-900 text-gray-400",

        success:
            "border-gray-700 bg-gray-800 text-gray-200",

        warning:
            "border-gray-700 bg-gray-900 text-gray-300",

        danger:
            "border-gray-700 bg-gray-900 text-gray-400",

        info:
            "border-gray-700 bg-gray-900 text-gray-300",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}

export default Badge;