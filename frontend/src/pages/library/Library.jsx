import { useEffect, useMemo, useState } from "react";
import {
    BookMarked,
    BookOpen,
    Download,
    ExternalLink,
    FileImage,
    FileText,
    FileUp,
    Globe,
    Link as LinkIcon,
    Loader2,
    Palette,
    Play,
    Plus,
    Presentation,
    Search,
    Sparkles,
    Trash2,
    Video,
    X
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
    addTextbookLink,
    deleteLibraryMaterial,
    getLibraryMaterials,
    uploadLibraryMaterial
} from "../../services/libraryService";
import {
    deleteVideoLibrary,
    getVideoLibrary
} from "../../services/videoLibraryService";

import AddVideoModal from "../../components/AddVideoModal";
import VideoPlayerModal from "../../components/VideoPlayerModal";

const STANDARDS = [1, 2, 3, 4, 5, 6, 7, 8];

const SUBJECTS = {
    1: ["Gujarati / Kalarav", "Mathematics", "General Education / Joyful Activities"],
    2: ["Gujarati / Kallol", "Mathematics", "General Education / Joyful Activities"],
    3: ["Gujarati", "Mathematics", "English", "Environmental Studies (EVS)", "Hindi", "Drawing", "Computer"],
    4: ["Gujarati", "Mathematics", "English", "Environmental Studies (EVS)", "Hindi", "Drawing", "Computer"],
    5: ["Gujarati", "Mathematics", "English", "Environmental Studies (EVS)", "Hindi", "Drawing", "Computer"],
    6: ["Gujarati", "Mathematics", "Science and Technology", "Social Science", "English", "Hindi", "Sanskrit"],
    7: ["Gujarati", "Mathematics", "Science and Technology", "Social Science", "English", "Hindi", "Sanskrit"],
    8: ["Gujarati", "Mathematics", "Science and Technology", "Social Science", "English", "Hindi", "Sanskrit"]
};

const SUBJECT_STYLE = {
    Gujarati: "border-rose-200 bg-rose-50 text-rose-700",
    "Gujarati / Kalarav": "border-rose-200 bg-rose-50 text-rose-700",
    "Gujarati / Kallol": "border-rose-200 bg-rose-50 text-rose-700",
    Mathematics: "border-blue-200 bg-blue-50 text-blue-700",
    English: "border-violet-200 bg-violet-50 text-violet-700",
    "Environmental Studies (EVS)": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Science and Technology": "border-cyan-200 bg-cyan-50 text-cyan-700",
    "Social Science": "border-amber-200 bg-amber-50 text-amber-700",
    Hindi: "border-orange-200 bg-orange-50 text-orange-700",
    Sanskrit: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
    Drawing: "border-pink-200 bg-pink-50 text-pink-700",
    Computer: "border-indigo-200 bg-indigo-50 text-indigo-700",
    "General Education / Joyful Activities": "border-lime-200 bg-lime-50 text-lime-700"
};

const iconFor = (type) =>
    type.startsWith("image/")
        ? FileImage
        : type.includes("presentation") || type.includes("powerpoint")
        ? Presentation
        : FileText;

