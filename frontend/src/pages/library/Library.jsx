import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    Download,
    ExternalLink,
    FileImage,
    FileText,
    FileUp,
    Loader2,
    Palette,
    Presentation,
    Plus,
    Trash2,
    X
} from "lucide-react";

import {
    deleteLibraryMaterial,
    getLibraryMaterials,
    uploadLibraryMaterial
} from "../../services/libraryService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const STANDARDS = [1, 2, 3, 4, 5, 6, 7, 8];

const SUBJECTS = {
    1: ["Gujarati / Kalarav", "Mathematics", "General Education / Joyful Activities"],
    2: ["Gujarati / Kallol", "Mathematics", "General Education / Joyful Activities"],
    3: [
        "Gujarati",
        "Mathematics",
        "English",
        "Environmental Studies (EVS)",
        "Hindi",
        "Drawing",
        "Computer"
    ],
    4: [
        "Gujarati",
        "Mathematics",
        "English",
        "Environmental Studies (EVS)",
        "Hindi",
        "Drawing",
        "Computer"
    ],
    5: [
        "Gujarati",
        "Mathematics",
        "English",
        "Environmental Studies (EVS)",
        "Hindi",
        "Drawing",
        "Computer"
    ],
    6: [
        "Gujarati",
        "Mathematics",
        "Science and Technology",
        "Social Science",
        "English",
        "Hindi",
        "Sanskrit"
    ],
    7: [
        "Gujarati",
        "Mathematics",
        "Science and Technology",
        "Social Science",
        "English",
        "Hindi",
        "Sanskrit"
    ],
    8: [
        "Gujarati",
        "Mathematics",
        "Science and Technology",
        "Social Science",
        "English",
        "Hindi",
        "Sanskrit"
    ]
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

const SUBJECT_LABEL_GU = {
    Gujarati: "ગુજરાતી",
    "Gujarati / Kalarav": "ગુજરાતી / કલરવ",
    "Gujarati / Kallol": "ગુજરાતી / કલ્લોલ",
    Mathematics: "ગણિત",
    English: "અંગ્રેજી",
    "Environmental Studies (EVS)": "પર્યાવરણીય અભ્યાસ (EVS)",
    "Science and Technology": "વિજ્ઞાન અને ટેકનોલોજી",
    "Social Science": "સામાજિક વિજ્ઞાન",
    Hindi: "હિન્દી",
    Sanskrit: "સંસ્કૃત",
    Drawing: "ચિત્રકામ",
    Computer: "કમ્પ્યુટર",
    "General Education / Joyful Activities": "સામાન્ય શિક્ષણ / આનંદદાયક પ્રવૃત્તિઓ"
};

const iconFor = (type) => {
    if (type.startsWith("image/")) return FileImage;
    if (type.includes("presentation") || type.includes("powerpoint")) return Presentation;
    return FileText;
};

export default function Library() {
    const { user } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const canManage = ["admin", "teacher"].includes(user?.role);

    const [standard, setStandard] = useState(1);
    const [subject, setSubject] = useState("");
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);

    const classKey = `std-${standard}`;

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        eyebrow: isGujarati ? "ડિજિટલ લર્નિંગ હબ" : "Digital learning hub",
        title: isGujarati ? "શાળા લાઇબ્રેરી" : "School Library",
        subtitle: isGujarati
            ? "ધોરણ 1 થી 8 માટે GCERT / GSEB ગુજરાતી-માધ્યમ અભ્યાસ સામગ્રી."
            : "GCERT / GSEB Gujarati-medium study material for Standards 1 to 8.",
        uploadMaterial: isGujarati ? "સામગ્રી અપલોડ કરો" : "Upload material",
        chooseStandard: isGujarati ? "ધોરણ પસંદ કરો" : "Choose standard",
        std: isGujarati ? "ધોરણ" : "Std",
        subjects: isGujarati ? "વિષયો" : "subjects",
        selectSubjectHint: isGujarati
            ? "તેની અભ્યાસ સામગ્રી જોવા માટે રંગીન વિષય પસંદ કરો."
            : "Select a color-coded subject to view its study materials.",
        materialsSuffix: isGujarati ? "સામગ્રી" : "materials",
        loadingLibrary: isGujarati ? "લાઇબ્રેરી લોડ થઈ રહી છે…" : "Loading library…",
        chooseSubjectPrompt: isGujarati
            ? "તેની સામગ્રી જોવા માટે ઉપર વિષય પસંદ કરો."
            : "Choose a subject above to view its material.",
        noMaterialPrefix: isGujarati ? "માટે હજુ સુધી કોઈ" : "No",
        noMaterialMiddle: isGujarati
            ? "સામગ્રી અપલોડ કરવામાં આવી નથી."
            : "material uploaded for Standard",
        noMaterialSuffixGu: isGujarati ? "" : "yet.",
        open: isGujarati ? "ખોલો" : "Open",
        confirmDelete: isGujarati ? "આ સામગ્રી કાઢી નાખવી છે?" : "Delete this material?",
        uploadTitle: isGujarati ? "અભ્યાસ સામગ્રી અપલોડ કરો" : "Upload study material",
        uploadSubtitle: isGujarati
            ? "ફાઇલો Cloudinary માં સંગ્રહિત થાય છે, MongoDB માં નહીં."
            : "Files are stored in Cloudinary, not MongoDB.",
        standardLabel: isGujarati ? "ધોરણ" : "Standard",
        titlePlaceholder: isGujarati ? "સામગ્રીનું શીર્ષક" : "Material title",
        descriptionPlaceholder: isGujarati
            ? "ટૂંકું વર્ણન (વૈકલ્પિક)"
            : "Short description (optional)",
        chooseFilePlaceholder: isGujarati
            ? "PDF, ઇમેજ, PPT અથવા PPTX પસંદ કરો (મહત્તમ 25 MB)"
            : "Choose PDF, image, PPT or PPTX (max 25 MB)",
        uploadButton: isGujarati ? "સામગ્રી અપલોડ કરો" : "Upload material",
        chooseFileAlert: isGujarati ? "કૃપા કરીને ફાઇલ પસંદ કરો." : "Choose a file.",
        uploadFailedAlert: isGujarati ? "અપલોડ નિષ્ફળ થયું." : "Upload failed."
    };

    const subjectLabel = (name) => (isGujarati ? SUBJECT_LABEL_GU[name] || name : name);

    const loadMaterials = () => {
        setLoading(true);

        getLibraryMaterials(classKey)
            .then(({ materials: data }) => setMaterials(data || []))
            .catch(() => setMaterials([]))
            .finally(() => setLoading(false));
    };

    useEffect(loadMaterials, [standard]);

    const subjects = SUBJECTS[standard];

    const visible = useMemo(
        () => materials.filter((item) => item.subject === subject),
        [materials, subject]
    );

    const chooseStandard = (item) => {
        setStandard(item);
        setSubject("");
    };

    const handleDelete = async (item) => {
        if (!window.confirm(text.confirmDelete)) return;

        await deleteLibraryMaterial(item._id);
        loadMaterials();
    };

    return (
        <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-violet-600">
                        <BookOpen size={20} />
                        <span className="text-sm font-bold uppercase tracking-widest">
                            {text.eyebrow}
                        </span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-slate-500">{text.subtitle}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm hover:border-violet-400 hover:text-violet-600"
                    >
                        {text.switchLang}
                    </button>

                    {canManage && (
                        <button
                            onClick={() => setUploadOpen(true)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
                        >
                            <Plus size={18} />
                            {text.uploadMaterial}
                        </button>
                    )}
                </div>
            </div>

            {/* ============================== Standard Picker ============================== */}

            <section className="rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-sky-700 p-5 text-white shadow-xl sm:p-7">
                <p className="text-sm font-semibold text-violet-100">
                    {text.chooseStandard}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                    {STANDARDS.map((item) => (
                        <button
                            key={item}
                            onClick={() => chooseStandard(item)}
                            className={`rounded-xl px-3 py-3 text-sm font-extrabold transition ${
                                item === standard
                                    ? "bg-white text-violet-700 shadow"
                                    : "bg-white/10 hover:bg-white/20"
                            }`}
                        >
                            {text.std} {item}
                        </button>
                    ))}
                </div>
            </section>

            {/* ============================== Subjects ============================== */}

            <section className="mt-7">
                <div className="flex items-center gap-2">
                    <Palette size={20} className="text-violet-600" />
                    <h2 className="text-xl font-extrabold text-slate-800">
                        {text.std} {standard} {text.subjects}
                    </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">{text.selectSubjectHint}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                    {subjects.map((item) => (
                        <button
                            key={item}
                            onClick={() => setSubject(item)}
                            className={`rounded-2xl border p-4 text-left transition ${
                                subject === item
                                    ? "ring-2 ring-violet-500 ring-offset-2"
                                    : "hover:shadow-md"
                            } ${SUBJECT_STYLE[item]}`}
                        >
                            <BookOpen size={20} className="mb-4" />

                            <span className="block min-h-10 text-sm font-extrabold leading-5">
                                {subjectLabel(item)}
                            </span>

                            <span className="mt-1 block text-xs font-semibold opacity-70">
                                {materials.filter((m) => m.subject === item).length}{" "}
                                {text.materialsSuffix}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ============================== Materials ============================== */}

            <section className="mt-7">
                {loading ? (
                    <div className="flex justify-center py-16 text-slate-500">
                        <Loader2 className="mr-2 animate-spin" />
                        {text.loadingLibrary}
                    </div>
                ) : !subject ? (
                    <Empty text={text.chooseSubjectPrompt} />
                ) : !visible.length ? (
                    <Empty
                        text={`${text.noMaterialPrefix} ${subjectLabel(subject)} ${
                            text.noMaterialMiddle
                        } ${text.std} ${standard} ${text.noMaterialSuffixGu}`}
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {visible.map((item) => (
                            <MaterialCard
                                key={item._id}
                                item={item}
                                color={SUBJECT_STYLE[subject]}
                                canManage={canManage}
                                openLabel={text.open}
                                onDelete={() => handleDelete(item)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ============================== Upload Modal ============================== */}

            {uploadOpen && (
                <UploadModal
                    standard={standard}
                    text={text}
                    subjectLabel={subjectLabel}
                    onClose={() => setUploadOpen(false)}
                    onSaved={() => {
                        setUploadOpen(false);
                        loadMaterials();
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

function MaterialCard({ item, color, canManage, openLabel, onDelete }) {
    const Icon = iconFor(item.fileType);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
                >
                    <Icon size={22} />
                </div>

                {canManage && (
                    <button
                        onClick={onDelete}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                    >
                        <Trash2 size={17} />
                    </button>
                )}
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-violet-600">
                {item.subject}
            </p>

            <h3 className="mt-1 text-lg font-extrabold text-slate-800">{item.title}</h3>

            {item.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {item.description}
                </p>
            )}

            <p className="mt-3 truncate text-xs text-slate-400">{item.fileName}</p>

            <div className="mt-5 flex gap-2">
                <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
                >
                    <ExternalLink size={16} />
                    {openLabel}
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

function UploadModal({ standard: initialStandard, text, subjectLabel, onClose, onSaved }) {
    const [standard, setStandard] = useState(initialStandard);

    const [form, setForm] = useState({
        subject: SUBJECTS[initialStandard][0],
        title: "",
        description: ""
    });

    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const changeStandard = (value) => {
        const next = Number(value);
        setStandard(next);
        setForm({ ...form, subject: SUBJECTS[next][0] });
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert(text.chooseFileAlert);
            return;
        }

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
            alert(error.response?.data?.message || text.uploadFailedAlert);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <form
                onSubmit={submit}
                className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            {text.uploadTitle}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">{text.uploadSubtitle}</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 hover:bg-slate-100"
                    >
                        <X />
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    <select
                        value={standard}
                        onChange={(e) => changeStandard(e.target.value)}
                        className="field"
                    >
                        {STANDARDS.map((item) => (
                            <option key={item} value={item}>
                                {text.standardLabel} {item}
                            </option>
                        ))}
                    </select>

                    <select
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="field"
                    >
                        {SUBJECTS[standard].map((item) => (
                            <option key={item} value={item}>
                                {subjectLabel(item)}
                            </option>
                        ))}
                    </select>

                    <input
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="field"
                        placeholder={text.titlePlaceholder}
                    />

                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-violet-500"
                        rows="3"
                        placeholder={text.descriptionPlaceholder}
                    />

                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 p-5 text-violet-700 hover:bg-violet-100">
                        <FileUp size={24} />
                        <span className="text-sm font-bold">
                            {file ? file.name : text.chooseFilePlaceholder}
                        </span>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.ppt,.pptx"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="hidden"
                        />
                    </label>
                </div>

                <button
                    disabled={saving}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                    {saving ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <FileUp size={18} />
                    )}
                    {text.uploadButton}
                </button>
            </form>
        </div>
    );
}