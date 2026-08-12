import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
    deleteStudent,
    getStudents,
    searchStudents
} from "../../services/studentService";
import { getMyTeacherScope } from "../../services/teacherService";

const Students = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [standard, setStandard] = useState("");
    const [division, setDivision] = useState("");
    const [status, setStatus] = useState("");
    const [message, setMessage] = useState("");

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const canManageStudents =
        user?.role === "admin" || user?.role === "teacher";

    const canDeleteStudents = user?.role === "admin";
    const isTeacher = user?.role === "teacher";

    const [teacherClasses, setTeacherClasses] = useState([]);

    // Load teacher's assigned classes so we can scope the student list
    useEffect(() => {
        if (isTeacher) {
            getMyTeacherScope()
                .then((data) => {
                    if (data.success && data.classesHandled?.length > 0) {
                        setTeacherClasses(data.classesHandled);
                    }
                })
                .catch(() => {});
        }
    }, [isTeacher]); // eslint-disable-line react-hooks/exhaustive-deps

    const showMessage = (text) => {
        setMessage(text);

        window.setTimeout(() => {
            setMessage("");
        }, 3500);
    };

    const getStudentPhoto = (photo) => {
        if (!photo) return "";

        if (photo.startsWith("http://") || photo.startsWith("https://")) {
            return photo;
        }

        if (photo.startsWith("/")) {
            return `${serverUrl}${photo}`;
        }

        return `${serverUrl}/uploads/students/${photo}`;
    };

    const loadStudents = async () => {
        try {
            setLoading(true);

            const response = await getStudents();
            setStudents(response.students || []);
        } catch (error) {
            console.error(error);
            showMessage(
                error.response?.data?.message || "Unable to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const classOptions = useMemo(() => {
        const classes = students
            .filter((student) => student.standard !== undefined)
            .map((student) => String(student.standard));

        return [...new Set(classes)].sort(
            (first, second) => Number(first) - Number(second)
        );
    }, [students]);

    const divisionOptions = useMemo(() => {
        const divisions = students
            .filter((student) => student.division)
            .map((student) => String(student.division).toUpperCase());

        return [...new Set(divisions)].sort();
    }, [students]);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return students.filter((student) => {
            const searchMatch =
                !query ||
                student.fullName?.toLowerCase().includes(query) ||
                student.grNumber?.toLowerCase().includes(query) ||
                student.parentMobile?.includes(query);

            const standardMatch = standard
                ? String(student.standard) === standard
                : true;

            const divisionMatch = division
                ? String(student.division).toUpperCase() === division
                : true;

            const statusMatch = status ? student.status === status : true;

            // Teacher scope: only show students from assigned classes
            const scopeMatch =
                !isTeacher || teacherClasses.length === 0
                    ? true
                    : teacherClasses.some((tc) => {
                          const m = String(tc).match(/\d+/);
                          return m && parseInt(m[0], 10) === Number(student.standard);
                      });

            return searchMatch && standardMatch && divisionMatch && statusMatch && scopeMatch;
        });
    }, [students, search, standard, division, status, isTeacher, teacherClasses]);

    const handleSearch = async () => {
        if (!search.trim()) {
            loadStudents();
            return;
        }

        try {
            setLoading(true);

            const response = await searchStudents(search);
            setStudents(response.students || []);
        } catch (error) {
            console.error(error);
            showMessage(
                error.response?.data?.message || "Unable to search students."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Do you want to delete this student?");

        if (!confirmed) return;

        try {
            await deleteStudent(id);

            setStudents((previousStudents) =>
                previousStudents.filter((student) => student._id !== id)
            );

            showMessage(t("students.studentDeleted"));
        } catch (error) {
            console.error(error);
            showMessage(
                error.response?.data?.message || "Unable to delete student."
            );
        }
    };

    const resetFilters = () => {
        setSearch("");
        setStandard("");
        setDivision("");
        setStatus("");
        loadStudents();
    };

    return (
        <div className="space-y-6 pb-10">
            <section className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-white shadow-lg sm:rounded-3xl sm:px-6 sm:py-5">
                <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-100">
                        <Users className="h-3.5 w-3.5" />
                        {t("sidebar.students")}
                    </p>
                    <h1 className="text-xl font-extrabold sm:text-3xl">
                        {t("students.students")}
                    </h1>
                    <p className="text-xs text-blue-100">
                        {filteredStudents.length} found
                    </p>
                </div>

                {canManageStudents && (
                    <button
                        type="button"
                        onClick={() => navigate("/students/add")}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-lg transition hover:bg-blue-50 sm:px-5 sm:py-3 sm:text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden xs:inline">{t("students.addStudent")}</span>
                        <span className="xs:hidden">Add</span>
                    </button>
                )}
            </section>

            {message && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700">
                    {message}
                </div>
            )}

            {/* Teacher scope banner */}
            {isTeacher && teacherClasses.length > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
                    <span>🔒</span>
                    <span>
                        Showing students from your assigned classes only:{" "}
                        <strong>{teacherClasses.join(", ")}</strong>
                    </span>
                </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
                {/* Search bar */}
                <div className="mb-2 flex rounded-xl border border-slate-300 bg-slate-50 p-1 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                    <div className="flex items-center px-2 text-slate-400">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
                        placeholder={`${t("common.search")} name / GR`}
                        className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                    >
                        {t("common.search")}
                    </button>
                </div>

                {/* Filter row — horizontally scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <select
                        value={standard}
                        onChange={(event) => setStandard(event.target.value)}
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                        <option value="">All Classes</option>
                        {classOptions.map((item) => (
                            <option key={item} value={item}>Class {item}</option>
                        ))}
                    </select>

                    <select
                        value={division}
                        onChange={(event) => setDivision(event.target.value)}
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                        <option value="">All Div</option>
                        {divisionOptions.map((item) => (
                            <option key={item} value={item}>Div {item}</option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                        <option value="">All Status</option>
                        <option value="Active">{t("students.active")}</option>
                        <option value="Inactive">{t("students.inactive")}</option>
                    </select>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-950"
                    >
                        <RefreshCw className="h-3 w-3" />
                        {t("common.reset")}
                    </button>
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-80 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                        <div className="rounded-3xl bg-slate-100 p-5 text-slate-400">
                            <Users className="h-12 w-12" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-700">
                            {t("common.noData")}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Try changing the search or filter options.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">
                                            {t("students.grNumber")}
                                        </th>
                                        <th className="px-6 py-4">
                                            {t("students.class")}
                                        </th>
                                        <th className="px-6 py-4">
                                            {t("students.parentMobile")}
                                        </th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student) => (
                                        <tr
                                            key={student._id}
                                            className="transition hover:bg-indigo-50/40"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {student.photo ? (
                                                        <img
                                                            src={getStudentPhoto(
                                                                student.photo
                                                            )}
                                                            alt={
                                                                student.fullName
                                                            }
                                                            className="h-11 w-11 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-extrabold text-indigo-600">
                                                            {student.fullName
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-bold text-slate-800">
                                                            {student.fullName}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {student.gender ||
                                                                "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                {student.grNumber}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                Class {student.standard} -{" "}
                                                {student.division}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {student.parentMobile || "—"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                        student.status ===
                                                        "Active"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-rose-100 text-rose-700"
                                                    }`}
                                                >
                                                    {student.status ||
                                                        t("students.active")}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/students/${student._id}`
                                                            )
                                                        }
                                                        className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                                        title={t("common.view")}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    {canManageStudents && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/students/edit/${student._id}`
                                                                )
                                                            }
                                                            className="rounded-lg bg-amber-100 p-2 text-amber-700 transition hover:bg-amber-500 hover:text-white"
                                                            title={t(
                                                                "common.edit"
                                                            )}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {canDeleteStudents && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    student._id
                                                                )
                                                            }
                                                            className="rounded-lg bg-rose-100 p-2 text-rose-700 transition hover:bg-rose-600 hover:text-white"
                                                            title={t(
                                                                "common.delete"
                                                            )}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── COMPACT MOBILE CARDS ── */}
                        <div className="divide-y divide-slate-100 lg:hidden">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className="flex items-center gap-2.5 px-3 py-2.5 transition hover:bg-indigo-50/40"
                                >
                                    {/* Avatar */}
                                    {student.photo ? (
                                        <img
                                            src={getStudentPhoto(student.photo)}
                                            alt={student.fullName}
                                            className="h-10 w-10 shrink-0 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-extrabold text-indigo-600">
                                            {student.fullName?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="truncate text-sm font-bold text-slate-800">
                                                {student.fullName}
                                            </p>
                                            <span
                                                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                                    student.status === "Active"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-rose-100 text-rose-700"
                                                }`}
                                            >
                                                {student.status || "Active"}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            GR: {student.grNumber} · Cl {student.standard}-{student.division}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/students/${student._id}`)}
                                            className="rounded-lg bg-blue-100 p-1.5 text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                            title={t("common.view")}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </button>

                                        {canManageStudents && (
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/students/edit/${student._id}`)}
                                                className="rounded-lg bg-amber-100 p-1.5 text-amber-700 transition hover:bg-amber-500 hover:text-white"
                                                title={t("common.edit")}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        )}

                                        {canDeleteStudents && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(student._id)}
                                                className="rounded-lg bg-rose-100 p-1.5 text-rose-700 transition hover:bg-rose-600 hover:text-white"
                                                title={t("common.delete")}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default Students;