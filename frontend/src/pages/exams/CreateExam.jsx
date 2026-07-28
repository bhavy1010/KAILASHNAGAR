import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Languages } from "lucide-react";

import { getStudents } from "../../services/studentService";
import { createExam } from "../../services/examService";
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

const todayStr = () => new Date().toISOString().substring(0, 10);

const CreateExam = () => {
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

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

    const text = {
        title: isGujarati ? "પરીક્ષા બનાવો" : "Create Exam",
        subtitle: isGujarati ? "ધોરણ માટે નવી પરીક્ષા વ્યાખ્યાયિત કરો." : "Define a new exam for a class.",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        reset: isGujarati ? "રીસેટ" : "Reset",
        saving: isGujarati ? "સાચવી રહ્યું છે..." : "Saving...",
        saveExam: isGujarati ? "પરીક્ષા સાચવો" : "Save Exam",
        examInformation: isGujarati ? "પરીક્ષા માહિતી" : "Exam Information",
        examName: isGujarati ? "પરીક્ષાનું નામ" : "Exam Name",
        examNamePlaceholder: isGujarati
            ? "દા.ત. મધ્ય સત્ર પરીક્ષા 2024"
            : "e.g. Mid Term Examination 2024",
        examType: isGujarati ? "પરીક્ષા પ્રકાર" : "Exam Type",
        selectType: isGujarati ? "પ્રકાર પસંદ કરો" : "Select Type",
        status: isGujarati ? "સ્થિતિ" : "Status",
        description: isGujarati ? "વર્ણન" : "Description",
        descriptionPlaceholder: isGujarati
            ? "આ પરીક્ષા વિશે વૈકલ્પિક નોંધ..."
            : "Optional notes about this exam...",
        marksConfig: isGujarati ? "માર્ક્સ કન્ફિગરેશન" : "Marks Configuration",
        marksConfigHint: isGujarati
            ? "વૈકલ્પિક — તમે તેના બદલે પરીક્ષા સમયપત્રકમાં વિષય-વાર માર્ક્સ સેટ કરી શકો છો."
            : "Optional — you can set per-subject marks in the Exam Schedule instead.",
        totalMarks: isGujarati ? "કુલ માર્ક્સ" : "Total Marks",
        passingMarks: isGujarati ? "પાસિંગ માર્ક્સ" : "Passing Marks",
        assignToClass: isGujarati ? "ધોરણ સોંપો" : "Assign To Class",
        class: isGujarati ? "ધોરણ" : "Class",
        selectClass: isGujarati ? "ધોરણ પસંદ કરો" : "Select Class",
        selectedClass: isGujarati ? "પસંદ કરેલ ધોરણ" : "Selected Class",
        std: isGujarati ? "ધોરણ" : "Std",
        examPeriod: isGujarati ? "પરીક્ષા સમયગાળો" : "Exam Period",
        startDate: isGujarati ? "શરૂઆત તારીખ" : "Start Date",
        endDate: isGujarati ? "સમાપ્તિ તારીખ" : "End Date",
        nextSteps: isGujarati ? "આગળના પગલાં" : "Next Steps",
        step1: isGujarati
            ? "પરીક્ષા બનાવ્યા પછી, સમયપત્રકમાં વિષયો ઉમેરો."
            : "After creating the exam, add subjects to the schedule.",
        step2: isGujarati
            ? "દરેક વિષય માટે તારીખ, સમય અને માર્ક્સ સેટ કરો."
            : "Set date, time and marks for each subject.",
        step3: isGujarati
            ? "પરીક્ષા પૂર્ણ થયા પછી વિદ્યાર્થીના માર્ક્સ દાખલ કરો."
            : "Enter student marks after the exam is completed.",
        step4: isGujarati
            ? "પરિણામો અને ક્રમાંક આપોઆપ બનાવવામાં આવે છે."
            : "Results and ranks are generated automatically.",
        examNameRequired: isGujarati ? "પરીક્ષાનું નામ જરૂરી છે" : "Exam name is required",
        selectTypeError: isGujarati ? "કૃપા કરીને પરીક્ષા પ્રકાર પસંદ કરો" : "Please select exam type",
        selectClassError: isGujarati ? "કૃપા કરીને ધોરણ પસંદ કરો" : "Please select a class",
        startDateRequired: isGujarati ? "શરૂઆત તારીખ જરૂરી છે" : "Start date is required",
        endDateRequired: isGujarati ? "સમાપ્તિ તારીખ જરૂરી છે" : "End date is required",
        endDateError: isGujarati
            ? "સમાપ્તિ તારીખ શરૂઆત તારીખ પહેલાં ન હોઈ શકે"
            : "End date cannot be before start date",
        createError: isGujarati ? "પરીક્ષા બનાવી શકાઈ નથી" : "Unable to create exam"
    };

    const examTypeLabel = (type) => (isGujarati ? EXAM_TYPE_LABEL_GU[type] || type : type);
    const statusLabel = (status) => (isGujarati ? STATUS_LABEL_GU[status] || status : status);

    useEffect(() => {
        loadClasses();
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
        setFormData(initialFormData);
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

        if (!formData.classId) {
            alert(text.selectClassError);
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

            await createExam(payload);

            navigate("/exams/list");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || text.createError);
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
                        {loading ? text.saving : text.saveExam}
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
                                        placeholder={text.examNamePlaceholder}
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
                                        placeholder={text.descriptionPlaceholder}
                                        className="w-full resize-none rounded-xl border p-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Marks */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.marksConfig}</h2>

                            <p className="mb-5 text-sm text-gray-400">{text.marksConfigHint}</p>

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
                                        placeholder="e.g. 500"
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

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.assignToClass}</h2>

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

                        {/* Schedule */}

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
                                        min={formData.startDate || todayStr()}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tips */}

                        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-7">
                            <h2 className="mb-4 text-lg font-bold text-blue-800">
                                {text.nextSteps}
                            </h2>

                            <ul className="space-y-3 text-sm text-blue-700">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">1.</span>
                                    {text.step1}
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">2.</span>
                                    {text.step2}
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">3.</span>
                                    {text.step3}
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5">4.</span>
                                    {text.step4}
                                </li>
                            </ul>
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
                        {loading ? text.saving : text.saveExam}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateExam;