import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, Trophy, Languages } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
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
    Final: "bg-red-100 text-red-700",
    "Weekly Test": "bg-cyan-100 text-cyan-700",
    "Mock Test": "bg-orange-100 text-orange-700",
    Other: "bg-gray-100 text-gray-600"
};

const STATUS_LABEL_GU = {
    Upcoming: "આગામી",
    Ongoing: "ચાલુ",
    Completed: "પૂર્ણ"
};

const TYPE_LABEL_GU = {
    "Unit Test": "એકમ કસોટી",
    "Mid Term": "મધ્ય સત્ર",
    Final: "અંતિમ",
    "Weekly Test": "સાપ્તાહિક કસોટી",
    "Mock Test": "મોક ટેસ્ટ",
    Other: "અન્ય"
};

const ExamList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

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

    const text = {
        title: isGujarati ? "પરીક્ષા યાદી" : "Exam List",
        total: isGujarati ? "કુલ:" : "Total :",
        examsSuffix: isGujarati ? "પરીક્ષાઓ" : "exams",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        createExam: isGujarati ? "પરીક્ષા બનાવો" : "Create Exam",
        searchPlaceholder: isGujarati
            ? "પરીક્ષાનું નામ અથવા પ્રકાર દ્વારા શોધો..."
            : "Search by exam name or type...",
        allClasses: isGujarati ? "બધા ધોરણ" : "All Classes",
        std: isGujarati ? "ધોરણ" : "Std",
        allDivisions: isGujarati ? "બધા વિભાગ" : "All Divisions",
        allStatus: isGujarati ? "બધી સ્થિતિ" : "All Status",
        allTypes: isGujarati ? "બધા પ્રકાર" : "All Types",
        reset: isGujarati ? "રીસેટ" : "Reset",
        applyFilters: isGujarati ? "ફિલ્ટર લાગુ કરો" : "Apply Filters",
        noExamsTitle: isGujarati ? "કોઈ પરીક્ષા મળી નથી" : "No Exams Found",
        noExamsSub: isGujarati
            ? "ફિલ્ટર બદલો અથવા નવી પરીક્ષા બનાવો."
            : "Try changing filters or create a new exam.",
        examName: isGujarati ? "પરીક્ષાનું નામ" : "Exam Name",
        type: isGujarati ? "પ્રકાર" : "Type",
        class: isGujarati ? "ધોરણ" : "Class",
        startDate: isGujarati ? "શરૂઆત તારીખ" : "Start Date",
        endDate: isGujarati ? "સમાપ્તિ તારીખ" : "End Date",
        status: isGujarati ? "સ્થિતિ" : "Status",
        actions: isGujarati ? "ક્રિયાઓ" : "Actions",
        view: isGujarati ? "જુઓ" : "View",
        marks: isGujarati ? "માર્ક્સ" : "Marks",
        edit: isGujarati ? "સંપાદિત કરો" : "Edit",
        delete: isGujarati ? "કાઢી નાખો" : "Delete",
        confirmDelete: isGujarati
            ? "આ પરીક્ષા કાઢી નાખવી છે? બધા સમયપત્રક અને પરિણામો પણ કાઢી નાખવામાં આવશે."
            : "Delete this exam? All schedules and results will also be deleted.",
        deleteError: isGujarati ? "પરીક્ષા કાઢી શકાઈ નથી" : "Unable to delete exam"
    };

    const statusLabel = (status) => (isGujarati ? STATUS_LABEL_GU[status] || status : status);
    const typeLabel = (type) => (isGujarati ? TYPE_LABEL_GU[type] || type : type);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

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
        if (!window.confirm(text.confirmDelete)) return;

        try {
            await deleteExam(id);
            loadExams();
        } catch (error) {
            alert(error.response?.data?.message || text.deleteError);
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
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>
                    <p className="mt-2 text-slate-500">
                        {text.total} {filteredExams.length} {text.examsSuffix}
                    </p>
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
                            onClick={() => navigate("/exams/create")}
                            className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db] sm:px-6 sm:py-3"
                        >
                            <Plus size={18} />
                            {text.createExam}
                        </button>
                    )}
                </div>
            </div>

            {/* ============================== Filters ============================== */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-7 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                        value={filters.standard}
                        onChange={(e) => handleFilterChange("standard", e.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none"
                    >
                        <option value="">{text.allClasses}</option>
                        {[...new Set(classes.map((c) => c.standard))]
                            .sort((a, b) => a - b)
                            .map((std) => (
                                <option key={std} value={std}>
                                    {text.std} {std}
                                </option>
                            ))}
                    </select>

                    <select
                        value={filters.division}
                        onChange={(e) => handleFilterChange("division", e.target.value)}
                        disabled={!filters.standard}
                        className="rounded-xl border px-4 py-3 outline-none disabled:bg-gray-100"
                    >
                        <option value="">{text.allDivisions}</option>
                        {divisionsForStandard.map((div) => (
                            <option key={div} value={div}>
                                {div}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none"
                    >
                        <option value="">{text.allStatus}</option>
                        <option value="Upcoming">{statusLabel("Upcoming")}</option>
                        <option value="Ongoing">{statusLabel("Ongoing")}</option>
                        <option value="Completed">{statusLabel("Completed")}</option>
                    </select>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                        value={filters.examType}
                        onChange={(e) => handleFilterChange("examType", e.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none sm:w-52"
                    >
                        <option value="">{text.allTypes}</option>
                        <option value="Unit Test">{typeLabel("Unit Test")}</option>
                        <option value="Mid Term">{typeLabel("Mid Term")}</option>
                        <option value="Final">{typeLabel("Final")}</option>
                        <option value="Weekly Test">{typeLabel("Weekly Test")}</option>
                        <option value="Mock Test">{typeLabel("Mock Test")}</option>
                        <option value="Other">{typeLabel("Other")}</option>
                    </select>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-800"
                        >
                            <RefreshCw size={16} />
                            {text.reset}
                        </button>

                        <button
                            onClick={() => loadExams(filters)}
                            className="rounded-xl bg-[#5B2EFF] px-6 py-2 font-semibold text-white transition hover:bg-[#4724db]"
                        >
                            {text.applyFilters}
                        </button>
                    </div>
                </div>
            </div>

            {/* ============================== List ============================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && filteredExams.length === 0 && (
                    <div className="py-16 text-center">
                        <Trophy size={56} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold text-gray-600">
                            {text.noExamsTitle}
                        </h2>
                        <p className="mt-2 text-gray-400">{text.noExamsSub}</p>
                    </div>
                )}

                {!loading && filteredExams.length > 0 && (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left">{text.examName}</th>
                                        <th className="px-6 py-4 text-left">{text.type}</th>
                                        <th className="px-6 py-4 text-left">{text.class}</th>
                                        <th className="px-6 py-4 text-left">{text.startDate}</th>
                                        <th className="px-6 py-4 text-left">{text.endDate}</th>
                                        <th className="px-6 py-4 text-left">{text.status}</th>
                                        <th className="px-6 py-4 text-center">{text.actions}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredExams.map((exam) => (
                                        <tr
                                            key={exam._id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-800">
                                                    {exam.examName}
                                                </p>
                                                {exam.description && (
                                                    <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                                                        {exam.description}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={
                                                        "rounded-full px-3 py-1 text-xs font-semibold " +
                                                        (TYPE_STYLE[exam.examType] ||
                                                            "bg-gray-100 text-gray-600")
                                                    }
                                                >
                                                    {typeLabel(exam.examType)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {text.std} {exam.standard} - {exam.division}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {formatDate(exam.startDate)}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {formatDate(exam.endDate)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={
                                                        "rounded-full px-3 py-1 text-xs font-semibold " +
                                                        (STATUS_STYLE[exam.status] ||
                                                            "bg-gray-100 text-gray-600")
                                                    }
                                                >
                                                    {statusLabel(exam.status)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            navigate("/exams/" + exam._id)
                                                        }
                                                        className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition hover:bg-blue-600"
                                                    >
                                                        {text.view}
                                                    </button>

                                                    {isTeacherOrAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        "/exams/marks/" + exam._id
                                                                    )
                                                                }
                                                                className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700"
                                                            >
                                                                {text.marks}
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        "/exams/edit/" + exam._id
                                                                    )
                                                                }
                                                                className="rounded-lg bg-amber-500 px-3 py-2 text-sm text-white transition hover:bg-amber-600"
                                                            >
                                                                {text.edit}
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(exam._id)
                                                                }
                                                                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
                                                            >
                                                                {text.delete}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile / tablet cards */}
                        <div className="divide-y divide-gray-100 lg:hidden">
                            {filteredExams.map((exam) => (
                                <div key={exam._id} className="p-4 sm:p-5">
                                    <div className="mb-2 flex items-start justify-between gap-3">
                                        <p className="min-w-0 font-semibold text-gray-800">
                                            {exam.examName}
                                        </p>

                                        <span
                                            className={
                                                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold " +
                                                (STATUS_STYLE[exam.status] ||
                                                    "bg-gray-100 text-gray-600")
                                            }
                                        >
                                            {statusLabel(exam.status)}
                                        </span>
                                    </div>

                                    {exam.description && (
                                        <p className="mb-2 truncate text-xs text-gray-400">
                                            {exam.description}
                                        </p>
                                    )}

                                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span
                                            className={
                                                "rounded-full px-3 py-1 font-semibold " +
                                                (TYPE_STYLE[exam.examType] ||
                                                    "bg-gray-100 text-gray-600")
                                            }
                                        >
                                            {typeLabel(exam.examType)}
                                        </span>
                                        <span>
                                            {text.std} {exam.standard} - {exam.division}
                                        </span>
                                        <span>
                                            {formatDate(exam.startDate)} — {formatDate(exam.endDate)}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => navigate("/exams/" + exam._id)}
                                            className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition hover:bg-blue-600"
                                        >
                                            {text.view}
                                        </button>

                                        {isTeacherOrAdmin && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        navigate("/exams/marks/" + exam._id)
                                                    }
                                                    className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700"
                                                >
                                                    {text.marks}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        navigate("/exams/edit/" + exam._id)
                                                    }
                                                    className="rounded-lg bg-amber-500 px-3 py-2 text-sm text-white transition hover:bg-amber-600"
                                                >
                                                    {text.edit}
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(exam._id)}
                                                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
                                                >
                                                    {text.delete}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExamList;