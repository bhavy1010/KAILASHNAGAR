import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Calendar, Languages } from "lucide-react";

import { getExamById } from "../../services/examService";
import {
    getScheduleByExam,
    addSchedule,
    updateSchedule,
    deleteSchedule
} from "../../services/examScheduleService";
import { useLanguage } from "../../context/LanguageContext";

const SUBJECTS = [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Gujarati",
    "Social Science",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Physical Education",
    "Art",
    "Music",
    "Other"
];

const SUBJECT_LABEL_GU = {
    Mathematics: "ગણિત",
    Science: "વિજ્ઞાન",
    English: "અંગ્રેજી",
    Hindi: "હિન્દી",
    Gujarati: "ગુજરાતી",
    "Social Science": "સામાજિક વિજ્ઞાન",
    History: "ઇતિહાસ",
    Geography: "ભૂગોળ",
    Physics: "ભૌતિકશાસ્ત્ર",
    Chemistry: "રસાયણશાસ્ત્ર",
    Biology: "જીવવિજ્ઞાન",
    "Computer Science": "કમ્પ્યુટર વિજ્ઞાન",
    "Physical Education": "શારીરિક શિક્ષણ",
    Art: "કલા",
    Music: "સંગીત",
    Other: "અન્ય"
};

const emptyRow = {
    subject: "",
    examDate: "",
    startTime: "",
    endTime: "",
    totalMarks: "",
    passingMarks: "",
    roomNumber: "",
    notes: ""
};

