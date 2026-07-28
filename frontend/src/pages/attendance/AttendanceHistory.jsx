import { useEffect, useState } from "react";
import {
    Download,
    Filter,
    History,
    Loader2,
    RefreshCw
} from "lucide-react";

import { getStudents } from "../../services/studentService";
import {
    downloadAttendanceExcel,
    getAttendanceHistory
} from "../../services/attendanceService";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_STYLE = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-yellow-100 text-yellow-700",
    Leave: "bg-blue-100 text-blue-700"
};

const MONTHS_EN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const MONTHS_GU = [
    "જાન્યુઆરી",
    "ફેબ્રુઆરી",
    "માર્ચ",
    "એપ્રિલ",
    "મે",
    "જૂન",
    "જુલાઈ",
    "ઓગસ્ટ",
    "સપ્ટેમ્બર",
    "ઓક્ટોબર",
    "નવેમ્બર",
    "ડિસેમ્બર"
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

const AttendanceHistory = () => {
    const { language } = useLanguage();
    const isGujarati = language === "gu";

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

    const text = {
        title: isGujarati ? "હાજરીનો ઇતિહાસ" : "Attendance History",
        subtitle: isGujarati
            ? "હાજરીના રેકોર્ડ જુઓ, ફિલ્ટર કરો અને Excel ડાઉનલોડ કરો."
            : "Browse, filter and download attendance records.",
        downloadExcel: isGujarati ? "Excel ડાઉનલોડ કરો" : "Download Excel",
        preparingExcel: isGujarati ? "Excel તૈયાર થઈ રહી છે..." : "Preparing Excel...",
        filters: isGujarati ? "ફિલ્ટર" : "Filters",
        allClasses: isGujarati ? "બધા વર્ગો" : "All Classes",
        allDivisions: isGujarati ? "બધા વિભાગો" : "All Divisions",
        allMonths: isGujarati ? "બધા મહિના" : "All Months",
        allStatus: isGujarati ? "બધી સ્થિતિ" : "All Status",
        present: isGujarati ? "હાજર" : "Present",
        absent: isGujarati ? "ગેરહાજર" : "Absent",
        late: isGujarati ? "મોડા" : "Late",
        leave: isGujarati ? "રજા" : "Leave",
        reset: isGujarati ? "રીસેટ" : "Reset",
        applyFilters: isGujarati ? "ફિલ્ટર લાગુ કરો" : "Apply Filters",
        date: isGujarati ? "તારીખ" : "Date",
        student: isGujarati ? "વિદ્યાર્થી" : "Student",
        class: isGujarati ? "વર્ગ" : "Class",
        status: isGujarati ? "સ્થિતિ" : "Status",
        remarks: isGujarati ? "નોંધ" : "Remarks",
        noRecords: isGujarati ? "કોઈ રેકોર્ડ મળ્યો નથી" : "No Records Found",
        noRecordsText: isGujarati
            ? "તમારા ફિલ્ટરમાં ફેરફાર કરીને ફરી પ્રયાસ કરો."
            : "Try adjusting your filters.",
        unableDownload: isGujarati
            ? "હાજરીની Excel ફાઇલ ડાઉનલોડ થઈ શકી નથી."
            : "Unable to download attendance Excel file."
    };

    const statusLabel = {
        Present: text.present,
        Absent: text.absent,
        Late: text.late,
        Leave: text.leave
    };

    const months = isGujarati ? MONTHS_GU : MONTHS_EN;

    useEffect(() => {
        loadClasses();
        loadHistory();
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

    const loadHistory = async () => {
        try {
            setLoading(true);

            const response = await getAttendanceHistory(filters);
            setRecords(response?.records || []);
        } catch (error) {
            console.log(error);
            setRecords([]);
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
                error.response?.data?.message || text.unableDownload
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
                        String(item.standard) === String(filters.standard)
                )
                .map((item) => item.division)
        )
    ];

    const formatDate = (record) => {
        const attendanceDate = record.date || record.attendanceDate;

        if (!attendanceDate) return "-";

        return new Date(attendanceDate).toLocaleDateString(
            isGujarati ? "gu-IN" : "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                <button
                    onClick={handleDownloadExcel}
                    disabled={downloading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {downloading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            {text.preparingExcel}
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            {text.downloadExcel}
                        </>
                    )}
                </button>
            </div>

            <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                    <Filter size={18} className="text-slate-500" />

                    <h2 className="font-semibold text-slate-700">
                        {text.filters}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                            .map((standard) => (
                                <option key={standard} value={standard}>
                                    {isGujarati
                                        ? `${standard} ધોરણ`
                                        : `Std ${standard}`}
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
                        value={filters.month}
                        onChange={(event) =>
                            handleFilterChange("month", event.target.value)
                        }
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allMonths}</option>

                        {months.map((month, index) => (
                            <option key={index + 1} value={index + 1}>
                                {month}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.year}
                        onChange={(event) =>
                            handleFilterChange("year", event.target.value)
                        }
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        {YEARS.map((year) => (
                            <option key={year} value={year}>
                                {year}
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
                        <option value="Present">{text.present}</option>
                        <option value="Absent">{text.absent}</option>
                        <option value="Late">{text.late}</option>
                        <option value="Leave">{text.leave}</option>
                    </select>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                        <RefreshCw size={18} />
                        {text.reset}
                    </button>

                    <button
                        onClick={loadHistory}
                        className="rounded-xl bg-[#5B2EFF] px-6 py-3 font-semibold text-white transition hover:bg-[#4724db]"
                    >
                        {text.applyFilters}
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-72 items-center justify-center">
                        <Loader2
                            size={38}
                            className="animate-spin text-[#5B2EFF]"
                        />
                    </div>
                ) : records.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <History
                            size={56}
                            className="mx-auto mb-4 text-slate-300"
                        />

                        <h2 className="text-xl font-semibold text-slate-600">
                            {text.noRecords}
                        </h2>

                        <p className="mt-2 text-sm text-slate-400 sm:text-base">
                            {text.noRecordsText}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[760px]">
                                <thead className="bg-slate-100">
                                    <tr>
                                        {[text.date, text.student, text.class, text.status, text.remarks].map(
                                            (title) => (
                                                <th
                                                    key={title}
                                                    className="px-6 py-4 text-left text-sm font-bold text-slate-700"
                                                >
                                                    {title}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.map((record, index) => (
                                        <tr
                                            key={record._id || `${record.studentId}-${index}`}
                                            className="border-t border-slate-100 transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4 text-slate-600">
                                                {formatDate(record)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {record.fullName}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    GR: {record.grNumber}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {isGujarati
                                                    ? `${record.standard} ધોરણ - ${record.division}`
                                                    : `Std ${record.standard} - ${record.division}`}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        STATUS_STYLE[record.status] ||
                                                        "bg-slate-100 text-slate-700"
                                                    }`}
                                                >
                                                    {statusLabel[record.status] ||
                                                        record.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-slate-500">
                                                {record.remarks || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 lg:hidden">
                            {records.map((record, index) => (
                                <div
                                    key={record._id || `${record.studentId}-${index}`}
                                    className="p-4 sm:p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-800">
                                                {record.fullName}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                GR: {record.grNumber}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                STATUS_STYLE[record.status] ||
                                                "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {statusLabel[record.status] || record.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-400">{text.date}</p>
                                            <p className="mt-1 font-medium text-slate-700">
                                                {formatDate(record)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-slate-400">{text.class}</p>
                                            <p className="mt-1 font-medium text-slate-700">
                                                {isGujarati
                                                    ? `${record.standard} ધોરણ - ${record.division}`
                                                    : `Std ${record.standard} - ${record.division}`}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-slate-400">{text.remarks}</p>
                                            <p className="mt-1 break-words font-medium text-slate-700">
                                                {record.remarks || "-"}
                                            </p>
                                        </div>
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

export default AttendanceHistory;