import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";

import { getMarksEntryData, saveResult } from "../../services/resultService";

const MarksEntry = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [exam, setExam] = useState(null);

    const [students, setStudents] = useState([]);

    const [schedule, setSchedule] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [savedIds, setSavedIds] = useState([]);

    // marksMap[studentId][subject] = marksObtained
    const [marksMap, setMarksMap] = useState({});

    // remarksMap[studentId] = remarks string
    const [remarksMap, setRemarksMap] = useState({});

    useEffect(() => {

        loadData();

    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            const response = await getMarksEntryData(id);

            setExam(response.exam);
            setStudents(response.students || []);
            setSchedule(response.schedule || []);

            // Pre-fill existing results if any
            const existingResults = response.existingResults || [];

            const preMarks = {};
            const preRemarks = {};
            const preSaved = [];

            existingResults.forEach((result) => {

                const sid = String(result.studentId);
                preMarks[sid] = {};
                preSaved.push(sid);

                result.subjectResults.forEach((sub) => {

                    preMarks[sid][sub.subject] = sub.marksObtained;

                });

                preRemarks[sid] = result.remarks || "";

            });

            setMarksMap(preMarks);
            setRemarksMap(preRemarks);
            setSavedIds(preSaved);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleMarkChange = (studentId, subject, value) => {

        setMarksMap((prev) => ({

            ...prev,

            [studentId]: {
                ...prev[studentId],
                [subject]: value
            }

        }));

    };

    const handleRemarksChange = (studentId, value) => {

        setRemarksMap((prev) => ({

            ...prev,
            [studentId]: value

        }));

    };

    const handleSaveStudent = async (student) => {

        const studentMarks = marksMap[student._id] || {};

        const subjectResults = schedule.map((sch) => ({

            subject: sch.subject,
            scheduleId: sch._id,
            totalMarks: sch.totalMarks,
            passingMarks: sch.passingMarks,
            marksObtained: Number(studentMarks[sch.subject] || 0),
            remarks: ""

        }));

        try {

            setSaving(true);

            await saveResult({
                examId: id,
                studentId: student._id,
                subjectResults,
                remarks: remarksMap[student._id] || ""
            });

            setSavedIds((prev) => [...new Set([...prev, String(student._id)])]);

        } catch (error) {

            alert(error.response?.data?.message || "Unable to save marks for " + student.fullName);

        } finally {

            setSaving(false);

        }

    };

    const handleSaveAll = async () => {

        if (students.length === 0) {
            alert("No students to save");
            return;
        }

        setSaving(true);

        let successCount = 0;
        let errorCount = 0;

        for (const student of students) {

            try {

                const studentMarks = marksMap[student._id] || {};

                const subjectResults = schedule.map((sch) => ({
                    subject: sch.subject,
                    scheduleId: sch._id,
                    totalMarks: sch.totalMarks,
                    passingMarks: sch.passingMarks,
                    marksObtained: Number(studentMarks[sch.subject] || 0),
                    remarks: ""
                }));

                await saveResult({
                    examId: id,
                    studentId: student._id,
                    subjectResults,
                    remarks: remarksMap[student._id] || ""
                });

                successCount++;
                setSavedIds((prev) => [...new Set([...prev, String(student._id)])]);

            } catch (error) {

                errorCount++;
                console.log("Error saving for " + student.fullName, error);

            }

        }

        setSaving(false);

        alert("Saved: " + successCount + " students" + (errorCount > 0 ? ", Failed: " + errorCount : ""));

    };

    if (loading) {

        return (

            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

        );

    }

    if (schedule.length === 0) {

        return (

            <div className="p-8">

                <button
                    onClick={() => navigate("/exams/" + id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="bg-white rounded-3xl p-16 text-center shadow">
                    <h2 className="text-xl font-semibold text-gray-600">No Schedule Found</h2>
                    <p className="text-gray-400 mt-2">Please add subjects to the exam schedule first.</p>
                    <button
                        onClick={() => navigate("/exams/schedule/" + id)}
                        className="mt-6 px-8 py-3 rounded-xl bg-[#5B2EFF] text-white font-semibold hover:bg-[#4724db]"
                    >
                        Go to Schedule
                    </button>
                </div>

            </div>

        );

    }

    const savedCount = savedIds.length;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/exams/" + id)}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <p className="text-sm text-gray-500">Exams &rsaquo; Marks Entry</p>
                        <h1 className="text-3xl font-bold text-slate-800 mt-1">
                            {exam?.examName}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Std {exam?.standard} - {exam?.division}
                        </p>
                    </div>

                </div>

                <div className="flex gap-3">

                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save All"}
                    </button>

                </div>

            </div>

            {/* ============================== Progress Bar ============================== */}

            <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 mb-7">

                <div className="flex items-center justify-between mb-3">

                    <p className="font-semibold text-gray-700">
                        Progress : {savedCount} / {students.length} students saved
                    </p>

                    <p className="text-sm text-gray-500">
                        {students.length > 0 ? Math.round((savedCount / students.length) * 100) : 0}% complete
                    </p>

                </div>

                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                        style={{ width: students.length > 0 ? Math.round((savedCount / students.length) * 100) + "%" : "0%" }}
                    ></div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">

                    {schedule.map((sch) => (

                        <div key={sch._id} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            {sch.subject} / {sch.totalMarks}
                        </div>

                    ))}

                </div>

            </div>

            {/* ============================== Students Marks Table ============================== */}

            {students.length === 0 && (

                <div className="bg-white rounded-3xl p-16 text-center shadow">
                    <h2 className="text-xl font-semibold text-gray-600">No Students Found</h2>
                    <p className="text-gray-400 mt-2">No active students in Std {exam?.standard} - {exam?.division}.</p>
                </div>

            )}

            {students.length > 0 && (

                <div className="space-y-5">

                    {students.map((student, index) => {

                        const isSaved = savedIds.includes(String(student._id));
                        const studentMarks = marksMap[student._id] || {};

                        return (

                            <div
                                key={student._id}
                                className={"bg-white rounded-3xl shadow border p-6 transition " + (isSaved ? "border-green-200" : "border-gray-100")}
                            >

                                {/* Student Info Row */}

                                <div className="flex items-center justify-between mb-5">

                                    <div className="flex items-center gap-4">

                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 shrink-0">
                                            {index + 1}
                                        </div>

                                        {student.photo ? (

                                            <img
                                                src={"http://localhost:5000/uploads/students/" + student.photo}
                                                alt={student.fullName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />

                                        ) : (

                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                {student.fullName.charAt(0)}
                                            </div>

                                        )}

                                        <div>
                                            <p className="font-semibold text-gray-800">{student.fullName}</p>
                                            <p className="text-xs text-gray-400">GR : {student.grNumber}</p>
                                        </div>

                                        {isSaved && (

                                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                <CheckCircle size={12} />
                                                Saved
                                            </div>

                                        )}

                                    </div>

                                    <button
                                        onClick={() => handleSaveStudent(student)}
                                        disabled={saving}
                                        className="px-5 py-2 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white text-sm font-semibold transition disabled:opacity-60"
                                    >
                                        {saving ? "..." : isSaved ? "Update" : "Save"}
                                    </button>

                                </div>

                                {/* Marks Grid */}

                                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">

                                    {schedule.map((sch) => {

                                        const marks = studentMarks[sch.subject] || "";
                                        const isInvalid = marks !== "" && (Number(marks) < 0 || Number(marks) > sch.totalMarks);
                                        const isPassing = marks !== "" && Number(marks) >= sch.passingMarks;

                                        return (

                                            <div key={sch._id}>

                                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                                    {sch.subject}
                                                    <span className="text-gray-400 ml-1">/ {sch.totalMarks}</span>
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={sch.totalMarks}
                                                    value={marks}
                                                    onChange={(e) => handleMarkChange(student._id, sch.subject, e.target.value)}
                                                    placeholder="0"
                                                    className={"h-11 w-full rounded-xl border px-3 outline-none text-center font-semibold " + (
                                                        isInvalid
                                                            ? "border-red-400 bg-red-50 text-red-600"
                                                            : marks !== "" && isPassing
                                                            ? "border-green-400 bg-green-50 text-green-700"
                                                            : marks !== "" && !isPassing
                                                            ? "border-red-300 bg-red-50 text-red-600"
                                                            : "focus:border-[#5B2EFF]"
                                                    )}
                                                />

                                                {marks !== "" && (

                                                    <p className={"text-xs text-center mt-1 font-semibold " + (isPassing ? "text-green-600" : "text-red-500")}>
                                                        {isPassing ? "Pass" : "Fail"}
                                                    </p>

                                                )}

                                            </div>

                                        );

                                    })}

                                </div>

                                {/* Remarks */}

                                <div>

                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                        Remarks (Optional)
                                    </label>

                                    <input
                                        type="text"
                                        value={remarksMap[student._id] || ""}
                                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                                        placeholder="e.g. Good performance, needs improvement in Science..."
                                        className="h-10 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] text-sm"
                                    />

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

            {/* ============================== Bottom Save Bar ============================== */}

            {students.length > 0 && (

                <div className="sticky bottom-6 mt-7 flex justify-between items-center">

                    <button
                        onClick={() => navigate("/exams/results/" + id)}
                        className="px-8 py-4 rounded-xl bg-white border border-gray-200 shadow font-semibold hover:bg-gray-50 transition"
                    >
                        View Results
                    </button>

                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-10 py-4 text-white font-semibold shadow-2xl hover:bg-[#4724db] hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
                    >
                        <Save size={18} />
                        {saving ? "Saving All..." : "Save All Marks"}
                    </button>

                </div>

            )}

        </div>

    );

};

export default MarksEntry;