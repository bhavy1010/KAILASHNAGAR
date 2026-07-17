import { useEffect, useState } from "react";
import {
    Award, CalendarDays, Loader2, Plus, Rose, Trash2, Trophy
} from "lucide-react";
import api from "../../config/axios";
import {
    createAchievement, deleteAchievement, deleteTodayRose,
    getAllAchievements, getAllTodayRoses, getSchoolInfo,
    saveTodayRose, updateSchoolInfo
} from "../../services/homeService";

const HomeManagement = () => {
    const today = new Date().toISOString().split("T")[0];

    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [achievements, setAchievements] = useState([]);
    const [todayRoses, setTodayRoses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingAchievement, setSavingAchievement] = useState(false);
    const [savingRose, setSavingRose] = useState(false);
    const [savingSchoolInfo, setSavingSchoolInfo] = useState(false);
    const [message, setMessage] = useState("");

    const [schoolForm, setSchoolForm] = useState({
        schoolName: "", tagline: "", about: "", phone: "",
        email: "", address: "", mapLink: ""
    });

    const [achievementForm, setAchievementForm] = useState({
        title: "", description: "", achievementDate: today, photo: null
    });

    const [roseForm, setRoseForm] = useState({
        studentId: "", title: "Today's Rose", reason: "",
        awardDate: today, photo: null
    });

    const selectedStudent = students.find(
        (student) => student._id === roseForm.studentId
    );

    const serverUrl = (
        import.meta.env.VITE_API_URL || ""
    ).replace(/\/api\/?$/, "");

    const loadData = async () => {
        try {
            setLoading(true);

            const [studentsRes, achievementsRes, rosesRes, schoolRes] =
                await Promise.all([
                    api.get("/students/all"),
                    getAllAchievements(),
                    getAllTodayRoses(),
                    getSchoolInfo()
                ]);

            setStudents(studentsRes.data.students || []);
            setAchievements(achievementsRes.achievements || []);
            setTodayRoses(rosesRes.todayRoses || []);

            if (schoolRes.schoolInfo) {
                setSchoolForm({
                    schoolName: schoolRes.schoolInfo.schoolName || "",
                    tagline: schoolRes.schoolInfo.tagline || "",
                    about: schoolRes.schoolInfo.about || "",
                    phone: schoolRes.schoolInfo.phone || "",
                    email: schoolRes.schoolInfo.email || "",
                    address: schoolRes.schoolInfo.address || "",
                    mapLink: schoolRes.schoolInfo.mapLink || ""
                });
            }
        } catch (error) {
            setMessage(error.response?.data?.message ||
                "Unable to load home management data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSchoolSubmit = async (e) => {
        e.preventDefault();
        try {
            setSavingSchoolInfo(true);
            await updateSchoolInfo(schoolForm);
            setMessage("School information updated successfully.");
        } catch (error) {
            setMessage("Unable to update school information.");
        } finally {
            setSavingSchoolInfo(false);
        }
    };

    const handleAchievementSubmit = async (e) => {
        e.preventDefault();
        try {
            setSavingAchievement(true);
            const formData = new FormData();
            formData.append("title", achievementForm.title);
            formData.append("description", achievementForm.description);
            formData.append("achievementDate", achievementForm.achievementDate);
            if (achievementForm.photo) formData.append("photo", achievementForm.photo);
            await createAchievement(formData);
            setAchievementForm({ title: "", description: "", achievementDate: today, photo: null });
            setMessage("Achievement added successfully.");
            loadData();
        } catch (error) {
            setMessage("Unable to add achievement.");
        } finally {
            setSavingAchievement(false);
        }
    };

    const handleRoseSubmit = async (e) => {
        e.preventDefault();
        try {
            setSavingRose(true);
            const formData = new FormData();
            formData.append("studentId", roseForm.studentId);
            formData.append("title", roseForm.title);
            formData.append("reason", roseForm.reason);
            formData.append("awardDate", roseForm.awardDate);
            if (roseForm.photo) formData.append("photo", roseForm.photo);
            await saveTodayRose(formData);
            setRoseForm({ studentId: "", title: "Today's Rose", reason: "", awardDate: today, photo: null });
            setMessage("Today's Rose saved successfully.");
            loadData();
        } catch (error) {
            setMessage("Unable to save Today's Rose.");
        } finally {
            setSavingRose(false);
        }
    };

    const removeAchievement = async (id) => {
        if (!window.confirm("Delete this achievement?")) return;
        await deleteAchievement(id);
        setMessage("Achievement deleted.");
        loadData();
    };

    const removeRose = async (id) => {
        if (!window.confirm("Delete this Today's Rose record?")) return;
        await deleteTodayRose(id);
        setMessage("Today's Rose record deleted.");
        loadData();
    };

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center text-[#5B2EFF]"><Loader2 size={34} className="animate-spin" /></div>;
    }
        return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <h1 className="text-3xl font-extrabold text-slate-800">
                Home Page Management
            </h1>

            {message && (
                <div className="my-5 rounded-xl bg-indigo-50 p-3 text-indigo-700">
                    {message}
                </div>
            )}

            <form onSubmit={handleSchoolSubmit} className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow sm:grid-cols-2">
                <h2 className="text-xl font-bold sm:col-span-2">School Information</h2>

                {["schoolName", "tagline", "phone", "email", "mapLink"].map((name) => (
                    <input
                        key={name}
                        name={name}
                        type={name === "email" ? "email" : "text"}
                        value={schoolForm[name]}
                        onChange={(e) => setSchoolForm({ ...schoolForm, [name]: e.target.value })}
                        placeholder={name}
                        className="rounded-xl border p-3"
                    />
                ))}

                <textarea
                    name="about"
                    value={schoolForm.about}
                    onChange={(e) => setSchoolForm({ ...schoolForm, about: e.target.value })}
                    placeholder="About school"
                    className="rounded-xl border p-3 sm:col-span-2"
                />

                <textarea
                    name="address"
                    value={schoolForm.address}
                    onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                    placeholder="School address"
                    className="rounded-xl border p-3 sm:col-span-2"
                />

                <button className="rounded-xl bg-[#5B2EFF] p-3 font-bold text-white sm:col-span-2">
                    {savingSchoolInfo ? "Saving..." : "Save School Information"}
                </button>
            </form>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <form onSubmit={handleAchievementSubmit} className="rounded-3xl bg-white p-6 shadow space-y-4">
                    <h2 className="flex gap-2 text-xl font-bold"><Trophy /> Add Achievement</h2>

                    <input required placeholder="Title" className="w-full rounded-xl border p-3"
                        value={achievementForm.title}
                        onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })} />

                    <textarea required placeholder="Description" className="w-full rounded-xl border p-3"
                        value={achievementForm.description}
                        onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })} />

                    <input type="file" accept="image/*" className="w-full rounded-xl border p-3"
                        onChange={(e) => setAchievementForm({ ...achievementForm, photo: e.target.files[0] })} />

                    <input type="date" required className="w-full rounded-xl border p-3"
                        value={achievementForm.achievementDate}
                        onChange={(e) => setAchievementForm({ ...achievementForm, achievementDate: e.target.value })} />

                    <button className="flex w-full justify-center gap-2 rounded-xl bg-[#5B2EFF] p-3 font-bold text-white">
                        {savingAchievement ? <Loader2 className="animate-spin" /> : <Plus />}
                        Add Achievement
                    </button>
                </form>

                <form onSubmit={handleRoseSubmit} className="rounded-3xl bg-white p-6 shadow space-y-4">
                    <h2 className="flex gap-2 text-xl font-bold"><Rose /> Today&apos;s Rose</h2>

                    <select
    value={selectedClass}
    onChange={(e) => {
        setSelectedClass(e.target.value);
        setRoseForm({
            ...roseForm,
            studentId: ""
        });
    }}
    className="w-full rounded-xl border p-3"
    required
>
    <option value="">Select class</option>

    {[...new Set(
        students
            .filter((student) => student.status === "Active")
            .map(
                (student) =>
                    `Std. ${student.standard} - ${student.division}`
            )
    )].sort().map((className) => (
        <option key={className} value={className}>
            {className}
        </option>
    ))}
</select>

<select
    required
    className="w-full rounded-xl border p-3"
    value={roseForm.studentId}
    onChange={(e) =>
        setRoseForm({
            ...roseForm,
            studentId: e.target.value
        })
    }
    disabled={!selectedClass}
>
    <option value="">
        {selectedClass
            ? "Select student"
            : "Select class first"}
    </option>

    {students
        .filter((student) => {
            const studentClass =
                `Std. ${student.standard} - ${student.division}`;

            return (
                student.status === "Active" &&
                studentClass === selectedClass
            );
        })
        .map((student) => (
            <option key={student._id} value={student._id}>
                {student.fullName} - GR: {student.grNumber}
            </option>
        ))}
</select>


                    <input required placeholder="Award title" className="w-full rounded-xl border p-3"
                        value={roseForm.title}
                        onChange={(e) => setRoseForm({ ...roseForm, title: e.target.value })} />

                    <textarea required placeholder="Award reason" className="w-full rounded-xl border p-3"
                        value={roseForm.reason}
                        onChange={(e) => setRoseForm({ ...roseForm, reason: e.target.value })} />

                    <input type="file" accept="image/*" className="w-full rounded-xl border p-3"
                        onChange={(e) => setRoseForm({ ...roseForm, photo: e.target.files[0] })} />

                    <input type="date" required className="w-full rounded-xl border p-3"
                        value={roseForm.awardDate}
                        onChange={(e) => setRoseForm({ ...roseForm, awardDate: e.target.value })} />

                    <button className="flex w-full justify-center gap-2 rounded-xl bg-rose-500 p-3 font-bold text-white">
                        {savingRose ? <Loader2 className="animate-spin" /> : <Award />}
                        Save Today&apos;s Rose
                    </button>
                </form>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <section className="rounded-3xl bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-bold">Achievements</h2>

                    {achievements.map((item) => (
                        <div key={item._id} className="mb-3 flex justify-between rounded-xl bg-slate-50 p-4">
                            <div>
                                <b>{item.title}</b>
                                <p className="text-sm">{item.description}</p>
                            </div>

                            <button onClick={() => removeAchievement(item._id)} className="text-red-500">
                                <Trash2 />
                            </button>
                        </div>
                    ))}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-bold">Today&apos;s Rose History</h2>

                    {todayRoses.map((item) => (
                        <div key={item._id} className="mb-3 flex justify-between rounded-xl bg-rose-50 p-4">
                            <div>
                                <b>{item.student?.fullName || "Student"}</b>
                                <p className="text-sm">
                                    {new Date(item.awardDate).toLocaleDateString("en-IN")}
                                </p>
                            </div>

                            <button onClick={() => removeRose(item._id)} className="text-red-500">
                                <Trash2 />
                            </button>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default HomeManagement;