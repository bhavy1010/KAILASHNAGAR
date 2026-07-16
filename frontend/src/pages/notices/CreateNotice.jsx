import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Paperclip, X } from "lucide-react";

import { createNotice } from "../../services/noticeService";

const CreateNotice = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const initialFormData = {
        title: "",
        description: "",
        category: "General",
        priority: "Medium",
        audience: "All",
        publishDate: new Date().toISOString().substring(0, 10),
        expiryDate: "",
        publishedBy: ""
    };

    const [formData, setFormData] = useState(initialFormData);

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

        setFormData(initialFormData);
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

            if (formData.expiryDate) {
                data.append("expiryDate", formData.expiryDate);
            }

            if (formData.publishedBy) {
                data.append("publishedBy", formData.publishedBy);
            }

            if (selectedFile) {
                data.append("attachment", selectedFile);
            }

            await createNotice(data);

            navigate("/notices/list");

        } catch (error) {

            console.log(error);
            alert(error.response?.data?.message || "Unable to create notice");

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
                        onClick={() => navigate("/notices/list")}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">Create Notice</h1>
                        <p className="mt-2 text-slate-500">Publish a new notice for your audience.</p>
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
                        {loading ? "Publishing..." : "Publish Notice"}
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
                                    <label className="mb-2 block font-medium">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Annual Sports Day Notice"
                                        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Description
                                    </label>
                                    <textarea
                                        rows="8"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Write the full notice content here..."
                                        className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF]"
                                    />
                                    <p className="text-xs text-gray-400 mt-2 text-right">
                                        {formData.description.length} characters
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Published By
                                    </label>
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

                            {selectedFile && (

                                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-5">

                                    <div className="flex items-center gap-3">

                                        <Paperclip size={20} className="text-indigo-600" />

                                        <div>
                                            <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">
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

                            )}

                            <label
                                htmlFor="attachment"
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 cursor-pointer hover:border-[#5B2EFF] hover:bg-indigo-50 transition"
                            >

                                <Paperclip size={36} className="text-gray-400 mb-3" />

                                <p className="font-semibold text-gray-600">
                                    {selectedFile ? "Click to replace file" : "Click to upload file"}
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
                                    <p className="text-xs text-gray-400 mt-2">
                                        Leave empty if notice has no expiry.
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* Preview Card */}

                        <div className="bg-indigo-50 rounded-3xl p-7 border border-indigo-100">

                            <h2 className="text-lg font-bold mb-4 text-indigo-800">Preview</h2>

                            <div className="space-y-3">

                                <div className="flex flex-wrap gap-2">

                                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                                        {formData.category}
                                    </span>

                                    <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (
                                        formData.priority === "Urgent" ? "bg-red-100 text-red-700" :
                                        formData.priority === "High" ? "bg-orange-100 text-orange-700" :
                                        formData.priority === "Medium" ? "bg-blue-100 text-blue-700" :
                                        "bg-gray-100 text-gray-600"
                                    )}>
                                        {formData.priority} Priority
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                        For: {formData.audience}
                                    </span>

                                </div>

                                <p className="font-bold text-gray-800">
                                    {formData.title || "Notice title will appear here"}
                                </p>

                                <p className="text-sm text-gray-500 line-clamp-3">
                                    {formData.description || "Notice content will appear here..."}
                                </p>

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
                        {loading ? "Publishing..." : "Publish Notice"}
                    </button>

                </div>

            </form>

        </div>

    );

};

export default CreateNotice;