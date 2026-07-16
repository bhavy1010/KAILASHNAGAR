import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bell, Paperclip, Calendar, User, Eye } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
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

const NoticeDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();

    const [notice, setNotice] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadNotice();

    }, []);

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

        if (!window.confirm("Delete this notice permanently?")) return;

        try {

            await deleteNotice(id);
            navigate("/notices/list");

        } catch (error) {

            alert(error.response?.data?.message || "Unable to delete notice");

        }

    };

    const handleArchive = async () => {

        if (!window.confirm("Archive this notice?")) return;

        try {

            await archiveNotice(id);
            navigate("/notices/list");

        } catch (error) {

            alert(error.response?.data?.message || "Unable to archive notice");

        }

    };

    const handlePrint = () => {

        window.print();

    };

    if (loading) {

        return (

            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

        );

    }

    if (!notice) {

        return (

            <div className="p-8 text-center">
                <Bell size={56} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-600">Notice Not Found</h2>
            </div>

        );

    }

    const isExpired = notice.expiryDate && new Date(notice.expiryDate) < new Date();

    const isAdmin = user?.role === "admin";

    const isTeacherOrAdmin =
        user?.role === "admin" || user?.role === "teacher";

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full" id="notice-print">

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #notice-print, #notice-print * { visibility: visible; }
                    #notice-print { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* ============================== Header ============================== */}

            <div className="flex items-center justify-between mb-8 no-print">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/notices/list")}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <p className="text-sm text-gray-500">
                            Notices &rsaquo; Details
                        </p>
                        <h1 className="text-3xl font-bold text-slate-800 mt-1">
                            Notice Details
                        </h1>
                    </div>

                </div>

                <div className="flex flex-wrap gap-3">

                    <button
                        onClick={handlePrint}
                        className="px-5 py-3 rounded-xl bg-white border border-gray-200 shadow hover:bg-gray-50 font-medium transition"
                    >
                        🖨 Print
                    </button>

                    {isTeacherOrAdmin && (

                        <button
                            onClick={() => navigate("/notices/edit/" + notice._id)}
                            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition"
                        >
                            ✏ Edit
                        </button>

                    )}

                    {isAdmin && (

                        <button
                            onClick={handleArchive}
                            className="px-5 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition"
                        >
                            Archive
                        </button>

                    )}

                    {isAdmin && (

                        <button
                            onClick={handleDelete}
                            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                        >
                            🗑 Delete
                        </button>

                    )}

                </div>

            </div>

            {/* ============================== Notice Card ============================== */}

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

                {/* Priority Banner */}

                {notice.priority === "Urgent" && (

                    <div className="bg-red-500 text-white text-center py-3 font-bold text-sm">
                        🚨 URGENT NOTICE — Please read immediately
                    </div>

                )}

                {notice.priority === "High" && (

                    <div className="bg-orange-500 text-white text-center py-3 font-bold text-sm">
                        ⚠ HIGH PRIORITY NOTICE
                    </div>

                )}

                {/* Notice Header */}

                <div className="p-8 border-b">

                    <div className="flex flex-wrap items-center gap-3 mb-5">

                        <span className={"px-4 py-1 rounded-full text-sm font-semibold " + (CATEGORY_STYLE[notice.category] || "bg-gray-100 text-gray-600")}>
                            {notice.category}
                        </span>

                        <span className={"px-4 py-1 rounded-full text-sm font-semibold " + (PRIORITY_STYLE[notice.priority] || "bg-gray-100 text-gray-600")}>
                            {notice.priority} Priority
                        </span>

                        <span className={"px-4 py-1 rounded-full text-sm font-semibold " + (AUDIENCE_STYLE[notice.audience] || "bg-gray-100 text-gray-600")}>
                            For: {notice.audience}
                        </span>

                        {isExpired && (

                            <span className="px-4 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600">
                                Expired
                            </span>

                        )}

                        {notice.isArchived && (

                            <span className="px-4 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-500">
                                Archived
                            </span>

                        )}

                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        {notice.title}
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                        <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Published By</p>
                                <p className="font-semibold text-sm text-gray-700">
                                    {notice.publishedBy || "Admin"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Published On</p>
                                <p className="font-semibold text-sm text-gray-700">
                                    {new Date(notice.publishDate || notice.createdAt).toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </p>
                            </div>
                        </div>

                        {notice.expiryDate && (

                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Expires On</p>
                                    <p className={"font-semibold text-sm " + (isExpired ? "text-red-600" : "text-gray-700")}>
                                        {new Date(notice.expiryDate).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </p>
                                </div>
                            </div>

                        )}

                        <div className="flex items-center gap-2">
                            <Eye size={16} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Views</p>
                                <p className="font-semibold text-sm text-gray-700">
                                    {notice.views}
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Notice Body */}

                <div className="p-8">

                    <h2 className="text-lg font-bold text-gray-700 mb-4">Notice Content</h2>

                    <div className="bg-gray-50 rounded-2xl p-6">

                        <p className="text-gray-700 leading-8 whitespace-pre-wrap">
                            {notice.description}
                        </p>

                    </div>

                </div>

                {/* Attachment */}

                {notice.attachment && (

                    <div className="px-8 pb-8">

                        <h2 className="text-lg font-bold text-gray-700 mb-4">Attachment</h2>

                        <a
                            href={"http://localhost:5000/uploads/notices/" + notice.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl px-6 py-4 transition"
                        >

                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <Paperclip size={18} className="text-white" />
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800">
                                    {notice.attachmentOriginalName || "Download Attachment"}
                                </p>
                                <p className="text-xs text-indigo-600 mt-1">
                                    Click to open or download
                                </p>
                            </div>

                        </a>

                    </div>

                )}

                {/* Footer */}

                <div className="border-t px-8 py-5 bg-gray-50">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <p className="text-xs text-gray-400">
                            Notice ID: {notice._id}
                        </p>

                        <p className="text-xs text-gray-400">
                            Last updated: {new Date(notice.updatedAt).toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })}
                        </p>

                    </div>

                </div>

            </div>

            {/* ============================== Bottom Actions ============================== */}

            <div className="mt-7 flex justify-between items-center no-print">

                <button
                    onClick={() => navigate("/notices/list")}
                    className="px-8 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 font-medium"
                >
                    Back to Notices
                </button>

                <div className="flex gap-3">

                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-semibold transition"
                    >
                        🖨 Print
                    </button>

                    {isTeacherOrAdmin && (

                        <button
                            onClick={() => navigate("/notices/edit/" + notice._id)}
                            className="px-6 py-3 rounded-xl bg-[#5B2EFF] hover:bg-[#4724db] text-white font-semibold transition"
                        >
                            ✏ Edit Notice
                        </button>

                    )}

                </div>

            </div>

        </div>

    );

};

export default NoticeDetails;