import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Calendar } from "lucide-react";

import { getExamById } from "../../services/examService";
import {
    getScheduleByExam,
    addSchedule,
    updateSchedule,
    deleteSchedule
} from "../../services/examScheduleService";

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

    const [exam, setExam] = useState(null);

    const [schedule, setSchedule] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState({});

    const [showAddForm, setShowAddForm] = useState(false);

    const [addForm, setAddForm] = useState(emptyRow);

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
            alert("Please select a subject");
            return;
        }

        if (!addForm.examDate) {
            alert("Please select exam date");
            return;
        }

        if (!addForm.totalMarks) {
            alert("Total marks is required");
            return;
        }

        if (!addForm.passingMarks) {
            alert("Passing marks is required");
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

            alert(error.response?.data?.message || "Unable to add schedule");

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

            alert(error.response?.data?.message || "Unable to update schedule");

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async (itemId) => {

        if (!window.confirm("Remove this subject from the schedule?")) return;

        try {

            await deleteSchedule(itemId);
            loadData();

        } catch (error) {

            alert(error.response?.data?.message || "Unable to delete");

        }

    };

    if (loading) {

        return (

            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

        );

    }

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
                        <p className="text-sm text-gray-500">
                            Exams &rsaquo; Schedule
                        </p>
                        <h1 className="text-3xl font-bold text-slate-800 mt-1">
                            {exam?.examName || "Exam Schedule"}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Std {exam?.standard} - {exam?.division}
                        </p>
                    </div>

                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-[#5B2EFF] hover:bg-[#4724db] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
                >
                    <Plus size={18} />
                    Add Subject
                </button>

            </div>

            {/* ============================== Exam Info Card ============================== */}

            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-7">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    <div>
                        <p className="text-xs text-gray-400">Exam Type</p>
                        <p className="font-semibold text-gray-800 mt-1">{exam?.examType}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">Start Date</p>
                        <p className="font-semibold text-gray-800 mt-1">
                            {exam?.startDate ? new Date(exam.startDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">End Date</p>
                        <p className="font-semibold text-gray-800 mt-1">
                            {exam?.endDate ? new Date(exam.endDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">Subjects Added</p>
                        <p className="font-semibold text-indigo-600 mt-1">{schedule.length}</p>
                    </div>

                </div>

            </div>

            {/* ============================== Add Form ============================== */}

            {showAddForm && (

                <div className="bg-white rounded-3xl shadow border border-indigo-100 p-8 mb-7">

                    <h2 className="text-xl font-bold mb-6">Add Subject to Schedule</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

                        <div>
                            <label className="mb-2 block font-medium">Subject</label>
                            <select
                                name="subject"
                                value={addForm.subject}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            >
                                <option value="">Select Subject</option>
                                {SUBJECTS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">Exam Date</label>
                            <input
                                type="date"
                                name="examDate"
                                value={addForm.examDate}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">Room Number</label>
                            <input
                                type="text"
                                name="roomNumber"
                                value={addForm.roomNumber}
                                onChange={handleAddChange}
                                placeholder="e.g. Room 101"
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                value={addForm.startTime}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                value={addForm.endTime}
                                onChange={handleAddChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                value={addForm.notes}
                                onChange={handleAddChange}
                                placeholder="Optional notes"
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">Total Marks</label>
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
                            <label className="mb-2 block font-medium">Passing Marks</label>
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

                    <div className="flex justify-end gap-3">

                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setAddForm(emptyRow);
                            }}
                            className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleAddSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B2EFF] text-white font-semibold hover:bg-[#4724db] disabled:opacity-60"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : "Add Subject"}
                        </button>

                    </div>

                </div>

            )}

            {/* ============================== Schedule Table ============================== */}

            <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Subject Schedule</h2>
                    <p className="text-gray-500 mt-1">{schedule.length} subjects added</p>
                </div>

                {schedule.length === 0 && (

                    <div className="py-16 text-center">
                        <Calendar size={56} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600">No Subjects Added</h2>
                        <p className="text-gray-400 mt-2">Click "Add Subject" to build the schedule.</p>
                    </div>

                )}

                {schedule.length > 0 && (

                    <div className="divide-y">

                        {schedule.map((item) => (

                            <div key={item._id}>

                                {editingId === item._id ? (

                                    /* ====== Edit Row ====== */

                                    <div className="p-6 bg-indigo-50">

                                        <h3 className="font-bold text-indigo-700 mb-5">
                                            Editing: {item.subject}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

                                            <div>
                                                <label className="mb-2 block font-medium text-sm">Subject</label>
                                                <select
                                                    name="subject"
                                                    value={editForm.subject}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] bg-white"
                                                >
                                                    {SUBJECTS.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block font-medium text-sm">Exam Date</label>
                                                <input
                                                    type="date"
                                                    name="examDate"
                                                    value={editForm.examDate}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block font-medium text-sm">Room Number</label>
                                                <input
                                                    type="text"
                                                    name="roomNumber"
                                                    value={editForm.roomNumber}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block font-medium text-sm">Start Time</label>
                                                <input
                                                    type="time"
                                                    name="startTime"
                                                    value={editForm.startTime}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block font-medium text-sm">End Time</label>
                                                <input
                                                    type="time"
                                                    name="endTime"
                                                    value={editForm.endTime}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block font-medium text-sm">Total Marks</label>
                                                <input
                                                    type="number"
                                                    name="totalMarks"
                                                    value={editForm.totalMarks}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block font-medium text-sm">Passing Marks</label>
                                                <input
                                                    type="number"
                                                    name="passingMarks"
                                                    value={editForm.passingMarks}
                                                    onChange={handleEditChange}
                                                    className="h-11 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF] bg-white"
                                                />
                                            </div>

                                        </div>

                                        <div className="flex justify-end gap-3">

                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-sm font-medium"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={() => handleEditSubmit(item._id)}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#5B2EFF] text-white text-sm font-semibold hover:bg-[#4724db] disabled:opacity-60"
                                            >
                                                <Save size={14} />
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    /* ====== Display Row ====== */

                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 px-6 py-5 hover:bg-gray-50 transition">

                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                                            <Calendar size={22} className="text-indigo-600" />
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">

                                            <div>
                                                <p className="text-xs text-gray-400">Subject</p>
                                                <p className="font-semibold text-gray-800 mt-1">{item.subject}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">Date</p>
                                                <p className="font-semibold text-gray-700 mt-1">
                                                    {item.examDate ? new Date(item.examDate).toLocaleDateString(undefined, { day: "2-digit", month: "short" }) : "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">Time</p>
                                                <p className="font-semibold text-gray-700 mt-1">
                                                    {item.startTime && item.endTime ? item.startTime + " - " + item.endTime : "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">Marks</p>
                                                <p className="font-semibold text-gray-700 mt-1">
                                                    {item.totalMarks} / Pass: {item.passingMarks}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">Room</p>
                                                <p className="font-semibold text-gray-700 mt-1">
                                                    {item.roomNumber || "-"}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex gap-2 shrink-0">

                                            <button
                                                onClick={() => openEdit(item)}
                                                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
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

                <div className="mt-7 flex justify-end gap-4">

                    <button
                        onClick={() => navigate("/exams/marks/" + id)}
                        className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                    >
                        Proceed to Marks Entry
                    </button>

                </div>

            )}

        </div>

    );

};

export default ExamSchedule;