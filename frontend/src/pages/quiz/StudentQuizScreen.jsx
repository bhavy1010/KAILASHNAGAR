import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Play, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import { startQuizAttempt, saveQuizAnswer, submitQuizAttempt } from "../../services/quizService";

const StudentQuizScreen = () => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();

    const [attemptData, setAttemptData] = useState(null);
    const [started, setStarted] = useState(false);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionIndex }
    const [timeLeft, setTimeLeft] = useState(0); // Timer in seconds for current question
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitModalOpen, setSubmitModalOpen] = useState(false);

    const timerRef = useRef(null);

    // Fetch or Start Attempt
    useEffect(() => {
        const initQuiz = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await startQuizAttempt(quizId);
                if (res.success) {
                    setAttemptData(res.attempt);
                    // Pre-fill selected answers if resumed
                    const initialSelections = {};
                    res.attempt.questions.forEach((q) => {
                        if (q.selectedOption !== undefined && q.selectedOption !== -1) {
                            initialSelections[q.questionId] = q.selectedOption;
                        }
                    });
                    setSelectedAnswers(initialSelections);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load quiz attempt.");
            } finally {
                setLoading(false);
            }
        };

        if (quizId) initQuiz();
    }, [quizId]);

    // Timer logic per question
    useEffect(() => {
        if (!started || !attemptData) return;

        const timeLimit = attemptData.timeLimitPerQuestion || 0;
        if (timeLimit <= 0) return; // No time limit

        setTimeLeft(timeLimit);

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeExpire();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [started, currentQuestionIdx, attemptData]);

    const handleTimeExpire = () => {
        if (!attemptData) return;
        const total = attemptData.questions.length;
        if (currentQuestionIdx < total - 1) {
            setCurrentQuestionIdx((prev) => prev + 1);
        } else {
            // Time expired on final question -> auto submit
            handleFinalSubmit();
        }
    };

    const handleOptionSelect = (qId, optionIdx) => {
        const newSelections = { ...selectedAnswers, [qId]: optionIdx };
        setSelectedAnswers(newSelections);

        // Autosave answer to backend
        if (attemptData?._id) {
            saveQuizAnswer(attemptData._id, {
                questionId: qId,
                selectedOption: optionIdx
            }).catch((err) => console.error("Autosave failed:", err));
        }
    };

    const handleNext = () => {
        if (!attemptData) return;
        if (currentQuestionIdx < attemptData.questions.length - 1) {
            setCurrentQuestionIdx((prev) => prev + 1);
        } else {
            setSubmitModalOpen(true);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx((prev) => prev - 1);
        }
    };

    const handleFinalSubmit = async () => {
        if (!attemptData || submitting) return;
        setSubmitting(true);
        try {
            const answersArray = Object.keys(selectedAnswers).map((qId) => ({
                questionId: qId,
                selectedOption: selectedAnswers[qId]
            }));

            const res = await submitQuizAttempt(attemptData._id, { answers: answersArray });
            if (res.success) {
                navigate(`/quiz/result/${attemptData._id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit quiz.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-xl p-6 text-center space-y-4">
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-rose-600 dark:text-rose-400 font-medium">
                    {error}
                </div>
                <button
                    onClick={() => navigate("/quiz")}
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                >
                    Back to Quizzes
                </button>
            </div>
        );
    }

    if (!started && attemptData) {
        return (
            <div className="mx-auto max-w-2xl py-12 px-4 space-y-6">
                <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                        <ShieldCheck className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                            {attemptData.title}
                        </h2>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {attemptData.subject} • Std {attemptData.standard}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-left text-xs font-bold text-slate-600 dark:text-slate-300">
                        <div>
                            <span className="block text-slate-400 font-normal">Total Questions</span>
                            <span className="text-base font-black text-slate-900 dark:text-white">
                                {attemptData.questionCount} Questions
                            </span>
                        </div>

                        <div>
                            <span className="block text-slate-400 font-normal">Time Limit</span>
                            <span className="text-base font-black text-amber-500">
                                {attemptData.timeLimitPerQuestion > 0
                                    ? `${attemptData.timeLimitPerQuestion} seconds / question`
                                    : "No Time Limit"}
                            </span>
                        </div>
                    </div>

                    <ul className="text-xs text-left text-slate-500 dark:text-slate-400 space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            Select the best answer for each question before proceeding.
                        </li>
                        {attemptData.timeLimitPerQuestion > 0 && (
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                                When timer ends, the screen automatically moves to the next question.
                            </li>
                        )}
                    </ul>

                    <div className="flex justify-center pt-2">
                        <button
                            onClick={() => setStarted(true)}
                            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-base font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition transform"
                        >
                            <Play className="h-5 w-5 fill-current" />
                            Start Quiz Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = attemptData.questions[currentQuestionIdx];
    const totalQuestions = attemptData.questions.length;
    const isLastQuestion = currentQuestionIdx === totalQuestions - 1;
    const timeLimit = attemptData.timeLimitPerQuestion || 0;

    return (
        <div className="mx-auto max-w-3xl py-6 px-4 space-y-6">
            {/* Header with Progress & Timer */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                            {attemptData.title}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                            {attemptData.subject} • Question {currentQuestionIdx + 1} of {totalQuestions}
                        </p>
                    </div>

                    {/* Live Per-Question Timer Badge */}
                    {timeLimit > 0 && (
                        <div
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                                timeLeft <= 5
                                    ? "bg-rose-500 text-white animate-pulse"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                        >
                            <Clock className="h-4 w-4" />
                            <span>{timeLeft}s</span>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                        style={{
                            width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%`
                        }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-6">
                <div className="space-y-2">
                    <span className="inline-block rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Q{currentQuestionIdx + 1}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-relaxed">
                        {currentQ.questionText}
                    </h2>
                </div>

                {/* Option Choices */}
                <div className="grid gap-3.5">
                    {currentQ.options.map((optionText, optIdx) => {
                        const isSelected = selectedAnswers[currentQ.questionId] === optIdx;

                        return (
                            <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleOptionSelect(currentQ.questionId, optIdx)}
                                className={`flex items-center justify-between rounded-2xl p-4 text-left font-semibold transition border ${
                                    isSelected
                                        ? "border-indigo-600 bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 shadow-md shadow-indigo-600/10"
                                        : "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 hover:border-indigo-300"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                                            isSelected
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                                        }`}
                                    >
                                        {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="text-sm">{optionText}</span>
                                </div>

                                {isSelected && (
                                    <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentQuestionIdx === 0}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                            currentQuestionIdx === 0
                                ? "opacity-30 cursor-not-allowed text-slate-400"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-95 transition"
                    >
                        {isLastQuestion ? "Submit Quiz" : "Next Question"}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Final Submit Confirmation Modal */}
            <Modal
                isOpen={submitModalOpen}
                onClose={() => setSubmitModalOpen(false)}
                title="Submit Quiz Attempt"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Are you sure you want to submit your quiz? You have answered{" "}
                        <span className="font-bold text-indigo-600">
                            {Object.keys(selectedAnswers).length} / {totalQuestions}
                        </span>{" "}
                        questions.
                    </p>

                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            onClick={() => setSubmitModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Review Questions
                        </button>

                        <button
                            onClick={handleFinalSubmit}
                            disabled={submitting}
                            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
                        >
                            {submitting ? "Submitting..." : "Yes, Submit Now"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentQuizScreen;
