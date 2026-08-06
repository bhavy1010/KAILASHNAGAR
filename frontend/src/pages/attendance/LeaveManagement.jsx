import { useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    Plane,
    Loader2,
    CheckCircle2,
    XCircle,
    Plus,
    X,
    MessageSquare,
    Paperclip,
    FileText,
    Download
} from "lucide-react";

import { createLeave, getLeaves, updateLeaveStatus } from "../../services/leaveService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const EMPTY_APPLY_FORM = {
    leaveType: "Sick Leave",
    fromDate: "",
    toDate: "",
    reason: ""
};

const MAX_ATTACHMENT_MB = 10;

const STATUS_STYLE = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700"
};

const LeaveManagement = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyForm, setApplyForm] = useState(EMPTY_APPLY_FORM);
    const [selectedFile, setSelectedFile] = useState(null);
    const [applySubmitting, setApplySubmitting] = useState(false);
    const [applyError, setApplyError] = useState("");

    const [remarkTarget, setRemarkTarget] = useState(null); // { id, status }
    const [remarkText, setRemarkText] = useState("");

    const text = {
        title:
            user?.role === "student"
                ? isGujarati
                    ? "મારી રજાઓ"
                    : "My Leaves"
                : isGujarati
                ? "રજા વ્યવસ્થાપન"
                : "Leave Management",
        subtitle:
            user?.role === "student"
                ? isGujarati
                    ? "રજા માટે અરજી કરો અને તમારી અરજીઓની સ્થિતિ જુઓ."
                    : "Apply for leave and track the status of your requests."
                : isGujarati
                ? "વિદ્યાર્થીઓની રજાની અરજીઓ તપાસો અને નિર્ણય લો."
                : "Review and action student leave requests.",
        pending: isGujarati ? "બાકી" : "Pending",
        approved: isGujarati ? "મંજૂર" : "Approved",
        rejected: isGujarati ? "નકારેલ" : "Rejected",
        awaitingAction: isGujarati ? "નિર્ણયની રાહમાં" : "Awaiting action",
        totalApproved: isGujarati ? "કુલ મંજૂર" : "Total approved",
        totalRejected: isGujarati ? "કુલ નકારેલ" : "Total rejected",
        searchPlaceholder: isGujarati
            ? "વિદ્યાર્થીના નામ અથવા GR નંબરથી શોધો..."
            : "Search by student name or GR number...",
        allStatus: isGujarati ? "બધી સ્થિતિ" : "All Status",
        reset: isGujarati ? "રીસેટ" : "Reset",
        student: isGujarati ? "વિદ્યાર્થી" : "Student",
        class: isGujarati ? "વર્ગ" : "Class",
        reason: isGujarati ? "કારણ" : "Reason",
        from: isGujarati ? "થી" : "From",
        to: isGujarati ? "સુધી" : "To",
        days: isGujarati ? "દિવસ" : "Days",
        day: isGujarati ? "દિવસ" : "Day",
        status: isGujarati ? "સ્થિતિ" : "Status",
        actions: isGujarati ? "કાર્ય" : "Actions",
        approve: isGujarati ? "મંજૂર કરો" : "Approve",
        reject: isGujarati ? "નકારો" : "Reject",
        noRequests: isGujarati
            ? "રજાની કોઈ અરજીઓ નથી"
            : "No Leave Requests",
        noRequestsText: isGujarati
            ? "કોઈ રજાની અરજી મળી નથી."
            : "No leave requests found.",
        loading: isGujarati ? "રજાની અરજીઓ લોડ થઈ રહી છે..." : "Loading leave requests...",
        confirmApprove: isGujarati
            ? "શું તમે આ રજાની અરજી મંજૂર કરવા માંગો છો?"
            : "Approve this leave request?",
        confirmReject: isGujarati
            ? "શું તમે આ રજાની અરજી નકારવા માંગો છો?"
            : "Reject this leave request?",
        unableUpdate: isGujarati
            ? "રજાની સ્થિતિ અપડેટ થઈ શકી નથી."
            : "Unable to update leave status",
        applyLeave: isGujarati ? "રજા માટે અરજી કરો" : "Apply for Leave",
        applyLeaveTitle: isGujarati ? "રજા માટે અરજી કરો" : "Apply for Leave",
        leaveType: isGujarati ? "રજાનો પ્રકાર" : "Leave Type",
        submit: isGujarati ? "સબમિટ કરો" : "Submit Request",
        submitting: isGujarati ? "સબમિટ થઈ રહ્યું છે..." : "Submitting...",
        cancel: isGujarati ? "રદ કરો" : "Cancel",
        reasonPlaceholder: isGujarati
            ? "રજા માટેનું કારણ લખો..."
            : "Describe the reason for your leave...",
        applySuccess: isGujarati
            ? "તમારી રજાની અરજી સફળતાપૂર્વક સબમિટ થઈ છે."
            : "Your leave request has been submitted.",
        applyFailed: isGujarati
            ? "રજાની અરજી સબમિટ થઈ શકી નથી."
            : "Unable to submit leave request.",
        fillAllFields: isGujarati
            ? "કૃપા કરીને બધી વિગતો ભરો."
            : "Please fill in all the fields.",
        invalidDateRange: isGujarati
            ? "'થી' તારીખ 'સુધી' તારીખ પછી ન હોવી જોઈએ."
            : "From date cannot be after to date.",
        attachment: isGujarati ? "જોડાણ (વૈકલ્પિક)" : "Attachment (optional)",
        attachmentHint: isGujarati
            ? "તબીબી પ્રમાણપત્ર અથવા સહાયક દસ્તાવેજ અપલોડ કરો. JPG, PNG અથવા PDF, મહત્તમ 10MB."
            : "Upload a medical certificate or supporting document. JPG, PNG or PDF, max 10MB.",
        chooseFile: isGujarati ? "ફાઇલ પસંદ કરો" : "Choose File",
        fileTooLarge: isGujarati
            ? "ફાઇલનું કદ 10MB કરતાં ઓછું હોવું જોઈએ."
            : "File size must be under 10MB.",
        viewAttachment: isGujarati ? "જોડાણ જુઓ" : "View attachment",
        noLeavesYet: isGujarati
            ? "તમે હજી સુધી કોઈ રજા માટે અરજી કરી નથી."
            : "You haven't applied for any leave yet.",
        applyNow: isGujarati ? "હમણાં અરજી કરો" : "Apply Now",
        remark: isGujarati ? "ટિપ્પણી" : "Remark",
        remarkOptional: isGujarati
            ? "ટિપ્પણી (વૈકલ્પિક)"
            : "Remark (optional)",
        remarkPlaceholder: isGujarati
            ? "વિદ્યાર્થી માટે નોંધ ઉમેરો..."
            : "Add a note for the student...",
        respondedBy: isGujarati ? "દ્વારા જવાબ અપાયો" : "Responded by",
        confirm: isGujarati ? "પુષ્ટિ કરો" : "Confirm"
    };

    const statusLabel = {
        Pending: text.pending,
        Approved: text.approved,
        Rejected: text.rejected
    };

    useEffect(() => {
        loadLeaves();
    }, [statusFilter]);

    const loadLeaves = async () => {
        try {
            setLoading(true);

            const response = await getLeaves(
                statusFilter ? { status: statusFilter } : {}
            );

            setLeaves(response?.leaves || []);
        } catch (error) {
            console.log(error);
            setLeaves([]);
        } finally {
            setLoading(false);
        }
    };

    const openRemarkModal = (id, status) => {
        setRemarkTarget({ id, status });
        setRemarkText("");
    };

    const closeRemarkModal = () => {
        setRemarkTarget(null);
        setRemarkText("");
    };

    const handleStatusUpdate = async () => {
        if (!remarkTarget) return;

        const { id, status } = remarkTarget;

        try {
            setActionLoading(id);

            await updateLeaveStatus(id, status, remarkText.trim());
            await loadLeaves();
            closeRemarkModal();
        } catch (error) {
            alert(
                error.response?.data?.message || text.unableUpdate
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleApplyChange = (field, value) => {
        setApplyForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
            setApplyError(text.fileTooLarge);
            event.target.value = "";
            setSelectedFile(null);
            return;
        }

        setApplyError("");
        setSelectedFile(file);
    };

    const openApplyModal = () => {
        setApplyForm(EMPTY_APPLY_FORM);
        setSelectedFile(null);
        setApplyError("");
        setShowApplyModal(true);
    };

    const closeApplyModal = () => {
        setShowApplyModal(false);
        setSelectedFile(null);
        setApplyError("");
    };

    const handleApplySubmit = async (event) => {
        event.preventDefault();
        setApplyError("");

        const { leaveType, fromDate, toDate, reason } = applyForm;

        if (!leaveType || !fromDate || !toDate || !reason.trim()) {
            setApplyError(text.fillAllFields);
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            setApplyError(text.invalidDateRange);
            return;
        }

        try {
            setApplySubmitting(true);

            const payload = new FormData();
            payload.append("leaveType", leaveType);
            payload.append("fromDate", fromDate);
            payload.append("toDate", toDate);
            payload.append("reason", reason.trim());

            if (selectedFile) {
                payload.append("attachment", selectedFile);
            }

            await createLeave(payload);

            setShowApplyModal(false);
            setApplyForm(EMPTY_APPLY_FORM);
            setSelectedFile(null);
            await loadLeaves();
        } catch (error) {
            setApplyError(
                error.response?.data?.message || text.applyFailed
            );
        } finally {
            setApplySubmitting(false);
        }
    };

    const filteredLeaves = leaves.filter((leave) => {
        const searchText = search.toLowerCase().trim();

        if (!searchText) return true;

        const name = leave.studentId?.fullName?.toLowerCase() || "";
        const grNumber = leave.studentId?.grNumber?.toLowerCase() || "";

        return name.includes(searchText) || grNumber.includes(searchText);
    });

    const pendingCount = leaves.filter(
        (leave) => leave.status === "Pending"
    ).length;

    const approvedCount = leaves.filter(
        (leave) => leave.status === "Approved"
    ).length;

    const rejectedCount = leaves.filter(
        (leave) => leave.status === "Rejected"
    ).length;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            isGujarati ? "gu-IN" : "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getDays = (fromDate, toDate) => {
        if (!fromDate || !toDate) return 0;

        const from = new Date(fromDate);
        const to = new Date(toDate);

        return (
            Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1
        );
    };

    const LeaveActions = ({ leave }) => {
        const isPending = leave.status === "Pending";
        const isLoading = actionLoading === leave._id;

        if (user?.role === "student") return null;

        if (!isPending) {
            return (
                <span className="text-sm text-slate-400">
                    {statusLabel[leave.status] || leave.status}
                </span>
            );
        }

        return (
            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    onClick={() =>
                        openRemarkModal(leave._id, "Approved")
                    }
                    disabled={isLoading}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <CheckCircle2 size={15} />
                    )}
                    {text.approve}
                </button>

                <button
                    onClick={() =>
                        openRemarkModal(leave._id, "Rejected")
                    }
                    disabled={isLoading}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <XCircle size={15} />
                    {text.reject}
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {text.title}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        {text.subtitle}
                    </p>
                </div>

                {user?.role === "student" && (
                    <button
                        onClick={openApplyModal}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#4a24d6]"
                    >
                        <Plus size={18} />
                        {text.applyLeave}
                    </button>
                )}
            </div>

            <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-yellow-600">
                                {text.pending}
                            </p>

                            <h2 className="mt-2 text-4xl font-bold text-slate-800">
                                {pendingCount}
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                {text.awaitingAction}
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                            <Plane size={28} className="text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-green-600">
                                {text.approved}
                            </p>

                            <h2 className="mt-2 text-4xl font-bold text-slate-800">
                                {approvedCount}
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                {text.totalApproved}
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                            <CheckCircle2 size={29} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-red-600">
                                {text.rejected}
                            </p>

                            <h2 className="mt-2 text-4xl font-bold text-slate-800">
                                {rejectedCount}
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                {text.totalRejected}
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                            <XCircle size={29} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <div className="flex items-center rounded-xl bg-slate-100 px-4">
                            <Search size={18} className="shrink-0 text-slate-500" />

                            <input
                                type="text"
                                placeholder={text.searchPlaceholder}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full bg-transparent px-3 py-3 outline-none"
                            />
                        </div>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                    >
                        <option value="">{text.allStatus}</option>
                        <option value="Pending">{text.pending}</option>
                        <option value="Approved">{text.approved}</option>
                        <option value="Rejected">{text.rejected}</option>
                    </select>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                        }}
                        className="flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800"
                    >
                        <RefreshCw size={16} />
                        {text.reset}
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-72 flex-col items-center justify-center gap-3">
                        <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                        <p className="font-medium text-slate-500">{text.loading}</p>
                    </div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <Plane
                            size={56}
                            className="mx-auto mb-4 text-slate-300"
                        />

                        <h2 className="text-xl font-semibold text-slate-600">
                            {text.noRequests}
                        </h2>

                        <p className="mt-2 text-sm text-slate-400 sm:text-base">
                            {text.noRequestsText}
                        </p>

                        {user?.role === "student" && (
                            <button
                                onClick={openApplyModal}
                                className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#4a24d6]"
                            >
                                <Plus size={18} />
                                {text.applyNow}
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto xl:block">
                            <table className="w-full min-w-[1150px]">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.student}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.class}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.reason}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.from}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.to}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.days}
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            {text.status}
                                        </th>

                                        {user?.role !== "student" && (
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                                {text.actions}
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredLeaves.map((leave) => {
                                        const days = getDays(
                                            leave.fromDate,
                                            leave.toDate
                                        );

                                        return (
                                            <tr
                                                key={leave._id}
                                                className="border-t border-slate-100 transition hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">
                                                        {leave.studentId?.fullName || "-"}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        GR: {leave.studentId?.grNumber || "-"}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {leave.studentId?.standard
                                                        ? isGujarati
                                                            ? `${leave.studentId.standard} ધોરણ - ${leave.studentId.division}`
                                                            : `Std ${leave.studentId.standard} - ${leave.studentId.division}`
                                                        : "-"}
                                                </td>

                                                <td className="max-w-xs px-6 py-4 text-slate-700">
                                                    <p className="truncate">
                                                        {leave.reason || "-"}
                                                    </p>

                                                    {leave.attachment && (
                                                        <a
                                                            href={`${serverUrl}/uploads/leaves/${leave.attachment}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#5B2EFF] hover:underline"
                                                        >
                                                            <FileText size={12} />
                                                            {text.viewAttachment}
                                                        </a>
                                                    )}

                                                    {leave.remark && (
                                                        <p className="mt-1.5 flex items-start gap-1 truncate text-xs text-slate-400">
                                                            <MessageSquare
                                                                size={12}
                                                                className="mt-0.5 shrink-0"
                                                            />
                                                            <span className="truncate">
                                                                {leave.reviewedByName
                                                                    ? `${leave.reviewedByName}: `
                                                                    : ""}
                                                                {leave.remark}
                                                            </span>
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {formatDate(leave.fromDate)}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {formatDate(leave.toDate)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                        {days}{" "}
                                                        {days === 1
                                                            ? text.day
                                                            : text.days}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            STATUS_STYLE[leave.status] ||
                                                            "bg-slate-100 text-slate-700"
                                                        }`}
                                                    >
                                                        {statusLabel[leave.status] ||
                                                            leave.status}
                                                    </span>
                                                </td>

                                                {user?.role !== "student" && (
                                                    <td className="px-6 py-4">
                                                        <LeaveActions leave={leave} />
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 xl:hidden">
                            {filteredLeaves.map((leave) => {
                                const days = getDays(
                                    leave.fromDate,
                                    leave.toDate
                                );

                                return (
                                    <div key={leave._id} className="p-4 sm:p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-800">
                                                    {leave.studentId?.fullName || "-"}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    GR: {leave.studentId?.grNumber || "-"}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    STATUS_STYLE[leave.status] ||
                                                    "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {statusLabel[leave.status] ||
                                                    leave.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-400">{text.class}</p>
                                                <p className="mt-1 font-medium text-slate-700">
                                                    {leave.studentId?.standard
                                                        ? isGujarati
                                                            ? `${leave.studentId.standard} ધોરણ - ${leave.studentId.division}`
                                                            : `Std ${leave.studentId.standard} - ${leave.studentId.division}`
                                                        : "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-400">{text.days}</p>
                                                <p className="mt-1 font-medium text-slate-700">
                                                    {days}{" "}
                                                    {days === 1
                                                        ? text.day
                                                        : text.days}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-400">{text.from}</p>
                                                <p className="mt-1 font-medium text-slate-700">
                                                    {formatDate(leave.fromDate)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-slate-400">{text.to}</p>
                                                <p className="mt-1 font-medium text-slate-700">
                                                    {formatDate(leave.toDate)}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-slate-400">{text.reason}</p>
                                                <p className="mt-1 break-words font-medium text-slate-700">
                                                    {leave.reason || "-"}
                                                </p>

                                                {leave.attachment && (
                                                    <a
                                                        href={`${serverUrl}/uploads/leaves/${leave.attachment}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B2EFF] hover:underline"
                                                    >
                                                        <Download size={13} />
                                                        {text.viewAttachment}
                                                    </a>
                                                )}
                                            </div>

                                            {leave.remark && (
                                                <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                                                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                        <MessageSquare size={13} />
                                                        {leave.reviewedByName
                                                            ? `${text.respondedBy} ${leave.reviewedByName}`
                                                            : text.remark}
                                                    </p>
                                                    <p className="mt-1 break-words text-sm text-slate-700">
                                                        {leave.remark}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {user?.role !== "student" && (
                                            <div className="mt-4 border-t border-slate-100 pt-4">
                                                <LeaveActions leave={leave} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Apply for Leave Modal (Student only) */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">
                                {text.applyLeaveTitle}
                            </h2>

                            <button
                                onClick={closeApplyModal}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    {text.leaveType}
                                </label>

                                <select
                                    value={applyForm.leaveType}
                                    onChange={(event) =>
                                        handleApplyChange("leaveType", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Emergency Leave">Emergency Leave</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        {text.from}
                                    </label>

                                    <input
                                        type="date"
                                        value={applyForm.fromDate}
                                        onChange={(event) =>
                                            handleApplyChange("fromDate", event.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        {text.to}
                                    </label>

                                    <input
                                        type="date"
                                        value={applyForm.toDate}
                                        onChange={(event) =>
                                            handleApplyChange("toDate", event.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    {text.reason}
                                </label>

                                <textarea
                                    rows={4}
                                    value={applyForm.reason}
                                    placeholder={text.reasonPlaceholder}
                                    onChange={(event) =>
                                        handleApplyChange("reason", event.target.value)
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    {text.attachment}
                                </label>

                                <p className="mb-2 text-xs text-slate-400">
                                    {text.attachmentHint}
                                </p>

                                <label
                                    htmlFor="leave-attachment"
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:border-[#5B2EFF] hover:bg-violet-50"
                                >
                                    <Paperclip size={16} className="shrink-0 text-slate-400" />

                                    <span className="truncate">
                                        {selectedFile
                                            ? selectedFile.name
                                            : text.chooseFile}
                                    </span>
                                </label>

                                <input
                                    id="leave-attachment"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>

                            {applyError && (
                                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                                    {applyError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeApplyModal}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    {text.cancel}
                                </button>

                                <button
                                    type="submit"
                                    disabled={applySubmitting}
                                    className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-5 py-2.5 font-semibold text-white transition hover:bg-[#4a24d6] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {applySubmitting && (
                                        <Loader2 size={16} className="animate-spin" />
                                    )}
                                    {applySubmitting ? text.submitting : text.submit}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approve / Reject Remark Modal (Teacher / Admin only) */}
            {remarkTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">
                                {remarkTarget.status === "Approved"
                                    ? text.confirmApprove
                                    : text.confirmReject}
                            </h2>

                            <button
                                onClick={closeRemarkModal}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                            {text.remarkOptional}
                        </label>

                        <textarea
                            rows={3}
                            value={remarkText}
                            placeholder={text.remarkPlaceholder}
                            onChange={(event) => setRemarkText(event.target.value)}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-violet-100"
                        />

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeRemarkModal}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                {text.cancel}
                            </button>

                            <button
                                type="button"
                                onClick={handleStatusUpdate}
                                disabled={actionLoading === remarkTarget.id}
                                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    remarkTarget.status === "Approved"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {actionLoading === remarkTarget.id && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}
                                {text.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;