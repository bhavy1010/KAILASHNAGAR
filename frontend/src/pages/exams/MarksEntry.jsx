import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle, Languages } from "lucide-react";

import { getMarksEntryData, saveResult } from "../../services/resultService";
import { useLanguage } from "../../context/LanguageContext";

const MarksEntry = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

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

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        back: isGujarati ? "પાછા" : "Back",
        noScheduleTitle: isGujarati ? "કોઈ સમયપત્રક મળ્યું નથી" : "No Schedule Found",
        noScheduleSub: isGujarati
            ? "કૃપા કરીને પહેલા પરીક્ષા સમયપત્રકમાં વિષયો ઉમેરો."
            : "Please add subjects to the exam schedule first.",
        goToSchedule: isGujarati ? "સમયપત્રક પર જાઓ" : "Go to Schedule",
        breadcrumb: isGujarati ? "પરીક્ષા › માર્ક્સ એન્ટ્રી" : "Exams › Marks Entry",
        std: isGujarati ? "ધોરણ" : "Std",
        saveAll: isGujarati ? "બધું સાચવો" : "Save All",
        saving: isGujarati ? "સાચવી રહ્યું છે..." : "Saving...",
        progress: isGujarati ? "પ્રગતિ :" : "Progress :",
        studentsSaved: isGujarati ? "વિદ્યાર્થીઓ સાચવ્યા" : "students saved",
        complete: isGujarati ? "પૂર્ણ" : "complete",
        noStudentsTitle: isGujarati ? "કોઈ વિદ્યાર્થી મળ્યા નથી" : "No Students Found",
        noStudentsSub: isGujarati
            ? "ધોરણમાં કોઈ સક્રિય વિદ્યાર્થી નથી"
            : "No active students in Std",
        grLabel: isGujarati ? "GR :" : "GR :",
        saved: isGujarati ? "સાચવેલ" : "Saved",
        update: isGujarati ? "અપડેટ" : "Update",
        save: isGujarati ? "સાચવો" : "Save",
        pass: isGujarati ? "પાસ" : "Pass",
        fail: isGujarati ? "ફેલ" : "Fail",
        remarksOptional: isGujarati ? "રિમાર્ક્સ (વૈકલ્પિક)" : "Remarks (Optional)",
        remarksPlaceholder: isGujarati
            ? "દા.ત. સારી કામગીરી, વિજ્ઞાનમાં સુધારો જરૂરી..."
            : "e.g. Good performance, needs improvement in Science...",
        viewResults: isGujarati ? "પરિણામો જુઓ" : "View Results",
        savingAll: isGujarati ? "બધું સાચવી રહ્યું છે..." : "Saving All...",
        saveAllMarks: isGujarati ? "બધા માર્ક્સ સાચવો" : "Save All Marks",
        noStudentsToSave: isGujarati ? "સાચવવા માટે કોઈ વિદ્યાર્થી નથી" : "No students to save",
        saveErrorPrefix: isGujarati ? "માટે માર્ક્સ સાચવી શકાયા નથી" : "Unable to save marks for",
        savedLabel: isGujarati ? "સાચવ્યા:" : "Saved:",
        studentsLabel: isGujarati ? "વિદ્યાર્થીઓ" : "students",
        failedLabel: isGujarati ? "નિષ્ફળ:" : "Failed:"
    };

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
            alert(error.response?.data?.message || text.saveErrorPrefix + " " + student.fullName);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        if (students.length === 0) {
            alert(text.noStudentsToSave);
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

        alert(
            text.savedLabel +
                " " +
                successCount +
                " " +
                text.studentsLabel +
                (errorCount > 0 ? ", " + text.failedLabel + " " + errorCount : "")
        );
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (schedule.length === 0) {
        return (
            <div className="p-4 sm:p-8">
                <button
                    onClick={() => navigate("/exams/" + id)}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600"
                >
                    <ArrowLeft size={18} /> {text.back}
                </button>

                <div className="rounded-3xl bg-white p-8 text-center shadow sm:p-16">
                    <h2 className="text-xl font-semibold text-gray-600">
                        {text.noScheduleTitle}
                    </h2>
                    <p className="mt-2 text-gray-400">{text.noScheduleSub}</p>
                    <button
                        onClick={() => navigate("/exams/schedule/" + id)}
                        className="mt-6 rounded-xl bg-[#5B2EFF] px-8 py-3 font-semibold text-white hover:bg-[#4724db]"
                    >
                        {text.goToSchedule}
                    </button>
                </div>
            </div>
        );
    }

    const savedCount = savedIds.length;

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/exams/" + id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow hover:bg-gray-100 sm:h-12 sm:w-12"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div className="min-w-0">
                        <p className="truncate text-sm text-gray-500">{text.breadcrumb}</p>
                        <h1 className="mt-1 truncate text-2xl font-bold text-slate-800 sm:text-3xl">
                            {exam?.examName}
                        </h1>
                        <p className="mt-1 text-gray-500">
                            {text.std} {exam?.standard} - {exam?.division}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow transition hover:border-[#5B2EFF] hover:text-[#5B2EFF] sm:py-3"
                    >
                        <Languages size={16} />
                        {text.switchLang}
                    </button>

                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db] disabled:opacity-60 disabled:hover:scale-100 sm:px-6 sm:py-3"
                    >
                        <Save size={18} />
                        {saving ? text.saving : text.saveAll}
                    </button>
                </div>
            </div>

            {/* ============================== Progress Bar ============================== */}

            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow sm:mb-7 sm:p-5">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-gray-700">
                        {text.progress} {savedCount} / {students.length} {text.studentsSaved}
                    </p>

                    <p className="text-sm text-gray-500">
                        {students.length > 0 ? Math.round((savedCount / students.length) * 100) : 0}%{" "}
                        {text.complete}
                    </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                        style={{
                            width:
                                students.length > 0
                                    ? Math.round((savedCount / students.length) * 100) + "%"
                                    : "0%"
                        }}
                    ></div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                    {schedule.map((sch) => (
                        <div
                            key={sch._id}
                            className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
                        >
                            {sch.subject} / {sch.totalMarks}
                        </div>
                    ))}
                </div>
            </div>

            {/* ============================== Students Marks List ============================== */}

            {students.length === 0 && (
                <div className="rounded-3xl bg-white p-8 text-center shadow sm:p-16">
                    <h2 className="text-xl font-semibold text-gray-600">
                        {text.noStudentsTitle}
                    </h2>
                    <p className="mt-2 text-gray-400">
                        {text.noStudentsSub} {text.std} {exam?.standard} - {exam?.division}.
                    </p>
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
                                className={
                                    "rounded-3xl border bg-white p-4 shadow transition sm:p-6 " +
                                    (isSaved ? "border-green-200" : "border-gray-100")
                                }
                            >
                                {/* Student Info Row */}

                                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                            {index + 1}
                                        </div>

                                        {student.photo ? (
                                            <img
                                                src={
                                                    "http://localhost:5000/uploads/students/" +
                                                    student.photo
                                                }
                                                alt={student.fullName}
                                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                                {student.fullName.charAt(0)}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-800">
                                                {student.fullName}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {text.grLabel} {student.grNumber}
                                            </p>
                                        </div>

                                        {isSaved && (
                                            <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                <CheckCircle size={12} />
                                                {text.saved}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleSaveStudent(student)}
                                        disabled={saving}
                                        className="shrink-0 rounded-xl bg-[#5B2EFF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#4724db] disabled:opacity-60"
                                    >
                                        {saving ? "..." : isSaved ? text.update : text.save}
                                    </button>
                                </div>

                                {/* Marks Grid */}

                                <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
                                    {schedule.map((sch) => {
                                        const marks = studentMarks[sch.subject] || "";
                                        const isInvalid =
                                            marks !== "" &&
                                            (Number(marks) < 0 || Number(marks) > sch.totalMarks);
                                        const isPassing =
                                            marks !== "" && Number(marks) >= sch.passingMarks;

                                        return (
                                            <div key={sch._id}>
                                                <label className="mb-1 block truncate text-xs font-medium text-gray-500">
                                                    {sch.subject}
                                                    <span className="ml-1 text-gray-400">
                                                        / {sch.totalMarks}
                                                    </span>
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={sch.totalMarks}
                                                    value={marks}
                                                    onChange={(e) =>
                                                        handleMarkChange(
                                                            student._id,
                                                            sch.subject,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0"
                                                    className={
                                                        "h-11 w-full rounded-xl border px-3 text-center font-semibold outline-none " +
                                                        (isInvalid
                                                            ? "border-red-400 bg-red-50 text-red-600"
                                                            : marks !== "" && isPassing
                                                            ? "border-green-400 bg-green-50 text-green-700"
                                                            : marks !== "" && !isPassing
                                                            ? "border-red-300 bg-red-50 text-red-600"
                                                            : "focus:border-[#5B2EFF]")
                                                    }
                                                />

                                                {marks !== "" && (
                                                    <p
                                                        className={
                                                            "mt-1 text-center text-xs font-semibold " +
                                                            (isPassing
                                                                ? "text-green-600"
                                                                : "text-red-500")
                                                        }
                                                    >
                                                        {isPassing ? text.pass : text.fail}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Remarks */}

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                        {text.remarksOptional}
                                    </label>

                                    <input
                                        type="text"
                                        value={remarksMap[student._id] || ""}
                                        onChange={(e) =>
                                            handleRemarksChange(student._id, e.target.value)
                                        }
                                        placeholder={text.remarksPlaceholder}
                                        className="h-10 w-full rounded-xl border px-4 text-sm outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ============================== Bottom Save Bar ============================== */}

            {students.length > 0 && (
                <div className="sticky bottom-4 mt-7 flex flex-col gap-3 sm:bottom-6 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        onClick={() => navigate("/exams/results/" + id)}
                        className="rounded-xl border border-gray-200 bg-white px-8 py-4 font-semibold shadow transition hover:bg-gray-50"
                    >
                        {text.viewResults}
                    </button>

                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-10 py-4 font-semibold text-white shadow-2xl transition hover:scale-105 hover:bg-[#4724db] disabled:opacity-60 disabled:hover:scale-100"
                    >
                        <Save size={18} />
                        {saving ? text.savingAll : text.saveAllMarks}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarksEntry;