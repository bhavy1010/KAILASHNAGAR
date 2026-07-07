import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Paperclip, X } from "lucide-react";

import { getClasses } from "../../services/classService";
import { getHomeworkById, updateHomework } from "../../services/homeworkService";
import api from "../../config/axios";

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

const EditHomework = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [classes, setClasses] = useState([]);

    const [academicYears, setAcademicYears] = useState([]);

    const [loading, setLoading] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const [existingAttachment, setExistingAttachment] = useState("");

    const [formData, setFormData] = useState({

        title: "",

        description: "",

        subject: "",

        standard: "",

        division: "",

        classId: "",

        academicYearId: "",

        teacherId: "",

        dueDate: "",

        totalMarks: 10,

        status: "Active"

    });

    useEffect(() => {

        loadClasses();

        loadAcademicYears();

        loadHomework();

    }, []);

    const loadClasses = async () => {

        try {

            const response = await getClasses();

            setClasses(response.classes || []);

        } catch (error) {

            console.log(error);

        }

    };

    const loadAcademicYears = async () => {

        try {

            const response = await api.get("/academic-years/all");

            setAcademicYears(response.data?.academicYears || []);

        } catch (error) {

            console.log(error);

        }

    };

    const loadHomework = async () => {

        try {

            const response = await getHomeworkById(id);

            const hw = response.homework;

            setFormData({

                title: hw.title || "",

                description: hw.description || "",

                subject: hw.subject || "",

                standard: hw.standard || "",

                division: hw.division || "",

                classId: hw.classId?._id || hw.classId || "",

                academicYearId: hw.academicYearId?._id || hw.academicYearId || "",

                teacherId: hw.teacherId?._id || hw.teacherId || "",

                dueDate: hw.dueDate ? hw.dueDate.substring(0, 10) : "",

                totalMarks: hw.totalMarks || 10,

                status: hw.status || "Active"

            });

            setExistingAttachment(hw.attachmentOriginalName || hw.attachment || "");

        } catch (error) {

            console.log(error);

            alert("Unable to load homework");

        }

    };

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleClassChange = (e) => {

        const classId = e.target.value;

        const selected = classes.find((c) => c._id === classId);

        setFormData({

            ...formData,

            classId,

            standard: selected?.standard || "",

            division: selected?.division || ""

        });

    };

    const handleFile = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {

            alert("File size must be under 10 MB");

            return;

        }

        setSelectedFile(file);

    };

    const removeFile = () => {

        setSelectedFile(null);

    };

    const handleReset = () => {

        loadHomework();

        setSelectedFile(null);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.title.trim()) {

            alert("Title is required");

            return;

        }

        if (!formData.classId) {

            alert("Please select a class");

            return;

        }

        if (!formData.dueDate) {

            alert("Due date is required");

            return;

        }

        try {

            setLoading(true);

            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {

                if (value !== "" && value !== undefined) {

                    data.append(key, value);

                }

            });

            if (selectedFile) {

                data.append("attachment", selectedFile);

            }

            await updateHomework(id, data);

            alert("Homework Updated Successfully");

            navigate("/homework/list");

        } catch (error) {

            console.log(error);

            alert(error.response?.data?.message || "Unable to update homework");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/homework/list")}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >

                        <ArrowLeft size={22} />

                    </button>

                    <div>

                        <h1 className="text-4xl font-bold text-slate-800">
                            Edit Homework
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Update homework details.
                        </p>

                    </div>

                </div>

                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 shadow hover:bg-gray-100"
                    >

                        <RotateCcw size={18} />

                        Reset

                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-3 text-white font-semibold hover:bg-[#4724db] disabled:opacity-60"
                    >

                        <Save size={18} />

                        {loading ? "Updating..." : "Update Homework"}

                    </button>

                </div>

            </div>

            {/* ============================== Form ============================== */}

            <form onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

                    {/* ====== Left — Main Details ====== */}

                    <div className="xl:col-span-2 space-y-7">

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Homework Details</h2>

                            <div className="space-y-5">

                                <div>

                                    <label className="mb-2 block font-medium">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block font-medium">
                                        Description
                                    </label>

                                    <textarea
                                        rows="5"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF]"
                                    />

                                </div>

                                <div className="grid grid-cols-2 gap-5">

                                    <div>

                                        <label className="mb-2 block font-medium">
                                            Subject
                                        </label>

                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                        >

                                            <option value="">Select Subject</option>

                                            {SUBJECTS.map((s) => (

                                                <option key={s} value={s}>
                                                    {s}
                                                </option>

                                            ))}

                                        </select>

                                    </div>

                                    <div>

                                        <label className="mb-2 block font-medium">
                                            Total Marks
                                        </label>

                                        <input
                                            type="number"
                                            name="totalMarks"
                                            value={formData.totalMarks}
                                            onChange={handleChange}
                                            min="1"
                                            max="100"
                                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* ====== Attachment ====== */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-2">
                                Attachment
                            </h2>

                            <p className="text-sm text-gray-400 mb-5">
                                PDF, Word, Excel or Image — max 10 MB
                            </p>

                            {existingAttachment && !selectedFile && (

                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-4">

                                    <div className="flex items-center gap-3">

                                        <Paperclip size={18} className="text-green-600" />

                                        <div>

                                            <p className="font-semibold text-gray-800">
                                                {existingAttachment}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                Current attachment
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}

                            {selectedFile && (

                                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-4">

                                    <div className="flex items-center gap-3">

                                        <Paperclip size={18} className="text-indigo-600" />

                                        <div>

                                            <p className="font-semibold text-gray-800">
                                                {selectedFile.name}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                {(selectedFile.size / 1024).toFixed(1)} KB — New file
                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition"
                                    >

                                        <X size={16} className="text-red-600" />

                                    </button>

                                </div>

                            )}

                            <label
                                htmlFor="attachment"
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-[#5B2EFF] hover:bg-indigo-50 transition"
                            >

                                <Paperclip size={30} className="text-gray-400 mb-3" />

                                <p className="font-semibold text-gray-600">
                                    {existingAttachment ? "Click to replace file" : "Click to upload file"}
                                </p>

                                <p className="text-sm text-gray-400 mt-1">
                                    PDF, Word, Excel or Image
                                </p>

                                <input
                                    id="attachment"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                                    className="hidden"
                                    onChange={handleFile}
                                />

                            </label>

                        </div>

                    </div>

                    {/* ====== Right Panel ====== */}

                    <div className="space-y-7">

                        {/* Assign To */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Assign To</h2>

                            <div className="space-y-5">

                                <div>

                                    <label className="mb-2 block font-medium">
                                        Class
                                    </label>

                                    <select
                                        value={formData.classId}
                                        onChange={handleClassChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >

                                        <option value="">Select Class</option>

                                        {classes.map((cls) => (

                                            <option key={cls._id} value={cls._id}>
                                                Std {cls.standard} - {cls.division}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-2 block font-medium">
                                        Academic Year
                                    </label>

                                    <select
                                        name="academicYearId"
                                        value={formData.academicYearId}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >

                                        <option value="">Select Year</option>

                                        {academicYears.map((year) => (

                                            <option key={year._id} value={year._id}>
                                                {year.yearName} {year.isActive ? "(Active)" : ""}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                            </div>

                        </div>

                        {/* Schedule */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Schedule</h2>

                            <div className="space-y-5">

                                <div>

                                    <label className="mb-2 block font-medium">
                                        Due Date
                                    </label>

                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block font-medium">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >

                                        <option value="Active">Active</option>

                                        <option value="Closed">Closed</option>

                                    </select>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ============================== Bottom Save Bar ============================== */}

                <div className="mt-8 flex items-center justify-end gap-4">

                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-medium hover:bg-gray-100"
                    >
                        Reset
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-[#5B2EFF] px-10 py-3 text-white font-semibold hover:bg-[#4724db] disabled:opacity-60"
                    >
                        {loading ? "Updating..." : "Update Homework"}
                    </button>

                </div>

            </form>

        </div>

    );

};

export default EditHomework;