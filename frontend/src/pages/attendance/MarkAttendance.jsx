import { useEffect, useState } from "react";
import { Calendar, Check, X, Clock, Plane, Save, RotateCcw } from "lucide-react";

import { getClasses } from "../../services/classService";
import { getStudents } from "../../services/studentService";
import {
    markClassAttendance,
    getClassAttendance
} from "../../services/attendanceService";

const STATUS_CONFIG = {

    Present: {
        label: "Present",
        color: "bg-green-100 text-green-700 border-green-300",
        activeColor: "bg-green-600 text-white border-green-600",
        icon: Check
    },

    Absent: {
        label: "Absent",
        color: "bg-red-100 text-red-700 border-red-300",
        activeColor: "bg-red-600 text-white border-red-600",
        icon: X
    },

    Late: {
        label: "Late",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        activeColor: "bg-yellow-500 text-white border-yellow-500",
        icon: Clock
    },

    Leave: {
        label: "Leave",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        activeColor: "bg-blue-600 text-white border-blue-600",
        icon: Plane
    }

};

const todayStr = () => new Date().toISOString().substring(0, 10);

const MarkAttendance = () => {

    const [classes, setClasses] = useState([]);

    const [standard, setStandard] = useState("");

    const [division, setDivision] = useState("");

    const [date, setDate] = useState(todayStr());

    const [students, setStudents] = useState([]);

    const [statusMap, setStatusMap] = useState({});

    const [remarksMap, setRemarksMap] = useState({});

    const [loadingStudents, setLoadingStudents] = useState(false);

    const [saving, setSaving] = useState(false);

    const [alreadyMarked, setAlreadyMarked] = useState(false);

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

    const handleLoadStudents = async () => {

        if (!standard || !division || !date) {

            alert("Please select Class, Division and Date");

            return;

        }

        try {

            setLoadingStudents(true);

            const studentResponse = await getStudents();

            const filtered = (studentResponse.students || []).filter(

                (s) =>

                    String(s.standard) === String(standard) &&

                    s.division === division &&

                    s.status === "Active"

            );

            setStudents(filtered);

            // Check if attendance already exists for this class/date

            const existing = await getClassAttendance(

                standard,

                division,

                date

            );

            const initialStatus = {};

            const initialRemarks = {};

            if (existing.attendance) {

                setAlreadyMarked(true);

                existing.attendance.records.forEach((record) => {

                    initialStatus[record.studentId] = record.status;

                    initialRemarks[record.studentId] = record.remarks || "";

                });

            } else {

                setAlreadyMarked(false);

                filtered.forEach((student) => {

                    initialStatus[student._id] = "Present";

                });

            }

            setStatusMap(initialStatus);

            setRemarksMap(initialRemarks);

        } catch (error) {

            console.log(error);

            alert("Unable to load students");

        } finally {

            setLoadingStudents(false);

        }

    };

    const setStatus = (studentId, status) => {

        setStatusMap({

            ...statusMap,

            [studentId]: status

        });

    };

    const setRemark = (studentId, value) => {

        setRemarksMap({

            ...remarksMap,

            [studentId]: value

        });

    };

    const markAll = (status) => {

        const updated = {};

        students.forEach((student) => {

            updated[student._id] = status;

        });

        setStatusMap(updated);

    };

    const resetAll = () => {

        setStatusMap({});

        setRemarksMap({});

        setStudents([]);

        setAlreadyMarked(false);

    };

    const presentCount = students.filter(

        (s) => statusMap[s._id] === "Present"

    ).length;

    const absentCount = students.filter(

        (s) => statusMap[s._id] === "Absent"

    ).length;

    const lateCount = students.filter(

        (s) => statusMap[s._id] === "Late"

    ).length;

    const leaveCount = students.filter(

        (s) => statusMap[s._id] === "Leave"

    ).length;

    const handleSave = async () => {

        if (students.length === 0) {

            alert("Load students first");

            return;

        }

        const unmarked = students.filter(

            (s) => !statusMap[s._id]

        );

        if (unmarked.length > 0) {

            alert(

                `Please mark status for all students (${unmarked.length} remaining)`

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

            await markClassAttendance({

                attendanceDate: date,

                standard: Number(standard),

                division,

                records,

                academicYearId: classes.find(

                    (c) =>

                        String(c.standard) === String(standard) &&

                        c.division === division

                )?.academicYearId

            });

            alert("Attendance Saved Successfully");

            setAlreadyMarked(true);

        } catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to save attendance"

            );

        } finally {

            setSaving(false);

        }

    };

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-slate-800">

                    Mark Attendance

                </h1>

                <p className="mt-2 text-slate-500">

                    Select class, division and date to load students.

                </p>

            </div>

            {/* ===================== Selector Card ===================== */}

            <div className="rounded-3xl bg-white p-8 shadow mb-7">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">

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

                            Date

                        </label>

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
                                className="h-12 w-full rounded-xl border pl-11 pr-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                    </div>

                    <button
                        onClick={handleLoadStudents}
                        disabled={loadingStudents}
                        className="h-12 rounded-xl bg-[#5B2EFF] text-white font-semibold hover:bg-[#4724db] transition disabled:opacity-60"
                    >

                        {loadingStudents ? "Loading..." : "Load Students"}

                    </button>

                </div>

            </div>

            {

                students.length > 0 && (

                    <>

                        {/* ===================== Summary + Quick Actions ===================== */}

                        <div className="rounded-3xl bg-white p-6 shadow mb-7">

                            <div className="flex flex-wrap items-center justify-between gap-4">

                                <div className="flex flex-wrap gap-4">

                                    <div className="px-5 py-3 rounded-xl bg-green-50 text-green-700 font-semibold">

                                        Present : {presentCount}

                                    </div>

                                    <div className="px-5 py-3 rounded-xl bg-red-50 text-red-700 font-semibold">

                                        Absent : {absentCount}

                                    </div>

                                    <div className="px-5 py-3 rounded-xl bg-yellow-50 text-yellow-700 font-semibold">

                                        Late : {lateCount}

                                    </div>

                                    <div className="px-5 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold">

                                        Leave : {leaveCount}

                                    </div>

                                    {

                                        alreadyMarked && (

                                            <div className="px-5 py-3 rounded-xl bg-purple-50 text-purple-700 font-semibold">

                                                Already Marked (Editing)

                                            </div>

                                        )

                                    }

                                </div>

                                <div className="flex gap-3">

                                    <button
                                        onClick={() => markAll("Present")}
                                        className="px-5 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                                    >

                                        Mark All Present

                                    </button>

                                    <button
                                        onClick={() => markAll("Absent")}
                                        className="px-5 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                                    >

                                        Mark All Absent

                                    </button>

                                    <button
                                        onClick={resetAll}
                                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-700 text-white text-sm font-semibold hover:bg-gray-800 transition"
                                    >

                                        <RotateCcw size={16} />

                                        Reset

                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* ===================== Student List ===================== */}

                        <div className="rounded-3xl bg-white shadow overflow-hidden">

                            <div className="divide-y">

                                {

                                    students.map((student, index) => (

                                        <div
                                            key={student._id}
                                            className="flex flex-col lg:flex-row lg:items-center gap-4 px-6 py-5 hover:bg-gray-50 transition"
                                        >

                                            <div className="flex items-center gap-4 lg:w-64 shrink-0">

                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">

                                                    {index + 1}

                                                </div>

                                                {

                                                    student.photo ? (

                                                        <img
                                                            src={`http://localhost:5000/uploads/students/${student.photo}`}
                                                            alt={student.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />

                                                    ) : (

                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">

                                                            {student.fullName.charAt(0)}

                                                        </div>

                                                    )

                                                }

                                                <div>

                                                    <p className="font-semibold text-gray-800">

                                                        {student.fullName}

                                                    </p>

                                                    <p className="text-xs text-gray-400">

                                                        GR : {student.grNumber}

                                                    </p>

                                                </div>

                                            </div>

                                            <div className="flex flex-wrap gap-2">

                                                {

                                                    Object.entries(STATUS_CONFIG).map(

                                                        ([key, config]) => {

                                                            const Icon = config.icon;

                                                            const isActive =
                                                                statusMap[student._id] === key;

                                                            return (

                                                                <button
                                                                    key={key}
                                                                    onClick={() => setStatus(student._id, key)}
                                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
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

                                                    )

                                                }

                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Remarks (optional)"
                                                value={remarksMap[student._id] || ""}
                                                onChange={(e) => setRemark(student._id, e.target.value)}
                                                className="flex-1 lg:max-w-xs h-11 rounded-xl border px-4 text-sm outline-none focus:border-[#5B2EFF]"
                                            />

                                        </div>

                                    ))

                                }

                            </div>

                        </div>

                        {/* ===================== Save Bar ===================== */}

                        <div className="sticky bottom-6 mt-7 flex justify-end">

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-10 py-4 text-white font-semibold shadow-2xl hover:bg-[#4724db] hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
                            >

                                <Save size={18} />

                                {saving ? "Saving..." : "Save Attendance"}

                            </button>

                        </div>

                    </>

                )

            }

            {

                students.length === 0 && !loadingStudents && (

                    <div className="rounded-3xl bg-white p-16 text-center shadow">

                        <Calendar
                            size={56}
                            className="mx-auto text-gray-300 mb-4"
                        />

                        <h2 className="text-xl font-semibold text-gray-600">

                            No Students Loaded

                        </h2>

                        <p className="text-gray-400 mt-2">

                            Select class, division and date, then click "Load Students".

                        </p>

                    </div>

                )

            }

        </div>

    );

};

export default MarkAttendance;