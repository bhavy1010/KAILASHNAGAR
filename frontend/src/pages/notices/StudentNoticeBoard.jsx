import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Search,
    RefreshCw,
    Paperclip,
    Clock,
    Loader2,
    Languages
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
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

const CATEGORY_LABEL_GU = {
    General: "સામાન્ય",
    Academic: "શૈક્ષણિક",
    Exam: "પરીક્ષા",
    Holiday: "રજા",
    Event: "કાર્યક્રમ",
    Sports: "રમતગમત",
    Fee: "ફી",
    Urgent: "તાત્કાલિક",
    Other: "અન્ય"
};

const PRIORITY_LABEL_GU = {
    Low: "ઓછી",
    Medium: "મધ્યમ",
    High: "ઊંચી",
    Urgent: "તાત્કાલિક"
};

const ROLE_LABEL_GU = {
    student: "વિદ્યાર્થી",
    teacher: "શિક્ષક",
    admin: "એડમિન"
};

const StudentNoticeBoard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    const text = {
        title: isGujarati ? "નોટિસ બોર્ડ" : "Notice Board",
        showingFor: isGujarati ? "માટે નોટિસ બતાવવામાં આવી રહી છે:" : "Showing notices for:",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        urgentNotices: isGujarati ? "તાત્કાલિક નોટિસ" : "Urgent Notices",
        searchPlaceholder: isGujarati ? "નોટિસ શોધો..." : "Search notices...",
        search: isGujarati ? "શોધો" : "Search",
        allCategories: isGujarati ? "બધી શ્રેણીઓ" : "All Categories",
        allPriorities: isGujarati ? "બધી પ્રાથમિકતાઓ" : "All Priorities",
        reset: isGujarati ? "રીસેટ" : "Reset",
        loading: isGujarati ? "નોટિસ લોડ થઈ રહી છે..." : "Loading notices...",
        noNoticesTitle: isGujarati ? "કોઈ નોટિસ નથી" : "No Notices",
        noNoticesSub: isGujarati
            ? "તમારી ભૂમિકા માટે હાલમાં કોઈ નોટિસ મળી નથી."
            : "No notices found for your role right now.",
        noticeCountSuffix: isGujarati ? "નોટિસ" : "Notice",
        attachment: isGujarati ? "જોડાણ" : "Attachment",
        by: isGujarati ? "દ્વારા:" : "By:",
        admin: isGujarati ? "એડમિન" : "Admin",
        expires: isGujarati ? "સમાપ્તિ:" : "Expires:",
        today: isGujarati ? "આજે" : "Today",
        yesterday: isGujarati ? "ગઈકાલે" : "Yesterday",
        daysAgo: isGujarati ? "દિવસ પહેલા" : "days ago",
        weeksAgo: isGujarati ? "અઠવાડિયા પહેલા" : "weeks ago",
        monthsAgo: isGujarati ? "મહિના પહેલા" : "months ago"
    };

    const categoryOptions = [
        "General",
        "Academic",
        "Exam",
        "Holiday",
        "Event",
        "Sports",
        "Fee",
        "Other"
    ];

    const priorityOptions = ["Low", "Medium", "High", "Urgent"];

    const categoryLabel = (category) =>
        isGujarati ? CATEGORY_LABEL_GU[category] || category : category;

    const priorityLabel = (priority) =>
        isGujarati ? PRIORITY_LABEL_GU[priority] || priority : priority;

    const roleLabel = (role) => (isGujarati ? ROLE_LABEL_GU[role] || role : role);

    const getTimeAgo = (dateStr) => {
        const diff = new Date() - new Date(dateStr);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return text.today;
        if (days === 1) return text.yesterday;
        if (days < 7) return days + " " + text.daysAgo;
        if (days < 30) return Math.floor(days / 7) + " " + text.weeksAgo;
        return Math.floor(days / 30) + " " + text.monthsAgo;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short"
        });
    };

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        try {
            setLoading(true);

            const role =
                user?.role === "student"
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
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.showingFor}{" "}
                        <span className="font-semibold capitalize text-indigo-600">
                            {roleLabel(user?.role)}
                        </span>
                    </p>
                </div>

                <button
                    onClick={toggleLanguage}
                    className="flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#5B2EFF] hover:text-[#5B2EFF]"
                >
                    <Languages size={16} />
                    {text.switchLang}
                </button>
            </div>

            {/* ============================== Urgent Banner ============================== */}

            {urgentNotices.length > 0 && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 sm:mb-7 sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500">
                            <Bell size={16} className="text-white" />
                        </div>

                        <h2 className="text-base font-bold text-red-700 sm:text-lg">
                            🚨 {text.urgentNotices} ({urgentNotices.length})
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {urgentNotices.map((notice) => (
                            <div
                                key={notice._id}
                                onClick={() => navigate("/notices/" + notice._id)}
                                className="cursor-pointer rounded-xl border border-red-200 bg-white p-4 transition hover:bg-red-50"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-bold text-gray-800">
                                            {notice.title}
                                        </h3>

                                        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                                            {notice.description}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-xs text-gray-400">
                                        {getTimeAgo(notice.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================== Filters ============================== */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-7 sm:p-5">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-4">
                    <div className="flex items-center rounded-xl bg-gray-100 px-3 sm:px-4 md:col-span-2">
                        <Search size={18} className="shrink-0 text-gray-500" />

                        <input
                            type="text"
                            placeholder={text.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none sm:px-3"
                        />

                        <button
                            onClick={handleSearch}
                            className="shrink-0 rounded-lg bg-[#5B2EFF] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#4724db] sm:px-4 sm:text-sm"
                        >
                            {text.search}
                        </button>
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allCategories}</option>
                        {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                                {categoryLabel(category)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allPriorities}</option>
                        {priorityOptions.map((priority) => (
                            <option key={priority} value={priority}>
                                {priorityLabel(priority)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-xl bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-800"
                    >
                        <RefreshCw size={16} />
                        {text.reset}
                    </button>
                </div>
            </div>

            {/* ============================== Loading ============================== */}

            {loading && (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
                    <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                    <p className="font-medium text-slate-500">{text.loading}</p>
                </div>
            )}

            {/* ============================== Empty State ============================== */}

            {!loading && filteredNotices.length === 0 && (
                <div className="rounded-3xl bg-white p-10 text-center shadow sm:p-16">
                    <Bell size={56} className="mx-auto mb-4 text-gray-300" />

                    <h2 className="text-xl font-semibold text-gray-600">
                        {text.noNoticesTitle}
                    </h2>

                    <p className="mt-2 text-gray-400">{text.noNoticesSub}</p>
                </div>
            )}

            {/* ============================== Regular Notices ============================== */}

            {!loading && regularNotices.length > 0 && (
                <div className="space-y-4">
                    <p className="mb-4 text-sm font-semibold text-gray-500">
                        {regularNotices.length} {text.noticeCountSuffix}
                        {regularNotices.length !== 1 && !isGujarati ? "s" : ""}
                    </p>

                    {regularNotices.map((notice) => (
                        <div
                            key={notice._id}
                            onClick={() => navigate("/notices/" + notice._id)}
                            className={
                                "cursor-pointer rounded-2xl border border-l-4 border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6 " +
                                (PRIORITY_BORDER[notice.priority] || "border-l-gray-300")
                            }
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:gap-5">
                                {/* Icon */}

                                <div
                                    className={
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl " +
                                        (notice.priority === "High"
                                            ? "bg-orange-100"
                                            : "bg-indigo-100")
                                    }
                                >
                                    <Bell
                                        size={22}
                                        className={
                                            notice.priority === "High"
                                                ? "text-orange-600"
                                                : "text-indigo-600"
                                        }
                                    />
                                </div>

                                {/* Content */}

                                <div className="min-w-0 flex-1">
                                    <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                                        <span
                                            className={
                                                "rounded-full px-3 py-1 text-xs font-semibold " +
                                                (CATEGORY_STYLE[notice.category] ||
                                                    "bg-gray-100 text-gray-600")
                                            }
                                        >
                                            {categoryLabel(notice.category)}
                                        </span>

                                        <span
                                            className={
                                                "rounded-full px-3 py-1 text-xs font-semibold " +
                                                (PRIORITY_STYLE[notice.priority] ||
                                                    "bg-gray-100 text-gray-600")
                                            }
                                        >
                                            {priorityLabel(notice.priority)}
                                        </span>

                                        {notice.attachment && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Paperclip size={12} />
                                                {text.attachment}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="mb-2 break-words text-base font-bold text-gray-800 sm:text-lg">
                                        {notice.title}
                                    </h3>

                                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
                                        {notice.description}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400 sm:gap-4">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {getTimeAgo(notice.createdAt)}
                                        </span>

                                        <span>
                                            {text.by} {notice.publishedBy || text.admin}
                                        </span>

                                        {notice.expiryDate && (
                                            <span>
                                                {text.expires} {formatDate(notice.expiryDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}

                                <div className="hidden shrink-0 self-center text-xl text-gray-400 sm:block">
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