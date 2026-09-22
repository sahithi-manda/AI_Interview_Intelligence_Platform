interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

function Spinner({
    size = "md",
    className = "",
}: SpinnerProps) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-10 w-10 border-3",
    };

    return (
        <span
            className={`inline-block animate-spin rounded-full border-gray-700 border-t-white ${sizes[size]} ${className}`}
            role="status"
            aria-label="Loading"
        />
    );
}

export default Spinner;