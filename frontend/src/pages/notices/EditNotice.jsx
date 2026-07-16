import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Paperclip, X } from "lucide-react";

import { getNoticeById, updateNotice } from "../../services/noticeService";

const EditNotice = () => {

    const navigate = useNavigate();

    const { id } = useParams();

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
                expiryDate: notice.expiryDate
                    ? notice.expiryDate.substring(0, 10)
                    : "",
                publishedBy: notice.publishedBy || ""
            });

            setExistingAttachment(notice.attachmentOriginalName || notice.attachment || "");

        } catch (error) {

            console.log(error);
            alert("Unable to load notice");

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
            alert("File size must be under 10 MB");
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
            alert("Title is required");
            return;
        }

        if (!formData.description.trim()) {
            alert("Description is required");
            return;
        }

        if (formData.expiryDate && formData.expiryDate < formData.publishDate) {
            alert("Expiry date cannot be before publish date");
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

            alert("Notice Updated Successfully");
            navigate("/notices/" + id);

        } catch (error) {

            console.log(error);
            alert(error.response?.data?.message || "Unable to update notice");

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
                        onClick={() => navigate("/notices/" + id)}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">Edit Notice</h1>
                        <p className="mt-2 text-slate-500">Update notice content and settings.</p>
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
                        {loading ? "Updating..." : "Update Notice"}
                    </button>

                </div>

            </div>

            {/* ============================== Form ============================== */}

            <form onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

                    {/* ====== Left — Main Content ====== */}

                    <div className="xl:col-span-2 space-y-7">

                        {/* Notice Content */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Notice Content</h2>

                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block font-medium">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">Description</label>
                                    <textarea
                                        rows="8"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF]"
                                    />
                                    <p className="text-xs text-gray-400 mt-2 text-right">
                                        {formData.description.length} characters
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">Published By</label>
                                    <input
                                        type="text"
                                        name="publishedBy"
                                        value={formData.publishedBy}
                                        onChange={handleChange}
                                        placeholder="e.g. Principal, Admin Office"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* Attachment */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-2">Attachment</h2>

                            <p className="text-gray-400 text-sm mb-5">
                                Optional — PDF, Word, Excel or Image (max 10 MB)
                            </p>

                            {existingAttachment && !selectedFile && (

                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-5">

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

                                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-5">

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

                        {/* Notice Settings */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Notice Settings</h2>

                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block font-medium">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >
                                        <option value="General">General</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Holiday">Holiday</option>
                                        <option value="Event">Event</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Fee">Fee</option>
                                        <option value="Urgent">Urgent</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">Audience</label>
                                    <select
                                        name="audience"
                                        value={formData.audience}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    >
                                        <option value="All">All</option>
                                        <option value="Teachers">Teachers</option>
                                        <option value="Students">Students</option>
                                        <option value="Parents">Parents</option>
                                    </select>
                                </div>

                            </div>

                        </div>

                        {/* Schedule */}

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-xl font-bold mb-6">Schedule</h2>

                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block font-medium">Publish Date</label>
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
                                        Expiry Date
                                        <span className="text-gray-400 font-normal ml-1">(Optional)</span>
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

                        <div className="bg-white rounded-3xl shadow p-8">

                            <h2 className="text-lg font-bold mb-5">Quick Actions</h2>

                            <div className="space-y-3">

                                <button
                                    type="button"
                                    onClick={() => navigate("/notices/" + id)}
                                    className="w-full py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition text-sm"
                                >
                                    View Notice
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/notices/list")}
                                    className="w-full py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition text-sm"
                                >
                                    All Notices
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
                        {loading ? "Updating..." : "Update Notice"}
                    </button>

                </div>

            </form>

        </div>

    );

};

export default EditNotice;