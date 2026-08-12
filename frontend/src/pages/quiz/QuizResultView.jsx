import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, CheckCircle2, XCircle, Clock, ArrowLeft, Award, HelpCircle } from "lucide-react";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { getAttemptById } from "../../services/quizService";

const QuizResultView = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAttempt = async () => {
            setLoading(true);
            try {
                const res = await getAttemptById(attemptId);
                if (res.success) {
                    setAttempt(res.attempt);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load attempt details.");
            } finally {
                setLoading(false);
            }
        };

        if (attemptId) fetchAttempt();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !attempt) {
        return (
            <div className="mx-auto max-w-xl p-6 text-center space-y-4">
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-rose-600 dark:text-rose-400 font-medium">
                    {error || "Attempt not found."}
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

    const isPassed = attempt.percentage >= 50;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <PageHeader
                title="Quiz Result Summary"
                subtitle={`${attempt.quizTitle} • ${attempt.subject}`}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/quiz")}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quizzes
                    </button>

                    <button
                        onClick={() => navigate(`/quiz/rank/${attempt.quizId}`)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition"
                    >
                        <Trophy className="h-4 w-4" />
                        View Leaderboard
                    </button>
                </div>
            </PageHeader>

            {/* Scorecard Banner */}
            <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30">
                    <Award className="h-10 w-10" />
                </div>

                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                        {attempt.percentage}%
                    </h2>
                    <p className={`text-sm font-extrabold mt-1 ${isPassed ? "text-emerald-500" : "text-rose-500"}`}>
                        {isPassed ? "Great Job! Passed 🎉" : "Needs Improvement"}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <div>
                        <span className="block text-xs text-slate-400 font-medium">Score</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                            {attempt.score} / {attempt.totalQuestions}
                        </span>
                    </div>

                    <div>
                        <span className="block text-xs text-slate-400 font-medium">Correct</span>
                        <span className="text-lg font-black text-emerald-500">
                            {attempt.score}
                        </span>
                    </div>

                    <div>
                        <span className="block text-xs text-slate-400 font-medium">Wrong / Skipped</span>
                        <span className="text-lg font-black text-rose-500">
                            {attempt.totalQuestions - attempt.score}
                        </span>
                    </div>

                    <div>
                        <span className="block text-xs text-slate-400 font-medium">Time Taken</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            {attempt.timeTakenSeconds ? `${attempt.timeTakenSeconds}s` : "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Answer Review Section */}
            {attempt.showAnswerReview && attempt.answers && attempt.answers.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Question & Answer Review
                    </h3>

                    {attempt.answers.map((ans, idx) => {
                        const isCorrect = ans.isCorrect;
                        const isUnanswered = ans.selectedOption === -1;

                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl p-6 bg-white dark:bg-slate-900 border shadow-sm space-y-4 ${
                                    isCorrect
                                        ? "border-emerald-500/30"
                                        : "border-rose-500/30"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-slate-400">
                                            Question #{idx + 1}
                                        </span>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                            {ans.questionText}
                                        </h4>
                                    </div>

                                    <span
                                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
                                            isCorrect
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                        }`}
                                    >
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-3.5 w-3.5" /> {isUnanswered ? "Skipped" : "Incorrect"}
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    {ans.options.map((optText, optIndex) => {
                                        const isCorrectOpt = optIndex === ans.correctAnswer;
                                        const isUserSelected = optIndex === ans.selectedOption;

                                        let style = "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 text-slate-700 dark:text-slate-300";

                                        if (isCorrectOpt) {
                                            style = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                                        } else if (isUserSelected && !isCorrectOpt) {
                                            style = "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                                        }

                                        return (
                                            <div
                                                key={optIndex}
                                                className={`flex items-center justify-between rounded-xl border p-3 text-xs ${style}`}
                                            >
                                                <span>{optText}</span>
                                                {isCorrectOpt && (
                                                    <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-md">
                                                        Correct Answer
                                                    </span>
                                                )}
                                                {isUserSelected && !isCorrectOpt && (
                                                    <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-md">
                                                        Your Choice
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 text-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                    Answer review for this quiz is turned off by your teacher/admin.
                </div>
            )}
        </div>
    );
};

export default QuizResultView;
