import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trophy, Loader2, Languages } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getAllResultsForStudent } from "../../services/resultService";

const GRADE_STYLE = {
    "A+": "bg-green-100 text-green-700",
    A: "bg-green-100 text-green-600",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-blue-100 text-blue-600",
    C: "bg-yellow-100 text-yellow-700",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700"
};

const MyResults = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const text = {
        title: isGujarati ? "મારા પરિણામો" : "My Results",
        subtitle: isGujarati
            ? "તમારી બધી પરીક્ષાઓના પરિણામો અહીં જુઓ."
            : "View results for all the exams you've taken.",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        loading: isGujarati ? "પરિણામો લોડ થઈ રહ્યા છે..." : "Loading results...",
        noResultsTitle: isGujarati ? "હજુ સુધી કોઈ પરિણામ નથી" : "No Results Yet",
        noResultsSub: isGujarati
            ? "તમારી પરીક્ષાઓના પરિણામો જાહેર થાય પછી અહીં દેખાશે."
            : "Your exam results will appear here once they're published.",
        percentage: isGujarati ? "ટકાવારી" : "Percentage",
        grade: isGujarati ? "ગ્રેડ" : "Grade",
        rank: isGujarati ? "ક્રમાંક" : "Rank",
        pass: isGujarati ? "પાસ" : "Pass",
        fail: isGujarati ? "ફેલ" : "Fail",
        viewReportCard: isGujarati ? "રિપોર્ટ કાર્ડ જુઓ" : "View Report Card"
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    useEffect(() => {
        loadResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadResults = async () => {
        try {
            setLoading(true);

            const response = await getAllResultsForStudent(user?.id);

            setResults(response.results || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                <button
                    onClick={toggleLanguage}
                    className="flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#5B2EFF] hover:text-[#5B2EFF]"
                >
                    <Languages size={16} />
                    {text.switchLang}
                </button>
            </div>

            {/* ============================== Loading ============================== */}

            {loading && (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
                    <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                    <p className="font-medium text-slate-500">{text.loading}</p>
                </div>
            )}

            {/* ============================== Empty State ============================== */}

            {!loading && results.length === 0 && (
                <div className="rounded-3xl bg-white p-10 text-center shadow sm:p-16">
                    <Trophy size={56} className="mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold text-gray-600">
                        {text.noResultsTitle}
                    </h2>
                    <p className="mt-2 text-gray-400">{text.noResultsSub}</p>
                </div>
            )}

            {/* ============================== Results List ============================== */}

            {!loading && results.length > 0 && (
                <div className="space-y-4">
                    {results.map((result) => (
                        <div
                            key={result._id}
                            onClick={() =>
                                navigate(
                                    "/exams/report/" +
                                        user?.id +
                                        "/" +
                                        (result.examId?._id || result.examId)
                                )
                            }
                            className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
                                        <FileText size={22} className="text-indigo-600" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-bold text-gray-800">
                                            {result.examId?.examName}
                                        </h3>
                                        <p className="mt-1 truncate text-sm text-gray-500">
                                            {result.examId?.examType} ·{" "}
                                            {formatDate(result.examId?.startDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:gap-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400">
                                            {text.percentage}
                                        </p>
                                        <p
                                            className={
                                                "text-lg font-bold " +
                                                (result.percentage >= 75
                                                    ? "text-green-600"
                                                    : result.percentage >= 50
                                                    ? "text-yellow-600"
                                                    : "text-red-600")
                                            }
                                        >
                                            {result.percentage}%
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            "rounded-full px-3 py-1 text-sm font-bold " +
                                            (GRADE_STYLE[result.grade] ||
                                                "bg-gray-100 text-gray-600")
                                        }
                                    >
                                        {result.grade}
                                    </span>

                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                                        {text.rank} #{result.rank}
                                    </span>

                                    {result.isPassed ? (
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                            {text.pass}
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                            {text.fail}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 border-t pt-3 text-right">
                                <span className="text-sm font-semibold text-[#5B2EFF]">
                                    {text.viewReportCard} →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyResults;