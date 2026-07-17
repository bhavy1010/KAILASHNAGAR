import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle,
    Eye,
    EyeOff,
    GraduationCap,
    IdCard,
    Loader2,
    Lock,
    School,
    ShieldCheck,
    Smartphone,
    Users
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import SchoolIllustration from "../../assets/svg/school-login.svg";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good Morning ☀️";
        if (hour < 17) return "Good Afternoon 🌤️";

        return "Good Evening 🌙";
    }, []);

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
            setError(
                err.response?.data?.message ||
                "Login failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    const features = [
        "Student Management",
        "Attendance Tracking",
        "Homework & Assignments",
        "Exam & Result Management"
    ];

    const stats = [
        {
            icon: <Users size={20} />,
            value: "500+",
            title: "Students"
        },
        {
            icon: <GraduationCap size={20} />,
            value: "30+",
            title: "Teachers"
        },
        {
            icon: <School size={20} />,
            value: "25+",
            title: "Classrooms"
        }
    ];

    const isStudent = role === "student";
    const isAdmin = role === "admin";

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2B1CFF] via-[#4328FF] to-[#5D1FFF] flex">
            <div className="hidden w-1/2 flex-col justify-between p-14 text-white lg:flex">
                <div>
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-md">
                        <ShieldCheck size={28} />

                        <span className="text-2xl font-bold">
                            KailashNagar ERP
                        </span>
                    </div>

                    <h2 className="mt-10 text-xl font-extrabold leading-tight">
                        {greeting}
                    </h2>

                    <h1 className="text-5xl font-extrabold leading-tight">
                        Welcome Back
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
                        Manage students, teachers, attendance, homework, exams
                        and school administration from one secure dashboard.
                    </p>
                </div>

                <div className="flex items-center justify-center">
                    <div className="mr-20 mt-2 space-y-4">
                        {features.map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >
                                <CheckCircle
                                    size={18}
                                    className="text-green-400"
                                />

                                <span>{item}</span>
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
                            <div className="mb-3 flex justify-center">
                                {item.icon}
                            </div>

                            <h3 className="text-2xl font-bold">
                                {item.value}
                            </h3>

                            <p className="text-sm text-white/70">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
                    <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                        Sign In
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                        Sign in to continue to your KailashNagar School ERP
                        dashboard.
                    </p>

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="mt-6">
                        <label className="mb-3 block text-sm font-semibold text-gray-700">
                            Login As
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
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isStudent && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
                            Student ID is your GR Number. Password is your date
                            of birth in DDMMYY format. Example: 10/10/2005 =
                            101005.
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 flex flex-col gap-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                {isStudent ? "GR Number" : "Mobile Number"}
                            </label>

                            <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                                {isStudent ? (
                                    <IdCard
                                        size={18}
                                        className="text-gray-400"
                                    />
                                ) : (
                                    <Smartphone
                                        size={18}
                                        className="text-gray-400"
                                    />
                                )}

                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) =>
                                        setIdentifier(e.target.value)
                                    }
                                    placeholder={
                                        isStudent
                                            ? "Enter GR Number"
                                            : "Enter Mobile Number"
                                    }
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Password
                            </label>

                            <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                                <Lock
                                    size={18}
                                    className="text-gray-400"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter Password"
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="text-gray-500"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
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
                                    Forgot Admin Password?
                                </Link>
                            )}

                            {role === "teacher" && (
                                <p className="text-xs text-gray-500">
                                    Forgot password? Please contact the Admin.
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
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Logging In...
                                </>
                            ) : (
                                <>
                                    Login
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
                            KAILASHNAGAR ERP
                        </span>

                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        {isAdmin ? (
                            <>
                                New administrator?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-[#5B2EFF] hover:underline"
                                >
                                    Create Admin Account
                                </Link>
                            </>
                        ) : (
                            "Secure Login for Students, Teachers & Admin"
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;