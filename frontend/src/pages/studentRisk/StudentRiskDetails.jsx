import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CalendarCheck2,
    ChevronRight,
    Loader2,
    RefreshCw,
    ShieldCheck,
    TrendingDown,
    TrendingUp
} from "lucide-react";

import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getStudentRisk } from "../../services/studentRiskService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";

const StudentRiskDetails = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const isGujarati = language === "gu";

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [riskData, setRiskData] = useState(null);
    const [error, setError] = useState("");

    const fetchRiskData = async () => {
        try {
            setRefreshing(true);
            const response = await getStudentRisk(studentId);
            setRiskData(response.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load risk data");
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiskData();
    }, [studentId]);

    const getRiskBadgeVariant = (level) => {
        if (level === "Low Risk") return "success";
        if (level === "Medium Risk") return "warning";
        if (level === "High Risk") return "danger";
        if (level === "Critical Risk") return "danger";
        return "default";
    };

    const getRiskColor = (score) => {
        if (score >= 75) return "text-rose-600 bg-rose-50";
        if (score >= 50) return "text-orange-600 bg-orange-50";
        if (score >= 25) return "text-amber-600 bg-amber-50";
        return "text-emerald-600 bg-emerald-50";
    };

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <Loader text={isGujarati ? "રિસ્ક ડેટા લોડ થઈ રહ્યું છે..." : "Loading risk data..."} />
            </div>
        );
    }

    if (!riskData) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        {isGujarati ? "રિસ્ક ડેટા ઉપલબ્ધ નથી" : "Risk data not available"}
                    </h2>
                    <p className="mt-2 text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    const { student, risk, factors, reasons, weakSubjects, recommendations, dataAvailability } = riskData;

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title={isGujarati ? "વિદ્યાર્થી જોખમ વિગત" : "Student Risk Details"}
                subtitle={`${student.name} (${student.grNumber}) - Std ${student.standard} - ${student.division}`}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {isGujarati ? "પાછા" : "Back"}
                </button>
            </PageHeader>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                    {error}
                </div>
            )}

            {risk.insufficientData && (
                <Card className="p-5 border-amber-200 bg-amber-50">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-amber-900">Insufficient Data</h3>
                            <p className="mt-1 text-sm text-amber-700">
                                Not enough data available to calculate a complete risk assessment.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {Object.entries(dataAvailability).map(([key, available]) => (
                                    <Badge key={key} variant={available ? "success" : "default"}>
                                        {key}: {available ? "Available" : "Missing"}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Risk Score</p>
                                <p className={`mt-1 text-3xl font-extrabold ${getRiskColor(risk.score)} rounded-lg px-2 py-1`}>
                                    {risk.score}/100
                                </p>
                            </div>
                            <Badge variant={getRiskBadgeVariant(risk.level)} className="text-sm">
                                {risk.level}
                            </Badge>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <CalendarCheck2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Attendance</p>
                                <p className="text-xl font-extrabold text-slate-900">
                                    {factors.attendance.available ? `${factors.attendance.percentage}%` : "N/A"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Academic</p>
                                <p className="text-xl font-extrabold text-slate-900">
                                    {factors.academic.available ? `${factors.academic.percentage}%` : "N/A"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Trend</p>
                                <p className="text-xl font-extrabold text-slate-900">
                                    {factors.trend.available ? `${factors.trend.change > 0 ? '+' : ''}${factors.trend.change}%` : "N/A"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {reasons.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    <Card className="p-5 sm:p-7">
                        <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                            {isGujarati ? "જોખમના કારણો" : "Risk Reasons"}
                        </h3>
                        <div className="space-y-3">
                            {reasons.map((reason, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-3 rounded-xl p-4 ${
                                        reason.severity === "high"
                                            ? "bg-rose-50 border border-rose-100"
                                            : reason.severity === "medium"
                                            ? "bg-amber-50 border border-amber-100"
                                            : "bg-slate-50 border border-slate-100"
                                    }`}
                                >
                                    <AlertTriangle
                                        className={`h-5 w-5 shrink-0 mt-0.5 ${
                                            reason.severity === "high"
                                                ? "text-rose-600"
                                                : reason.severity === "medium"
                                                ? "text-amber-600"
                                                : "text-slate-500"
                                        }`}
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">{reason.title}</p>
                                        <p className="mt-1 text-sm text-slate-600">{reason.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {weakSubjects.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                >
                    <Card className="p-5 sm:p-7">
                        <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                            {isGujarati ? "કમજyor વિષયો" : "Weak Subjects"}
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {weakSubjects.map((subject, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-xl p-4 border ${
                                        subject.isPassed
                                            ? "bg-amber-50 border-amber-100"
                                            : "bg-rose-50 border-rose-100"
                                    }`}
                                >
                                    <p className="font-bold text-slate-900">{subject.subject}</p>
                                    <p className={`mt-1 text-2xl font-extrabold ${subject.isPassed ? "text-amber-600" : "text-rose-600"}`}>
                                        {subject.percentage}%
                                    </p>
                                    <Badge variant={subject.isPassed ? "warning" : "danger"} className="mt-2">
                                        {subject.isPassed ? "Passed" : "Failed"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                >
                    <Card className="p-5 sm:p-7">
                        <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                            {isGujarati ? "શિફારિશો" : "Recommendations"}
                        </h3>
                        <ul className="space-y-2">
                            {recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <ChevronRight className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default StudentRiskDetails;
