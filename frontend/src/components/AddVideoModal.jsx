import { useState, useEffect } from "react";
import { X, Play, Loader2, Globe, BookOpen, Link as LinkIcon, Sparkles } from "lucide-react";
import { addVideoLibrary } from "../services/videoLibraryService";
import { getMyTeacherScope } from "../services/teacherService";

const SUBJECT_OPTIONS = [
    "Gujarati",
    "Mathematics",
    "Science",
    "Social Science",
    "Hindi",
    "Sanskrit",
    "English",
    "Computer",
    "Environmental Studies (EVS)",
    "Extra / General"
];

const extractVideoId = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
};

const AddVideoModal = ({ userRole, onClose, onSaved }) => {
    const isAdmin = userRole === "admin";
    const isTeacher = userRole === "teacher";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [targetScope, setTargetScope] = useState(isAdmin ? "whole_school" : "class_specific");
    const [standard, setStandard] = useState("1");
    const [subject, setSubject] = useState("Mathematics");

    const [teacherScope, setTeacherScope] = useState({ subjects: [], classes: [] });
    const [loadingScope, setLoadingScope] = useState(isTeacher);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const previewId = extractVideoId(youtubeUrl);

    useEffect(() => {
        if (isTeacher) {
            getMyTeacherScope()
                .then((data) => {
                    if (data.success) {
                        const subs = data.subjectsHandled || [];
                        const classes = data.classesHandled || [];
                        setTeacherScope({ subjects: subs, classes });
                        if (classes.length > 0) {
                            const firstNum = String(classes[0]).match(/\d+/);
                            if (firstNum) setStandard(firstNum[0]);
                        }
                        if (subs.length > 0) {
                            setSubject(subs[0]);
                        }
                    }
                })
                .catch(() => {})
                .finally(() => setLoadingScope(false));
        }
    }, [isTeacher]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            return setError("Please enter a video title.");
        }

        if (!youtubeUrl.trim() || !previewId) {
            return setError("Please enter a valid YouTube video link.");
        }

        if (targetScope === "class_specific" && !standard) {
            return setError("Please select a standard.");
        }

        try {
            setSaving(true);
            await addVideoLibrary({
                title: title.trim(),
                description: description.trim(),
                youtubeUrl: youtubeUrl.trim(),
                targetScope,
                standard: targetScope === "whole_school" ? null : Number(standard),
                subject: targetScope === "whole_school" ? "Whole School" : subject
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add video.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 my-auto">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
                            <Sparkles size={14} />
                            Digital Video Library
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                            Add Educational YouTube Video
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Target Scope Selection */}
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Target Visibility
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setTargetScope("whole_school")}
                                    className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-extrabold border transition ${
                                        targetScope === "whole_school"
                                            ? "bg-purple-600 text-white border-purple-600 shadow-md"
                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                                    }`}
                                >
                                    <Globe size={16} />
                                    Whole School (All)
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setTargetScope("class_specific")}
                                className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-extrabold border transition ${
                                    targetScope === "class_specific" || !isAdmin
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                                } ${!isAdmin ? "col-span-2" : ""}`}
                            >
                                <BookOpen size={16} />
                                Class Specific
                            </button>
                        </div>
                    </div>

                    {/* Class & Subject Pickers (If Class Specific) */}
                    {targetScope === "class_specific" && (
                        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-indigo-50/50 p-4 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Standard *
                                </label>
                                <select
                                    value={standard}
                                    onChange={(e) => setStandard(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                >
                                    {isTeacher && teacherScope.classes.length > 0 ? (
                                        teacherScope.classes.map((cls) => {
                                            const m = String(cls).match(/\d+/);
                                            const num = m ? m[0] : cls;
                                            return <option key={num} value={num}>Std {num}</option>;
                                        })
                                    ) : (
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                                            <option key={s} value={s}>Std {s}</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Subject *
                                </label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                >
                                    {isTeacher && teacherScope.subjects.length > 0 ? (
                                        [...teacherScope.subjects, "Extra / General"].map((sub) => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))
                                    ) : (
                                        SUBJECT_OPTIONS.map((sub) => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Video Title *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Science Ch-3 Experiment & Concept"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                            YouTube Video Link *
                        </label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-500 dark:border-slate-700 dark:bg-slate-800">
                            <LinkIcon size={16} className="text-red-500 shrink-0" />
                            <input
                                type="url"
                                required
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-slate-100"
                            />
                        </div>
                    </div>

                    {/* Thumbnail Live Preview */}
                    {previewId && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                            <p className="mb-2 text-xs font-bold text-slate-500">Live Video Preview Thumbnail:</p>
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                                <img
                                    src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                                    alt="Thumbnail preview"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 grid place-items-center bg-black/30">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
                                        <Play size={24} className="fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Description / Key Learnings (Optional)
                        </label>
                        <textarea
                            rows="2"
                            placeholder="Write brief description for students..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || loadingScope}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 disabled:opacity-60 transition"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="fill-current" />}
                        {saving ? "Publishing Video..." : "Publish Video to Digital Library"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVideoModal;
