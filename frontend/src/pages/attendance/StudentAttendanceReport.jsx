import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    UserCheck,
    UserX,
    Clock,
    Plane,
    Percent
} from "lucide-react";

import { getStudentById } from "../../services/studentService";

import {
    getStudentAttendanceReport,
    getCalendarAttendance
} from "../../services/attendanceService";

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

const MONTHS = [

    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"

];

const now = new Date();

const StudentAttendanceReport = () => {

    const { studentId } = useParams();

    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [summary, setSummary] = useState(null);

    const [history, setHistory] = useState([]);

    const [calendarDays, setCalendarDays] = useState({});

    const [month, setMonth] = useState(now.getMonth() + 1);

    const [year, setYear] = useState(now.getFullYear());

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadStudent();

    }, []);

    useEffect(() => {

        loadReport();

    }, [month, year]);

    const loadStudent = async () => {

        try {

            const response = await getStudentById(studentId);

            setStudent(response.student);

        } catch (error) {

            console.log(error);

        }

    };

    const loadReport = async () => {

        try {

            setLoading(true);

            const [reportResponse, calendarResponse] = await Promise.all([

                getStudentAttendanceReport(studentId, month, year),

                getCalendarAttendance(studentId, month, year)

            ]);

            setSummary(reportResponse.summary);

            setHistory(reportResponse.history || []);

            setCalendarDays(calendarResponse.days || {});

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const daysInMonth = new Date(year, month, 0).getDate();

    const firstDayOffset = new Date(year, month - 1, 1).getDay();

    const calendarCells = [

        ...Array(firstDayOffset).fill(null),

        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)

    ];

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition"
            >

                <ArrowLeft size={18} />

                Back

            </button>

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">

                        Attendance Report

                    </h1>

                    <p className="mt-2 text-slate-500">

                        {

                            student
                                ? `${student.fullName} — Std ${student.standard} - ${student.division}`
                                : "Loading student..."

                        }

                    </p>

                </div>

                <div className="flex gap-3">

                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border rounded-xl px-4 py-3 outline-none bg-white"
                    >

                        {

                            MONTHS.map((m, index) => (

                                <option key={m} value={index + 1}>

                                    {m}

                                </option>

                            ))

                        }

                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border rounded-xl px-4 py-3 outline-none bg-white"
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

            </div>

            {

                loading ? (

                    <div className="py-20 flex justify-center">

                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

                    </div>

                ) : (

                    <>

                        {/* ===================== Summary Cards ===================== */}

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">

                            <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 border border-purple-100 shadow">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-purple-600 font-semibold text-sm">

                                            Attendance

                                        </p>

                                        <h2 className="text-3xl font-bold mt-2">

                                            {summary.attendancePercent}%

                                        </h2>

                                    </div>

                                    <Percent className="text-purple-500" size={30} />

                                </div>

                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 border border-green-100 shadow">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-green-600 font-semibold text-sm">

                                            Present

                                        </p>

                                        <h2 className="text-3xl font-bold mt-2">

                                            {summary.present}

                                        </h2>

                                    </div>

                                    <UserCheck className="text-green-500" size={30} />

                                </div>

                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl p-6 border border-red-100 shadow">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-red-600 font-semibold text-sm">

                                            Absent

                                        </p>

                                        <h2 className="text-3xl font-bold mt-2">

                                            {summary.absent}

                                        </h2>

                                    </div>

                                    <UserX className="text-red-500" size={30} />

                                </div>

                            </div>

                            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-3xl p-6 border border-yellow-100 shadow">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-yellow-600 font-semibold text-sm">

                                            Late

                                        </p>

                                        <h2 className="text-3xl font-bold mt-2">

                                            {summary.late}

                                        </h2>

                                    </div>

                                    <Clock className="text-yellow-500" size={30} />

                                </div>

                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 border border-blue-100 shadow">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-blue-600 font-semibold text-sm">

                                            Leave

                                        </p>

                                        <h2 className="text-3xl font-bold mt-2">

                                            {summary.leave}

                                        </h2>

                                    </div>

                                    <Plane className="text-blue-500" size={30} />

                                </div>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">

                            {/* ===================== Monthly Breakdown Chart ===================== */}

                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                                <h2 className="text-xl font-bold mb-8">

                                    Monthly Breakdown

                                </h2>

                                {

                                    summary.total === 0 ? (

                                        <p className="text-gray-400 text-center py-10">

                                            No attendance recorded this month

                                        </p>

                                    ) : (

                                        <div className="space-y-6">

                                            {

                                                [

                                                    { label: "Present", value: summary.present, color: "bg-green-500" },
                                                    { label: "Absent", value: summary.absent, color: "bg-red-500" },
                                                    { label: "Late", value: summary.late, color: "bg-yellow-500" },
                                                    { label: "Leave", value: summary.leave, color: "bg-blue-500" }

                                                ].map((item) => {

                                                    const percent = summary.total > 0
                                                        ? Math.round((item.value / summary.total) * 100)
                                                        : 0;

                                                    return (

                                                        <div key={item.label}>

                                                            <div className="flex justify-between mb-2">

                                                                <span className="font-semibold text-gray-700">

                                                                    {item.label} ({item.value})

                                                                </span>

                                                                <span className="font-semibold text-gray-700">

                                                                    {percent}%

                                                                </span>

                                                            </div>

                                                            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">

                                                                <div
                                                                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                                                    style={{ width: `${percent}%` }}
                                                                ></div>

                                                            </div>

                                                        </div>

                                                    );

                                                })

                                            }

                                        </div>

                                    )

                                }

                            </div>

                            {/* ===================== Calendar ===================== */}

                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                                <h2 className="text-xl font-bold mb-8">

                                    Calendar View

                                </h2>

                                <div className="grid grid-cols-7 gap-2 mb-3">

                                    {

                                        ["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (

                                            <div
                                                key={i}
                                                className="text-center text-xs font-semibold text-gray-400"
                                            >

                                                {d}

                                            </div>

                                        ))

                                    }

                                </div>

                                <div className="grid grid-cols-7 gap-2">

                                    {

                                        calendarCells.map((day, index) => {

                                            if (!day) {

                                                return <div key={index}></div>;

                                            }

                                            const status = calendarDays[day];

                                            return (

                                                <div
                                                    key={index}
                                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold ${

                                                        status
                                                            ? `${STATUS_DOT[status]} text-white`
                                                            : "bg-gray-50 text-gray-400"

                                                    }`}
                                                >

                                                    {day}

                                                </div>

                                            );

                                        })

                                    }

                                </div>

                                <div className="flex flex-wrap gap-4 mt-8">

                                    {

                                        Object.entries(STATUS_DOT).map(([status, color]) => (

                                            <div
                                                key={status}
                                                className="flex items-center gap-2"
                                            >

                                                <div className={`w-3 h-3 rounded-full ${color}`}></div>

                                                <span className="text-sm text-gray-600">

                                                    {status}

                                                </span>

                                            </div>

                                        ))

                                    }

                                </div>

                            </div>

                        </div>

                        {/* ===================== Recent History Table ===================== */}

                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 mt-7 overflow-hidden">

                            <div className="p-7 border-b">

                                <h2 className="text-xl font-bold">

                                    Day-wise Records

                                </h2>

                            </div>

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-6 py-4">

                                            Date

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

                                        history.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="3"
                                                    className="text-center py-12 text-gray-400"
                                                >

                                                    No records for this month

                                                </td>

                                            </tr>

                                        ) : (

                                            [...history].reverse().map((record, index) => (

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

                        </div>

                    </>

                )

            }

        </div>

    );

};

export default StudentAttendanceReport;