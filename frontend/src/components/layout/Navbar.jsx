import {
    ArrowLeft,
    Bell,
    Menu,
    Search,
    UserCircle2
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const titles = {
        "/dashboard": "Dashboard",
        "/students": "Students",
        "/students/add": "Add Student",
        "/teachers": "Teachers",
        "/teachers/add": "Add Teacher",
        "/attendance": "Attendance",
        "/attendance/dashboard": "Attendance Dashboard",
        "/attendance/mark": "Mark Attendance",
        "/homework": "Homework",
        "/homework/dashboard": "Homework Dashboard",
        "/homework/create": "Create Homework",
        "/exams": "Exams",
        "/exams/dashboard": "Exam Dashboard",
        "/notices": "Notices",
        "/notices/dashboard": "Notice Dashboard",
        "/notices/create": "Create Notice",
        "/home-management": "Home Management"
    };

    const getTitle = () => {
        if (titles[location.pathname]) {
            return titles[location.pathname];
        }

        if (location.pathname.startsWith("/students/edit")) {
            return "Edit Student";
        }

        if (location.pathname.startsWith("/teachers/edit")) {
            return "Edit Teacher";
        }

        if (location.pathname.startsWith("/homework/edit")) {
            return "Edit Homework";
        }

        if (location.pathname.startsWith("/notices/edit")) {
            return "Edit Notice";
        }

        return "School ERP";
    };

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const isDashboard = location.pathname === "/dashboard";

    return (
        <header className="flex min-h-20 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-xl p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu size={24} />
                </button>

                {!isDashboard && (
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-xl p-2 text-[#5B2EFF] hover:bg-[#5B2EFF]/10 lg:hidden"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}

                <div className="min-w-0">
                    <h1 className="truncate text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl">
                        {getTitle()}
                    </h1>

                    <p className="mt-1 hidden text-sm text-gray-500 sm:block">
                        {today}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">
                <div className="hidden w-80 items-center gap-3 rounded-xl bg-gray-100 px-4 py-2 md:flex">
                    <Search
                        size={18}
                        className="text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="flex-1 bg-transparent text-sm outline-none"
                    />
                </div>

                <button
                    type="button"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200 sm:h-11 sm:w-11"
                    aria-label="Notifications"
                >
                    <Bell size={20} />

                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                    <UserCircle2
                        size={38}
                        className="text-[#5B2EFF] sm:hidden"
                    />

                    <UserCircle2
                        size={42}
                        className="hidden text-[#5B2EFF] sm:block"
                    />

                    <div className="hidden lg:block">
                        <p className="font-semibold text-gray-800">
                            {user?.name || "User"}
                        </p>

                        <p className="text-sm capitalize text-gray-500">
                            {user?.role || "User"}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;