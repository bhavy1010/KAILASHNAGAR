import { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    BookOpen,
    BriefcaseBusiness,
    GraduationCap,
    Camera,
    Download,
    Loader2,
    MapPin,
    Pencil,
    Phone,
    Printer,
    UserRound
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getTeacherById } from "../../services/teacherService";
import { uploadTeacherPhoto } from "../../services/uploadService";

const TeacherProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const fileInputRef = useRef(null);

    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const gu = language === "gu";

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const text = {
        title: gu ? "શિક્ષક પ્રોફાઇલ" : "Teacher Profile",
        back: gu ? "પાછા જાઓ" : "Back",
        edit: gu ? "સંપાદિત કરો" : "Edit Teacher",
        download: gu ? "પ્રોફાઇલ ડાઉનલોડ કરો" : "Download Profile",
        print: gu ? "પ્રિન્ટ કરો" : "Print",
        personal: gu ? "વ્યક્તિગત માહિતી" : "Personal Information",
        professional: gu ? "વ્યાવસાયિક માહિતી" : "Professional Information",
        contact: gu ? "સંપર્ક માહિતી" : "Contact Information",
        fullName: gu ? "પૂરું નામ" : "Full Name",
        mobile: gu ? "મોબાઇલ નંબર" : "Mobile Number",
        email: gu ? "ઈમેલ" : "Email",
        gender: gu ? "લિંગ" : "Gender",
        qualification: gu ? "લાયકાત" : "Qualification",
        subject: gu ? "વિષય" : "Subject",
        experience: gu ? "અનુભવ" : "Experience",
        salary: gu ? "પગાર" : "Salary",
        address: gu ? "સરનામું" : "Address",
        joiningDate: gu ? "જોડાવાની તારીખ" : "Joining Date",
        classesHandled: gu ? "ભણાવવાના વર્ગો" : "Classes Handled",
        status: gu ? "સ્થિતિ" : "Status",
        years: gu ? "વર્ષ" : "Years"
    };

    const loadTeacher = async () => {
        try {
            setLoading(true);

            const response = await getTeacherById(id);
            setTeacher(response.teacher || response.data || response);
        } catch (error) {
            console.error(error);
            setMessage(
                error.response?.data?.message ||
                    "Unable to load teacher profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeacher();
    }, [id]);

    const getPhotoUrl = (photo) => {
        if (!photo) return "";

        if (photo.startsWith("http")) return photo;
        if (photo.startsWith("/")) return `${serverUrl}${photo}`;

        return `${serverUrl}/uploads/teachers/${photo}`;
    };

    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setMessage("Only JPG, PNG and WEBP images are allowed.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setMessage("Image size must be less than 2 MB.");
            return;
        }

        try {
            setUploading(true);
            setMessage("");

            await uploadTeacherPhoto(id, file);
            await loadTeacher();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Unable to update teacher photo."
            );
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = () => {
        const content = `
${text.title}

${text.fullName}: ${teacher.fullName}
${text.mobile}: ${teacher.mobile}
${text.email}: ${teacher.email || "—"}
${text.gender}: ${teacher.gender || "—"}
${text.qualification}: ${teacher.qualification || "—"}
${text.subject}: ${teacher.subject || "—"}
${text.experience}: ${teacher.experience || 0} ${text.years}
${text.salary}: ${teacher.salary ? `₹ ${teacher.salary}` : "—"}
${text.joiningDate}: ${
            teacher.joiningDate
                ? new Date(teacher.joiningDate).toLocaleDateString()
                : "—"
        }
${text.classesHandled}: ${
            teacher.classesHandled?.length
                ? teacher.classesHandled.join(", ")
                : "—"
        }
${text.status}: ${teacher.status || "—"}
${text.address}: ${teacher.address || "—"}
        `.trim();

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${teacher.fullName}-profile.txt`;
        link.click();

        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-full bg-[#F5F7FB] p-8 text-center">
                <h1 className="text-xl font-bold text-rose-600">
                    {message || "Teacher not found."}
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/teachers")}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                            {text.title}
                        </h1>
                        <p className="mt-2 text-slate-500">
                            {teacher.fullName}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold shadow-sm transition hover:bg-gray-100"
                    >
                        <Download size={18} />
                        {text.download}
                    </button>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold shadow-sm transition hover:bg-gray-100"
                    >
                        <Printer size={18} />
                        {text.print}
                    </button>

                    {user?.role === "admin" && (
                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/teachers/edit/${teacher._id}`)
                            }
                            className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-4 py-3 font-semibold text-white transition hover:bg-[#4724db]"
                        >
                            <Pencil size={18} />
                            {text.edit}
                        </button>
                    )}
                </div>
            </div>

            {message && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                    {message}
                </div>
            )}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-10 flex flex-col items-center">
                    <div className="relative">
                        {teacher.photo ? (
                            <img
                                src={getPhotoUrl(teacher.photo)}
                                alt={teacher.fullName}
                                className="h-36 w-36 rounded-full border-4 border-white object-cover shadow-xl"
                            />
                        ) : (
                            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-xl">
                                <UserRound size={56} />
                            </div>
                        )}

                        {user?.role === "admin" && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={uploading}
                                    className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#5B2EFF] text-white shadow-lg transition hover:bg-[#4724db]"
                                >
                                    {uploading ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Camera size={19} />
                                    )}
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </>
                        )}
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-800">
                        {teacher.fullName}
                    </h2>

                    <p className="mt-1 text-slate-500">
                        {teacher.subject || "—"}
                    </p>
                </div>

                <div className="grid gap-7 xl:grid-cols-2">
                    <InfoSection
                        title={text.personal}
                        icon={<UserRound className="text-indigo-600" />}
                        items={[
                            [text.fullName, teacher.fullName],
                            [text.gender, teacher.gender],
                            [text.mobile, teacher.mobile],
                            [text.email, teacher.email],
                            [
                                text.joiningDate,
                                teacher.joiningDate
                                    ? new Date(
                                          teacher.joiningDate
                                      ).toLocaleDateString()
                                    : "—"
                            ],
                            [
                                text.status,
                                teacher.status === "Active"
                                    ? gu
                                        ? "સક્રિય"
                                        : "Active"
                                    : gu
                                      ? "નિષ્ક્રિય"
                                      : "Inactive"
                            ]
                        ]}
                    />

                    <InfoSection
                        title={text.professional}
                        icon={<GraduationCap className="text-amber-600" />}
                        items={[
                            [text.qualification, teacher.qualification],
                            [text.subject, teacher.subject],
                            [
                                text.experience,
                                `${teacher.experience || 0} ${text.years}`
                            ],
                            [
                                text.salary,
                                teacher.salary
                                    ? `₹ ${teacher.salary}`
                                    : "—"
                            ],
                            [
                                text.classesHandled,
                                teacher.classesHandled?.length
                                    ? teacher.classesHandled.join(", ")
                                    : "—"
                            ],
                            [text.address, teacher.address]
                        ]}
                    />
                </div>
            </section>

            <section className="mt-7 grid gap-5 md:grid-cols-3">
                <StatCard
                    icon={<BriefcaseBusiness size={26} />}
                    title={text.experience}
                    value={`${teacher.experience || 0} ${text.years}`}
                    color="bg-indigo-100 text-indigo-600"
                />

                <StatCard
                    icon={<BookOpen size={26} />}
                    title={text.classesHandled}
                    value={teacher.classesHandled?.length || 0}
                    color="bg-emerald-100 text-emerald-600"
                />

                <StatCard
                    icon={<Phone size={26} />}
                    title={text.mobile}
                    value={teacher.mobile}
                    color="bg-amber-100 text-amber-600"
                />
            </section>

            <section className="mt-7 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-green-100 p-3">
                            <Phone className="text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold">
                            {text.contact}
                        </h2>
                    </div>

                    <a
                        href={`tel:${teacher.mobile}`}
                        className="font-semibold text-[#5B2EFF] hover:underline"
                    >
                        {teacher.mobile}
                    </a>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-orange-100 p-3">
                            <MapPin className="text-orange-600" />
                        </div>
                        <h2 className="text-xl font-bold">{text.address}</h2>
                    </div>

                    <p className="leading-7 text-slate-600">
                        {teacher.address || "—"}
                    </p>
                </div>
            </section>
        </div>
    );
};

const InfoSection = ({ title, icon, items }) => (
    <div>
        <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">{icon}</div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
            {items.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {label}
                    </p>
                    <p className="mt-1 break-words font-semibold text-slate-800">
                        {value || "—"}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

const StatCard = ({ icon, title, value, color }) => (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
            <div className={`rounded-2xl p-3 ${color}`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-500">
                    {title}
                </p>
                <p className="truncate text-xl font-extrabold text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    </div>
);

export default TeacherProfile;