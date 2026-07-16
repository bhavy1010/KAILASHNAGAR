import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, Search, RefreshCw } from "lucide-react";

import { getExamById } from "../../services/examService";
import { getClassResults } from "../../services/resultService";

const GRADE_STYLE = {
    "A+": "bg-green-100 text-green-700",
    "A":  "bg-green-100 text-green-600",
    "B+": "bg-blue-100 text-blue-700",
    "B":  "bg-blue-100 text-blue-600",
    "C":  "bg-yellow-100 text-yellow-700",
    "D":  "bg-orange-100 text-orange-700",
    "F":  "bg-red-100 text-red-700"
};

const getRankStyle = (rank) => {

    if (rank === 1) return "bg-yellow-100 text-yellow-700 font-bold";
    if (rank === 2) return "bg-gray-100 text-gray-700 font-bold";
    if (rank === 3) return "bg-orange-100 text-orange-700 font-bold";
    return "bg-indigo-50 text-indigo-600";

};

const getRankLabel = (rank) => {

    if (rank === 1) return "🥇 1st";
    if (rank === 2) return "🥈 2nd";
    if (rank === 3) return "🥉 3rd";
    return rank + "th";

};

const ResultList = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [exam, setExam] = useState(null);

    const [results, setResults] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [gradeFilter, setGradeFilter] = useState("");

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

        const gradeMatch = gradeFilter
            ? result.grade === gradeFilter
            : true;

        return searchMatch && statusMatch && gradeMatch;

    });

    const passCount = results.filter((r) => r.isPassed).length;

    const failCount = results.filter((r) => !r.isPassed).length;

    const avgPercent = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0;

    const highestPercent = results.length > 0
        ? Math.max(...results.map((r) => r.percentage))
        : 0;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/exams/" + id)}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <p className="text-sm text-gray-500">Exams &rsaquo; Results</p>
                        <h1 className="text-3xl font-bold text-slate-800 mt-1">
                            {exam?.examName || "Class Results"}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Std {exam?.standard} - {exam?.division}
                        </p>
                    </div>

                </div>

                <button
                    onClick={loadData}
                    className="flex items-center gap-2 bg-white border border-gray-200 shadow px-5 py-3 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                    <RefreshCw size={16} />
                    Refresh Ranks
                </button>

            </div>

            {/* ============================== Summary Cards ============================== */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">

                <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                    <p className="text-gray-500 text-sm">Total Students</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{results.length}</h3>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 shadow border border-green-100">
                    <p className="text-green-500 text-sm">Passed</p>
                    <h3 className="text-3xl font-bold text-green-700 mt-2">{passCount}</h3>
                    <p className="text-green-400 text-xs mt-1">
                        {results.length > 0 ? Math.round((passCount / results.length) * 100) : 0}% pass rate
                    </p>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 shadow border border-red-100">
                    <p className="text-red-500 text-sm">Failed</p>
                    <h3 className="text-3xl font-bold text-red-700 mt-2">{failCount}</h3>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-6 shadow border border-indigo-100">
                    <p className="text-indigo-500 text-sm">Class Average</p>
                    <h3 className="text-3xl font-bold text-indigo-700 mt-2">{avgPercent}%</h3>
                    <p className="text-indigo-400 text-xs mt-1">Highest: {highestPercent}%</p>
                </div>

            </div>

            {/* ============================== Filters ============================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div className="md:col-span-2 flex items-center bg-gray-100 rounded-xl px-4">
                        <Search size={18} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by student name or GR..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent px-3 py-3 outline-none"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Students</option>
                        <option value="Pass">Passed Only</option>
                        <option value="Fail">Failed Only</option>
                    </select>

                    <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Grades</option>
                        {["A+", "A", "B+", "B", "C", "D", "F"].map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>

                </div>

            </div>

            {/* ============================== Results Table ============================== */}

            <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">

                {loading && (

                    <div className="py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>

                )}

                {!loading && results.length === 0 && (

                    <div className="py-16 text-center">
                        <Trophy size={56} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600">No Results Yet</h2>
                        <p className="text-gray-400 mt-2">Enter marks first to generate results.</p>
                        <button
                            onClick={() => navigate("/exams/marks/" + id)}
                            className="mt-6 px-8 py-3 rounded-xl bg-[#5B2EFF] text-white font-semibold hover:bg-[#4724db]"
                        >
                            Go to Marks Entry
                        </button>
                    </div>

                )}

                {!loading && results.length > 0 && (

                    <table className="w-full">

                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4">Rank</th>
                                <th className="text-left px-6 py-4">Student</th>
                                <th className="text-left px-6 py-4">Total Marks</th>
                                <th className="text-left px-6 py-4">Obtained</th>
                                <th className="text-left px-6 py-4">Percentage</th>
                                <th className="text-left px-6 py-4">Grade</th>
                                <th className="text-left px-6 py-4">Status</th>
                                <th className="text-center px-6 py-4">Report Card</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredResults.map((result) => (

                                <tr key={result._id} className="border-t hover:bg-gray-50 transition">

                                    <td className="px-6 py-4">
                                        <span className={"px-3 py-1 rounded-full text-sm " + getRankStyle(result.rank)}>
                                            {getRankLabel(result.rank)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex items-center gap-3">

                                            {result.studentId?.photo ? (

                                                <img
                                                    src={"http://localhost:5000/uploads/students/" + result.studentId.photo}
                                                    alt={result.studentId?.fullName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />

                                            ) : (

                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                                    {result.studentId?.fullName?.charAt(0)}
                                                </div>

                                            )}

                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {result.studentId?.fullName}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    GR : {result.studentId?.grNumber}
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

                                            <div className="w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                <div
                                                    className={"h-full rounded-full " + (result.percentage >= 75 ? "bg-green-500" : result.percentage >= 50 ? "bg-yellow-500" : "bg-red-500")}
                                                    style={{ width: result.percentage + "%" }}
                                                ></div>
                                            </div>

                                            <span className={"font-bold text-sm " + (result.percentage >= 75 ? "text-green-600" : result.percentage >= 50 ? "text-yellow-600" : "text-red-600")}>
                                                {result.percentage}%
                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={"px-3 py-1 rounded-full text-xs font-bold " + (GRADE_STYLE[result.grade] || "bg-gray-100 text-gray-600")}>
                                            {result.grade}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        {result.isPassed ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Pass
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                Fail
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigate("/exams/report/" + result.studentId?._id + "/" + id)}
                                            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm transition"
                                        >
                                            View
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

};

export default ResultList;