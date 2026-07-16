import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    ListChecks,
    PlusCircle,
    FileText,
    Bell,
    Archive,
    BarChart3,
    ChevronRight
} from "lucide-react";

const ALL_FEATURES = [

    {
        title: "Notice Dashboard",
        description: "Overview of total, active, urgent notices and category-wise charts.",
        path: "/notices/dashboard",
        icon: LayoutDashboard,
        color: "from-indigo-500 to-indigo-400",
        bg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        roles: ["admin"]
    },

    {
        title: "All Notices",
        description: "Browse all notices with search, category, priority and audience filters.",
        path: "/notices/list",
        icon: ListChecks,
        color: "from-blue-500 to-blue-400",
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Create Notice",
        description: "Publish a new notice with category, priority, audience and attachment.",
        path: "/notices/create",
        icon: PlusCircle,
        color: "from-purple-500 to-purple-400",
        bg: "bg-purple-50",
        iconColor: "text-purple-600",
        roles: ["admin", "teacher"]
    },

    {
        title: "Notice Board",
        description: "View notices relevant to your role — personalized and up to date.",
        path: "/notices/board",
        icon: Bell,
        color: "from-green-500 to-green-400",
        bg: "bg-green-50",
        iconColor: "text-green-600",
        roles: ["admin", "teacher", "student"]
    },

    {
        title: "Notice Details",
        description: "Read a full notice, download attachments and print.",
        path: "/notices/list",
        icon: FileText,
        color: "from-cyan-500 to-cyan-400",
        bg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        roles: ["admin", "teacher", "student"]
    },

    {
        title: "Archived Notices",
        description: "Browse historical notices that have been archived.",
        path: "/notices/archived",
        icon: Archive,
        color: "from-orange-500 to-orange-400",
        bg: "bg-orange-50",
        iconColor: "text-orange-600",
        roles: ["admin"]
    },

    {
        title: "Analytics",
        description: "Category-wise breakdown, audience distribution and view counts.",
        path: "/notices/dashboard",
        icon: BarChart3,
        color: "from-rose-500 to-rose-400",
        bg: "bg-rose-50",
        iconColor: "text-rose-600",
        roles: ["admin"]
    }

];

const Notices = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const visibleFeatures = ALL_FEATURES.filter(

        (f) => f.roles.includes(user?.role)

    );

    const isAdmin = user?.role === "admin";

    const isTeacherOrAdmin =
        user?.role === "admin" || user?.role === "teacher";

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="mb-10">

                <h1 className="text-4xl font-bold text-slate-800">Notices</h1>

                <p className="mt-2 text-slate-500">Select a feature to get started.</p>

            </div>

            {/* ============================== Hero Banner ============================== */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B2EFF] via-indigo-600 to-blue-500 p-10 mb-10 shadow-xl">

                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="absolute -left-20 bottom-0 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

                    <div>

                        <h2 className="text-3xl font-bold text-white">Notice Module</h2>

                        <p className="text-indigo-100 mt-3 text-lg max-w-xl">
                            Publish, manage and track school notices.
                            Reach students, teachers or everyone with one click.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-6">

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">
                                <p className="text-xs text-indigo-200">Features</p>
                                <p className="text-xl font-bold">{visibleFeatures.length}</p>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-xl px-5 py-3 text-white">
                                <p className="text-xs text-indigo-200">Role</p>
                                <p className="text-xl font-bold capitalize">{user?.role}</p>
                            </div>

                        </div>

                    </div>

                    <button
                        onClick={() => navigate(isTeacherOrAdmin ? "/notices/create" : "/notices/board")}
                        className="shrink-0 bg-white text-[#5B2EFF] font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition text-lg"
                    >
                        {isTeacherOrAdmin ? "📢 Create Notice" : "🔔 View Board"}
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

export default Notices;