import { useEffect, useState } from "react";
import { History, Filter, RefreshCw } from "lucide-react";

import { getClasses } from "../../services/classService";
import { getAttendanceHistory } from "../../services/attendanceService";

const STATUS_STYLE = {

    Present: "bg-green-100 text-green-700",

    Absent: "bg-red-100 text-red-700",

    Late: "bg-yellow-100 text-yellow-700",

    Leave: "bg-blue-100 text-blue-700"

};

const MONTHS = [

    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"

];

const currentYear = new Date().getFullYear();

const YEARS = [currentYear, currentYear - 1, currentYear - 2];

const AttendanceHistory = () => {

    const [classes, setClasses] = useState([]);

    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({

        standard: "",

        division: "",

        month: "",

        year: String(currentYear),

        status: ""

    });

    useEffect(() => {

        loadClasses();

        loadHistory();

    }, []);

    const loadClasses = async () => {

        try {

            const response = await getClasses();

            setClasses(response.classes || []);

        } catch (error) {

            console.log(error);

        }

    };

    const loadHistory = async () => {

        try {

            setLoading(true);

            const response = await getAttendanceHistory(filters);

            setRecords(response.records || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleFilterChange = (key, value) => {

        setFilters({

            ...filters,

            [key]: value,

            ...(key === "standard" ? { division: "" } : {})

        });

    };

    const handleReset = () => {

        const resetFilters = {

            standard: "",

            division: "",

            month: "",

            year: String(currentYear),

            status: ""

        };

        setFilters(resetFilters);

    };

    const divisionsForStandard = [

        ...new Set(

            classes

                .filter((c) => String(c.standard) === String(filters.standard))

                .map((c) => c.division)

        )

    ];

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-slate-800">

                    Attendance History

                </h1>

                <p className="mt-2 text-slate-500">

                    Browse and filter past attendance records.

                </p>

            </div>

            {/* ===================== Filters ===================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-7">

                <div className="flex items-center gap-2 mb-5">

                    <Filter
                        size={18}
                        className="text-gray-500"
                    />

                    <h2 className="font-semibold text-gray-700">

                        Filters

                    </h2>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                    <select
                        value={filters.standard}
                        onChange={(e) => handleFilterChange("standard", e.target.value)}
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
                        onChange={(e) => handleFilterChange("division", e.target.value)}
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
                        value={filters.month}
                        onChange={(e) => handleFilterChange("month", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Months</option>

                        {

                            MONTHS.map((month, index) => (

                                <option key={month} value={index + 1}>

                                    {month}

                                </option>

                            ))

                        }

                    </select>

                    <select
                        value={filters.year}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        {

                            YEARS.map((year) => (

                                <option key={year} value={year}>

                                    {year}

                                </option>

                            ))

                        }

                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Status</option>

                        <option value="Present">Present</option>

                        <option value="Absent">Absent</option>

                        <option value="Late">Late</option>

                        <option value="Leave">Leave</option>

                    </select>

                </div>

                <div className="flex justify-end gap-3 mt-5">

                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition"
                    >

                        <RefreshCw size={18} />

                        Reset

                    </button>

                    <button
                        onClick={loadHistory}
                        className="px-6 py-2 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white font-semibold transition"
                    >

                        Apply Filters

                    </button>

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

                                        Date

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Student

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Class

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Status

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Remarks

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    records.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="text-center py-16"
                                            >

                                                <History
                                                    size={56}
                                                    className="mx-auto text-gray-300 mb-4"
                                                />

                                                <h2 className="text-xl font-semibold text-gray-600">

                                                    No Records Found

                                                </h2>

                                                <p className="text-gray-400 mt-2">

                                                    Try adjusting your filters.

                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        records.map((record, index) => (

                                            <tr
                                                key={index}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

                                                <td className="px-6 py-4 text-gray-600">

                                                    {

                                                        new Date(record.date).toLocaleDateString(

                                                            undefined,

                                                            {

                                                                day: "2-digit",

                                                                month: "short",

                                                                year: "numeric"

                                                            }

                                                        )

                                                    }

                                                </td>

                                                <td className="px-6 py-4">

                                                    <p className="font-semibold text-gray-800">

                                                        {record.fullName}

                                                    </p>

                                                    <p className="text-sm text-gray-500">

                                                        GR : {record.grNumber}

                                                    </p>

                                                </td>

                                                <td className="px-6 py-4">

                                                    Std {record.standard} - {record.division}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[record.status]}`}
                                                    >

                                                        {record.status}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4 text-gray-500">

                                                    {record.remarks || "-"}

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

export default AttendanceHistory;