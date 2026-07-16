import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, RefreshCw, Paperclip, Clock } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getNoticesByAudience, searchNotices } from "../../services/noticeService";

const PRIORITY_STYLE = {
    Low: "bg-gray-100 text-gray-600",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Urgent: "bg-red-100 text-red-700"
};

const PRIORITY_BORDER = {
    Low: "border-l-gray-300",
    Medium: "border-l-blue-400",
    High: "border-l-orange-400",
    Urgent: "border-l-red-500"
};

const CATEGORY_STYLE = {
    General: "bg-indigo-100 text-indigo-700",
    Academic: "bg-blue-100 text-blue-700",
    Exam: "bg-purple-100 text-purple-700",
    Holiday: "bg-green-100 text-green-700",
    Event: "bg-cyan-100 text-cyan-700",
    Sports: "bg-teal-100 text-teal-700",
    Fee: "bg-yellow-100 text-yellow-700",
    Urgent: "bg-red-100 text-red-700",
    Other: "bg-gray-100 text-gray-600"
};

const getTimeAgo = (dateStr) => {

    const diff = new Date() - new Date(dateStr);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    if (days < 30) return Math.floor(days / 7) + " weeks ago";
    return Math.floor(days / 30) + " months ago";

};

const StudentNoticeBoard = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [notices, setNotices] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] = useState("");

    const [priorityFilter, setPriorityFilter] = useState("");

    useEffect(() => {

        loadNotices();

    }, []);

    const loadNotices = async () => {

        try {

            setLoading(true);

            const role = user?.role === "student"
                ? "Students"
                : user?.role === "teacher"
                ? "Teachers"
                : "All";

            const response = await getNoticesByAudience(role);

            setNotices(response.notices || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleSearch = async () => {

        if (!search.trim()) {
            loadNotices();
            return;
        }

        try {

            setLoading(true);

            const response = await searchNotices(search);

            setNotices(response.notices || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleReset = () => {

        setSearch("");
        setCategoryFilter("");
        setPriorityFilter("");
        loadNotices();

    };

    const filteredNotices = notices.filter((notice) => {

        const categoryMatch = categoryFilter
            ? notice.category === categoryFilter
            : true;

        const priorityMatch = priorityFilter
            ? notice.priority === priorityFilter
            : true;

        return categoryMatch && priorityMatch;

    });

    const urgentNotices = filteredNotices.filter((n) => n.priority === "Urgent");

    const regularNotices = filteredNotices.filter((n) => n.priority !== "Urgent");

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-slate-800">Notice Board</h1>

                <p className="mt-2 text-slate-500">
                    Showing notices for: <span className="font-semibold text-indigo-600 capitalize">{user?.role}</span>
                </p>

            </div>

            {/* ============================== Urgent Banner ============================== */}

            {urgentNotices.length > 0 && (

                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-7">

                    <div className="flex items-center gap-3 mb-4">

                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <Bell size={16} className="text-white" />
                        </div>

                        <h2 className="font-bold text-red-700 text-lg">
                            🚨 Urgent Notices ({urgentNotices.length})
                        </h2>

                    </div>

                    <div className="space-y-3">

                        {urgentNotices.map((notice) => (

                            <div
                                key={notice._id}
                                onClick={() => navigate("/notices/" + notice._id)}
                                className="bg-white border border-red-200 rounded-xl p-4 cursor-pointer hover:bg-red-50 transition"
                            >

                                <div className="flex items-start justify-between gap-4">

                                    <div className="flex-1">

                                        <h3 className="font-bold text-gray-800">
                                            {notice.title}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                            {notice.description}
                                        </p>

                                    </div>

                                    <span className="text-xs text-gray-400 shrink-0">
                                        {getTimeAgo(notice.createdAt)}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {/* ============================== Filters ============================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div className="md:col-span-2 flex items-center bg-gray-100 rounded-xl px-4">

                        <Search size={18} className="text-gray-500" />

                        <input
                            type="text"
                            placeholder="Search notices..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="flex-1 bg-transparent px-3 py-3 outline-none"
                        />

                        <button
                            onClick={handleSearch}
                            className="bg-[#5B2EFF] hover:bg-[#4724db] text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                            Search
                        </button>

                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Categories</option>
                        <option value="General">General</option>
                        <option value="Academic">Academic</option>
                        <option value="Exam">Exam</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Event">Event</option>
                        <option value="Sports">Sports</option>
                        <option value="Fee">Fee</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>

                </div>

                <div className="flex justify-end mt-4">

                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition"
                    >
                        <RefreshCw size={16} />
                        Reset
                    </button>

                </div>

            </div>

            {/* ============================== Loading ============================== */}

            {loading && (

                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>

            )}

            {/* ============================== Empty State ============================== */}

            {!loading && filteredNotices.length === 0 && (

                <div className="bg-white rounded-3xl p-16 text-center shadow">

                    <Bell size={56} className="mx-auto text-gray-300 mb-4" />

                    <h2 className="text-xl font-semibold text-gray-600">No Notices</h2>

                    <p className="text-gray-400 mt-2">
                        No notices found for your role right now.
                    </p>

                </div>

            )}

            {/* ============================== Regular Notices ============================== */}

            {!loading && regularNotices.length > 0 && (

                <div className="space-y-4">

                    <p className="text-sm font-semibold text-gray-500 mb-4">
                        {regularNotices.length} Notice{regularNotices.length !== 1 ? "s" : ""}
                    </p>

                    {regularNotices.map((notice) => (

                        <div
                            key={notice._id}
                            onClick={() => navigate("/notices/" + notice._id)}
                            className={"bg-white rounded-2xl shadow-sm border-l-4 border border-gray-100 p-6 cursor-pointer hover:shadow-md transition " + (PRIORITY_BORDER[notice.priority] || "border-l-gray-300")}
                        >

                            <div className="flex flex-col lg:flex-row lg:items-start gap-5">

                                {/* Icon */}

                                <div className={"w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 " + (notice.priority === "High" ? "bg-orange-100" : "bg-indigo-100")}>
                                    <Bell size={22} className={notice.priority === "High" ? "text-orange-600" : "text-indigo-600"} />
                                </div>

                                {/* Content */}

                                <div className="flex-1">

                                    <div className="flex flex-wrap items-center gap-3 mb-3">

                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (CATEGORY_STYLE[notice.category] || "bg-gray-100 text-gray-600")}>
                                            {notice.category}
                                        </span>

                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (PRIORITY_STYLE[notice.priority] || "bg-gray-100 text-gray-600")}>
                                            {notice.priority}
                                        </span>

                                        {notice.attachment && (

                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Paperclip size={12} />
                                                Attachment
                                            </span>

                                        )}

                                    </div>

                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {notice.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                                        {notice.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-400">

                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {getTimeAgo(notice.createdAt)}
                                        </span>

                                        <span>
                                            By: {notice.publishedBy || "Admin"}
                                        </span>

                                        {notice.expiryDate && (

                                            <span>
                                                Expires: {new Date(notice.expiryDate).toLocaleDateString(undefined, {
                                                    day: "2-digit",
                                                    month: "short"
                                                })}
                                            </span>

                                        )}

                                    </div>

                                </div>

                                {/* Arrow */}

                                <div className="shrink-0 text-gray-400 text-xl self-center">
                                    &rsaquo;
                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

};

export default StudentNoticeBoard;