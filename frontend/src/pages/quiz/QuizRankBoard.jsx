import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Medal, Crown, ArrowLeft, Users, Clock, Award, Sparkles } from "lucide-react";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { getQuizLeaderboard, getQuizzes } from "../../services/quizService";
import { getStudentPhotoUrl } from "../../utils/photoUrl";

const QuizRankBoard = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [selectedQuizId, setSelectedQuizId] = useState(quizId || "");
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load available quizzes for dropdown selection
    useEffect(() => {
        const fetchQuizzesList = async () => {
            try {
                const res = await getQuizzes();
                if (res.success && res.quizzes) {
                    setAllQuizzes(res.quizzes);
                    if (!selectedQuizId && res.quizzes.length > 0) {
                        setSelectedQuizId(res.quizzes[0]._id);
                    }
                }
            } catch (err) {
                console.error("Failed to load quizzes for dropdown:", err);
            }
        };
        fetchQuizzesList();
    }, [quizId]);

    // Load leaderboard for selected Quiz ID
    useEffect(() => {
        if (!selectedQuizId) {
            setLoading(false);
            return;
        }

        const fetchLeaderboard = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getQuizLeaderboard(selectedQuizId);
                if (res.success) {
                    setLeaderboardData(res);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load leaderboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [selectedQuizId]);

    const { podium, rankings, quizTitle, subject, standard, totalStudentsAttempted } = leaderboardData || {};

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <PageHeader
                title="Olympic Rank & Leaderboard Board"
                subtitle="Top performers & student ranking board"
            >
                <button
                    onClick={() => navigate("/quiz")}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Quizzes
                </button>
            </PageHeader>

            {/* Quiz Selector Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/20">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate font-extrabold text-slate-900 dark:text-white text-base">
                            {quizTitle || "Select Quiz Leaderboard"}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500">
                            {subject ? `${subject} • Std ${standard} • ` : ""}{totalStudentsAttempted || 0} Students Attempted
                        </p>
                    </div>
                </div>

                <div className="w-full sm:w-72">
                    <select
                        value={selectedQuizId}
                        onChange={(e) => {
                            setSelectedQuizId(e.target.value);
                            navigate(`/quiz/rank/${e.target.value}`);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 font-semibold"
                    >
                        <option value="" disabled>Choose a Quiz...</option>
                        {allQuizzes.map((q) => (
                            <option key={q._id} value={q._id}>
                                Std {q.standard} - {q.title} ({q.subject})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader />
                </div>
            ) : error ? (
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center text-rose-600 dark:text-rose-400 font-medium">
                    {error}
                </div>
            ) : !leaderboardData || totalStudentsAttempted === 0 ? (
                <div className="rounded-3xl bg-white p-12 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-3">
                    <Trophy className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700" />
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        No Attempt Ranks Recorded Yet
                    </h4>
                    <p className="text-xs text-slate-500">
                        Be the first student to attempt this quiz and claim 1st Rank!
                    </p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Olympic Medal Podium Distribution Visual */}
                    <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-8 shadow-2xl border border-indigo-900/40 text-white space-y-8">
                        <div className="text-center space-y-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30">
                                <Sparkles className="h-3.5 w-3.5" />
                                OLYMPIC MEDAL DISTRIBUTION BOARD
                            </span>
                            <h3 className="text-2xl font-black tracking-wide text-white">
                                Top 3 Medalists
                            </h3>
                        </div>

                        {/* Podium Container - Side by side on both mobile & desktop */}
                        <div className="flex flex-row items-end justify-center gap-2 sm:gap-6 pt-6 pb-2">
                            {/* 2nd Place - SILVER (Left) */}
                            <div className="w-1/3 flex flex-col items-center order-1">
                                {podium?.second ? (
                                    <div className="flex flex-col items-center space-y-1 sm:space-y-3 mb-2 text-center">
                                        <div className="relative">
                                            <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-full border-2 sm:border-4 border-slate-300 overflow-hidden bg-slate-800 shadow-xl">
                                                {podium.second.photo ? (
                                                    <img src={getStudentPhotoUrl(podium.second.photo)} alt={podium.second.fullName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center font-black text-sm sm:text-xl text-slate-300">
                                                        {podium.second.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="absolute -bottom-1.5 -right-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-300 text-slate-900 shadow-lg font-black text-[10px] sm:text-xs">
                                                🥈
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-black text-[11px] sm:text-sm text-slate-100 truncate max-w-[85px] sm:max-w-[140px]">
                                                {podium.second.fullName}
                                            </h4>
                                            <p className="text-[10px] sm:text-xs font-bold text-slate-400">
                                                Score: {podium.second.score} ({podium.second.percentage}%)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[10px] sm:text-xs text-slate-500 font-bold mb-2">No 2nd Rank</div>
                                )}
                                <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-2xl flex items-center justify-center shadow-lg border-t-2 border-slate-300">
                                    <span className="text-xl sm:text-3xl font-black text-white/90">2ND</span>
                                </div>
                            </div>

                            {/* 1st Place - GOLD (Center - Highest) */}
                            <div className="w-1/3 flex flex-col items-center order-2">
                                {podium?.first ? (
                                    <div className="flex flex-col items-center space-y-1 sm:space-y-3 mb-2 text-center">
                                        <div className="relative">
                                            <Crown className="h-5 w-5 sm:h-8 sm:w-8 text-amber-400 mx-auto animate-bounce mb-0.5" />
                                            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full border-2 sm:border-4 border-amber-400 overflow-hidden bg-slate-800 shadow-2xl shadow-amber-500/30">
                                                {podium.first.photo ? (
                                                    <img src={getStudentPhotoUrl(podium.first.photo)} alt={podium.first.fullName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center font-black text-lg sm:text-2xl text-amber-400">
                                                        {podium.first.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="absolute -bottom-1.5 -right-1 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xl font-black text-[11px] sm:text-sm">
                                                🥇
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-black text-xs sm:text-base text-amber-300 truncate max-w-[95px] sm:max-w-[160px]">
                                                {podium.first.fullName}
                                            </h4>
                                            <p className="text-[10px] sm:text-xs font-black text-amber-400">
                                                Score: {podium.first.score} ({podium.first.percentage}%)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[10px] sm:text-xs text-slate-500 font-bold mb-2">No 1st Rank</div>
                                )}
                                <div className="w-full h-36 sm:h-44 bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-400 rounded-t-2xl flex items-center justify-center shadow-2xl border-t-2 border-yellow-200">
                                    <span className="text-2xl sm:text-4xl font-black text-slate-950">1ST</span>
                                </div>
                            </div>

                            {/* 3rd Place - BRONZE (Right) */}
                            <div className="w-1/3 flex flex-col items-center order-3">
                                {podium?.third ? (
                                    <div className="flex flex-col items-center space-y-1 sm:space-y-3 mb-2 text-center">
                                        <div className="relative">
                                            <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-full border-2 sm:border-4 border-amber-700 overflow-hidden bg-slate-800 shadow-xl">
                                                {podium.third.photo ? (
                                                    <img src={getStudentPhotoUrl(podium.third.photo)} alt={podium.third.fullName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center font-black text-sm sm:text-xl text-amber-700">
                                                        {podium.third.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="absolute -bottom-1.5 -right-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-700 text-white shadow-lg font-black text-[10px] sm:text-xs">
                                                🥉
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-black text-[11px] sm:text-sm text-slate-100 truncate max-w-[85px] sm:max-w-[140px]">
                                                {podium.third.fullName}
                                            </h4>
                                            <p className="text-[10px] sm:text-xs font-bold text-amber-600">
                                                Score: {podium.third.score} ({podium.third.percentage}%)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[10px] sm:text-xs text-slate-500 font-bold mb-2">No 3rd Rank</div>
                                )}
                                <div className="w-full h-16 sm:h-24 bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-2xl flex items-center justify-center shadow-lg border-t-2 border-amber-600">
                                    <span className="text-lg sm:text-2xl font-black text-amber-100">3RD</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remaining Student Ranks Table */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                            All Remaining Student Ranks
                        </h3>

                        {rankings && rankings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400 dark:border-slate-800">
                                            <th className="pb-3 px-3">Rank</th>
                                            <th className="pb-3 px-3">Student</th>
                                            <th className="pb-3 px-3">GR Number</th>
                                            <th className="pb-3 px-3">Score</th>
                                            <th className="pb-3 px-3">Percentage</th>
                                            <th className="pb-3 px-3">Time Taken</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {rankings.map((st) => (
                                            <tr key={st.rank} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                                <td className="py-3.5 px-3">
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                        #{st.rank}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-indigo-500/10">
                                                            {st.photo ? (
                                                                <img src={getStudentPhotoUrl(st.photo)} alt={st.fullName} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center font-black text-indigo-600 text-sm">
                                                                    {st.fullName.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            {st.fullName}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-3 font-semibold text-slate-500">
                                                    {st.grNumber || "N/A"}
                                                </td>

                                                <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">
                                                    {st.score} / {st.totalQuestions}
                                                </td>

                                                <td className="py-3.5 px-3 font-black text-indigo-600 dark:text-indigo-400">
                                                    {st.percentage}%
                                                </td>

                                                <td className="py-3.5 px-3 font-semibold text-slate-500">
                                                    {st.timeTakenSeconds ? `${st.timeTakenSeconds}s` : "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 py-4">
                                No additional student ranks beyond Top 3.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizRankBoard;
