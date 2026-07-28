import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Plus,
    Archive,
    AlertTriangle,
    CheckCircle,
    Eye,
    BarChart3,
    Loader2
} from "lucide-react";

import { getNoticeDashboard } from "../../services/noticeService";
import { useLanguage } from "../../context/LanguageContext";

const PRIORITY_STYLE = {
    Low: "bg-gray-100 text-gray-600",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Urgent: "bg-red-100 text-red-700"
};

const CATEGORY_COLORS = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-gray-500"
];

const AUDIENCE_COLORS = {
    All: "bg-indigo-500",
    Teachers: "bg-blue-500",
    Students: "bg-green-500",
    Parents: "bg-orange-500"
};

const NoticeDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const text = {
        loading: isGujarati ? "લોડ થઈ રહ્યું છે..." : "Loading...",
        pageTitle: isGujarati ? "નોટિસ ડેશબોર્ડ" : "Notice Dashboard",
        pageSubtitle: isGujarati
            ? "તમામ નોટિસ અને એનાલિટિક્સનું વિહંગાવલોકન."
            : "Overview of all notices and analytics.",
        archived: isGujarati ? "આર્કાઇવ" : "Archived",
        createNotice: isGujarati ? "નોટિસ બનાવો" : "Create Notice",
        total: isGujarati ? "કુલ" : "Total",
        active: isGujarati ? "સક્રિય" : "Active",
        urgent: isGujarati ? "તાત્કાલિક" : "Urgent",
        totalViews: isGujarati ? "કુલ વ્યુ" : "Total Views",
        categoryBreakdown: isGujarati ? "શ્રેણી વિભાજન" : "Category Breakdown",
        noticesPerCategory: isGujarati
            ? "શ્રેણી દીઠ નોટિસ"
            : "Notices per category",
        noDataYet: isGujarati ? "હજુ કોઈ નોટિસ ડેટા નથી" : "No notice data yet",
        notice: isGujarati ? "નોટિસ" : "notice",
        notices: isGujarati ? "નોટિસ" : "notices",
        audienceDistribution: isGujarati
            ? "પ્રેક્ષક વિતરણ"
            : "Audience Distribution",
        whoReceives: isGujarati
            ? "દરેક નોટિસ કોને મળે છે"
            : "Who receives each notice",
        quickActions: isGujarati ? "ઝડપી ક્રિયાઓ" : "Quick Actions",
        allNotices: isGujarati ? "બધી નોટિસ" : "All Notices",
        noticeBoard: isGujarati ? "નોટિસ બોર્ડ" : "Notice Board",
        recentNotices: isGujarati ? "તાજેતરની નોટિસ" : "Recent Notices",
        last7Notices: isGujarati
            ? "છેલ્લી 7 નોટિસ પ્રકાશિત થઈ"
            : "Last 7 notices published",
        viewAll: isGujarati ? "બધું જુઓ" : "View All",
        noNoticesPublished: isGujarati
            ? "હજુ સુધી કોઈ નોટિસ પ્રકાશિત થઈ નથી"
            : "No notices published yet",
        title: isGujarati ? "શીર્ષક" : "Title",
        category: isGujarati ? "શ્રેણી" : "Category",
        priority: isGujarati ? "પ્રાધાન્યતા" : "Priority",
        audience: isGujarati ? "પ્રેક્ષક" : "Audience",
        views: isGujarati ? "વ્યુ" : "Views",
        date: isGujarati ? "તારીખ" : "Date",
        action: isGujarati ? "ક્રિયા" : "Action",
        view: isGujarati ? "જુઓ" : "View"
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const response = await getNoticeDashboard();
            setData(response);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-full flex-col items-center justify-center gap-3">
                <Loader2 size={38} className="animate-spin text-[#5B2EFF]" />
                <p className="font-medium text-slate-500">{text.loading}</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const recentNotices = data?.recentNotices || [];
    const categoryWise = data?.categoryWise || [];
    const audienceWise = data?.audienceWise || [];

    const maxCategoryCount =
        categoryWise.length > 0
            ? Math.max(...categoryWise.map((c) => c.count))
            : 1;

    const totalAudienceCount = audienceWise.reduce(
        (sum, a) => sum + a.count,
        0
    );

    const formatDate = (dateValue) =>
        new Date(dateValue).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}
            <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.pageTitle}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.pageSubtitle}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => navigate("/notices/archived")}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium shadow-sm transition hover:bg-gray-50"
                    >
                        <Archive size={16} />
                        {text.archived}
                    </button>

                    <button
                        onClick={() => navigate("/notices/create")}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db]"
                    >
                        <Plus size={18} />
                        {text.createNotice}
                    </button>
                </div>
            </div>

            {/* ============================== Stat Cards ============================== */}
            <div className="mb-7 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{text.total}</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-800 sm:text-3xl">
                                {stats.totalNotices || 0}
                            </h3>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                            <Bell size={22} className="text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{text.active}</p>
                            <h3 className="mt-1 text-2xl font-bold text-green-600 sm:text-3xl">
                                {stats.activeNotices || 0}
                            </h3>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                            <CheckCircle size={22} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{text.urgent}</p>
                            <h3 className="mt-1 text-2xl font-bold text-red-600 sm:text-3xl">
                                {stats.urgentNotices || 0}
                            </h3>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
                            <AlertTriangle size={22} className="text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{text.archived}</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-500 sm:text-3xl">
                                {stats.archivedNotices || 0}
                            </h3>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <Archive size={22} className="text-gray-500" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{text.totalViews}</p>
                            <h3 className="mt-1 text-2xl font-bold text-purple-600 sm:text-3xl">
                                {stats.totalViews || 0}
                            </h3>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                            <Eye size={22} className="text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================== Charts Row ============================== */}
            <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-7">
                {/* Category Wise Chart */}
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-7 flex items-center gap-3 sm:mb-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                            <BarChart3 size={20} className="text-indigo-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold sm:text-xl">
                                {text.categoryBreakdown}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {text.noticesPerCategory}
                            </p>
                        </div>
                    </div>

                    {categoryWise.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            {text.noDataYet}
                        </div>
                    )}

                    {categoryWise.length > 0 && (
                        <div className="space-y-5">
                            {categoryWise.map((item, index) => {
                                const percent = Math.round(
                                    (item.count / maxCategoryCount) * 100
                                );

                                return (
                                    <div key={item._id}>
                                        <div className="mb-2 flex justify-between gap-2">
                                            <span className="truncate font-semibold text-gray-700">
                                                {item._id}
                                            </span>

                                            <span className="shrink-0 font-semibold text-gray-500">
                                                {item.count}{" "}
                                                {item.count !== 1 ? text.notices : text.notice}
                                            </span>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                                                }`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Audience Distribution */}
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-7 flex items-center gap-3 sm:mb-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                            <Bell size={20} className="text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold sm:text-xl">
                                {text.audienceDistribution}
                            </h2>
                            <p className="text-sm text-gray-500">{text.whoReceives}</p>
                        </div>
                    </div>

                    {audienceWise.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            {text.noDataYet}
                        </div>
                    )}

                    {audienceWise.length > 0 && (
                        <div className="space-y-6">
                            {audienceWise.map((item) => {
                                const percent =
                                    totalAudienceCount > 0
                                        ? Math.round(
                                              (item.count / totalAudienceCount) * 100
                                          )
                                        : 0;

                                const barColor =
                                    AUDIENCE_COLORS[item._id] || "bg-gray-500";

                                return (
                                    <div key={item._id}>
                                        <div className="mb-2 flex justify-between gap-2">
                                            <span className="font-semibold text-gray-700">
                                                {item._id}
                                            </span>

                                            <span className="font-semibold text-gray-500">
                                                {item.count} ({percent}%)
                                            </span>
                                        </div>

                                        <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="flex flex-wrap gap-4 pt-2">
                                {Object.entries(AUDIENCE_COLORS).map(([label, color]) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${color}`}></div>
                                        <span className="text-sm text-gray-600">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ============================== Quick Actions ============================== */}
            <div className="mb-7 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                <h2 className="mb-6 text-lg font-bold sm:text-xl">
                    {text.quickActions}
                </h2>

                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
                    <button
                        onClick={() => navigate("/notices/list")}
                        className="h-20 rounded-2xl bg-indigo-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-indigo-600 sm:h-24 sm:text-base"
                    >
                        {text.allNotices}
                    </button>

                    <button
                        onClick={() => navigate("/notices/create")}
                        className="h-20 rounded-2xl bg-purple-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-purple-600 sm:h-24 sm:text-base"
                    >
                        {text.createNotice}
                    </button>

                    <button
                        onClick={() => navigate("/notices/board")}
                        className="h-20 rounded-2xl bg-green-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-green-600 sm:h-24 sm:text-base"
                    >
                        {text.noticeBoard}
                    </button>

                    <button
                        onClick={() => navigate("/notices/archived")}
                        className="h-20 rounded-2xl bg-gray-500 px-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-gray-600 sm:h-24 sm:text-base"
                    >
                        {text.archived}
                    </button>
                </div>
            </div>

            {/* ============================== Recent Notices ============================== */}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                    <div>
                        <h2 className="text-lg font-bold sm:text-xl">
                            {text.recentNotices}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {text.last7Notices}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/notices/list")}
                        className="w-fit text-sm font-semibold text-indigo-600 hover:underline"
                    >
                        {text.viewAll}
                    </button>
                </div>

                {recentNotices.length === 0 && (
                    <div className="py-16 text-center">
                        <Bell size={50} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">{text.noNoticesPublished}</p>
                    </div>
                )}

                {recentNotices.length > 0 && (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">{text.title}</th>
                                        <th className="px-6 py-4 text-left">{text.category}</th>
                                        <th className="px-6 py-4 text-left">{text.priority}</th>
                                        <th className="px-6 py-4 text-left">{text.audience}</th>
                                        <th className="px-6 py-4 text-left">{text.views}</th>
                                        <th className="px-6 py-4 text-left">{text.date}</th>
                                        <th className="px-6 py-4 text-center">{text.action}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentNotices.map((notice) => (
                                        <tr
                                            key={notice._id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="max-w-xs truncate font-semibold text-gray-800">
                                                    {notice.title}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                    {notice.category}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        PRIORITY_STYLE[notice.priority] ||
                                                        "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {notice.priority}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {notice.audience}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {notice.views}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {formatDate(notice.createdAt)}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/notices/${notice._id}`)
                                                    }
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

                        <div className="divide-y divide-gray-100 lg:hidden">
                            {recentNotices.map((notice) => (
                                <div key={notice._id} className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-800">
                                                {notice.title}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                    {notice.category}
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        PRIORITY_STYLE[notice.priority] ||
                                                        "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {notice.priority}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/notices/${notice._id}`)}
                                            className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600"
                                        >
                                            {text.view}
                                        </button>
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-400">{text.audience}</p>
                                            <p className="mt-1 font-medium text-gray-700">
                                                {notice.audience}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-400">{text.views}</p>
                                            <p className="mt-1 font-medium text-gray-700">
                                                {notice.views}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-400">{text.date}</p>
                                            <p className="mt-1 font-medium text-gray-700">
                                                {formatDate(notice.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NoticeDashboard;