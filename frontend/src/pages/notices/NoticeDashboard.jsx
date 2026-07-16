import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Plus,
    Archive,
    AlertTriangle,
    CheckCircle,
    Eye,
    BarChart3
} from "lucide-react";

import { getNoticeDashboard } from "../../services/noticeService";

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

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

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

            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

        );

    }

    const stats = data?.stats || {};

    const recentNotices = data?.recentNotices || [];

    const categoryWise = data?.categoryWise || [];

    const audienceWise = data?.audienceWise || [];

    const maxCategoryCount = categoryWise.length > 0
        ? Math.max(...categoryWise.map((c) => c.count))
        : 1;

    const totalAudienceCount = audienceWise.reduce((sum, a) => sum + a.count, 0);

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Notice Dashboard</h1>
                    <p className="mt-2 text-slate-500">Overview of all notices and analytics.</p>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={() => navigate("/notices/archived")}
                        className="flex items-center gap-2 bg-white border border-gray-200 shadow px-5 py-3 rounded-xl hover:bg-gray-50 font-medium transition"
                    >
                        <Archive size={16} />
                        Archived
                    </button>

                    <button
                        onClick={() => navigate("/notices/create")}
                        className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
                    >
                        <Plus size={18} />
                        Create Notice
                    </button>

                </div>

            </div>

            {/* ============================== Stat Cards ============================== */}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalNotices || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Bell size={22} className="text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.activeNotices || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle size={22} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Urgent</p>
                            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.urgentNotices || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={22} className="text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Archived</p>
                            <h3 className="text-3xl font-bold text-gray-500 mt-1">{stats.archivedNotices || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Archive size={22} className="text-gray-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Views</p>
                            <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.totalViews || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Eye size={22} className="text-purple-600" />
                        </div>
                    </div>
                </div>

            </div>

            {/* ============================== Charts Row ============================== */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 mb-7">

                {/* Category Wise Chart */}

                <div className="bg-white rounded-3xl shadow border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <BarChart3 size={20} className="text-indigo-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Category Breakdown</h2>
                            <p className="text-gray-500 text-sm">Notices per category</p>
                        </div>

                    </div>

                    {categoryWise.length === 0 && (

                        <div className="py-12 text-center text-gray-400">
                            No notice data yet
                        </div>

                    )}

                    {categoryWise.length > 0 && (

                        <div className="space-y-5">

                            {categoryWise.map((item, index) => {

                                const percent = Math.round((item.count / maxCategoryCount) * 100);

                                return (

                                    <div key={item._id}>

                                        <div className="flex justify-between mb-2">

                                            <span className="font-semibold text-gray-700">
                                                {item._id}
                                            </span>

                                            <span className="font-semibold text-gray-500">
                                                {item.count} notice{item.count !== 1 ? "s" : ""}
                                            </span>

                                        </div>

                                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">

                                            <div
                                                className={"h-full rounded-full transition-all duration-700 " + CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                                style={{ width: percent + "%" }}
                                            ></div>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </div>

                {/* Audience Distribution */}

                <div className="bg-white rounded-3xl shadow border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Bell size={20} className="text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Audience Distribution</h2>
                            <p className="text-gray-500 text-sm">Who receives each notice</p>
                        </div>

                    </div>

                    {audienceWise.length === 0 && (

                        <div className="py-12 text-center text-gray-400">
                            No notice data yet
                        </div>

                    )}

                    {audienceWise.length > 0 && (

                        <div className="space-y-6">

                            {audienceWise.map((item) => {

                                const percent = totalAudienceCount > 0
                                    ? Math.round((item.count / totalAudienceCount) * 100)
                                    : 0;

                                const barColor = AUDIENCE_COLORS[item._id] || "bg-gray-500";

                                return (

                                    <div key={item._id}>

                                        <div className="flex justify-between mb-2">

                                            <span className="font-semibold text-gray-700">
                                                {item._id}
                                            </span>

                                            <span className="font-semibold text-gray-500">
                                                {item.count} ({percent}%)
                                            </span>

                                        </div>

                                        <div className="h-4 rounded-full bg-gray-100 overflow-hidden">

                                            <div
                                                className={"h-full rounded-full transition-all duration-700 " + barColor}
                                                style={{ width: percent + "%" }}
                                            ></div>

                                        </div>

                                    </div>

                                );

                            })}

                            <div className="flex flex-wrap gap-4 pt-2">

                                {Object.entries(AUDIENCE_COLORS).map(([label, color]) => (

                                    <div key={label} className="flex items-center gap-2">

                                        <div className={"w-3 h-3 rounded-full " + color}></div>

                                        <span className="text-sm text-gray-600">{label}</span>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                </div>

            </div>

            {/* ============================== Quick Actions ============================== */}

            <div className="bg-white rounded-3xl shadow border border-gray-100 p-8 mb-7">

                <h2 className="text-xl font-bold mb-6">Quick Actions</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    <button
                        onClick={() => navigate("/notices/list")}
                        className="h-24 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition hover:scale-105"
                    >
                        All Notices
                    </button>

                    <button
                        onClick={() => navigate("/notices/create")}
                        className="h-24 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition hover:scale-105"
                    >
                        Create Notice
                    </button>

                    <button
                        onClick={() => navigate("/notices/board")}
                        className="h-24 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold transition hover:scale-105"
                    >
                        Notice Board
                    </button>

                    <button
                        onClick={() => navigate("/notices/archived")}
                        className="h-24 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition hover:scale-105"
                    >
                        Archived
                    </button>

                </div>

            </div>

            {/* ============================== Recent Notices ============================== */}

            <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">

                <div className="flex items-center justify-between p-7 border-b">

                    <div>
                        <h2 className="text-xl font-bold">Recent Notices</h2>
                        <p className="text-gray-500 mt-1">Last 7 notices published</p>
                    </div>

                    <button
                        onClick={() => navigate("/notices/list")}
                        className="text-indigo-600 font-semibold hover:underline text-sm"
                    >
                        View All
                    </button>

                </div>

                {recentNotices.length === 0 && (

                    <div className="py-16 text-center">
                        <Bell size={50} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No notices published yet</p>
                    </div>

                )}

                {recentNotices.length > 0 && (

                    <table className="w-full">

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4">Title</th>
                                <th className="text-left px-6 py-4">Category</th>
                                <th className="text-left px-6 py-4">Priority</th>
                                <th className="text-left px-6 py-4">Audience</th>
                                <th className="text-left px-6 py-4">Views</th>
                                <th className="text-left px-6 py-4">Date</th>
                                <th className="text-center px-6 py-4">Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {recentNotices.map((notice) => (

                                <tr key={notice._id} className="border-t hover:bg-gray-50 transition">

                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800 max-w-xs truncate">
                                            {notice.title}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                            {notice.category}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (PRIORITY_STYLE[notice.priority] || "bg-gray-100 text-gray-600")}>
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
                                        {new Date(notice.createdAt).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigate("/notices/" + notice._id)}
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

export default NoticeDashboard;