const ExamSchedule = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [exam, setExam] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState(emptyRow);

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        breadcrumb: isGujarati ? "પરીક્ષા › સમયપત્રક" : "Exams › Schedule",
        defaultTitle: isGujarati ? "પરીક્ષા સમયપત્રક" : "Exam Schedule",
        std: isGujarati ? "ધોરણ" : "Std",
        addSubject: isGujarati ? "વિષય ઉમેરો" : "Add Subject",
        examType: isGujarati ? "પરીક્ષા પ્રકાર" : "Exam Type",
        startDate: isGujarati ? "શરૂઆત તારીખ" : "Start Date",
        endDate: isGujarati ? "સમાપ્તિ તારીખ" : "End Date",
        subjectsAdded: isGujarati ? "ઉમેરેલા વિષયો" : "Subjects Added",
        addSubjectToSchedule: isGujarati
            ? "સમયપત્રકમાં વિષય ઉમેરો"
            : "Add Subject to Schedule",
        subject: isGujarati ? "વિષય" : "Subject",
        selectSubject: isGujarati ? "વિષય પસંદ કરો" : "Select Subject",
        examDate: isGujarati ? "પરીક્ષા તારીખ" : "Exam Date",
        roomNumber: isGujarati ? "રૂમ નંબર" : "Room Number",
        roomPlaceholder: isGujarati ? "દા.ત. રૂમ 101" : "e.g. Room 101",
        startTime: isGujarati ? "શરૂઆત સમય" : "Start Time",
        endTime: isGujarati ? "સમાપ્તિ સમય" : "End Time",
        notes: isGujarati ? "નોંધ" : "Notes",
        notesPlaceholder: isGujarati ? "વૈકલ્પિક નોંધ" : "Optional notes",
        totalMarks: isGujarati ? "કુલ માર્ક્સ" : "Total Marks",
        passingMarks: isGujarati ? "પાસિંગ માર્ક્સ" : "Passing Marks",
        cancel: isGujarati ? "રદ કરો" : "Cancel",
        saving: isGujarati ? "સાચવી રહ્યું છે..." : "Saving...",
        saveChanges: isGujarati ? "ફેરફારો સાચવો" : "Save Changes",
        subjectSchedule: isGujarati ? "વિષય સમયપત્રક" : "Subject Schedule",
        subjectsAddedSuffix: isGujarati ? "વિષયો ઉમેરાયા" : "subjects added",
        noSubjectsTitle: isGujarati ? "કોઈ વિષય ઉમેરાયો નથી" : "No Subjects Added",
        noSubjectsSub: isGujarati
            ? "સમયપત્રક બનાવવા માટે \"વિષય ઉમેરો\" પર ક્લિક કરો."
            : 'Click "Add Subject" to build the schedule.',
        editing: isGujarati ? "સંપાદન:" : "Editing:",
        date: isGujarati ? "તારીખ" : "Date",
        time: isGujarati ? "સમય" : "Time",
        marks: isGujarati ? "માર્ક્સ" : "Marks",
        room: isGujarati ? "રૂમ" : "Room",
        pass: isGujarati ? "પાસ:" : "Pass:",
        edit: isGujarati ? "સંપાદિત કરો" : "Edit",
        proceedToMarks: isGujarati ? "માર્ક્સ એન્ટ્રી પર જાઓ" : "Proceed to Marks Entry",
        selectSubjectError: isGujarati ? "કૃપા કરીને વિષય પસંદ કરો" : "Please select a subject",
        selectDateError: isGujarati ? "કૃપા કરીને પરીક્ષા તારીખ પસંદ કરો" : "Please select exam date",
        totalMarksRequired: isGujarati ? "કુલ માર્ક્સ જરૂરી છે" : "Total marks is required",
        passingMarksRequired: isGujarati ? "પાસિંગ માર્ક્સ જરૂરી છે" : "Passing marks is required",
        addError: isGujarati ? "સમયપત્રક ઉમેરી શકાયું નથી" : "Unable to add schedule",
        updateError: isGujarati ? "સમયપત્રક અપડેટ કરી શકાયું નથી" : "Unable to update schedule",
        confirmDelete: isGujarati
            ? "સમયપત્રકમાંથી આ વિષય દૂર કરવો છે?"
            : "Remove this subject from the schedule?",
        deleteError: isGujarati ? "કાઢી શકાયું નથી" : "Unable to delete"
    };

    const subjectLabel = (subject) =>
        isGujarati ? SUBJECT_LABEL_GU[subject] || subject : subject;

    const formatDate = (date, opts) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", opts);
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [examRes, scheduleRes] = await Promise.all([
                getExamById(id),
                getScheduleByExam(id)
            ]);

            setExam(examRes.exam);
            setSchedule(scheduleRes.schedule || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChange = (e) => {
        setAddForm({
            ...addForm,
            [e.target.name]: e.target.value
        });
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAddSubmit = async () => {
        if (!addForm.subject) {
            alert(text.selectSubjectError);
            return;
        }

        if (!addForm.examDate) {
            alert(text.selectDateError);
            return;
        }

        if (!addForm.totalMarks) {
            alert(text.totalMarksRequired);
            return;
        }

        if (!addForm.passingMarks) {
            alert(text.passingMarksRequired);
            return;
        }

        try {
            setSaving(true);

            await addSchedule({
                ...addForm,
                examId: id,
                totalMarks: Number(addForm.totalMarks),
                passingMarks: Number(addForm.passingMarks)
            });

            setAddForm(emptyRow);
            setShowAddForm(false);
            loadData();
        } catch (error) {
            alert(error.response?.data?.message || text.addError);
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (item) => {
        setEditingId(item._id);
        setEditForm({
            subject: item.subject || "",
            examDate: item.examDate ? item.examDate.substring(0, 10) : "",
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            totalMarks: item.totalMarks || "",
            passingMarks: item.passingMarks || "",
            roomNumber: item.roomNumber || "",
            notes: item.notes || ""
        });
    };

    const handleEditSubmit = async (itemId) => {
        try {
            setSaving(true);

            await updateSchedule(itemId, {
                ...editForm,
                totalMarks: Number(editForm.totalMarks),
                passingMarks: Number(editForm.passingMarks)
            });

            setEditingId(null);
            loadData();
        } catch (error) {
            alert(error.response?.data?.message || text.updateError);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm(text.confirmDelete)) return;

        try {
            await deleteSchedule(itemId);
            loadData();
        } catch (error) {
            alert(error.response?.data?.message || text.deleteError);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

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
                            {exam?.examName || text.defaultTitle}
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
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db] sm:px-6 sm:py-3"
                    >
                        <Plus size={18} />
                        {text.addSubject}
                    </button>
                </div>
            </div>

            {/* ============================== Exam Info Card ============================== */}

            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow sm:mb-7 sm:p-6">
                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
                    <div>
                        <p className="text-xs text-gray-400">{text.examType}</p>
                        <p className="mt-1 truncate font-semibold text-gray-800">
                            {exam?.examType}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">{text.startDate}</p>
                        <p className="mt-1 font-semibold text-gray-800">
                            {formatDate(exam?.startDate, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">{text.endDate}</p>
                        <p className="mt-1 font-semibold text-gray-800">
                            {formatDate(exam?.endDate, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">{text.subjectsAdded}</p>
                        <p className="mt-1 font-semibold text-indigo-600">{schedule.length}</p>
                    </div>
                </div>
            </div>

            {/* ============================== Add Form ============================== */}

            {showAddForm && (
                <div className="mb-6 rounded-3xl border border-indigo-100 bg-white p-5 shadow sm:mb-7 sm:p-8">
                    <h2 className="mb-6 text-xl font-bold">{text.addSubjectToSchedule}</h2>

                    <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block font-medium">{text.subject}</label>
                            <select
                                name="subject"
                                value={addForm.subject}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            >
                                <option value="">{text.selectSubject}</option>
                                {SUBJECTS.map((s) => (
                                    <option key={s} value={s}>
                                        {subjectLabel(s)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">{text.examDate}</label>
                            <input
                                type="date"
                                name="examDate"
                                value={addForm.examDate}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">{text.roomNumber}</label>
                            <input
                                type="text"
                                name="roomNumber"
                                value={addForm.roomNumber}
                                onChange={handleAddChange}
                                placeholder={text.roomPlaceholder}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">{text.startTime}</label>
                            <input
                                type="time"
                                name="startTime"
                                value={addForm.startTime}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">{text.endTime}</label>
                            <input
                                type="time"
                                name="endTime"
                                value={addForm.endTime}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">{text.notes}</label>
                            <input
                                type="text"
                                name="notes"
                                value={addForm.notes}
                                onChange={handleAddChange}
                                placeholder={text.notesPlaceholder}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">{text.totalMarks}</label>
                            <input
                                type="number"
                                name="totalMarks"
                                value={addForm.totalMarks}
                                onChange={handleAddChange}
                                placeholder="e.g. 100"
                                min="0"
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">{text.passingMarks}</label>
                            <input
                                type="number"
                                name="passingMarks"
                                value={addForm.passingMarks}
                                onChange={handleAddChange}
                                placeholder="e.g. 40"
                                min="0"
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setAddForm(emptyRow);
                            }}
                            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium hover:bg-gray-100"
                        >
                            {text.cancel}
                        </button>

                        <button
                            onClick={handleAddSubmit}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-3 font-semibold text-white hover:bg-[#4724db] disabled:opacity-60"
                        >
                            <Save size={16} />
                            {saving ? text.saving : text.addSubject}
                        </button>
                    </div>
                </div>
            )}

            {/* ============================== Schedule List ============================== */}

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow">
                <div className="border-b p-5 sm:p-6">
                    <h2 className="text-xl font-bold">{text.subjectSchedule}</h2>
                    <p className="mt-1 text-gray-500">
                        {schedule.length} {text.subjectsAddedSuffix}
                    </p>
                </div>

                {schedule.length === 0 && (
                    <div className="py-16 text-center">
                        <Calendar size={56} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold text-gray-600">
                            {text.noSubjectsTitle}
                        </h2>
                        <p className="mt-2 text-gray-400">{text.noSubjectsSub}</p>
                    </div>
                )}

                {schedule.length > 0 && (
                    <div className="divide-y">
                        {schedule.map((item) => (
                            <div key={item._id}>
                                {editingId === item._id ? (
                                    /* ====== Edit Row ====== */

                                    <div className="bg-indigo-50 p-4 sm:p-6">
                                        <h3 className="mb-5 font-bold text-indigo-700">
                                            {text.editing} {subjectLabel(item.subject)}
                                        </h3>

                                        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    {text.subject}
                                                </label>
                                                <select
                                                    name="subject"
                                                    value={editForm.subject}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border bg-white px-4 outline-none focus:border-[#5B2EFF]"
                                                >
                                                    {SUBJECTS.map((s) => (
                                                        <option key={s} value={s}>
                                                            {subjectLabel(s)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    {text.examDate}
                                                </label>
                                                <input
                                                    type="date"
                                                    name="examDate"
                                                    value={editForm.examDate}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border bg-white px-4 outline-none focus:border-[#5B2EFF]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    {text.roomNumber}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="roomNumber"
                                                    value={editForm.roomNumber}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border bg-white px-4 outline-none focus:border-[#5B2EFF]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    {text.startTime}
                                                </label>
                                                <input
                                                    type="time"
                                                    name="startTime"
                                                    value={editForm.startTime}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border bg-white px-4 outline-none focus:border-[#5B2EFF]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    {text.endTime}
                                                </label>
                                                <input
                                                    type="time"
                                                    name="endTime"
                                                    value={editForm.endTime}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border bg-white px-4 outline-none focus:border-[#5B2EFF]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    {text.totalMarks}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="totalMarks"
                                                    value={editForm.totalMarks}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border bg-white px-4 outline-none focus:border-[#5B2EFF]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    {text.passingMarks}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="passingMarks"
                                                    value={editForm.passingMarks}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border bg-white px-4 outline-none focus:border-[#5B2EFF]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium hover:bg-gray-100"
                                            >
                                                {text.cancel}
                                            </button>

                                            <button
                                                onClick={() => handleEditSubmit(item._id)}
                                                disabled={saving}
                                                className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4724db] disabled:opacity-60"
                                            >
                                                <Save size={14} />
                                                {saving ? text.saving : text.saveChanges}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ====== Display Row ====== */

                                    <div className="flex flex-col gap-4 px-4 py-5 transition hover:bg-gray-50 sm:px-6 lg:flex-row lg:items-center">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
                                            <Calendar size={22} className="text-indigo-600" />
                                        </div>

                                        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-5">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    {text.subject}
                                                </p>
                                                <p className="mt-1 truncate font-semibold text-gray-800">
                                                    {subjectLabel(item.subject)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    {text.date}
                                                </p>
                                                <p className="mt-1 font-semibold text-gray-700">
                                                    {formatDate(item.examDate, {
                                                        day: "2-digit",
                                                        month: "short"
                                                    })}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    {text.time}
                                                </p>
                                                <p className="mt-1 font-semibold text-gray-700">
                                                    {item.startTime && item.endTime
                                                        ? item.startTime + " - " + item.endTime
                                                        : "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    {text.marks}
                                                </p>
                                                <p className="mt-1 font-semibold text-gray-700">
                                                    {item.totalMarks} / {text.pass}{" "}
                                                    {item.passingMarks}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    {text.room}
                                                </p>
                                                <p className="mt-1 font-semibold text-gray-700">
                                                    {item.roomNumber || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-white transition hover:bg-amber-600"
                                            >
                                                {text.edit}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ============================== Bottom Actions ============================== */}

            {schedule.length > 0 && (
                <div className="mt-7 flex justify-end">
                    <button
                        onClick={() => navigate("/exams/marks/" + id)}
                        className="w-full rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 sm:w-auto"
                    >
                        {text.proceedToMarks}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExamSchedule;