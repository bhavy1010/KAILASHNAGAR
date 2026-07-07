import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, User, Paperclip, Star } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getHomeworkById, deleteHomework } from "../../services/homeworkService";
import { getSubmissionsByHomework, gradeSubmission } from "../../services/homeworkSubmissionService";

const HomeworkDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();

    const [homework, setHomework] = useState(null);

    const [stats, setStats] = useState(null);

    const [submissions, setSubmissions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("details");

    const [gradingId, setGradingId] = useState(null);

    const [gradeValue, setGradeValue] = useState("");

    const [feedbackValue, setFeedbackValue] = useState("");

    const [gradeLoading, setGradeLoading] = useState(false);

    useEffect(() => {

        loadData();

    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            const hwRes = await getHomeworkById(id);

            setHomework(hwRes.homework);

            setStats(hwRes.stats);

            if (user?.role === "admin" || user?.role === "teacher") {

                const subRes = await getSubmissionsByHomework(id);

                setSubmissions(subRes.submissions || []);

            }

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleDelete = async () => {

        if (!window.confirm("Delete this homework? All submissions will also be deleted.")) {
            return;
        }

        try {

            await deleteHomework(id);

            navigate("/homework/list");

        } catch (error) {

            alert(error.response?.data?.message || "Unable to delete");

        }

    };

    const openGrading = (sub) => {

        setGradingId(sub._id);

        setGradeValue(sub.grade || "");

        setFeedbackValue(sub.feedback || "");

    };

    const closeGrading = () => {

        setGradingId(null);

        setGradeValue("");

        setFeedbackValue("");

    };

    const handleGradeSave = async (submissionId) => {

        if (gradeValue === "") {

            alert("Please enter a grade");

            return;

        }

        try {

            setGradeLoading(true);

            await gradeSubmission(submissionId, {

                grade: gradeValue,

                feedback: feedbackValue

            });

            setGradingId(null);

            loadData();

        } catch (error) {

            alert(error.response?.data?.message || "Unable to grade");

        } finally {

            setGradeLoading(false);

        }

    };

    const getStatusColor = (status) => {

        if (status === "Submitted") return "bg-blue-100 text-blue-700";

        if (status === "Graded") return "bg-green-100 text-green-700";

        if (status === "Late") return "bg-orange-100 text-orange-700";

        return "bg-gray-100 text-gray-500";

    };

    const getGradeBtnLabel = (status) => {

        if (status === "Graded") return "Edit Grade";

        if (status === "Pending") return "Not Submitted";

        return "Grade";

    };

    if (loading) {

        return (

            <div className="h-full flex items-center justify-center">

                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

            </div>

        );

    }

    if (!homework) {

        return (

            <div className="p-8 text-center">

                <BookOpen size={56} className="mx-auto text-gray-300 mb-4" />

                <h2 className="text-xl font-semibold text-gray-600">Homework Not Found</h2>

            </div>

        );

    }

    const isOverdue = homework.status === "Active" && new Date(homework.dueDate) < new Date();

    const isTeacherOrAdmin = user?.role === "admin" || user?.role === "teacher";

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/homework/list")}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >

                        <ArrowLeft size={22} />

                    </button>

                    <div>

                        <p className="text-sm text-gray-500">
                            Homework &rsaquo; Details
                        </p>

                        <h1 className="text-3xl font-bold text-slate-800 mt-1">
                            {homework.title}
                        </h1>

                    </div>

                </div>

                {isTeacherOrAdmin && (

                    <div className="flex gap-3">

                        <button
                            onClick={() => navigate("/homework/edit/" + homework._id)}
                            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition"
                        >
                            Edit
                        </button>

                        <button
                            onClick={handleDelete}
                            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                        >
                            Delete
                        </button>

                    </div>

                )}

            </div>

            {/* ============================== Hero Card ============================== */}

            <div className="bg-white rounded-3xl shadow border border-gray-100 p-8 mb-8">

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5B2EFF] to-indigo-400 flex items-center justify-center shadow-lg shrink-0">

                        <BookOpen size={36} className="text-white" />

                    </div>

                    <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-3 mb-4">

                            <span className="px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                                {homework.subject}
                            </span>

                            {homework.status === "Active" ? (

                                <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                                    Active
                                </span>

                            ) : (

                                <span className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
                                    Closed
                                </span>

                            )}

                            {isOverdue && (

                                <span className="px-4 py-1 rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                                    Overdue
                                </span>

                            )}

                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {homework.title}
                        </h2>

                        <p className="text-gray-500 leading-relaxed mb-6">
                            {homework.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                            <div className="flex items-center gap-2">

                                <Calendar size={16} className="text-gray-400" />

                                <div>

                                    <p className="text-xs text-gray-400">Due Date</p>

                                    <p className={"font-semibold text-sm " + (isOverdue ? "text-red-600" : "text-gray-700")}>

                                        {new Date(homework.dueDate).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}

                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-2">

                                <BookOpen size={16} className="text-gray-400" />

                                <div>

                                    <p className="text-xs text-gray-400">Class</p>

                                    <p className="font-semibold text-sm text-gray-700">
                                        Std {homework.standard} - {homework.division}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-2">

                                <User size={16} className="text-gray-400" />

                                <div>

                                    <p className="text-xs text-gray-400">Teacher</p>

                                    <p className="font-semibold text-sm text-gray-700">
                                        {homework.teacherId?.fullName || "-"}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-2">

                                <Star size={16} className="text-gray-400" />

                                <div>

                                    <p className="text-xs text-gray-400">Total Marks</p>

                                    <p className="font-semibold text-sm text-gray-700">
                                        {homework.totalMarks}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {homework.attachment && (

                            <div className="mt-6">

                                <a
                                    href={"http://localhost:5000/uploads/homework/questions/" + homework.attachment}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
                                >

                                    <Paperclip size={16} />

                                    Download Attachment

                                </a>

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* ============================== Stats ============================== */}

            {stats && (

                <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                        <p className="text-sm text-indigo-500">Total Students</p>
                        <h3 className="text-3xl font-bold text-indigo-700 mt-2">{stats.totalStudents}</h3>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <p className="text-sm text-blue-500">Submitted</p>
                        <h3 className="text-3xl font-bold text-blue-700 mt-2">{stats.submittedCount}</h3>
                    </div>

                    <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                        <p className="text-sm text-green-500">Graded</p>
                        <h3 className="text-3xl font-bold text-green-700 mt-2">{stats.gradedCount}</h3>
                    </div>

                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                        <p className="text-sm text-red-500">Pending</p>
                        <h3 className="text-3xl font-bold text-red-700 mt-2">{stats.pendingCount}</h3>
                    </div>

                    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
                        <p className="text-sm text-purple-500">Completion</p>
                        <h3 className="text-3xl font-bold text-purple-700 mt-2">{stats.submissionPercent}%</h3>
                    </div>

                </div>

            )}

            {/* ============================== Tabs (admin/teacher only) ============================== */}

            {isTeacherOrAdmin && (

                <div>

                    <div className="flex gap-2 mb-6">

                        <button
                            onClick={() => setActiveTab("details")}
                            className={"px-6 py-3 rounded-xl font-semibold transition " + (activeTab === "details" ? "bg-[#5B2EFF] text-white" : "bg-white text-gray-600 hover:bg-gray-100")}
                        >
                            Details
                        </button>

                        <button
                            onClick={() => setActiveTab("submissions")}
                            className={"px-6 py-3 rounded-xl font-semibold transition " + (activeTab === "submissions" ? "bg-[#5B2EFF] text-white" : "bg-white text-gray-600 hover:bg-gray-100")}
                        >
                            Submissions ({submissions.length})
                        </button>

                    </div>

                    {activeTab === "submissions" && (

                        <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">

                            <div className="p-6 border-b">

                                <h2 className="text-xl font-bold">Student Submissions</h2>

                                <p className="text-gray-500 mt-1">{submissions.length} submissions received</p>

                            </div>

                            {submissions.length === 0 && (

                                <div className="py-16 text-center">

                                    <BookOpen size={50} className="mx-auto text-gray-300 mb-4" />

                                    <p className="text-gray-500">No submissions yet</p>

                                </div>

                            )}

                            {submissions.length > 0 && (

                                <div className="divide-y">

                                    {submissions.map((sub) => (

                                        <div key={sub._id} className="p-6 hover:bg-gray-50 transition">

                                            <div className="flex flex-col lg:flex-row gap-5">

                                                {/* Student Info */}

                                                <div className="flex items-center gap-4 lg:w-56 shrink-0">

                                                    {sub.studentId?.photo ? (

                                                        <img
                                                            src={"http://localhost:5000/uploads/students/" + sub.studentId.photo}
                                                            alt="student"
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />

                                                    ) : (

                                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                                            {sub.studentId?.fullName?.charAt(0)}
                                                        </div>

                                                    )}

                                                    <div>

                                                        <p className="font-semibold text-gray-800">
                                                            {sub.studentId?.fullName}
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            GR : {sub.studentId?.grNumber}
                                                        </p>

                                                    </div>

                                                </div>

                                                {/* Answer + Status */}

                                                <div className="flex-1">

                                                    <div className="flex flex-wrap items-center gap-3 mb-3">

                                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + getStatusColor(sub.status)}>
                                                            {sub.status}
                                                        </span>

                                                        {sub.submittedAt && (

                                                            <span className="text-xs text-gray-400">
                                                                Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                                                            </span>

                                                        )}

                                                        {sub.status === "Graded" && (

                                                            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                                                                {sub.grade} / {homework.totalMarks}
                                                            </span>

                                                        )}

                                                    </div>

                                                    {sub.answer && (

                                                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                                                            <p className="text-xs text-gray-400 mb-1">Answer</p>
                                                            <p className="text-gray-700 text-sm">{sub.answer}</p>
                                                        </div>

                                                    )}

                                                    {sub.fileAttachment && (

                                                        <a
                                                            href={"http://localhost:5000/uploads/homework/submissions/" + sub.fileAttachment}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-2 text-indigo-600 text-sm hover:underline"
                                                        >
                                                            <Paperclip size={14} />
                                                            {sub.fileOriginalName || "View File"}
                                                        </a>

                                                    )}

                                                    {sub.feedback && (

                                                        <div className="mt-3 bg-green-50 rounded-xl p-3">
                                                            <p className="text-xs text-green-600 font-semibold mb-1">Feedback</p>
                                                            <p className="text-sm text-gray-700">{sub.feedback}</p>
                                                        </div>

                                                    )}

                                                </div>

                                                {/* Grade Panel */}

                                                <div className="shrink-0 lg:w-64">

                                                    {gradingId === sub._id ? (

                                                        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">

                                                            <p className="font-semibold text-indigo-700 mb-4">Grade Submission</p>

                                                            <div className="mb-3">

                                                                <label className="text-sm font-medium mb-1 block">
                                                                    Grade (out of {homework.totalMarks})
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={homework.totalMarks}
                                                                    value={gradeValue}
                                                                    onChange={(e) => setGradeValue(e.target.value)}
                                                                    className="h-10 w-full rounded-xl border px-3 outline-none focus:border-[#5B2EFF]"
                                                                />

                                                            </div>

                                                            <div className="mb-4">

                                                                <label className="text-sm font-medium mb-1 block">Feedback</label>

                                                                <textarea
                                                                    rows="3"
                                                                    value={feedbackValue}
                                                                    onChange={(e) => setFeedbackValue(e.target.value)}
                                                                    placeholder="Write feedback..."
                                                                    className="w-full rounded-xl border p-3 text-sm outline-none resize-none focus:border-[#5B2EFF]"
                                                                />

                                                            </div>

                                                            <div className="flex gap-2">

                                                                <button
                                                                    onClick={() => handleGradeSave(sub._id)}
                                                                    disabled={gradeLoading}
                                                                    className="flex-1 py-2 rounded-xl bg-[#5B2EFF] text-white text-sm font-semibold hover:bg-[#4724db] disabled:opacity-60"
                                                                >
                                                                    {gradeLoading ? "Saving..." : "Save Grade"}
                                                                </button>

                                                                <button
                                                                    onClick={closeGrading}
                                                                    className="px-3 py-2 rounded-xl bg-white border text-sm hover:bg-gray-50"
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <button
                                                            onClick={() => openGrading(sub)}
                                                            disabled={sub.status === "Pending"}
                                                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            {getGradeBtnLabel(sub.status)}
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