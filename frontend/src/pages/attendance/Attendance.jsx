import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    ClipboardCheck,
    CalendarDays,
    History,
    User,
    BookOpen,
    Plane,
    BarChart3,
    ChevronRight
} from "lucide-react";

const ALL_FEATURES = [

    {
        title: "Attendance Dashboard",
        description: "Today's overview — present, absent, late, leave counts and weekly trend charts.",
        path: "/attendance/dashboard",
        icon: LayoutDashboard,
        color: "from-indigo-500 to-indigo-400",
        bg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Mark Attendance",
        description: "Select class and division, load students, mark Present / Absent / Late / Leave.",
        path: "/attendance/mark",
        icon: ClipboardCheck,
        color: "from-purple-500 to-purple-400",
        bg: "bg-purple-50",
        iconColor: "text-purple-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Today's Attendance",
        description: "View all attendance records marked today. Search by student name or GR number.",
        path: "/attendance/today",
        icon: CalendarDays,
        color: "from-green-500 to-green-400",
        bg: "bg-green-50",
        iconColor: "text-green-600",
        roles: ["admin", "teacher", "student"]
    },

    {
        title: "Attendance History",
        description: "Browse past records filtered by class, division, month, year and status.",
        path: "/attendance/history",
        icon: History,
        color: "from-blue-500 to-blue-400",
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Student Report",
        description: "Per-student attendance %, monthly breakdown chart and calendar view.",
        path: "/attendance/student/me",
        icon: User,
        color: "from-cyan-500 to-cyan-400",
        bg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        roles: ["student"]
    },

    {
        title: "Class Report",
        description: "Monthly attendance summary for a full class — sortable by percentage.",
        path: "/attendance/class-report",
        icon: BookOpen,
        color: "from-teal-500 to-teal-400",
        bg: "bg-teal-50",
        iconColor: "text-teal-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Leave Management",
        studentTitle: "My Leaves",
        description: "Review, approve or reject student leave requests in one place.",
        studentDescription: "Apply for leave and track the status of your requests.",
        path: "/attendance/leaves",
        icon: Plane,
        color: "from-orange-500 to-orange-400",
        bg: "bg-orange-50",
        iconColor: "text-orange-600",
        roles: ["admin", "teacher", "student"]
    },

    {
        title: "Analytics",
        description: "Daily trends, class comparison charts and ranked performance table.",
        path: "/attendance/analytics",
        icon: BarChart3,
        color: "from-rose-500 to-rose-400",
        bg: "bg-rose-50",
        iconColor: "text-rose-600",
        roles: ["admin", "teacher"]
    }

];

const Attendance = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const visibleFeatures = ALL_FEATURES.filter(

        (f) => f.roles.includes(user?.role)

    );

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ===================== Header ===================== */}

            <div className="mb-10">

                <h1 className="text-4xl font-bold text-slate-800">

                    Attendance

                </h1>

                <p className="mt-2 text-slate-500">

                    Select a feature to get started.

                </p>

            </div>

            {/* ===================== Hero Banner ===================== */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B2EFF] via-indigo-600 to-blue-500 p-10 mb-10 shadow-xl">

                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="absolute -left-20 bottom-0 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

                    <div>

                        <h2 className="text-3xl font-bold text-white">

                            Attendance Module

                        </h2>

                        <p className="text-indigo-100 mt-3 text-lg max-w-xl">

                            Mark, track and analyse student attendance across all classes.
                            Manage leaves and generate detailed reports.

                        </p>

                        <div className="flex flex-wrap gap-4 mt-6">

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">

                                <p className="text-xs text-indigo-200">

                                    Features

                                </p>

                                <p className="text-xl font-bold">

                                    {visibleFeatures.length}

                                </p>

                            </div>

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">

                                <p className="text-xs text-indigo-200">

                                    Role

                                </p>

                                <p className="text-xl font-bold capitalize">

                                    {user?.role}

                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                user?.role === "student"
                                    ? "/attendance/today"
                                    : "/attendance/mark"
                            )
                        }
                        className="shrink-0 bg-white text-[#5B2EFF] font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition text-lg"
                    >

                        {user?.role === "student"
                            ? "📋 View Attendance"
                            : "📋 Mark Attendance"}

                    </button>

                </div>

            </div>

            {/* ===================== Feature Cards Grid ===================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {

                    visibleFeatures.map((feature) => {

                        const Icon = feature.icon;

                        return (

                            <div
                                key={feature.path}
                                onClick={() =>
                                    navigate(
                                        feature.path === "/attendance/student/me"
                                            ? `/attendance/student/${user?.id}`
                                            : feature.path
                                    )
                                }
                                className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-7 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >

                                <div className="flex items-start justify-between mb-6">

                                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center`}>

                                        <Icon
                                            size={28}
                                            className={feature.iconColor}
                                        />

                                    </div>

                                    <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#5B2EFF] flex items-center justify-center transition-all duration-300">

                                        <ChevronRight
                                            size={18}
                                            className="text-gray-400 group-hover:text-white transition-all duration-300"
                                        />

                                    </div>

                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-3">

                                    {user?.role === "student" && feature.studentTitle
                                        ? feature.studentTitle
                                        : feature.title}

                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed">

                                    {user?.role === "student" && feature.studentDescription
                                        ? feature.studentDescription
                                        : feature.description}

                                </p>

                                <div className={`mt-6 h-1 rounded-full bg-gradient-to-r ${feature.color} w-0 group-hover:w-full transition-all duration-500`}></div>

                            </div>

                        );

                    })

                }

            </div>

        </div>

    );

};

export default Attendance;