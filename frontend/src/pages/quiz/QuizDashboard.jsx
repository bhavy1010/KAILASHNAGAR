import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    HelpCircle,
    PlusCircle,
    Zap,
    Trophy,
    Search,
    Filter,
    Play,
    CheckCircle2,
    XCircle,
    Trash2,
    Eye,
    BarChart3,
    Clock,
    FileText,
    Sparkles,
    Globe,
    Edit3
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import {
    getQuizzes,
    toggleQuizPublish,
    deleteQuiz,
    getStudentAttempts
} from "../../services/quizService";
import { getMyTeacherScope } from "../../services/teacherService";

const QuizDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const role = user?.role || "student";
    const isManageable = role === "admin" || role === "teacher";

    const [activeTab, setActiveTab] = useState("available"); // 'available', 'my_results', 'management'
    const [quizzes, setQuizzes] = useState([]);
    const [myAttempts, setMyAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Filter states
    const [selectedStd, setSelectedStd] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);

    const ALL_SUBJECTS = [
        "Gujarati",
        "Mathematics",
        "Science",
        "Social Science",
        "Hindi",
        "Sanskrit",
        "Environment",
        "English",
        "Computer",
        "Physics",
        "Chemistry",
        "Biology",
        "Economics",
        "Account"
    ];

    const [subjectsList, setSubjectsList] = useState(ALL_SUBJECTS);
    const [teacherClasses, setTeacherClasses] = useState([]);

    // Load teacher scope (subjects/classes) once on mount
    useEffect(() => {
        if (role === "teacher") {
            getMyTeacherScope()
                .then((data) => {
                    if (data.success) {
                        if (data.subjectsHandled?.length > 0) {
                            setSubjectsList(data.subjectsHandled);
                        }
                        if (data.classesHandled?.length > 0) {
                            setTeacherClasses(data.classesHandled);
                        }
                    }
                })
                .catch(() => {/* teacher scope load failed — use full list */});
        }
    }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");
        try {
            const filters = {
                standard: selectedStd,
                subject: selectedSubject,
                quizType: selectedType,
                status: selectedStatus,
                search: searchQuery
            };
            const res = await getQuizzes(filters);
            if (res.success) {
                setQuizzes(res.quizzes || []);
            }

            if (role === "student" || activeTab === "my_results") {
                const attRes = await getStudentAttempts();
                if (attRes.success) {
                    setMyAttempts(attRes.attempts || []);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load quizzes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [selectedStd, selectedSubject, selectedType, selectedStatus, searchQuery, activeTab]);

    const handleToggleStatus = async (quizId) => {
        setActionLoading(true);
        try {
            const res = await toggleQuizPublish(quizId);
            if (res.success) {
                setSuccessMsg(res.message);
                fetchDashboardData();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status.");
        } finally {
            setActionLoading(false);
        }
    };

    const confirmDeleteQuiz = (quiz) => {
        setQuizToDelete(quiz);
        setDeleteModalOpen(true);
    };

    const handleDeleteQuiz = async () => {
        if (!quizToDelete) return;
        setActionLoading(true);
        try {
            const res = await deleteQuiz(quizToDelete._id);
            if (res.success) {
                setSuccessMsg(t("quiz.deleteConfirm", "Quiz deleted successfully."));
                setDeleteModalOpen(false);
                setQuizToDelete(null);
                fetchDashboardData();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete quiz.");
        } finally {
            setActionLoading(false);
        }
    };

    const resetFilters = () => {
        setSelectedStd("");
        setSelectedSubject("");
        setSelectedType("");
        setSelectedStatus("");
        setSearchQuery("");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("quiz.title", "Quiz Module")}
                subtitle={t("quiz.subtitle", "Interactive learning and evaluation")}
            >
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate("/quiz/rank")}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:opacity-95"
                    >
                        <Trophy className="h-4 w-4" />
                        {t("quiz.rankBoard", "Rank Board")}
                    </button>

                    {isManageable && (
                        <>
                            <button
                                onClick={() => navigate("/quiz/create-manual")}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:opacity-95"
                            >
                                <PlusCircle className="h-4 w-4" />
                                {t("quiz.createManual", "Create Manual Quiz")}
                            </button>

                            <button
                                onClick={() => navigate("/quiz/create-auto")}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/20 transition hover:opacity-95"
                            >
                                <Zap className="h-4 w-4" />
                                {t("quiz.createAuto", "Create Auto Quiz")}
                            </button>
                        </>
                    )}
                </div>
            </PageHeader>

            {/* Success & Error alerts */}
            {successMsg && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-600 dark:text-emerald-400">
                    <p className="text-sm font-medium">{successMsg}</p>
                    <button onClick={() => setSuccessMsg("")} className="text-xs font-bold">Dismiss</button>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-600 dark:text-rose-400">
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError("")} className="text-xs font-bold">Dismiss</button>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab("available")}
                    className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition ${
                        activeTab === "available"
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                >
                    <HelpCircle className="h-4 w-4" />
                    {t("quiz.availableQuizzes", "Available Quizzes")}
                </button>

                {role === "student" && (
                    <button
                        onClick={() => setActiveTab("my_results")}
                        className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition ${
                            activeTab === "my_results"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        {t("quiz.myResults", "My Attempts & Results")}
                    </button>
                )}

                {isManageable && (
                    <button
                        onClick={() => setActiveTab("management")}
                        className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition ${
                            activeTab === "management"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        <BarChart3 className="h-4 w-4" />
                        {t("quiz.management", "Quiz Management")}
                    </button>
                )}
            </div>

            {/* Search & Filters */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search quiz title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                        />
                    </div>

                    {/* Standard filter */}
                    <div>
                        <select
                            value={selectedStd}
                            onChange={(e) => setSelectedStd(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                        >
                            <option value="">All Standards</option>
                            {(role === "teacher" && teacherClasses.length > 0
                                ? teacherClasses.map((cls) => {
                                    // Extract numeric standard from strings like "Std 6" or "6"
                                    const match = String(cls).match(/\d+/);
                                    return match ? parseInt(match[0], 10) : null;
                                }).filter(Boolean)
                                : [1, 2, 3, 4, 5, 6, 7, 8]
                            ).map((s) => (
                                <option key={s} value={s}>Std {s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject filter */}
                    <div>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                        >
                            <option value="">All Subjects</option>
                            {subjectsList.map((sub) => (
                                <option key={sub} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quiz type filter */}
                    <div>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                        >
                            <option value="">All Types</option>
                            <option value="manual">Manual Quiz</option>
                            <option value="auto">Auto Quiz</option>
                        </select>
                    </div>

                    {/* Status filter (Admin/Teacher only) */}
                    {isManageable ? (
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            >
                                <option value="">All Statuses</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <button
                                onClick={resetFilters}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="py-16 text-center">
                    <Loader />
                </div>
            ) : activeTab === "my_results" ? (
                /* Student Attempts View */
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {t("quiz.myResults", "My Attempt History")}
                    </h3>
                    {myAttempts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800">
                            No quiz attempts yet. Start a quiz from Available Quizzes!
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {myAttempts.map((att) => (
                                <div
                                    key={att._id}
                                    className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 hover:shadow-md transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-extrabold text-slate-900 dark:text-white">
                                                {att.quiz?.title || "Quiz"}
                                            </h4>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                                {att.quiz?.subject} • Std {att.standard}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                att.status === "completed"
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                            }`}
                                        >
                                            {att.status === "completed" ? "Completed" : "In Progress"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                        <div>
                                            <p className="text-xs text-slate-400">Score</p>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">
                                                {att.score} / {att.totalQuestions}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Percentage</p>
                                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                                {att.percentage}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            onClick={() => navigate(`/quiz/result/${att._id}`)}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View Details
                                        </button>

                                        <button
                                            onClick={() => navigate(`/quiz/rank/${att.quiz?._id || att.quiz}`)}
                                            className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                                        >
                                            <Trophy className="h-3.5 w-3.5" />
                                            Rank Board
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Available Quizzes & Management Grid */
                <div className="space-y-4">
                    {quizzes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800">
                            No quizzes found matching your criteria.
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {quizzes.map((quiz) => (
                                <div
                                    key={quiz._id}
                                    className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                                Std {quiz.standard}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                                                        quiz.quizType === "auto"
                                                            ? "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
                                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                    }`}
                                                >
                                                    {quiz.quizType}
                                                </span>

                                                {isManageable && (
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                            quiz.status === "published"
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                                                        }`}
                                                    >
                                                        {quiz.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                                                {quiz.title}
                                            </h4>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {quiz.subject} • {quiz.chapters?.length ? `Ch ${quiz.chapters.join(", ")}` : "All Chapters"}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                                {quiz.questionCount} Questions
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                {quiz.timeLimitPerQuestion > 0
                                                    ? `${quiz.timeLimitPerQuestion}s / q`
                                                    : "No Limit"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isManageable && (
                                                <button
                                                    onClick={() => navigate(`/quiz/preview/${quiz._id}`)}
                                                    className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition"
                                                    title="Preview / Edit Questions"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                    Preview
                                                </button>
                                            )}

                                            <button
                                                onClick={() => navigate(`/quiz/rank/${quiz._id}`)}
                                                className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 transition"
                                                title="Leaderboard"
                                            >
                                                <Trophy className="h-4 w-4" />
                                                Rank
                                            </button>

                                            {isManageable && (
                                                <button
                                                    onClick={() => handleToggleStatus(quiz._id)}
                                                    disabled={actionLoading}
                                                    className={`text-xs font-bold px-2 py-1 rounded-lg transition ${
                                                        quiz.status === "published"
                                                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                                            : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                                    }`}
                                                >
                                                    {quiz.status === "published" ? "Unpublish" : "Publish"}
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                                {isManageable && (
                                                    <button
                                                        onClick={() => confirmDeleteQuiz(quiz)}
                                                        disabled={actionLoading}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                                                        title="Delete Quiz"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {role === "student" ? (
                                                    <button
                                                        onClick={() => navigate(`/quiz/attempt-screen/${quiz._id}`)}
                                                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
                                                    >
                                                        <Play className="h-3.5 w-3.5 fill-current" />
                                                        Attempt
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/quiz/rank/${quiz._id}`)}
                                                        className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Results
                                                    </button>
                                                )}
                                            </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={t("quiz.deleteQuiz", "Delete Quiz")}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {t("quiz.deleteConfirm", "Are you sure you want to delete this quiz? All student attempt memory will be permanently removed from MongoDB.")}
                    </p>
                    {quizToDelete && (
                        <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-bold text-rose-600 dark:text-rose-400">
                            Quiz: {quizToDelete.title} (Std {quizToDelete.standard} • {quizToDelete.subject})
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteQuiz}
                            disabled={actionLoading}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition"
                        >
                            {actionLoading ? "Deleting..." : "Delete Permanently"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default QuizDashboard;
