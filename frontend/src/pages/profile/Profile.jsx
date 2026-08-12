import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    GraduationCap,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Trophy,
    BarChart3,
    CheckCircle2,
    Star,
    Hash,
    Camera,
    ArrowLeft,
    Mail,
    Award,
    Briefcase,
    ShieldCheck,
    Layers,
    Video
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import CameraModal from "../../components/CameraModal";
import { getStudentById } from "../../services/studentService";
import { getTeacherById } from "../../services/teacherService";
import { getStudentAttempts } from "../../services/quizService";
import { getPhotoUrl } from "../../utils/photoUrl";
import {
    uploadStudentPhoto,
    uploadTeacherPhoto,
    uploadAdminPhoto
} from "../../services/uploadService";
import { fetchCurrentUser } from "../../services/authService";

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const role = (user?.role || "student").toLowerCase();
    const isStudent = role === "student";
    const isTeacher = role === "teacher";
    const isAdmin = role === "admin";

    const [profileData, setProfileData] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [user?.id, role]);

    const loadProfile = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            if (isStudent) {
                const res = await getStudentById(user.id);
                if (res.success) {
                    setProfileData(res.student);
                }
                const attRes = await getStudentAttempts();
                if (attRes.success) {
                    setAttempts(attRes.attempts || []);
                }
            } else if (isTeacher) {
                const res = await getTeacherById(user.id);
                if (res.success) {
                    setProfileData(res.teacher);
                }
            } else if (isAdmin) {
                setProfileData({
                    fullName: user.name || "Administrator",
                    mobile: user.mobile || "N/A",
                    role: "admin",
                    photo: user.photo || ""
                });
            }
        } catch (err) {
            setError("Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file (JPG, PNG, WEBP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be under 5MB.");
            return;
        }

        // Show instant preview
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);

        setUploadingPhoto(true);
        setError("");
        try {
            let res;
            if (isStudent) {
                res = await uploadStudentPhoto(user.id, file);
            } else if (isTeacher) {
                res = await uploadTeacherPhoto(user.id, file);
            } else if (isAdmin) {
                res = await uploadAdminPhoto(user.id, file);
            }

            if (res?.success) {
                setSuccessMsg("Profile photo updated successfully!");
                if (refreshUser) {
                    await refreshUser();
                }
                loadProfile();
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload photo.");
            setPhotoPreview(null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Quiz statistics for Student
    const completedAttempts = attempts.filter(a => a.status === "completed");
    const avgScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAttempts.length)
        : 0;
    const bestScore = completedAttempts.length > 0
        ? Math.max(...completedAttempts.map(a => a.percentage || 0))
        : 0;

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <Loader />
            </div>
        );
    }

    const displayName = profileData?.fullName || profileData?.name || user?.name || user?.fullName || "User Profile";
    const rawPhoto = profileData?.photo || user?.photo || "";
    const currentPhotoUrl = photoPreview || (rawPhoto ? getPhotoUrl(rawPhoto, role) : "");

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="My Profile"
                subtitle={`Manage your profile information and photo (${role.toUpperCase()})`}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </PageHeader>

            {/* Alerts */}
            {successMsg && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-600 dark:text-emerald-400">
                    <p className="text-sm font-semibold">{successMsg}</p>
                    <button onClick={() => setSuccessMsg("")} className="text-xs font-bold">✕</button>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-600 dark:text-rose-400">
                    <p className="text-sm font-semibold">{error}</p>
                    <button onClick={() => setError("")} className="text-xs font-bold">✕</button>
                </div>
            )}

            {/* Header Hero Card */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 shadow-2xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/10 translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Photo + Change Photo Button */}
                    <div className="relative shrink-0">
                        <div className="h-28 w-28 rounded-3xl overflow-hidden ring-4 ring-indigo-400/40 shadow-2xl shadow-indigo-500/30 bg-slate-800">
                            {currentPhotoUrl ? (
                                <img
                                    src={currentPhotoUrl}
                                    alt={displayName}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.target.style.display = "none"; }}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-4xl font-black text-white">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Photo Upload Trigger Button ONLY for Teacher & Admin (Students cannot change profile photo) */}
                        {!isStudent && (
                            <div className="flex items-center gap-1 absolute -bottom-2 -right-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCameraOpen(true)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition ring-2 ring-slate-900"
                                    title="Take Photo with Live Camera"
                                >
                                    <Video className="h-4 w-4" />
                                </button>

                                <label
                                    htmlFor="profilePhotoInput"
                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-500 shadow-lg hover:bg-indigo-600 transition ring-2 ring-slate-900"
                                    title="Upload Photo from Gallery"
                                >
                                    {uploadingPhoto ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4 text-white" />
                                    )}
                                    <input
                                        id="profilePhotoInput"
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                        disabled={uploadingPhoto}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    <CameraModal
                        isOpen={isCameraOpen}
                        onClose={() => setIsCameraOpen(false)}
                        onCapture={(file) => {
                            handlePhotoChange({ target: { files: [file] } });
                        }}
                    />

                    {/* Basic Info */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <h2 className="text-2xl font-black text-white">{displayName}</h2>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-200 border border-indigo-500/40 uppercase tracking-wider">
                                {role}
                            </span>

                            {isStudent && profileData?.standard && (
                                <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs font-bold text-purple-200 border border-purple-500/40">
                                    Standard {profileData.standard} - Div {profileData.division}
                                </span>
                            )}

                            {isStudent && profileData?.grNumber && (
                                <span className="rounded-full bg-slate-500/30 px-3 py-1 text-xs font-bold text-slate-200 border border-slate-500/40 flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    GR: {profileData.grNumber}
                                </span>
                            )}

                            {isTeacher && profileData?.subject && (
                                <span className="rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-200 border border-emerald-500/40 flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    Subject: {profileData.subject}
                                </span>
                            )}

                            {isAdmin && (
                                <span className="rounded-full bg-amber-500/30 px-3 py-1 text-xs font-bold text-amber-200 border border-amber-500/40 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    Full Administrator Access
                                </span>
                            )}
                        </div>

                        {profileData?.joiningDate && (
                            <p className="text-xs text-indigo-300 font-medium">
                                Joined: {formatDate(profileData.joiningDate)}
                            </p>
                        )}
                        {profileData?.admissionDate && (
                            <p className="text-xs text-indigo-300 font-medium">
                                Admitted: {formatDate(profileData.admissionDate)}
                            </p>
                        )}
                    </div>

                    {/* Quiz summary badges for Students */}
                    {isStudent && completedAttempts.length > 0 && (
                        <div className="flex gap-3 shrink-0">
                            <div className="text-center bg-white/10 rounded-2xl p-3 border border-white/10">
                                <p className="text-2xl font-black text-amber-400">{bestScore}%</p>
                                <p className="text-xs text-slate-300 font-semibold mt-1">Best Score</p>
                            </div>
                            <div className="text-center bg-white/10 rounded-2xl p-3 border border-white/10">
                                <p className="text-2xl font-black text-indigo-300">{completedAttempts.length}</p>
                                <p className="text-xs text-slate-300 font-semibold mt-1">Quizzes Done</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Information Card */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-500" />
                        Account & Details
                    </h3>

                    <div className="space-y-3">
                        {isStudent && [
                            { icon: User, label: "Full Name", value: profileData?.fullName },
                            { icon: GraduationCap, label: "Father's Name", value: profileData?.fatherName },
                            { icon: User, label: "Mother's Name", value: profileData?.motherName },
                            { icon: Calendar, label: "Date of Birth", value: formatDate(profileData?.dateOfBirth) },
                            { icon: User, label: "Gender", value: profileData?.gender },
                            { icon: Phone, label: "Parent Mobile", value: profileData?.parentMobile },
                            { icon: MapPin, label: "Address", value: profileData?.address },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                    <Icon className="h-3.5 w-3.5 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 break-words">
                                        {value || "—"}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isTeacher && [
                            { icon: User, label: "Full Name", value: profileData?.fullName },
                            { icon: Phone, label: "Mobile Number", value: profileData?.mobile },
                            { icon: Mail, label: "Email Address", value: profileData?.email },
                            { icon: Award, label: "Qualification", value: profileData?.qualification },
                            { icon: BookOpen, label: "Main Subject", value: profileData?.subject },
                            { icon: Briefcase, label: "Experience", value: `${profileData?.experience || 0} Years` },
                            { icon: Layers, label: "Classes Handled", value: profileData?.classesHandled?.join(", ") },
                            { icon: Calendar, label: "Joining Date", value: formatDate(profileData?.joiningDate) },
                            { icon: MapPin, label: "Address", value: profileData?.address },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                    <Icon className="h-3.5 w-3.5 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 break-words">
                                        {value || "—"}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isAdmin && [
                            { icon: User, label: "Full Name", value: profileData?.fullName },
                            { icon: Phone, label: "Mobile Number", value: profileData?.mobile },
                            { icon: ShieldCheck, label: "System Role", value: "School Administrator" },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                    <Icon className="h-3.5 w-3.5 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 break-words">
                                        {value || "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Quiz stats for Student OR System Overview for Teacher/Admin */}
                {isStudent ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Total Attempts", value: completedAttempts.length, color: "indigo", icon: BookOpen },
                                { label: "Avg Score", value: `${avgScore}%`, color: "purple", icon: BarChart3 },
                                { label: "Best Score", value: `${bestScore}%`, color: "amber", icon: Trophy },
                                { label: "Quizzes Tried", value: attempts.length, color: "emerald", icon: CheckCircle2 },
                            ].map(({ label, value, color, icon: Icon }) => (
                                <div
                                    key={label}
                                    className={`rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-100 dark:border-${color}-900/40 p-4 text-center`}
                                >
                                    <Icon className={`h-5 w-5 text-${color}-500 mx-auto mb-1.5`} />
                                    <p className={`text-2xl font-black text-${color}-700 dark:text-${color}-300`}>{value}</p>
                                    <p className={`text-xs font-bold text-${color}-500/70 mt-1`}>{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Star className="h-4 w-4 text-amber-500" />
                                Recent Quiz Attempts
                            </h3>

                            {completedAttempts.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">
                                    No quiz attempts yet. Head to the Quiz section to start!
                                </p>
                            ) : (
                                <div className="space-y-2.5">
                                    {completedAttempts.slice(0, 5).map((att) => (
                                        <div
                                            key={att._id}
                                            onClick={() => navigate(`/quiz/result/${att._id}`)}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                                    {att.quiz?.title || "Quiz"}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {att.quiz?.subject} • {formatDate(att.completedAt)}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-black ${
                                                    att.percentage >= 80
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : att.percentage >= 50
                                                            ? "text-amber-600 dark:text-amber-400"
                                                            : "text-rose-600 dark:text-rose-400"
                                                }`}>
                                                    {att.percentage}%
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {att.score}/{att.totalQuestions}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            Role & Quick Actions
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {isTeacher && "As a Teacher, you have access to class management, student records, homework assignment, timetable, notices, and quiz creation."}
                            {isAdmin && "As a School Administrator, you have full control over student & teacher accounts, system settings, academic terms, and school portal content."}
                        </p>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                            >
                                <BarChart3 className="h-4 w-4" />
                                Go to Dashboard
                            </button>

                            <button
                                onClick={() => navigate("/quiz")}
                                className="flex items-center gap-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 px-4 py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition"
                            >
                                <Trophy className="h-4 w-4" />
                                Quiz Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;