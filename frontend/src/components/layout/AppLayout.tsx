import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

function AppLayout() {
    return (
        <div className="min-h-screen bg-black text-white">

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main application area */}
            <div className="min-h-screen pb-20 lg:pl-64 lg:pb-0">

                {/* Top navigation */}
                <Topbar />

                {/* Current route page */}
                <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>

            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav />

        </div>
    );
}

export default AppLayout;