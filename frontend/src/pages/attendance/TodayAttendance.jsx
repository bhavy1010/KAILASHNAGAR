import { useEffect, useState } from "react";
import {
    Search,
    Calendar,
    UserCheck,
    Loader2,
    Users
} from "lucide-react";

import { getTodayAttendance } from "../../services/attendanceService";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_STYLE = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-yellow-100 text-yellow-700",
    Leave: "bg-blue-100 text-blue-700"
};

const todayStr = () => new Date().toISOString().substring(0, 10);

const TodayAttendance = () => {
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(todayStr());
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const text = {
        todayTitle: isGujarati ? "આજની હાજરી" : "Today's Attendance",
        recordTitle: isGujarati ? "હાજરી રેકોર્ડ" : "Attendance Record",
        totalRecords: isGujarati ? "કુલ રેકોર્ડ" : "Total Records",
        searchPlaceholder: isGujarati
            ? "નામ અથવા GR નંબરથી શોધો..."
            : "Search by name or GR number...",
        allStatus: isGujarati ? "બધી સ્થિતિ" : "All Status",
        present: isGujarati ? "હાજર" : "Present",
        absent: isGujarati ? "ગેરહાજર" : "Absent",
        late: isGujarati ? "મોડા" : "Late",
        leave: isGujarati ? "રજા" : "Leave",
        student: isGujarati ? "વિદ્યાર્થી" : "Student",
        class: isGujarati ? "વર્ગ" : "Class",
        status: isGujarati ? "સ્થિતિ" : "Status",
        time: isGujarati ? "સમય" : "Time",
        markedBy: isGujarati ? "હાજરી ભરનાર" : "Marked By",
        remarks: isGujarati ? "નોંધ" : "Remarks",
        noRecords: isGujarati
            ? "હાજરીના કોઈ રેકોર્ડ નથી"
            : "No Attendance Records",
        noRecordsText: isGujarati
            ? "આ તારીખ માટે હજુ હાજરી ભરવામાં આવી નથી."
            : "No attendance has been marked for this date yet.",
        loading: isGujarati ? "હાજરી લોડ થઈ રહી છે..." : "Loading attendance..."
    };

    const statusLabel = {
        Present: text.present,
        Absent: text.absent,
        Late: text.late,
        Leave: text.leave
    };

    useEffect(() => {
        loadRecords();
    }, [date]);

    const loadRecords = async () => {
        try {
            setLoading(true);

            const response = await getTodayAttendance(date);
            setRecords(response?.records || []);
        } catch (error) {
            console.log(error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter((record) => {
        const searchText = search.toLowerCase().trim();

        const searchMatch = searchText
            ? record.fullName?.toLowerCase().includes(searchText) ||
              record.grNumber?.toLowerCase().includes(searchText)
            : true;

        const statusMatch = statusFilter
            ? record.status === statusFilter
            : true;

        return searchMatch && statusMatch;
    });

    const isToday = date === todayStr();

    const formatTime = (markedAt) => {
        if (!markedAt) return "-";

        return new Date(markedAt).toLocaleTimeString(
            isGujarati ? "gu-IN" : "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7">
                <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                    {isToday ? text.todayTitle : text.recordTitle}
                </h1>

                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                    {text.totalRecords}: {filteredRecords.length}
                </p>
            </div>

            <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

                    <div className="relative">
                        <Calendar
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="date"
                            value={date}
                            max={todayStr()}
                            onChange={(event) => setDate(event.target.value)}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allStatus}</option>
                        <option value="Present">{text.present}</option>
                        <option value="Absent">{text.absent}</option>
                        <option value="Late">{text.late}</option>
                        <option value="Leave">{text.leave}</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-72 flex-col items-center justify-center gap-3">
                        <Loader2 size={38} className="animate-spin text-[#5B2EFF]" />
                        <p className="font-medium text-slate-500">{text.loading}</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <UserCheck
                            size={56}
                            className="mx-auto mb-4 text-slate-300"
                        />

                        <h2 className="text-xl font-semibold text-slate-600">
                            {text.noRecords}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400 sm:text-base">
                            {text.noRecordsText}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.student}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.class}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.status}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.time}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.markedBy}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.remarks}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRecords.map((record, index) => (
                                        <tr
                                            key={`${record.studentId || record.grNumber}-${index}`}
                                            className="border-t border-slate-100 transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {record.fullName}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
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

                                            <td className="px-6 py-4 text-slate-600">
                                                {formatTime(record.markedAt)}
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {record.markedBy || "-"}
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
                            {filteredRecords.map((record, index) => (
                                <div
                                    key={`${record.studentId || record.grNumber}-${index}`}
                                    className="p-4 sm:p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                                                <Users size={20} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-800">
                                                    {record.fullName}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    GR: {record.grNumber}
                                                </p>
                                            </div>
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

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-slate-400">{text.class}</p>
                                            <p className="mt-1 font-medium text-slate-700">
                                                {isGujarati
                                                    ? `${record.standard} ધોરણ - ${record.division}`
                                                    : `Std ${record.standard} - ${record.division}`}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-slate-400">{text.time}</p>
                                            <p className="mt-1 font-medium text-slate-700">
                                                {formatTime(record.markedAt)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-slate-400">{text.markedBy}</p>
                                            <p className="mt-1 font-medium text-slate-700">
                                                {record.markedBy || "-"}
                                            </p>
                                        </div>

                                        <div>
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

export default TodayAttendance;