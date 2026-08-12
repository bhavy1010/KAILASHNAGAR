import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    PlusCircle,
    Trash2,
    CheckCircle2,
    Save,
    Globe,
    BookOpen,
    Clock,
    FileText,
    AlertTriangle,
    HelpCircle,
    Edit3
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import { getQuizById, updateQuiz } from "../../services/quizService";

const EMPTY_QUESTION = {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    chapter: 1
};

const QuizPreviewEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [editingIdx, setEditingIdx] = useState(null); // which question is being edited inline
    const [addingNew, setAddingNew] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ ...EMPTY_QUESTION });

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getQuizById(id);
            if (res.success) {
                setQuiz(res.quiz);
                setQuestions(res.quiz.questions || []);
            } else {
                setError("Quiz not found.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load quiz.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = (idx) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleEditQuestion = (idx, field, value) => {
        setQuestions(prev => {
            const updated = [...prev];
            if (field.startsWith("option_")) {
                const optIdx = parseInt(field.split("_")[1]);
                updated[idx] = {
                    ...updated[idx],
                    options: updated[idx].options.map((o, i) => i === optIdx ? value : o)
                };
            } else {
                updated[idx] = { ...updated[idx], [field]: value };
            }
            return updated;
        });
    };

    const handleSaveChanges = async () => {
        if (questions.length === 0) {
            setError("Quiz must have at least one question.");
            return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question?.trim()) {
                setError(`Question ${i + 1} text is empty.`);
                return;
            }
            const validOptions = q.options?.filter(o => o.trim()) || [];
            if (validOptions.length < 2) {
                setError(`Question ${i + 1} must have at least 2 options.`);
                return;
            }
        }

        setSaving(true);
        setError("");
        try {
            const res = await updateQuiz(id, { questions });
            if (res.success) {
                setSuccessMsg("Quiz questions saved successfully!");
                setQuiz(res.quiz);
                setQuestions(res.quiz.questions || []);
                setEditingIdx(null);
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = () => {
        if (!newQuestion.question.trim()) {
            setError("Question text is required.");
            return;
        }
        const validOptions = newQuestion.options.filter(o => o.trim());
        if (validOptions.length < 2) {
            setError("At least 2 options are required.");
            return;
        }

        const formatted = {
            id: `manual_${Date.now()}_new`,
            chapter: newQuestion.chapter || (quiz?.chapters?.[0] || 1),
            question: newQuestion.question.trim(),
            options: newQuestion.options.filter(o => o.trim()),
            correctAnswer: Math.min(newQuestion.correctAnswer, validOptions.length - 1)
        };

        setQuestions(prev => [...prev, formatted]);
        setNewQuestion({ ...EMPTY_QUESTION });
        setAddingNew(false);
        setError("");
    };

    const updateNewOption = (idx, val) => {
        setNewQuestion(prev => ({
            ...prev,
            options: prev.options.map((o, i) => i === idx ? val : o)
        }));
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <Loader />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="py-20 text-center text-slate-500">
                Quiz not found.
            </div>
        );
    }

    const isAutoQuiz = quiz.quizType === "auto";
    const isDraft = quiz.status === "draft";

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Preview: ${quiz.title}`}
                subtitle={`${quiz.subject} • Std ${quiz.standard} • ${quiz.quizType} quiz`}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/quiz")}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Quiz List
                    </button>
                    {!isAutoQuiz && (
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-90 transition disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    )}
                </div>
            </PageHeader>

            {/* Alerts */}
            {successMsg && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-600 dark:text-emerald-400">
                    <p className="text-sm font-semibold">{successMsg}</p>
                    <button onClick={() => setSuccessMsg("")} className="text-xs font-bold">✕</button>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-600 dark:text-rose-400">
                    <p className="text-sm font-semibold">{error}</p>
                    <button onClick={() => setError("")} className="text-xs font-bold">✕</button>
                </div>
            )}

            {/* Quiz Meta Info */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</span>
                        <span className={`inline-flex items-center gap-1.5 font-bold capitalize ${
                            quiz.status === "published"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                        }`}>
                            <Globe className="h-3.5 w-3.5" />
                            {quiz.status}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Questions</span>
                        <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                            <FileText className="h-3.5 w-3.5 text-indigo-500" />
                            {questions.length}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Time / Q</span>
                        <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            {quiz.timeLimitPerQuestion > 0 ? `${quiz.timeLimitPerQuestion}s` : "No Limit"}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Created By</span>
                        <span className="font-bold text-slate-800 dark:text-white">{quiz.createdByName}</span>
                    </div>
                </div>
            </div>

            {/* Auto quiz warning */}
            {isAutoQuiz && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                        This is an <strong>Auto Quiz</strong> — questions are generated from the question bank at runtime. Individual question editing is not supported for auto quizzes. You can view the question structure but cannot add or remove questions here.
                    </p>
                </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-indigo-500" />
                        Questions ({questions.length})
                    </h3>
                    {!isAutoQuiz && (
                        <button
                            onClick={() => { setAddingNew(true); setError(""); }}
                            className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 px-3 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Question
                        </button>
                    )}
                </div>

                {questions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-400">
                        No questions yet. Add your first question above.
                    </div>
                ) : (
                    questions.map((q, idx) => (
                        <QuestionCard
                            key={`${q.id || idx}-${idx}`}
                            question={q}
                            index={idx}
                            isEditing={editingIdx === idx}
                            isAutoQuiz={isAutoQuiz}
                            onEdit={() => setEditingIdx(editingIdx === idx ? null : idx)}
                            onDelete={() => handleDeleteQuestion(idx)}
                            onFieldChange={(field, val) => handleEditQuestion(idx, field, val)}
                        />
                    ))
                )}
            </div>

            {/* Add New Question Form */}
            {addingNew && !isAutoQuiz && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-indigo-300 dark:border-indigo-700 p-6 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                        New Question #{questions.length + 1}
                    </h4>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Question Text *</label>
                        <textarea
                            rows={2}
                            value={newQuestion.question}
                            onChange={e => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Enter question..."
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {newQuestion.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="newCorrect"
                                    checked={newQuestion.correctAnswer === i}
                                    onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: i }))}
                                    className="accent-indigo-600"
                                />
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={e => updateNewOption(i, e.target.value)}
                                    placeholder={`Option ${i + 1}${i < 2 ? " *" : ""}`}
                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400">Select the radio button next to the correct answer.</p>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90 transition"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add to Quiz
                        </button>
                        <button
                            onClick={() => { setAddingNew(false); setNewQuestion({ ...EMPTY_QUESTION }); setError(""); }}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Save */}
            {!isAutoQuiz && questions.length > 0 && (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-90 transition disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            )}
        </div>
    );
};

// ----- Sub-component: Question Card -----
const QuestionCard = ({ question, index, isEditing, isAutoQuiz, onEdit, onDelete, onFieldChange }) => {
    const optionLabels = ["A", "B", "C", "D"];

    return (
        <div className={`rounded-2xl bg-white dark:bg-slate-900 border shadow-sm transition ${
            isEditing
                ? "border-indigo-400 dark:border-indigo-600"
                : "border-slate-100 dark:border-slate-800"
        }`}>
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {index + 1}
                    </span>

                    {isEditing && !isAutoQuiz ? (
                        <textarea
                            rows={2}
                            value={question.question}
                            onChange={e => onFieldChange("question", e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
                        />
                    ) : (
                        <p className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                            {question.question}
                        </p>
                    )}
                </div>

                {!isAutoQuiz && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={onEdit}
                            className={`p-1.5 rounded-lg transition ${
                                isEditing
                                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title={isEditing ? "Collapse" : "Edit question"}
                        >
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete question"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-5 pb-5">
                {question.options?.map((opt, i) => {
                    const isCorrect = i === question.correctAnswer;
                    return (
                        <div
                            key={i}
                            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition ${
                                isCorrect
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700"
                                    : "bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                            }`}
                        >
                            {isEditing && !isAutoQuiz ? (
                                <>
                                    <input
                                        type="radio"
                                        name={`correct_${index}`}
                                        checked={isCorrect}
                                        onChange={() => onFieldChange("correctAnswer", i)}
                                        className="accent-emerald-600 shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={e => onFieldChange(`option_${i}`, e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100"
                                        placeholder={`Option ${optionLabels[i]}`}
                                    />
                                </>
                            ) : (
                                <>
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                        isCorrect
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                    }`}>
                                        {optionLabels[i]}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                        isCorrect
                                            ? "text-emerald-700 dark:text-emerald-300 font-bold"
                                            : "text-slate-700 dark:text-slate-300"
                                    }`}>
                                        {opt}
                                    </span>
                                    {isCorrect && (
                                        <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500 shrink-0" />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Chapter tag */}
            <div className="px-5 pb-4">
                <span className="text-xs text-slate-400 font-medium">
                    Chapter {question.chapter}
                </span>
            </div>
        </div>
    );
};

export default QuizPreviewEdit;
