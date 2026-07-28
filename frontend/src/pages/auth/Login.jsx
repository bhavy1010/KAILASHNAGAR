import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle,
    Eye,
    EyeOff,
    GraduationCap,
    IdCard,
    Languages,
    Loader2,
    Lock,
    School,
    ShieldCheck,
    Smartphone,
    Users
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import SchoolIllustration from "../../assets/svg/school-login.svg";

const ROLE_LABEL_GU = {
    student: "વિદ્યાર્થી",
    teacher: "શિક્ષક",
    admin: "એડમિન"
};

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [role, setRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        brandName: isGujarati ? "કૈલાસનગર ERP" : "KailashNagar ERP",
        welcomeBack: isGujarati ? "પાછા સ્વાગત છે" : "Welcome Back",
        heroDescription: isGujarati
            ? "એક જ સુરક્ષિત ડેશબોર્ડ પરથી વિદ્યાર્થીઓ, શિક્ષકો, હાજરી, ગૃહકાર્ય, પરીક્ષાઓ અને શાળા વહીવટનું સંચાલન કરો."
            : "Manage students, teachers, attendance, homework, exams and school administration from one secure dashboard.",
        students: isGujarati ? "વિદ્યાર્થીઓ" : "Students",
        teachers: isGujarati ? "શિક્ષકો" : "Teachers",
        classrooms: isGujarati ? "વર્ગખંડો" : "Classrooms",
        signIn: isGujarati ? "સાઇન ઇન" : "Sign In",
        signInDescription: isGujarati
            ? "તમારા કૈલાસનગર સ્કૂલ ERP ડેશબોર્ડ પર ચાલુ રાખવા માટે સાઇન ઇન કરો."
            : "Sign in to continue to your KailashNagar School ERP dashboard.",
        loginAs: isGujarati ? "લોગિન કરો આ રીતે" : "Login As",
        studentHint: isGujarati
            ? "વિદ્યાર્થી ID તમારો GR નંબર છે. પાસવર્ડ તમારી જન્મ તારીખ DDMMYY ફોર્મેટમાં છે. ઉદાહરણ: 10/10/2005 = 101005."
            : "Student ID is your GR Number. Password is your date of birth in DDMMYY format. Example: 10/10/2005 = 101005.",
        grNumber: isGujarati ? "GR નંબર" : "GR Number",
        mobileNumber: isGujarati ? "મોબાઇલ નંબર" : "Mobile Number",
        enterGrNumber: isGujarati ? "GR નંબર દાખલ કરો" : "Enter GR Number",
        enterMobileNumber: isGujarati ? "મોબાઇલ નંબર દાખલ કરો" : "Enter Mobile Number",
        password: isGujarati ? "પાસવર્ડ" : "Password",
        enterPassword: isGujarati ? "પાસવર્ડ દાખલ કરો" : "Enter Password",
        forgotAdminPassword: isGujarati
            ? "એડમિન પાસવર્ડ ભૂલી ગયા?"
            : "Forgot Admin Password?",
        teacherForgotHint: isGujarati
            ? "પાસવર્ડ ભૂલી ગયા? કૃપા કરીને એડમિનનો સંપર્ક કરો."
            : "Forgot password? Please contact the Admin.",
        loggingIn: isGujarati ? "લોગિન થઈ રહ્યું છે..." : "Logging In...",
        login: isGujarati ? "લોગિન" : "Login",
        newAdmin: isGujarati ? "નવા એડમિનિસ્ટ્રેટર?" : "New administrator?",
        createAdminAccount: isGujarati
            ? "એડમિન એકાઉન્ટ બનાવો"
            : "Create Admin Account",
        secureLogin: isGujarati
            ? "વિદ્યાર્થીઓ, શિક્ષકો અને એડમિન માટે સુરક્ષિત લોગિન"
            : "Secure Login for Students, Teachers & Admin",
        loginFailed: isGujarati
            ? "લોગિન નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો."
            : "Login failed. Please try again.",
        goodMorning: isGujarati ? "સુપ્રભાત ☀️" : "Good Morning ☀️",
        goodAfternoon: isGujarati ? "શુભ બપોર 🌤️" : "Good Afternoon 🌤️",
        goodEvening: isGujarati ? "શુભ સાંજ 🌙" : "Good Evening 🌙"
    };

    const featuresList = [
        {
            en: "Student Management",
            gu: "વિદ્યાર્થી વ્યવસ્થાપન"
        },
        {
            en: "Attendance Tracking",
            gu: "હાજરી ટ્રેકિંગ"
        },
        {
            en: "Homework & Assignments",
            gu: "ગૃહકાર્ય અને સોંપણીઓ"
        },
        {
            en: "Exam & Result Management",
            gu: "પરીક્ષા અને પરિણામ વ્યવસ્થાપન"
        }
    ];

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return text.goodMorning;
        if (hour < 17) return text.goodAfternoon;

        return text.goodEvening;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isGujarati]);

    const roleLabel = (r) => (isGujarati ? ROLE_LABEL_GU[r] || r : r);

    const selectRole = (selectedRole) => {
        setRole(selectedRole);
        setIdentifier("");
        setPassword("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login({
                role,
                identifier: identifier.trim(),
                password
            });

            if (response.success) {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || text.loginFailed);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            icon: <Users size={20} />,
            value: "500+",
            title: text.students
        },
        {
            icon: <GraduationCap size={20} />,
            value: "30+",
            title: text.teachers
        },
        {
            icon: <School size={20} />,
            value: "25+",
            title: text.classrooms
        }
    ];

    const isStudent = role === "student";
    const isAdmin = role === "admin";

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#2B1CFF] via-[#4328FF] to-[#5D1FFF]">
            {/* ============================== Left Panel ============================== */}

            <div className="hidden w-1/2 flex-col justify-between p-10 text-white lg:flex xl:p-14">
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-md">
                            <ShieldCheck size={28} />

                            <span className="text-xl font-bold xl:text-2xl">
                                {text.brandName}
                            </span>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                        >
                            <Languages size={16} />
                            {text.switchLang}
                        </button>
                    </div>

                    <h2 className="mt-10 text-xl font-extrabold leading-tight">
                        {greeting}
                    </h2>

                    <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                        {text.welcomeBack}
                    </h1>

                    <p className="mt-6 max-w-xl text-base leading-8 text-white/80 xl:text-lg">
                        {text.heroDescription}
                    </p>
                </div>

                <div className="flex items-center justify-center">
                    <div className="mr-10 mt-2 space-y-4 xl:mr-20">
                        {featuresList.map((item) => (
                            <div key={item.en} className="flex items-center gap-3">
                                <CheckCircle size={18} className="shrink-0 text-green-400" />

                                <span>{isGujarati ? item.gu : item.en}</span>
                            </div>
                        ))}
                    </div>

                    <img
                        src={SchoolIllustration}
                        alt="School"
                        className="h-50 w-full max-w-xl"
                    />
                </div>

                <div className="grid grid-cols-3 gap-5">
                    {stats.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-white/10 bg-white/10 p-5 text-center backdrop-blur-md"
                        >
                            <div className="mb-3 flex justify-center">{item.icon}</div>

                            <h3 className="text-2xl font-bold">{item.value}</h3>

                            <p className="text-sm text-white/70">{item.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ============================== Right Panel — Form ============================== */}

            <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-10">
                    <div className="mb-2 flex items-start justify-between gap-3 lg:hidden">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={22} className="text-[#5B2EFF]" />
                            <span className="text-sm font-bold text-gray-700">
                                {text.brandName}
                            </span>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-[#5B2EFF] hover:text-[#5B2EFF]"
                        >
                            <Languages size={14} />
                            {text.switchLang}
                        </button>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                                {text.signIn}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-400">
                                {text.signInDescription}
                            </p>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="hidden shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#5B2EFF] hover:text-[#5B2EFF] lg:flex"
                        >
                            <Languages size={16} />
                            {text.switchLang}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="mt-6">
                        <label className="mb-3 block text-sm font-semibold text-gray-700">
                            {text.loginAs}
                        </label>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {["student", "teacher", "admin"].map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => selectRole(item)}
                                    className={`h-11 rounded-xl border text-sm font-semibold capitalize transition ${
                                        role === item
                                            ? "border-[#5B2EFF] bg-[#5B2EFF] text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {roleLabel(item)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isStudent && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
                            {text.studentHint}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                {isStudent ? text.grNumber : text.mobileNumber}
                            </label>

                            <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                                {isStudent ? (
                                    <IdCard size={18} className="shrink-0 text-gray-400" />
                                ) : (
                                    <Smartphone size={18} className="shrink-0 text-gray-400" />
                                )}

                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={
                                        isStudent
                                            ? text.enterGrNumber
                                            : text.enterMobileNumber
                                    }
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                {text.password}
                            </label>

                            <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                                <Lock size={18} className="shrink-0 text-gray-400" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={text.enterPassword}
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="shrink-0 text-gray-500"
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="min-h-5 text-right text-sm">
                            {isAdmin && (
                                <Link
                                    to="/admin/forgot-password"
                                    className="font-semibold text-[#5B2EFF] hover:underline"
                                >
                                    {text.forgotAdminPassword}
                                </Link>
                            )}

                            {role === "teacher" && (
                                <p className="text-xs text-gray-500">
                                    {text.teacherForgotHint}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#6A2BFF] via-[#5B2EFF] to-[#3A63FF] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {text.loggingIn}
                                </>
                            ) : (
                                <>
                                    {text.login}
                                    <ArrowRight
                                        size={18}
                                        className="transition group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />

                        <span className="text-xs text-gray-400">
                            {isGujarati ? "કૈલાસનગર ERP" : "KAILASHNAGAR ERP"}
                        </span>

                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        {isAdmin ? (
                            <>
                                {text.newAdmin}{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-[#5B2EFF] hover:underline"
                                >
                                    {text.createAdminAccount}
                                </Link>
                            </>
                        ) : (
                            text.secureLogin
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;