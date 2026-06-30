import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    CheckCircle,
    ShieldCheck,
    Users,
    GraduationCap,
    School,
    IdCard,
    Lock,
    Smartphone,
    ArrowRight,
    Loader2
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import SchoolIllustration from "../../assets/svg/school-login.svg";

const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [role, setRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const greeting = useMemo(() => {

        const hour = new Date().getHours();

        if (hour < 12) return "Good Morning ☀️";
        if (hour < 17) return "Good Afternoon 🌤️";

        return "Good Evening 🌙";

    }, []);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            setLoading(true);

            const response = await login({
                role,
                identifier,
                password
            });

            console.log("Login Response:", response);

            if (response.success) {

                console.log("Navigating...");

                navigate("/dashboard");

            }

        } catch (err) {

            setError(

                err.response?.data?.message ||

                "Login Failed"

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

    return (

        <div className="min-h-screen bg-gradient-to-br from-[#2B1CFF] via-[#4328FF] to-[#5D1FFF] flex">

            {/* Left Side */}

            <div className="hidden lg:flex w-1/2 p-14 text-white flex-col justify-between">

                <div>

                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">

                        <ShieldCheck size={28} />

                        <span className="text-2xl font-bold">

                            KailashNagar ERP

                        </span>

                    </div>

                    <h1 className="mt-10 text-xl font-extrabold leading-tight">

                        {greeting}

                        <br />

                        

                    </h1>
                    <h1 className=" text-5xl font-extrabold leading-tight">Welcome Back</h1>

                    <p className="mt-6 text-lg text-white/80 max-w-xl leading-8">

                        Manage Students, Teachers, Attendance,
                        Homework, Exams and School Administration
                        from one secure dashboard.

                    </p>

                    

                </div>
                <div className="flex justify-center items-center">
                    <div className="mt-2 space-y-4 mr-20 ">

                        {

                            features.map((item, index) => (

                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >

                                    <CheckCircle
                                        size={18}
                                        className="text-green-400"
                                    />

                                    <span>

                                        {item}

                                    </span>

                                </div>

                            ))

                        }

                    </div>

                    <div>

                    <img
                        src={SchoolIllustration}
                        alt="School"
                        className="w-full h-50 max-w-xl mx-auto"
                    />

                    
                </div>
                </div>
                
                <div className="grid grid-cols-3 gap-5 ">

                        {

                            stats.map((item, index) => (

                                <div
                                    key={index}
                                    className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-5 text-center"
                                >

                                    <div className="flex justify-center mb-3">

                                        {item.icon}

                                    </div>

                                    <h3 className="text-2xl font-bold">

                                        {item.value}

                                    </h3>

                                    <p className="text-sm text-white/70">

                                        {item.title}

                                    </p>

                                </div>

                            ))

                        }

                    </div>


            </div>

            {/* Right Side */}

            <div className="flex-1 flex items-center justify-center p-8">

                <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-10">

                    <h2 className="text-4xl font-bold text-gray-800">

                        Sign In

                    </h2>

                    <p className="mt-2 text-sm text-gray-400 leading-6">

                        Sign in to continue to your KailashNagar School ERP dashboard.

                    </p>

                    {

                        error && (

                            <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm font-medium">

                                {error}

                            </div>

                        )

                    }

                    <div className="mt-6">

                        <label className="block mb-3 text-sm font-semibold text-gray-700">

                            Login As

                        </label>

                        <div className="grid grid-cols-3 gap-3">

                            <button
                                type="button"
                                onClick={() => {
                                    setRole("student");
                                    setIdentifier("");
                                }}
                                className={`h-11 rounded-xl border font-semibold transition ${
                                    role === "student"
                                    ? "bg-[#5B2EFF] text-white border-[#5B2EFF]"
                                    : "bg-white hover:bg-gray-50"
                                }`}
                            >

                                Student

                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setRole("teacher");
                                    setIdentifier("");
                                }}
                                className={`h-11 rounded-xl border font-semibold transition ${
                                    role === "teacher"
                                    ? "bg-[#5B2EFF] text-white border-[#5B2EFF]"
                                    : "bg-white hover:bg-gray-50"
                                }`}
                            >

                                Teacher

                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setRole("admin");
                                    setIdentifier("");
                                }}
                                className={`h-11 rounded-xl border font-semibold transition ${
                                    role === "admin"
                                    ? "bg-[#5B2EFF] text-white border-[#5B2EFF]"
                                    : "bg-white hover:bg-gray-50"
                                }`}
                            >

                                Admin

                            </button>

                        </div>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-7 flex flex-col gap-5"
                    >
                                                <div>

                            <label className="block mb-2 text-sm font-semibold text-gray-700">

                                {role === "student" ? "GR Number" : "Mobile Number"}

                            </label>

                            <div className="flex items-center gap-3 h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">

                                {

                                    role === "student"

                                        ? <IdCard size={18} className="text-gray-400" />

                                        : <Smartphone size={18} className="text-gray-400" />

                                }

                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={role === "student" ? "Enter GR Number" : "Enter Mobile Number"}
                                    className="flex-1 bg-transparent outline-none text-sm"
                                    required
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-semibold text-gray-700">

                                Password

                            </label>

                            <div className="flex items-center gap-3 h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">

                                <Lock size={18} className="text-gray-400" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password"
                                    className="flex-1 bg-transparent outline-none text-sm"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >

                                    {

                                        showPassword

                                            ? <EyeOff size={18} />

                                            : <Eye size={18} />

                                    }

                                </button>

                            </div>

                        </div>

                        <div className="flex items-center justify-between">

                            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">

                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={() => setRemember(!remember)}
                                    className="accent-[#5B2EFF]"
                                />

                                Remember Me

                            </label>

                            <button
                                type="button"
                                className="text-[#5B2EFF] text-sm font-semibold hover:underline"
                            >

                                Forgot Password?

                            </button>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex items-center justify-center gap-3 h-12 rounded-xl bg-gradient-to-r from-[#6A2BFF] via-[#5B2EFF] to-[#3A63FF] text-white font-semibold transition hover:opacity-90 disabled:opacity-70"
                        >

                            {

                                loading ? (

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
                                            className="group-hover:translate-x-1 transition"
                                        />

                                    </>

                                )

                            }

                        </button>

                    </form>

                    <div className="my-6 flex items-center gap-3">

                        <div className="h-px flex-1 bg-gray-200"></div>

                        <span className="text-xs text-gray-400">

                            KAILASHNAGAR ERP

                        </span>

                        <div className="h-px flex-1 bg-gray-200"></div>

                    </div>

                    <p className="text-center text-sm text-gray-500">

                        Secure Login for Students, Teachers & Admin

                    </p>

                </div>

            </div>

        </div>

    );

};

export default Login;