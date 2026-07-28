import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, GraduationCap, Loader2, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { deleteTeacher, getTeachers, searchTeachers } from "../../services/teacherService";

const Teachers = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("");
    const [gender, setGender] = useState("");
    const [status, setStatus] = useState("");
    const [message, setMessage] = useState("");

    const serverUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

    const loadTeachers = async () => {
        try {
            setLoading(true);
            const response = await getTeachers();
            setTeachers(response.teachers || []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to load teachers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeachers();
    }, []);

    const subjectOptions = useMemo(
        () => [...new Set(teachers.map((teacher) => teacher.subject).filter(Boolean))].sort(),
        [teachers]
    );

    const filteredTeachers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return teachers.filter((teacher) => {
            const searchMatch =
                !query ||
                teacher.fullName?.toLowerCase().includes(query) ||
                teacher.mobile?.includes(query) ||
                teacher.subject?.toLowerCase().includes(query);

            return (
                searchMatch &&
                (!subject || teacher.subject === subject) &&
                (!gender || teacher.gender === gender) &&
                (!status || teacher.status === status)
            );
        });
    }, [teachers, search, subject, gender, status]);

    const getPhotoUrl = (photo) => {
        if (!photo) return "";
        if (photo.startsWith("http")) return photo;
        if (photo.startsWith("/")) return `${serverUrl}${photo}`;
        return `${serverUrl}/uploads/teachers/${photo}`;
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            loadTeachers();
            return;
        }

        try {
            setLoading(true);
            const response = await searchTeachers(search);
            setTeachers(response.teachers || []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to search teachers.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Do you want to delete this teacher?")) return;

        try {
            await deleteTeacher(id);
            setTeachers((previous) =>
                previous.filter((teacher) => teacher._id !== id)
            );
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to delete teacher.");
        }
    };

    const resetFilters = () => {
        setSearch("");
        setSubject("");
        setGender("");
        setStatus("");
        loadTeachers();
    };

    return (
        <div className="space-y-6 pb-10">
            <section className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-blue-100">
                        <GraduationCap className="h-4 w-4" />
                        {t("sidebar.teachers")}
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                        {t("teachers.teachers")}
                    </h1>
                    <p className="mt-2 text-sm text-blue-100 sm:text-base">
                        {filteredTeachers.length} teachers found
                    </p>
                </div>

                {user?.role === "admin" && (
                    <button
                        type="button"
                        onClick={() => navigate("/teachers/add")}
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                        <Plus className="h-5 w-5" />
                        {t("teachers.addTeacher")}
                    </button>
                )}
            </section>

            {message && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                    {message}
                </div>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <div className="flex rounded-xl border border-slate-300 bg-slate-50 p-1 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                            <div className="flex items-center px-3 text-slate-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                                placeholder="Search by name, mobile or subject"
                                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                            >
                                {t("common.search")}
                            </button>
                        </div>
                    </div>

                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none lg:col-span-2">
                        <option value="">All Subjects</option>
                        {subjectOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>

                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none lg:col-span-2">
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>

                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none lg:col-span-2">
                        <option value="">All Status</option>
                        <option value="Active">{t("students.active")}</option>
                        <option value="Inactive">{t("students.inactive")}</option>
                    </select>

                    <button onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-950 lg:col-span-2">
                        <RefreshCw className="h-4 w-4" />
                        {t("common.reset")}
                    </button>
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-80 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    </div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                        <div className="rounded-3xl bg-slate-100 p-5 text-slate-400">
                            <GraduationCap className="h-12 w-12" />
                        </div>
                        <h2 className="mt-5 text-xl font-bold text-slate-700">{t("common.noData")}</h2>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Teacher</th>
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4">Qualification</th>
                                        <th className="px-6 py-4">Mobile</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTeachers.map((teacher) => (
                                        <tr key={teacher._id} className="transition hover:bg-indigo-50/40">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {teacher.photo ? (
                                                        <img src={getPhotoUrl(teacher.photo)} alt={teacher.fullName} className="h-11 w-11 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-extrabold text-indigo-600">
                                                            {teacher.fullName?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-800">{teacher.fullName}</p>
                                                        <p className="text-xs text-slate-500">{teacher.gender || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{teacher.subject || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{teacher.qualification || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{teacher.mobile}</td>
                                            <td className="px-6 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${teacher.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                                    {teacher.status === "Active" ? t("students.active") : t("students.inactive")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => navigate(`/teachers/${teacher._id}`)} className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-600 hover:text-white"><Eye className="h-4 w-4" /></button>
                                                    {user?.role === "admin" && (
                                                        <>
                                                            <button onClick={() => navigate(`/teachers/edit/${teacher._id}`)} className="rounded-lg bg-amber-100 p-2 text-amber-700 hover:bg-amber-500 hover:text-white"><Pencil className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDelete(teacher._id)} className="rounded-lg bg-rose-100 p-2 text-rose-700 hover:bg-rose-600 hover:text-white"><Trash2 className="h-4 w-4" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 lg:hidden">
                            {filteredTeachers.map((teacher) => (
                                <article key={teacher._id} className="p-5">
                                    <div className="flex gap-3">
                                        {teacher.photo ? (
                                            <img src={getPhotoUrl(teacher.photo)} alt={teacher.fullName} className="h-14 w-14 rounded-2xl object-cover" />
                                        ) : (
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 font-extrabold text-indigo-600">
                                                {teacher.fullName?.charAt(0)?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between gap-2">
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{teacher.fullName}</h3>
                                                    <p className="text-sm text-slate-500">{teacher.subject || "—"}</p>
                                                </div>
                                                <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${teacher.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                                    {teacher.status === "Active" ? t("students.active") : t("students.inactive")}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-600">{teacher.mobile}</p>
                                            <div className="mt-4 flex gap-2">
                                                <button onClick={() => navigate(`/teachers/${teacher._id}`)} className="rounded-lg bg-blue-100 p-2 text-blue-700"><Eye className="h-4 w-4" /></button>
                                                {user?.role === "admin" && (
                                                    <>
                                                        <button onClick={() => navigate(`/teachers/edit/${teacher._id}`)} className="rounded-lg bg-amber-100 p-2 text-amber-700"><Pencil className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(teacher._id)} className="rounded-lg bg-rose-100 p-2 text-rose-700"><Trash2 className="h-4 w-4" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default Teachers;