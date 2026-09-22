interface ProgressBarProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    label?: string;
    className?: string;
}

function ProgressBar({
    value,
    max = 100,
    showLabel = false,
    label,
    className = "",
}: ProgressBarProps) {
    const safeMax = max > 0 ? max : 100;

    const percentage = Math.min(
        Math.max((value / safeMax) * 100, 0),
        100,
    );

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-400">
                        {label}
                    </span>

                    <span className="text-sm font-medium text-gray-300">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}

            <div
                className="h-2 w-full overflow-hidden rounded-full bg-gray-800"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={safeMax}
            >
                <div
                    className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;