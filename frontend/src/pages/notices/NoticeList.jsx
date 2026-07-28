import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, Bell, Paperclip, Loader2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
    getAllNotices,
    deleteNotice,
    archiveNotice,
    searchNotices
} from "../../services/noticeService";

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
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        category: "",
        priority: "",
        audience: ""
    });

    const text = {
        pageTitle: isGujarati ? "બધી નોટિસ" : "All Notices",
        total: isGujarati ? "કુલ" : "Total",
        notices: isGujarati ? "નોટિસ" : "notices",
        createNotice: isGujarati ? "નોટિસ બનાવો" : "Create Notice",
        searchPlaceholder: isGujarati ? "નોટિસ શોધો..." : "Search notices...",
        search: isGujarati ? "શોધો" : "Search",
        allCategories: isGujarati ? "બધી શ્રેણીઓ" : "All Categories",
        general: isGujarati ? "સામાન્ય" : "General",
        academic: isGujarati ? "શૈક્ષણિક" : "Academic",
        exam: isGujarati ? "પરીક્ષા" : "Exam",
        holiday: isGujarati ? "રજા" : "Holiday",
        event: isGujarati ? "કાર્યક્રમ" : "Event",
        sports: isGujarati ? "રમતગમત" : "Sports",
        fee: isGujarati ? "ફી" : "Fee",
        urgent: isGujarati ? "તાત્કાલિક" : "Urgent",
        other: isGujarati ? "અન્ય" : "Other",
        allPriorities: isGujarati ? "બધી પ્રાધાન્યતાઓ" : "All Priorities",
        low: isGujarati ? "ઓછું" : "Low",
        medium: isGujarati ? "મધ્યમ" : "Medium",
        high: isGujarati ? "ઊંચું" : "High",
        allAudiences: isGujarati ? "બધા પ્રેક્ષકો" : "All Audiences",
        all: isGujarati ? "બધા" : "All",
        teachers: isGujarati ? "શિક્ષકો" : "Teachers",
        students: isGujarati ? "વિદ્યાર્થીઓ" : "Students",
        parents: isGujarati ? "વાલીઓ" : "Parents",
        reset: isGujarati ? "રીસેટ" : "Reset",
        applyFilters: isGujarati ? "ફિલ્ટર લાગુ કરો" : "Apply Filters",
        loading: isGujarati ? "નોટિસ લોડ થઈ રહી છે..." : "Loading notices...",
        noNoticesFound: isGujarati ? "કોઈ નોટિસ મળી નથી" : "No Notices Found",
        noNoticesText: isGujarati
            ? "ફિલ્ટર બદલો અથવા નવી નોટિસ બનાવો."
            : "Try changing filters or create a new notice.",
        priorityLabel: isGujarati ? "પ્રાધાન્યતા" : "Priority",
        forLabel: isGujarati ? "માટે" : "For",
        expired: isGujarati ? "સમાપ્ત" : "Expired",
        attachment: isGujarati ? "જોડાણ" : "Attachment",
        by: isGujarati ? "દ્વારા" : "By",
        views: isGujarati ? "વ્યુ" : "views",
        expires: isGujarati ? "સમાપ્તિ" : "Expires",
        view: isGujarati ? "જુઓ" : "View",
        edit: isGujarati ? "સંપાદિત કરો" : "Edit",
        archive: isGujarati ? "આર્કાઇવ" : "Archive",
        delete: isGujarati ? "ડિલીટ કરો" : "Delete",
        confirmDelete: isGujarati
            ? "આ નોટિસ કાયમ માટે ડિલીટ કરવી છે?"
            : "Delete this notice permanently?",
        confirmArchive: isGujarati
            ? "આ નોટિસ આર્કાઇવ કરવી છે?"
            : "Archive this notice?",
        alertDeleteError: isGujarati
            ? "નોટિસ ડિલીટ કરવામાં અસમર્થ"
            : "Unable to delete notice",
        alertArchiveError: isGujarati
            ? "નોટિસ આર્કાઇવ કરવામાં અસમર્થ"
            : "Unable to archive notice"
    };

    const categoryLabel = {
        General: text.general,
        Academic: text.academic,
        Exam: text.exam,
        Holiday: text.holiday,
        Event: text.event,
        Sports: text.sports,
        Fee: text.fee,
        Urgent: text.urgent,
        Other: text.other
    };

    const priorityLabel = {
        Low: text.low,
        Medium: text.medium,
        High: text.high,
        Urgent: text.urgent
    };

    const audienceLabel = {
        All: text.all,
        Teachers: text.teachers,
        Students: text.students,
        Parents: text.parents
    };

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
        if (!window.confirm(text.confirmDelete)) return;

        try {
            await deleteNotice(id);
            loadNotices();
        } catch (error) {
            alert(error.response?.data?.message || text.alertDeleteError);
        }
    };

    const handleArchive = async (id) => {
        if (!window.confirm(text.confirmArchive)) return;

        try {
            await archiveNotice(id);
            loadNotices();
        } catch (error) {
            alert(error.response?.data?.message || text.alertArchiveError);
        }
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const formatDate = (dateValue) =>
        new Date(dateValue).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    const isAdmin = user?.role === "admin";
    const isTeacherOrAdmin = user?.role === "admin" || user?.role === "teacher";

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}
            <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.pageTitle}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.total} : {notices.length} {text.notices}
                    </p>
                </div>

                {isTeacherOrAdmin && (
                    <button
                        onClick={() => navigate("/notices/create")}
                        className="flex w-fit items-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db]"
                    >
                        <Plus size={18} />
                        {text.createNotice}
                    </button>
                )}
            </div>

            {/* ============================== Filters ============================== */}
            <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="flex items-center rounded-xl bg-gray-100 px-4">
                        <Search size={18} className="shrink-0 text-gray-500" />
                        <input
                            type="text"
                            placeholder={text.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none"
                        />
                        <button
                            onClick={handleSearch}
                            className="shrink-0 rounded-lg bg-[#5B2EFF] px-4 py-2 text-sm text-white transition hover:bg-[#4724db]"
                        >
                            {text.search}
                        </button>
                    </div>

                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allCategories}</option>
                        <option value="General">{text.general}</option>
                        <option value="Academic">{text.academic}</option>
                        <option value="Exam">{text.exam}</option>
                        <option value="Holiday">{text.holiday}</option>
                        <option value="Event">{text.event}</option>
                        <option value="Sports">{text.sports}</option>
                        <option value="Fee">{text.fee}</option>
                        <option value="Urgent">{text.urgent}</option>
                        <option value="Other">{text.other}</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange("priority", e.target.value)}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allPriorities}</option>
                        <option value="Low">{text.low}</option>
                        <option value="Medium">{text.medium}</option>
                        <option value="High">{text.high}</option>
                        <option value="Urgent">{text.urgent}</option>
                    </select>

                    <select
                        value={filters.audience}
                        onChange={(e) => handleFilterChange("audience", e.target.value)}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allAudiences}</option>
                        <option value="All">{text.all}</option>
                        <option value="Teachers">{text.teachers}</option>
                        <option value="Students">{text.students}</option>
                        <option value="Parents">{text.parents}</option>
                    </select>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-800"
                    >
                        <RefreshCw size={16} />
                        {text.reset}
                    </button>

                    <button
                        onClick={() => loadNotices(filters)}
                        className="rounded-xl bg-[#5B2EFF] px-6 py-2 font-semibold text-white transition hover:bg-[#4724db]"
                    >
                        {text.applyFilters}
                    </button>
                </div>
            </div>

            {/* ============================== Notice Cards ============================== */}
            {loading && (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
                    <Loader2 size={38} className="animate-spin text-[#5B2EFF]" />
                    <p className="font-medium text-slate-500">{text.loading}</p>
                </div>
            )}

            {!loading && notices.length === 0 && (
                <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm sm:p-16">
                    <Bell size={56} className="mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold text-gray-600">
                        {text.noNoticesFound}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-400 sm:text-base">
                        {text.noNoticesText}
                    </p>
                </div>
            )}

            {!loading && notices.length > 0 && (
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <div
                            key={notice._id}
                            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
                        >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                                {/* Left Icon */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
                                    <Bell size={22} className="text-indigo-600" />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                CATEGORY_STYLE[notice.category] ||
                                                "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {categoryLabel[notice.category] || notice.category}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                PRIORITY_STYLE[notice.priority] ||
                                                "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {priorityLabel[notice.priority] || notice.priority}{" "}
                                            {text.priorityLabel}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                AUDIENCE_STYLE[notice.audience] ||
                                                "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {text.forLabel}:{" "}
                                            {audienceLabel[notice.audience] || notice.audience}
                                        </span>

                                        {isExpired(notice.expiryDate) && (
                                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                                                {text.expired}
                                            </span>
                                        )}

                                        {notice.attachment && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Paperclip size={12} />
                                                {text.attachment}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="mb-2 text-lg font-bold text-gray-800">
                                        {notice.title}
                                    </h3>

                                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
                                        {notice.description}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                                        <span>
                                            {text.by}: {notice.publishedBy}
                                        </span>

                                        <span>{formatDate(notice.createdAt)}</span>

                                        <span>
                                            {notice.views} {text.views}
                                        </span>

                                        {notice.expiryDate && (
                                            <span>
                                                {text.expires}: {formatDate(notice.expiryDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 lg:shrink-0">
                                    <button
                                        onClick={() => navigate(`/notices/${notice._id}`)}
                                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600"
                                    >
                                        {text.view}
                                    </button>

                                    {isTeacherOrAdmin && (
                                        <button
                                            onClick={() => navigate(`/notices/edit/${notice._id}`)}
                                            className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-white transition hover:bg-amber-600"
                                        >
                                            {text.edit}
                                        </button>
                                    )}

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleArchive(notice._id)}
                                            className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white transition hover:bg-gray-600"
                                        >
                                            {text.archive}
                                        </button>
                                    )}

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(notice._id)}
                                            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                                        >
                                            {text.delete}
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