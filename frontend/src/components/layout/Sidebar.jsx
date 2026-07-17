import { NavLink, useNavigate } from "react-router-dom";
import {
    Bell,
    BookOpen,
    ClipboardCheck,
    FileText,
    GraduationCap,
    Home,
    LayoutDashboard,
    LogOut,
    School,
    User,
    Users,
    X
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menus = [
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard size={20} />,
            roles: ["admin", "teacher", "student"]
        },
        {
            title: "Students",
            path: "/students",
            icon: <Users size={20} />,
            roles: ["admin", "teacher"]
        },
        {
            title: "Teachers",
            path: "/teachers",
            icon: <GraduationCap size={20} />,
            roles: ["admin"]
        },
        {
            title: "Attendance",
            path: "/attendance",
            icon: <ClipboardCheck size={20} />,
            roles: ["admin", "teacher", "student"]
        },
        {
            title: "Homework",
            path: "/homework",
            icon: <BookOpen size={20} />,
            roles: ["admin", "teacher", "student"]
        },
        {
            title: "Exams",
            path: "/exams",
            icon: <FileText size={20} />,
            roles: ["admin", "teacher", "student"]
        },
        {
            title: "Notices",
            path: "/notices",
            icon: <Bell size={20} />,
            roles: ["admin", "teacher", "student"]
        },
        {
            title: "Profile",
            path: "/profile",
            icon: <User size={20} />,
            roles: ["admin", "teacher", "student"]
        },
        {
            title: "Home Management",
            path: "/home-management",
            icon: <Home size={20} />,
            roles: ["admin"]
        }
    ];

    const filteredMenus = menus.filter((menu) =>
        menu.roles.includes(user?.role)
    );

    const handleLogout = () => {
        logout();
        onClose();
        navigate("/login");
    };

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col bg-[#111827] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-gray-700 px-5">
                    <div className="flex items-center gap-3">
                        <School size={29} />

                        <div>
                            <h1 className="text-lg font-bold">
                                KailashNagar
                            </h1>

                            <p className="text-xs text-gray-400">
                                School ERP
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-300 hover:bg-gray-800 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X size={21} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
                    {filteredMenus.map((menu) => (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition-all ${
                                    isActive
                                        ? "bg-[#5B2EFF] text-white"
                                        : "text-gray-300 hover:bg-gray-800"
                                }`
                            }
                        >
                            {menu.icon}

                            <span>{menu.title}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-gray-700 p-5">
                    <div className="mb-4">
                        <p className="font-semibold">
                            {user?.name || "User"}
                        </p>

                        <p className="text-sm capitalize text-gray-400">
                            {user?.role || "User"}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold transition hover:bg-red-700"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;