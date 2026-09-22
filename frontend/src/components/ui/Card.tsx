import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

function Card({ children, className = "" }: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl ${className}`}
        >
            {children}
        </div>
    );
}

export default Card;