export default function Library() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const role = user?.role || "student";
    const canManage = ["admin", "teacher"].includes(role);

    // Active Library Sub-Tab: 'videos' or 'textbooks'
    const [activeTab, setActiveTab] = useState("videos");

    // ======================================================
    // Video Library State
    // ======================================================
    const [videos, setVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(true);
    const [videoSearch, setVideoSearch] = useState("");
    const [videoStdFilter, setVideoStdFilter] = useState("");
    const [selectedVideo, setSelectedVideo] = useState(null); // For player modal
    const [addVideoModalOpen, setAddVideoModalOpen] = useState(false);

    // ======================================================
    // Textbooks State
    // ======================================================
    const [standard, setStandard] = useState(1);
    const [subject, setSubject] = useState("");
    const [materials, setMaterials] = useState([]);
    const [materialsLoading, setMaterialsLoading] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [textbookOpen, setTextbookOpen] = useState(false);

    const classKey = `std-${standard}`;

    // Load Videos
    const fetchVideos = async () => {
        setVideosLoading(true);
        try {
            const data = await getVideoLibrary({
                search: videoSearch,
                standard: videoStdFilter
            });
            if (data.success) {
                setVideos(data.videos || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setVideosLoading(false);
        }
    };

    // Load Materials
    const fetchMaterials = () => {
        setMaterialsLoading(true);
        getLibraryMaterials(classKey)
            .then(({ materials: data }) => setMaterials(data || []))
            .catch(() => setMaterials([]))
            .finally(() => setMaterialsLoading(false));
    };

    useEffect(() => {
        if (activeTab === "videos") {
            fetchVideos();
        }
    }, [activeTab, videoSearch, videoStdFilter]);

    useEffect(() => {
        if (activeTab === "textbooks") {
            fetchMaterials();
        }
    }, [activeTab, standard]);

    const subjects = SUBJECTS[standard];
    const visibleMaterials = useMemo(
        () => materials.filter((item) => item.subject === subject),
        [materials, subject]
    );

    const handleDeleteVideo = async (id) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                await deleteVideoLibrary(id);
                fetchVideos();
            } catch (err) {
                alert(err.response?.data?.message || "Failed to delete video.");
            }
        }
    };

    return (
        <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-violet-600">
                        <BookOpen size={20} />
                        <span className="text-xs font-extrabold uppercase tracking-widest">
                            Digital Learning Hub
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                        School Digital Library
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Educational video lectures, GSEB textbooks, and study materials.
                    </p>
                </div>

                {/* Management Action Buttons */}
                {canManage && (
                    <div className="flex flex-wrap gap-2.5">
                        {activeTab === "videos" && (
                            <button
                                onClick={() => setAddVideoModalOpen(true)}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition"
                            >
                                <Play size={18} className="fill-current" />
                                Add Video Link
                            </button>
                        )}

                        {activeTab === "textbooks" && (
                            <>
                                <button
                                    onClick={() => setTextbookOpen(true)}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-5 font-bold text-violet-700 shadow-sm hover:bg-violet-50"
                                >
                                    <BookMarked size={18} />
                                    Add Textbook Link
                                </button>

                                <button
                                    onClick={() => setUploadOpen(true)}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
                                >
                                    <Plus size={18} />
                                    Upload Material
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("videos")}
                    className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-extrabold transition ${
                        activeTab === "videos"
                            ? "border-red-600 text-red-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                    <Video size={18} />
                    🎥 Educational Video Library
                </button>

                <button
                    onClick={() => setActiveTab("textbooks")}
                    className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-extrabold transition ${
                        activeTab === "textbooks"
                            ? "border-violet-600 text-violet-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                    <BookOpen size={18} />
                    📖 Textbooks & Study PDF Notes
                </button>
            </div>

            {/* TAB 1: DIGITAL VIDEO LIBRARY */}
            {activeTab === "videos" && (
                <div className="space-y-6">
                    {/* Search & Filters */}
                    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-slate-200">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-red-500">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search videos by title, subject..."
                                value={videoSearch}
                                onChange={(e) => setVideoSearch(e.target.value)}
                                className="h-10 w-full bg-transparent text-sm outline-none"
                            />
                        </div>

                        <select
                            value={videoStdFilter}
                            onChange={(e) => setVideoStdFilter(e.target.value)}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-red-500"
                        >
                            <option value="">All Videos & Standards</option>
                            <option value="whole_school">🌐 Whole School Videos Only</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                                <option key={s} value={s}>Standard {s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Video Cards Grid */}
                    {videosLoading ? (
                        <div className="flex justify-center py-20 text-slate-500">
                            <Loader2 className="mr-2 animate-spin text-red-600" size={24} />
                            Loading Educational Videos...
                        </div>
                    ) : videos.length === 0 ? (
                        <Empty text="No educational videos found in Digital Library." />
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {videos.map((vid) => (
                                <article
                                    key={vid._id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {/* Video Thumbnail with Inline Play Button */}
                                    <div
                                        onClick={() => setSelectedVideo(vid)}
                                        className="relative aspect-video w-full cursor-pointer bg-slate-900 overflow-hidden"
                                    >
                                        <img
                                            src={`https://img.youtube.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`}
                                            alt={vid.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 grid place-items-center bg-slate-950/20 transition group-hover:bg-slate-950/40">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 transition duration-300 group-hover:scale-110">
                                                <Play size={22} className="fill-current ml-0.5" />
                                            </div>
                                        </div>

                                        {/* Scope Badge */}
                                        <div className="absolute top-2.5 left-2.5">
                                            {vid.targetScope === "whole_school" ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow backdrop-blur-sm">
                                                    <Globe size={11} /> Whole School
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow backdrop-blur-sm">
                                                    Std {vid.standard}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex flex-1 flex-col justify-between p-4">
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                                                    {vid.subject}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    By {vid.uploadedByName}
                                                </span>
                                            </div>

                                            <h3
                                                onClick={() => setSelectedVideo(vid)}
                                                className="mt-1.5 text-sm font-extrabold text-slate-800 line-clamp-2 cursor-pointer hover:text-red-600 transition"
                                            >
                                                {vid.title}
                                            </h3>

                                            {vid.description && (
                                                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                                                    {vid.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedVideo(vid)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                                            >
                                                <Play size={14} className="fill-current" /> Watch Inline
                                            </button>

                                            {canManage && (role === "admin" || vid.uploadedBy === user?.id) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteVideo(vid._id)}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                    title="Delete Video"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: TEXTBOOKS & STUDY NOTES */}
            {activeTab === "textbooks" && (
                <div className="space-y-6">
                    <section className="rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-sky-700 p-5 text-white shadow-xl sm:p-7">
                        <p className="text-sm font-semibold text-violet-100">Select Standard</p>
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                            {STANDARDS.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => {
                                        setStandard(item);
                                        setSubject("");
                                    }}
                                    className={`rounded-xl px-3 py-3 text-sm font-extrabold transition ${
                                        item === standard
                                            ? "bg-white text-violet-700 shadow"
                                            : "bg-white/10 hover:bg-white/20"
                                    }`}
                                >
                                    Standard {item}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-2">
                            <Palette size={20} className="text-violet-600" />
                            <h2 className="text-xl font-extrabold text-slate-800">
                                Standard {standard} Subjects
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Select a color-coded subject to view its study materials.
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                            {subjects.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setSubject(item)}
                                    className={`rounded-2xl border p-4 text-left transition ${
                                        subject === item
                                            ? "ring-2 ring-violet-500 ring-offset-2"
                                            : "hover:shadow-md"
                                    } ${SUBJECT_STYLE[item] || "border-slate-200 bg-white text-slate-700"}`}
                                >
                                    <BookOpen size={20} className="mb-4" />
                                    <span className="block min-h-10 text-sm font-extrabold leading-5">
                                        {item}
                                    </span>
                                    <span className="mt-1 block text-xs font-semibold opacity-70">
                                        {materials.filter((m) => m.subject === item).length} materials
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        {materialsLoading ? (
                            <div className="flex justify-center py-16 text-slate-500">
                                <Loader2 className="mr-2 animate-spin text-violet-600" />
                                Loading library...
                            </div>
                        ) : !subject ? (
                            <Empty text="Choose a subject above to view its material." />
                        ) : !visibleMaterials.length ? (
                            <Empty text="No material uploaded for this subject yet." />
                        ) : (
                            <div
                                className={
                                    visibleMaterials.every(
                                        (item) => item.sourceType === "textbook-link"
                                    )
                                        ? "flex flex-wrap justify-center gap-6 sm:justify-start"
                                        : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                                }
                            >
                                {visibleMaterials.map((item) => (
                                    <MaterialCard
                                        key={item._id}
                                        item={item}
                                        color={
                                            SUBJECT_STYLE[subject] ||
                                            "border-slate-200 bg-white text-slate-700"
                                        }
                                        canManage={canManage}
                                        onDelete={async () => {
                                            if (window.confirm("Delete this material?")) {
                                                await deleteLibraryMaterial(item._id);
                                                fetchMaterials();
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* MODALS */}
            {selectedVideo && (
                <VideoPlayerModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}

            {addVideoModalOpen && (
                <AddVideoModal
                    userRole={role}
                    onClose={() => setAddVideoModalOpen(false)}
                    onSaved={() => {
                        setAddVideoModalOpen(false);
                        fetchVideos();
                    }}
                />
            )}

            {uploadOpen && (
                <UploadModal
                    standard={standard}
                    onClose={() => setUploadOpen(false)}
                    onSaved={() => {
                        setUploadOpen(false);
                        fetchMaterials();
                    }}
                />
            )}

            {textbookOpen && (
                <TextbookLinkModal
                    standard={standard}
                    onClose={() => setTextbookOpen(false)}
                    onSaved={() => {
                        setTextbookOpen(false);
                        fetchMaterials();
                    }}
                />
            )}
        </div>
    );
}

function Empty({ text }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <BookOpen className="mx-auto mb-3 text-slate-300" size={38} />
            {text}
        </div>
    );
}

function MaterialCard({ item, color, canManage, onDelete }) {
    const Icon = item.sourceType === "textbook-link" ? BookMarked : iconFor(item.fileType);

    if (item.sourceType === "textbook-link") {
        return (
            <article className="group w-64 overflow-hidden rounded-md border border-slate-300 border-r-4 border-b-4 border-r-slate-400 border-b-slate-400 bg-white shadow-[7px_9px_16px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-2 hover:shadow-[12px_18px_25px_rgba(15,23,42,0.28)] sm:w-40">
                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="block p-2">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-slate-100 shadow-inner">
                        {item.coverImageUrl ? (
                            <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                            <div className={`flex h-full items-center justify-center ${color}`}>
                                <BookMarked size={48} />
                            </div>
                        )}
                        <div className="absolute inset-0 grid place-items-center bg-slate-950/0 opacity-0 transition group-hover:bg-slate-950/35 group-hover:opacity-100">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-violet-700">
                                <ExternalLink size={14} /> Open
                            </span>
                        </div>
                    </div>
                    <h3 className="min-h-13 p-3 text-center text-base font-extrabold leading-5 text-slate-800 sm:text-sm">
                        {item.title}
                    </h3>
                </a>
                {canManage && (
                    <div className="border-t border-slate-100 px-2 py-1 text-right">
                        <button onClick={onDelete} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </article>
        );
    }

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={22} />
                </div>
                {canManage && (
                    <button onClick={onDelete} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                        <Trash2 size={17} />
                    </button>
                )}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-violet-600">{item.subject}</p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-800">{item.title}</h3>
            {item.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description}</p>}
            <p className="mt-3 truncate text-xs text-slate-400">{item.fileName}</p>
            <div className="mt-5 flex gap-2">
                <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
                >
                    <ExternalLink size={16} /> Open
                </a>
                <a
                    href={item.fileUrl}
                    download
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50"
                >
                    <Download size={17} />
                </a>
            </div>
        </article>
    );
}

function UploadModal({ standard: initialStandard, onClose, onSaved }) {
    const [standard, setStandard] = useState(initialStandard);
    const [form, setForm] = useState({ subject: SUBJECTS[initialStandard][0], title: "", description: "" });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const changeStandard = (value) => {
        const next = Number(value);
        setStandard(next);
        setForm({ ...form, subject: SUBJECTS[next][0] });
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!file) return alert("Choose a file.");
        const data = new FormData();
        data.append("classKey", `std-${standard}`);
        data.append("classLabel", `Standard ${standard}`);
        data.append("subject", form.subject);
        data.append("title", form.title);
        data.append("description", form.description);
        data.append("file", file);
        try {
            setSaving(true);
            await uploadLibraryMaterial(data);
            onSaved();
        } catch (error) {
            alert(error.response?.data?.message || "Upload failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <form onSubmit={submit} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Upload study material</h2>
                        <p className="mt-1 text-sm text-slate-500">Files are stored securely in Cloudinary.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
                        <X />
                    </button>
                </div>
                <div className="mt-6 space-y-4">
                    <select value={standard} onChange={(e) => changeStandard(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold outline-none">
                        {STANDARDS.map((item) => (
                            <option key={item} value={item}>Standard {item}</option>
                        ))}
                    </select>
                    <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold outline-none">
                        {SUBJECTS[standard].map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none" placeholder="Material title" />
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 outline-none" rows="3" placeholder="Short description (optional)" />
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 p-5 text-violet-700 hover:bg-violet-100">
                        <FileUp size={24} />
                        <span className="text-sm font-bold">{file ? file.name : "Choose PDF, image, PPT or PPTX (max 25 MB)"}</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.ppt,.pptx" onChange={(e) => setFile(e.target.files?.[0])} className="hidden" />
                    </label>
                </div>
                <button disabled={saving} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-60">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
                    Upload material
                </button>
            </form>
        </div>
    );
}

function TextbookLinkModal({ standard: initialStandard, onClose, onSaved }) {
    const [standard, setStandard] = useState(initialStandard);
    const [form, setForm] = useState({ subject: SUBJECTS[initialStandard][0], title: "", pdfUrl: "", description: "" });
    const [coverImage, setCoverImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const changeStandard = (value) => {
        const next = Number(value);
        setStandard(next);
        setForm({ ...form, subject: SUBJECTS[next][0] });
    };

    const submit = async (event) => {
        event.preventDefault();
        try {
            setSaving(true);
            if (!coverImage) return alert("Choose a cover image.");
            const data = new FormData();
            Object.entries({ ...form, classKey: `std-${standard}`, classLabel: `Standard ${standard}` }).forEach(([key, value]) =>
                data.append(key, value)
            );
            data.append("coverImage", coverImage);
            await addTextbookLink(data);
            onSaved();
        } catch (error) {
            alert(error.response?.data?.message || "Could not add textbook link.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <form onSubmit={submit} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Add default textbook</h2>
                        <p className="mt-1 text-sm text-slate-500">Add PDF link and upload cover image.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
                        <X />
                    </button>
                </div>
                <div className="mt-6 space-y-4">
                    <select value={standard} onChange={(e) => changeStandard(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold outline-none">
                        {STANDARDS.map((item) => (
                            <option key={item} value={item}>Standard {item}</option>
                        ))}
                    </select>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold outline-none">
                        {SUBJECTS[standard].map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none" placeholder="Book name" />
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-violet-500">
                        <LinkIcon size={18} className="text-violet-500" />
                        <input required type="url" value={form.pdfUrl} onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })} className="h-11 min-w-0 flex-1 outline-none" placeholder="PDF URL: https://example.com/textbook.pdf" />
                    </div>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 p-5 text-violet-700 hover:bg-violet-100">
                        <FileImage size={24} />
                        <span className="text-sm font-bold">{coverImage ? coverImage.name : "Upload cover image (PNG, JPG or WEBP)"}</span>
                        <input required type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(event) => setCoverImage(event.target.files?.[0] || null)} className="hidden" />
                    </label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 outline-none" rows="3" placeholder="Short description (optional)" />
                </div>
                <button disabled={saving} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-60">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <BookMarked size={18} />}
                    Add textbook link
                </button>
            </form>
        </div>
    );
}
