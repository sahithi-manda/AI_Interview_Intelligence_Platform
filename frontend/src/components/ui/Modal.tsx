import { useEffect, type ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg";
}

function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = "md",
}: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={`w-full ${sizes[size]} rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl`}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-5 border-b border-gray-800 px-6 py-5">
                    <div>
                        <h2
                            id="modal-title"
                            className="text-xl font-semibold text-white"
                        >
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition hover:border-gray-600 hover:text-white"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;