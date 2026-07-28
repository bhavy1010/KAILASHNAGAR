import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Languages } from "lucide-react";

import { getStudents } from "../../services/studentService";
import { getExamById, updateExam } from "../../services/examService";
import { useLanguage } from "../../context/LanguageContext";

const EXAM_TYPES = ["Unit Test", "Mid Term", "Final", "Weekly Test", "Mock Test", "Other"];

const EXAM_TYPE_LABEL_GU = {
    "Unit Test": "એકમ કસોટી",
    "Mid Term": "મધ્ય સત્ર",
    Final: "અંતિમ",
    "Weekly Test": "સાપ્તાહિક કસોટી",
    "Mock Test": "મોક ટેસ્ટ",
    Other: "અન્ય"
};

const STATUS_LABEL_GU = {
    Upcoming: "આગામી",
    Ongoing: "ચાલુ",
    Completed: "પૂર્ણ"
};

const EditExam = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

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

    const text = {
        title: isGujarati ? "પરીક્ષા સંપાદિત કરો" : "Edit Exam",
        subtitle: isGujarati ? "પરીક્ષાની માહિતી અપડેટ કરો." : "Update exam information.",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        reset: isGujarati ? "રીસેટ" : "Reset",
        updating: isGujarati ? "અપડેટ થઈ રહ્યું છે..." : "Updating...",
        updateExam: isGujarati ? "પરીક્ષા અપડેટ કરો" : "Update Exam",
        examInformation: isGujarati ? "પરીક્ષા માહિતી" : "Exam Information",
        examName: isGujarati ? "પરીક્ષાનું નામ" : "Exam Name",
        examType: isGujarati ? "પરીક્ષા પ્રકાર" : "Exam Type",
        selectType: isGujarati ? "પ્રકાર પસંદ કરો" : "Select Type",
        status: isGujarati ? "સ્થિતિ" : "Status",
        description: isGujarati ? "વર્ણન" : "Description",
        marksConfig: isGujarati ? "માર્ક્સ કન્ફિગરેશન" : "Marks Configuration",
        totalMarks: isGujarati ? "કુલ માર્ક્સ" : "Total Marks",
        passingMarks: isGujarati ? "પાસિંગ માર્ક્સ" : "Passing Marks",
        classAssignment: isGujarati ? "ધોરણ સોંપણી" : "Class Assignment",
        class: isGujarati ? "ધોરણ" : "Class",
        selectClass: isGujarati ? "ધોરણ પસંદ કરો" : "Select Class",
        selectedClass: isGujarati ? "પસંદ કરેલ ધોરણ" : "Selected Class",
        std: isGujarati ? "ધોરણ" : "Std",
        examPeriod: isGujarati ? "પરીક્ષા સમયગાળો" : "Exam Period",
        startDate: isGujarati ? "શરૂઆત તારીખ" : "Start Date",
        endDate: isGujarati ? "સમાપ્તિ તારીખ" : "End Date",
        quickActions: isGujarati ? "ઝડપી ક્રિયાઓ" : "Quick Actions",
        viewDetails: isGujarati ? "પરીક્ષા વિગતો જુઓ" : "View Exam Details",
        manageSchedule: isGujarati ? "સમયપત્રક મેનેજ કરો" : "Manage Schedule",
        enterMarks: isGujarati ? "માર્ક્સ દાખલ કરો" : "Enter Marks",
        viewResults: isGujarati ? "પરિણામો જુઓ" : "View Results",
        loadError: isGujarati ? "પરીક્ષા લોડ કરી શકાઈ નથી" : "Unable to load exam",
        examNameRequired: isGujarati ? "પરીક્ષાનું નામ જરૂરી છે" : "Exam name is required",
        selectTypeError: isGujarati ? "કૃપા કરીને પરીક્ષા પ્રકાર પસંદ કરો" : "Please select exam type",
        startDateRequired: isGujarati ? "શરૂઆત તારીખ જરૂરી છે" : "Start date is required",
        endDateRequired: isGujarati ? "સમાપ્તિ તારીખ જરૂરી છે" : "End date is required",
        endDateError: isGujarati
            ? "સમાપ્તિ તારીખ શરૂઆત તારીખ પહેલાં ન હોઈ શકે"
            : "End date cannot be before start date",
        updateSuccess: isGujarati ? "પરીક્ષા સફળતાપૂર્વક અપડેટ થઈ" : "Exam Updated Successfully",
        updateError: isGujarati ? "પરીક્ષા અપડેટ કરી શકાઈ નથી" : "Unable to update exam"
    };

    const examTypeLabel = (type) => (isGujarati ? EXAM_TYPE_LABEL_GU[type] || type : type);
    const statusLabel = (status) => (isGujarati ? STATUS_LABEL_GU[status] || status : status);

    useEffect(() => {
        loadClasses();
        loadExam();
    }, []);

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
                            division: student.division
                        }
                    ])
                ).values()
            ].sort(
                (a, b) =>
                    a.standard - b.standard || a.division.localeCompare(b.division)
            );

            setClasses(realClasses);
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
                classId:
                    exam.standard && exam.division
                        ? `${exam.standard}-${exam.division}`
                        : "",
                startDate: exam.startDate ? exam.startDate.substring(0, 10) : "",
                endDate: exam.endDate ? exam.endDate.substring(0, 10) : "",
                description: exam.description || "",
                totalMarks: exam.totalMarks || "",
                passingMarks: exam.passingMarks || "",
                status: exam.status || "Upcoming"
            });
        } catch (error) {
            console.log(error);
            alert(text.loadError);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleClassChange = (e) => {
        const value = e.target.value;
        const selected = classes.find(
            (c) => `${c.standard}-${c.division}` === value
        );

        setFormData({
            ...formData,
            classId: value,
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
            alert(text.examNameRequired);
            return;
        }

        if (!formData.examType) {
            alert(text.selectTypeError);
            return;
        }

        if (!formData.startDate) {
            alert(text.startDateRequired);
            return;
        }

        if (!formData.endDate) {
            alert(text.endDateRequired);
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            alert(text.endDateError);
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

            if (formData.totalMarks) payload.totalMarks = Number(formData.totalMarks);
            if (formData.passingMarks) payload.passingMarks = Number(formData.passingMarks);

            await updateExam(id, payload);

            alert(text.updateSuccess);
            navigate("/exams/list");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || text.updateError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/exams/list")}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow hover:bg-gray-100 sm:h-12 sm:w-12"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 sm:text-4xl">
                            {text.title}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            {text.subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow transition hover:border-[#5B2EFF] hover:text-[#5B2EFF] sm:py-3"
                    >
                        <Languages size={16} />
                        {text.switchLang}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow hover:bg-gray-100 sm:px-5 sm:py-3"
                    >
                        <RotateCcw size={18} />
                        {text.reset}
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db] disabled:opacity-60 disabled:hover:scale-100 sm:px-8 sm:py-3"
                    >
                        <Save size={18} />
                        {loading ? text.updating : text.updateExam}
                    </button>
                </div>
            </div>

            {/* ============================== Form ============================== */}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
                    {/* ====== Left — Main Details ====== */}

                    <div className="space-y-7 xl:col-span-2">
                        {/* Basic Info */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.examInformation}</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.examName}
                                    </label>
                                    <input
                                        type="text"
                                        name="examName"
                                        value={formData.examName}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block font-medium">
                                            {text.examType}
                                        </label>
                                        <select
                                            name="examType"
                                            value={formData.examType}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                        >
                                            <option value="">{text.selectType}</option>
                                            {EXAM_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {examTypeLabel(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-medium">
                                            {text.status}
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                        >
                                            <option value="Upcoming">
                                                {statusLabel("Upcoming")}
                                            </option>
                                            <option value="Ongoing">
                                                {statusLabel("Ongoing")}
                                            </option>
                                            <option value="Completed">
                                                {statusLabel("Completed")}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.description}
                                    </label>
                                    <textarea
                                        rows="4"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full resize-none rounded-xl border p-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Marks */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.marksConfig}</h2>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.totalMarks}
                                    </label>
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
                                    <label className="mb-2 block font-medium">
                                        {text.passingMarks}
                                    </label>
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

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.classAssignment}</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-medium">{text.class}</label>
                                    <select
                                        value={formData.classId}
                                        onChange={handleClassChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >
                                        <option value="">{text.selectClass}</option>
                                        {classes.map((cls) => {
                                            const key = `${cls.standard}-${cls.division}`;

                                            return (
                                                <option key={key} value={key}>
                                                    {text.std} {cls.standard} - {cls.division}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {formData.standard && (
                                    <div className="rounded-xl bg-indigo-50 p-4">
                                        <p className="text-sm font-semibold text-indigo-600">
                                            {text.selectedClass}
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-indigo-800">
                                            {text.std} {formData.standard} - {formData.division}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Exam Period */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.examPeriod}</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.startDate}
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
                                        {text.endDate}
                                    </label>
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

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-5 text-lg font-bold">{text.quickActions}</h2>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/" + id)}
                                    className="w-full rounded-xl bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                >
                                    {text.viewDetails}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/schedule/" + id)}
                                    className="w-full rounded-xl bg-indigo-50 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                >
                                    {text.manageSchedule}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/marks/" + id)}
                                    className="w-full rounded-xl bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                                >
                                    {text.enterMarks}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/exams/results/" + id)}
                                    className="w-full rounded-xl bg-purple-50 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                                >
                                    {text.viewResults}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================== Bottom Save Bar ============================== */}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-medium hover:bg-gray-100"
                    >
                        {text.reset}
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-[#5B2EFF] px-10 py-3 font-semibold text-white hover:bg-[#4724db] disabled:opacity-60"
                    >
                        {loading ? text.updating : text.updateExam}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditExam;