import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, Search, RefreshCw, Languages } from "lucide-react";

import { getExamById } from "../../services/examService";
import { getClassResults } from "../../services/resultService";
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

const getRankStyle = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700 font-bold";
    if (rank === 2) return "bg-gray-100 text-gray-700 font-bold";
    if (rank === 3) return "bg-orange-100 text-orange-700 font-bold";
    return "bg-indigo-50 text-indigo-600";
};

const ResultList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [exam, setExam] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        breadcrumb: isGujarati ? "પરીક્ષા › પરિણામો" : "Exams › Results",
        defaultTitle: isGujarati ? "ધોરણ પરિણામો" : "Class Results",
        std: isGujarati ? "ધોરણ" : "Std",
        refreshRanks: isGujarati ? "ક્રમાંક તાજા કરો" : "Refresh Ranks",
        totalStudents: isGujarati ? "કુલ વિદ્યાર્થીઓ" : "Total Students",
        passed: isGujarati ? "પાસ" : "Passed",
        passRate: isGujarati ? "પાસ દર" : "pass rate",
        failed: isGujarati ? "ફેલ" : "Failed",
        classAverage: isGujarati ? "ધોરણ સરેરાશ" : "Class Average",
        highest: isGujarati ? "સર્વોચ્ચ:" : "Highest:",
        searchPlaceholder: isGujarati
            ? "વિદ્યાર્થીનું નામ અથવા GR દ્વારા શોધો..."
            : "Search by student name or GR...",
        allStudents: isGujarati ? "બધા વિદ્યાર્થીઓ" : "All Students",
        passedOnly: isGujarati ? "ફક્ત પાસ" : "Passed Only",
        failedOnly: isGujarati ? "ફક્ત ફેલ" : "Failed Only",
        allGrades: isGujarati ? "બધા ગ્રેડ" : "All Grades",
        noResultsTitle: isGujarati ? "હજુ સુધી કોઈ પરિણામ નથી" : "No Results Yet",
        noResultsSub: isGujarati
            ? "પરિણામો બનાવવા માટે પહેલા માર્ક્સ દાખલ કરો."
            : "Enter marks first to generate results.",
        goToMarksEntry: isGujarati ? "માર્ક્સ એન્ટ્રી પર જાઓ" : "Go to Marks Entry",
        rank: isGujarati ? "ક્રમાંક" : "Rank",
        student: isGujarati ? "વિદ્યાર્થી" : "Student",
        totalMarks: isGujarati ? "કુલ માર્ક્સ" : "Total Marks",
        obtained: isGujarati ? "મેળવેલ" : "Obtained",
        percentage: isGujarati ? "ટકાવારી" : "Percentage",
        grade: isGujarati ? "ગ્રેડ" : "Grade",
        status: isGujarati ? "સ્થિતિ" : "Status",
        reportCard: isGujarati ? "રિપોર્ટ કાર્ડ" : "Report Card",
        grLabel: isGujarati ? "GR :" : "GR :",
        pass: isGujarati ? "પાસ" : "Pass",
        fail: isGujarati ? "ફેલ" : "Fail",
        view: isGujarati ? "જુઓ" : "View"
    };

    const rankLabel = (rank) => {
        if (rank === 1) return "🥇 " + (isGujarati ? "1લો" : "1st");
        if (rank === 2) return "🥈 " + (isGujarati ? "2જો" : "2nd");
        if (rank === 3) return "🥉 " + (isGujarati ? "3જો" : "3rd");
        return rank + (isGujarati ? "મો" : "th");
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [examRes, resultsRes] = await Promise.all([
                getExamById(id),
                getClassResults(id)
            ]);

            setExam(examRes.exam);
            setResults(resultsRes.results || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter((result) => {
        const name = result.studentId?.fullName || "";
        const gr = result.studentId?.grNumber || "";

        const searchMatch = search
            ? name.toLowerCase().includes(search.toLowerCase()) ||
              gr.toLowerCase().includes(search.toLowerCase())
            : true;

        const statusMatch = statusFilter
            ? statusFilter === "Pass"
                ? result.isPassed === true
                : result.isPassed === false
            : true;

        const gradeMatch = gradeFilter ? result.grade === gradeFilter : true;

        return searchMatch && statusMatch && gradeMatch;
    });

    const passCount = results.filter((r) => r.isPassed).length;
    const failCount = results.filter((r) => !r.isPassed).length;

    const avgPercent =
        results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
            : 0;

    const highestPercent =
        results.length > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/exams/" + id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow hover:bg-gray-100 sm:h-12 sm:w-12"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div className="min-w-0">
                        <p className="truncate text-sm text-gray-500">{text.breadcrumb}</p>
                        <h1 className="mt-1 truncate text-2xl font-bold text-slate-800 sm:text-3xl">
                            {exam?.examName || text.defaultTitle}
                        </h1>
                        <p className="mt-1 text-gray-500">
                            {text.std} {exam?.standard} - {exam?.division}
                        </p>
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
                        onClick={loadData}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-medium shadow transition hover:bg-gray-50 sm:px-5 sm:py-3"
                    >
                        <RefreshCw size={16} />
                        {text.refreshRanks}
                    </button>
                </div>
            </div>

            {/* ============================== Summary Cards ============================== */}

            <div className="mb-6 grid grid-cols-2 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow sm:p-6">
                    <p className="text-sm text-gray-500">{text.totalStudents}</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-800 sm:text-3xl">
                        {results.length}
                    </h3>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow sm:p-6">
                    <p className="text-sm text-green-500">{text.passed}</p>
                    <h3 className="mt-2 text-2xl font-bold text-green-700 sm:text-3xl">
                        {passCount}
                    </h3>
                    <p className="mt-1 text-xs text-green-400">
                        {results.length > 0 ? Math.round((passCount / results.length) * 100) : 0}%{" "}
                        {text.passRate}
                    </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow sm:p-6">
                    <p className="text-sm text-red-500">{text.failed}</p>
                    <h3 className="mt-2 text-2xl font-bold text-red-700 sm:text-3xl">
                        {failCount}
                    </h3>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow sm:p-6">
                    <p className="text-sm text-indigo-500">{text.classAverage}</p>
                    <h3 className="mt-2 text-2xl font-bold text-indigo-700 sm:text-3xl">
                        {avgPercent}%
                    </h3>
                    <p className="mt-1 text-xs text-indigo-400">
                        {text.highest} {highestPercent}%
                    </p>
                </div>
            </div>

            {/* ============================== Filters ============================== */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-7 sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="flex items-center rounded-xl bg-gray-100 px-3 md:col-span-2 sm:px-4">
                        <Search size={18} className="shrink-0 text-gray-500" />
                        <input
                            type="text"
                            placeholder={text.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none"
                    >
                        <option value="">{text.allStudents}</option>
                        <option value="Pass">{text.passedOnly}</option>
                        <option value="Fail">{text.failedOnly}</option>
                    </select>

                    <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none"
                    >
                        <option value="">{text.allGrades}</option>
                        {["A+", "A", "B+", "B", "C", "D", "F"].map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ============================== Results List ============================== */}

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && results.length === 0 && (
                    <div className="py-16 text-center">
                        <Trophy size={56} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold text-gray-600">
                            {text.noResultsTitle}
                        </h2>
                        <p className="mt-2 text-gray-400">{text.noResultsSub}</p>
                        <button
                            onClick={() => navigate("/exams/marks/" + id)}
                            className="mt-6 rounded-xl bg-[#5B2EFF] px-8 py-3 font-semibold text-white hover:bg-[#4724db]"
                        >
                            {text.goToMarksEntry}
                        </button>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left">{text.rank}</th>
                                        <th className="px-6 py-4 text-left">{text.student}</th>
                                        <th className="px-6 py-4 text-left">
                                            {text.totalMarks}
                                        </th>
                                        <th className="px-6 py-4 text-left">{text.obtained}</th>
                                        <th className="px-6 py-4 text-left">
                                            {text.percentage}
                                        </th>
                                        <th className="px-6 py-4 text-left">{text.grade}</th>
                                        <th className="px-6 py-4 text-left">{text.status}</th>
                                        <th className="px-6 py-4 text-center">
                                            {text.reportCard}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredResults.map((result) => (
                                        <tr
                                            key={result._id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <span
                                                    className={
                                                        "rounded-full px-3 py-1 text-sm " +
                                                        getRankStyle(result.rank)
                                                    }
                                                >
                                                    {rankLabel(result.rank)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {result.studentId?.photo ? (
                                                        <img
                                                            src={
                                                                "http://localhost:5000/uploads/students/" +
                                                                result.studentId.photo
                                                            }
                                                            alt={result.studentId?.fullName}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                                            {result.studentId?.fullName?.charAt(
                                                                0
                                                            )}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {result.studentId?.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {text.grLabel}{" "}
                                                            {result.studentId?.grNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {result.totalMarks}
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {result.totalObtained}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className={
                                                                "h-full rounded-full " +
                                                                (result.percentage >= 75
                                                                    ? "bg-green-500"
                                                                    : result.percentage >= 50
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-500")
                                                            }
                                                            style={{
                                                                width: result.percentage + "%"
                                                            }}
                                                        ></div>
                                                    </div>

                                                    <span
                                                        className={
                                                            "text-sm font-bold " +
                                                            (result.percentage >= 75
                                                                ? "text-green-600"
                                                                : result.percentage >= 50
                                                                ? "text-yellow-600"
                                                                : "text-red-600")
                                                        }
                                                    >
                                                        {result.percentage}%
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={
                                                        "rounded-full px-3 py-1 text-xs font-bold " +
                                                        (GRADE_STYLE[result.grade] ||
                                                            "bg-gray-100 text-gray-600")
                                                    }
                                                >
                                                    {result.grade}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
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

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            "/exams/report/" +
                                                                result.studentId?._id +
                                                                "/" +
                                                                id
                                                        )
                                                    }
                                                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600"
                                                >
                                                    {text.view}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile / tablet cards */}
                        <div className="divide-y divide-gray-100 lg:hidden">
                            {filteredResults.map((result) => (
                                <div key={result._id} className="p-4 sm:p-5">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {result.studentId?.photo ? (
                                                <img
                                                    src={
                                                        "http://localhost:5000/uploads/students/" +
                                                        result.studentId.photo
                                                    }
                                                    alt={result.studentId?.fullName}
                                                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                                    {result.studentId?.fullName?.charAt(0)}
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-gray-800">
                                                    {result.studentId?.fullName}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {text.grLabel} {result.studentId?.grNumber}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={
                                                "shrink-0 rounded-full px-3 py-1 text-xs " +
                                                getRankStyle(result.rank)
                                            }
                                        >
                                            {rankLabel(result.rank)}
                                        </span>
                                    </div>

                                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                        <span>
                                            {text.obtained}: {result.totalObtained} /{" "}
                                            {result.totalMarks}
                                        </span>

                                        <span
                                            className={
                                                "font-bold " +
                                                (result.percentage >= 75
                                                    ? "text-green-600"
                                                    : result.percentage >= 50
                                                    ? "text-yellow-600"
                                                    : "text-red-600")
                                            }
                                        >
                                            {result.percentage}%
                                        </span>

                                        <span
                                            className={
                                                "rounded-full px-3 py-1 font-bold " +
                                                (GRADE_STYLE[result.grade] ||
                                                    "bg-gray-100 text-gray-600")
                                            }
                                        >
                                            {result.grade}
                                        </span>

                                        {result.isPassed ? (
                                            <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                                                {text.pass}
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">
                                                {text.fail}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                "/exams/report/" +
                                                    result.studentId?._id +
                                                    "/" +
                                                    id
                                            )
                                        }
                                        className="w-full rounded-lg bg-indigo-500 py-2 text-sm text-white transition hover:bg-indigo-600"
                                    >
                                        {text.reportCard}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResultList;