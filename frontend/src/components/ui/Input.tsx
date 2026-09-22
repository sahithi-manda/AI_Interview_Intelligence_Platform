import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

function Input({ label, error, id, ...props }: InputProps) {
    return (
        <div className="w-full">
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-medium text-white"
            >
                {label}
            </label>

            <input
                id={id}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-white"
                {...props}
            />

            {error && (
                <p className="mt-1 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

export default Input;