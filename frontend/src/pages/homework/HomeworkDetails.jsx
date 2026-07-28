import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    User,
    Paperclip,
    Star,
    Loader2,
    Pencil,
    Trash2,
    CheckCircle2
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
    getHomeworkById,
    deleteHomework
} from "../../services/homeworkService";
import {
    getSubmissionsByHomework,
    gradeSubmission
} from "../../services/homeworkSubmissionService";

const HomeworkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [homework, setHomework] = useState(null);
    const [stats, setStats] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [gradingId, setGradingId] = useState(null);
    const [gradeValue, setGradeValue] = useState("");
    const [feedbackValue, setFeedbackValue] = useState("");
    const [gradeLoading, setGradeLoading] = useState(false);

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const text = {
        back: isGujarati ? "પાછળ" : "Back",
        breadcrumb: isGujarati ? "હોમવર્ક › વિગતો" : "Homework › Details",
        edit: isGujarati ? "સંપાદિત કરો" : "Edit",
        delete: isGujarati ? "કાઢી નાખો" : "Delete",
        active: isGujarati ? "સક્રિય" : "Active",
        closed: isGujarati ? "બંધ" : "Closed",
        overdue: isGujarati ? "મુદત પૂર્ણ" : "Overdue",
        dueDate: isGujarati ? "છેલ્લી તારીખ" : "Due Date",
        class: isGujarati ? "વર્ગ" : "Class",
        teacher: isGujarati ? "શિક્ષક" : "Teacher",
        totalMarks: isGujarati ? "કુલ ગુણ" : "Total Marks",
        downloadAttachment: isGujarati
            ? "જોડાણ ડાઉનલોડ કરો"
            : "Download Attachment",
        totalStudents: isGujarati ? "કુલ વિદ્યાર્થીઓ" : "Total Students",
        submitted: isGujarati ? "સબમિટ થયેલ" : "Submitted",
        graded: isGujarati ? "ચકાસેલ" : "Graded",
        pending: isGujarati ? "બાકી" : "Pending",
        completion: isGujarati ? "પૂર્ણતા" : "Completion",
        details: isGujarati ? "વિગતો" : "Details",
        submissions: isGujarati ? "સબમિશન" : "Submissions",
        studentSubmissions: isGujarati
            ? "વિદ્યાર્થીઓના સબમિશન"
            : "Student Submissions",
        submissionsReceived: isGujarati
            ? "સબમિશન પ્રાપ્ત થયા"
            : "submissions received",
        noSubmissions: isGujarati
            ? "હજુ સુધી કોઈ સબમિશન નથી."
            : "No submissions yet",
        answer: isGujarati ? "જવાબ" : "Answer",
        feedback: isGujarati ? "પ્રતિસાદ" : "Feedback",
        viewFile: isGujarati ? "ફાઇલ જુઓ" : "View File",
        submittedOn: isGujarati ? "સબમિટ તારીખ" : "Submitted",
        grade: isGujarati ? "ગુણ આપો" : "Grade",
        editGrade: isGujarati ? "ગુણ સંપાદિત કરો" : "Edit Grade",
        notSubmitted: isGujarati ? "સબમિટ નથી કર્યું" : "Not Submitted",
        gradeSubmission: isGujarati
            ? "સબમિશનને ગુણ આપો"
            : "Grade Submission",
        gradeOutOf: isGujarati ? "ગુણ (કુલમાંથી)" : "Grade (out of)",
        feedbackPlaceholder: isGujarati
            ? "પ્રતિસાદ લખો..."
            : "Write feedback...",
        saveGrade: isGujarati ? "ગુણ સાચવો" : "Save Grade",
        saving: isGujarati ? "સાચવાઈ રહ્યું છે..." : "Saving...",
        cancel: isGujarati ? "રદ કરો" : "Cancel",
        homeworkNotFound: isGujarati
            ? "હોમવર્ક મળ્યું નથી"
            : "Homework Not Found",
        loading: isGujarati
            ? "હોમવર્ક લોડ થઈ રહ્યું છે..."
            : "Loading homework...",
        enterGrade: isGujarati
            ? "કૃપા કરીને ગુણ દાખલ કરો."
            : "Please enter a grade",
        unableGrade: isGujarati
            ? "ગુણ આપી શકાયા નથી."
            : "Unable to grade",
        confirmDelete: isGujarati
            ? "શું તમે આ હોમવર્ક કાઢી નાખવા માંગો છો? બધા સબમિશન પણ કાઢી નાખવામાં આવશે."
            : "Delete this homework? All submissions will also be deleted.",
        unableDelete: isGujarati
            ? "હોમવર્ક કાઢી શકાતું નથી."
            : "Unable to delete"
    };

    const statusLabel = {
        Submitted: isGujarati ? "સબમિટ થયેલ" : "Submitted",
        Graded: isGujarati ? "ચકાસેલ" : "Graded",
        Late: isGujarati ? "મોડું સબમિટ" : "Late",
        Pending: text.pending
    };

    useEffect(() => {
        loadData();
    }, [id, user?.role]);

    const loadData = async () => {
        try {
            setLoading(true);

            const homeworkResponse = await getHomeworkById(id);

            setHomework(homeworkResponse?.homework || null);
            setStats(homeworkResponse?.stats || null);

            if (user?.role === "admin" || user?.role === "teacher") {
                const submissionResponse = await getSubmissionsByHomework(id);
                setSubmissions(submissionResponse?.submissions || []);
            }
        } catch (error) {
            console.log(error);
            setHomework(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(text.confirmDelete)) return;

        try {
            await deleteHomework(id);
            navigate("/homework/list");
        } catch (error) {
            alert(error.response?.data?.message || text.unableDelete);
        }
    };

    const openGrading = (submission) => {
        setGradingId(submission._id);
        setGradeValue(submission.grade ?? "");
        setFeedbackValue(submission.feedback || "");
    };

    const closeGrading = () => {
        setGradingId(null);
        setGradeValue("");
        setFeedbackValue("");
    };

    const handleGradeSave = async (submissionId) => {
        if (gradeValue === "") {
            alert(text.enterGrade);
            return;
        }

        try {
            setGradeLoading(true);

            await gradeSubmission(submissionId, {
                grade: gradeValue,
                feedback: feedbackValue
            });

            closeGrading();
            await loadData();
        } catch (error) {
            alert(error.response?.data?.message || text.unableGrade);
        } finally {
            setGradeLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === "Submitted") return "bg-blue-100 text-blue-700";
        if (status === "Graded") return "bg-green-100 text-green-700";
        if (status === "Late") return "bg-orange-100 text-orange-700";
        return "bg-slate-100 text-slate-500";
    };

    const getGradeButtonLabel = (status) => {
        if (status === "Graded") return text.editGrade;
        if (status === "Pending") return text.notSubmitted;
        return text.grade;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            isGujarati ? "gu-IN" : "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#F5F7FB] px-4">
                <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                <p className="font-medium text-slate-500">{text.loading}</p>
            </div>
        );
    }

    if (!homework) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F5F7FB] px-4 text-center">
                <BookOpen size={56} className="mb-4 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-600">
                    {text.homeworkNotFound}
                </h2>
            </div>
        );
    }

    const isOverdue =
        homework.status === "Active" &&
        new Date(homework.dueDate) < new Date();

    const isTeacherOrAdmin =
        user?.role === "admin" || user?.role === "teacher";

    const safeStats = {
        totalStudents: stats?.totalStudents || 0,
        submittedCount: stats?.submittedCount || 0,
        gradedCount: stats?.gradedCount || 0,
        pendingCount: stats?.pendingCount || 0,
        submissionPercent: stats?.submissionPercent || 0
    };

    const statCards = [
        {
            label: text.totalStudents,
            value: safeStats.totalStudents,
            className: "border-indigo-100 bg-indigo-50 text-indigo-700"
        },
        {
            label: text.submitted,
            value: safeStats.submittedCount,
            className: "border-blue-100 bg-blue-50 text-blue-700"
        },
        {
            label: text.graded,
            value: safeStats.gradedCount,
            className: "border-green-100 bg-green-50 text-green-700"
        },
        {
            label: text.pending,
            value: safeStats.pendingCount,
            className: "border-red-100 bg-red-50 text-red-700"
        },
        {
            label: text.completion,
            value: `${safeStats.submissionPercent}%`,
            className: "border-purple-100 bg-purple-50 text-purple-700"
        }
    ];

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <button
                        onClick={() => navigate("/homework/list")}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-slate-100 sm:h-12 sm:w-12"
                        title={text.back}
                    >
                        <ArrowLeft size={21} />
                    </button>

                    <div className="min-w-0">
                        <p className="text-sm text-slate-500">
                            {text.breadcrumb}
                        </p>

                        <h1 className="mt-1 truncate text-2xl font-bold text-slate-800 sm:text-3xl">
                            {homework.title}
                        </h1>
                    </div>
                </div>

                {isTeacherOrAdmin && (
                    <div className="grid grid-cols-2 gap-3 sm:flex">
                        <button
                            onClick={() =>
                                navigate(`/homework/edit/${homework._id}`)
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition hover:bg-amber-600"
                        >
                            <Pencil size={17} />
                            {text.edit}
                        </button>

                        <button
                            onClick={handleDelete}
                            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
                        >
                            <Trash2 size={17} />
                            {text.delete}
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-7 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B2EFF] to-indigo-400 shadow-lg sm:h-20 sm:w-20">
                        <BookOpen size={34} className="text-white" />
                    </div>

                    <div className="w-full flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 sm:px-4 sm:text-sm">
                                {homework.subject}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold sm:px-4 sm:text-sm ${
                                    homework.status === "Active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                            >
                                {homework.status === "Active"
                                    ? text.active
                                    : text.closed}
                            </span>

                            {isOverdue && (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 sm:px-4 sm:text-sm">
                                    {text.overdue}
                                </span>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                            {homework.title}
                        </h2>

                        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-500">
                            {homework.description}
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="flex items-center gap-2">
                                <Calendar
                                    size={17}
                                    className="shrink-0 text-slate-400"
                                />
                                <div>
                                    <p className="text-xs text-slate-400">
                                        {text.dueDate}
                                    </p>
                                    <p
                                        className={`text-sm font-semibold ${
                                            isOverdue
                                                ? "text-red-600"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {formatDate(homework.dueDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <BookOpen
                                    size={17}
                                    className="shrink-0 text-slate-400"
                                />
                                <div>
                                    <p className="text-xs text-slate-400">
                                        {text.class}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {isGujarati
                                            ? `${homework.standard} ધોરણ - ${homework.division}`
                                            : `Std ${homework.standard} - ${homework.division}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <User
                                    size={17}
                                    className="shrink-0 text-slate-400"
                                />
                                <div>
                                    <p className="text-xs text-slate-400">
                                        {text.teacher}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {homework.teacherId?.fullName || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Star
                                    size={17}
                                    className="shrink-0 text-slate-400"
                                />
                                <div>
                                    <p className="text-xs text-slate-400">
                                        {text.totalMarks}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {homework.totalMarks}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {homework.attachment && (
                            <div className="mt-6">
                                <a
                                    href={`${serverUrl}/uploads/homework/questions/${homework.attachment}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    <Paperclip size={16} />
                                    {text.downloadAttachment}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {stats && (
                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className={`rounded-2xl border p-5 ${card.className}`}
                        >
                            <p className="text-sm opacity-80">{card.label}</p>
                            <h3 className="mt-2 text-3xl font-bold">
                                {card.value}
                            </h3>
                        </div>
                    ))}
                </div>
            )}

            {isTeacherOrAdmin && (
                <div>
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`rounded-xl px-5 py-3 font-semibold transition ${
                                activeTab === "details"
                                    ? "bg-[#5B2EFF] text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {text.details}
                        </button>

                        <button
                            onClick={() => setActiveTab("submissions")}
                            className={`rounded-xl px-5 py-3 font-semibold transition ${
                                activeTab === "submissions"
                                    ? "bg-[#5B2EFF] text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {text.submissions} ({submissions.length})
                        </button>
                    </div>

                    {activeTab === "submissions" && (
                        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="border-b border-slate-100 p-5 sm:p-6">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {text.studentSubmissions}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {submissions.length} {text.submissionsReceived}
                                </p>
                            </div>

                            {submissions.length === 0 ? (
                                <div className="px-5 py-16 text-center">
                                    <BookOpen
                                        size={50}
                                        className="mx-auto mb-4 text-slate-300"
                                    />

                                    <p className="text-slate-500">
                                        {text.noSubmissions}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {submissions.map((submission) => (
                                        <div
                                            key={submission._id}
                                            className="p-4 transition hover:bg-slate-50 sm:p-6"
                                        >
                                            <div className="flex flex-col gap-5 xl:flex-row">
                                                <div className="flex shrink-0 items-center gap-3 xl:w-60">
                                                    {submission.studentId?.photo ? (
                                                        <img
                                                            src={`${serverUrl}/uploads/students/${submission.studentId.photo}`}
                                                            alt={
                                                                submission.studentId?.fullName ||
                                                                "Student"
                                                            }
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                                            {submission.studentId?.fullName
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "S"}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-800">
                                                            {submission.studentId?.fullName ||
                                                                "-"}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            GR:{" "}
                                                            {submission.studentId?.grNumber ||
                                                                "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                                                                submission.status
                                                            )}`}
                                                        >
                                                            {statusLabel[
                                                                submission.status
                                                            ] || submission.status}
                                                        </span>

                                                        {submission.submittedAt && (
                                                            <span className="text-xs text-slate-400">
                                                                {text.submittedOn}:{" "}
                                                                {formatDate(
                                                                    submission.submittedAt
                                                                )}
                                                            </span>
                                                        )}

                                                        {submission.status ===
                                                            "Graded" && (
                                                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                                                                {submission.grade} /{" "}
                                                                {homework.totalMarks}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {submission.answer && (
                                                        <div className="mb-3 rounded-xl bg-slate-50 p-4">
                                                            <p className="mb-1 text-xs text-slate-400">
                                                                {text.answer}
                                                            </p>
                                                            <p className="whitespace-pre-wrap text-sm text-slate-700">
                                                                {submission.answer}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {submission.fileAttachment && (
                                                        <a
                                                            href={`${serverUrl}/uploads/homework/submissions/${submission.fileAttachment}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
                                                        >
                                                            <Paperclip size={14} />
                                                            {submission.fileOriginalName ||
                                                                text.viewFile}
                                                        </a>
                                                    )}

                                                    {submission.feedback && (
                                                        <div className="mt-3 rounded-xl bg-green-50 p-3">
                                                            <p className="mb-1 text-xs font-semibold text-green-600">
                                                                {text.feedback}
                                                            </p>
                                                            <p className="whitespace-pre-wrap text-sm text-slate-700">
                                                                {submission.feedback}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="shrink-0 xl:w-64">
                                                    {gradingId ===
                                                    submission._id ? (
                                                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                                                            <p className="mb-4 font-semibold text-indigo-700">
                                                                {text.gradeSubmission}
                                                            </p>

                                                            <div className="mb-3">
                                                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                                                    {text.gradeOutOf}{" "}
                                                                    {homework.totalMarks}
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={
                                                                        homework.totalMarks
                                                                    }
                                                                    value={gradeValue}
                                                                    onChange={(event) =>
                                                                        setGradeValue(
                                                                            event.target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#5B2EFF]"
                                                                />
                                                            </div>

                                                            <div className="mb-4">
                                                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                                                    {text.feedback}
                                                                </label>

                                                                <textarea
                                                                    rows="3"
                                                                    value={
                                                                        feedbackValue
                                                                    }
                                                                    onChange={(event) =>
                                                                        setFeedbackValue(
                                                                            event.target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder={
                                                                        text.feedbackPlaceholder
                                                                    }
                                                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#5B2EFF]"
                                                                />
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleGradeSave(
                                                                            submission._id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        gradeLoading
                                                                    }
                                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] py-2 text-sm font-semibold text-white transition hover:bg-[#4724db] disabled:opacity-60"
                                                                >
                                                                    {gradeLoading && (
                                                                        <Loader2
                                                                            size={15}
                                                                            className="animate-spin"
                                                                        />
                                                                    )}
                                                                    {gradeLoading
                                                                        ? text.saving
                                                                        : text.saveGrade}
                                                                </button>

                                                                <button
                                                                    onClick={
                                                                        closeGrading
                                                                    }
                                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                                >
                                                                    {text.cancel}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                openGrading(
                                                                    submission
                                                                )
                                                            }
                                                            disabled={
                                                                submission.status ===
                                                                "Pending"
                                                            }
                                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            <CheckCircle2
                                                                size={16}
                                                            />
                                                            {getGradeButtonLabel(
                                                                submission.status
                                                            )}
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
                </div>
            )}
        </div>
    );
};

export default HomeworkDetails;