import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    ListChecks,
    PlusCircle,
    Calendar,
    ClipboardList,
    BarChart3,
    Trophy,
    FileText,
    ChevronRight
} from "lucide-react";

const ALL_FEATURES = [

    {
        title: "Exam Dashboard",
        description: "Overview of total, upcoming, ongoing and completed exams with analytics.",
        path: "/exams/dashboard",
        icon: LayoutDashboard,
        color: "from-indigo-500 to-indigo-400",
        bg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Exam List",
        description: "Browse all exams with filters by class, type and status.",
        path: "/exams/list",
        icon: ListChecks,
        color: "from-blue-500 to-blue-400",
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        roles: ["admin", "teacher", "student"]
    },

    {
        title: "Create Exam",
        description: "Define a new exam with type, class, date range and passing marks.",
        path: "/exams/create",
        icon: PlusCircle,
        color: "from-purple-500 to-purple-400",
        bg: "bg-purple-50",
        iconColor: "text-purple-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Exam Schedule",
        description: "Assign subjects, dates, timings and room numbers to an exam.",
        path: "/exams/list",
        icon: Calendar,
        color: "from-cyan-500 to-cyan-400",
        bg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        roles: ["admin", "teacher", "student"]
    },

    {
        title: "Marks Entry",
        description: "Enter marks for each student per subject efficiently.",
        path: "/exams/list",
        icon: ClipboardList,
        color: "from-orange-500 to-orange-400",
        bg: "bg-orange-50",
        iconColor: "text-orange-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Class Results",
        description: "View full class result with ranks, grades and pass/fail status.",
        path: "/exams/list",
        icon: Trophy,
        color: "from-yellow-500 to-yellow-400",
        bg: "bg-yellow-50",
        iconColor: "text-yellow-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "My Results",
        description: "View your exam results, grades and download your report card.",
        path: "/exams/my-results",
        icon: FileText,
        color: "from-green-500 to-green-400",
        bg: "bg-green-50",
        iconColor: "text-green-600",
        roles: ["student"]
    },

    {
        title: "Analytics",
        description: "Grade distribution, exam-wise performance and class comparison charts.",
        path: "/exams/analytics",
        icon: BarChart3,
        color: "from-rose-500 to-rose-400",
        bg: "bg-rose-50",
        iconColor: "text-rose-600",
        roles: ["admin", "teacher"]
    }

];

const Exams = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const visibleFeatures = ALL_FEATURES.filter(

        (f) => f.roles.includes(user?.role)

    );

    const isTeacherOrAdmin =
        user?.role === "admin" || user?.role === "teacher";

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="mb-10">

                <h1 className="text-4xl font-bold text-slate-800">Exams</h1>

                <p className="mt-2 text-slate-500">Select a feature to get started.</p>

            </div>

            {/* ============================== Hero Banner ============================== */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B2EFF] via-blue-600 to-cyan-500 p-10 mb-10 shadow-xl">

                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="absolute -left-20 bottom-0 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

                    <div>

                        <h2 className="text-3xl font-bold text-white">Examination Module</h2>

                        <p className="text-blue-100 mt-3 text-lg max-w-xl">
                            Create exams, build schedules, enter marks and generate
                            ranked results and report cards automatically.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-6">

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">
                                <p className="text-xs text-blue-200">Features</p>
                                <p className="text-xl font-bold">{visibleFeatures.length}</p>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">
                                <p className="text-xs text-blue-200">Role</p>
                                <p className="text-xl font-bold capitalize">{user?.role}</p>
                            </div>

                        </div>

                    </div>

                    <button
                        onClick={() => navigate(isTeacherOrAdmin ? "/exams/create" : "/exams/my-results")}
                        className="shrink-0 bg-white text-[#5B2EFF] font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition text-lg"
                    >
                        {isTeacherOrAdmin ? "📝 Create Exam" : "📊 My Results"}
                    </button>

                </div>

            </div>

            {/* ============================== Feature Cards ============================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {visibleFeatures.map((feature) => {

                    const Icon = feature.icon;

                    return (

                        <div
                            key={feature.title}
                            onClick={() => navigate(feature.path)}
                            className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-7 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >

                            <div className="flex items-start justify-between mb-6">

                                <div className={"w-14 h-14 rounded-2xl " + feature.bg + " flex items-center justify-center"}>
                                    <Icon size={28} className={feature.iconColor} />
                                </div>

                                <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#5B2EFF] flex items-center justify-center transition-all duration-300">
                                    <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-all duration-300" />
                                </div>

                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>

                            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>

                            <div className={"mt-6 h-1 rounded-full bg-gradient-to-r " + feature.color + " w-0 group-hover:w-full transition-all duration-500"}></div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

};

export default Exams;