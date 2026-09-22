import { useState } from "react";
import { NavLink } from "react-router-dom";

const mainItems = [
    { label: "Home", path: "/dashboard", icon: "⌂" },
    { label: "Resume", path: "/resume", icon: "▤" },
    { label: "Match", path: "/matching", icon: "◈" },
    { label: "Interview", path: "/interview", icon: "◉" },
    { label: "Results", path: "/results", icon: "✓" },
];

const secondaryItems = [
    { label: "Job Description", path: "/job-description", icon: "◎" },
    { label: "Analytics", path: "/analytics", icon: "▥" },
    { label: "Roadmap", path: "/roadmap", icon: "→" },
    { label: "Settings", path: "/settings", icon: "⚙" },
];

function MobileNav() {
    const [showMore, setShowMore] = useState(false);

    return (
        <>
            {/* Overlay for More Menu */}
            {showMore && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setShowMore(false)}
                >
                    <div
                        className="absolute bottom-20 left-4 right-4 rounded-2xl border border-gray-800 bg-gray-950 p-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            More Navigation
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {secondaryItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMore(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition ${
                                            isActive
                                                ? "border-white bg-white text-black"
                                                : "border-gray-800 bg-black text-gray-300 hover:border-gray-700"
                                        }`
                                    }
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-black/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-lg items-center justify-around">
                    {mainItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowMore(false)}
                            className={({ isActive }) =>
                                `flex min-w-14 flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5 text-center transition ${
                                    isActive
                                        ? "text-white"
                                        : "text-gray-500 hover:text-gray-300"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${
                                            isActive
                                                ? "bg-white text-black"
                                                : "bg-transparent"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="text-[10px] font-medium">
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Toggle More button */}
                    <button
                        type="button"
                        onClick={() => setShowMore((prev) => !prev)}
                        aria-label="More navigation links"
                        className={`flex min-w-14 flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5 text-center transition ${
                            showMore ? "text-white" : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${
                                showMore ? "bg-white text-black" : "bg-transparent"
                            }`}
                        >
                            ⋯
                        </span>
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </div>
            </nav>
        </>
    );
}

export default MobileNav;