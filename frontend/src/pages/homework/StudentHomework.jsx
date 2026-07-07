import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Clock, CheckCircle, XCircle, Search, RefreshCw } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getHomeworkForStudent } from "../../services/homeworkService";

const StudentHomework = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [homework, setHomework] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [subjectFilter, setSubjectFilter] = useState("");

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

    const isOverdue = (dueDate, submissionStatus) => {

        return submissionStatus === "Pending" && new Date(dueDate) < new Date();

    };

    const getDaysLeft = (dueDate) => {

        const diff = new Date(dueDate) - new Date();

        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return "Overdue";

        if (days === 0) return "Due Today";

        if (days === 1) return "1 Day Left";

        return days + " Days Left";

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

    const subjectOptions = [...new Set(homework.map((hw) => hw.subject).filter(Boolean))];

    const filteredHomework = homework.filter((hw) => {

        const searchMatch = search
            ? hw.title.toLowerCase().includes(search.toLowerCase()) ||
              hw.subject.toLowerCase().includes(search.toLowerCase())
            : true;

        const statusMatch = statusFilter ? hw.submissionStatus === statusFilter : true;

        const subjectMatch = subjectFilter ? hw.subject === subjectFilter : true;

        return searchMatch && statusMatch && subjectMatch;

    });

    const pendingCount = homework.filter((hw) => hw.submissionStatus === "Pending").length;

    const submittedCount = homework.filter((hw) =>
        hw.submissionStatus === "Submitted" || hw.submissionStatus === "Graded"
    ).length;

    const gradedCount = homework.filter((hw) => hw.submissionStatus === "Graded").length;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-slate-800">My Homework</h1>

                <p className="mt-2 text-slate-500">
                    All homework assigned to your class.
                </p>

            </div>

            {/* ============================== Summary Cards ============================== */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                    <p className="text-gray-500 text-sm">Total</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{homework.length}</h3>
                    <p className="text-gray-400 text-xs mt-1">Assignments</p>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 shadow border border-red-100">
                    <p className="text-red-500 text-sm">Pending</p>
                    <h3 className="text-3xl font-bold text-red-700 mt-2">{pendingCount}</h3>
                    <p className="text-red-400 text-xs mt-1">Not submitted</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 shadow border border-blue-100">
                    <p className="text-blue-500 text-sm">Submitted</p>
                    <h3 className="text-3xl font-bold text-blue-700 mt-2">{submittedCount}</h3>
                    <p className="text-blue-400 text-xs mt-1">Awaiting grade</p>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 shadow border border-green-100">
                    <p className="text-green-500 text-sm">Graded</p>
                    <h3 className="text-3xl font-bold text-green-700 mt-2">{gradedCount}</h3>
                    <p className="text-green-400 text-xs mt-1">Completed</p>
                </div>

            </div>

            {/* ============================== Filters ============================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div className="md:col-span-2 flex items-center bg-gray-100 rounded-xl px-4">

                        <Search size={18} className="text-gray-500" />

                        <input
                            type="text"
                            placeholder="Search by title or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent px-3 py-3 outline-none"
                        />

                    </div>

                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Subjects</option>

                        {subjectOptions.map((sub) => (

                            <option key={sub} value={sub}>
                                {sub}
                            </option>

                        ))}

                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Status</option>

                        <option value="Pending">Pending</option>

                        <option value="Submitted">Submitted</option>

                        <option value="Late">Late</option>

                        <option value="Graded">Graded</option>

                    </select>

                </div>

                <div className="flex justify-end mt-4">

                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                            setSubjectFilter("");
                        }}
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

            {!loading && filteredHomework.length === 0 && (

                <div className="bg-white rounded-3xl p-16 text-center shadow">

                    <BookOpen size={56} className="mx-auto text-gray-300 mb-4" />

                    <h2 className="text-xl font-semibold text-gray-600">No Homework Found</h2>

                    <p className="text-gray-400 mt-2">No homework assigned yet or try changing filters.</p>

                </div>

            )}

            {/* ============================== Homework Cards ============================== */}

            {!loading && filteredHomework.length > 0 && (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {filteredHomework.map((hw) => (

                        <div
                            key={hw._id}
                            className="bg-white rounded-3xl shadow border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >

                            {/* Card Header */}

                            <div className="flex items-start justify-between mb-4">

                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">

                                    <BookOpen size={22} className="text-indigo-600" />

                                </div>

                                <span className={"px-3 py-1 rounded-full text-xs font-semibold " + getStatusColor(hw.submissionStatus)}>
                                    {getStatusIcon(hw.submissionStatus)} {hw.submissionStatus}
                                </span>

                            </div>

                            {/* Title & Subject */}

                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                {hw.title}
                            </h3>

                            <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
                                {hw.subject}
                            </span>

                            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                                {hw.description}
                            </p>

                            {/* Meta Info */}

                            <div className="space-y-2 mb-4">

                                <div className="flex items-center gap-2">

                                    <Calendar size={14} className="text-gray-400" />

                                    <span className="text-sm text-gray-500">
                                        Due : {new Date(hw.dueDate).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </span>

                                </div>

                                <div className="flex items-center gap-2">

                                    <Clock size={14} className="text-gray-400" />

                                    <span className={"text-sm font-semibold " + getDaysLeftColor(hw.dueDate, hw.submissionStatus)}>
                                        {getDaysLeft(hw.dueDate)}
                                    </span>

                                </div>

                                <div className="flex items-center gap-2">

                                    {hw.submissionStatus === "Graded" ? (
                                        <CheckCircle size={14} className="text-green-500" />
                                    ) : (
                                        <XCircle size={14} className="text-gray-400" />
                                    )}

                                    <span className="text-sm text-gray-500">
                                        Marks : {hw.totalMarks}
                                        {hw.submission?.grade !== null && hw.submission?.grade !== undefined
                                            ? " | Got : " + hw.submission.grade
                                            : ""}
                                    </span>

                                </div>

                            </div>

                            {/* Grade feedback if graded */}

                            {hw.submission?.feedback && (

                                <div className="bg-green-50 rounded-xl p-3 mb-4">

                                    <p className="text-xs text-green-600 font-semibold mb-1">Teacher Feedback</p>

                                    <p className="text-sm text-gray-700">{hw.submission.feedback}</p>

                                </div>

                            )}

                            {/* Progress bar */}

                            <div className="h-1 rounded-full bg-gray-100 mb-5">

                                <div className={"h-full rounded-full " + (hw.submissionStatus === "Graded"
                                    ? "bg-green-500 w-full"
                                    : hw.submissionStatus === "Submitted" || hw.submissionStatus === "Late"
                                    ? "bg-blue-500 w-2/3"
                                    : "bg-gray-300 w-0")}
                                ></div>

                            </div>

                            {/* Action Button */}

                            {hw.submissionStatus === "Pending" || hw.submissionStatus === "Late" ? (

                                <button
                                    onClick={() => navigate("/homework/submit/" + hw._id)}
                                    className="w-full py-3 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white font-semibold transition"
                                >
                                    Submit Homework
                                </button>

                            ) : (

                                <button
                                    onClick={() => navigate("/homework/" + hw._id)}
                                    className="w-full py-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold transition"
                                >
                                    View Details
                                </button>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

};

export default StudentHomework;