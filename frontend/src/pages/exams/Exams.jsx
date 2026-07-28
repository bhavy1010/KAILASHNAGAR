import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
    LayoutDashboard,
    ListChecks,
    PlusCircle,
    Calendar,
    ClipboardList,
    BarChart3,
    Trophy,
    FileText,
    ChevronRight,
    Languages
} from "lucide-react";

const ROLE_LABEL_GU = {
    student: "વિદ્યાર્થી",
    teacher: "શિક્ષક",
    admin: "એડમિન"
};

const ALL_FEATURES = [
    {
        key: "dashboard",
        title: { en: "Exam Dashboard", gu: "પરીક્ષા ડેશબોર્ડ" },
        description: {
            en: "Overview of total, upcoming, ongoing and completed exams with analytics.",
            gu: "કુલ, આગામી, ચાલુ અને પૂર્ણ થયેલ પરીક્ષાઓનું વિશ્લેષણ સાથે ઝાંખી."
        },
        path: "/exams/dashboard",
        icon: LayoutDashboard,
        color: "from-indigo-500 to-indigo-400",
        bg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        roles: ["admin", "teacher"]
    },
    {
        key: "list",
        title: { en: "Exam List", gu: "પરીક્ષા યાદી" },
        description: {
            en: "Browse all exams with filters by class, type and status.",
            gu: "ધોરણ, પ્રકાર અને સ્થિતિ પ્રમાણે ફિલ્ટર સાથે બધી પરીક્ષાઓ જુઓ."
        },
        path: "/exams/list",
        icon: ListChecks,
        color: "from-blue-500 to-blue-400",
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        roles: ["admin", "teacher", "student"]
    },
    {
        key: "create",
        title: { en: "Create Exam", gu: "પરીક્ષા બનાવો" },
        description: {
            en: "Define a new exam with type, class, date range and passing marks.",
            gu: "પ્રકાર, ધોરણ, તારીખ શ્રેણી અને પાસિંગ માર્ક્સ સાથે નવી પરીક્ષા બનાવો."
        },
        path: "/exams/create",
        icon: PlusCircle,
        color: "from-purple-500 to-purple-400",
        bg: "bg-purple-50",
        iconColor: "text-purple-600",
        roles: ["admin", "teacher"]
    },
    {
        key: "schedule",
        title: { en: "Exam Schedule", gu: "પરીક્ષા સમયપત્રક" },
        description: {
            en: "Assign subjects, dates, timings and room numbers to an exam.",
            gu: "પરીક્ષાને વિષયો, તારીખો, સમય અને રૂમ નંબર સોંપો."
        },
        path: "/exams/list",
        icon: Calendar,
        color: "from-cyan-500 to-cyan-400",
        bg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        roles: ["admin", "teacher"]
    },
    {
        key: "marks",
        title: { en: "Marks Entry", gu: "માર્ક્સ એન્ટ્રી" },
        description: {
            en: "Enter marks for each student per subject efficiently.",
            gu: "દરેક વિદ્યાર્થી માટે વિષય પ્રમાણે ઝડપથી માર્ક્સ દાખલ કરો."
        },
        path: "/exams/list",
        icon: ClipboardList,
        color: "from-orange-500 to-orange-400",
        bg: "bg-orange-50",
        iconColor: "text-orange-600",
        roles: ["admin", "teacher"]
    },
    {
        key: "results",
        title: { en: "Class Results", gu: "ધોરણ પરિણામો" },
        description: {
            en: "View full class result with ranks, grades and pass/fail status.",
            gu: "રેન્ક, ગ્રેડ અને પાસ/ફેલ સ્થિતિ સાથે સંપૂર્ણ ધોરણનું પરિણામ જુઓ."
        },
        path: "/exams/list",
        icon: Trophy,
        color: "from-yellow-500 to-yellow-400",
        bg: "bg-yellow-50",
        iconColor: "text-yellow-600",
        roles: ["admin", "teacher"]
    },
    {
        key: "myResults",
        title: { en: "My Results", gu: "મારા પરિણામો" },
        description: {
            en: "View your exam results, grades and download your report card.",
            gu: "તમારા પરીક્ષા પરિણામો, ગ્રેડ જુઓ અને રિપોર્ટ કાર્ડ ડાઉનલોડ કરો."
        },
        path: "/exams/my-results",
        icon: FileText,
        color: "from-green-500 to-green-400",
        bg: "bg-green-50",
        iconColor: "text-green-600",
        roles: ["student"]
    },
    {
        key: "analytics",
        title: { en: "Analytics", gu: "એનાલિટિક્સ" },
        description: {
            en: "Grade distribution, exam-wise performance and class comparison charts.",
            gu: "ગ્રેડ વિતરણ, પરીક્ષા-વાર કામગીરી અને ધોરણ સરખામણી ચાર્ટ."
        },
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
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const text = {
        title: isGujarati ? "પરીક્ષાઓ" : "Exams",
        subtitle: isGujarati
            ? "શરૂ કરવા માટે એક ફીચર પસંદ કરો."
            : "Select a feature to get started.",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        heroTitle: isGujarati ? "પરીક્ષા મોડ્યુલ" : "Examination Module",
        heroDescription: isGujarati
            ? "પરીક્ષાઓ બનાવો, સમયપત્રક તૈયાર કરો, માર્ક્સ દાખલ કરો અને આપોઆપ ક્રમાંકિત પરિણામો અને રિપોર્ટ કાર્ડ બનાવો."
            : "Create exams, build schedules, enter marks and generate ranked results and report cards automatically.",
        features: isGujarati ? "ફીચર્સ" : "Features",
        role: isGujarati ? "ભૂમિકા" : "Role",
        createExam: isGujarati ? "📝 પરીક્ષા બનાવો" : "📝 Create Exam",
        myResults: isGujarati ? "📊 મારા પરિણામો" : "📊 My Results"
    };

    const roleLabel = (role) => (isGujarati ? ROLE_LABEL_GU[role] || role : role);

    const visibleFeatures = ALL_FEATURES.filter((f) => f.roles.includes(user?.role));

    const isTeacherOrAdmin = user?.role === "admin" || user?.role === "teacher";

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                <button
                    onClick={toggleLanguage}
                    className="flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#5B2EFF] hover:text-[#5B2EFF]"
                >
                    <Languages size={16} />
                    {text.switchLang}
                </button>
            </div>

            {/* ============================== Hero Banner ============================== */}

            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B2EFF] via-blue-600 to-cyan-500 p-6 shadow-xl sm:mb-10 sm:p-10">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-white opacity-10 blur-3xl"></div>

                <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            {text.heroTitle}
                        </h2>

                        <p className="mt-3 max-w-xl text-base text-blue-100 sm:text-lg">
                            {text.heroDescription}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <div className="rounded-xl bg-white bg-opacity-20 px-5 py-3 text-white">
                                <p className="text-xs text-blue-200">{text.features}</p>
                                <p className="text-xl font-bold">{visibleFeatures.length}</p>
                            </div>

                            <div className="rounded-xl bg-white bg-opacity-20 px-5 py-3 text-white">
                                <p className="text-xs text-blue-200">{text.role}</p>
                                <p className="text-xl font-bold capitalize">
                                    {roleLabel(user?.role)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            navigate(isTeacherOrAdmin ? "/exams/create" : "/exams/my-results")
                        }
                        className="w-full shrink-0 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-[#5B2EFF] shadow-lg transition hover:scale-105 md:w-auto"
                    >
                        {isTeacherOrAdmin ? text.createExam : text.myResults}
                    </button>
                </div>
            </div>

            {/* ============================== Feature Cards ============================== */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visibleFeatures.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <div
                            key={feature.key}
                            onClick={() => navigate(feature.path)}
                            className="group cursor-pointer rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
                        >
                            <div className="mb-6 flex items-start justify-between">
                                <div
                                    className={
                                        "flex h-14 w-14 items-center justify-center rounded-2xl " +
                                        feature.bg
                                    }
                                >
                                    <Icon size={28} className={feature.iconColor} />
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 transition-all duration-300 group-hover:bg-[#5B2EFF]">
                                    <ChevronRight
                                        size={18}
                                        className="text-gray-400 transition-all duration-300 group-hover:text-white"
                                    />
                                </div>
                            </div>

                            <h3 className="mb-3 text-xl font-bold text-gray-800">
                                {isGujarati ? feature.title.gu : feature.title.en}
                            </h3>

                            <p className="text-sm leading-relaxed text-gray-500">
                                {isGujarati ? feature.description.gu : feature.description.en}
                            </p>

                            <div
                                className={
                                    "mt-6 h-1 w-0 rounded-full bg-gradient-to-r transition-all duration-500 group-hover:w-full " +
                                    feature.color
                                }
                            ></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Exams;