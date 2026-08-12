import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowLeft, Save, Sparkles, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import PageHeader from "../../components/PageHeader";
import { createAutoQuiz } from "../../services/quizService";

const CreateAutoQuiz = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [title, setTitle] = useState("");
    const [standard, setStandard] = useState(8);
    const [subject, setSubject] = useState("Gujarati");
    const [selectedChapters, setSelectedChapters] = useState([1, 2, 3, 4, 5]);
    const [selectAllChapters, setSelectAllChapters] = useState(false);
    const [questionCount, setQuestionCount] = useState(10);
    const [timeLimitPerQuestion, setTimeLimitPerQuestion] = useState(30);
    const [showAnswerReview, setShowAnswerReview] = useState(true);
    const [status, setStatus] = useState("published");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const subjectsList = [
        "Gujarati",
        "Mathematics",
        "Science",
        "Social Science",
        "Hindi",
        "Sanskrit",
        "Environment",
        "English"
    ];

    const availableChapterNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    const handleChapterToggle = (chNum) => {
        setSelectAllChapters(false);
        if (selectedChapters.includes(chNum)) {
            setSelectedChapters(selectedChapters.filter((c) => c !== chNum));
        } else {
            setSelectedChapters([...selectedChapters, chNum].sort((a, b) => a - b));
        }
    };

    const handleSelectAllToggle = () => {
        if (!selectAllChapters) {
            setSelectAllChapters(true);
            setSelectedChapters([0]); // 0 represents all chapters
        } else {
            setSelectAllChapters(false);
            setSelectedChapters([1, 2, 3]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Please enter a quiz title.");
            return;
        }

        if (selectedChapters.length === 0) {
            setError("Please select at least one chapter.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: title.trim(),
                standard: Number(standard),
                subject,
                chapters: selectAllChapters ? [0] : selectedChapters,
                questionCount: Number(questionCount),
                timeLimitPerQuestion: Number(timeLimitPerQuestion),
                showAnswerReview,
                status
            };

            const res = await createAutoQuiz(payload);
            if (res.success) {
                navigate("/quiz");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate auto quiz.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("quiz.createAuto", "Create Auto Quiz")}
                subtitle="Randomly select questions from local JSON question bank with smart chapter distribution"
            >
                <button
                    onClick={() => navigate("/quiz")}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Quizzes
                </button>
            </PageHeader>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-5 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-extrabold text-sm mb-1">Question Bank Selection Alert</h4>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                Auto Quiz Generator Settings
                            </h3>
                            <p className="text-xs text-slate-500">
                                Questions are picked randomly without duplicates from local backend question banks
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Quiz Title *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Std 8 Mathematics Ch 1-5 Auto Quiz"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Standard (Std 1 to 8) *
                            </label>
                            <select
                                value={standard}
                                onChange={(e) => setStandard(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                    <option key={s} value={s}>
                                        Std {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Subject *
                            </label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            >
                                {subjectsList.map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Total Number of Questions *
                            </label>
                            <select
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            >
                                {[5, 10, 15, 20, 25, 30, 40, 50].map((num) => (
                                    <option key={num} value={num}>
                                        {num} Questions
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Per-Question Timer *
                            </label>
                            <select
                                value={timeLimitPerQuestion}
                                onChange={(e) => setTimeLimitPerQuestion(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            >
                                <option value={0}>No time limit</option>
                                <option value={15}>15 sec</option>
                                <option value={30}>30 sec</option>
                                <option value={45}>45 sec</option>
                                <option value={60}>60 sec</option>
                                <option value={90}>90 sec</option>
                                <option value={120}>120 sec</option>
                                <option value={180}>180 sec</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Quiz Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            >
                                <option value="published">Published (Visible to students)</option>
                                <option value="draft">Draft (Hidden from students)</option>
                            </select>
                        </div>
                    </div>

                    {/* Chapter Selection */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Select Chapters to Include:
                            </label>
                            <button
                                type="button"
                                onClick={handleSelectAllToggle}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {selectAllChapters ? "Deselect All (Pick Chapters)" : "Select All Chapters"}
                            </button>
                        </div>

                        {!selectAllChapters && (
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                                {availableChapterNumbers.map((ch) => {
                                    const isSelected = selectedChapters.includes(ch);
                                    return (
                                        <button
                                            key={ch}
                                            type="button"
                                            onClick={() => handleChapterToggle(ch)}
                                            className={`rounded-xl p-2.5 text-xs font-bold transition border ${
                                                isSelected
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                                                    : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:border-indigo-300"
                                            }`}
                                        >
                                            Ch {ch}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="showReviewCheckAuto"
                            checked={showAnswerReview}
                            onChange={(e) => setShowAnswerReview(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="showReviewCheckAuto" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Enable Answer Review for Students after Submission
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/quiz")}
                        className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/20 hover:opacity-95 transition"
                    >
                        <Sparkles className="h-4 w-4" />
                        {loading ? "Generating Quiz..." : "Generate & Publish Auto Quiz"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAutoQuiz;
