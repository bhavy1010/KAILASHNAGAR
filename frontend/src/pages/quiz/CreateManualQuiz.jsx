import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, ArrowLeft, Save, HelpCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import PageHeader from "../../components/PageHeader";
import { createManualQuiz } from "../../services/quizService";

const CreateManualQuiz = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [title, setTitle] = useState("");
    const [standard, setStandard] = useState(8);
    const [subject, setSubject] = useState("Gujarati");
    const [chapterInput, setChapterInput] = useState("1, 2");
    const [timeLimitPerQuestion, setTimeLimitPerQuestion] = useState(30);
    const [showAnswerReview, setShowAnswerReview] = useState(true);
    const [status, setStatus] = useState("published");

    const [questions, setQuestions] = useState([
        {
            chapter: 1,
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0
        }
    ]);

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

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                chapter: 1,
                question: "",
                options: ["", ""],
                correctAnswer: 0
            }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        if (questions.length === 1) {
            setError("At least one question is required.");
            return;
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionTextChange = (index, val) => {
        const updated = [...questions];
        updated[index].question = val;
        setQuestions(updated);
    };

    const handleChapterChange = (index, val) => {
        const updated = [...questions];
        updated[index].chapter = Number(val) || 1;
        setQuestions(updated);
    };

    const handleOptionTextChange = (qIndex, optIndex, val) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = val;
        setQuestions(updated);
    };

    const handleAddOption = (qIndex) => {
        const updated = [...questions];
        if (updated[qIndex].options.length >= 4) return;
        updated[qIndex].options.push("");
        setQuestions(updated);
    };

    const handleRemoveOption = (qIndex, optIndex) => {
        const updated = [...questions];
        if (updated[qIndex].options.length <= 2) return;
        updated[qIndex].options.splice(optIndex, 1);
        if (updated[qIndex].correctAnswer >= updated[qIndex].options.length) {
            updated[qIndex].correctAnswer = 0;
        }
        setQuestions(updated);
    };

    const handleCorrectAnswerSelect = (qIndex, optIndex) => {
        const updated = [...questions];
        updated[qIndex].correctAnswer = optIndex;
        setQuestions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Please enter a quiz title.");
            return;
        }

        const parsedChapters = chapterInput
            .split(",")
            .map((c) => parseInt(c.trim()))
            .filter((c) => !isNaN(c));

        if (parsedChapters.length === 0) {
            setError("Please enter valid chapter numbers (e.g. 1, 2, 3).");
            return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) {
                setError(`Question ${i + 1} text cannot be empty.`);
                return;
            }
            if (q.options.some((o) => !o.trim())) {
                setError(`Question ${i + 1} contains empty answer options.`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                title: title.trim(),
                standard: Number(standard),
                subject,
                chapters: parsedChapters,
                questionCount: questions.length,
                timeLimitPerQuestion: Number(timeLimitPerQuestion),
                showAnswerReview,
                status,
                questions
            };

            const res = await createManualQuiz(payload);
            if (res.success) {
                navigate("/quiz");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create manual quiz.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("quiz.createManual", "Create Manual Quiz")}
                subtitle="Design custom questions with options"
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
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-medium text-rose-600 dark:text-rose-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Settings */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Common Quiz Settings
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Quiz Title *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Std 8 Science Ch 1-3 Monthly Test"
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
                                Chapters (Comma separated) *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 1, 2, 3"
                                value={chapterInput}
                                onChange={(e) => setChapterInput(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                            />
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

                        <div className="flex items-center gap-2 pt-4">
                            <input
                                type="checkbox"
                                id="showReviewCheck"
                                checked={showAnswerReview}
                                onChange={(e) => setShowAnswerReview(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="showReviewCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Enable Answer Review for Students after Submission
                            </label>
                        </div>
                    </div>
                </div>

                {/* Questions Builder */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                            Questions ({questions.length})
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Question
                        </button>
                    </div>

                    {questions.map((q, qIndex) => (
                        <div
                            key={qIndex}
                            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 relative"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                                    Question #{qIndex + 1}
                                </span>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                        Chapter:
                                        <input
                                            type="number"
                                            value={q.chapter}
                                            onChange={(e) => handleChapterChange(qIndex, e.target.value)}
                                            min="1"
                                            className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(qIndex)}
                                        className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition"
                                        title="Delete Question"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    Question Text *
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Write your question here..."
                                    value={q.question}
                                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
                                />
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        Answer Options (Select correct answer radio button)
                                    </label>
                                    {q.options.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={() => handleAddOption(qIndex)}
                                            className="text-xs font-bold text-indigo-600 hover:underline"
                                        >
                                            + Add Option
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {q.options.map((opt, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={`flex items-center gap-2 rounded-xl border p-2.5 transition ${
                                                q.correctAnswer === optIndex
                                                    ? "border-emerald-500 bg-emerald-500/5"
                                                    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`correct_${qIndex}`}
                                                checked={q.correctAnswer === optIndex}
                                                onChange={() => handleCorrectAnswerSelect(qIndex, optIndex)}
                                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Option ${optIndex + 1}`}
                                                value={opt}
                                                onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                                                required
                                                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none"
                                            />
                                            {q.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(qIndex, optIndex)}
                                                    className="text-xs text-rose-500 hover:font-bold px-1"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-95 transition"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? "Saving Quiz..." : "Save & Publish Quiz"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateManualQuiz;
