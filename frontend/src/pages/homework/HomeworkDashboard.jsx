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
    TrendingUp
} from "lucide-react";

import { getHomeworkDashboard } from "../../services/homeworkService";

const HomeworkDashboard = () => {

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            setLoading(true);

            const response = await getHomeworkDashboard();

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

    const recentHomework = data?.recentHomework || [];

    const subjectWise = data?.subjectWise || [];

    const maxSubjectCount = subjectWise.length > 0
        ? Math.max(...subjectWise.map((s) => s.count))
        : 1;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">Homework Dashboard</h1>

                    <p className="mt-2 text-slate-500">Overview of all homework and submissions.</p>

                </div>

                <button
                    onClick={() => navigate("/homework/create")}
                    className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
                >

                    <Plus size={18} />

                    Create Homework

                </button>

            </div>

            {/* ============================== Stat Cards ============================== */}

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalHomework || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <BookOpen size={22} className="text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.activeHomework || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle size={22} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Overdue</p>
                            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.overdueHomework || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={22} className="text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Submissions</p>
                            <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.totalSubmissions || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <ListChecks size={22} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Graded</p>
                            <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.gradedSubmissions || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Star size={22} className="text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Grade</p>
                            <h3 className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingGrading || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Clock size={22} className="text-orange-600" />
                        </div>
                    </div>
                </div>

            </div>

            {/* ============================== Charts Row ============================== */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 mb-7">

                {/* Subject-wise chart */}

                <div className="bg-white rounded-3xl shadow border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <TrendingUp size={20} className="text-indigo-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Subject-wise Homework</h2>
                            <p className="text-gray-500 text-sm">Number of assignments per subject</p>
                        </div>

                    </div>

                    {subjectWise.length === 0 && (

                        <div className="py-12 text-center text-gray-400">
                            No homework data yet
                        </div>

                    )}

                    {subjectWise.length > 0 && (

                        <div className="space-y-5">

                            {subjectWise.map((item, index) => {

                                const percent = Math.round((item.count / maxSubjectCount) * 100);

                                const colors = [
                                    "bg-indigo-500",
                                    "bg-blue-500",
                                    "bg-purple-500",
                                    "bg-cyan-500",
                                    "bg-teal-500",
                                    "bg-violet-500",
                                    "bg-sky-500",
                                    "bg-fuchsia-500"
                                ];

                                const color = colors[index % colors.length];

                                return (

                                    <div key={item._id}>

                                        <div className="flex justify-between mb-2">

                                            <span className="font-semibold text-gray-700">
                                                {item._id}
                                            </span>

                                            <span className="font-semibold text-gray-500">
                                                {item.count} assignment{item.count !== 1 ? "s" : ""}
                                            </span>

                                        </div>

                                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">

                                            <div
                                                className={"h-full rounded-full " + color + " transition-all duration-700"}
                                                style={{ width: percent + "%" }}
                                            ></div>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </div>

                {/* Quick Stats Panel */}

                <div className="bg-white rounded-3xl shadow border border-gray-100 p-8">

                    <h2 className="text-xl font-bold mb-8">Quick Actions</h2>

                    <div className="grid grid-cols-2 gap-4 mb-8">

                        <button
                            onClick={() => navigate("/homework/list")}
                            className="h-24 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition hover:scale-105"
                        >
                            All Homework
                        </button>

                        <button
                            onClick={() => navigate("/homework/create")}
                            className="h-24 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition hover:scale-105"
                        >
                            Create New
                        </button>

                        <button
                            onClick={() => navigate("/homework/list")}
                            className="h-24 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition hover:scale-105"
                        >
                            Pending Grade
                        </button>

                        <button
                            onClick={() => navigate("/homework/list?status=Closed")}
                            className="h-24 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition hover:scale-105"
                        >
                            Closed
                        </button>

                    </div>

                    {/* Submission overview */}

                    <div className="bg-gray-50 rounded-2xl p-5">

                        <p className="text-sm font-semibold text-gray-600 mb-4">Submission Overview</p>

                        <div className="space-y-3">

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Graded</span>
                                <span className="font-bold text-green-600">{stats.gradedSubmissions || 0}</span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{ width: stats.totalSubmissions > 0 ? Math.round((stats.gradedSubmissions / stats.totalSubmissions) * 100) + "%" : "0%" }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-500">Pending Grading</span>
                                <span className="font-bold text-orange-600">{stats.pendingGrading || 0}</span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-orange-500"
                                    style={{ width: stats.totalSubmissions > 0 ? Math.round((stats.pendingGrading / stats.totalSubmissions) * 100) + "%" : "0%" }}
                                ></div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ============================== Recent Homework Table ============================== */}

            <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">

                <div className="flex items-center justify-between p-7 border-b">

                    <div>
                        <h2 className="text-xl font-bold">Recent Homework</h2>
                        <p className="text-gray-500 mt-1">Last 7 assignments created</p>
                    </div>

                    <button
                        onClick={() => navigate("/homework/list")}
                        className="text-indigo-600 font-semibold hover:underline text-sm"
                    >
                        View All
                    </button>

                </div>

                {recentHomework.length === 0 && (

                    <div className="py-16 text-center">

                        <BookOpen size={50} className="mx-auto text-gray-300 mb-4" />

                        <p className="text-gray-500">No homework created yet</p>

                    </div>

                )}

                {recentHomework.length > 0 && (

                    <table className="w-full">

                        <thead className="bg-gray-50">

                            <tr>

                                <th className="text-left px-6 py-4">Title</th>

                                <th className="text-left px-6 py-4">Subject</th>

                                <th className="text-left px-6 py-4">Teacher</th>

                                <th className="text-left px-6 py-4">Due Date</th>

                                <th className="text-left px-6 py-4">Status</th>

                                <th className="text-center px-6 py-4">Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {recentHomework.map((hw) => {

                                const overdue = hw.status === "Active" && new Date(hw.dueDate) < new Date();

                                return (

                                    <tr key={hw._id} className="border-t hover:bg-gray-50 transition">

                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800">{hw.title}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                {hw.subject}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {hw.teacherId?.fullName || "-"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className={"font-semibold text-sm " + (overdue ? "text-red-600" : "text-gray-700")}>
                                                {new Date(hw.dueDate).toLocaleDateString(undefined, {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </p>
                                            {overdue && (
                                                <p className="text-xs text-red-400 mt-1">Overdue</p>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {hw.status === "Active" ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                    Closed
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => navigate("/homework/" + hw._id)}
                                                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm transition"
                                            >
                                                View
                                            </button>
                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

};

export default HomeworkDashboard;