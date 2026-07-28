import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    Paperclip,
    X,
    Loader2
} from "lucide-react";

import { getStudents } from "../../services/studentService";
import {
    getHomeworkById,
    updateHomework
} from "../../services/homeworkService";
import { useLanguage } from "../../context/LanguageContext";
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

const SUBJECTS_GU = {
    Mathematics: "ગણિત",
    Science: "વિજ્ઞાન",
    English: "અંગ્રેજી",
    Hindi: "હિન્દી",
    Gujarati: "ગુજરાતી",
    "Social Science": "સામાજિક વિજ્ઞાન",
    History: "ઇતિહાસ",
    Geography: "ભૂગોળ",
    Physics: "ભૌતિક વિજ્ઞાન",
    Chemistry: "રસાયણ વિજ્ઞાન",
    Biology: "જીવવિજ્ઞાન",
    "Computer Science": "કમ્પ્યુટર વિજ્ઞાન",
    "Physical Education": "શારીરિક શિક્ષણ",
    Art: "કલા",
    Music: "સંગીત",
    Other: "અન્ય"
};

const EditHomework = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
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

    const text = {
        title: isGujarati ? "હોમવર્ક સંપાદિત કરો" : "Edit Homework",
        subtitle: isGujarati
            ? "હોમવર્કની વિગતોમાં ફેરફાર કરો."
            : "Update homework details.",
        reset: isGujarati ? "રીસેટ" : "Reset",
        update: isGujarati ? "હોમવર્ક અપડેટ કરો" : "Update Homework",
        updating: isGujarati ? "અપડેટ થઈ રહ્યું છે..." : "Updating...",
        details: isGujarati ? "હોમવર્કની વિગતો" : "Homework Details",
        homeworkTitle: isGujarati ? "શીર્ષક" : "Title",
        description: isGujarati ? "વર્ણન" : "Description",
        subject: isGujarati ? "વિષય" : "Subject",
        totalMarks: isGujarati ? "કુલ ગુણ" : "Total Marks",
        selectSubject: isGujarati ? "વિષય પસંદ કરો" : "Select Subject",
        attachment: isGujarati ? "જોડાણ" : "Attachment",
        fileInfo: isGujarati
            ? "PDF, Word, Excel અથવા Image — મહત્તમ 10 MB"
            : "PDF, Word, Excel or Image — max 10 MB",
        currentAttachment: isGujarati ? "હાલનું જોડાણ" : "Current attachment",
        newFile: isGujarati ? "નવી ફાઇલ" : "New file",
        replaceFile: isGujarati
            ? "ફાઇલ બદલવા ક્લિક કરો"
            : "Click to replace file",
        uploadFile: isGujarati
            ? "ફાઇલ અપલોડ કરવા ક્લિક કરો"
            : "Click to upload file",
        allowedFiles: isGujarati
            ? "PDF, Word, Excel અથવા Image"
            : "PDF, Word, Excel or Image",
        assignTo: isGujarati ? "કોને આપવું" : "Assign To",
        class: isGujarati ? "વર્ગ" : "Class",
        selectClass: isGujarati ? "વર્ગ પસંદ કરો" : "Select Class",
        academicYear: isGujarati ? "શૈક્ષણિક વર્ષ" : "Academic Year",
        selectYear: isGujarati ? "વર્ષ પસંદ કરો" : "Select Year",
        active: isGujarati ? "સક્રિય" : "Active",
        schedule: isGujarati ? "સમયપત્રક" : "Schedule",
        dueDate: isGujarati ? "છેલ્લી તારીખ" : "Due Date",
        status: isGujarati ? "સ્થિતિ" : "Status",
        closed: isGujarati ? "બંધ" : "Closed",
        titleRequired: isGujarati
            ? "શીર્ષક જરૂરી છે."
            : "Title is required",
        classRequired: isGujarati
            ? "કૃપા કરીને વર્ગ પસંદ કરો."
            : "Please select a class",
        dueDateRequired: isGujarati
            ? "છેલ્લી તારીખ જરૂરી છે."
            : "Due date is required",
        fileSizeError: isGujarati
            ? "ફાઇલનું કદ 10 MB કરતા ઓછું હોવું જોઈએ."
            : "File size must be under 10 MB",
        unableLoad: isGujarati
            ? "હોમવર્ક લોડ થઈ શક્યું નથી."
            : "Unable to load homework",
        updateSuccess: isGujarati
            ? "હોમવર્ક સફળતાપૂર્વક અપડેટ થયું."
            : "Homework Updated Successfully",
        unableUpdate: isGujarati
            ? "હોમવર્ક અપડેટ થઈ શક્યું નથી."
            : "Unable to update homework",
        loading: isGujarati
            ? "હોમવર્ક લોડ થઈ રહ્યું છે..."
            : "Loading homework..."
    };

    useEffect(() => {
        loadPageData();
    }, [id]);

    const loadPageData = async () => {
        try {
            setPageLoading(true);

            const [studentsResponse, yearResponse, homeworkResponse] =
                await Promise.all([
                    getStudents(),
                    api.get("/academic-years/all"),
                    getHomeworkById(id)
                ]);

            const activeStudents = (studentsResponse.students || []).filter(
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
            setAcademicYears(
                yearResponse.data?.academicYears || []
            );

            const homework = homeworkResponse?.homework || {};

            setFormData({
                title: homework.title || "",
                description: homework.description || "",
                subject: homework.subject || "",
                standard: homework.standard || "",
                division: homework.division || "",
                classId:
                    homework.standard && homework.division
                        ? `${homework.standard}-${homework.division}`
                        : "",
                academicYearId:
                    homework.academicYearId?._id ||
                    homework.academicYearId ||
                    "",
                teacherId:
                    homework.teacherId?._id || homework.teacherId || "",
                dueDate: homework.dueDate
                    ? homework.dueDate.substring(0, 10)
                    : "",
                totalMarks: homework.totalMarks || 10,
                status: homework.status || "Active"
            });

            setExistingAttachment(
                homework.attachmentOriginalName ||
                    homework.attachment ||
                    ""
            );
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || text.unableLoad);
        } finally {
            setPageLoading(false);
        }
    };

    const loadHomework = async () => {
        try {
            const response = await getHomeworkById(id);
            const homework = response?.homework || {};

            setFormData({
                title: homework.title || "",
                description: homework.description || "",
                subject: homework.subject || "",
                standard: homework.standard || "",
                division: homework.division || "",
                classId:
                    homework.standard && homework.division
                        ? `${homework.standard}-${homework.division}`
                        : "",
                academicYearId:
                    homework.academicYearId?._id ||
                    homework.academicYearId ||
                    "",
                teacherId:
                    homework.teacherId?._id || homework.teacherId || "",
                dueDate: homework.dueDate
                    ? homework.dueDate.substring(0, 10)
                    : "",
                totalMarks: homework.totalMarks || 10,
                status: homework.status || "Active"
            });

            setExistingAttachment(
                homework.attachmentOriginalName ||
                    homework.attachment ||
                    ""
            );
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || text.unableLoad);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleClassChange = (event) => {
        const value = event.target.value;

        const selectedClass = classes.find(
            (item) => `${item.standard}-${item.division}` === value
        );

        setFormData((previous) => ({
            ...previous,
            classId: value,
            standard: selectedClass?.standard || "",
            division: selectedClass?.division || ""
        }));
    };

    const handleFile = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert(text.fileSizeError);
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleReset = async () => {
        setSelectedFile(null);
        await loadHomework();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim()) {
            alert(text.titleRequired);
            return;
        }

        if (!formData.classId) {
            alert(text.classRequired);
            return;
        }

        if (!formData.dueDate) {
            alert(text.dueDateRequired);
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (
                    key !== "classId" &&
                    value !== "" &&
                    value !== undefined &&
                    value !== null
                ) {
                    data.append(key, value);
                }
            });

            if (selectedFile) {
                data.append("attachment", selectedFile);
            }

            await updateHomework(id, data);

            alert(text.updateSuccess);
            navigate("/homework/list");
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message || text.unableUpdate
            );
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#F5F7FB] px-4">
                <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                <p className="font-medium text-slate-500">{text.loading}</p>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <button
                        onClick={() => navigate("/homework/list")}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-slate-100 sm:h-12 sm:w-12"
                        title={isGujarati ? "પાછળ" : "Back"}
                    >
                        <ArrowLeft size={21} />
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                            {text.title}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            {text.subtitle}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                    >
                        <RotateCcw size={18} />
                        <span className="hidden sm:inline">{text.reset}</span>
                    </button>

                    <button
                        type="submit"
                        form="editHomeworkForm"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-[#4724db] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}

                        {loading ? text.updating : text.update}
                    </button>
                </div>
            </div>

            <form id="editHomeworkForm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-7">
                    <div className="space-y-6 xl:col-span-2 xl:space-y-7">
                        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="mb-6 text-xl font-bold text-slate-800">
                                {text.details}
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        {text.homeworkTitle}
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        {text.description}
                                    </label>

                                    <textarea
                                        rows="5"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full resize-none rounded-xl border border-slate-200 p-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            {text.subject}
                                        </label>

                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                        >
                                            <option value="">
                                                {text.selectSubject}
                                            </option>

                                            {SUBJECTS.map((subject) => (
                                                <option key={subject} value={subject}>
                                                    {isGujarati
                                                        ? SUBJECTS_GU[subject]
                                                        : subject}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            {text.totalMarks}
                                        </label>

                                        <input
                                            type="number"
                                            name="totalMarks"
                                            value={formData.totalMarks}
                                            onChange={handleChange}
                                            min="1"
                                            max="100"
                                            className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="text-xl font-bold text-slate-800">
                                {text.attachment}
                            </h2>

                            <p className="mb-5 mt-2 text-sm text-slate-400">
                                {text.fileInfo}
                            </p>

                            {existingAttachment && !selectedFile && (
                                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Paperclip
                                            size={18}
                                            className="shrink-0 text-green-600"
                                        />

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-800">
                                                {existingAttachment}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {text.currentAttachment}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedFile && (
                                <div className="mb-4 flex flex-col gap-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Paperclip
                                            size={18}
                                            className="shrink-0 text-indigo-600"
                                        />

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-800">
                                                {selectedFile.name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {(selectedFile.size / 1024).toFixed(1)} KB —{" "}
                                                {text.newFile}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full bg-red-100 transition hover:bg-red-200 sm:self-auto"
                                    >
                                        <X size={16} className="text-red-600" />
                                    </button>
                                </div>
                            )}

                            <label
                                htmlFor="attachment"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-[#5B2EFF] hover:bg-indigo-50"
                            >
                                <Paperclip
                                    size={30}
                                    className="mb-3 text-slate-400"
                                />

                                <p className="font-semibold text-slate-600">
                                    {existingAttachment
                                        ? text.replaceFile
                                        : text.uploadFile}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    {text.allowedFiles}
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

                    <div className="space-y-6 xl:space-y-7">
                        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="mb-6 text-xl font-bold text-slate-800">
                                {text.assignTo}
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        {text.class}
                                    </label>

                                    <select
                                        value={formData.classId}
                                        onChange={handleClassChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    >
                                        <option value="">
                                            {text.selectClass}
                                        </option>

                                        {classes.map((item) => {
                                            const key = `${item.standard}-${item.division}`;

                                            return (
                                                <option key={key} value={key}>
                                                    {isGujarati
                                                        ? `${item.standard} ધોરણ - ${item.division}`
                                                        : `Std ${item.standard} - ${item.division}`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        {text.academicYear}
                                    </label>

                                    <select
                                        name="academicYearId"
                                        value={formData.academicYearId}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    >
                                        <option value="">{text.selectYear}</option>

                                        {academicYears.map((year) => (
                                            <option key={year._id} value={year._id}>
                                                {year.yearName || year.year}
                                                {year.isActive
                                                    ? ` (${text.active})`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="mb-6 text-xl font-bold text-slate-800">
                                {text.schedule}
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        {text.dueDate}
                                    </label>

                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        {text.status}
                                    </label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    >
                                        <option value="Active">{text.active}</option>
                                        <option value="Closed">{text.closed}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-7 flex flex-col justify-end gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        {text.reset}
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-8 py-3 font-semibold text-white transition hover:bg-[#4724db] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? text.updating : text.update}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditHomework;