import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, Trophy } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getClasses } from "../../services/classService";
import { getAllExams, deleteExam } from "../../services/examService";

const STATUS_STYLE = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-green-100 text-green-700",
    Completed: "bg-gray-100 text-gray-600"
};

const TYPE_STYLE = {
    "Unit Test": "bg-indigo-100 text-indigo-700",
    "Mid Term": "bg-purple-100 text-purple-700",
    "Final": "bg-red-100 text-red-700",
    "Weekly Test": "bg-cyan-100 text-cyan-700",
    "Mock Test": "bg-orange-100 text-orange-700",
    "Other": "bg-gray-100 text-gray-600"
};

const ExamList = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [exams, setExams] = useState([]);

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        standard: "",
        division: "",
        status: "",
        examType: ""
    });

    useEffect(() => {

        loadClasses();
        loadExams();

    }, []);

    const loadClasses = async () => {

        try {

            const response = await getClasses();
            setClasses(response.classes || []);

        } catch (error) {

            console.log(error);

        }

    };

    const loadExams = async (activeFilters = filters) => {

        try {

            setLoading(true);
            const response = await getAllExams(activeFilters);
            setExams(response.exams || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleFilterChange = (key, value) => {

        const updated = {
            ...filters,
            [key]: value,
            ...(key === "standard" ? { division: "" } : {})
        };

        setFilters(updated);

    };

    const handleReset = () => {

        const reset = { standard: "", division: "", status: "", examType: "" };
        setFilters(reset);
        setSearch("");
        loadExams(reset);

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this exam? All schedules and results will also be deleted.")) return;

        try {

            await deleteExam(id);
            loadExams();

        } catch (error) {

            alert(error.response?.data?.message || "Unable to delete exam");

        }

    };

    const divisionsForStandard = [
        ...new Set(
            classes
                .filter((c) => String(c.standard) === String(filters.standard))
                .map((c) => c.division)
        )
    ];

    const filteredExams = exams.filter((exam) =>
        search
            ? exam.examName.toLowerCase().includes(search.toLowerCase()) ||
              exam.examType.toLowerCase().includes(search.toLowerCase())
            : true
    );

    const isTeacherOrAdmin = user?.role === "admin" || user?.role === "teacher";

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Exam List</h1>
                    <p className="mt-2 text-slate-500">Total : {filteredExams.length} exams</p>
                </div>

                {isTeacherOrAdmin && (

                    <button
                        onClick={() => navigate("/exams/create")}
                        className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
                    >
                        <Plus size={18} />
                        Create Exam
                    </button>

                )}

            </div>

            {/* ============================== Filters ============================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                    <div className="md:col-span-2 flex items-center bg-gray-100 rounded-xl px-4">
                        <Search size={18} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by exam name or type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent px-3 py-3 outline-none"
                        />
                    </div>

                    <select
                        value={filters.standard}
                        onChange={(e) => handleFilterChange("standard", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Classes</option>
                        {[...new Set(classes.map((c) => c.standard))]
                            .sort((a, b) => a - b)
                            .map((std) => (
                                <option key={std} value={std}>Std {std}</option>
                            ))}
                    </select>

                    <select
                        value={filters.division}
                        onChange={(e) => handleFilterChange("division", e.target.value)}
                        disabled={!filters.standard}
                        className="border rounded-xl px-4 py-3 outline-none disabled:bg-gray-100"
                    >
                        <option value="">All Divisions</option>
                        {divisionsForStandard.map((div) => (
                            <option key={div} value={div}>{div}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                    </select>

                </div>

                <div className="flex items-center justify-between mt-5">

                    <select
                        value={filters.examType}
                        onChange={(e) => handleFilterChange("examType", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none w-52"
                    >
                        <option value="">All Types</option>
                        <option value="Unit Test">Unit Test</option>
                        <option value="Mid Term">Mid Term</option>
                        <option value="Final">Final</option>
                        <option value="Weekly Test">Weekly Test</option>
                        <option value="Mock Test">Mock Test</option>
                        <option value="Other">Other</option>
                    </select>

                    <div className="flex gap-3">

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition"
                        >
                            <RefreshCw size={16} />
                            Reset
                        </button>

                        <button
                            onClick={() => loadExams(filters)}
                            className="px-6 py-2 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white font-semibold transition"
                        >
                            Apply Filters
                        </button>

                    </div>

                </div>

            </div>

            {/* ============================== Table ============================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {loading && (

                    <div className="py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>

                )}

                {!loading && filteredExams.length === 0 && (

                    <div className="text-center py-16">
                        <Trophy size={56} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600">No Exams Found</h2>
                        <p className="text-gray-400 mt-2">Try changing filters or create a new exam.</p>
                    </div>

                )}

                {!loading && filteredExams.length > 0 && (

                    <table className="w-full">

                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4">Exam Name</th>
                                <th className="text-left px-6 py-4">Type</th>
                                <th className="text-left px-6 py-4">Class</th>
                                <th className="text-left px-6 py-4">Start Date</th>
                                <th className="text-left px-6 py-4">End Date</th>
                                <th className="text-left px-6 py-4">Status</th>
                                <th className="text-center px-6 py-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredExams.map((exam) => (

                                <tr key={exam._id} className="border-t hover:bg-gray-50 transition">

                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800">{exam.examName}</p>
                                        {exam.description && (
                                            <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                                {exam.description}
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (TYPE_STYLE[exam.examType] || "bg-gray-100 text-gray-600")}>
                                            {exam.examType}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        Std {exam.standard} - {exam.division}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(exam.startDate).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(exam.endDate).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (STATUS_STYLE[exam.status] || "bg-gray-100 text-gray-600")}>
                                            {exam.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex items-center justify-center gap-2">

                                            <button
                                                onClick={() => navigate("/exams/" + exam._id)}
                                                className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition"
                                            >
                                                View
                                            </button>

                                            {isTeacherOrAdmin && (

                                                <>

                                                    <button
                                                        onClick={() => navigate("/exams/marks/" + exam._id)}
                                                        className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition"
                                                    >
                                                        Marks
                                                    </button>

                                                    <button
                                                        onClick={() => navigate("/exams/edit/" + exam._id)}
                                                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(exam._id)}
                                                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                                                    >
                                                        Delete
                                                    </button>

                                                </>

                                            )}

                                        </div>

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

export default ExamList;