import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Users,
    ClipboardCheck,
    ListChecks,
    Pencil,
    FileSpreadsheet,
    Trophy,
    FileText,
    Languages,
    Loader2
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getExamById } from "../../services/examService";

const STATUS_STYLE = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-green-100 text-green-700",
    Completed: "bg-gray-100 text-gray-600"
};

const STATUS_LABEL_GU = {
    Upcoming: "આગામી",
    Ongoing: "ચાલુ",
    Completed: "પૂર્ણ"
};

const EXAM_TYPE_LABEL_GU = {
    "Unit Test": "એકમ કસોટી",
    "Mid Term": "મધ્ય સત્ર",
    Final: "અંતિમ",
    "Weekly Test": "સાપ્તાહિક કસોટી",
    "Mock Test": "મોક ટેસ્ટ",
    Other: "અન્ય"
};

const ExamDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [exam, setExam] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        breadcrumb: isGujarati ? "પરીક્ષા › વિગતો" : "Exams › Details",
        std: isGujarati ? "ધોરણ" : "Std",
        notFoundTitle: isGujarati ? "પરીક્ષા મળી નથી" : "Exam Not Found",
        description: isGujarati ? "વર્ણન" : "Description",
        examPeriod: isGujarati ? "પરીક્ષા સમયગાળો" : "Exam Period",
        totalMarks: isGujarati ? "કુલ માર્ક્સ" : "Total Marks",
        passingMarks: isGujarati ? "પાસિંગ માર્ક્સ" : "Passing Marks",
        totalStudents: isGujarati ? "કુલ વિદ્યાર્થીઓ" : "Total Students",
        resultsEntered: isGujarati ? "પરિણામ દાખલ થયા" : "Results Entered",
        subjectsScheduled: isGujarati ? "વિષયો સુનિશ્ચિત" : "Subjects Scheduled",
        subjectSchedule: isGujarati ? "વિષય સમયપત્રક" : "Subject Schedule",
        noScheduleYet: isGujarati
            ? "હજુ સુધી કોઈ સમયપત્રક ઉમેરવામાં આવ્યું નથી."
            : "No schedule has been added yet.",
        subject: isGujarati ? "વિષય" : "Subject",
        date: isGujarati ? "તારીખ" : "Date",
        time: isGujarati ? "સમય" : "Time",
        marks: isGujarati ? "માર્ક્સ" : "Marks",
        room: isGujarati ? "રૂમ" : "Room",
        pass: isGujarati ? "પાસ:" : "Pass:",
        editExam: isGujarati ? "પરીક્ષા સંપાદિત કરો" : "Edit Exam",
        manageSchedule: isGujarati ? "સમયપત્રક મેનેજ કરો" : "Manage Schedule",
        enterMarks: isGujarati ? "માર્ક્સ દાખલ કરો" : "Enter Marks",
        viewResults: isGujarati ? "પરિણામો જુઓ" : "View Results",
        viewMyResult: isGujarati ? "મારું પરિણામ જુઓ" : "View My Result",
        loadError: isGujarati ? "પરીક્ષા લોડ કરી શકાઈ નથી" : "Unable to load exam"
    };

    const statusLabel = (status) => (isGujarati ? STATUS_LABEL_GU[status] || status : status);
    const typeLabel = (type) => (isGujarati ? EXAM_TYPE_LABEL_GU[type] || type : type);

    const formatDate = (date, opts) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            isGujarati ? "gu-IN" : "en-IN",
            opts || { day: "2-digit", month: "short", year: "numeric" }
        );
    };

    useEffect(() => {
        loadExam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadExam = async () => {
        try {
            setLoading(true);

            const response = await getExamById(id);

            setExam(response.exam);
            setSchedule(response.schedule || []);
            setStats(response.stats || {});
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const isTeacherOrAdmin = user?.role === "admin" || user?.role === "teacher";
    const isStudent = user?.role === "student";

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="p-8 text-center">
                <ClipboardCheck size={56} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600">
                    {text.notFoundTitle}
                </h2>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/exams/list")}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow hover:bg-gray-100 sm:h-12 sm:w-12"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div className="min-w-0">
                        <p className="truncate text-sm text-gray-500">{text.breadcrumb}</p>
                        <h1 className="mt-1 truncate text-2xl font-bold text-slate-800 sm:text-3xl">
                            {exam.examName}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow transition hover:border-[#5B2EFF] hover:text-[#5B2EFF] sm:py-3"
                    >
                        <Languages size={16} />
                        {text.switchLang}
                    </button>

                    {isTeacherOrAdmin && (
                        <button
                            onClick={() => navigate("/exams/edit/" + exam._id)}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-amber-600 sm:py-3"
                        >
                            <Pencil size={16} />
                            {text.editExam}
                        </button>
                    )}

                    {isStudent && (
                        <button
                            onClick={() =>
                                navigate("/exams/report/" + user.id + "/" + exam._id)
                            }
                            className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:bg-[#4724db] sm:py-3"
                        >
                            <Trophy size={16} />
                            {text.viewMyResult}
                        </button>
                    )}
                </div>
            </div>

            {/* ============================== Exam Info Card ============================== */}

            <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow sm:mb-7 sm:p-8">
                <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 sm:px-4 sm:text-sm">
                        {typeLabel(exam.examType)}
                    </span>

                    <span
                        className={
                            "rounded-full px-3 py-1 text-xs font-semibold sm:px-4 sm:text-sm " +
                            (STATUS_STYLE[exam.status] || "bg-gray-100 text-gray-600")
                        }
                    >
                        {statusLabel(exam.status)}
                    </span>

                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 sm:px-4 sm:text-sm">
                        {text.std} {exam.standard} - {exam.division}
                    </span>
                </div>

                {exam.description && (
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold text-gray-400">
                            {text.description}
                        </p>
                        <p className="whitespace-pre-wrap leading-7 text-gray-700">
                            {exam.description}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="shrink-0 text-gray-400" />
                        <div className="min-w-0">
                            <p className="text-xs text-gray-400">{text.examPeriod}</p>
                            <p className="truncate text-sm font-semibold text-gray-700">
                                {formatDate(exam.startDate, { day: "2-digit", month: "short" })}{" "}
                                – {formatDate(exam.endDate, { day: "2-digit", month: "short" })}
                            </p>
                        </div>
                    </div>

                    {exam.totalMarks ? (
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="shrink-0 text-gray-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">{text.totalMarks}</p>
                                <p className="truncate text-sm font-semibold text-gray-700">
                                    {exam.totalMarks}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {exam.passingMarks ? (
                        <div className="flex items-center gap-2">
                            <ClipboardCheck size={16} className="shrink-0 text-gray-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">{text.passingMarks}</p>
                                <p className="truncate text-sm font-semibold text-gray-700">
                                    {exam.passingMarks}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {isTeacherOrAdmin && (
                        <div className="flex items-center gap-2">
                            <Users size={16} className="shrink-0 text-gray-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">{text.totalStudents}</p>
                                <p className="truncate text-sm font-semibold text-gray-700">
                                    {stats.totalStudents || 0}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ============================== Teacher/Admin Actions ============================== */}

            {isTeacherOrAdmin && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-7 sm:gap-4 md:grid-cols-3">
                    <button
                        onClick={() => navigate("/exams/schedule/" + exam._id)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-4 text-sm font-semibold text-white shadow transition hover:bg-cyan-600 sm:text-base"
                    >
                        <ListChecks size={18} />
                        {text.manageSchedule}
                    </button>

                    <button
                        onClick={() => navigate("/exams/marks/" + exam._id)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-4 text-sm font-semibold text-white shadow transition hover:bg-green-700 sm:text-base"
                    >
                        <FileSpreadsheet size={18} />
                        {text.enterMarks}
                    </button>

                    <button
                        onClick={() => navigate("/exams/results/" + exam._id)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-4 text-sm font-semibold text-white shadow transition hover:bg-purple-700 sm:text-base"
                    >
                        <Trophy size={18} />
                        {text.viewResults}
                    </button>
                </div>
            )}

            {/* ============================== Schedule ============================== */}

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow">
                <div className="border-b p-5 sm:p-6">
                    <h2 className="text-xl font-bold">{text.subjectSchedule}</h2>
                    <p className="mt-1 text-gray-500">
                        {stats.scheduleCount || schedule.length} {text.subjectsScheduled}
                    </p>
                </div>

                {schedule.length === 0 ? (
                    <div className="py-14 text-center">
                        <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-400">{text.noScheduleYet}</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {schedule.map((item) => (
                            <div
                                key={item._id}
                                className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-5 sm:px-6"
                            >
                                <div>
                                    <p className="text-xs text-gray-400">{text.subject}</p>
                                    <p className="mt-1 truncate font-semibold text-gray-800">
                                        {item.subject}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">{text.date}</p>
                                    <p className="mt-1 font-semibold text-gray-700">
                                        {formatDate(item.examDate, {
                                            day: "2-digit",
                                            month: "short"
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">{text.time}</p>
                                    <p className="mt-1 font-semibold text-gray-700">
                                        {item.startTime && item.endTime
                                            ? item.startTime + " - " + item.endTime
                                            : "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">{text.marks}</p>
                                    <p className="mt-1 font-semibold text-gray-700">
                                        {item.totalMarks} / {text.pass} {item.passingMarks}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">{text.room}</p>
                                    <p className="mt-1 font-semibold text-gray-700">
                                        {item.roomNumber || "-"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamDetails;