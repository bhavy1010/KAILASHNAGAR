import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    ListChecks,
    PlusCircle,
    FileText,
    BookOpen,
    Upload,
    Star,
    BarChart3,
    ChevronRight
} from "lucide-react";

const ALL_FEATURES = [

    {
        title: "Homework Dashboard",
        description: "Overview of total, active, overdue homework and submission trends.",
        path: "/homework/dashboard",
        icon: LayoutDashboard,
        color: "from-indigo-500 to-indigo-400",
        bg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Homework List",
        description: "Browse all homework with search, subject filter, status and class filter.",
        path: "/homework/list",
        icon: ListChecks,
        color: "from-blue-500 to-blue-400",
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Create Homework",
        description: "Assign new homework to a class with description, due date and attachment.",
        path: "/homework/create",
        icon: PlusCircle,
        color: "from-purple-500 to-purple-400",
        bg: "bg-purple-50",
        iconColor: "text-purple-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "My Homework",
        description: "View all homework assigned to your class with due dates and status.",
        path: "/homework/my",
        icon: BookOpen,
        color: "from-green-500 to-green-400",
        bg: "bg-green-50",
        iconColor: "text-green-600",
        roles: ["student"]
    },

    {
        title: "Submit Homework",
        description: "Upload your answer or file for a homework assignment.",
        path: "/homework/my",
        icon: Upload,
        color: "from-teal-500 to-teal-400",
        bg: "bg-teal-50",
        iconColor: "text-teal-600",
        roles: ["student"]
    },

    {
        title: "Review & Grade",
        description: "View student submissions and provide grades and feedback.",
        path: "/homework/list",
        icon: Star,
        color: "from-orange-500 to-orange-400",
        bg: "bg-orange-50",
        iconColor: "text-orange-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Analytics",
        description: "Submission trends, subject-wise stats and class performance charts.",
        path: "/homework/dashboard",
        icon: BarChart3,
        color: "from-rose-500 to-rose-400",
        bg: "bg-rose-50",
        iconColor: "text-rose-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Homework Details",
        description: "View complete homework info, submissions and grading panel.",
        path: "/homework/list",
        icon: FileText,
        color: "from-cyan-500 to-cyan-400",
        bg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        roles: ["admin", "teacher", "student"]
    }

];

const Homework = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const visibleFeatures = ALL_FEATURES.filter(

        (f) => f.roles.includes(user?.role)

    );

    const isTeacherOrAdmin =
        user?.role === "admin" ||
        user?.role === "teacher";

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ===================== Header ===================== */}

            <div className="mb-10">

                <h1 className="text-4xl font-bold text-slate-800">

                    Homework

                </h1>

                <p className="mt-2 text-slate-500">

                    Select a feature to get started.

                </p>

            </div>

            {/* ===================== Hero Banner ===================== */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B2EFF] via-purple-600 to-indigo-500 p-10 mb-10 shadow-xl">

                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="absolute -left-20 bottom-0 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

                    <div>

                        <h2 className="text-3xl font-bold text-white">

                            Homework Module

                        </h2>

                        <p className="text-purple-100 mt-3 text-lg max-w-xl">

                            Create, assign and track homework across all classes.
                            Students submit answers, teachers grade and provide feedback.

                        </p>

                        <div className="flex flex-wrap gap-4 mt-6">

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">

                                <p className="text-xs text-purple-200">

                                    Features

                                </p>

                                <p className="text-xl font-bold">

                                    {visibleFeatures.length}

                                </p>

                            </div>

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">

                                <p className="text-xs text-purple-200">

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
                                isTeacherOrAdmin
                                    ? "/homework/create"
                                    : "/homework/my"
                            )
                        }
                        className="shrink-0 bg-white text-[#5B2EFF] font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition text-lg"
                    >

                        {

                            isTeacherOrAdmin
                                ? "📝 Create Homework"
                                : "📚 My Homework"

                        }

                    </button>

                </div>

            </div>

            {/* ===================== Feature Cards ===================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {

                    visibleFeatures.map((feature) => {

                        const Icon = feature.icon;

                        return (

                            <div
                                key={`${feature.title}-${feature.path}`}
                                onClick={() => navigate(feature.path)}
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

                                    {feature.title}

                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed">

                                    {feature.description}

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

export default Homework;