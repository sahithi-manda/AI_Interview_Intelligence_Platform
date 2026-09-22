import { NavLink } from "react-router-dom";

const navigationItems = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: "⌂",
    },
    {
        label: "Resume",
        path: "/resume",
        icon: "▤",
    },
    {
        label: "Job Description",
        path: "/job-description",
        icon: "◎",
    },
    {
        label: "Job Match",
        path: "/matching",
        icon: "◈",
    },
    {
        label: "Interview",
        path: "/interview",
        icon: "◉",
    },
    {
        label: "Results",
        path: "/results",
        icon: "✓",
    },
    {
        label: "Analytics",
        path: "/analytics",
        icon: "▥",
    },
    {
        label: "Roadmap",
        path: "/roadmap",
        icon: "→",
    },
];

function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-800 bg-gray-950 lg:block">
            <div className="flex h-full flex-col">

                {/* Logo */}
                <div className="border-b border-gray-800 px-6 py-6">
                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-black">
                            AI
                        </div>

                        <div>
                            <h1 className="text-sm font-bold text-white">
                                Interview Intelligence
                            </h1>

                            <p className="mt-1 text-xs text-gray-500">
                                AI-powered preparation
                            </p>
                        </div>

                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Workspace
                    </p>

                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                                    ? "bg-white text-black"
                                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                }`
                            }
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-base">
                                {item.icon}
                            </span>

                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                </nav>

                {/* Settings */}
                <div className="border-t border-gray-800 p-3">

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                                ? "bg-white text-black"
                                : "text-gray-400 hover:bg-gray-900 hover:text-white"
                            }`
                        }
                    >
                        <span className="flex h-7 w-7 items-center justify-center">
                            ⚙
                        </span>

                        <span>Settings</span>
                    </NavLink>

                </div>

            </div>
        </aside>
    );
}

export default Sidebar;