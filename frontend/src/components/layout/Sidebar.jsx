import {
    Bell,
    BookOpen,
    LibraryBig,
    CalendarCheck2,
    CalendarDays,
    ClipboardList,
    GraduationCap,
    Home,
    LogOut,
    Menu,
    Settings2,
    Trophy,
    UserPlus,
    Users,
    X
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();

    const role = user?.role || "";

    const navItems = [
        {
            label: t("sidebar.home"),
            path: "/",
            icon: Home,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("sidebar.dashboard"),
            path: "/dashboard",
            icon: GraduationCap,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("sidebar.students"),
            path: "/students",
            icon: Users,
            roles: ["admin", "teacher"]
        },
        {
            label: t("sidebar.teachers"),
            path: "/teachers",
            icon: UserPlus,
            roles: ["admin"]
        },
        {
            label: t("sidebar.attendance"),
            path: "/attendance",
            icon: CalendarCheck2,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("timetable.title"),
            path: "/timetable",
            icon: CalendarDays,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("sidebar.homework"),
            path: "/homework",
            icon: BookOpen,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("sidebar.library"),
            path: "/library",
            icon: LibraryBig,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("sidebar.exams"),
            path: "/exams",
            icon: ClipboardList,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("sidebar.notices"),
            path: "/notices",
            icon: Bell,
            roles: ["admin", "teacher", "student"]
        },
        {
            label: t("sidebar.homeManagement"),
            path: "/home-management",
            icon: Trophy,
            roles: ["admin"]
        }
    ];

    const visibleNavItems = navItems.filter((item) =>
        item.roles.includes(role)
    );

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const roleLabel =
        role === "admin"
            ? t("sidebar.adminPanel")
            : role === "teacher"
              ? t("sidebar.teacherPanel")
              : t("sidebar.studentPanel");

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar overlay"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                    <NavLink
                        to="/"
                        onClick={onClose}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/20">
                            <GraduationCap className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-extrabold">
                                {t("sidebar.schoolErp")}
                            </h1>
                            <p className="text-xs font-medium text-indigo-200">
                                {roleLabel}
                            </p>
                        </div>
                    </NavLink>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-indigo-100 transition hover:bg-white/10 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-5">
                    {visibleNavItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive
                                            ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-indigo-950/30"
                                            : "text-indigo-100 hover:bg-white/10 hover:text-white"
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="space-y-3 border-t border-white/10 p-4">
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                        <span className="flex items-center gap-3">
                            <Settings2 className="h-5 w-5" />
                            Language
                        </span>

                        <span className="rounded-lg bg-white/15 px-2 py-1 text-xs">
                            {language === "en" ? "ગુજરાતી" : "English"}
                        </span>
                    </button>

                    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-bold text-white">
                            {(user?.fullName || user?.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">
                                {user?.fullName || user?.name || "User"}
                            </p>
                            <p className="truncate text-xs capitalize text-indigo-200">
                                {role}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
                    >
                        <LogOut className="h-5 w-5" />
                        {t("sidebar.logout")}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;