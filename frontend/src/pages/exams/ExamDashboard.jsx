import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Trophy,
    Plus,
    Clock,
    CheckCircle,
    TrendingUp,
    BarChart3,
    BookOpen,
    Calendar
} from "lucide-react";

import { getExamDashboard } from "../../services/examService";

const STATUS_STYLE = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-green-100 text-green-700",
    Completed: "bg-gray-100 text-gray-600"
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

const ExamDashboard = () => {

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

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

            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

        );

    }

    const stats = data?.stats || {};

    const recentExams = data?.recentExams || [];

    const examTypeWise = data?.examTypeWise || [];

    const maxTypeCount = examTypeWise.length > 0
        ? Math.max(...examTypeWise.map((t) => t.count))
        : 1;

    const gradeDistribution = data?.gradeDistribution || [];

    const maxGradeCount = gradeDistribution.length > 0
        ? Math.max(...gradeDistribution.map((g) => g.count))
        : 1;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Exam Dashboard</h1>
                    <p className="mt-2 text-slate-500">Overview of all exams and student performance.</p>
                </div>

                <button
                    onClick={() => navigate("/exams/create")}
                    className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
                >
                    <Plus size={18} />
                    Create Exam
                </button>

            </div>

            {/* ============================== Stat Cards ============================== */}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Exams</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalExams || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Trophy size={22} className="text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Upcoming</p>
                            <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.upcomingExams || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Calendar size={22} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ongoing</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.ongoingExams || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle size={22} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Completed</p>
                            <h3 className="text-3xl font-bold text-gray-600 mt-1">{stats.completedExams || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <BookOpen size={22} className="text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Results</p>
                            <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.totalResults || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <BarChart3 size={22} className="text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg Score</p>
                            <h3 className="text-3xl font-bold text-orange-600 mt-1">{stats.avgPercentage || 0}%</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <TrendingUp size={22} className="text-orange-600" />
                        </div>
                    </div>
                </div>

            </div>

            {/* ============================== Charts Row ============================== */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 mb-7">

                {/* Exam Type Wise */}

                <div className="bg-white rounded-3xl shadow border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <BarChart3 size={20} className="text-indigo-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Exam Type Distribution</h2>
                            <p className="text-gray-500 text-sm">Number of exams per type</p>
                        </div>

                    </div>

                    {examTypeWise.length === 0 && (

                        <div className="py-12 text-center text-gray-400">
                            No exam data yet
                        </div>

                    )}

                    {examTypeWise.length > 0 && (

                        <div className="space-y-5">

                            {examTypeWise.map((item, index) => {

                                const percent = Math.round((item.count / maxTypeCount) * 100);

                                const colors = [
                                    "bg-indigo-500",
                                    "bg-blue-500",
                                    "bg-purple-500",
                                    "bg-cyan-500",
                                    "bg-teal-500",
                                    "bg-violet-500"
                                ];

                                return (

                                    <div key={item._id}>

                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold text-gray-700">{item._id}</span>
                                            <span className="font-semibold text-gray-500">
                                                {item.count} exam{item.count !== 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={"h-full rounded-full transition-all duration-700 " + colors[index % colors.length]}
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

                <div className="bg-white rounded-3xl shadow border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Trophy size={20} className="text-purple-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Grade Distribution</h2>
                            <p className="text-gray-500 text-sm">Overall grade spread across all results</p>
                        </div>

                    </div>

                    {gradeDistribution.length === 0 && (

                        <div className="py-12 text-center text-gray-400">
                            No result data yet
                        </div>

                    )}

                    {gradeDistribution.length > 0 && (

                        <div className="flex items-end justify-between gap-3 h-48">

                            {gradeDistribution.map((item, index) => {

                                const heightPercent = maxGradeCount > 0
                                    ? Math.round((item.count / maxGradeCount) * 100)
                                    : 0;

                                return (

                                    <div key={item.grade} className="flex-1 flex flex-col items-center gap-2 group">

                                        <span className="text-xs font-semibold text-gray-600">
                                            {item.count}
                                        </span>

                                        <div className="w-full bg-gray-50 rounded-xl h-36 flex items-end overflow-hidden">
                                            <div
                                                className={"w-full rounded-xl transition-all duration-700 " + GRADE_COLORS[index % GRADE_COLORS.length]}
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

            <div className="bg-white rounded-3xl shadow border border-gray-100 p-8 mb-7">

                <h2 className="text-xl font-bold mb-6">Quick Actions</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    <button
                        onClick={() => navigate("/exams/list")}
                        className="h-24 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition hover:scale-105"
                    >
                        All Exams
                    </button>

                    <button
                        onClick={() => navigate("/exams/create")}
                        className="h-24 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition hover:scale-105"
                    >
                        Create Exam
                    </button>

                    <button
                        onClick={() => navigate("/exams/list?status=Ongoing")}
                        className="h-24 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold transition hover:scale-105"
                    >
                        Ongoing Exams
                    </button>

                    <button
                        onClick={() => navigate("/exams/analytics")}
                        className="h-24 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition hover:scale-105"
                    >
                        Analytics
                    </button>

                </div>

            </div>

            {/* ============================== Recent Exams ============================== */}

            <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">

                <div className="flex items-center justify-between p-7 border-b">

                    <div>
                        <h2 className="text-xl font-bold">Recent Exams</h2>
                        <p className="text-gray-500 mt-1">Last 7 exams created</p>
                    </div>

                    <button
                        onClick={() => navigate("/exams/list")}
                        className="text-indigo-600 font-semibold hover:underline text-sm"
                    >
                        View All
                    </button>

                </div>

                {recentExams.length === 0 && (

                    <div className="py-16 text-center">
                        <Trophy size={50} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No exams created yet</p>
                    </div>

                )}

                {recentExams.length > 0 && (

                    <table className="w-full">

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4">Exam Name</th>
                                <th className="text-left px-6 py-4">Type</th>
                                <th className="text-left px-6 py-4">Class</th>
                                <th className="text-left px-6 py-4">Start Date</th>
                                <th className="text-left px-6 py-4">Status</th>
                                <th className="text-center px-6 py-4">Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {recentExams.map((exam) => (

                                <tr key={exam._id} className="border-t hover:bg-gray-50 transition">

                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800">{exam.examName}</p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                            {exam.examType}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        Std {exam.standard} - {exam.division}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(exam.startDate).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (STATUS_STYLE[exam.status] || "bg-gray-100 text-gray-600")}>
                                            {exam.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigate("/exams/" + exam._id)}
                                            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm transition"
                                        >
                                            View
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

};

export default ExamDashboard;