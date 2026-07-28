import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    RefreshCw,
    Loader2,
    ClipboardList
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeworkForStudent } from "../../services/homeworkService";

const StudentHomework = () => {
    const navigate = useNavigate();

    const { user } = useAuth();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");

    const text = {
        pageTitle: isGujarati ? "મારું ગૃહકાર્ય" : "My Homework",
        pageSubtitle: isGujarati
            ? "તમારા વર્ગને સોંપાયેલ તમામ ગૃહકાર્ય."
            : "All homework assigned to your class.",
        total: isGujarati ? "કુલ" : "Total",
        assignments: isGujarati ? "સોંપણીઓ" : "Assignments",
        pending: isGujarati ? "બાકી" : "Pending",
        notSubmitted: isGujarati ? "સબમિટ કરેલ નથી" : "Not submitted",
        submitted: isGujarati ? "સબમિટ કરેલ" : "Submitted",
        awaitingGrade: isGujarati ? "ગ્રેડની રાહમાં" : "Awaiting grade",
        graded: isGujarati ? "ગ્રેડ થયેલ" : "Graded",
        completed: isGujarati ? "પૂર્ણ થયેલ" : "Completed",
        searchPlaceholder: isGujarati
            ? "શીર્ષક અથવા વિષય દ્વારા શોધો..."
            : "Search by title or subject...",
        allSubjects: isGujarati ? "બધા વિષયો" : "All Subjects",
        allStatus: isGujarati ? "બધી સ્થિતિ" : "All Status",
        late: isGujarati ? "મોડું" : "Late",
        reset: isGujarati ? "રીસેટ" : "Reset",
        loading: isGujarati ? "ગૃહકાર્ય લોડ થઈ રહ્યું છે..." : "Loading homework...",
        noHomework: isGujarati ? "કોઈ ગૃહકાર્ય મળ્યું નથી" : "No Homework Found",
        noHomeworkText: isGujarati
            ? "હજુ સુધી કોઈ ગૃહકાર્ય સોંપાયેલ નથી અથવા ફિલ્ટર બદલીને જુઓ."
            : "No homework assigned yet or try changing filters.",
        due: isGujarati ? "છેલ્લી તારીખ" : "Due",
        overdue: isGujarati ? "મુદત વીતી ગઈ" : "Overdue",
        dueToday: isGujarati ? "આજે છેલ્લી તારીખ" : "Due Today",
        oneDayLeft: isGujarati ? "1 દિવસ બાકી" : "1 Day Left",
        daysLeft: isGujarati ? "દિવસ બાકી" : "Days Left",
        marks: isGujarati ? "ગુણ" : "Marks",
        got: isGujarati ? "મળ્યા" : "Got",
        teacherFeedback: isGujarati ? "શિક્ષકનો પ્રતિભાવ" : "Teacher Feedback",
        submitHomework: isGujarati ? "ગૃહકાર્ય સબમિટ કરો" : "Submit Homework",
        viewDetails: isGujarati ? "વિગતો જુઓ" : "View Details"
    };

    const statusLabel = {
        Pending: text.pending,
        Submitted: text.submitted,
        Late: text.late,
        Graded: text.graded
    };

    useEffect(() => {
        loadHomework();
    }, []);

    const loadHomework = async () => {
        try {
            setLoading(true);

            const studentId = user?.studentId || user?.id;
            const response = await getHomeworkForStudent(studentId);

            setHomework(response.homework || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === "Submitted") return "bg-blue-100 text-blue-700";
        if (status === "Graded") return "bg-green-100 text-green-700";
        if (status === "Late") return "bg-orange-100 text-orange-700";
        return "bg-red-100 text-red-600";
    };

    const getStatusIcon = (status) => {
        if (status === "Submitted" || status === "Graded") return "✅";
        if (status === "Late") return "⏰";
        return "❌";
    };

    const getDaysLeft = (dueDate) => {
        const diff = new Date(dueDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return text.overdue;
        if (days === 0) return text.dueToday;
        if (days === 1) return text.oneDayLeft;
        return `${days} ${text.daysLeft}`;
    };

    const getDaysLeftColor = (dueDate, submissionStatus) => {
        if (submissionStatus !== "Pending") return "text-gray-400";

        const diff = new Date(dueDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return "text-red-600";
        if (days <= 1) return "text-orange-500";
        if (days <= 3) return "text-yellow-500";
        return "text-green-600";
    };

    const formatDueDate = (dueDate) => {
        return new Date(dueDate).toLocaleDateString(
            isGujarati ? "gu-IN" : "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const subjectOptions = [
        ...new Set(homework.map((hw) => hw.subject).filter(Boolean))
    ];

    const filteredHomework = homework.filter((hw) => {
        const searchText = search.toLowerCase().trim();

        const searchMatch = searchText
            ? hw.title?.toLowerCase().includes(searchText) ||
              hw.subject?.toLowerCase().includes(searchText)
            : true;

        const statusMatch = statusFilter
            ? hw.submissionStatus === statusFilter
            : true;

        const subjectMatch = subjectFilter ? hw.subject === subjectFilter : true;

        return searchMatch && statusMatch && subjectMatch;
    });

    const pendingCount = homework.filter(
        (hw) => hw.submissionStatus === "Pending"
    ).length;

    const submittedCount = homework.filter(
        (hw) =>
            hw.submissionStatus === "Submitted" || hw.submissionStatus === "Graded"
    ).length;

    const gradedCount = homework.filter(
        (hw) => hw.submissionStatus === "Graded"
    ).length;

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}
            <div className="mb-7">
                <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                    {text.pageTitle}
                </h1>

                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                    {text.pageSubtitle}
                </p>
            </div>

            {/* ============================== Summary Cards ============================== */}
            <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                    <p className="text-sm text-gray-500">{text.total}</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-800 sm:text-3xl">
                        {homework.length}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">{text.assignments}</p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm sm:p-6">
                    <p className="text-sm text-red-500">{text.pending}</p>
                    <h3 className="mt-2 text-2xl font-bold text-red-700 sm:text-3xl">
                        {pendingCount}
                    </h3>
                    <p className="mt-1 text-xs text-red-400">{text.notSubmitted}</p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm sm:p-6">
                    <p className="text-sm text-blue-500">{text.submitted}</p>
                    <h3 className="mt-2 text-2xl font-bold text-blue-700 sm:text-3xl">
                        {submittedCount}
                    </h3>
                    <p className="mt-1 text-xs text-blue-400">{text.awaitingGrade}</p>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm sm:p-6">
                    <p className="text-sm text-green-500">{text.graded}</p>
                    <h3 className="mt-2 text-2xl font-bold text-green-700 sm:text-3xl">
                        {gradedCount}
                    </h3>
                    <p className="mt-1 text-xs text-green-400">{text.completed}</p>
                </div>
            </div>

            {/* ============================== Filters ============================== */}
            <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="xl:col-span-2">
                        <div className="flex items-center rounded-xl bg-gray-100 px-4">
                            <Search size={18} className="shrink-0 text-gray-500" />

                            <input
                                type="text"
                                placeholder={text.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent px-3 py-3 outline-none"
                            />
                        </div>
                    </div>

                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allSubjects}</option>

                        {subjectOptions.map((sub) => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allStatus}</option>
                        <option value="Pending">{text.pending}</option>
                        <option value="Submitted">{text.submitted}</option>
                        <option value="Late">{text.late}</option>
                        <option value="Graded">{text.graded}</option>
                    </select>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                            setSubjectFilter("");
                        }}
                        className="flex items-center gap-2 rounded-xl bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-800"
                    >
                        <RefreshCw size={16} />
                        {text.reset}
                    </button>
                </div>
            </div>

            {/* ============================== Loading ============================== */}
            {loading && (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
                    <Loader2 size={38} className="animate-spin text-[#5B2EFF]" />
                    <p className="font-medium text-slate-500">{text.loading}</p>
                </div>
            )}

            {/* ============================== Empty State ============================== */}
            {!loading && filteredHomework.length === 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm sm:p-16">
                    <ClipboardList size={56} className="mx-auto mb-4 text-gray-300" />

                    <h2 className="text-xl font-semibold text-gray-600">
                        {text.noHomework}
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-400 sm:text-base">
                        {text.noHomeworkText}
                    </p>
                </div>
            )}

            {/* ============================== Homework Cards ============================== */}
            {!loading && filteredHomework.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredHomework.map((hw) => (
                        <div
                            key={hw._id}
                            className="flex flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                        >
                            {/* Card Header */}
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
                                    <BookOpen size={22} className="text-indigo-600" />
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                                        hw.submissionStatus
                                    )}`}
                                >
                                    {getStatusIcon(hw.submissionStatus)}{" "}
                                    {statusLabel[hw.submissionStatus] || hw.submissionStatus}
                                </span>
                            </div>

                            {/* Title & Subject */}
                            <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-800">
                                {hw.title}
                            </h3>

                            <span className="mb-3 inline-block w-fit rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                {hw.subject}
                            </span>

                            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
                                {hw.description}
                            </p>

                            {/* Meta Info */}
                            <div className="mb-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="shrink-0 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {text.due} : {formatDueDate(hw.dueDate)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="shrink-0 text-gray-400" />
                                    <span
                                        className={`text-sm font-semibold ${getDaysLeftColor(
                                            hw.dueDate,
                                            hw.submissionStatus
                                        )}`}
                                    >
                                        {getDaysLeft(hw.dueDate)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {hw.submissionStatus === "Graded" ? (
                                        <CheckCircle size={14} className="shrink-0 text-green-500" />
                                    ) : (
                                        <XCircle size={14} className="shrink-0 text-gray-400" />
                                    )}

                                    <span className="text-sm text-gray-500">
                                        {text.marks} : {hw.totalMarks}
                                        {hw.submission?.grade !== null &&
                                        hw.submission?.grade !== undefined
                                            ? ` | ${text.got} : ${hw.submission.grade}`
                                            : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Grade feedback if graded */}
                            {hw.submission?.feedback && (
                                <div className="mb-4 rounded-xl bg-green-50 p-3">
                                    <p className="mb-1 text-xs font-semibold text-green-600">
                                        {text.teacherFeedback}
                                    </p>
                                    <p className="break-words text-sm text-gray-700">
                                        {hw.submission.feedback}
                                    </p>
                                </div>
                            )}

                            {/* Progress bar */}
                            <div className="mb-5 h-1 rounded-full bg-gray-100">
                                <div
                                    className={`h-full rounded-full ${
                                        hw.submissionStatus === "Graded"
                                            ? "w-full bg-green-500"
                                            : hw.submissionStatus === "Submitted" ||
                                              hw.submissionStatus === "Late"
                                            ? "w-2/3 bg-blue-500"
                                            : "w-0 bg-gray-300"
                                    }`}
                                ></div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-auto">
                                {hw.submissionStatus === "Pending" ||
                                hw.submissionStatus === "Late" ? (
                                    <button
                                        onClick={() => navigate(`/homework/submit/${hw._id}`)}
                                        className="w-full rounded-xl bg-[#5B2EFF] py-3 font-semibold text-white transition hover:bg-[#4724db]"
                                    >
                                        {text.submitHomework}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/homework/${hw._id}`)}
                                        className="w-full rounded-xl bg-indigo-100 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-200"
                                    >
                                        {text.viewDetails}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentHomework;