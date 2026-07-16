import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";

import { getClasses } from "../../services/classService";
import { createExam } from "../../services/examService";

const EXAM_TYPES = [
    "Unit Test",
    "Mid Term",
    "Final",
    "Weekly Test",
    "Mock Test",
    "Other"
];

const todayStr = () => new Date().toISOString().substring(0, 10);

const CreateExam = () => {

    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(false);

    const initialFormData = {
        examName: "",
        examType: "",
        standard: "",
        division: "",
        classId: "",
        startDate: "",
        endDate: "",
        description: "",
        totalMarks: "",
        passingMarks: "",
        status: "Upcoming"
    };

    const [formData, setFormData] = useState(initialFormData);

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

    const handleReset = () => {

        setFormData(initialFormData);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.examName.trim()) {
            alert("Exam name is required");
            return;
        }

        if (!formData.examType) {
            alert("Please select exam type");
            return;
        }

        if (!formData.classId) {
            alert("Please select a class");
            return;
        }

        if (!formData.startDate) {
            alert("Start date is required");
            return;
        }

        if (!formData.endDate) {
            alert("End date is required");
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            alert("End date cannot be before start date");
            return;
        }

        try {

            setLoading(true);

            const payload = {
                examName: formData.examName,
                examType: formData.examType,
                standard: formData.standard,
                division: formData.division,
                startDate: formData.startDate,
                endDate: formData.endDate,
                description: formData.description,
                status: formData.status
            };

            if (formData.classId) payload.classId = formData.classId;
            if (formData.totalMarks) payload.totalMarks = Number(formData.totalMarks);
            if (formData.passingMarks) payload.passingMarks = Number(formData.passingMarks);

            await createExam(payload);

            navigate("/exams/list");

        } catch (error) {

            console.log(error);
            alert(error.response?.data?.message || "Unable to create exam");

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
                        onClick={() => navigate("/exams/list")}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">Create Exam</h1>
                        <p className="mt-2 text-slate-500">Define a new exam for a class.</p>
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
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-8 py-3 text-white font-semibold shadow-lg hover:bg-[#4724db] hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
                    >
                        <Save size={18} />
                        {loading ? "Saving..." : "Save Exam"}
                    </button>

                </div>

            </div>

            {/* ============================== Form ============================== */}

            <form onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

                    {/* ====== Left — Main Details ====== */}

                    <div className="xl:col-span-2 space-y-7">

                        {/* Basic Info */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Exam Information</h2>

                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Exam Name
                                    </label>
                                    <input
                                        type="text"
                                        name="examName"
                                        value={formData.examName}
                                        onChange={handleChange}
                                        placeholder="e.g. Mid Term Examination 2024"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">

                                    <div>
                                        <label className="mb-2 block font-medium">
                                            Exam Type
                                        </label>
                                        <select
                                            name="examType"
                                            value={formData.examType}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                        >
                                            <option value="">Select Type</option>
                                            {EXAM_TYPES.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
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
                                            <option value="Upcoming">Upcoming</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>

                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Description
                                    </label>
                                    <textarea
                                        rows="4"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Optional notes about this exam..."
                                        className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* Marks */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Marks Configuration</h2>

                            <p className="text-gray-400 text-sm mb-5">
                                Optional — you can set per-subject marks in the Exam Schedule instead.
                            </p>

                            <div className="grid grid-cols-2 gap-5">

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Total Marks
                                    </label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleChange}
                                        placeholder="e.g. 500"
                                        min="0"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Passing Marks
                                    </label>
                                    <input
                                        type="number"
                                        name="passingMarks"
                                        value={formData.passingMarks}
                                        onChange={handleChange}
                                        placeholder="e.g. 200"
                                        min="0"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* ====== Right Panel ====== */}

                    <div className="space-y-7">

                        {/* Class Assignment */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Assign To Class</h2>

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

                                {formData.standard && (

                                    <div className="bg-indigo-50 rounded-xl p-4">
                                        <p className="text-sm text-indigo-600 font-semibold">Selected Class</p>
                                        <p className="text-lg font-bold text-indigo-800 mt-1">
                                            Std {formData.standard} - {formData.division}
                                        </p>
                                    </div>

                                )}

                            </div>

                        </div>

                        {/* Schedule */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Exam Period</h2>

                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        min={formData.startDate || todayStr()}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* Tips */}

                        <div className="bg-blue-50 rounded-3xl p-7 border border-blue-100">

                            <h2 className="text-lg font-bold mb-4 text-blue-800">Next Steps</h2>

                            <ul className="space-y-3 text-sm text-blue-700">

                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">1.</span>
                                    After creating the exam, add subjects to the schedule.
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">2.</span>
                                    Set date, time and marks for each subject.
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">3.</span>
                                    Enter student marks after the exam is completed.
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">4.</span>
                                    Results and ranks are generated automatically.
                                </li>

                            </ul>

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
                        {loading ? "Saving..." : "Save Exam"}
                    </button>

                </div>

            </form>

        </div>

    );

};

export default CreateExam;