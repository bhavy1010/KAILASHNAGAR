import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";

import { getClasses } from "../../services/classService";
import { getExamById, updateExam } from "../../services/examService";

const EXAM_TYPES = [
    "Unit Test",
    "Mid Term",
    "Final",
    "Weekly Test",
    "Mock Test",
    "Other"
];

const EditExam = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
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
    });

    useEffect(() => {

        loadClasses();
        loadExam();

    }, []);

    const loadClasses = async () => {

        try {

            const response = await getClasses();
            setClasses(response.classes || []);

        } catch (error) {

            console.log(error);

        }

    };

    const loadExam = async () => {

        try {

            const response = await getExamById(id);
            const exam = response.exam;

            setFormData({
                examName: exam.examName || "",
                examType: exam.examType || "",
                standard: exam.standard || "",
                division: exam.division || "",
                classId: exam.classId?._id || exam.classId || "",
                startDate: exam.startDate ? exam.startDate.substring(0, 10) : "",
                endDate: exam.endDate ? exam.endDate.substring(0, 10) : "",
                description: exam.description || "",
                totalMarks: exam.totalMarks || "",
                passingMarks: exam.passingMarks || "",
                status: exam.status || "Upcoming"
            });

        } catch (error) {

            console.log(error);
            alert("Unable to load exam");

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

        loadExam();

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

            await updateExam(id, payload);

            alert("Exam Updated Successfully");
            navigate("/exams/list");

        } catch (error) {

            console.log(error);
            alert(error.response?.data?.message || "Unable to update exam");

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
                        <h1 className="text-4xl font-bold text-slate-800">Edit Exam</h1>
                        <p className="mt-2 text-slate-500">Update exam information.</p>
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
                        {loading ? "Updating..." : "Update Exam"}
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
                                    <label className="mb-2 block font-medium">Exam Name</label>
                                    <input
                                        type="text"
                                        name="examName"
                                        value={formData.examName}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">

                                    <div>
                                        <label className="mb-2 block font-medium">Exam Type</label>
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
                                        <label className="mb-2 block font-medium">Status</label>
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
                                    <label className="mb-2 block font-medium">Description</label>
                                    <textarea
                                        rows="4"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* Marks */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Marks Configuration</h2>

                            <div className="grid grid-cols-2 gap-5">

                                <div>
                                    <label className="mb-2 block font-medium">Total Marks</label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleChange}
                                        min="0"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">Passing Marks</label>
                                    <input
                                        type="number"
                                        name="passingMarks"
                                        value={formData.passingMarks}
                                        onChange={handleChange}
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

                            <h2 className="text-xl font-bold mb-6">Class Assignment</h2>

                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block font-medium">Class</label>
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

                        {/* Exam Period */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Exam Period</h2>

                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block font-medium">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        min={formData.startDate}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* Quick Actions */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-lg font-bold mb-5">Quick Actions</h2>

                            <div className="space-y-3">

                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/" + id)}
                                    className="w-full py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition text-sm"
                                >
                                    View Exam Details
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/schedule/" + id)}
                                    className="w-full py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition text-sm"
                                >
                                    Manage Schedule
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/marks/" + id)}
                                    className="w-full py-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 font-semibold transition text-sm"
                                >
                                    Enter Marks
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/results/" + id)}
                                    className="w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition text-sm"
                                >
                                    View Results
                                </button>

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
                        {loading ? "Updating..." : "Update Exam"}
                    </button>

                </div>

            </form>

        </div>

    );

};

export default EditExam;