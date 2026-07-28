import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Plus,
    Clock,
    CheckCircle,
    AlertTriangle,
    Star,
    ListChecks,
    TrendingUp,
    Loader2,
    Eye
} from "lucide-react";

import { getHomeworkDashboard } from "../../services/homeworkService";
import { useLanguage } from "../../context/LanguageContext";

const BAR_COLORS = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-violet-500",
    "bg-sky-500",
    "bg-fuchsia-500"
];

const HomeworkDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const text = {
        title: isGujarati ? "હોમવર્ક ડેશબોર્ડ" : "Homework Dashboard",
        subtitle: isGujarati
            ? "બધા હોમવર્ક અને સબમિશનનો સારાંશ."
            : "Overview of all homework and submissions.",
        createHomework: isGujarati ? "હોમવર્ક બનાવો" : "Create Homework",
        total: isGujarati ? "કુલ" : "Total",
        active: isGujarati ? "સક્રિય" : "Active",
        overdue: isGujarati ? "મુદત પૂર્ણ" : "Overdue",
        submissions: isGujarati ? "સબમિશન" : "Submissions",
        graded: isGujarati ? "ચકાસેલ" : "Graded",
        pendingGrade: isGujarati ? "ચકાસણી બાકી" : "Pending Grade",
        subjectWise: isGujarati
            ? "વિષય પ્રમાણે હોમવર્ક"
            : "Subject-wise Homework",
        subjectWiseText: isGujarati
            ? "દરેક વિષય માટે હોમવર્કની સંખ્યા"
            : "Number of assignments per subject",
        noHomeworkData: isGujarati
            ? "હજુ સુધી કોઈ હોમવર્ક ડેટા નથી."
            : "No homework data yet",
        assignment: isGujarati ? "હોમવર્ક" : "assignment",
        assignments: isGujarati ? "હોમવર્ક" : "assignments",
        quickActions: isGujarati ? "ઝડપી વિકલ્પો" : "Quick Actions",
        allHomework: isGujarati ? "બધું હોમવર્ક" : "All Homework",
        createNew: isGujarati ? "નવું બનાવો" : "Create New",
        closed: isGujarati ? "બંધ" : "Closed",
        submissionOverview: isGujarati
            ? "સબમિશનનો સારાંશ"
            : "Submission Overview",
        pendingGrading: isGujarati
            ? "ચકાસણી બાકી"
            : "Pending Grading",
        recentHomework: isGujarati
            ? "તાજેતરનું હોમવર્ક"
            : "Recent Homework",
        recentHomeworkText: isGujarati
            ? "છેલ્લા 7 બનાવેલા હોમવર્ક"
            : "Last 7 assignments created",
        viewAll: isGujarati ? "બધું જુઓ" : "View All",
        noHomework: isGujarati
            ? "હજુ સુધી કોઈ હોમવર્ક બનાવવામાં આવ્યું નથી."
            : "No homework created yet",
        homeworkTitle: isGujarati ? "શીર્ષક" : "Title",
        subject: isGujarati ? "વિષય" : "Subject",
        teacher: isGujarati ? "શિક્ષક" : "Teacher",
        dueDate: isGujarati ? "છેલ્લી તારીખ" : "Due Date",
        status: isGujarati ? "સ્થિતિ" : "Status",
        action: isGujarati ? "કાર્ય" : "Action",
        view: isGujarati ? "જુઓ" : "View",
        loading: isGujarati
            ? "હોમવર્ક ડેશબોર્ડ લોડ થઈ રહ્યું છે..."
            : "Loading homework dashboard..."
    };

    const statusLabel = {
        Active: text.active,
        Closed: text.closed
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const response = await getHomeworkDashboard();
            setData(response || {});
        } catch (error) {
            console.log(error);
            setData({});
        } finally {
            setLoading(false);
        }
    };

    const stats = data?.stats || {};
    const recentHomework = data?.recentHomework || [];
    const subjectWise = data?.subjectWise || [];

    const maxSubjectCount =
        subjectWise.length > 0
            ? Math.max(...subjectWise.map((item) => Number(item.count || 0)))
            : 1;

    const totalSubmissions = Number(stats.totalSubmissions || 0);
    const gradedSubmissions = Number(stats.gradedSubmissions || 0);
    const pendingGrading = Number(stats.pendingGrading || 0);

    const gradedPercent =
        totalSubmissions > 0
            ? Math.round((gradedSubmissions / totalSubmissions) * 100)
            : 0;

    const pendingPercent =
        totalSubmissions > 0
            ? Math.round((pendingGrading / totalSubmissions) * 100)
            : 0;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            isGujarati ? "gu-IN" : "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#F5F7FB] px-4">
                <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                <p className="font-medium text-slate-500">{text.loading}</p>
            </div>
        );
    }

    const statCards = [
        {
            title: text.total,
            value: stats.totalHomework || 0,
            icon: BookOpen,
            iconClass: "bg-indigo-100 text-indigo-600",
            valueClass: "text-slate-800"
        },
        {
            title: text.active,
            value: stats.activeHomework || 0,
            icon: CheckCircle,
            iconClass: "bg-green-100 text-green-600",
            valueClass: "text-green-600"
        },
        {
            title: text.overdue,
            value: stats.overdueHomework || 0,
            icon: AlertTriangle,
            iconClass: "bg-red-100 text-red-600",
            valueClass: "text-red-600"
        },
        {
            title: text.submissions,
            value: stats.totalSubmissions || 0,
            icon: ListChecks,
            iconClass: "bg-blue-100 text-blue-600",
            valueClass: "text-blue-600"
        },
        {
            title: text.graded,
            value: stats.gradedSubmissions || 0,
            icon: Star,
            iconClass: "bg-purple-100 text-purple-600",
            valueClass: "text-purple-600"
        },
        {
            title: text.pendingGrade,
            value: stats.pendingGrading || 0,
            icon: Clock,
            iconClass: "bg-orange-100 text-orange-600",
            valueClass: "text-orange-600"
        }
    ];

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                <button
                    onClick={() => navigate("/homework/create")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#4724db] sm:w-auto"
                >
                    <Plus size={18} />
                    {text.createHomework}
                </button>
            </div>

            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        {card.title}
                                    </p>

                                    <h3
                                        className={`mt-1 text-3xl font-bold ${card.valueClass}`}
                                    >
                                        {card.value}
                                    </h3>
                                </div>

                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                                >
                                    <Icon size={22} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-7 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                            <TrendingUp size={20} className="text-indigo-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {text.subjectWise}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {text.subjectWiseText}
                            </p>
                        </div>
                    </div>

                    {subjectWise.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            {text.noHomeworkData}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {subjectWise.map((item, index) => {
                                const count = Number(item.count || 0);
                                const percent = Math.round(
                                    (count / maxSubjectCount) * 100
                                );

                                return (
                                    <div key={item._id || index}>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="truncate font-semibold text-slate-700">
                                                {item._id || "-"}
                                            </span>

                                            <span className="shrink-0 text-sm font-semibold text-slate-500">
                                                {count}{" "}
                                                {count === 1
                                                    ? text.assignment
                                                    : text.assignments}
                                            </span>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${
                                                    BAR_COLORS[
                                                        index % BAR_COLORS.length
                                                    ]
                                                } transition-all duration-700`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="mb-6 text-xl font-bold text-slate-800">
                        {text.quickActions}
                    </h2>

                    <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            onClick={() => navigate("/homework/list")}
                            className="min-h-24 rounded-2xl bg-indigo-500 px-4 py-5 font-semibold text-white transition hover:-translate-y-1 hover:bg-indigo-600"
                        >
                            {text.allHomework}
                        </button>

                        <button
                            onClick={() => navigate("/homework/create")}
                            className="min-h-24 rounded-2xl bg-purple-500 px-4 py-5 font-semibold text-white transition hover:-translate-y-1 hover:bg-purple-600"
                        >
                            {text.createNew}
                        </button>

                        <button
                            onClick={() => navigate("/homework/list")}
                            className="min-h-24 rounded-2xl bg-orange-500 px-4 py-5 font-semibold text-white transition hover:-translate-y-1 hover:bg-orange-600"
                        >
                            {text.pendingGrade}
                        </button>

                        <button
                            onClick={() =>
                                navigate("/homework/list?status=Closed")
                            }
                            className="min-h-24 rounded-2xl bg-slate-500 px-4 py-5 font-semibold text-white transition hover:-translate-y-1 hover:bg-slate-600"
                        >
                            {text.closed}
                        </button>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="mb-4 text-sm font-semibold text-slate-600">
                            {text.submissionOverview}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-500">
                                        {text.graded}
                                    </span>

                                    <span className="font-bold text-green-600">
                                        {gradedSubmissions}
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-green-500 transition-all duration-700"
                                        style={{ width: `${gradedPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-500">
                                        {text.pendingGrading}
                                    </span>

                                    <span className="font-bold text-orange-600">
                                        {pendingGrading}
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-orange-500 transition-all duration-700"
                                        style={{ width: `${pendingPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {text.recentHomework}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {text.recentHomeworkText}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/homework/list")}
                        className="font-semibold text-indigo-600 transition hover:underline"
                    >
                        {text.viewAll}
                    </button>
                </div>

                {recentHomework.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <BookOpen
                            size={50}
                            className="mx-auto mb-4 text-slate-300"
                        />

                        <p className="text-slate-500">{text.noHomework}</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.homeworkTitle}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.subject}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.teacher}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.dueDate}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.status}
                                        </th>

                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                            {text.action}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentHomework.map((homework) => {
                                        const overdue =
                                            homework.status === "Active" &&
                                            new Date(homework.dueDate) <
                                                new Date();

                                        return (
                                            <tr
                                                key={homework._id}
                                                className="border-t border-slate-100 transition hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">
                                                        {homework.title}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                        {homework.subject || "-"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {homework.teacherId?.fullName ||
                                                        "-"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p
                                                        className={`text-sm font-semibold ${
                                                            overdue
                                                                ? "text-red-600"
                                                                : "text-slate-700"
                                                        }`}
                                                    >
                                                        {formatDate(homework.dueDate)}
                                                    </p>

                                                    {overdue && (
                                                        <p className="mt-1 text-xs text-red-400">
                                                            {text.overdue}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            homework.status === "Active"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {statusLabel[homework.status] ||
                                                            homework.status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/homework/${homework._id}`
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                                                    >
                                                        <Eye size={16} />
                                                        {text.view}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 lg:hidden">
                            {recentHomework.map((homework) => {
                                const overdue =
                                    homework.status === "Active" &&
                                    new Date(homework.dueDate) < new Date();

                                return (
                                    <div
                                        key={homework._id}
                                        className="p-4 sm:p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-800">
                                                    {homework.title}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {homework.teacherId?.fullName ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    homework.status === "Active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {statusLabel[homework.status] ||
                                                    homework.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-400">
                                                    {text.subject}
                                                </p>

                                                <p className="mt-1 font-medium text-slate-700">
                                                    {homework.subject || "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-400">
                                                    {text.dueDate}
                                                </p>

                                                <p
                                                    className={`mt-1 font-medium ${
                                                        overdue
                                                            ? "text-red-600"
                                                            : "text-slate-700"
                                                    }`}
                                                >
                                                    {formatDate(homework.dueDate)}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/homework/${homework._id}`
                                                )
                                            }
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                                        >
                                            <Eye size={16} />
                                            {text.view}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomeworkDashboard;