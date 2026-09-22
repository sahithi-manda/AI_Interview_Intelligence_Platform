import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    loading?: boolean;
}

function Button({
    children,
    loading = false,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className="w-full rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            {...props}
        >
            {loading ? "Loading..." : children}
        </button>
    );
}

export default Button;