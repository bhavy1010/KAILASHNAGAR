import { useEffect, useState } from "react";
import { Search, Calendar, UserCheck } from "lucide-react";

import { getTodayAttendance } from "../../services/attendanceService";

const STATUS_STYLE = {

    Present: "bg-green-100 text-green-700",

    Absent: "bg-red-100 text-red-700",

    Late: "bg-yellow-100 text-yellow-700",

    Leave: "bg-blue-100 text-blue-700"

};

const todayStr = () => new Date().toISOString().substring(0, 10);

const TodayAttendance = () => {

    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(true);

    const [date, setDate] = useState(todayStr());

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {

        loadRecords();

    }, [date]);

    const loadRecords = async () => {

        try {

            setLoading(true);

            const response = await getTodayAttendance(date);

            setRecords(response.records || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const filteredRecords = records.filter((record) => {

        const searchMatch = search

            ? record.fullName.toLowerCase().includes(search.toLowerCase()) ||

              record.grNumber.toLowerCase().includes(search.toLowerCase())

            : true;

        const statusMatch = statusFilter

            ? record.status === statusFilter

            : true;

        return searchMatch && statusMatch;

    });

    const isToday = date === todayStr();

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-slate-800">

                    {isToday ? "Today's Attendance" : "Attendance Record"}

                </h1>

                <p className="mt-2 text-slate-500">

                    Total Records : {filteredRecords.length}

                </p>

            </div>

            {/* ===================== Filters ===================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div className="md:col-span-2">

                        <div className="flex items-center bg-gray-100 rounded-xl px-4">

                            <Search
                                size={18}
                                className="text-gray-500"
                            />

                            <input
                                type="text"
                                placeholder="Search by name or GR number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent px-3 py-3 outline-none"
                            />

                        </div>

                    </div>

                    <div className="relative">

                        <Calendar
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="date"
                            value={date}
                            max={todayStr()}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-full w-full rounded-xl border pl-11 pr-4 py-3 outline-none focus:border-[#5B2EFF]"
                        />

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Status</option>

                        <option value="Present">Present</option>

                        <option value="Absent">Absent</option>

                        <option value="Late">Late</option>

                        <option value="Leave">Leave</option>

                    </select>

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

                                        Student

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Class

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Status

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Time

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Marked By

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Remarks

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    filteredRecords.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="text-center py-16"
                                            >

                                                <UserCheck
                                                    size={56}
                                                    className="mx-auto text-gray-300 mb-4"
                                                />

                                                <h2 className="text-xl font-semibold text-gray-600">

                                                    No Attendance Records

                                                </h2>

                                                <p className="text-gray-400 mt-2">

                                                    No attendance has been marked for this date yet.

                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredRecords.map((record, index) => (

                                            <tr
                                                key={`${record.studentId}-${index}`}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

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

                                                <td className="px-6 py-4 text-gray-600">

                                                    {

                                                        new Date(record.markedAt).toLocaleTimeString(

                                                            [],

                                                            {

                                                                hour: "2-digit",

                                                                minute: "2-digit"

                                                            }

                                                        )

                                                    }

                                                </td>

                                                <td className="px-6 py-4 text-gray-600">

                                                    {record.markedBy}

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

export default TodayAttendance;