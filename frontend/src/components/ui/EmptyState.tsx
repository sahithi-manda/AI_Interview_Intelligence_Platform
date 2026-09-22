import type { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

function EmptyState({
    title,
    description,
    icon = "○",
    action,
    actionLabel,
    onAction,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-950 px-6 py-12 text-center ${className}`}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-800 bg-black text-xl text-gray-400">
                {icon}
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
                {title}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {description}
            </p>

            {(action || (actionLabel && onAction)) && (
                <div className="mt-6">
                    {action || (
                        <button
                            type="button"
                            onClick={onAction}
                            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default EmptyState;