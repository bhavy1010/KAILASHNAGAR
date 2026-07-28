import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    UserCheck,
    UserX,
    Clock,
    Plane,
    Percent,
    Loader2
} from "lucide-react";

import { getStudentById } from "../../services/studentService";
import {
    getStudentAttendanceReport,
    getCalendarAttendance
} from "../../services/attendanceService";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_DOT = {
    Present: "bg-green-500",
    Absent: "bg-red-500",
    Late: "bg-yellow-500",
    Leave: "bg-blue-500"
};

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

const WEEK_DAYS_EN = ["S", "M", "T", "W", "T", "F", "S"];
const WEEK_DAYS_GU = ["ર", "સો", "મં", "બુ", "ગુ", "શુ", "શ"];

const now = new Date();

const StudentAttendanceReport = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [student, setStudent] = useState(null);
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [calendarDays, setCalendarDays] = useState({});
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [loading, setLoading] = useState(true);

    const text = {
        back: isGujarati ? "પાછળ" : "Back",
        title: isGujarati ? "હાજરી રિપોર્ટ" : "Attendance Report",
        loadingStudent: isGujarati
            ? "વિદ્યાર્થી લોડ થઈ રહ્યો છે..."
            : "Loading student...",
        attendance: isGujarati ? "હાજરી" : "Attendance",
        present: isGujarati ? "હાજર" : "Present",
        absent: isGujarati ? "ગેરહાજર" : "Absent",
        late: isGujarati ? "મોડા" : "Late",
        leave: isGujarati ? "રજા" : "Leave",
        monthlyBreakdown: isGujarati
            ? "માસિક હાજરીનો વિગતવાર અહેવાલ"
            : "Monthly Breakdown",
        noAttendance: isGujarati
            ? "આ મહિને હાજરી નોંધાઈ નથી."
            : "No attendance recorded this month",
        calendarView: isGujarati ? "કેલેન્ડર વ્યૂ" : "Calendar View",
        dayWise: isGujarati ? "દિવસ મુજબના રેકોર્ડ" : "Day-wise Records",
        date: isGujarati ? "તારીખ" : "Date",
        status: isGujarati ? "સ્થિતિ" : "Status",
        remarks: isGujarati ? "નોંધ" : "Remarks",
        noRecords: isGujarati
            ? "આ મહિના માટે કોઈ રેકોર્ડ નથી."
            : "No records for this month",
        loading: isGujarati
            ? "હાજરી રિપોર્ટ લોડ થઈ રહ્યો છે..."
            : "Loading attendance report..."
    };

    const statusLabel = {
        Present: text.present,
        Absent: text.absent,
        Late: text.late,
        Leave: text.leave
    };

    const months = isGujarati ? MONTHS_GU : MONTHS_EN;
    const weekDays = isGujarati ? WEEK_DAYS_GU : WEEK_DAYS_EN;

    useEffect(() => {
        loadStudent();
    }, [studentId]);

    useEffect(() => {
        loadReport();
    }, [studentId, month, year]);

    const loadStudent = async () => {
        try {
            const response = await getStudentById(studentId);
            setStudent(response?.student || null);
        } catch (error) {
            console.log(error);
            setStudent(null);
        }
    };

    const loadReport = async () => {
        try {
            setLoading(true);

            const [reportResponse, calendarResponse] = await Promise.all([
                getStudentAttendanceReport(studentId, month, year),
                getCalendarAttendance(studentId, month, year)
            ]);

            setSummary(reportResponse?.summary || {});
            setHistory(reportResponse?.history || []);
            setCalendarDays(calendarResponse?.days || {});
        } catch (error) {
            console.log(error);
            setSummary({});
            setHistory([]);
            setCalendarDays({});
        } finally {
            setLoading(false);
        }
    };

    const safeSummary = {
        total: Number(summary?.total || 0),
        present: Number(summary?.present || 0),
        absent: Number(summary?.absent || 0),
        late: Number(summary?.late || 0),
        leave: Number(summary?.leave || 0),
        attendancePercent: Number(summary?.attendancePercent || 0)
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOffset = new Date(year, month - 1, 1).getDay();

    const calendarCells = [
        ...Array(firstDayOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
    ];

    const breakdownItems = [
        {
            key: "Present",
            label: text.present,
            value: safeSummary.present,
            color: "bg-green-500"
        },
        {
            key: "Absent",
            label: text.absent,
            value: safeSummary.absent,
            color: "bg-red-500"
        },
        {
            key: "Late",
            label: text.late,
            value: safeSummary.late,
            color: "bg-yellow-500"
        },
        {
            key: "Leave",
            label: text.leave,
            value: safeSummary.leave,
            color: "bg-blue-500"
        }
    ];

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

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 font-medium text-slate-500 transition hover:text-[#5B2EFF]"
            >
                <ArrowLeft size={18} />
                {text.back}
            </button>

            <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {student
                            ? isGujarati
                                ? `${student.fullName} — ${student.standard} ધોરણ - ${student.division}`
                                : `${student.fullName} — Std ${student.standard} - ${student.division}`
                            : text.loadingStudent}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:w-auto">
                    <select
                        value={month}
                        onChange={(event) => setMonth(Number(event.target.value))}
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        {months.map((monthName, index) => (
                            <option key={index + 1} value={index + 1}>
                                {monthName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(event) => setYear(Number(event.target.value))}
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        {[now.getFullYear(), now.getFullYear() - 1].map(
                            (yearOption) => (
                                <option key={yearOption} value={yearOption}>
                                    {yearOption}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
                    <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                    <p className="font-medium text-slate-500">{text.loading}</p>
                </div>
            ) : (
                <>
                    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-purple-600">
                                        {text.attendance}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                        {safeSummary.attendancePercent}%
                                    </h2>
                                </div>

                                <Percent className="text-purple-500" size={30} />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-green-600">
                                        {text.present}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                        {safeSummary.present}
                                    </h2>
                                </div>

                                <UserCheck className="text-green-500" size={30} />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-red-600">
                                        {text.absent}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                        {safeSummary.absent}
                                    </h2>
                                </div>

                                <UserX className="text-red-500" size={30} />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-yellow-600">
                                        {text.late}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                        {safeSummary.late}
                                    </h2>
                                </div>

                                <Clock className="text-yellow-500" size={30} />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                        {text.leave}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                        {safeSummary.leave}
                                    </h2>
                                </div>

                                <Plane className="text-blue-500" size={30} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="mb-7 text-xl font-bold text-slate-800">
                                {text.monthlyBreakdown}
                            </h2>

                            {safeSummary.total === 0 ? (
                                <p className="py-10 text-center text-slate-400">
                                    {text.noAttendance}
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {breakdownItems.map((item) => {
                                        const percentage =
                                            safeSummary.total > 0
                                                ? Math.round(
                                                      (item.value /
                                                          safeSummary.total) *
                                                          100
                                                  )
                                                : 0;

                                        return (
                                            <div key={item.key}>
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <span className="font-semibold text-slate-700">
                                                        {item.label} ({item.value})
                                                    </span>

                                                    <span className="font-semibold text-slate-700">
                                                        {percentage}%
                                                    </span>
                                                </div>

                                                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                                        style={{
                                                            width: `${Math.min(
                                                                Math.max(percentage, 0),
                                                                100
                                                            )}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="mb-7 text-xl font-bold text-slate-800">
                                {text.calendarView}
                            </h2>

                            <div className="mb-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                                {weekDays.map((day, index) => (
                                    <div
                                        key={`${day}-${index}`}
                                        className="text-center text-[10px] font-semibold text-slate-400 sm:text-xs"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {calendarCells.map((day, index) => {
                                    if (!day) {
                                        return <div key={`blank-${index}`} />;
                                    }

                                    const status =
                                        calendarDays[day] ||
                                        calendarDays[String(day)];

                                    return (
                                        <div
                                            key={`day-${day}`}
                                            title={
                                                status
                                                    ? statusLabel[status] || status
                                                    : ""
                                            }
                                            className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold sm:rounded-xl sm:text-sm ${
                                                status
                                                    ? `${STATUS_DOT[status]} text-white`
                                                    : "bg-slate-50 text-slate-400"
                                            }`}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-3">
                                {Object.entries(STATUS_DOT).map(
                                    ([status, color]) => (
                                        <div
                                            key={status}
                                            className="flex items-center gap-2"
                                        >
                                            <div
                                                className={`h-3 w-3 rounded-full ${color}`}
                                            />

                                            <span className="text-sm text-slate-600">
                                                {statusLabel[status]}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5 sm:p-7">
                            <h2 className="text-xl font-bold text-slate-800">
                                {text.dayWise}
                            </h2>
                        </div>

                        {history.length === 0 ? (
                            <div className="py-12 text-center text-slate-400">
                                {text.noRecords}
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto sm:block">
                                    <table className="w-full min-w-[650px]">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                    {text.date}
                                                </th>

                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                    {text.status}
                                                </th>

                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                    {text.remarks}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {[...history]
                                                .reverse()
                                                .map((record, index) => (
                                                    <tr
                                                        key={
                                                            record._id ||
                                                            `${record.date}-${index}`
                                                        }
                                                        className="border-t border-slate-100 transition hover:bg-slate-50"
                                                    >
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {formatDate(
                                                                record.date ||
                                                                    record.attendanceDate
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    STATUS_STYLE[
                                                                        record.status
                                                                    ] ||
                                                                    "bg-slate-100 text-slate-700"
                                                                }`}
                                                            >
                                                                {statusLabel[
                                                                    record.status
                                                                ] || record.status}
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

                                <div className="divide-y divide-slate-100 sm:hidden">
                                    {[...history]
                                        .reverse()
                                        .map((record, index) => (
                                            <div
                                                key={
                                                    record._id ||
                                                    `${record.date}-${index}`
                                                }
                                                className="p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-semibold text-slate-700">
                                                        {formatDate(
                                                            record.date ||
                                                                record.attendanceDate
                                                        )}
                                                    </p>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            STATUS_STYLE[
                                                                record.status
                                                            ] ||
                                                            "bg-slate-100 text-slate-700"
                                                        }`}
                                                    >
                                                        {statusLabel[record.status] ||
                                                            record.status}
                                                    </span>
                                                </div>

                                                <p className="mt-3 break-words text-sm text-slate-500">
                                                    {record.remarks || "-"}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAttendanceReport;