import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Plus,
    RefreshCw,
    BookOpen,
    Paperclip
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getClasses } from "../../services/classService";
import {
    getAllHomework,
    deleteHomework
} from "../../services/homeworkService";

const STATUS_STYLE = {

    Active: "bg-green-100 text-green-700",

    Closed: "bg-gray-100 text-gray-600"

};

const HomeworkList = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

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

    useEffect(() => {

        loadClasses();

        loadHomework();

    }, []);

    const loadClasses = async () => {

        try {

            const response = await getClasses();

            setClasses(response.classes || []);

        } catch (error) {

            console.log(error);

        }

    };

    const loadHomework = async (activeFilters = filters) => {

        try {

            setLoading(true);

            const response = await getAllHomework(activeFilters);

            setHomework(response.homework || []);

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

    const handleApplyFilters = () => {

        loadHomework(filters);

    };

    const handleReset = () => {

        const reset = {

            standard: "",

            division: "",

            subject: "",

            status: ""

        };

        setFilters(reset);

        setSearch("");

        loadHomework(reset);

    };

    const handleDelete = async (id) => {

        if (!window.confirm(

            "Delete this homework? All submissions will also be deleted."

        )) return;

        try {

            await deleteHomework(id);

            loadHomework();

        } catch (error) {

            alert(

                error.response?.data?.message ||

                "Unable to delete homework"

            );

        }

    };

    const isOverdue = (dueDate, status) =>

        status === "Active" && new Date(dueDate) < new Date();

    const divisionsForStandard = [

        ...new Set(

            classes

                .filter(

                    (c) => String(c.standard) === String(filters.standard)

                )

                .map((c) => c.division)

        )

    ];

    const subjectOptions = [

        ...new Set(homework.map((h) => h.subject).filter(Boolean))

    ];

    const filteredHomework = homework.filter((hw) =>

        search

            ? hw.title.toLowerCase().includes(search.toLowerCase()) ||

              hw.subject.toLowerCase().includes(search.toLowerCase())

            : true

    );

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ===================== Header ===================== */}

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">

                        Homework List

                    </h1>

                    <p className="mt-2 text-slate-500">

                        Total : {filteredHomework.length} assignments

                    </p>

                </div>

                {

                    (user?.role === "admin" ||
                     user?.role === "teacher") && (

                        <button
                            onClick={() => navigate("/homework/create")}
                            className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl transition font-semibold shadow-lg hover:scale-105"
                        >

                            <Plus size={18} />

                            Create Homework

                        </button>

                    )

                }

            </div>

            {/* ===================== Filters ===================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                    <div className="md:col-span-2">

                        <div className="flex items-center bg-gray-100 rounded-xl px-4">

                            <Search size={18} className="text-gray-500" />

                            <input
                                type="text"
                                placeholder="Search by title or subject..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent px-3 py-3 outline-none"
                            />

                        </div>

                    </div>

                    <select
                        value={filters.standard}
                        onChange={(e) =>
                            handleFilterChange("standard", e.target.value)
                        }
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Classes</option>

                        {

                            [...new Set(classes.map((c) => c.standard))]

                                .sort((a, b) => a - b)

                                .map((std) => (

                                    <option key={std} value={std}>

                                        Std {std}

                                    </option>

                                ))

                        }

                    </select>

                    <select
                        value={filters.division}
                        onChange={(e) =>
                            handleFilterChange("division", e.target.value)
                        }
                        disabled={!filters.standard}
                        className="border rounded-xl px-4 py-3 outline-none disabled:bg-gray-100"
                    >

                        <option value="">All Divisions</option>

                        {

                            divisionsForStandard.map((div) => (

                                <option key={div} value={div}>

                                    {div}

                                </option>

                            ))

                        }

                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                        }
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Status</option>

                        <option value="Active">Active</option>

                        <option value="Closed">Closed</option>

                    </select>

                </div>

                <div className="flex items-center justify-between mt-5">

                    <select
                        value={filters.subject}
                        onChange={(e) =>
                            handleFilterChange("subject", e.target.value)
                        }
                        className="border rounded-xl px-4 py-3 outline-none w-52"
                    >

                        <option value="">All Subjects</option>

                        {

                            subjectOptions.map((sub) => (

                                <option key={sub} value={sub}>

                                    {sub}

                                </option>

                            ))

                        }

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
                            onClick={handleApplyFilters}
                            className="px-6 py-2 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white font-semibold transition"
                        >

                            Apply Filters

                        </button>

                    </div>

                </div>

            </div>

            {/* ===================== Table ===================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {

                    loading ? (

                        <div className="py-20 flex justify-center">

                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

                        </div>

                    ) : (

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="text-left px-6 py-4">

                                        Title

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Subject

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Class

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Teacher

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Due Date

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Status

                                    </th>

                                    <th className="text-center px-6 py-4">

                                        Actions

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    filteredHomework.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center py-16"
                                            >

                                                <BookOpen
                                                    size={56}
                                                    className="mx-auto text-gray-300 mb-4"
                                                />

                                                <h2 className="text-xl font-semibold text-gray-600">

                                                    No Homework Found

                                                </h2>

                                                <p className="text-gray-400 mt-2">

                                                    Try changing filters or create new homework.

                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredHomework.map((hw) => (

                                            <tr
                                                key={hw._id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <div>

                                                            <p className="font-semibold text-gray-800">

                                                                {hw.title}

                                                            </p>

                                                            {

                                                                hw.attachment && (

                                                                    <div className="flex items-center gap-1 mt-1">

                                                                        <Paperclip
                                                                            size={12}
                                                                            className="text-gray-400"
                                                                        />

                                                                        <span className="text-xs text-gray-400">

                                                                            Attachment

                                                                        </span>

                                                                    </div>

                                                                )

                                                            }

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">

                                                        {hw.subject}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4 text-gray-600">

                                                    Std {hw.standard} - {hw.division}

                                                </td>

                                                <td className="px-6 py-4 text-gray-600">

                                                    {hw.teacherId?.fullName || "-"}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className={`font-semibold ${
                                                            isOverdue(hw.dueDate, hw.status)
                                                                ? "text-red-600"
                                                                : "text-gray-700"
                                                        }`}>

                                                            {

                                                                new Date(hw.dueDate).toLocaleDateString(

                                                                    undefined,

                                                                    {

                                                                        day: "2-digit",

                                                                        month: "short",

                                                                        year: "numeric"

                                                                    }

                                                                )

                                                            }

                                                        </p>

                                                        {

                                                            isOverdue(hw.dueDate, hw.status) && (

                                                                <p className="text-xs text-red-500 mt-1">

                                                                    Overdue

                                                                </p>

                                                            )

                                                        }

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[hw.status]}`}>

                                                        {hw.status}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center justify-center gap-2">

                                                        <button
                                                            onClick={() =>
                                                                navigate(`/homework/${hw._id}`)
                                                            }
                                                            className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition"
                                                        >

                                                            View

                                                        </button>

                                                        {

                                                            (user?.role === "admin" ||
                                                             user?.role === "teacher") && (

                                                                <>

                                                                    <button
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/homework/edit/${hw._id}`
                                                                            )
                                                                        }
                                                                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition"
                                                                    >

                                                                        Edit

                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            handleDelete(hw._id)
                                                                        }
                                                                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                                                                    >

                                                                        Delete

                                                                    </button>

                                                                </>

                                                            )

                                                        }

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    )

                                }

                            </tbody>

                        </table>

                    )

                }

            </div>

        </div>

    );

};

export default HomeworkList;