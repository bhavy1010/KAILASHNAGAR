import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Trophy,
    Plus,
    CheckCircle,
    TrendingUp,
    BarChart3,
    BookOpen,
    Calendar,
    Languages,
    Loader2
} from "lucide-react";

import { getExamDashboard } from "../../services/examService";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_STYLE = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-green-100 text-green-700",
    Completed: "bg-gray-100 text-gray-600"
};

const STATUS_LABEL_GU = {
    Upcoming: "આગામી",
    Ongoing: "ચાલુ",
    Completed: "પૂર્ણ"
};

const GRADE_COLORS = [
    "bg-green-500",
    "bg-green-400",
    "bg-blue-500",
    "bg-blue-400",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500"
];

const TYPE_COLORS = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-violet-500"
];

const ExamDashboard = () => {
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const text = {
        title: isGujarati ? "પરીક્ષા ડેશબોર્ડ" : "Exam Dashboard",
        subtitle: isGujarati
            ? "બધી પરીક્ષાઓ અને વિદ્યાર્થીની કામગીરીની ઝાંખી."
            : "Overview of all exams and student performance.",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        createExam: isGujarati ? "પરીક્ષા બનાવો" : "Create Exam",
        loading: isGujarati ? "ડેશબોર્ડ લોડ થઈ રહ્યું છે..." : "Loading dashboard...",
        totalExams: isGujarati ? "કુલ પરીક્ષાઓ" : "Total Exams",
        upcoming: isGujarati ? "આગામી" : "Upcoming",
        ongoing: isGujarati ? "ચાલુ" : "Ongoing",
        completed: isGujarati ? "પૂર્ણ" : "Completed",
        results: isGujarati ? "પરિણામો" : "Results",
        avgScore: isGujarati ? "સરેરાશ સ્કોર" : "Avg Score",
        examTypeDist: isGujarati ? "પરીક્ષા પ્રકાર વિતરણ" : "Exam Type Distribution",
        examTypeSub: isGujarati ? "પ્રકાર દીઠ પરીક્ષાઓની સંખ્યા" : "Number of exams per type",
        noExamData: isGujarati ? "હજુ સુધી કોઈ પરીક્ષા ડેટા નથી" : "No exam data yet",
        gradeDist: isGujarati ? "ગ્રેડ વિતરણ" : "Grade Distribution",
        gradeDistSub: isGujarati
            ? "તમામ પરિણામોમાં એકંદર ગ્રેડ ફેલાવો"
            : "Overall grade spread across all results",
        noResultData: isGujarati ? "હજુ સુધી કોઈ પરિણામ ડેટા નથી" : "No result data yet",
        examsSuffix: isGujarati ? "પરીક્ષાઓ" : "exams",
        quickActions: isGujarati ? "ઝડપી ક્રિયાઓ" : "Quick Actions",
        allExams: isGujarati ? "બધી પરીક્ષાઓ" : "All Exams",
        ongoingExams: isGujarati ? "ચાલુ પરીક્ષાઓ" : "Ongoing Exams",
        analytics: isGujarati ? "એનાલિટિક્સ" : "Analytics",
        recentExams: isGujarati ? "તાજેતરની પરીક્ષાઓ" : "Recent Exams",
        recentExamsSub: isGujarati ? "છેલ્લી 7 બનાવેલી પરીક્ષાઓ" : "Last 7 exams created",
        viewAll: isGujarati ? "બધું જુઓ" : "View All",
        noExamsCreated: isGujarati ? "હજુ સુધી કોઈ પરીક્ષા બનાવી નથી" : "No exams created yet",
        examName: isGujarati ? "પરીક્ષાનું નામ" : "Exam Name",
        type: isGujarati ? "પ્રકાર" : "Type",
        class: isGujarati ? "ધોરણ" : "Class",
        startDate: isGujarati ? "શરૂઆત તારીખ" : "Start Date",
        status: isGujarati ? "સ્થિતિ" : "Status",
        action: isGujarati ? "ક્રિયા" : "Action",
        view: isGujarati ? "જુઓ" : "View",
        std: isGujarati ? "ધોરણ" : "Std"
    };

    const statusLabel = (status) =>
        isGujarati ? STATUS_LABEL_GU[status] || status : status;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const response = await getExamDashboard();

            setData(response);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                <p className="font-medium text-slate-500">{text.loading}</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const recentExams = data?.recentExams || [];
    const examTypeWise = data?.examTypeWise || [];

    const maxTypeCount =
        examTypeWise.length > 0 ? Math.max(...examTypeWise.map((t) => t.count)) : 1;

    const gradeDistribution = data?.gradeDistribution || [];

    const maxGradeCount =
        gradeDistribution.length > 0
            ? Math.max(...gradeDistribution.map((g) => g.count))
            : 1;

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow transition hover:border-[#5B2EFF] hover:text-[#5B2EFF] sm:py-3"
                    >
                        <Languages size={16} />
                        {text.switchLang}
                    </button>

                    <button
                        onClick={() => navigate("/exams/create")}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db] sm:px-6 sm:py-3"
                    >
                        <Plus size={18} />
                        {text.createExam}
                    </button>
                </div>
            </div>

            {/* ============================== Stat Cards ============================== */}

            <div className="mb-6 grid grid-cols-2 gap-4 sm:mb-8 sm:gap-5 md:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm text-gray-500">{text.totalExams}</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-800 sm:text-3xl">
                                {stats.totalExams || 0}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 sm:h-12 sm:w-12">
                            <Trophy size={20} className="text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm text-gray-500">{text.upcoming}</p>
                            <h3 className="mt-1 text-2xl font-bold text-blue-600 sm:text-3xl">
                                {stats.upcomingExams || 0}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-12 sm:w-12">
                            <Calendar size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm text-gray-500">{text.ongoing}</p>
                            <h3 className="mt-1 text-2xl font-bold text-green-600 sm:text-3xl">
                                {stats.ongoingExams || 0}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 sm:h-12 sm:w-12">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm text-gray-500">{text.completed}</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-600 sm:text-3xl">
                                {stats.completedExams || 0}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 sm:h-12 sm:w-12">
                            <BookOpen size={20} className="text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm text-gray-500">{text.results}</p>
                            <h3 className="mt-1 text-2xl font-bold text-purple-600 sm:text-3xl">
                                {stats.totalResults || 0}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 sm:h-12 sm:w-12">
                            <BarChart3 size={20} className="text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm text-gray-500">{text.avgScore}</p>
                            <h3 className="mt-1 text-2xl font-bold text-orange-600 sm:text-3xl">
                                {stats.avgPercentage || 0}%
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 sm:h-12 sm:w-12">
                            <TrendingUp size={20} className="text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================== Charts Row ============================== */}

            <div className="mb-6 grid grid-cols-1 gap-7 sm:mb-7 xl:grid-cols-2">
                {/* Exam Type Wise */}

                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow sm:p-8">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                            <BarChart3 size={20} className="text-indigo-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">{text.examTypeDist}</h2>
                            <p className="text-sm text-gray-500">{text.examTypeSub}</p>
                        </div>
                    </div>

                    {examTypeWise.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            {text.noExamData}
                        </div>
                    )}

                    {examTypeWise.length > 0 && (
                        <div className="space-y-5">
                            {examTypeWise.map((item, index) => {
                                const percent = Math.round((item.count / maxTypeCount) * 100);

                                return (
                                    <div key={item._id}>
                                        <div className="mb-2 flex justify-between gap-2">
                                            <span className="truncate font-semibold text-gray-700">
                                                {item._id}
                                            </span>
                                            <span className="shrink-0 font-semibold text-gray-500">
                                                {item.count} {text.examsSuffix}
                                            </span>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={
                                                    "h-full rounded-full transition-all duration-700 " +
                                                    TYPE_COLORS[index % TYPE_COLORS.length]
                                                }
                                                style={{ width: percent + "%" }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Grade Distribution */}

                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow sm:p-8">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                            <Trophy size={20} className="text-purple-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">{text.gradeDist}</h2>
                            <p className="text-sm text-gray-500">{text.gradeDistSub}</p>
                        </div>
                    </div>

                    {gradeDistribution.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            {text.noResultData}
                        </div>
                    )}

                    {gradeDistribution.length > 0 && (
                        <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
                            {gradeDistribution.map((item, index) => {
                                const heightPercent =
                                    maxGradeCount > 0
                                        ? Math.round((item.count / maxGradeCount) * 100)
                                        : 0;

                                return (
                                    <div
                                        key={item.grade}
                                        className="group flex flex-1 flex-col items-center gap-2"
                                    >
                                        <span className="text-xs font-semibold text-gray-600">
                                            {item.count}
                                        </span>

                                        <div className="flex h-36 w-full items-end overflow-hidden rounded-xl bg-gray-50">
                                            <div
                                                className={
                                                    "w-full rounded-xl transition-all duration-700 " +
                                                    GRADE_COLORS[index % GRADE_COLORS.length]
                                                }
                                                style={{ height: heightPercent + "%" }}
                                            ></div>
                                        </div>

                                        <span className="text-sm font-bold text-gray-700">
                                            {item.grade}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ============================== Quick Actions ============================== */}

            <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow sm:mb-7 sm:p-8">
                <h2 className="mb-6 text-xl font-bold">{text.quickActions}</h2>

                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
                    <button
                        onClick={() => navigate("/exams/list")}
                        className="h-20 rounded-2xl bg-indigo-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-indigo-600 sm:h-24 sm:text-base"
                    >
                        {text.allExams}
                    </button>

                    <button
                        onClick={() => navigate("/exams/create")}
                        className="h-20 rounded-2xl bg-purple-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-purple-600 sm:h-24 sm:text-base"
                    >
                        {text.createExam}
                    </button>

                    <button
                        onClick={() => navigate("/exams/list?status=Ongoing")}
                        className="h-20 rounded-2xl bg-green-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-green-600 sm:h-24 sm:text-base"
                    >
                        {text.ongoingExams}
                    </button>

                    <button
                        onClick={() => navigate("/exams/analytics")}
                        className="h-20 rounded-2xl bg-orange-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-orange-600 sm:h-24 sm:text-base"
                    >
                        {text.analytics}
                    </button>
                </div>
            </div>

            {/* ============================== Recent Exams ============================== */}

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow">
                <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                    <div>
                        <h2 className="text-xl font-bold">{text.recentExams}</h2>
                        <p className="mt-1 text-gray-500">{text.recentExamsSub}</p>
                    </div>

                    <button
                        onClick={() => navigate("/exams/list")}
                        className="text-sm font-semibold text-indigo-600 hover:underline"
                    >
                        {text.viewAll}
                    </button>
                </div>

                {recentExams.length === 0 && (
                    <div className="py-16 text-center">
                        <Trophy size={50} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">{text.noExamsCreated}</p>
                    </div>
                )}

                {recentExams.length > 0 && (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[700px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">{text.examName}</th>
                                        <th className="px-6 py-4 text-left">{text.type}</th>
                                        <th className="px-6 py-4 text-left">{text.class}</th>
                                        <th className="px-6 py-4 text-left">{text.startDate}</th>
                                        <th className="px-6 py-4 text-left">{text.status}</th>
                                        <th className="px-6 py-4 text-center">{text.action}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentExams.map((exam) => (
                                        <tr
                                            key={exam._id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-800">
                                                    {exam.examName}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                    {exam.examType}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {text.std} {exam.standard} - {exam.division}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {formatDate(exam.startDate)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={
                                                        "rounded-full px-3 py-1 text-xs font-semibold " +
                                                        (STATUS_STYLE[exam.status] ||
                                                            "bg-gray-100 text-gray-600")
                                                    }
                                                >
                                                    {statusLabel(exam.status)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => navigate("/exams/" + exam._id)}
                                                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600"
                                                >
                                                    {text.view}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="divide-y divide-gray-100 sm:hidden">
                            {recentExams.map((exam) => (
                                <div key={exam._id} className="p-4">
                                    <div className="mb-2 flex items-start justify-between gap-3">
                                        <p className="font-semibold text-gray-800">
                                            {exam.examName}
                                        </p>

                                        <span
                                            className={
                                                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold " +
                                                (STATUS_STYLE[exam.status] ||
                                                    "bg-gray-100 text-gray-600")
                                            }
                                        >
                                            {statusLabel(exam.status)}
                                        </span>
                                    </div>

                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-700">
                                            {exam.examType}
                                        </span>
                                        <span>
                                            {text.std} {exam.standard} - {exam.division}
                                        </span>
                                        <span>{formatDate(exam.startDate)}</span>
                                    </div>

                                    <button
                                        onClick={() => navigate("/exams/" + exam._id)}
                                        className="w-full rounded-lg bg-indigo-500 py-2 text-sm text-white transition hover:bg-indigo-600"
                                    >
                                        {text.view}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExamDashboard;