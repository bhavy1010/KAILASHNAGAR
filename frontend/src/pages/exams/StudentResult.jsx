import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, User, BookOpen, Award, Languages } from "lucide-react";

import { getStudentResult } from "../../services/resultService";
import { useLanguage } from "../../context/LanguageContext";

const GRADE_STYLE = {
    "A+": "bg-green-100 text-green-700",
    A: "bg-green-100 text-green-600",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-blue-100 text-blue-600",
    C: "bg-yellow-100 text-yellow-700",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700"
};

const getGradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "text-green-600";
    if (grade === "B+" || grade === "B") return "text-blue-600";
    if (grade === "C") return "text-yellow-600";
    if (grade === "D") return "text-orange-600";
    return "text-red-600";
};

const getPercentColor = (percent) => {
    if (percent >= 75) return "text-green-600";
    if (percent >= 50) return "text-yellow-600";
    return "text-red-600";
};

const StudentResult = () => {
    const { studentId, examId } = useParams();
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        breadcrumb: isGujarati ? "પરીક્ષા › રિપોર્ટ કાર્ડ" : "Exams › Report Card",
        title: isGujarati ? "વિદ્યાર્થી રિપોર્ટ કાર્ડ" : "Student Report Card",
        printReport: isGujarati ? "🖨 રિપોર્ટ કાર્ડ પ્રિન્ટ કરો" : "🖨 Print Report Card",
        notFoundTitle: isGujarati ? "પરિણામ મળ્યું નથી" : "Result Not Found",
        notFoundSub: isGujarati
            ? "આ વિદ્યાર્થી માટે હજુ સુધી માર્ક્સ દાખલ કરવામાં આવ્યા નથી."
            : "Marks may not have been entered yet for this student.",
        schoolName: isGujarati ? "કૈલાસનગર શાળા" : "Kailashnagar School",
        officialReport: isGujarati ? "સત્તાવાર રિપોર્ટ કાર્ડ" : "Official Report Card",
        studentName: isGujarati ? "વિદ્યાર્થીનું નામ" : "Student Name",
        grNumber: isGujarati ? "GR નંબર" : "GR Number",
        class: isGujarati ? "ધોરણ" : "Class",
        std: isGujarati ? "ધોરણ" : "Std",
        examPeriod: isGujarati ? "પરીક્ષા સમયગાળો" : "Exam Period",
        to: isGujarati ? "થી" : "to",
        gender: isGujarati ? "લિંગ" : "Gender",
        reportDate: isGujarati ? "રિપોર્ટ તારીખ" : "Report Date",
        totalMarks: isGujarati ? "કુલ માર્ક્સ" : "Total Marks",
        marksObtained: isGujarati ? "મેળવેલ માર્ક્સ" : "Marks Obtained",
        percentage: isGujarati ? "ટકાવારી" : "Percentage",
        grade: isGujarati ? "ગ્રેડ" : "Grade",
        rank: isGujarati ? "ક્રમાંક" : "Rank",
        passed: isGujarati ? "✅ પાસ થયા" : "✅ PASSED",
        failed: isGujarati ? "❌ ફેલ થયા" : "❌ FAILED",
        subjectPerformance: isGujarati
            ? "વિષય-વાર કામગીરી"
            : "Subject-wise Performance",
        subject: isGujarati ? "વિષય" : "Subject",
        passingMarks: isGujarati ? "પાસિંગ માર્ક્સ" : "Passing Marks",
        obtained: isGujarati ? "મેળવેલ" : "Obtained",
        status: isGujarati ? "સ્થિતિ" : "Status",
        total: isGujarati ? "કુલ" : "Total",
        pass: isGujarati ? "પાસ" : "Pass",
        fail: isGujarati ? "ફેલ" : "Fail",
        performanceOverview: isGujarati ? "કામગીરી ઝાંખી" : "Performance Overview",
        classTeacher: isGujarati ? "વર્ગ શિક્ષક" : "Class Teacher",
        principal: isGujarati ? "આચાર્ય" : "Principal",
        parentGuardian: isGujarati ? "વાલી" : "Parent / Guardian",
        computerGenerated: isGujarati
            ? "આ કમ્પ્યુટર-જનરેટેડ રિપોર્ટ કાર્ડ છે. હસ્તાક્ષરની જરૂર નથી."
            : "This is a computer-generated report card. No signature required.",
        backToResults: isGujarati ? "ધોરણ પરિણામો પર પાછા જાઓ" : "Back to Class Results"
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    useEffect(() => {
        loadResult();
    }, []);

    const loadResult = async () => {
        try {
            setLoading(true);

            const response = await getStudentResult(studentId, examId);

            setResult(response.result);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="p-8 text-center">
                <Trophy size={56} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600">
                    {text.notFoundTitle}
                </h2>
                <p className="mt-2 text-gray-400">{text.notFoundSub}</p>
            </div>
        );
    }

    const student = result.studentId;
    const exam = result.examId;

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8" id="report-card-print">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #report-card-print, #report-card-print * { visibility: visible; }
                    #report-card-print { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* ============================== Header ============================== */}

            <div className="no-print mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow hover:bg-gray-100 sm:h-12 sm:w-12"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <p className="text-sm text-gray-500">{text.breadcrumb}</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                            {text.title}
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

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db] sm:px-6 sm:py-3"
                    >
                        {text.printReport}
                    </button>
                </div>
            </div>

            {/* ============================== Report Card ============================== */}

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
                {/* School Header */}

                <div className="bg-gradient-to-r from-[#5B2EFF] to-indigo-500 p-6 text-center text-white sm:p-8">
                    <h1 className="text-2xl font-bold sm:text-3xl">{text.schoolName}</h1>

                    <p className="mt-1 text-indigo-200">{text.officialReport}</p>

                    <div className="mt-4 inline-block rounded-xl bg-white bg-opacity-20 px-4 py-2 sm:px-6">
                        <p className="text-base font-semibold sm:text-lg">
                            {exam?.examName} — {exam?.examType}
                        </p>
                    </div>
                </div>

                {/* Student Info */}

                <div className="border-b p-5 sm:p-8">
                    <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
                        <div className="shrink-0">
                            {student?.photo ? (
                                <img
                                    src={
                                        "http://localhost:5000/uploads/students/" +
                                        student.photo
                                    }
                                    alt={student?.fullName}
                                    className="h-24 w-24 rounded-2xl border-4 border-indigo-100 object-cover shadow sm:h-28 sm:w-28"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-indigo-200 bg-indigo-100 shadow sm:h-28 sm:w-28">
                                    <User size={44} className="text-indigo-400" />
                                </div>
                            )}
                        </div>

                        <div className="grid flex-1 grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
                            <div>
                                <p className="text-xs text-gray-400">{text.studentName}</p>
                                <p className="mt-1 truncate text-lg font-bold text-gray-800">
                                    {student?.fullName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.grNumber}</p>
                                <p className="mt-1 font-semibold text-gray-700">
                                    {student?.grNumber}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.class}</p>
                                <p className="mt-1 font-semibold text-gray-700">
                                    {text.std} {result.standard} - {result.division}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.examPeriod}</p>
                                <p className="mt-1 font-semibold text-gray-700">
                                    {formatDate(exam?.startDate)} {text.to}{" "}
                                    {formatDate(exam?.endDate)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.gender}</p>
                                <p className="mt-1 font-semibold text-gray-700">
                                    {student?.gender || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.reportDate}</p>
                                <p className="mt-1 font-semibold text-gray-700">
                                    {formatDate(new Date())}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result Summary */}

                <div className="grid grid-cols-2 border-b sm:grid-cols-3 md:grid-cols-5">
                    <div className="border-b border-r p-4 text-center sm:border-b-0 sm:p-6">
                        <p className="text-xs text-gray-400">{text.totalMarks}</p>
                        <h3 className="mt-2 text-xl font-bold text-gray-800 sm:text-2xl">
                            {result.totalMarks}
                        </h3>
                    </div>

                    <div className="border-b border-r p-4 text-center sm:border-b-0 sm:p-6">
                        <p className="text-xs text-gray-400">{text.marksObtained}</p>
                        <h3 className="mt-2 text-xl font-bold text-gray-800 sm:text-2xl">
                            {result.totalObtained}
                        </h3>
                    </div>

                    <div className="border-r p-4 text-center sm:p-6">
                        <p className="text-xs text-gray-400">{text.percentage}</p>
                        <h3
                            className={
                                "mt-2 text-xl font-bold sm:text-2xl " +
                                getPercentColor(result.percentage)
                            }
                        >
                            {result.percentage}%
                        </h3>
                    </div>

                    <div className="border-r p-4 text-center sm:p-6">
                        <p className="text-xs text-gray-400">{text.grade}</p>
                        <h3
                            className={
                                "mt-2 text-xl font-bold sm:text-2xl " +
                                getGradeColor(result.grade)
                            }
                        >
                            {result.grade}
                        </h3>
                    </div>

                    <div className="p-4 text-center sm:p-6">
                        <p className="text-xs text-gray-400">{text.rank}</p>
                        <h3 className="mt-2 text-xl font-bold text-indigo-600 sm:text-2xl">
                            {result.rank === 1
                                ? "🥇"
                                : result.rank === 2
                                ? "🥈"
                                : result.rank === 3
                                ? "🥉"
                                : "#" + result.rank}
                        </h3>
                    </div>
                </div>

                {/* Status Banner */}

                <div
                    className={
                        "p-5 text-center " + (result.isPassed ? "bg-green-50" : "bg-red-50")
                    }
                >
                    <span
                        className={
                            "text-xl font-bold " +
                            (result.isPassed ? "text-green-700" : "text-red-700")
                        }
                    >
                        {result.isPassed ? text.passed : text.failed}
                    </span>

                    {result.remarks && (
                        <p className="mt-1 text-sm text-gray-500">{result.remarks}</p>
                    )}
                </div>

                {/* Subject-wise Results */}

                <div className="p-5 sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                            <BookOpen size={20} className="text-indigo-600" />
                        </div>

                        <h2 className="text-xl font-bold">{text.subjectPerformance}</h2>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden overflow-hidden overflow-x-auto rounded-2xl border border-gray-100 sm:block">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">{text.subject}</th>
                                    <th className="px-6 py-4 text-center">
                                        {text.totalMarks}
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        {text.passingMarks}
                                    </th>
                                    <th className="px-6 py-4 text-center">{text.obtained}</th>
                                    <th className="px-6 py-4 text-center">
                                        {text.percentage}
                                    </th>
                                    <th className="px-6 py-4 text-center">{text.grade}</th>
                                    <th className="px-6 py-4 text-center">{text.status}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {result.subjectResults.map((sub, index) => {
                                    const subPercent =
                                        sub.totalMarks > 0
                                            ? Math.round(
                                                  (sub.marksObtained / sub.totalMarks) * 100
                                              )
                                            : 0;

                                    return (
                                        <tr
                                            key={index}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {sub.subject}
                                            </td>

                                            <td className="px-6 py-4 text-center text-gray-600">
                                                {sub.totalMarks}
                                            </td>

                                            <td className="px-6 py-4 text-center text-gray-600">
                                                {sub.passingMarks}
                                            </td>

                                            <td className="px-6 py-4 text-center font-bold text-gray-800">
                                                {sub.marksObtained}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className={
                                                                "h-full rounded-full " +
                                                                (subPercent >= 75
                                                                    ? "bg-green-500"
                                                                    : subPercent >= 50
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-500")
                                                            }
                                                            style={{
                                                                width: subPercent + "%"
                                                            }}
                                                        ></div>
                                                    </div>

                                                    <span
                                                        className={
                                                            "text-sm font-semibold " +
                                                            getPercentColor(subPercent)
                                                        }
                                                    >
                                                        {subPercent}%
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={
                                                        "rounded-full px-3 py-1 text-xs font-bold " +
                                                        (GRADE_STYLE[sub.grade] ||
                                                            "bg-gray-100 text-gray-600")
                                                    }
                                                >
                                                    {sub.grade}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {sub.isPassed ? (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        {text.pass}
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                        {text.fail}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* Totals Row */}

                            <tfoot className="bg-indigo-50">
                                <tr>
                                    <td className="px-6 py-4 font-bold text-indigo-800">
                                        {text.total}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">
                                        {result.totalMarks}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-400">-</td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">
                                        {result.totalObtained}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">
                                        {result.percentage}%
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">
                                        {result.grade}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {result.isPassed ? (
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                {text.pass}
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                {text.fail}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 sm:hidden">
                        {result.subjectResults.map((sub, index) => {
                            const subPercent =
                                sub.totalMarks > 0
                                    ? Math.round((sub.marksObtained / sub.totalMarks) * 100)
                                    : 0;

                            return (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-gray-100 p-4"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="font-semibold text-gray-800">
                                            {sub.subject}
                                        </p>

                                        <span
                                            className={
                                                "rounded-full px-3 py-1 text-xs font-bold " +
                                                (GRADE_STYLE[sub.grade] ||
                                                    "bg-gray-100 text-gray-600")
                                            }
                                        >
                                            {sub.grade}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                        <span>
                                            {text.obtained}: {sub.marksObtained} /{" "}
                                            {sub.totalMarks}
                                        </span>
                                        <span className={"font-semibold " + getPercentColor(subPercent)}>
                                            {subPercent}%
                                        </span>
                                        {sub.isPassed ? (
                                            <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                                                {text.pass}
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">
                                                {text.fail}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="rounded-2xl bg-indigo-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-bold text-indigo-800">{text.total}</p>
                                <span
                                    className={
                                        "rounded-full px-3 py-1 text-xs font-semibold " +
                                        (result.isPassed
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700")
                                    }
                                >
                                    {result.isPassed ? text.pass : text.fail}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs font-semibold text-indigo-700">
                                <span>
                                    {result.totalObtained} / {result.totalMarks}
                                </span>
                                <span>{result.percentage}%</span>
                                <span>{result.grade}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Bar Chart */}

                <div className="px-5 pb-5 sm:px-8 sm:pb-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                            <Award size={20} className="text-purple-600" />
                        </div>

                        <h2 className="text-xl font-bold">{text.performanceOverview}</h2>
                    </div>

                    <div className="space-y-4">
                        {result.subjectResults.map((sub, index) => {
                            const subPercent =
                                sub.totalMarks > 0
                                    ? Math.round((sub.marksObtained / sub.totalMarks) * 100)
                                    : 0;

                            return (
                                <div key={index}>
                                    <div className="mb-2 flex flex-wrap justify-between gap-1">
                                        <span className="font-semibold text-gray-700">
                                            {sub.subject}
                                        </span>

                                        <span
                                            className={
                                                "font-bold " + getPercentColor(subPercent)
                                            }
                                        >
                                            {sub.marksObtained} / {sub.totalMarks} ({subPercent}
                                            %)
                                        </span>
                                    </div>

                                    <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className={
                                                "h-full rounded-full transition-all duration-700 " +
                                                (subPercent >= 75
                                                    ? "bg-green-500"
                                                    : subPercent >= 50
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500")
                                            }
                                            style={{ width: subPercent + "%" }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Signature */}

                <div className="border-t px-5 py-6 sm:px-8">
                    <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3 sm:gap-8">
                        <div>
                            <div className="mb-2 h-10 border-b border-gray-300"></div>
                            <p className="text-sm text-gray-500">{text.classTeacher}</p>
                        </div>

                        <div>
                            <div className="mb-2 h-10 border-b border-gray-300"></div>
                            <p className="text-sm text-gray-500">{text.principal}</p>
                        </div>

                        <div>
                            <div className="mb-2 h-10 border-b border-gray-300"></div>
                            <p className="text-sm text-gray-500">{text.parentGuardian}</p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        {text.computerGenerated}
                    </p>
                </div>
            </div>

            {/* ============================== Bottom Actions ============================== */}

            <div className="no-print mt-7 flex flex-col gap-4 sm:flex-row sm:justify-end">
                <button
                    onClick={() => navigate("/exams/results/" + examId)}
                    className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-medium hover:bg-gray-100"
                >
                    {text.backToResults}
                </button>

                <button
                    onClick={handlePrint}
                    className="rounded-xl bg-[#5B2EFF] px-8 py-3 font-semibold text-white hover:bg-[#4724db]"
                >
                    {text.printReport}
                </button>
            </div>
        </div>
    );
};

export default StudentResult;