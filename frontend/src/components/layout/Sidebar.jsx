import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    ClipboardCheck,
    BookOpen,
    FileText,
    Bell,
    Settings,
    User,
    LogOut,
    School
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {

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
            title: "Settings",
            path: "/settings",
            icon: <Settings size={20} />,
            roles: ["admin"]
        }

    ];

    const filteredMenus = menus.filter(menu =>
        menu.roles.includes(user?.role)
    );

    return (

        <aside className="w-72 bg-[#111827] text-white h-screen flex flex-col">

            <div className="h-20 flex items-center justify-center border-b border-gray-700">

                <School
                    size={32}
                    className="mr-3"
                />

                <h1 className="text-2xl font-bold">

                    KailashNagar ERP

                </h1>

            </div>

            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

                {

                    filteredMenus.map((menu) => (

                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-300 hover:bg-gray-800"
                                }`
                            }
                        >

                            {menu.icon}

                            <span>

                                {menu.title}

                            </span>

                        </NavLink>

                    ))

                }

            </div>

            <div className="border-t border-gray-700 p-5">

                <div className="mb-4">

                    <p className="font-semibold">

                        {user?.name || "User"}

                    </p>

                    <p className="text-sm text-gray-400 capitalize">

                        {user?.role}

                    </p>

                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition"
                >

                    <LogOut size={18} />

                    Logout

                </button>

            </div>

        </aside>

    );

};

export default Sidebar;