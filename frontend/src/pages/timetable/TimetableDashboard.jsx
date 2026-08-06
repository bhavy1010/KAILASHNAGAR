import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Plus, Pencil, Trash2, X, Save, Coffee, BookOpen, Loader2, Printer } from "lucide-react";
import { getClasses } from "../../services/classService";
import { getStudents } from "../../services/studentService";
import { getTeachers } from "../../services/teacherService";
import { createTimetable, deleteTimetable, getTimetable, updateTimetable } from "../../services/timetableService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-950",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-950",
    violet: "border-violet-200 bg-violet-50 text-violet-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950"
};

const blankEntry = () => ({ day: "Monday", startTime: "08:00", endTime: "08:45", type: "class", subject: "", teacherName: "", label: "", color: "indigo" });
const timeKey = (entry) => `${entry.startTime}-${entry.endTime}`;

export default function TimetableDashboard() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const canManage = ["admin", "teacher"].includes(user?.role);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classId, setClassId] = useState("");
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [draft, setDraft] = useState([]);

    useEffect(() => {
        Promise.all([getClasses(), getStudents(), canManage ? getTeachers() : Promise.resolve({ teachers: [] })])
            .then(([classResult, studentResult, teacherResult]) => {
                const savedClasses = (classResult.classes || []).map((item) => ({
                    id: String(item._id),
                    label: item.className || `Std ${item.standard} - ${item.division}`
                }));
                const studentClasses = (studentResult.students || [])
                    .filter((student) => student.standard && student.division)
                    .map((student) => ({
                        id: `std-${student.standard}-${student.division}`,
                        label: `Std ${student.standard} - ${student.division}`
                    }));
                const loadedClasses = [...new Map([...savedClasses, ...studentClasses].map((item) => [item.id, item])).values()];
                setClasses(loadedClasses);
                setTeachers(teacherResult.teachers || []);
                if (loadedClasses[0]) setClassId(loadedClasses[0].id);
            })
            .catch(() => alert("Unable to load timetable options."))
            .finally(() => setLoading(false));
    }, [canManage]);

    useEffect(() => {
        if (!classId) return;
        setLoading(true);
        getTimetable(classId)
            .then((result) => setTimetable(result.timetable || null))
            .catch(() => { setTimetable(null); alert("Unable to load this class timetable."); })
            .finally(() => setLoading(false));
    }, [classId]);

    const rows = useMemo(() => {
        const entries = timetable?.entries || [];
        return [...new Map(entries.map((entry) => [timeKey(entry), entry])).values()]
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [timetable]);

    const selectedClass = classes.find((item) => item.id === classId);
    const openEditor = () => { setDraft(timetable?.entries?.map((entry) => ({ ...entry, _id: undefined })) || [blankEntry()]); setModalOpen(true); };
    const patchEntry = (index, key, value) => setDraft((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item));
    const removeEntry = (index) => setDraft((items) => items.filter((_, i) => i !== index));

    const save = async () => {
        if (!draft.length || draft.some((entry) => !entry.day || !entry.startTime || !entry.endTime || (entry.type === "class" && !entry.subject) || (entry.type === "break" && !entry.label))) {
            alert("Complete all required fields before saving."); return;
        }
        if (draft.some((entry) => entry.endTime <= entry.startTime)) { alert("End time must be after start time."); return; }
        try {
            setSaving(true);
            const result = timetable ? await updateTimetable(timetable._id, { entries: draft }) : await createTimetable({ classId, entries: draft });
            setTimetable(result.timetable); setModalOpen(false);
        } catch (error) { alert(error.response?.data?.message || "Could not save the timetable."); }
        finally { setSaving(false); }
    };

    const removeTimetable = async () => {
        if (!window.confirm("Delete the complete timetable for this class?")) return;
        try { await deleteTimetable(timetable._id); setTimetable(null); }
        catch { alert("Could not delete the timetable."); }
    };

    const printTimetable = () => window.print();

    return <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="mb-2 flex items-center gap-2 text-indigo-600"><CalendarDays size={20}/><span className="text-sm font-bold uppercase tracking-wider">{t("timetable.academicSchedule")}</span></div><h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{t("timetable.title")}</h1><p className="mt-2 text-slate-500">{t("timetable.subtitle")}</p></div>
            <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center"><select value={classId} onChange={(e) => setClassId(e.target.value)} className="h-11 min-w-52 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-700 outline-none focus:border-indigo-500"><option value="">{t("timetable.selectClass")}</option>{classes.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select>{timetable && <button onClick={printTimetable} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"><Printer size={18}/>{t("timetable.print")}</button>}{canManage && <button onClick={openEditor} disabled={!classId} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"><Plus size={18}/>{timetable ? t("timetable.edit") : t("timetable.create")}</button>}</div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-5 text-white sm:px-7"><div><p className="text-sm font-medium text-indigo-100">{t("timetable.weeklySchedule")}</p><h2 className="text-xl font-bold">{selectedClass?.label || t("timetable.chooseClass")}</h2></div>{timetable && canManage && <div className="flex gap-2"><button onClick={openEditor} className="rounded-lg bg-white/15 p-2 hover:bg-white/25" title={t("timetable.edit")}><Pencil size={18}/></button><button onClick={removeTimetable} className="rounded-lg bg-white/15 p-2 hover:bg-rose-500" title={t("common.delete")}><Trash2 size={18}/></button></div>}</div>
            {loading ? <div className="flex min-h-72 items-center justify-center text-slate-500"><Loader2 className="mr-2 animate-spin"/>Loading timetable…</div> : !classId ? <Empty /> : !timetable ? <div className="py-20 text-center"><CalendarDays className="mx-auto mb-3 text-slate-300" size={42}/><h3 className="font-bold text-slate-700">No timetable yet</h3><p className="mt-1 text-sm text-slate-500">{canManage ? "Create the weekly schedule for this class." : "Please ask your teacher or administrator to add it."}</p></div> : <div className="overflow-x-auto"><table className="min-w-[860px] w-full border-collapse"><thead><tr className="bg-slate-50"><th className="w-32 border-b border-r border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>{DAYS.map((day) => <th key={day} className="border-b border-slate-200 px-3 py-4 text-left text-sm font-extrabold text-slate-700">{day}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={timeKey(row)}><td className="border-b border-r border-slate-200 bg-slate-50 px-4 py-3 align-top text-sm font-bold text-slate-700"><Clock3 size={14} className="mr-1 inline text-indigo-500"/>{row.startTime}<br/><span className="ml-5 text-xs font-medium text-slate-400">to {row.endTime}</span></td>{DAYS.map((day) => { const entry = timetable.entries.find((item) => item.day === day && timeKey(item) === timeKey(row)); return <td className="border-b border-r border-slate-100 p-2 align-top" key={day}>{entry && <div className={`min-h-18 rounded-xl border p-3 ${entry.type === "break" ? "border-amber-200 bg-amber-50 text-amber-950" : COLORS[entry.color] || COLORS.indigo}`}><p className="flex items-center gap-1 text-sm font-extrabold">{entry.type === "break" && <Coffee size={14}/>} {entry.type === "break" ? entry.label : entry.subject}</p>{entry.type === "class" && entry.teacherName && <p className="mt-1 text-xs font-medium opacity-70">{entry.teacherName}</p>}</div>}</td>; })}</tr>)}</tbody></table></div>}
        </div>
        {modalOpen && <Editor draft={draft} teachers={teachers} setDraft={setDraft} patchEntry={patchEntry} removeEntry={removeEntry} onClose={() => setModalOpen(false)} onSave={save} saving={saving}/>} 
    </div>;
}

function Empty() { return <div className="py-20 text-center text-slate-500">Choose a class to view its timetable.</div>; }
function Editor({ draft, teachers, setDraft, patchEntry, removeEntry, onClose, onSave, saving }) { return <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-8"><div className="mx-auto my-4 max-w-6xl rounded-3xl bg-slate-50 shadow-2xl"><div className="flex items-center justify-between rounded-t-3xl bg-white px-5 py-5 sm:px-7"><div><h2 className="text-2xl font-extrabold text-slate-900">Timetable editor</h2><p className="text-sm text-slate-500">Add class periods or as many breaks as you need.</p></div><button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X/></button></div><div className="p-4 sm:p-7"><div className="mb-4 grid grid-cols-[1.1fr_.9fr_.9fr_.85fr_1.2fr_1.2fr_38px] gap-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400"><span>Day</span><span>Start</span><span>End</span><span>Type</span><span>Subject / break</span><span>Teacher</span><span/></div><div className="space-y-3">{draft.map((entry, index) => <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[1.1fr_.9fr_.9fr_.85fr_1.2fr_1.2fr_38px]" key={index}><select value={entry.day} onChange={(e) => patchEntry(index, "day", e.target.value)} className="field">{DAYS.map((day) => <option key={day}>{day}</option>)}</select><input type="time" value={entry.startTime} onChange={(e) => patchEntry(index, "startTime", e.target.value)} className="field"/><input type="time" value={entry.endTime} onChange={(e) => patchEntry(index, "endTime", e.target.value)} className="field"/><select value={entry.type} onChange={(e) => patchEntry(index, "type", e.target.value)} className="field"><option value="class">Class</option><option value="break">Break</option></select><input value={entry.type === "break" ? entry.label : entry.subject} onChange={(e) => patchEntry(index, entry.type === "break" ? "label" : "subject", e.target.value)} placeholder={entry.type === "break" ? "e.g. Lunch break" : "e.g. Mathematics"} className="field"/>{entry.type === "break" ? <div className="flex items-center px-3 text-sm font-semibold text-amber-600"><Coffee size={16} className="mr-2"/>Break time</div> : <select value={entry.teacherName} onChange={(e) => patchEntry(index, "teacherName", e.target.value)} className="field"><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher._id} value={teacher.fullName}>{teacher.fullName}</option>)}</select>}<button onClick={() => removeEntry(index)} className="rounded-xl p-2 text-rose-500 hover:bg-rose-50" title="Remove entry"><Trash2 size={18}/></button></div>)}</div><button onClick={() => setDraft([...draft, blankEntry()])} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 font-bold text-indigo-700 hover:bg-indigo-100"><Plus size={18}/>Add period or break</button></div><div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-5 py-5 sm:px-7"><button onClick={onClose} className="rounded-xl px-5 py-3 font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}Save timetable</button></div></div></div>; }
