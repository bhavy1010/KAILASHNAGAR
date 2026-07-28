import { useEffect, useState } from "react";
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    Plane,
    Percent,
    Calendar,
    ClipboardCheck,
    History,
    FileClock,
    BarChart3,
    Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../../components/dashboard/DashboardCard";
import { useLanguage } from "../../context/LanguageContext";
import {
    getDashboardStats,
    getAttendanceAnalytics
} from "../../services/attendanceService";

const todayStr = () => new Date().toISOString().substring(0, 10);

const AttendanceDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const isGujarati = language === "gu";

    const text = {
        title: isGujarati ? "હાજરી ડેશબોર્ડ" : "Attendance Dashboard",
        subtitle: isGujarati
            ? "આજની હાજરી અને હાજરીના વલણનો સારાંશ."
            : "Today's overview and attendance trends.",
        markAttendance: isGujarati ? "હાજરી ભરો" : "Mark Attendance",
        totalStudents: isGujarati ? "કુલ વિદ્યાર્થીઓ" : "Total Students",
        presentToday: isGujarati ? "આજે હાજર" : "Present Today",
        absentToday: isGujarati ? "આજે ગેરહાજર" : "Absent Today",
        late: isGujarati ? "મોડા" : "Late",
        onLeave: isGujarati ? "રજા પર" : "On Leave",
        attendancePercent: isGujarati ? "હાજરી %" : "Attendance %",
        weeklyTrend: isGujarati
            ? "સાપ્તાહિક હાજરીનું વલણ"
            : "Weekly Attendance Trend",
        last7Days: isGujarati
            ? "છેલ્લા 7 નોંધાયેલા દિવસો"
            : "Last 7 recorded days",
        classWise: isGujarati
            ? "વર્ગ મુજબ હાજરી"
            : "Class-wise Attendance",
        monthAverage: isGujarati
            ? "આ મહિનાની વર્ગ પ્રમાણે સરેરાશ"
            : "This month's average per class",
        noData: isGujarati
            ? "હાજરીનો કોઈ ડેટા હજુ ઉપલબ્ધ નથી"
            : "No attendance data yet",
        quickActions: isGujarati ? "ઝડપી વિકલ્પો" : "Quick Actions",
        todayAttendance: isGujarati ? "આજની હાજરી" : "Today's Attendance",
        attendanceHistory: isGujarati ? "હાજરીનો ઇતિહાસ" : "Attendance History",
        leaveRequests: isGujarati ? "રજાની અરજીઓ" : "Leave Requests",
        analytics: isGujarati ? "વિશ્લેષણ" : "Analytics",
        loading: isGujarati ? "હાજરી લોડ થઈ રહી છે..." : "Loading attendance..."
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const now = new Date();

            const [statsResponse, analyticsResponse] = await Promise.all([
                getDashboardStats(todayStr()),
                getAttendanceAnalytics(now.getMonth() + 1, now.getFullYear())
            ]);

            setStats(statsResponse?.stats || {});
            setAnalytics(analyticsResponse || {});
        } catch (error) {
            console.log("Attendance dashboard error:", error);
            setStats({});
            setAnalytics({});
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#F5F7FB] px-4">
                <div className="flex flex-col items-center gap-3 text-[#5B2EFF]">
                    <Loader2 size={38} className="animate-spin" />
                    <p className="font-semibold">{text.loading}</p>
                </div>
            </div>
        );
    }

    const safeStats = {
        totalStudents: stats?.totalStudents || 0,
        present: stats?.present || 0,
        absent: stats?.absent || 0,
        late: stats?.late || 0,
        leave: stats?.leave || 0,
        attendancePercent: stats?.attendancePercent || 0
    };

    const last7Days = (analytics?.dailyTrend || []).slice(-7);
    const classComparison = analytics?.classComparison || [];

    const quickActions = [
        {
            title: text.todayAttendance,
            icon: ClipboardCheck,
            path: "/attendance/today",
            color: "from-indigo-500 to-blue-600"
        },
        {
            title: text.attendanceHistory,
            icon: History,
            path: "/attendance/history",
            color: "from-blue-500 to-cyan-600"
        },
        {
            title: text.leaveRequests,
            icon: FileClock,
            path: "/attendance/leaves",
            color: "from-orange-500 to-amber-500"
        },
        {
            title: text.analytics,
            icon: BarChart3,
            path: "/attendance/analytics",
            color: "from-violet-500 to-purple-600"
        }
    ];

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                <button
                    onClick={() => navigate("/attendance/mark")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#4724db] sm:w-auto"
                >
                    <Calendar size={19} />
                    {text.markAttendance}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <DashboardCard
                    title={text.totalStudents}
                    value={safeStats.totalStudents}
                    icon={<Users size={26} />}
                    color="bg-indigo-500"
                />

                <DashboardCard
                    title={text.presentToday}
                    value={safeStats.present}
                    icon={<UserCheck size={26} />}
                    color="bg-green-500"
                />

                <DashboardCard
                    title={text.absentToday}
                    value={safeStats.absent}
                    icon={<UserX size={26} />}
                    color="bg-red-500"
                />

                <DashboardCard
                    title={text.late}
                    value={safeStats.late}
                    icon={<Clock size={26} />}
                    color="bg-yellow-500"
                />

                <DashboardCard
                    title={text.onLeave}
                    value={safeStats.leave}
                    icon={<Plane size={26} />}
                    color="bg-blue-500"
                />

                <DashboardCard
                    title={text.attendancePercent}
                    value={`${safeStats.attendancePercent}%`}
                    icon={<Percent size={26} />}
                    color="bg-purple-500"
                />
            </div>

            <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="text-xl font-bold text-slate-800">
                        {text.weeklyTrend}
                    </h2>

                    <p className="mb-7 mt-1 text-sm text-slate-500">
                        {text.last7Days}
                    </p>

                    {last7Days.length === 0 ? (
                        <p className="py-10 text-center text-gray-400">
                            {text.noData}
                        </p>
                    ) : (
                        <div className="flex h-56 items-end justify-between gap-2 sm:gap-4">
                            {last7Days.map((day) => {
                                const percentage = Number(day.percent || 0);

                                return (
                                    <div
                                        key={day.date}
                                        className="flex min-w-0 flex-1 flex-col items-center gap-2"
                                    >
                                        <span className="text-xs font-semibold text-slate-600">
                                            {percentage}%
                                        </span>

                                        <div className="flex h-36 w-full items-end overflow-hidden rounded-xl bg-indigo-50">
                                            <div
                                                className="w-full rounded-xl bg-gradient-to-t from-[#5B2EFF] to-indigo-400 transition-all duration-500"
                                                style={{
                                                    height: `${Math.min(
                                                        Math.max(percentage, 0),
                                                        100
                                                    )}%`
                                                }}
                                            />
                                        </div>

                                        <span className="truncate text-[10px] text-slate-400 sm:text-xs">
                                            {new Date(day.date).toLocaleDateString(
                                                isGujarati ? "gu-IN" : "en-IN",
                                                { weekday: "short" }
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="text-xl font-bold text-slate-800">
                        {text.classWise}
                    </h2>

                    <p className="mb-7 mt-1 text-sm text-slate-500">
                        {text.monthAverage}
                    </p>

                    {classComparison.length === 0 ? (
                        <p className="py-10 text-center text-gray-400">
                            {text.noData}
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {classComparison.map((item) => {
                                const percentage = Number(item.percent || 0);

                                return (
                                    <div key={item.className}>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="font-semibold text-slate-700">
                                                {item.className}
                                            </span>

                                            <span className="font-bold text-slate-700">
                                                {percentage}%
                                            </span>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    percentage >= 90
                                                        ? "bg-green-500"
                                                        : percentage >= 75
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                                }`}
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

            <div className="mt-7 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="mb-5 text-xl font-bold text-slate-800">
                    {text.quickActions}
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <button
                                key={action.path}
                                onClick={() => navigate(action.path)}
                                className={`flex min-h-24 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${action.color} px-4 py-5 font-semibold text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg`}
                            >
                                <Icon size={23} />
                                <span>{action.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AttendanceDashboard;