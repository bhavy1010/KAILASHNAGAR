import { useEffect, useState } from "react";
import {
    Calendar,
    Check,
    X,
    Clock,
    Plane,
    Save,
    RotateCcw,
    Loader2
} from "lucide-react";

import { getStudents } from "../../services/studentService";
import {
    markClassAttendance,
    getClassAttendance
} from "../../services/attendanceService";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getMyTeacherScope } from "../../services/teacherService";

const todayStr = () => new Date().toISOString().substring(0, 10);

const MarkAttendance = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const isGujarati = language === "gu";
    const isTeacher = user?.role === "teacher";

    const [classes, setClasses] = useState([]);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [standard, setStandard] = useState("");
    const [division, setDivision] = useState("");
    const [date, setDate] = useState(todayStr());
    const [students, setStudents] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [remarksMap, setRemarksMap] = useState({});
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [alreadyMarked, setAlreadyMarked] = useState(false);

    const text = {
        title: isGujarati ? "હાજરી ભરો" : "Mark Attendance",
        subtitle: isGujarati
            ? "વિદ્યાર્થીઓ લોડ કરવા માટે વર્ગ, વિભાગ અને તારીખ પસંદ કરો."
            : "Select class, division and date to load students.",
        class: isGujarati ? "વર્ગ" : "Class",
        selectClass: isGujarati ? "વર્ગ પસંદ કરો" : "Select Class",
        division: isGujarati ? "વિભાગ" : "Division",
        selectDivision: isGujarati ? "વિભાગ પસંદ કરો" : "Select Division",
        date: isGujarati ? "તારીખ" : "Date",
        loadStudents: isGujarati ? "વિદ્યાર્થીઓ લોડ કરો" : "Load Students",
        loading: isGujarati ? "લોડ થઈ રહ્યું છે..." : "Loading...",
        present: isGujarati ? "હાજર" : "Present",
        absent: isGujarati ? "ગેરહાજર" : "Absent",
        late: isGujarati ? "મોડા" : "Late",
        leave: isGujarati ? "રજા" : "Leave",
        alreadyMarked: isGujarati
            ? "હાજરી ભરાઈ ગઈ છે (સંપાદન કરો)"
            : "Already Marked (Editing)",
        markAllPresent: isGujarati ? "બધાને હાજર કરો" : "Mark All Present",
        markAllAbsent: isGujarati ? "બધાને ગેરહાજર કરો" : "Mark All Absent",
        reset: isGujarati ? "રીસેટ" : "Reset",
        remarks: isGujarati ? "નોંધ (વૈકલ્પિક)" : "Remarks (optional)",
        saveAttendance: isGujarati ? "હાજરી સાચવો" : "Save Attendance",
        saving: isGujarati ? "સાચવાઈ રહ્યું છે..." : "Saving...",
        noStudents: isGujarati
            ? "કોઈ વિદ્યાર્થી લોડ થયો નથી"
            : "No Students Loaded",
        noStudentsText: isGujarati
            ? "વર્ગ, વિભાગ અને તારીખ પસંદ કરીને “વિદ્યાર્થીઓ લોડ કરો” પર ક્લિક કરો."
            : 'Select class, division and date, then click "Load Students".'
    };

    const statusConfig = {
        Present: {
            label: text.present,
            color: "bg-green-100 text-green-700 border-green-300",
            activeColor: "bg-green-600 text-white border-green-600",
            icon: Check
        },
        Absent: {
            label: text.absent,
            color: "bg-red-100 text-red-700 border-red-300",
            activeColor: "bg-red-600 text-white border-red-600",
            icon: X
        },
        Late: {
            label: text.late,
            color: "bg-yellow-100 text-yellow-700 border-yellow-300",
            activeColor: "bg-yellow-500 text-white border-yellow-500",
            icon: Clock
        },
        Leave: {
            label: text.leave,
            color: "bg-blue-100 text-blue-700 border-blue-300",
            activeColor: "bg-blue-600 text-white border-blue-600",
            icon: Plane
        }
    };

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    useEffect(() => {
        loadClasses();
        if (isTeacher) {
            getMyTeacherScope()
                .then((data) => {
                    if (data.success && data.classesHandled?.length > 0) {
                        setTeacherClasses(data.classesHandled);
                    }
                })
                .catch(() => {});
        }
    }, [isTeacher]);

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
                            division: student.division,
                            academicYearId: student.academicYearId
                        }
                    ])
                ).values()
            ];

            setClasses(realClasses);
        } catch (error) {
            console.log(error);
            alert(
                isGujarati
                    ? "વર્ગ અને વિભાગનો ડેટા લોડ થઈ શક્યો નથી."
                    : "Unable to load class and division data."
            );
        }
    };

    const divisionsForStandard = [
        ...new Set(
            classes
                .filter((item) => String(item.standard) === String(standard))
                .map((item) => item.division)
        )
    ];

    const handleLoadStudents = async () => {
        if (!standard || !division || !date) {
            alert(
                isGujarati
                    ? "કૃપા કરીને વર્ગ, વિભાગ અને તારીખ પસંદ કરો."
                    : "Please select Class, Division and Date"
            );
            return;
        }

        try {
            setLoadingStudents(true);

            const studentResponse = await getStudents();

            const filteredStudents = (studentResponse.students || []).filter(
                (student) =>
                    String(student.standard) === String(standard) &&
                    student.division === division &&
                    student.status === "Active"
            );

            setStudents(filteredStudents);

            const existing = await getClassAttendance(
                standard,
                division,
                date
            );

            const initialStatus = {};
            const initialRemarks = {};

            if (existing?.attendance?.records?.length > 0) {
                setAlreadyMarked(true);

                existing.attendance.records.forEach((record) => {
                    const studentId =
                        record.studentId?._id?.toString() ||
                        record.studentId?.toString();

                    if (studentId) {
                        initialStatus[studentId] = record.status;
                        initialRemarks[studentId] = record.remarks || "";
                    }
                });
            } else {
                setAlreadyMarked(false);

                filteredStudents.forEach((student) => {
                    initialStatus[student._id] = "Present";
                });
            }

            setStatusMap(initialStatus);
            setRemarksMap(initialRemarks);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                    (isGujarati
                        ? "વિદ્યાર્થીઓ લોડ થઈ શક્યા નથી."
                        : "Unable to load students")
            );
        } finally {
            setLoadingStudents(false);
        }
    };

    const setStatus = (studentId, status) => {
        setStatusMap((previous) => ({
            ...previous,
            [studentId]: status
        }));
    };

    const setRemark = (studentId, value) => {
        setRemarksMap((previous) => ({
            ...previous,
            [studentId]: value
        }));
    };

    const markAll = (status) => {
        const updatedStatus = {};

        students.forEach((student) => {
            updatedStatus[student._id] = status;
        });

        setStatusMap(updatedStatus);
    };

    const resetAll = () => {
        setStatusMap({});
        setRemarksMap({});
        setStudents([]);
        setAlreadyMarked(false);
    };

    const presentCount = students.filter(
        (student) => statusMap[student._id] === "Present"
    ).length;

    const absentCount = students.filter(
        (student) => statusMap[student._id] === "Absent"
    ).length;

    const lateCount = students.filter(
        (student) => statusMap[student._id] === "Late"
    ).length;

    const leaveCount = students.filter(
        (student) => statusMap[student._id] === "Leave"
    ).length;

    const handleSave = async () => {
        if (students.length === 0) {
            alert(
                isGujarati
                    ? "પહેલા વિદ્યાર્થીઓ લોડ કરો."
                    : "Load students first"
            );
            return;
        }

        const unmarkedStudents = students.filter(
            (student) => !statusMap[student._id]
        );

        if (unmarkedStudents.length > 0) {
            alert(
                isGujarati
                    ? `બધા વિદ્યાર્થીઓની હાજરી ભરો (${unmarkedStudents.length} બાકી).`
                    : `Please mark status for all students (${unmarkedStudents.length} remaining)`
            );
            return;
        }

        try {
            setSaving(true);

            const records = students.map((student) => ({
                studentId: student._id,
                grNumber: student.grNumber,
                fullName: student.fullName,
                status: statusMap[student._id],
                remarks: remarksMap[student._id] || ""
            }));

            const selectedClass = classes.find(
                (item) =>
                    String(item.standard) === String(standard) &&
                    item.division === division
            );

            const payload = {
                attendanceDate: date,
                standard: Number(standard),
                division,
                records
            };

            if (selectedClass?.academicYearId) {
                payload.academicYearId = selectedClass.academicYearId;
            }

            await markClassAttendance(payload);

            alert(
                isGujarati
                    ? "હાજરી સફળતાપૂર્વક સાચવવામાં આવી."
                    : "Attendance Saved Successfully"
            );

            setAlreadyMarked(true);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                    (isGujarati
                        ? "હાજરી સાચવી શકાઈ નથી."
                        : "Unable to save attendance")
            );
        } finally {
            setSaving(false);
        }
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

            <div className="mb-7 rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-2 xl:grid-cols-4">
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
                                .filter((std) => {
                                    if (!isTeacher || teacherClasses.length === 0) return true;
                                    return teacherClasses.some((tc) => {
                                        const m = String(tc).match(/\d+/);
                                        return m && parseInt(m[0], 10) === Number(std);
                                    });
                                })
                                .map((std) => (
                                    <option key={std} value={std}>
                                        {isGujarati ? `${std} ધોરણ` : `Std ${std}`}
                                    </option>
                                ))}
                        </select>
                        {isTeacher && teacherClasses.length > 0 && (
                            <p className="mt-1 text-xs text-indigo-500 font-medium">
                                🔒 Showing your assigned classes: {teacherClasses.join(", ")}
                            </p>
                        )}
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
                            {text.date}
                        </label>

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
                    </div>

                    <button
                        onClick={handleLoadStudents}
                        disabled={loadingStudents}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-5 font-semibold text-white transition hover:bg-[#4724db] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loadingStudents && (
                            <Loader2 size={18} className="animate-spin" />
                        )}

                        {loadingStudents ? text.loading : text.loadStudents}
                    </button>
                </div>
            </div>

            {students.length > 0 && (
                <>
                    <div className="mb-7 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex flex-wrap gap-3">
                                <div className="rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-700">
                                    {text.present}: {presentCount}
                                </div>

                                <div className="rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-700">
                                    {text.absent}: {absentCount}
                                </div>

                                <div className="rounded-xl bg-yellow-50 px-4 py-3 font-semibold text-yellow-700">
                                    {text.late}: {lateCount}
                                </div>

                                <div className="rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700">
                                    {text.leave}: {leaveCount}
                                </div>

                                {alreadyMarked && (
                                    <div className="rounded-xl bg-purple-50 px-4 py-3 font-semibold text-purple-700">
                                        {text.alreadyMarked}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => markAll("Present")}
                                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                                >
                                    {text.markAllPresent}
                                </button>

                                <button
                                    onClick={() => markAll("Absent")}
                                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    {text.markAllAbsent}
                                </button>

                                <button
                                    onClick={resetAll}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    <RotateCcw size={16} />
                                    {text.reset}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                        <div className="divide-y divide-slate-100">
                            {students.map((student, index) => (
                                <div
                                    key={student._id}
                                    className="flex flex-col gap-4 px-4 py-5 transition hover:bg-slate-50 sm:px-6 lg:flex-row lg:items-center"
                                >
                                    <div className="flex shrink-0 items-center gap-3 lg:w-72">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                            {index + 1}
                                        </div>

                                        {student.photo ? (
                                            <img
                                                src={`${serverUrl}/uploads/students/${student.photo}`}
                                                alt={student.fullName}
                                                className="h-11 w-11 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                                {student.fullName?.charAt(0)?.toUpperCase() || "S"}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-800">
                                                {student.fullName}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                GR: {student.grNumber}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(statusConfig).map(
                                            ([key, config]) => {
                                                const Icon = config.icon;
                                                const isActive =
                                                    statusMap[student._id] === key;

                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() =>
                                                            setStatus(
                                                                student._id,
                                                                key
                                                            )
                                                        }
                                                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition sm:px-4 ${
                                                            isActive
                                                                ? config.activeColor
                                                                : config.color
                                                        }`}
                                                    >
                                                        <Icon size={15} />
                                                        {config.label}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder={text.remarks}
                                        value={remarksMap[student._id] || ""}
                                        onChange={(event) =>
                                            setRemark(
                                                student._id,
                                                event.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100 lg:ml-auto lg:max-w-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sticky bottom-4 mt-7 flex justify-end sm:bottom-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-7 py-4 font-semibold text-white shadow-xl transition hover:scale-[1.02] hover:bg-[#4724db] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}

                            {saving ? text.saving : text.saveAttendance}
                        </button>
                    </div>
                </>
            )}

            {students.length === 0 && !loadingStudents && (
                <div className="rounded-3xl bg-white px-5 py-16 text-center shadow-sm sm:px-8">
                    <Calendar
                        size={56}
                        className="mx-auto mb-4 text-slate-300"
                    />

                    <h2 className="text-xl font-semibold text-slate-600">
                        {text.noStudents}
                    </h2>

                    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400 sm:text-base">
                        {text.noStudentsText}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;