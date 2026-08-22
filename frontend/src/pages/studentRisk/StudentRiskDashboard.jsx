import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    BookOpen,
    CalendarCheck2,
    Loader2,
    RefreshCw,
    Search,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
    Users,
    Minus
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getClassRisk, getRiskDashboard } from "../../services/studentRiskService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";

const StudentRiskDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const isGujarati = language === "gu";

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState("class");
    const [selectedStandard, setSelectedStandard] = useState(10);
    const [selectedDivision, setSelectedDivision] = useState("A");
    const [searchQuery, setSearchQuery] = useState("");
    const [riskData, setRiskData] = useState(null);
    const [error, setError] = useState("");

    const standards = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const divisions = ["A", "B", "C"];

    const fetchClassRisk = async () => {
        if (!selectedStandard || !selectedDivision) return;

        try {
            setRefreshing(true);
            const response = await getClassRisk(selectedStandard, selectedDivision);
            setRiskData(response.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load risk data");
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    const fetchDashboard = async () => {
        try {
            setRefreshing(true);
            const response = await getRiskDashboard();
            setRiskData(response.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load risk dashboard");
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === "class" && selectedStandard && selectedDivision) {
            fetchClassRisk();
        } else if (viewMode === "dashboard") {
            fetchDashboard();
        }
    }, [viewMode, selectedStandard, selectedDivision]);

    const handleRefresh = () => {
        if (viewMode === "class") {
            fetchClassRisk();
        } else {
            fetchDashboard();
        }
    };

    const getRiskBadgeVariant = (level) => {
        if (level === "Low Risk") return "success";
        if (level === "Medium Risk") return "warning";
        if (level === "High Risk") return "danger";
        if (level === "Critical Risk") return "danger";
        return "default";
    };

    const columns = [
        {
            key: "fullName",
            label: isGujarati ? "વિદ્યાર્થી" : "Student",
            render: (value, row) => (
                <div>
                    <p className="font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500">{row.grNumber}</p>
                </div>
            )
        },
        {
            key: "riskLevel",
            label: isGujarati ? "જોખમ સ્તર" : "Risk Level",
            render: (value) => (
                <Badge variant={getRiskBadgeVariant(value)}>
                    {value}
                </Badge>
            )
        },
        {
            key: "riskScore",
            label: isGujarati ? "સ્કોર" : "Score",
            render: (value) => (
                <span className={`font-bold ${value >= 75 ? "text-rose-600" : value >= 50 ? "text-orange-600" : value >= 25 ? "text-amber-600" : "text-emerald-600"}`}>
                    {value}/100
                </span>
            )
        },
        {
            key: "attendancePercentage",
            label: isGujarati ? "હાજરી" : "Attendance",
            render: (value) => value !== null ? `${value}%` : "—"
        },
        {
            key: "academicPercentage",
            label: isGujarati ? "શૈક્ષણિક" : "Academic",
            render: (value) => value !== null ? `${value}%` : "—"
        },
        {
            key: "trend",
            label: isGujarati ? "ટ્રેન્ડ" : "Trend",
            render: (value) => {
                if (value === "N/A") return <span className="text-slate-400">—</span>;
                if (value.includes("declining")) return <span className="flex items-center gap-1 text-rose-600 font-semibold"><TrendingDown size={14} /> {value}</span>;
                if (value.includes("improving")) return <span className="flex items-center gap-1 text-emerald-600 font-semibold"><TrendingUp size={14} /> {value}</span>;
                return <span className="flex items-center gap-1 text-amber-600 font-semibold"><Minus size={14} /> {value}</span>;
            }
        },
        {
            key: "topReason",
            label: isGujarati ? "મુખ્ય કારણ" : "Top Reason",
            render: (value) => (
                <span className="max-w-xs truncate text-slate-600">{value}</span>
            )
        }
    ];

    const summaryCards = useMemo(() => {
        if (!riskData?.summary) return null;
        const s = riskData.summary;
        return [
            { label: isGujarati ? "કુલ વિદ્યાર્થી" : "Total Students", value: s.totalStudents, icon: Users, color: "indigo", bg: "bg-indigo-50", text: "text-indigo-600" },
            { label: "Low Risk", value: s.lowRisk, icon: ShieldCheck, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
            { label: "Medium Risk", value: s.mediumRisk, icon: AlertTriangle, color: "amber", bg: "bg-amber-50", text: "text-amber-600" },
            { label: "High Risk", value: s.highRisk + s.criticalRisk, icon: AlertTriangle, color: "rose", bg: "bg-rose-50", text: "text-rose-600" }
        ];
    }, [riskData, isGujarati]);

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <Loader text={isGujarati ? "રિસ્ક ડેટા લોડ થઈ રહ્યું છે..." : "Loading risk data..."} />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title={isGujarati ? "વિદ્યાર્થી જોખમ અને પ્રારંભિક ચેતાવણી" : "Student Risk & Early Warning"}
                subtitle={isGujarati ? "શૈક્ષણિક અને હાજરી વિશ્લેષણ દ્વારા જોખમવાળા વિદ્યાર્થીઓની ઓળખ" : "Identify at-risk students through academic and attendance analytics"}
            >
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                    {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {isGujarati ? "રિફ્રેશ" : "Refresh"}
                </button>
            </PageHeader>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        {isGujarati ? "દૃશ્ય પદ્ધતિ" : "View Mode"}
                    </label>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                    >
                        <option value="class">{isGujarati ? "વર્ગ દૃશ્ય" : "Class View"}</option>
                        <option value="dashboard">{isGujarati ? "ડેશબોર્ડ" : "Dashboard"}</option>
                    </select>
                </div>

                {viewMode === "class" && (
                    <>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                {isGujarati ? "પ્રમાણભૂત" : "Standard"}
                            </label>
                            <select
                                value={selectedStandard}
                                onChange={(e) => setSelectedStandard(Number(e.target.value))}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                            >
                                {standards.map((std) => (
                                    <option key={std} value={std}>{std}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                {isGujarati ? "વિભાગ" : "Division"}
                            </label>
                            <select
                                value={selectedDivision}
                                onChange={(e) => setSelectedDivision(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                            >
                                {divisions.map((div) => (
                                    <option key={div} value={div}>{div}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {viewMode === "class" && (
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            {isGujarati ? "શોધો" : "Search"}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isGujarati ? "વિદ્યાર્થી શોધો..." : "Search students..."}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {summaryCards && viewMode === "class" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((card, idx) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                            <Card hover className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                        <p className="mt-1 text-2xl font-extrabold text-slate-900">{card.value}</p>
                                    </div>
                                    <div className={`rounded-xl p-3 ${card.bg} ${card.text}`}>
                                        <card.icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {viewMode === "class" && riskData?.students && (
                <DataTable
                    title={isGujarati ? "વિદ્યાર્થી જોખમ સૂચિ" : "Student Risk List"}
                    columns={columns}
                    data={riskData.students.filter((s) =>
                        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.grNumber.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    onRowClick={(row) => navigate(`/student-risk/${row.studentId}`)}
                />
            )}

            {viewMode === "dashboard" && Array.isArray(riskData) && (
                <DataTable
                    title={isGujarati ? "વર્ગ જોખમ સારાંશ" : "Class Risk Summary"}
                    columns={[
                        { key: "standard", label: "Standard" },
                        { key: "division", label: "Division" },
                        { key: "totalStudents", label: isGujarati ? "કુલ વિદ્યાર્થી" : "Total Students" },
                        { key: "lowRisk", label: "Low Risk" },
                        { key: "mediumRisk", label: "Medium Risk" },
                        { key: "highRisk", label: "High Risk" },
                        { key: "criticalRisk", label: "Critical Risk" },
                        { key: "insufficientData", label: "Insufficient Data" }
                    ]}
                    data={riskData}
                />
            )}
        </div>
    );
};

export default StudentRiskDashboard;
