import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
                <Navbar
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;