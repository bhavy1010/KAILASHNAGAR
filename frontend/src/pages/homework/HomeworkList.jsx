import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Plus,
    RefreshCw,
    BookOpen,
    Paperclip,
    Loader2,
    Eye,
    Pencil,
    Trash2
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getStudents } from "../../services/studentService";
import {
    getAllHomework,
    deleteHomework
} from "../../services/homeworkService";

const STATUS_STYLE = {
    Active: "bg-green-100 text-green-700",
    Closed: "bg-slate-100 text-slate-600"
};

const HomeworkList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [homework, setHomework] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        standard: "",
        division: "",
        subject: "",
        status: ""
    });

    const canManageHomework =
        user?.role === "admin" || user?.role === "teacher";

    const text = {
        title: isGujarati ? "હોમવર્ક યાદી" : "Homework List",
        total: isGujarati ? "કુલ" : "Total",
        assignments: isGujarati ? "હોમવર્ક" : "assignments",
        createHomework: isGujarati ? "હોમવર્ક બનાવો" : "Create Homework",
        searchPlaceholder: isGujarati
            ? "શીર્ષક અથવા વિષયથી શોધો..."
            : "Search by title or subject...",
        allClasses: isGujarati ? "બધા વર્ગો" : "All Classes",
        allDivisions: isGujarati ? "બધા વિભાગો" : "All Divisions",
        allSubjects: isGujarati ? "બધા વિષયો" : "All Subjects",
        allStatus: isGujarati ? "બધી સ્થિતિ" : "All Status",
        active: isGujarati ? "સક્રિય" : "Active",
        closed: isGujarati ? "બંધ" : "Closed",
        reset: isGujarati ? "રીસેટ" : "Reset",
        applyFilters: isGujarati ? "ફિલ્ટર લાગુ કરો" : "Apply Filters",
        homeworkTitle: isGujarati ? "શીર્ષક" : "Title",
        subject: isGujarati ? "વિષય" : "Subject",
        class: isGujarati ? "વર્ગ" : "Class",
        teacher: isGujarati ? "શિક્ષક" : "Teacher",
        dueDate: isGujarati ? "છેલ્લી તારીખ" : "Due Date",
        status: isGujarati ? "સ્થિતિ" : "Status",
        actions: isGujarati ? "કાર્ય" : "Actions",
        attachment: isGujarati ? "જોડાણ" : "Attachment",
        overdue: isGujarati ? "મુદત પૂર્ણ" : "Overdue",
        view: isGujarati ? "જુઓ" : "View",
        edit: isGujarati ? "સંપાદિત કરો" : "Edit",
        delete: isGujarati ? "કાઢી નાખો" : "Delete",
        noHomework: isGujarati
            ? "કોઈ હોમવર્ક મળ્યું નથી"
            : "No Homework Found",
        noHomeworkText: isGujarati
            ? "ફિલ્ટર બદલીને ફરી પ્રયાસ કરો અથવા નવું હોમવર્ક બનાવો."
            : "Try changing filters or create new homework.",
        loading: isGujarati ? "હોમવર્ક લોડ થઈ રહ્યું છે..." : "Loading homework...",
        confirmDelete: isGujarati
            ? "શું તમે આ હોમવર્ક કાઢી નાખવા માંગો છો? બધા સબમિશન પણ કાઢી નાખવામાં આવશે."
            : "Delete this homework? All submissions will also be deleted.",
        unableDelete: isGujarati
            ? "હોમવર્ક કાઢી શકાતું નથી."
            : "Unable to delete homework"
    };

    const statusLabel = {
        Active: text.active,
        Closed: text.closed
    };

    useEffect(() => {
        loadClasses();
        loadHomework();
    }, []);

    const loadClasses = async () => {
        try {
            const response = await getStudents();

            const activeStudents = (response.students || []).filter(
                (student) => student.status === "Active"
            );

            const realClasses = [
                ...new Map(
                    activeStudents.map((student) => [
                        `${student.standard}-${student.division}`,
                        {
                            standard: student.standard,
                            division: student.division
                        }
                    ])
                ).values()
            ];

            setClasses(realClasses);
        } catch (error) {
            console.log(error);
            setClasses([]);
        }
    };

    const loadHomework = async (activeFilters = filters) => {
        try {
            setLoading(true);

            const response = await getAllHomework(activeFilters);
            setHomework(response?.homework || []);
        } catch (error) {
            console.log(error);
            setHomework([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
            ...(key === "standard" ? { division: "" } : {})
        }));
    };

    const handleApplyFilters = () => {
        loadHomework(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            standard: "",
            division: "",
            subject: "",
            status: ""
        };

        setFilters(resetFilters);
        setSearch("");
        loadHomework(resetFilters);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(text.confirmDelete)) return;

        try {
            await deleteHomework(id);
            loadHomework();
        } catch (error) {
            alert(
                error.response?.data?.message || text.unableDelete
            );
        }
    };

    const isOverdue = (dueDate, status) =>
        status === "Active" && new Date(dueDate) < new Date();

    const divisionsForStandard = [
        ...new Set(
            classes
                .filter(
                    (item) =>
                        String(item.standard) === String(filters.standard)
                )
                .map((item) => item.division)
        )
    ];

    const subjectOptions = [
        ...new Set(homework.map((item) => item.subject).filter(Boolean))
    ];

    const filteredHomework = homework.filter((item) => {
        const searchText = search.toLowerCase().trim();

        if (!searchText) return true;

        return (
            item.title?.toLowerCase().includes(searchText) ||
            item.subject?.toLowerCase().includes(searchText)
        );
    });

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

    const HomeworkActions = ({ item }) => (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <button
                onClick={() => navigate(`/homework/${item._id}`)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
                <Eye size={15} />
                {text.view}
            </button>

            {canManageHomework && (
                <>
                    <button
                        onClick={() =>
                            navigate(`/homework/edit/${item._id}`)
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                        <Pencil size={15} />
                        {text.edit}
                    </button>

                    <button
                        onClick={() => handleDelete(item._id)}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        <Trash2 size={15} />
                        {text.delete}
                    </button>
                </>
            )}
        </div>
    );

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.total}: {filteredHomework.length} {text.assignments}
                    </p>
                </div>

                {canManageHomework && (
                    <button
                        onClick={() => navigate("/homework/create")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#4724db] sm:w-auto"
                    >
                        <Plus size={18} />
                        {text.createHomework}
                    </button>
                )}
            </div>

            <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="xl:col-span-2">
                        <div className="flex items-center rounded-xl bg-slate-100 px-4">
                            <Search size={18} className="shrink-0 text-slate-500" />

                            <input
                                type="text"
                                placeholder={text.searchPlaceholder}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full bg-transparent px-3 py-3 outline-none"
                            />
                        </div>
                    </div>

                    <select
                        value={filters.standard}
                        onChange={(event) =>
                            handleFilterChange("standard", event.target.value)
                        }
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allClasses}</option>

                        {[...new Set(classes.map((item) => item.standard))]
                            .sort((a, b) => a - b)
                            .map((std) => (
                                <option key={std} value={std}>
                                    {isGujarati ? `${std} ધોરણ` : `Std ${std}`}
                                </option>
                            ))}
                    </select>

                    <select
                        value={filters.division}
                        onChange={(event) =>
                            handleFilterChange("division", event.target.value)
                        }
                        disabled={!filters.standard}
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                        <option value="">{text.allDivisions}</option>

                        {divisionsForStandard.map((division) => (
                            <option key={division} value={division}>
                                {division}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(event) =>
                            handleFilterChange("status", event.target.value)
                        }
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allStatus}</option>
                        <option value="Active">{text.active}</option>
                        <option value="Closed">{text.closed}</option>
                    </select>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <select
                        value={filters.subject}
                        onChange={(event) =>
                            handleFilterChange("subject", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100 sm:w-56"
                    >
                        <option value="">{text.allSubjects}</option>

                        {subjectOptions.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                        >
                            <RefreshCw size={16} />
                            {text.reset}
                        </button>

                        <button
                            onClick={handleApplyFilters}
                            className="rounded-xl bg-[#5B2EFF] px-6 py-3 font-semibold text-white transition hover:bg-[#4724db]"
                        >
                            {text.applyFilters}
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-72 flex-col items-center justify-center gap-3">
                        <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                        <p className="font-medium text-slate-500">{text.loading}</p>
                    </div>
                ) : filteredHomework.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <BookOpen
                            size={56}
                            className="mx-auto mb-4 text-slate-300"
                        />

                        <h2 className="text-xl font-semibold text-slate-600">
                            {text.noHomework}
                        </h2>

                        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400 sm:text-base">
                            {text.noHomeworkText}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto xl:block">
                            <table className="w-full min-w-[1100px]">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.homeworkTitle}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.subject}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.class}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.teacher}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.dueDate}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.status}
                                        </th>

                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                            {text.actions}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredHomework.map((item) => {
                                        const overdue = isOverdue(
                                            item.dueDate,
                                            item.status
                                        );

                                        return (
                                            <tr
                                                key={item._id}
                                                className="border-t border-slate-100 transition hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">
                                                        {item.title}
                                                    </p>

                                                    {item.attachment && (
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <Paperclip
                                                                size={12}
                                                                className="text-slate-400"
                                                            />
                                                            <span className="text-xs text-slate-400">
                                                                {text.attachment}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                        {item.subject || "-"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {isGujarati
                                                        ? `${item.standard} ધોરણ - ${item.division}`
                                                        : `Std ${item.standard} - ${item.division}`}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {item.teacherId?.fullName || "-"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p
                                                        className={`font-semibold ${
                                                            overdue
                                                                ? "text-red-600"
                                                                : "text-slate-700"
                                                        }`}
                                                    >
                                                        {formatDate(item.dueDate)}
                                                    </p>

                                                    {overdue && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {text.overdue}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            STATUS_STYLE[item.status] ||
                                                            "bg-slate-100 text-slate-700"
                                                        }`}
                                                    >
                                                        {statusLabel[item.status] ||
                                                            item.status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <HomeworkActions item={item} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 xl:hidden">
                            {filteredHomework.map((item) => {
                                const overdue = isOverdue(
                                    item.dueDate,
                                    item.status
                                );

                                return (
                                    <div key={item._id} className="p-4 sm:p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-semibold text-slate-800">
                                                        {item.title}
                                                    </p>

                                                    {item.attachment && (
                                                        <Paperclip
                                                            size={15}
                                                            className="shrink-0 text-slate-400"
                                                        />
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {item.teacherId?.fullName || "-"}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    STATUS_STYLE[item.status] ||
                                                    "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {statusLabel[item.status] ||
                                                    item.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-400">
                                                    {text.subject}
                                                </p>
                                                <p className="mt-1 font-medium text-slate-700">
                                                    {item.subject || "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-400">
                                                    {text.class}
                                                </p>
                                                <p className="mt-1 font-medium text-slate-700">
                                                    {isGujarati
                                                        ? `${item.standard} ધોરણ - ${item.division}`
                                                        : `Std ${item.standard} - ${item.division}`}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-slate-400">
                                                    {text.dueDate}
                                                </p>
                                                <p
                                                    className={`mt-1 font-medium ${
                                                        overdue
                                                            ? "text-red-600"
                                                            : "text-slate-700"
                                                    }`}
                                                >
                                                    {formatDate(item.dueDate)}
                                                    {overdue && ` (${text.overdue})`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-slate-100 pt-4">
                                            <HomeworkActions item={item} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomeworkList;