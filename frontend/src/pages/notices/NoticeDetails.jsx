import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Bell,
    Paperclip,
    Calendar,
    User,
    Eye,
    Printer,
    Pencil,
    Archive,
    Trash2,
    Languages,
    Loader2
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getNoticeById, deleteNotice, archiveNotice } from "../../services/noticeService";

const PRIORITY_STYLE = {
    Low: "bg-gray-100 text-gray-600",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Urgent: "bg-red-100 text-red-700"
};

const CATEGORY_STYLE = {
    General: "bg-indigo-100 text-indigo-700",
    Academic: "bg-blue-100 text-blue-700",
    Exam: "bg-purple-100 text-purple-700",
    Holiday: "bg-green-100 text-green-700",
    Event: "bg-cyan-100 text-cyan-700",
    Sports: "bg-teal-100 text-teal-700",
    Fee: "bg-yellow-100 text-yellow-700",
    Urgent: "bg-red-100 text-red-700",
    Other: "bg-gray-100 text-gray-600"
};

const AUDIENCE_STYLE = {
    All: "bg-indigo-100 text-indigo-700",
    Teachers: "bg-blue-100 text-blue-700",
    Students: "bg-green-100 text-green-700",
    Parents: "bg-orange-100 text-orange-700"
};

const CATEGORY_LABEL_GU = {
    General: "સામાન્ય",
    Academic: "શૈક્ષણિક",
    Exam: "પરીક્ષા",
    Holiday: "રજા",
    Event: "કાર્યક્રમ",
    Sports: "રમતગમત",
    Fee: "ફી",
    Urgent: "તાત્કાલિક",
    Other: "અન્ય"
};

const PRIORITY_LABEL_GU = {
    Low: "ઓછી",
    Medium: "મધ્યમ",
    High: "ઊંચી",
    Urgent: "તાત્કાલિક"
};

const AUDIENCE_LABEL_GU = {
    All: "બધા",
    Teachers: "શિક્ષકો",
    Students: "વિદ્યાર્થીઓ",
    Parents: "વાલીઓ"
};

const NoticeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);

    const text = {
        breadcrumb: isGujarati ? "નોટિસ ›  વિગતો" : "Notices › Details",
        title: isGujarati ? "નોટિસ વિગતો" : "Notice Details",
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        print: isGujarati ? "પ્રિન્ટ" : "Print",
        edit: isGujarati ? "સંપાદિત કરો" : "Edit",
        editNotice: isGujarati ? "નોટિસ સંપાદિત કરો" : "Edit Notice",
        archive: isGujarati ? "આર્કાઇવ" : "Archive",
        delete: isGujarati ? "કાઢી નાખો" : "Delete",
        backToNotices: isGujarati ? "નોટિસ પર પાછા જાઓ" : "Back to Notices",
        urgentBanner: isGujarati
            ? "🚨 તાત્કાલિક નોટિસ — કૃપા કરીને તરત જ વાંચો"
            : "🚨 URGENT NOTICE — Please read immediately",
        highBanner: isGujarati ? "⚠ ઉચ્ચ પ્રાથમિકતા નોટિસ" : "⚠ HIGH PRIORITY NOTICE",
        priorityLabel: isGujarati ? "પ્રાથમિકતા" : "Priority",
        forLabel: isGujarati ? "માટે:" : "For:",
        expired: isGujarati ? "સમાપ્ત થયેલ" : "Expired",
        archived: isGujarati ? "આર્કાઇવ થયેલ" : "Archived",
        publishedBy: isGujarati ? "પ્રકાશક" : "Published By",
        publishedOn: isGujarati ? "પ્રકાશન તારીખ" : "Published On",
        expiresOn: isGujarati ? "સમાપ્તિ તારીખ" : "Expires On",
        views: isGujarati ? "જોવાયું" : "Views",
        admin: isGujarati ? "એડમિન" : "Admin",
        noticeContent: isGujarati ? "નોટિસ સામગ્રી" : "Notice Content",
        attachment: isGujarati ? "જોડાણ" : "Attachment",
        downloadAttachment: isGujarati ? "જોડાણ ડાઉનલોડ કરો" : "Download Attachment",
        clickToOpen: isGujarati
            ? "ખોલવા અથવા ડાઉનલોડ કરવા માટે ક્લિક કરો"
            : "Click to open or download",
        noticeId: isGujarati ? "નોટિસ ID:" : "Notice ID:",
        lastUpdated: isGujarati ? "છેલ્લે અપડેટ થયું:" : "Last updated:",
        loading: isGujarati ? "નોટિસ લોડ થઈ રહી છે..." : "Loading notice...",
        notFound: isGujarati ? "નોટિસ મળી નથી" : "Notice Not Found",
        confirmDelete: isGujarati
            ? "આ નોટિસ કાયમ માટે કાઢી નાખવી છે?"
            : "Delete this notice permanently?",
        confirmArchive: isGujarati
            ? "આ નોટિસ આર્કાઇવ કરવી છે?"
            : "Archive this notice?",
        deleteError: isGujarati ? "નોટિસ કાઢી શકાયું નથી" : "Unable to delete notice",
        archiveError: isGujarati
            ? "નોટિસ આર્કાઇવ કરી શકાયું નથી"
            : "Unable to archive notice"
    };

    const categoryLabel = (category) =>
        isGujarati ? CATEGORY_LABEL_GU[category] || category : category;

    const priorityLabel = (priority) =>
        isGujarati ? PRIORITY_LABEL_GU[priority] || priority : priority;

    const audienceLabel = (audience) =>
        isGujarati ? AUDIENCE_LABEL_GU[audience] || audience : audience;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    useEffect(() => {
        loadNotice();
    }, [id]);

    const loadNotice = async () => {
        try {
            setLoading(true);

            const response = await getNoticeById(id);

            setNotice(response.notice);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(text.confirmDelete)) return;

        try {
            await deleteNotice(id);
            navigate("/notices/list");
        } catch (error) {
            alert(error.response?.data?.message || text.deleteError);
        }
    };

    const handleArchive = async () => {
        if (!window.confirm(text.confirmArchive)) return;

        try {
            await archiveNotice(id);
            navigate("/notices/list");
        } catch (error) {
            alert(error.response?.data?.message || text.archiveError);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 size={40} className="animate-spin text-[#5B2EFF]" />
                <p className="font-medium text-slate-500">{text.loading}</p>
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="p-8 text-center">
                <Bell size={56} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600">
                    {text.notFound}
                </h2>
            </div>
        );
    }

    const isExpired = notice.expiryDate && new Date(notice.expiryDate) < new Date();
    const isAdmin = user?.role === "admin";
    const isTeacherOrAdmin = user?.role === "admin" || user?.role === "teacher";

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8" id="notice-print">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #notice-print, #notice-print * { visibility: visible; }
                    #notice-print { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* ============================== Header ============================== */}

            <div className="no-print mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() =>
                            navigate(
                                isTeacherOrAdmin ? "/notices/list" : "/notices/board"
                            )
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow hover:bg-gray-100 sm:h-12 sm:w-12"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div className="min-w-0">
                        <p className="truncate text-sm text-gray-500">
                            {text.breadcrumb}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                            {text.title}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow transition hover:border-[#5B2EFF] hover:text-[#5B2EFF] sm:py-3"
                    >
                        <Languages size={16} />
                        {text.switchLang}
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-medium shadow transition hover:bg-gray-50 sm:py-3"
                    >
                        <Printer size={16} />
                        {text.print}
                    </button>

                    {isTeacherOrAdmin && (
                        <button
                            onClick={() => navigate("/notices/edit/" + notice._id)}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-600 sm:py-3"
                        >
                            <Pencil size={16} />
                            {text.edit}
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={handleArchive}
                            className="flex items-center gap-2 rounded-xl bg-gray-500 px-4 py-2.5 font-semibold text-white transition hover:bg-gray-600 sm:py-3"
                        >
                            <Archive size={16} />
                            {text.archive}
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 sm:py-3"
                        >
                            <Trash2 size={16} />
                            {text.delete}
                        </button>
                    )}
                </div>
            </div>

            {/* ============================== Notice Card ============================== */}

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
                {/* Priority Banner */}

                {notice.priority === "Urgent" && (
                    <div className="bg-red-500 py-3 px-4 text-center text-sm font-bold text-white">
                        {text.urgentBanner}
                    </div>
                )}

                {notice.priority === "High" && (
                    <div className="bg-orange-500 py-3 px-4 text-center text-sm font-bold text-white">
                        {text.highBanner}
                    </div>
                )}

                {/* Notice Header */}

                <div className="border-b p-5 sm:p-8">
                    <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span
                            className={
                                "rounded-full px-3 py-1 text-xs font-semibold sm:px-4 sm:text-sm " +
                                (CATEGORY_STYLE[notice.category] || "bg-gray-100 text-gray-600")
                            }
                        >
                            {categoryLabel(notice.category)}
                        </span>

                        <span
                            className={
                                "rounded-full px-3 py-1 text-xs font-semibold sm:px-4 sm:text-sm " +
                                (PRIORITY_STYLE[notice.priority] || "bg-gray-100 text-gray-600")
                            }
                        >
                            {priorityLabel(notice.priority)} {text.priorityLabel}
                        </span>

                        <span
                            className={
                                "rounded-full px-3 py-1 text-xs font-semibold sm:px-4 sm:text-sm " +
                                (AUDIENCE_STYLE[notice.audience] || "bg-gray-100 text-gray-600")
                            }
                        >
                            {text.forLabel} {audienceLabel(notice.audience)}
                        </span>

                        {isExpired && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 sm:px-4 sm:text-sm">
                                {text.expired}
                            </span>
                        )}

                        {notice.isArchived && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 sm:px-4 sm:text-sm">
                                {text.archived}
                            </span>
                        )}
                    </div>

                    <h1 className="mb-6 break-words text-2xl font-bold text-gray-800 sm:text-3xl">
                        {notice.title}
                    </h1>

                    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
                        <div className="flex items-center gap-2">
                            <User size={16} className="shrink-0 text-gray-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">{text.publishedBy}</p>
                                <p className="truncate text-sm font-semibold text-gray-700">
                                    {notice.publishedBy || text.admin}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="shrink-0 text-gray-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">{text.publishedOn}</p>
                                <p className="truncate text-sm font-semibold text-gray-700">
                                    {formatDate(notice.publishDate || notice.createdAt)}
                                </p>
                            </div>
                        </div>

                        {notice.expiryDate && (
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="shrink-0 text-gray-400" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400">{text.expiresOn}</p>
                                    <p
                                        className={
                                            "truncate text-sm font-semibold " +
                                            (isExpired ? "text-red-600" : "text-gray-700")
                                        }
                                    >
                                        {formatDate(notice.expiryDate)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Eye size={16} className="shrink-0 text-gray-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">{text.views}</p>
                                <p className="truncate text-sm font-semibold text-gray-700">
                                    {notice.views}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notice Body */}

                <div className="p-5 sm:p-8">
                    <h2 className="mb-4 text-lg font-bold text-gray-700">
                        {text.noticeContent}
                    </h2>

                    <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
                        <p className="whitespace-pre-wrap break-words leading-7 text-gray-700 sm:leading-8">
                            {notice.description}
                        </p>
                    </div>
                </div>

                {/* Attachment */}

                {notice.attachment && (
                    <div className="px-5 pb-5 sm:px-8 sm:pb-8">
                        <h2 className="mb-4 text-lg font-bold text-gray-700">
                            {text.attachment}
                        </h2>

                        <a
                            href={"http://localhost:5000/uploads/notices/" + notice.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4 transition hover:bg-indigo-100 sm:w-auto sm:px-6"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
                                <Paperclip size={18} className="text-white" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-800">
                                    {notice.attachmentOriginalName || text.downloadAttachment}
                                </p>
                                <p className="mt-1 text-xs text-indigo-600">
                                    {text.clickToOpen}
                                </p>
                            </div>
                        </a>
                    </div>
                )}

                {/* Footer */}

                <div className="border-t bg-gray-50 px-5 py-5 sm:px-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                        <p className="break-all text-xs text-gray-400">
                            {text.noticeId} {notice._id}
                        </p>

                        <p className="text-xs text-gray-400">
                            {text.lastUpdated} {formatDate(notice.updatedAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ============================== Bottom Actions ============================== */}

            <div className="no-print mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                    onClick={() =>
                        navigate(isTeacherOrAdmin ? "/notices/list" : "/notices/board")
                    }
                    className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-medium hover:bg-gray-100"
                >
                    {text.backToNotices}
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        <Printer size={16} />
                        {text.print}
                    </button>

                    {isTeacherOrAdmin && (
                        <button
                            onClick={() => navigate("/notices/edit/" + notice._id)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-3 font-semibold text-white transition hover:bg-[#4724db]"
                        >
                            <Pencil size={16} />
                            {text.editNotice}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoticeDetails;