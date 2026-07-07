import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";

import { getAttendanceAnalytics } from "../../services/attendanceService";

const MONTHS = [

    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"

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

    const [month, setMonth] = useState(now.getMonth() + 1);

    const [year, setYear] = useState(now.getFullYear());

    const [analytics, setAnalytics] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadAnalytics();

    }, [month, year]);

    const loadAnalytics = async () => {

        try {

            setLoading(true);

            const response = await getAttendanceAnalytics(month, year);

            setAnalytics(response);

        } catch (error) {

            console.log(error);

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

    const topClass = classComparison.length > 0
        ? [...classComparison].sort((a, b) => b.percent - a.percent)[0]
        : null;

    const avgAttendance = classComparison.length > 0
        ? Math.round(
            classComparison.reduce((sum, c) => sum + c.percent, 0) /
            classComparison.length
        )
        : 0;

    const lowestClass = classComparison.length > 0
        ? [...classComparison].sort((a, b) => a.percent - b.percent)[0]
        : null;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">

                        Attendance Analytics

                    </h1>

                    <p className="mt-2 text-slate-500">

                        Trends and class-wise comparison.

                    </p>

                </div>

                <div className="flex items-center gap-3">

                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border rounded-xl px-4 py-3 bg-white outline-none focus:border-[#5B2EFF]"
                    >

                        {

                            MONTHS.map((m, i) => (

                                <option key={m} value={i + 1}>

                                    {m}

                                </option>

                            ))

                        }

                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border rounded-xl px-4 py-3 bg-white outline-none focus:border-[#5B2EFF]"
                    >

                        {

                            [now.getFullYear(), now.getFullYear() - 1].map((y) => (

                                <option key={y} value={y}>

                                    {y}

                                </option>

                            ))

                        }

                    </select>

                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-700 hover:bg-gray-800 text-white transition"
                    >

                        <RefreshCw size={16} />

                        Reset

                    </button>

                </div>

            </div>

            {

                loading ? (

                    <div className="py-20 flex justify-center">

                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

                    </div>

                ) : (

                    <>

                        {/* ===================== Insight Cards ===================== */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-7 border border-indigo-100 shadow">

                                <p className="text-indigo-600 font-semibold text-sm">

                                    Overall Average

                                </p>

                                <h2 className="text-4xl font-bold mt-3">

                                    {avgAttendance}%

                                </h2>

                                <p className="text-gray-500 mt-2">

                                    All classes this month

                                </p>

                                <div className="mt-5 h-2 rounded-full bg-indigo-100 overflow-hidden">

                                    <div
                                        className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                                        style={{ width: `${avgAttendance}%` }}
                                    ></div>

                                </div>

                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-7 border border-green-100 shadow">

                                <p className="text-green-600 font-semibold text-sm">

                                    Top Class

                                </p>

                                <h2 className="text-2xl font-bold mt-3">

                                    {topClass?.className || "-"}

                                </h2>

                                <p className="text-gray-500 mt-2">

                                    {topClass?.percent || 0}% attendance

                                </p>

                                <div className="mt-5 h-2 rounded-full bg-green-100 overflow-hidden">

                                    <div
                                        className="h-full rounded-full bg-green-600 transition-all duration-700"
                                        style={{ width: `${topClass?.percent || 0}%` }}
                                    ></div>

                                </div>

                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl p-7 border border-red-100 shadow">

                                <p className="text-red-600 font-semibold text-sm">

                                    Needs Attention

                                </p>

                                <h2 className="text-2xl font-bold mt-3">

                                    {lowestClass?.className || "-"}

                                </h2>

                                <p className="text-gray-500 mt-2">

                                    {lowestClass?.percent || 0}% attendance

                                </p>

                                <div className="mt-5 h-2 rounded-full bg-red-100 overflow-hidden">

                                    <div
                                        className="h-full rounded-full bg-red-500 transition-all duration-700"
                                        style={{ width: `${lowestClass?.percent || 0}%` }}
                                    ></div>

                                </div>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 mb-7">

                            {/* ===================== Daily Trend Chart ===================== */}

                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                                <div className="flex items-center gap-3 mb-8">

                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">

                                        <TrendingUp size={20} className="text-indigo-600" />

                                    </div>

                                    <div>

                                        <h2 className="text-xl font-bold">

                                            Daily Attendance Trend

                                        </h2>

                                        <p className="text-gray-500 text-sm">

                                            {MONTHS[month - 1]} {year}

                                        </p>

                                    </div>

                                </div>

                                {

                                    dailyTrend.length === 0 ? (

                                        <div className="py-12 text-center text-gray-400">

                                            No attendance data for this period.

                                        </div>

                                    ) : (

                                        <>

                                            <div className="flex items-end gap-1 h-48 mb-4">

                                                {

                                                    dailyTrend.map((day, index) => (

                                                        <div
                                                            key={day.date}
                                                            className="relative group flex-1 flex flex-col items-center"
                                                        >

                                                            {/* Tooltip */}

                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">

                                                                {day.percent}% on {new Date(day.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}

                                                            </div>

                                                            <div className="w-full bg-indigo-50 rounded-t-lg h-40 flex items-end overflow-hidden">

                                                                <div
                                                                    className={`w-full bg-gradient-to-t ${BAR_COLORS[index % BAR_COLORS.length]} rounded-t-lg transition-all duration-500`}
                                                                    style={{ height: `${day.percent}%` }}
                                                                ></div>

                                                            </div>

                                                        </div>

                                                    ))

                                                }

                                            </div>

                                            <div className="flex justify-between text-xs text-gray-400">

                                                {

                                                    dailyTrend.length > 0 && (

                                                        <>

                                                            <span>

                                                                {

                                                                    new Date(dailyTrend[0].date).toLocaleDateString(

                                                                        undefined,

                                                                        { day: "2-digit", month: "short" }

                                                                    )

                                                                }

                                                            </span>

                                                            <span>

                                                                {

                                                                    new Date(dailyTrend[dailyTrend.length - 1].date).toLocaleDateString(

                                                                        undefined,

                                                                        { day: "2-digit", month: "short" }

                                                                    )

                                                                }

                                                            </span>

                                                        </>

                                                    )

                                                }

                                            </div>

                                        </>

                                    )

                                }

                            </div>

                            {/* ===================== Class Comparison Chart ===================== */}

                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                                <h2 className="text-xl font-bold mb-2">

                                    Class Comparison

                                </h2>

                                <p className="text-gray-500 text-sm mb-8">

                                    Attendance % by class — {MONTHS[month - 1]} {year}

                                </p>

                                {

                                    classComparison.length === 0 ? (

                                        <div className="py-12 text-center text-gray-400">

                                            No attendance data for this period.

                                        </div>

                                    ) : (

                                        <div className="space-y-5">

                                            {

                                                [...classComparison]

                                                    .sort((a, b) => b.percent - a.percent)

                                                    .map((item, index) => (

                                                        <div key={item.className}>

                                                            <div className="flex justify-between mb-2">

                                                                <span className="font-semibold text-gray-700">

                                                                    {item.className}

                                                                </span>

                                                                <span

                                                                    className={`font-bold text-sm ${

                                                                        item.percent >= 90

                                                                            ? "text-green-600"

                                                                            : item.percent >= 75

                                                                            ? "text-yellow-600"

                                                                            : "text-red-600"

                                                                    }`}

                                                                >

                                                                    {item.percent}%

                                                                </span>

                                                            </div>

                                                            <div className="h-4 rounded-full bg-gray-100 overflow-hidden">

                                                                <div
                                                                    className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[index % BAR_COLORS.length]} transition-all duration-700`}
                                                                    style={{ width: `${item.percent}%` }}
                                                                ></div>

                                                            </div>

                                                        </div>

                                                    ))

                                            }

                                        </div>

                                    )

                                }

                            </div>

                        </div>

                        {/* ===================== Class Comparison Table ===================== */}

                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

                            <div className="p-7 border-b">

                                <h2 className="text-xl font-bold">

                                    Class-wise Summary

                                </h2>

                                <p className="text-gray-500 mt-1">

                                    Sorted by attendance percentage

                                </p>

                            </div>

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-6 py-4">

                                            Rank

                                        </th>

                                        <th className="text-left px-6 py-4">

                                            Class

                                        </th>

                                        <th className="text-left px-6 py-4">

                                            Attendance %

                                        </th>

                                        <th className="text-left px-6 py-4">

                                            Rating

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        [...classComparison]

                                            .sort((a, b) => b.percent - a.percent)

                                            .map((item, index) => (

                                                <tr
                                                    key={item.className}
                                                    className="border-t hover:bg-gray-50 transition"
                                                >

                                                    <td className="px-6 py-4">

                                                        <div

                                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${

                                                                index === 0

                                                                    ? "bg-yellow-100 text-yellow-700"

                                                                    : index === 1

                                                                    ? "bg-gray-200 text-gray-700"

                                                                    : index === 2

                                                                    ? "bg-orange-100 text-orange-700"

                                                                    : "bg-gray-50 text-gray-500"

                                                            }`}

                                                        >

                                                            {index + 1}

                                                        </div>

                                                    </td>

                                                    <td className="px-6 py-4 font-semibold text-gray-800">

                                                        {item.className}

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">

                                                                <div
                                                                    className={`h-full rounded-full ${

                                                                        item.percent >= 90

                                                                            ? "bg-green-500"

                                                                            : item.percent >= 75

                                                                            ? "bg-yellow-500"

                                                                            : "bg-red-500"

                                                                    }`}
                                                                    style={{ width: `${item.percent}%` }}
                                                                ></div>

                                                            </div>

                                                            <span className="font-semibold text-gray-700">

                                                                {item.percent}%

                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span

                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${

                                                                item.percent >= 90

                                                                    ? "bg-green-100 text-green-700"

                                                                    : item.percent >= 75

                                                                    ? "bg-yellow-100 text-yellow-700"

                                                                    : "bg-red-100 text-red-700"

                                                            }`}

                                                        >

                                                            {

                                                                item.percent >= 90

                                                                    ? "Excellent"

                                                                    : item.percent >= 75

                                                                    ? "Average"

                                                                    : "Needs Attention"

                                                            }

                                                        </span>

                                                    </td>

                                                </tr>

                                            ))

                                    }

                                </tbody>

                            </table>

                        </div>

                    </>

                )

            }

        </div>

    );

};

export default AttendanceAnalytics;