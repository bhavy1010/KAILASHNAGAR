import {
    ArrowLeft,
    Bell,
    Globe2,
    Menu,
    Search,
    UserCircle2
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const Navbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { language, toggleLanguage, t } = useLanguage();

    const titles = {
        "/dashboard": t("dashboard.dashboard"),
        "/students": t("sidebar.students"),
        "/students/add": t("students.addStudent"),
        "/teachers": t("sidebar.teachers"),
        "/teachers/add": t("teachers.addTeacher"),
        "/attendance": t("attendance.attendance"),
        "/attendance/dashboard": t("attendance.attendanceDashboard"),
        "/attendance/mark": t("attendance.markAttendance"),
        "/attendance/history": t("attendance.attendanceHistory"),
        "/homework": t("sidebar.homework"),
        "/homework/dashboard": t("homework.homeworkDashboard"),
        "/homework/create": t("homework.createHomework"),
        "/exams": t("sidebar.exams"),
        "/exams/dashboard": t("exams.examDashboard"),
        "/notices": t("sidebar.notices"),
        "/notices/dashboard": t("notices.noticeDashboard"),
        "/notices/create": t("notices.createNotice"),
        "/home-management": t("homeManagement.title")
    };

    const currentTitle = titles[location.pathname] || t("sidebar.schoolErp");

    const canGoBack =
        location.pathname !== "/" && location.pathname !== "/dashboard";

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {canGoBack && (
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-xl p-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                            aria-label="Go back"
                            title={t("common.back")}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                            {currentTitle}
                        </h1>
                        <p className="hidden text-xs text-slate-500 sm:block">
                            {new Date().toLocaleDateString(
                                language === "gu" ? "gu-IN" : "en-IN",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                }
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t("navbar.searchPlaceholder")}
                            className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400 xl:w-56"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 sm:px-3"
                        title={
                            language === "en"
                                ? t("navbar.switchToGujarati")
                                : t("navbar.switchToEnglish")
                        }
                    >
                        <Globe2 className="h-4 w-4" />
                        <span>
                            {language === "en" ? "ગુ" : "EN"}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
                        title={t("navbar.notifications")}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    </button>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-2 sm:pl-3">
                        <div className="hidden text-right sm:block">
                            <p className="max-w-28 truncate text-sm font-bold text-slate-800">
                                {user?.fullName || user?.name || "User"}
                            </p>
                            <p className="text-xs capitalize text-slate-500">
                                {user?.role || "User"}
                            </p>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                            <UserCircle2 className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;