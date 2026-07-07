import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    Paperclip,
    X
} from "lucide-react";

import { getClasses } from "../../services/classService";
import { createHomework } from "../../services/homeworkService";
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

const todayStr = () => new Date().toISOString().substring(0, 10);

const CreateHomework = () => {

    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);

    const [academicYears, setAcademicYears] = useState([]);

    const [loading, setLoading] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const initialFormData = {

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

    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {

        loadDependencies();

    }, []);

    const loadDependencies = async () => {

        try {

            const [classResponse, yearResponse] = await Promise.all([

                getClasses(),

                api.get("/academic-years/all")

            ]);

            setClasses(classResponse.classes || []);

            const years = yearResponse.data?.academicYears || [];

            setAcademicYears(years);

            // Auto-select active academic year
            const activeYear = years.find((y) => y.isActive);

            if (activeYear) {

                setFormData((prev) => ({

                    ...prev,

                    academicYearId: activeYear._id

                }));

            }

        } catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]: value

        }));

    };

    const handleClassChange = (e) => {

        const classId = e.target.value;

        const selectedClass = classes.find(

            (c) => c._id === classId

        );

        setFormData((prev) => ({

            ...prev,

            classId,

            standard: selectedClass?.standard || "",

            division: selectedClass?.division || ""

        }));

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

        setFormData(initialFormData);

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

        // Core required fields
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("subject", formData.subject);
        data.append("classId", formData.classId);
        data.append("standard", formData.standard);
        data.append("division", formData.division);
        data.append("dueDate", formData.dueDate);
        data.append("totalMarks", formData.totalMarks);
        data.append("status", formData.status);

        // Optional — only append if present
        if (formData.academicYearId) {
            data.append("academicYearId", formData.academicYearId);
        }

        if (formData.teacherId) {
            data.append("teacherId", formData.teacherId);
        }

        if (selectedFile) {
            data.append("attachment", selectedFile);
        }

        await createHomework(data);

        navigate("/homework/list");

    } catch (error) {

        console.log(error);

        alert(error.response?.data?.message || "Unable to create homework");

    } finally {

        setLoading(false);

    }

};

    const divisionsForStandard = [

        ...new Set(

            classes

                .filter(

                    (c) =>

                        String(c.standard) === String(formData.standard)

                )

                .map((c) => c.division)

        )

    ];

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ===================== Header ===================== */}

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

                            Create Homework

                        </h1>

                        <p className="mt-2 text-slate-500">

                            Assign new homework to a class.

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
                        type="submit"
                        form="createHomeworkForm"
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-8 py-3 text-white font-semibold shadow-lg hover:bg-[#4724db] hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
                    >

                        <Save size={18} />

                        {loading ? "Saving..." : "Save Homework"}

                    </button>

                </div>

            </div>

            <form id="createHomeworkForm" onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

                    {/* ===================== Main Info ===================== */}

                    <div className="xl:col-span-2 space-y-7">

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">

                                Homework Details

                            </h2>

                            <div className="space-y-5">

                                <div>

                                    <label className="mb-2 block font-medium">

                                        Title <span className="text-red-500">*</span>

                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Chapter 5 Exercise"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block font-medium">

                                        Description <span className="text-red-500">*</span>

                                    </label>

                                    <textarea
                                        rows="5"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe what students need to do..."
                                        className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF]"
                                    />

                                </div>

                                <div className="grid grid-cols-2 gap-5">

                                    <div>

                                        <label className="mb-2 block font-medium">

                                            Subject <span className="text-red-500">*</span>

                                        </label>

                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                        >

                                            <option value="">Select Subject</option>

                                            {

                                                SUBJECTS.map((s) => (

                                                    <option key={s} value={s}>

                                                        {s}

                                                    </option>

                                                ))

                                            }

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

                        {/* ===================== Attachment ===================== */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-2">

                                Attachment

                                <span className="ml-2 text-sm font-normal text-gray-400">

                                    (Optional — PDF, Word, Excel, Image up to 10 MB)

                                </span>

                            </h2>

                            {

                                selectedFile ? (

                                    <div className="mt-5 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4">

                                        <div className="flex items-center gap-3">

                                            <Paperclip
                                                size={20}
                                                className="text-indigo-600"
                                            />

                                            <div>

                                                <p className="font-semibold text-gray-800">

                                                    {selectedFile.name}

                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">

                                                    {(selectedFile.size / 1024).toFixed(1)} KB

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

                                ) : (

                                    <label
                                        htmlFor="attachment"
                                        className="mt-5 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 cursor-pointer hover:border-[#5B2EFF] hover:bg-indigo-50 transition"
                                    >

                                        <Paperclip
                                            size={36}
                                            className="text-gray-400 mb-3"
                                        />

                                        <p className="font-semibold text-gray-600">

                                            Click to upload file

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

                                )

                            }

                        </div>

                    </div>

                    {/* ===================== Right Panel ===================== */}

                    <div className="space-y-7">

                        {/* Class Assignment */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">

                                Assign To

                            </h2>

                            <div className="space-y-5">

                                <div>

                                    <label className="mb-2 block font-medium">

                                        Class <span className="text-red-500">*</span>

                                    </label>

                                    <select
                                        value={formData.classId}
                                        onChange={handleClassChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >

                                        <option value="">Select Class</option>

                                        {

                                            classes.map((cls) => (

                                                <option key={cls._id} value={cls._id}>

                                                    Std {cls.standard} - {cls.division}

                                                </option>

                                            ))

                                        }

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-2 block font-medium">

                                        Teacher ID

                                    </label>

                                    <input
                                        type="text"
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleChange}
                                        placeholder="Teacher ID"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />

                                    <p className="text-xs text-gray-400 mt-2">

                                        Auto-fills when teacher login is wired in.

                                    </p>

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

                                        {

                                            academicYears.map((year) => (

                                                <option key={year._id} value={year._id}>

                                                    {year.yearName}

                                                    {year.isActive ? " (Active)" : ""}

                                                </option>

                                            ))

                                        }

                                    </select>

                                </div>

                            </div>

                        </div>

                        {/* Schedule */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">

                                Schedule

                            </h2>

                            <div className="space-y-5">

                                <div>

                                    <label className="mb-2 block font-medium">

                                        Due Date <span className="text-red-500">*</span>

                                    </label>

                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        min={todayStr()}
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

                {/* ===================== Bottom Save Bar ===================== */}

                <div className="mt-8 flex justify-end gap-4">

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

                        {loading ? "Saving..." : "Save Homework"}

                    </button>

                </div>

            </form>

        </div>

    );

};

export default CreateHomework;