import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Search,
    RefreshCw,
    ArrowUpDown,
    Loader2,
    Eye
} from "lucide-react";

import { getStudents } from "../../services/studentService";
import { getClassAttendanceReport } from "../../services/attendanceService";
import { useLanguage } from "../../context/LanguageContext";

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

const now = new Date();

const ClassAttendanceReport = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

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

    const text = {
        title: isGujarati
            ? "વર્ગ હાજરી રિપોર્ટ"
            : "Class Attendance Report",
        subtitle: isGujarati
            ? "વર્ગ માટે માસિક હાજરીનો સારાંશ."
            : "Monthly attendance summary for a class.",
        class: isGujarati ? "વર્ગ" : "Class",
        selectClass: isGujarati ? "વર્ગ પસંદ કરો" : "Select Class",
        division: isGujarati ? "વિભાગ" : "Division",
        selectDivision: isGujarati ? "વિભાગ પસંદ કરો" : "Select Division",
        month: isGujarati ? "મહિનો" : "Month",
        year: isGujarati ? "વર્ષ" : "Year",
        reset: isGujarati ? "રીસેટ" : "Reset",
        loadReport: isGujarati ? "રિપોર્ટ લોડ કરો" : "Load Report",
        loading: isGujarati ? "લોડ થઈ રહ્યું છે..." : "Loading...",
        totalStudents: isGujarati ? "કુલ વિદ્યાર્થીઓ" : "Total Students",
        workingDays: isGujarati ? "કામકાજના દિવસો" : "Working Days",
        classAverage: isGujarati ? "વર્ગ સરેરાશ" : "Class Average",
        searchPlaceholder: isGujarati
            ? "નામ અથવા GR નંબરથી વિદ્યાર્થી શોધો..."
            : "Search student by name or GR...",
        student: isGujarati ? "વિદ્યાર્થી" : "Student",
        present: isGujarati ? "હાજર" : "Present",
        absent: isGujarati ? "ગેરહાજર" : "Absent",
        late: isGujarati ? "મોડા" : "Late",
        leave: isGujarati ? "રજા" : "Leave",
        attendancePercent: isGujarati ? "હાજરી %" : "Attendance %",
        details: isGujarati ? "વિગતો" : "Details",
        view: isGujarati ? "જુઓ" : "View",
        noReport: isGujarati
            ? "કોઈ રિપોર્ટ લોડ થયો નથી"
            : "No Report Loaded",
        noReportText: isGujarati
            ? "વર્ગ, વિભાગ અને મહિનો પસંદ કરીને રિપોર્ટ લોડ કરો."
            : "Select class, division and month, then click Load Report."
    };

    const months = isGujarati ? MONTHS_GU : MONTHS_EN;

    useEffect(() => {
        loadClasses();
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

    const divisionsForStandard = [
        ...new Set(
            classes
                .filter(
                    (item) => String(item.standard) === String(standard)
                )
                .map((item) => item.division)
        )
    ];

    const handleLoad = async () => {
        if (!standard || !division) {
            alert(
                isGujarati
                    ? "કૃપા કરીને વર્ગ અને વિભાગ પસંદ કરો."
                    : "Please select Class and Division"
            );
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

            setStudents(response?.students || []);
            setTotalDays(response?.totalDays || 0);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                    (isGujarati
                        ? "રિપોર્ટ લોડ થઈ શક્યો નથી."
                        : "Unable to load report")
            );
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
        setSortKey("attendancePercent");
        setSortAsc(false);
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortAsc((previous) => !previous);
        } else {
            setSortKey(key);
            setSortAsc(false);
        }
    };

    const filteredStudents = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return [...students]
            .filter((student) =>
                searchText
                    ? student.fullName?.toLowerCase().includes(searchText) ||
                      student.grNumber?.toLowerCase().includes(searchText)
                    : true
            )
            .sort((first, second) => {
                const firstValue = first[sortKey] ?? 0;
                const secondValue = second[sortKey] ?? 0;

                if (typeof firstValue === "string") {
                    return sortAsc
                        ? firstValue.localeCompare(secondValue)
                        : secondValue.localeCompare(firstValue);
                }

                return sortAsc
                    ? Number(firstValue) - Number(secondValue)
                    : Number(secondValue) - Number(firstValue);
            });
    }, [students, search, sortKey, sortAsc]);

    const classAvg =
        students.length > 0
            ? Math.round(
                  students.reduce(
                      (sum, student) =>
                          sum + Number(student.attendancePercent || 0),
                      0
                  ) / students.length
              )
            : 0;

    const progressColor = (percentage) => {
        if (percentage >= 90) return "bg-green-500";
        if (percentage >= 75) return "bg-yellow-500";
        return "bg-red-500";
    };

    const percentColor = (percentage) => {
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 75) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7">
                <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                    {text.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                    {text.subtitle}
                </p>
            </div>

            <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div>
                        <label className="mb-2 block font-semibold text-slate-700">
                            {text.class}
                        </label>

                        <select
                            value={standard}
                            onChange={(event) => {
                                setStandard(event.target.value);
                                setDivision("");
                            }}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">{text.selectClass}</option>

                            {[...new Set(classes.map((item) => item.standard))]
                                .sort((a, b) => a - b)
                                .map((std) => (
                                    <option key={std} value={std}>
                                        {isGujarati ? `${std} ધોરણ` : `Std ${std}`}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold text-slate-700">
                            {text.division}
                        </label>

                        <select
                            value={division}
                            onChange={(event) => setDivision(event.target.value)}
                            disabled={!standard}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                            <option value="">{text.selectDivision}</option>

                            {divisionsForStandard.map((div) => (
                                <option key={div} value={div}>
                                    {div}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold text-slate-700">
                            {text.month}
                        </label>

                        <select
                            value={month}
                            onChange={(event) => setMonth(Number(event.target.value))}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                        >
                            {months.map((monthName, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {monthName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold text-slate-700">
                            {text.year}
                        </label>

                        <select
                            value={year}
                            onChange={(event) => setYear(Number(event.target.value))}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
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

                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            title={text.reset}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white transition hover:bg-slate-800"
                        >
                            <RefreshCw size={18} />
                        </button>

                        <button
                            onClick={handleLoad}
                            disabled={loading}
                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-4 font-semibold text-white transition hover:bg-[#4724db] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}

                            {loading ? text.loading : text.loadReport}
                        </button>
                    </div>
                </div>
            </div>

            {students.length > 0 ? (
                <>
                    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">{text.class}</p>

                            <h3 className="mt-2 text-xl font-bold text-slate-800">
                                {isGujarati
                                    ? `${standard} ધોરણ - ${division}`
                                    : `Std ${standard} - ${division}`}
                            </h3>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                {text.totalStudents}
                            </p>

                            <h3 className="mt-2 text-xl font-bold text-slate-800">
                                {students.length}
                            </h3>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                {text.workingDays}
                            </p>

                            <h3 className="mt-2 text-xl font-bold text-slate-800">
                                {totalDays}
                            </h3>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                {text.classAverage}
                            </p>

                            <h3
                                className={`mt-2 text-xl font-bold ${percentColor(
                                    classAvg
                                )}`}
                            >
                                {classAvg}%
                            </h3>
                        </div>
                    </div>

                    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4">
                            <Search size={18} className="shrink-0 text-slate-500" />

                            <input
                                type="text"
                                placeholder={text.searchPlaceholder}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full bg-transparent py-3 outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.student}
                                        </th>

                                        {[
                                            {
                                                key: "present",
                                                label: text.present
                                            },
                                            {
                                                key: "absent",
                                                label: text.absent
                                            },
                                            {
                                                key: "late",
                                                label: text.late
                                            },
                                            {
                                                key: "leave",
                                                label: text.leave
                                            },
                                            {
                                                key: "attendancePercent",
                                                label: text.attendancePercent
                                            }
                                        ].map((column) => (
                                            <th
                                                key={column.key}
                                                onClick={() =>
                                                    handleSort(column.key)
                                                }
                                                className="cursor-pointer px-6 py-4 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {column.label}
                                                    <ArrowUpDown
                                                        size={14}
                                                        className="text-slate-400"
                                                    />
                                                </div>
                                            </th>
                                        ))}

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.details}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredStudents.map((student) => {
                                        const percentage = Number(
                                            student.attendancePercent || 0
                                        );

                                        return (
                                            <tr
                                                key={student.studentId}
                                                className="border-t border-slate-100 transition hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">
                                                        {student.fullName}
                                                    </p>

                                                    <p className="text-sm text-slate-500">
                                                        GR: {student.grNumber}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        {student.present || 0}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                        {student.absent || 0}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                        {student.late || 0}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        {student.leave || 0}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className={`h-full rounded-full ${progressColor(
                                                                    percentage
                                                                )}`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Math.max(
                                                                            percentage,
                                                                            0
                                                                        ),
                                                                        100
                                                                    )}%`
                                                                }}
                                                            />
                                                        </div>

                                                        <span
                                                            className={`font-bold text-sm ${percentColor(
                                                                percentage
                                                            )}`}
                                                        >
                                                            {percentage}%
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
                                                        className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                                                    >
                                                        <Eye size={16} />
                                                        {text.view}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 lg:hidden">
                            {filteredStudents.map((student) => {
                                const percentage = Number(
                                    student.attendancePercent || 0
                                );

                                return (
                                    <div
                                        key={student.studentId}
                                        className="p-4 sm:p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-800">
                                                    {student.fullName}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    GR: {student.grNumber}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 text-lg font-bold ${percentColor(
                                                    percentage
                                                )}`}
                                            >
                                                {percentage}%
                                            </span>
                                        </div>

                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${progressColor(
                                                    percentage
                                                )}`}
                                                style={{
                                                    width: `${Math.min(
                                                        Math.max(percentage, 0),
                                                        100
                                                    )}%`
                                                }}
                                            />
                                        </div>

                                        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                                            <div className="rounded-xl bg-green-50 p-2">
                                                <p className="text-xs text-green-700">
                                                    {text.present}
                                                </p>
                                                <p className="mt-1 font-bold text-green-700">
                                                    {student.present || 0}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-red-50 p-2">
                                                <p className="text-xs text-red-700">
                                                    {text.absent}
                                                </p>
                                                <p className="mt-1 font-bold text-red-700">
                                                    {student.absent || 0}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-yellow-50 p-2">
                                                <p className="text-xs text-yellow-700">
                                                    {text.late}
                                                </p>
                                                <p className="mt-1 font-bold text-yellow-700">
                                                    {student.late || 0}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-blue-50 p-2">
                                                <p className="text-xs text-blue-700">
                                                    {text.leave}
                                                </p>
                                                <p className="mt-1 font-bold text-blue-700">
                                                    {student.leave || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/attendance/student/${student.studentId}`
                                                )
                                            }
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                                        >
                                            <Eye size={16} />
                                            {text.view}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                !loading && (
                    <div className="rounded-3xl bg-white px-5 py-16 text-center shadow-sm sm:px-8">
                        <BookOpen
                            size={56}
                            className="mx-auto mb-4 text-slate-300"
                        />

                        <h2 className="text-xl font-semibold text-slate-600">
                            {text.noReport}
                        </h2>

                        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400 sm:text-base">
                            {text.noReportText}
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default ClassAttendanceReport;