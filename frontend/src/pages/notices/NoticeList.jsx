import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, Bell, Paperclip } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getAllNotices, deleteNotice, archiveNotice, searchNotices } from "../../services/noticeService";

const PRIORITY_STYLE = {
    Low: "bg-gray-100 text-gray-600",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Urgent: "bg-red-100 text-red-700"
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

const AUDIENCE_STYLE = {
    All: "bg-indigo-100 text-indigo-700",
    Teachers: "bg-blue-100 text-blue-700",
    Students: "bg-green-100 text-green-700",
    Parents: "bg-orange-100 text-orange-700"
};

const NoticeList = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [notices, setNotices] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        category: "",
        priority: "",
        audience: ""
    });

    useEffect(() => {

        loadNotices();

    }, []);

    const loadNotices = async (activeFilters = filters) => {

        try {

            setLoading(true);

            const response = await getAllNotices(activeFilters);

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

    const handleFilterChange = (key, value) => {

        const updated = { ...filters, [key]: value };
        setFilters(updated);

    };

    const handleReset = () => {

        const reset = { category: "", priority: "", audience: "" };
        setFilters(reset);
        setSearch("");
        loadNotices(reset);

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this notice permanently?")) return;

        try {

            await deleteNotice(id);
            loadNotices();

        } catch (error) {

            alert(error.response?.data?.message || "Unable to delete notice");

        }

    };

    const handleArchive = async (id) => {

        if (!window.confirm("Archive this notice?")) return;

        try {

            await archiveNotice(id);
            loadNotices();

        } catch (error) {

            alert(error.response?.data?.message || "Unable to archive notice");

        }

    };

    const isExpired = (expiryDate) => {

        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();

    };

    const isAdmin = user?.role === "admin";

    const isTeacherOrAdmin =
        user?.role === "admin" || user?.role === "teacher";

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div>
                    <h1 className="text-4xl font-bold text-slate-800">All Notices</h1>
                    <p className="mt-2 text-slate-500">Total : {notices.length} notices</p>
                </div>

                {isTeacherOrAdmin && (

                    <button
                        onClick={() => navigate("/notices/create")}
                        className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
                    >
                        <Plus size={18} />
                        Create Notice
                    </button>

                )}

            </div>

            {/* ============================== Filters ============================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div className="flex items-center bg-gray-100 rounded-xl px-4">
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
                        value={filters.category}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
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
                        <option value="Urgent">Urgent</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange("priority", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>

                    <select
                        value={filters.audience}
                        onChange={(e) => handleFilterChange("audience", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Audiences</option>
                        <option value="All">All</option>
                        <option value="Teachers">Teachers</option>
                        <option value="Students">Students</option>
                        <option value="Parents">Parents</option>
                    </select>

                </div>

                <div className="flex justify-end gap-3 mt-5">

                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition"
                    >
                        <RefreshCw size={16} />
                        Reset
                    </button>

                    <button
                        onClick={() => loadNotices(filters)}
                        className="px-6 py-2 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white font-semibold transition"
                    >
                        Apply Filters
                    </button>

                </div>

            </div>

            {/* ============================== Notice Cards / Table ============================== */}

            {loading && (

                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>

            )}

            {!loading && notices.length === 0 && (

                <div className="bg-white rounded-3xl p-16 text-center shadow">
                    <Bell size={56} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600">No Notices Found</h2>
                    <p className="text-gray-400 mt-2">Try changing filters or create a new notice.</p>
                </div>

            )}

            {!loading && notices.length > 0 && (

                <div className="space-y-4">

                    {notices.map((notice) => (

                        <div
                            key={notice._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                        >

                            <div className="flex flex-col lg:flex-row lg:items-start gap-5">

                                {/* Left Icon */}

                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                                    <Bell size={22} className="text-indigo-600" />
                                </div>

                                {/* Content */}

                                <div className="flex-1">

                                    <div className="flex flex-wrap items-center gap-3 mb-3">

                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (CATEGORY_STYLE[notice.category] || "bg-gray-100 text-gray-600")}>
                                            {notice.category}
                                        </span>

                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (PRIORITY_STYLE[notice.priority] || "bg-gray-100 text-gray-600")}>
                                            {notice.priority} Priority
                                        </span>

                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (AUDIENCE_STYLE[notice.audience] || "bg-gray-100 text-gray-600")}>
                                            For: {notice.audience}
                                        </span>

                                        {isExpired(notice.expiryDate) && (

                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                                Expired
                                            </span>

                                        )}

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

                                        <span>
                                            By: {notice.publishedBy}
                                        </span>

                                        <span>
                                            {new Date(notice.createdAt).toLocaleDateString(undefined, {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </span>

                                        <span>
                                            {notice.views} views
                                        </span>

                                        {notice.expiryDate && (

                                            <span>
                                                Expires: {new Date(notice.expiryDate).toLocaleDateString(undefined, {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>

                                        )}

                                    </div>

                                </div>

                                {/* Actions */}

                                <div className="flex flex-wrap gap-2 shrink-0">

                                    <button
                                        onClick={() => navigate("/notices/" + notice._id)}
                                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition"
                                    >
                                        View
                                    </button>

                                    {isTeacherOrAdmin && (

                                        <button
                                            onClick={() => navigate("/notices/edit/" + notice._id)}
                                            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition"
                                        >
                                            Edit
                                        </button>

                                    )}

                                    {isAdmin && (

                                        <button
                                            onClick={() => handleArchive(notice._id)}
                                            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm transition"
                                        >
                                            Archive
                                        </button>

                                    )}

                                    {isAdmin && (

                                        <button
                                            onClick={() => handleDelete(notice._id)}
                                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                                        >
                                            Delete
                                        </button>

                                    )}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

};

export default NoticeList;