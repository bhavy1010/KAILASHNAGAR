import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
    BookOpen,
    Search,
    RefreshCw,
    ArrowUpDown
} from "lucide-react";

import { getClasses } from "../../services/classService";
import { getClassAttendanceReport } from "../../services/attendanceService";

const MONTHS = [

    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"

];

const now = new Date();

const ClassAttendanceReport = () => {

    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);

    const [standard, setStandard] = useState("");

    const [division, setDivision] = useState("");

    const [month, setMonth] = useState(now.getMonth() + 1);

    const [year, setYear] = useState(now.getFullYear());

    const [students, setStudents] = useState([]);

    const [totalDays, setTotalDays] = useState(0);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [sortKey, setSortKey] = useState("attendancePercent");

    const [sortAsc, setSortAsc] = useState(false);

    useEffect(() => {

        loadClasses();

    }, []);

    const loadClasses = async () => {

        try {

            const response = await getClasses();

            setClasses(response.classes || []);

        } catch (error) {

            console.log(error);

        }

    };

    const divisionsForStandard = [

        ...new Set(

            classes

                .filter((c) => String(c.standard) === String(standard))

                .map((c) => c.division)

        )

    ];

    const handleLoad = async () => {

        if (!standard || !division) {

            alert("Please select Class and Division");

            return;

        }

        try {

            setLoading(true);

            const response = await getClassAttendanceReport(

                standard,

                division,

                month,

                year

            );

            setStudents(response.students || []);

            setTotalDays(response.totalDays || 0);

        } catch (error) {

            console.log(error);

            alert("Unable to load report");

        } finally {

            setLoading(false);

        }

    };

    const handleReset = () => {

        setStandard("");

        setDivision("");

        setMonth(now.getMonth() + 1);

        setYear(now.getFullYear());

        setStudents([]);

        setTotalDays(0);

        setSearch("");

    };

    const handleSort = (key) => {

        if (sortKey === key) {

            setSortAsc(!sortAsc);

        } else {

            setSortKey(key);

            setSortAsc(false);

        }

    };

    const filteredStudents = students

        .filter((s) =>

            search

                ? s.fullName.toLowerCase().includes(search.toLowerCase()) ||

                  s.grNumber.toLowerCase().includes(search.toLowerCase())

                : true

        )

        .sort((a, b) => {

            const valA = a[sortKey];

            const valB = b[sortKey];

            if (typeof valA === "string") {

                return sortAsc

                    ? valA.localeCompare(valB)

                    : valB.localeCompare(valA);

            }

            return sortAsc ? valA - valB : valB - valA;

        });

    const classAvg =
        students.length > 0
            ? Math.round(
                  students.reduce((sum, s) => sum + s.attendancePercent, 0) /
                      students.length
              )
            : 0;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-slate-800">

                    Class Attendance Report

                </h1>

                <p className="mt-2 text-slate-500">

                    Monthly attendance summary for a class.

                </p>

            </div>

            {/* ===================== Selector Card ===================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

                    <div>

                        <label className="mb-2 block font-medium">

                            Class

                        </label>

                        <select
                            value={standard}
                            onChange={(e) => {

                                setStandard(e.target.value);

                                setDivision("");

                            }}
                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                        >

                            <option value="">Select Class</option>

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

                    </div>

                    <div>

                        <label className="mb-2 block font-medium">

                            Division

                        </label>

                        <select
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            disabled={!standard}
                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] disabled:bg-gray-100"
                        >

                            <option value="">Select Division</option>

                            {

                                divisionsForStandard.map((div) => (

                                    <option key={div} value={div}>

                                        {div}

                                    </option>

                                ))

                            }

                        </select>

                    </div>

                    <div>

                        <label className="mb-2 block font-medium">

                            Month

                        </label>

                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                        >

                            {

                                MONTHS.map((m, index) => (

                                    <option key={m} value={index + 1}>

                                        {m}

                                    </option>

                                ))

                            }

                        </select>

                    </div>

                    <div>

                        <label className="mb-2 block font-medium">

                            Year

                        </label>

                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                        >

                            {

                                [now.getFullYear(), now.getFullYear() - 1].map((y) => (

                                    <option key={y} value={y}>

                                        {y}

                                    </option>

                                ))

                            }

                        </select>

                    </div>

                    <div className="flex gap-3">

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 h-12 px-4 rounded-xl bg-gray-700 hover:bg-gray-800 text-white transition"
                        >

                            <RefreshCw size={16} />

                        </button>

                        <button
                            onClick={handleLoad}
                            disabled={loading}
                            className="flex-1 h-12 rounded-xl bg-[#5B2EFF] text-white font-semibold hover:bg-[#4724db] transition disabled:opacity-60"
                        >

                            {loading ? "Loading..." : "Load Report"}

                        </button>

                    </div>

                </div>

            </div>

            {

                students.length > 0 && (

                    <>

                        {/* ===================== Summary Bar ===================== */}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-7">

                            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">

                                <p className="text-gray-500 text-sm">

                                    Class

                                </p>

                                <h3 className="text-xl font-bold mt-2">

                                    Std {standard} - {division}

                                </h3>

                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">

                                <p className="text-gray-500 text-sm">

                                    Total Students

                                </p>

                                <h3 className="text-xl font-bold mt-2">

                                    {students.length}

                                </h3>

                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">

                                <p className="text-gray-500 text-sm">

                                    Working Days

                                </p>

                                <h3 className="text-xl font-bold mt-2">

                                    {totalDays}

                                </h3>

                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">

                                <p className="text-gray-500 text-sm">

                                    Class Average

                                </p>

                                <h3

                                    className={`text-xl font-bold mt-2 ${

                                        classAvg >= 90

                                            ? "text-green-600"

                                            : classAvg >= 75

                                            ? "text-yellow-600"

                                            : "text-red-600"

                                    }`}

                                >

                                    {classAvg}%

                                </h3>

                            </div>

                        </div>

                        {/* ===================== Search ===================== */}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-5">

                            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4">

                                <Search size={18} className="text-gray-500" />

                                <input
                                    type="text"
                                    placeholder="Search student by name or GR..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 bg-transparent py-3 outline-none"
                                />

                            </div>

                        </div>

                        {/* ===================== Table ===================== */}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                            <table className="w-full">

                                <thead className="bg-gray-100">

                                    <tr>

                                        <th className="text-left px-6 py-4">

                                            Student

                                        </th>

                                        {

                                            [

                                                { key: "present", label: "Present" },

                                                { key: "absent", label: "Absent" },

                                                { key: "late", label: "Late" },

                                                { key: "leave", label: "Leave" },

                                                { key: "attendancePercent", label: "Attendance %" }

                                            ].map((col) => (

                                                <th
                                                    key={col.key}
                                                    className="text-left px-6 py-4 cursor-pointer hover:bg-gray-200 transition"
                                                    onClick={() => handleSort(col.key)}
                                                >

                                                    <div className="flex items-center gap-2">

                                                        {col.label}

                                                        <ArrowUpDown size={14} className="text-gray-400" />

                                                    </div>

                                                </th>

                                            ))

                                        }

                                        <th className="text-left px-6 py-4">

                                            Details

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        filteredStudents.map((student) => (

                                            <tr
                                                key={student.studentId}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

                                                <td className="px-6 py-4">

                                                    <p className="font-semibold text-gray-800">

                                                        {student.fullName}

                                                    </p>

                                                    <p className="text-sm text-gray-500">

                                                        GR : {student.grNumber}

                                                    </p>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">

                                                        {student.present}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">

                                                        {student.absent}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">

                                                        {student.late}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">

                                                        {student.leave}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex-1 h-2 rounded-full bg-gray-100 w-24 overflow-hidden">

                                                            <div
                                                                className={`h-full rounded-full ${

                                                                    student.attendancePercent >= 90

                                                                        ? "bg-green-500"

                                                                        : student.attendancePercent >= 75

                                                                        ? "bg-yellow-500"

                                                                        : "bg-red-500"

                                                                }`}
                                                                style={{ width: `${student.attendancePercent}%` }}
                                                            ></div>

                                                        </div>

                                                        <span

                                                            className={`font-bold text-sm ${

                                                                student.attendancePercent >= 90

                                                                    ? "text-green-600"

                                                                    : student.attendancePercent >= 75

                                                                    ? "text-yellow-600"

                                                                    : "text-red-600"

                                                            }`}

                                                        >

                                                            {student.attendancePercent}%

                                                        </span>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/attendance/student/${student.studentId}`
                                                            )
                                                        }
                                                        className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm transition"
                                                    >

                                                        View

                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    }

                                </tbody>

                            </table>

                        </div>

                    </>

                )

            }

            {

                students.length === 0 && !loading && (

                    <div className="bg-white rounded-3xl p-16 text-center shadow">

                        <BookOpen
                            size={56}
                            className="mx-auto text-gray-300 mb-4"
                        />

                        <h2 className="text-xl font-semibold text-gray-600">

                            No Report Loaded

                        </h2>

                        <p className="text-gray-400 mt-2">

                            Select class, division and month, then click Load Report.

                        </p>

                    </div>

                )

            }

        </div>

    );

};

export default ClassAttendanceReport;