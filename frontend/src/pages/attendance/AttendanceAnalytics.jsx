import { useEffect, useState } from "react";
import {
    RefreshCw,
    TrendingUp,
    Loader2,
    Award,
    AlertTriangle,
    BarChart3
} from "lucide-react";

import { getAttendanceAnalytics } from "../../services/attendanceService";
import { useLanguage } from "../../context/LanguageContext";

const MONTHS_EN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const MONTHS_GU = [
    "જાન્યુઆરી",
    "ફેબ્રુઆરી",
    "માર્ચ",
    "એપ્રિલ",
    "મે",
    "જૂન",
    "જુલાઈ",
    "ઓગસ્ટ",
    "સપ્ટેમ્બર",
    "ઓક્ટોબર",
    "નવેમ્બર",
    "ડિસેમ્બર"
];

const now = new Date();

const BAR_COLORS = [
    "from-indigo-500 to-indigo-400",
    "from-blue-500 to-blue-400",
    "from-purple-500 to-purple-400",
    "from-cyan-500 to-cyan-400",
    "from-teal-500 to-teal-400",
    "from-violet-500 to-violet-400",
    "from-sky-500 to-sky-400",
    "from-fuchsia-500 to-fuchsia-400"
];

const AttendanceAnalytics = () => {
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const text = {
        title: isGujarati ? "હાજરી વિશ્લેષણ" : "Attendance Analytics",
        subtitle: isGujarati
            ? "હાજરીના વલણ અને વર્ગ મુજબ સરખામણી."
            : "Trends and class-wise comparison.",
        reset: isGujarati ? "રીસેટ" : "Reset",
        overallAverage: isGujarati ? "કુલ સરેરાશ" : "Overall Average",
        allClassesMonth: isGujarati
            ? "આ મહિનાના બધા વર્ગો"
            : "All classes this month",
        topClass: isGujarati ? "શ્રેષ્ઠ વર્ગ" : "Top Class",
        needsAttention: isGujarati ? "ધ્યાનની જરૂર" : "Needs Attention",
        attendance: isGujarati ? "હાજરી" : "attendance",
        dailyTrend: isGujarati
            ? "દૈનિક હાજરીનું વલણ"
            : "Daily Attendance Trend",
        classComparison: isGujarati
            ? "વર્ગ મુજબ સરખામણી"
            : "Class Comparison",
        attendanceByClass: isGujarati
            ? "વર્ગ મુજબ હાજરી %"
            : "Attendance % by class",
        noData: isGujarati
            ? "આ સમયગાળા માટે હાજરીનો કોઈ ડેટા નથી."
            : "No attendance data for this period.",
        classSummary: isGujarati
            ? "વર્ગ મુજબનો સારાંશ"
            : "Class-wise Summary",
        sorted: isGujarati
            ? "હાજરીની ટકાવારી પ્રમાણે ગોઠવેલ"
            : "Sorted by attendance percentage",
        rank: isGujarati ? "ક્રમ" : "Rank",
        class: isGujarati ? "વર્ગ" : "Class",
        attendancePercent: isGujarati ? "હાજરી %" : "Attendance %",
        rating: isGujarati ? "મૂલ્યાંકન" : "Rating",
        excellent: isGujarati ? "ઉત્તમ" : "Excellent",
        average: isGujarati ? "સરેરાશ" : "Average",
        needsAttentionRating: isGujarati
            ? "ધ્યાનની જરૂર"
            : "Needs Attention",
        loading: isGujarati ? "વિશ્લેષણ લોડ થઈ રહ્યું છે..." : "Loading analytics..."
    };

    const months = isGujarati ? MONTHS_GU : MONTHS_EN;

    useEffect(() => {
        loadAnalytics();
    }, [month, year]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            const response = await getAttendanceAnalytics(month, year);
            setAnalytics(response || {});
        } catch (error) {
            console.log(error);
            setAnalytics({});
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
    };

    const classComparison = analytics?.classComparison || [];
    const dailyTrend = analytics?.dailyTrend || [];

    const sortedClasses = [...classComparison].sort(
        (first, second) => Number(second.percent || 0) - Number(first.percent || 0)
    );

    const topClass = sortedClasses[0] || null;
    const lowestClass =
        sortedClasses.length > 0
            ? sortedClasses[sortedClasses.length - 1]
            : null;

    const avgAttendance =
        classComparison.length > 0
            ? Math.round(
                  classComparison.reduce(
                      (sum, item) => sum + Number(item.percent || 0),
                      0
                  ) / classComparison.length
              )
            : 0;

    const getRating = (percentage) => {
        if (percentage >= 90) {
            return {
                label: text.excellent,
                className: "bg-green-100 text-green-700"
            };
        }

        if (percentage >= 75) {
            return {
                label: text.average,
                className: "bg-yellow-100 text-yellow-700"
            };
        }

        return {
            label: text.needsAttentionRating,
            className: "bg-red-100 text-red-700"
        };
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 90) return "bg-green-500";
        if (percentage >= 75) return "bg-yellow-500";
        return "bg-red-500";
    };

    const formatShortDate = (date) =>
        new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short"
        });

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <select
                        value={month}
                        onChange={(event) => setMonth(Number(event.target.value))}
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        {months.map((monthName, index) => (
                            <option key={index + 1} value={index + 1}>
                                {monthName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(event) => setYear(Number(event.target.value))}
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        {[now.getFullYear(), now.getFullYear() - 1].map(
                            (yearOption) => (
                                <option key={yearOption} value={yearOption}>
                                    {yearOption}
                                </option>
                            )
                        )}
                    </select>

                    <button
                        onClick={handleReset}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 font-semibold text-white transition hover:bg-slate-800"
                    >
                        <RefreshCw size={17} />
                        {text.reset}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
                    <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                    <p className="font-medium text-slate-500">{text.loading}</p>
                </div>
            ) : (
                <>
                    <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-indigo-600">
                                    {text.overallAverage}
                                </p>

                                <BarChart3 size={22} className="text-indigo-500" />
                            </div>

                            <h2 className="mt-3 text-4xl font-bold text-slate-800">
                                {avgAttendance}%
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                {text.allClassesMonth}
                            </p>

                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-indigo-100">
                                <div
                                    className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                                    style={{
                                        width: `${Math.min(
                                            Math.max(avgAttendance, 0),
                                            100
                                        )}%`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-green-600">
                                    {text.topClass}
                                </p>

                                <Award size={22} className="text-green-500" />
                            </div>

                            <h2 className="mt-3 text-2xl font-bold text-slate-800">
                                {topClass?.className || "-"}
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                {topClass?.percent || 0}% {text.attendance}
                            </p>

                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-green-100">
                                <div
                                    className="h-full rounded-full bg-green-600 transition-all duration-700"
                                    style={{
                                        width: `${Math.min(
                                            Math.max(Number(topClass?.percent || 0), 0),
                                            100
                                        )}%`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-red-600">
                                    {text.needsAttention}
                                </p>

                                <AlertTriangle size={22} className="text-red-500" />
                            </div>

                            <h2 className="mt-3 text-2xl font-bold text-slate-800">
                                {lowestClass?.className || "-"}
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                {lowestClass?.percent || 0}% {text.attendance}
                            </p>

                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-red-100">
                                <div
                                    className="h-full rounded-full bg-red-500 transition-all duration-700"
                                    style={{
                                        width: `${Math.min(
                                            Math.max(Number(lowestClass?.percent || 0), 0),
                                            100
                                        )}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-7 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                                    <TrendingUp
                                        size={20}
                                        className="text-indigo-600"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {text.dailyTrend}
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        {months[month - 1]} {year}
                                    </p>
                                </div>
                            </div>

                            {dailyTrend.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    {text.noData}
                                </div>
                            ) : (
                                <>
                                    <div className="flex h-52 items-end gap-1 overflow-x-auto pb-1 sm:gap-2">
                                        {dailyTrend.map((day, index) => {
                                            const percentage = Number(day.percent || 0);

                                            return (
                                                <div
                                                    key={day.date}
                                                    className="group relative flex min-w-6 flex-1 flex-col items-center sm:min-w-8"
                                                >
                                                    <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        {percentage}% — {formatShortDate(day.date)}
                                                    </div>

                                                    <div className="flex h-40 w-full items-end overflow-hidden rounded-t-lg bg-indigo-50">
                                                        <div
                                                            className={`w-full rounded-t-lg bg-gradient-to-t ${
                                                                BAR_COLORS[
                                                                    index % BAR_COLORS.length
                                                                ]
                                                            } transition-all duration-500`}
                                                            style={{
                                                                height: `${Math.min(
                                                                    Math.max(percentage, 0),
                                                                    100
                                                                )}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                                        <span>
                                            {formatShortDate(dailyTrend[0].date)}
                                        </span>

                                        <span>
                                            {formatShortDate(
                                                dailyTrend[dailyTrend.length - 1].date
                                            )}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="text-xl font-bold text-slate-800">
                                {text.classComparison}
                            </h2>

                            <p className="mb-7 mt-1 text-sm text-slate-500">
                                {text.attendanceByClass} — {months[month - 1]} {year}
                            </p>

                            {classComparison.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    {text.noData}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {sortedClasses.map((item, index) => {
                                        const percentage = Number(item.percent || 0);

                                        return (
                                            <div key={item.className}>
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <span className="font-semibold text-slate-700">
                                                        {item.className}
                                                    </span>

                                                    <span
                                                        className={`text-sm font-bold ${
                                                            percentage >= 90
                                                                ? "text-green-600"
                                                                : percentage >= 75
                                                                ? "text-yellow-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {percentage}%
                                                    </span>
                                                </div>

                                                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r ${
                                                            BAR_COLORS[
                                                                index % BAR_COLORS.length
                                                            ]
                                                        } transition-all duration-700`}
                                                        style={{
                                                            width: `${Math.min(
                                                                Math.max(percentage, 0),
                                                                100
                                                            )}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5 sm:p-7">
                            <h2 className="text-xl font-bold text-slate-800">
                                {text.classSummary}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {text.sorted}
                            </p>
                        </div>

                        {sortedClasses.length === 0 ? (
                            <div className="py-14 text-center text-slate-400">
                                {text.noData}
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                    {text.rank}
                                                </th>

                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                    {text.class}
                                                </th>

                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                    {text.attendancePercent}
                                                </th>

                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                    {text.rating}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {sortedClasses.map((item, index) => {
                                                const percentage = Number(item.percent || 0);
                                                const rating = getRating(percentage);

                                                return (
                                                    <tr
                                                        key={item.className}
                                                        className="border-t border-slate-100 transition hover:bg-slate-50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div
                                                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                                                    index === 0
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : index === 1
                                                                        ? "bg-slate-200 text-slate-700"
                                                                        : index === 2
                                                                        ? "bg-orange-100 text-orange-700"
                                                                        : "bg-slate-50 text-slate-500"
                                                                }`}
                                                            >
                                                                {index + 1}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                                            {item.className}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                                                                    <div
                                                                        className={`h-full rounded-full ${getProgressColor(
                                                                            percentage
                                                                        )}`}
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                Math.max(
                                                                                    percentage,
                                                                                    0
                                                                                ),
                                                                                100
                                                                            )}%`
                                                                        }}
                                                                    />
                                                                </div>

                                                                <span className="font-semibold text-slate-700">
                                                                    {percentage}%
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${rating.className}`}
                                                            >
                                                                {rating.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-slate-100 lg:hidden">
                                    {sortedClasses.map((item, index) => {
                                        const percentage = Number(item.percent || 0);
                                        const rating = getRating(percentage);

                                        return (
                                            <div key={item.className} className="p-4 sm:p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                                                index === 0
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : index === 1
                                                                    ? "bg-slate-200 text-slate-700"
                                                                    : index === 2
                                                                    ? "bg-orange-100 text-orange-700"
                                                                    : "bg-slate-50 text-slate-500"
                                                            }`}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        <p className="font-semibold text-slate-800">
                                                            {item.className}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${rating.className}`}
                                                    >
                                                        {rating.label}
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center gap-3">
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className={`h-full rounded-full ${getProgressColor(
                                                                percentage
                                                            )}`}
                                                            style={{
                                                                width: `${Math.min(
                                                                    Math.max(percentage, 0),
                                                                    100
                                                                )}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="font-bold text-slate-700">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AttendanceAnalytics;