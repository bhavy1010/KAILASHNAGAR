import { useEffect, useState } from "react";
import {
    BookOpen,
    CalendarDays,
    GraduationCap,
    Loader2,
    Pencil,
    Phone,
    UserRound
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getStudentById } from "../../services/studentService";

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const canEdit = user?.role === "admin" || user?.role === "teacher";

    const getPhotoUrl = (photo) => {
        if (!photo) return "";

        if (photo.startsWith("http://") || photo.startsWith("https://")) {
            return photo;
        }

        if (photo.startsWith("/")) {
            return `${serverUrl}${photo}`;
        }

        return `${serverUrl}/uploads/students/${photo}`;
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "—";

        return new Date(dateValue).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    useEffect(() => {
        const loadStudent = async () => {
            try {
                setLoading(true);

                const response = await getStudentById(id);

                setStudent(
                    response.student || response.data || response
                );
            } catch (requestError) {
                console.error(requestError);

                setError(
                    requestError.response?.data?.message ||
                        "Unable to load student profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadStudent();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
                <h1 className="text-xl font-extrabold text-rose-700">
                    {error || "Student not found."}
                </h1>

                <button
                    type="button"
                    onClick={() => navigate("/students")}
                    className="mt-5 rounded-xl bg-rose-600 px-5 py-3 font-bold text-white"
                >
                    {t("common.back")}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
                <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {student.photo ? (
                            <img
                                src={getPhotoUrl(student.photo)}
                                alt={student.fullName}
                                className="h-20 w-20 rounded-3xl border-4 border-white/30 object-cover shadow-xl"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-white">
                                <UserRound className="h-10 w-10" />
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-semibold text-indigo-100">
                                {t("students.studentDetails")}
                            </p>

                            <h1 className="mt-1 text-3xl font-extrabold">
                                {student.fullName}
                            </h1>

                            <p className="mt-1 text-sm text-indigo-100">
                                GR Number: {student.grNumber}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/students")}
                            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
                        >
                            {t("common.back")}
                        </button>

                        {canEdit && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/students/edit/${student._id}`)
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-950/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-950/50"
                            >
                                <Pencil className="h-4 w-4" />
                                {t("common.edit")}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                            <UserRound className="h-6 w-6" />
                        </div>

                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Personal Information
                            </h2>
                            <p className="text-sm text-slate-500">
                                Student identity and family details.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <InfoItem
                            label={t("students.fullName")}
                            value={student.fullName}
                        />
                        <InfoItem
                            label={t("students.grNumber")}
                            value={student.grNumber}
                        />
                        <InfoItem
                            label={t("students.gender")}
                            value={student.gender}
                        />
                        <InfoItem
                            label={t("students.dateOfBirth")}
                            value={formatDate(student.dateOfBirth)}
                        />
                        <InfoItem
                            label="Father Name"
                            value={student.fatherName}
                        />
                        <InfoItem
                            label="Mother Name"
                            value={student.motherName}
                        />
                        <InfoItem
                            label={t("students.parentMobile")}
                            value={student.parentMobile}
                        />
                        <InfoItem
                            label={t("students.address")}
                            value={student.address}
                        />
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                            <GraduationCap className="h-6 w-6" />
                        </div>

                        <h2 className="text-xl font-extrabold text-slate-900">
                            Academic Details
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl bg-indigo-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                                {t("students.class")}
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-indigo-950">
                                Class {student.standard} - {student.division}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-amber-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                                Admission Date
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-amber-950">
                                {formatDate(student.admissionDate)}
                            </p>
                        </div>

                        <div
                            className={`rounded-2xl p-4 ${
                                student.status === "Active"
                                    ? "bg-emerald-50"
                                    : "bg-rose-50"
                            }`}
                        >
                            <p
                                className={`text-xs font-bold uppercase tracking-wide ${
                                    student.status === "Active"
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                }`}
                            >
                                Status
                            </p>
                            <p
                                className={`mt-1 text-lg font-extrabold ${
                                    student.status === "Active"
                                        ? "text-emerald-950"
                                        : "text-rose-950"
                                }`}
                            >
                                {student.status || t("students.active")}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <section className="grid gap-4 md:grid-cols-3">
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/attendance/student/${student._id}`)
                    }
                    className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left transition hover:-translate-y-1 hover:shadow-md"
                >
                    <CalendarDays className="h-8 w-8 text-blue-600" />
                    <div>
                        <p className="font-extrabold text-blue-950">
                            {t("attendance.attendance")}
                        </p>
                        <p className="text-sm text-blue-700">
                            View attendance report
                        </p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/homework/my")}
                    className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-violet-50 p-5 text-left transition hover:-translate-y-1 hover:shadow-md"
                >
                    <BookOpen className="h-8 w-8 text-violet-600" />
                    <div>
                        <p className="font-extrabold text-violet-950">
                            {t("sidebar.homework")}
                        </p>
                        <p className="text-sm text-violet-700">
                            View assigned homework
                        </p>
                    </div>
                </button>

                <a
                    href={`tel:${student.parentMobile || ""}`}
                    className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left transition hover:-translate-y-1 hover:shadow-md"
                >
                    <Phone className="h-8 w-8 text-emerald-600" />
                    <div>
                        <p className="font-extrabold text-emerald-950">
                            Contact Parent
                        </p>
                        <p className="text-sm text-emerald-700">
                            {student.parentMobile || "No mobile number"}
                        </p>
                    </div>
                </a>
            </section>
        </div>
    );
};

const InfoItem = ({ label, value }) => {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 break-words font-bold text-slate-800">
                {value || "—"}
            </p>
        </div>
    );
};

export default StudentProfile;