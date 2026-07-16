import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, User, BookOpen, Award } from "lucide-react";

import { getStudentResult } from "../../services/resultService";

const GRADE_STYLE = {
    "A+": "bg-green-100 text-green-700",
    "A":  "bg-green-100 text-green-600",
    "B+": "bg-blue-100 text-blue-700",
    "B":  "bg-blue-100 text-blue-600",
    "C":  "bg-yellow-100 text-yellow-700",
    "D":  "bg-orange-100 text-orange-700",
    "F":  "bg-red-100 text-red-700"
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

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(true);

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

            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

        );

    }

    if (!result) {

        return (

            <div className="p-8 text-center">
                <Trophy size={56} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-600">Result Not Found</h2>
                <p className="text-gray-400 mt-2">Marks may not have been entered yet for this student.</p>
            </div>

        );

    }

    const student = result.studentId;
    const exam = result.examId;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full" id="report-card-print">

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #report-card-print, #report-card-print * { visibility: visible; }
                    #report-card-print { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8 no-print">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <p className="text-sm text-gray-500">Exams &rsaquo; Report Card</p>
                        <h1 className="text-3xl font-bold text-slate-800 mt-1">Student Report Card</h1>
                    </div>

                </div>

                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
                >
                    🖨 Print Report Card
                </button>

            </div>

            {/* ============================== Report Card ============================== */}

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

                {/* School Header */}

                <div className="bg-gradient-to-r from-[#5B2EFF] to-indigo-500 p-8 text-white text-center">

                    <h1 className="text-3xl font-bold">Kailashnagar School</h1>

                    <p className="text-indigo-200 mt-1">
                        Official Report Card
                    </p>

                    <div className="mt-4 inline-block bg-white bg-opacity-20 rounded-xl px-6 py-2">
                        <p className="font-semibold text-lg">
                            {exam?.examName} — {exam?.examType}
                        </p>
                    </div>

                </div>

                {/* Student Info */}

                <div className="p-8 border-b">

                    <div className="flex flex-col lg:flex-row items-start gap-8">

                        <div className="shrink-0">

                            {student?.photo ? (

                                <img
                                    src={"http://localhost:5000/uploads/students/" + student.photo}
                                    alt={student?.fullName}
                                    className="w-28 h-28 rounded-2xl object-cover border-4 border-indigo-100 shadow"
                                />

                            ) : (

                                <div className="w-28 h-28 rounded-2xl bg-indigo-100 flex items-center justify-center border-4 border-indigo-200 shadow">
                                    <User size={50} className="text-indigo-400" />
                                </div>

                            )}

                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-5">

                            <div>
                                <p className="text-xs text-gray-400">Student Name</p>
                                <p className="font-bold text-gray-800 mt-1 text-lg">{student?.fullName}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">GR Number</p>
                                <p className="font-semibold text-gray-700 mt-1">{student?.grNumber}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Class</p>
                                <p className="font-semibold text-gray-700 mt-1">
                                    Std {result.standard} - {result.division}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Exam Period</p>
                                <p className="font-semibold text-gray-700 mt-1">
                                    {exam?.startDate ? new Date(exam.startDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                                    {" "} to {" "}
                                    {exam?.endDate ? new Date(exam.endDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Gender</p>
                                <p className="font-semibold text-gray-700 mt-1">{student?.gender || "-"}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Report Date</p>
                                <p className="font-semibold text-gray-700 mt-1">
                                    {new Date().toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* Result Summary */}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border-b">

                    <div className="p-6 border-r text-center">
                        <p className="text-xs text-gray-400">Total Marks</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-2">{result.totalMarks}</h3>
                    </div>

                    <div className="p-6 border-r text-center">
                        <p className="text-xs text-gray-400">Marks Obtained</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-2">{result.totalObtained}</h3>
                    </div>

                    <div className="p-6 border-r text-center">
                        <p className="text-xs text-gray-400">Percentage</p>
                        <h3 className={"text-2xl font-bold mt-2 " + getPercentColor(result.percentage)}>
                            {result.percentage}%
                        </h3>
                    </div>

                    <div className="p-6 border-r text-center">
                        <p className="text-xs text-gray-400">Grade</p>
                        <h3 className={"text-2xl font-bold mt-2 " + getGradeColor(result.grade)}>
                            {result.grade}
                        </h3>
                    </div>

                    <div className="p-6 text-center">
                        <p className="text-xs text-gray-400">Rank</p>
                        <h3 className="text-2xl font-bold text-indigo-600 mt-2">
                            {result.rank === 1 ? "🥇" : result.rank === 2 ? "🥈" : result.rank === 3 ? "🥉" : "#" + result.rank}
                        </h3>
                    </div>

                </div>

                {/* Status Banner */}

                <div className={"p-5 text-center " + (result.isPassed ? "bg-green-50" : "bg-red-50")}>

                    <span className={"text-xl font-bold " + (result.isPassed ? "text-green-700" : "text-red-700")}>
                        {result.isPassed ? "✅ PASSED" : "❌ FAILED"}
                    </span>

                    {result.remarks && (
                        <p className="text-gray-500 mt-1 text-sm">{result.remarks}</p>
                    )}

                </div>

                {/* Subject-wise Results */}

                <div className="p-8">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <BookOpen size={20} className="text-indigo-600" />
                        </div>

                        <h2 className="text-xl font-bold">Subject-wise Performance</h2>

                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100">

                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-4">Subject</th>
                                    <th className="text-center px-6 py-4">Total Marks</th>
                                    <th className="text-center px-6 py-4">Passing Marks</th>
                                    <th className="text-center px-6 py-4">Obtained</th>
                                    <th className="text-center px-6 py-4">Percentage</th>
                                    <th className="text-center px-6 py-4">Grade</th>
                                    <th className="text-center px-6 py-4">Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {result.subjectResults.map((sub, index) => {

                                    const subPercent = sub.totalMarks > 0
                                        ? Math.round((sub.marksObtained / sub.totalMarks) * 100)
                                        : 0;

                                    return (

                                        <tr key={index} className="border-t hover:bg-gray-50 transition">

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

                                                    <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                        <div
                                                            className={"h-full rounded-full " + (subPercent >= 75 ? "bg-green-500" : subPercent >= 50 ? "bg-yellow-500" : "bg-red-500")}
                                                            style={{ width: subPercent + "%" }}
                                                        ></div>
                                                    </div>

                                                    <span className={"text-sm font-semibold " + getPercentColor(subPercent)}>
                                                        {subPercent}%
                                                    </span>

                                                </div>

                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={"px-3 py-1 rounded-full text-xs font-bold " + (GRADE_STYLE[sub.grade] || "bg-gray-100 text-gray-600")}>
                                                    {sub.grade}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {sub.isPassed ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                        Pass
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                        Fail
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
                                    <td className="px-6 py-4 font-bold text-indigo-800">Total</td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">{result.totalMarks}</td>
                                    <td className="px-6 py-4 text-center text-gray-400">-</td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">{result.totalObtained}</td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">{result.percentage}%</td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-800">{result.grade}</td>
                                    <td className="px-6 py-4 text-center">
                                        {result.isPassed ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Pass</span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Fail</span>
                                        )}
                                    </td>
                                </tr>
                            </tfoot>

                        </table>

                    </div>

                </div>

                {/* Performance Bar Chart */}

                <div className="px-8 pb-8">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Award size={20} className="text-purple-600" />
                        </div>

                        <h2 className="text-xl font-bold">Performance Overview</h2>

                    </div>

                    <div className="space-y-4">

                        {result.subjectResults.map((sub, index) => {

                            const subPercent = sub.totalMarks > 0
                                ? Math.round((sub.marksObtained / sub.totalMarks) * 100)
                                : 0;

                            return (

                                <div key={index}>

                                    <div className="flex justify-between mb-2">

                                        <span className="font-semibold text-gray-700">{sub.subject}</span>

                                        <span className={"font-bold " + getPercentColor(subPercent)}>
                                            {sub.marksObtained} / {sub.totalMarks} ({subPercent}%)
                                        </span>

                                    </div>

                                    <div className="h-4 rounded-full bg-gray-100 overflow-hidden">

                                        <div
                                            className={"h-full rounded-full transition-all duration-700 " + (subPercent >= 75 ? "bg-green-500" : subPercent >= 50 ? "bg-yellow-500" : "bg-red-500")}
                                            style={{ width: subPercent + "%" }}
                                        ></div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                </div>

                {/* Footer Signature */}

                <div className="border-t px-8 py-6">

                    <div className="grid grid-cols-3 gap-8 text-center">

                        <div>
                            <div className="h-10 border-b border-gray-300 mb-2"></div>
                            <p className="text-sm text-gray-500">Class Teacher</p>
                        </div>

                        <div>
                            <div className="h-10 border-b border-gray-300 mb-2"></div>
                            <p className="text-sm text-gray-500">Principal</p>
                        </div>

                        <div>
                            <div className="h-10 border-b border-gray-300 mb-2"></div>
                            <p className="text-sm text-gray-500">Parent / Guardian</p>
                        </div>

                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        This is a computer-generated report card. No signature required.
                    </p>

                </div>

            </div>

            {/* ============================== Bottom Actions ============================== */}

            <div className="mt-7 flex justify-end gap-4 no-print">

                <button
                    onClick={() => navigate("/exams/results/" + examId)}
                    className="px-8 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 font-medium"
                >
                    Back to Class Results
                </button>

                <button
                    onClick={handlePrint}
                    className="px-8 py-3 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white font-semibold"
                >
                    🖨 Print Report Card
                </button>

            </div>

        </div>

    );

};

export default StudentResult;