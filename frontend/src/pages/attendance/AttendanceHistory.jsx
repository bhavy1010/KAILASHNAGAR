import { useEffect, useState } from "react";
import {
    Download,
    Filter,
    History,
    Loader2,
    RefreshCw
} from "lucide-react";

import { getClasses } from "../../services/classService";
import {
    downloadAttendanceExcel,
    getAttendanceHistory
} from "../../services/attendanceService";

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
    const [downloading, setDownloading] = useState(false);

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
        setFilters({
            standard: "",
            division: "",
            month: "",
            year: String(currentYear),
            status: ""
        });
    };

    const handleDownloadExcel = async () => {
        try {
            setDownloading(true);

            await downloadAttendanceExcel(filters);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Unable to download attendance Excel file."
            );
        } finally {
            setDownloading(false);
        }
    };

    const divisionsForStandard = [
        ...new Set(
            classes
                .filter(
                    (item) =>
                        String(item.standard) ===
                        String(filters.standard)
                )
                .map((item) => item.division)
        )
    ];

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        Attendance History
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Browse, filter and download attendance records.
                    </p>
                </div>

                <button
                    onClick={handleDownloadExcel}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {downloading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Preparing Excel...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Download Excel
                        </>
                    )}
                </button>
            </div>

            <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                    <Filter size={18} className="text-gray-500" />

                    <h2 className="font-semibold text-gray-700">
                        Filters
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <select
                        value={filters.standard}
                        onChange={(e) =>
                            handleFilterChange(
                                "standard",
                                e.target.value
                            )
                        }
                        className="rounded-xl border px-4 py-3 outline-none focus:border-[#5B2EFF]"
                    >
                        <option value="">All Classes</option>

                        {[...new Set(classes.map((item) => item.standard))]
                            .sort((a, b) => a - b)
                            .map((standard) => (
                                <option
                                    key={standard}
                                    value={standard}
                                >
                                    Std {standard}
                                </option>
                            ))}
                    </select>

                    <select
                        value={filters.division}
                        onChange={(e) =>
                            handleFilterChange(
                                "division",
                                e.target.value
                            )
                        }
                        disabled={!filters.standard}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-[#5B2EFF] disabled:bg-gray-100"
                    >
                        <option value="">All Divisions</option>

                        {divisionsForStandard.map((division) => (
                            <option key={division} value={division}>
                                {division}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.month}
                        onChange={(e) =>
                            handleFilterChange("month", e.target.value)
                        }
                        className="rounded-xl border px-4 py-3 outline-none focus:border-[#5B2EFF]"
                    >
                        <option value="">All Months</option>

                        {MONTHS.map((month, index) => (
                            <option key={month} value={index + 1}>
                                {month}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.year}
                        onChange={(e) =>
                            handleFilterChange("year", e.target.value)
                        }
                        className="rounded-xl border px-4 py-3 outline-none focus:border-[#5B2EFF]"
                    >
                        {YEARS.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                        }
                        className="rounded-xl border px-4 py-3 outline-none focus:border-[#5B2EFF]"
                    >
                        <option value="">All Status</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Leave">Leave</option>
                    </select>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-xl bg-gray-700 px-5 py-2.5 text-white transition hover:bg-gray-800"
                    >
                        <RefreshCw size={18} />
                        Reset
                    </button>

                    <button
                        onClick={loadHistory}
                        className="rounded-xl bg-[#5B2EFF] px-6 py-2.5 font-semibold text-white transition hover:bg-[#4724db]"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2
                            size={38}
                            className="animate-spin text-[#5B2EFF]"
                        />
                    </div>
                ) : (
                    <table className="w-full min-w-[760px]">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "Date",
                                    "Student",
                                    "Class",
                                    "Status",
                                    "Remarks"
                                ].map((title) => (
                                    <th
                                        key={title}
                                        className="px-6 py-4 text-left text-sm font-bold text-gray-700"
                                    >
                                        {title}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-16 text-center"
                                    >
                                        <History
                                            size={56}
                                            className="mx-auto mb-4 text-gray-300"
                                        />

                                        <h2 className="text-xl font-semibold text-gray-600">
                                            No Records Found
                                        </h2>

                                        <p className="mt-2 text-gray-400">
                                            Try adjusting your filters.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                records.map((record, index) => (
                                    <tr
                                        key={record._id || index}
                                        className="border-t transition hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(
                                                record.date
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                }
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800">
                                                {record.fullName}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                GR: {record.grNumber}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            Std {record.standard} -{" "}
                                            {record.division}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    STATUS_STYLE[
                                                        record.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {record.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-gray-500">
                                            {record.remarks || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;