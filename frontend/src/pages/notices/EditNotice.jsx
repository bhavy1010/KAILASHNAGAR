import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Paperclip, X, Languages } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { getNoticeById, updateNotice } from "../../services/noticeService";

const CATEGORY_LABEL_GU = {
    General: "સામાન્ય",
    Academic: "શૈક્ષણિક",
    Exam: "પરીક્ષા",
    Holiday: "રજા",
    Event: "કાર્યક્રમ",
    Sports: "રમતગમત",
    Fee: "ફી",
    Urgent: "તાત્કાલિક",
    Other: "અન્ય"
};

const PRIORITY_LABEL_GU = {
    Low: "ઓછી",
    Medium: "મધ્યમ",
    High: "ઊંચી",
    Urgent: "તાત્કાલિક"
};

const AUDIENCE_LABEL_GU = {
    All: "બધા",
    Teachers: "શિક્ષકો",
    Students: "વિદ્યાર્થીઓ",
    Parents: "વાલીઓ"
};

const EditNotice = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [existingAttachment, setExistingAttachment] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "General",
        priority: "Medium",
        audience: "All",
        publishDate: "",
        expiryDate: "",
        publishedBy: ""
    });

    const text = {
        title: isGujarati ? "નોટિસ સંપાદિત કરો" : "Edit Notice",
        subtitle: isGujarati
            ? "નોટિસની સામગ્રી અને સેટિંગ્સ અપડેટ કરો."
            : "Update notice content and settings.",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        reset: isGujarati ? "રીસેટ" : "Reset",
        updating: isGujarati ? "અપડેટ થઈ રહ્યું છે..." : "Updating...",
        updateNotice: isGujarati ? "નોટિસ અપડેટ કરો" : "Update Notice",
        noticeContent: isGujarati ? "નોટિસ સામગ્રી" : "Notice Content",
        noticeTitle: isGujarati ? "શીર્ષક" : "Title",
        description: isGujarati ? "વર્ણન" : "Description",
        characters: isGujarati ? "અક્ષરો" : "characters",
        publishedBy: isGujarati ? "પ્રકાશક" : "Published By",
        publishedByPlaceholder: isGujarati
            ? "દા.ત. આચાર્ય, એડમિન ઓફિસ"
            : "e.g. Principal, Admin Office",
        attachment: isGujarati ? "જોડાણ" : "Attachment",
        attachmentHint: isGujarati
            ? "વૈકલ્પિક — PDF, Word, Excel અથવા Image (મહત્તમ 10 MB)"
            : "Optional — PDF, Word, Excel or Image (max 10 MB)",
        currentAttachment: isGujarati ? "હાલનું જોડાણ" : "Current attachment",
        newFile: isGujarati ? "નવી ફાઇલ" : "New file",
        clickToReplace: isGujarati ? "ફાઇલ બદલવા ક્લિક કરો" : "Click to replace file",
        clickToUpload: isGujarati ? "ફાઇલ અપલોડ કરવા ક્લિક કરો" : "Click to upload file",
        fileTypes: isGujarati ? "PDF, Word, Excel અથવા Image" : "PDF, Word, Excel or Image",
        noticeSettings: isGujarati ? "નોટિસ સેટિંગ્સ" : "Notice Settings",
        category: isGujarati ? "શ્રેણી" : "Category",
        priority: isGujarati ? "પ્રાથમિકતા" : "Priority",
        audience: isGujarati ? "પ્રેક્ષકો" : "Audience",
        schedule: isGujarati ? "શેડ્યૂલ" : "Schedule",
        publishDate: isGujarati ? "પ્રકાશન તારીખ" : "Publish Date",
        expiryDate: isGujarati ? "સમાપ્તિ તારીખ" : "Expiry Date",
        optional: isGujarati ? "(વૈકલ્પિક)" : "(Optional)",
        quickActions: isGujarati ? "ઝડપી ક્રિયાઓ" : "Quick Actions",
        viewNotice: isGujarati ? "નોટિસ જુઓ" : "View Notice",
        allNotices: isGujarati ? "બધી નોટિસ" : "All Notices",
        loadError: isGujarati ? "નોટિસ લોડ કરી શકાયું નથી" : "Unable to load notice",
        titleRequired: isGujarati ? "શીર્ષક જરૂરી છે" : "Title is required",
        descriptionRequired: isGujarati ? "વર્ણન જરૂરી છે" : "Description is required",
        expiryError: isGujarati
            ? "સમાપ્તિ તારીખ પ્રકાશન તારીખ પહેલાં ન હોઈ શકે"
            : "Expiry date cannot be before publish date",
        fileSizeError: isGujarati ? "ફાઇલનું કદ 10 MB કરતાં ઓછું હોવું જોઈએ" : "File size must be under 10 MB",
        updateSuccess: isGujarati ? "નોટિસ સફળતાપૂર્વક અપડેટ થઈ" : "Notice Updated Successfully",
        updateError: isGujarati ? "નોટિસ અપડેટ કરી શકાયું નથી" : "Unable to update notice"
    };

    const categoryOptions = [
        "General",
        "Academic",
        "Exam",
        "Holiday",
        "Event",
        "Sports",
        "Fee",
        "Urgent",
        "Other"
    ];

    const priorityOptions = ["Low", "Medium", "High", "Urgent"];
    const audienceOptions = ["All", "Teachers", "Students", "Parents"];

    const categoryLabel = (category) =>
        isGujarati ? CATEGORY_LABEL_GU[category] || category : category;

    const priorityLabel = (priority) =>
        isGujarati ? PRIORITY_LABEL_GU[priority] || priority : priority;

    const audienceLabel = (audience) =>
        isGujarati ? AUDIENCE_LABEL_GU[audience] || audience : audience;

    useEffect(() => {
        loadNotice();
    }, []);

    const loadNotice = async () => {
        try {
            const response = await getNoticeById(id);
            const notice = response.notice;

            setFormData({
                title: notice.title || "",
                description: notice.description || "",
                category: notice.category || "General",
                priority: notice.priority || "Medium",
                audience: notice.audience || "All",
                publishDate: notice.publishDate
                    ? notice.publishDate.substring(0, 10)
                    : new Date().toISOString().substring(0, 10),
                expiryDate: notice.expiryDate ? notice.expiryDate.substring(0, 10) : "",
                publishedBy: notice.publishedBy || ""
            });

            setExistingAttachment(notice.attachmentOriginalName || notice.attachment || "");
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

    const handleFile = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert(text.fileSizeError);
            return;
        }

        setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleReset = () => {
        loadNotice();
        setSelectedFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert(text.titleRequired);
            return;
        }

        if (!formData.description.trim()) {
            alert(text.descriptionRequired);
            return;
        }

        if (formData.expiryDate && formData.expiryDate < formData.publishDate) {
            alert(text.expiryError);
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();

            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("category", formData.category);
            data.append("priority", formData.priority);
            data.append("audience", formData.audience);
            data.append("publishDate", formData.publishDate);
            data.append("publishedBy", formData.publishedBy);

            if (formData.expiryDate) {
                data.append("expiryDate", formData.expiryDate);
            }

            if (selectedFile) {
                data.append("attachment", selectedFile);
            }

            await updateNotice(id, data);

            alert(text.updateSuccess);
            navigate("/notices/" + id);
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
                        onClick={() => navigate("/notices/" + id)}
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
                        {loading ? text.updating : text.updateNotice}
                    </button>
                </div>
            </div>

            {/* ============================== Form ============================== */}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
                    {/* ====== Left — Main Content ====== */}

                    <div className="space-y-7 xl:col-span-2">
                        {/* Notice Content */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.noticeContent}</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.noticeTitle}
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
                                        {text.description}
                                    </label>
                                    <textarea
                                        rows="8"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full resize-none rounded-xl border p-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                    <p className="mt-2 text-right text-xs text-gray-400">
                                        {formData.description.length} {text.characters}
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.publishedBy}
                                    </label>
                                    <input
                                        type="text"
                                        name="publishedBy"
                                        value={formData.publishedBy}
                                        onChange={handleChange}
                                        placeholder={text.publishedByPlaceholder}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Attachment */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-2 text-xl font-bold">{text.attachment}</h2>

                            <p className="mb-5 text-sm text-gray-400">{text.attachmentHint}</p>

                            {existingAttachment && !selectedFile && (
                                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 sm:px-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Paperclip size={18} className="shrink-0 text-green-600" />

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-800">
                                                {existingAttachment}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {text.currentAttachment}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedFile && (
                                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 sm:px-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Paperclip size={18} className="shrink-0 text-indigo-600" />

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-800">
                                                {selectedFile.name}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {(selectedFile.size / 1024).toFixed(1)} KB — {text.newFile}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 transition hover:bg-red-200"
                                    >
                                        <X size={16} className="text-red-600" />
                                    </button>
                                </div>
                            )}

                            <label
                                htmlFor="attachment"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-6 transition hover:border-[#5B2EFF] hover:bg-indigo-50 sm:p-8"
                            >
                                <Paperclip size={30} className="mb-3 text-gray-400" />

                                <p className="text-center font-semibold text-gray-600">
                                    {existingAttachment ? text.clickToReplace : text.clickToUpload}
                                </p>

                                <p className="mt-1 text-center text-sm text-gray-400">
                                    {text.fileTypes}
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
                        {/* Notice Settings */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.noticeSettings}</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-medium">{text.category}</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >
                                        {categoryOptions.map((category) => (
                                            <option key={category} value={category}>
                                                {categoryLabel(category)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">{text.priority}</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >
                                        {priorityOptions.map((priority) => (
                                            <option key={priority} value={priority}>
                                                {priorityLabel(priority)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">{text.audience}</label>
                                    <select
                                        name="audience"
                                        value={formData.audience}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >
                                        {audienceOptions.map((audience) => (
                                            <option key={audience} value={audience}>
                                                {audienceLabel(audience)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}

                        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                            <h2 className="mb-6 text-xl font-bold">{text.schedule}</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.publishDate}
                                    </label>
                                    <input
                                        type="date"
                                        name="publishDate"
                                        value={formData.publishDate}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        {text.expiryDate}
                                        <span className="ml-1 font-normal text-gray-400">
                                            {text.optional}
                                        </span>
                                    </label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        min={formData.publishDate}
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
                                    onClick={() => navigate("/notices/" + id)}
                                    className="w-full rounded-xl bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                >
                                    {text.viewNotice}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/notices/list")}
                                    className="w-full rounded-xl bg-indigo-50 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                >
                                    {text.allNotices}
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
                        {loading ? text.updating : text.updateNotice}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditNotice;