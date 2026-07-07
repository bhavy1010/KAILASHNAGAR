import { useEffect, useState } from "react";

import {
    Users,
    UserCheck,
    UserX,
    Clock,
    Plane,
    Percent,
    Calendar
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardCard from "../../components/dashboard/DashboardCard";

import {
    getDashboardStats,
    getAttendanceAnalytics
} from "../../services/attendanceService";

const todayStr = () => new Date().toISOString().substring(0, 10);

const AttendanceDashboard = () => {

    const navigate = useNavigate();

    const [stats, setStats] = useState(null);

    const [analytics, setAnalytics] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const now = new Date();

            const [statsResponse, analyticsResponse] = await Promise.all([

                getDashboardStats(todayStr()),

                getAttendanceAnalytics(

                    now.getMonth() + 1,

                    now.getFullYear()

                )

            ]);

            setStats(statsResponse.stats);

            setAnalytics(analyticsResponse);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="h-full flex items-center justify-center">

                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

            </div>

        );

    }

    const last7Days = (analytics?.dailyTrend || []).slice(-7);

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">

                        Attendance Dashboard

                    </h1>

                    <p className="mt-2 text-slate-500">

                        Today's overview and trends.

                    </p>

                </div>

                <button
                    onClick={() => navigate("/attendance/mark")}
                    className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-3 text-white font-semibold shadow-lg hover:bg-[#4724db] hover:scale-105 transition"
                >

                    <Calendar size={18} />

                    Mark Attendance

                </button>

            </div>

            {/* ===================== Stat Cards ===================== */}

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">

                <DashboardCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<Users size={26} />}
                    color="bg-indigo-500"
                />

                <DashboardCard
                    title="Present Today"
                    value={stats.present}
                    icon={<UserCheck size={26} />}
                    color="bg-green-500"
                />

                <DashboardCard
                    title="Absent Today"
                    value={stats.absent}
                    icon={<UserX size={26} />}
                    color="bg-red-500"
                />

                <DashboardCard
                    title="Late"
                    value={stats.late}
                    icon={<Clock size={26} />}
                    color="bg-yellow-500"
                />

                <DashboardCard
                    title="On Leave"
                    value={stats.leave}
                    icon={<Plane size={26} />}
                    color="bg-blue-500"
                />

                <DashboardCard
                    title="Attendance %"
                    value={`${stats.attendancePercent}%`}
                    icon={<Percent size={26} />}
                    color="bg-purple-500"
                />

            </div>

            {/* ===================== Charts ===================== */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 mt-10">

                {/* Weekly Attendance Trend */}

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                    <h2 className="text-xl font-bold mb-1">

                        Weekly Attendance Trend

                    </h2>

                    <p className="text-gray-500 mb-8">

                        Last 7 recorded days

                    </p>

                    {

                        last7Days.length === 0 ? (

                            <p className="text-gray-400 text-center py-10">

                                No attendance data yet

                            </p>

                        ) : (

                            <div className="flex items-end justify-between gap-3 h-48">

                                {

                                    last7Days.map((day) => (

                                        <div
                                            key={day.date}
                                            className="flex-1 flex flex-col items-center gap-2"
                                        >

                                            <span className="text-xs font-semibold text-gray-600">

                                                {day.percent}%

                                            </span>

                                            <div className="w-full bg-indigo-50 rounded-xl flex items-end h-32 overflow-hidden">

                                                <div
                                                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-xl transition-all duration-500"
                                                    style={{ height: `${day.percent}%` }}
                                                ></div>

                                            </div>

                                            <span className="text-xs text-gray-400">

                                                {

                                                    new Date(day.date).toLocaleDateString(

                                                        undefined,

                                                        { weekday: "short" }

                                                    )

                                                }

                                            </span>

                                        </div>

                                    ))

                                }

                            </div>

                        )

                    }

                </div>

                {/* Class-wise Attendance */}

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                    <h2 className="text-xl font-bold mb-1">

                        Class-wise Attendance

                    </h2>

                    <p className="text-gray-500 mb-8">

                        This month's average per class

                    </p>

                    {

                        (analytics?.classComparison || []).length === 0 ? (

                            <p className="text-gray-400 text-center py-10">

                                No attendance data yet

                            </p>

                        ) : (

                            <div className="space-y-6">

                                {

                                    analytics.classComparison.map((item) => (

                                        <div key={item.className}>

                                            <div className="flex justify-between mb-2">

                                                <span className="font-semibold text-gray-700">

                                                    {item.className}

                                                </span>

                                                <span className="font-semibold text-gray-700">

                                                    {item.percent}%

                                                </span>

                                            </div>

                                            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">

                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${

                                                        item.percent >= 90
                                                            ? "bg-green-500"
                                                            : item.percent >= 75
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"

                                                    }`}
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

            {/* ===================== Quick Links ===================== */}

            <div className="mt-10 bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                <h2 className="text-xl font-bold mb-6">

                    Quick Actions

                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    <button
                        onClick={() => navigate("/attendance/today")}
                        className="h-24 rounded-xl bg-indigo-500 text-white font-semibold hover:scale-105 transition"
                    >

                        Today's Attendance

                    </button>

                    <button
                        onClick={() => navigate("/attendance/history")}
                        className="h-24 rounded-xl bg-blue-500 text-white font-semibold hover:scale-105 transition"
                    >

                        Attendance History

                    </button>

                    <button
                        onClick={() => navigate("/attendance/leaves")}
                        className="h-24 rounded-xl bg-orange-500 text-white font-semibold hover:scale-105 transition"
                    >

                        Leave Requests

                    </button>

                    <button
                        onClick={() => navigate("/attendance/analytics")}
                        className="h-24 rounded-xl bg-purple-500 text-white font-semibold hover:scale-105 transition"
                    >

                        Analytics

                    </button>

                </div>

            </div>

        </div>

    );

};

export default AttendanceDashboard;