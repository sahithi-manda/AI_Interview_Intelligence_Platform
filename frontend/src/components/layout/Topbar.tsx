import { useAuth } from "../../context/AuthContext";

function Topbar() {
    const { user } = useAuth();

    const userName = user?.name || "User";
    const firstLetter = userName.charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-30 border-b border-gray-800 bg-black/90 backdrop-blur">
            <div className="flex h-20 items-center justify-between px-6 lg:px-8">

                {/* Page identity */}
                <div>
                    <p className="text-sm text-gray-500">
                        AI Interview Intelligence
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-300">
                        Prepare smarter. Interview better.
                    </p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-5">

                    {/* Notification */}
                    <button
                        type="button"
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-950 text-gray-400 transition hover:border-gray-700 hover:text-white"
                        aria-label="Notifications"
                    >
                        🔔

                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white" />
                    </button>

                    {/* Divider */}
                    <div className="hidden h-8 w-px bg-gray-800 sm:block" />

                    {/* User */}
                    <div className="flex items-center gap-3">

                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-white">
                                {userName}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Candidate
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                            {firstLetter}
                        </div>

                    </div>

                </div>

            </div>
        </header>
    );
}

export default Topbar;