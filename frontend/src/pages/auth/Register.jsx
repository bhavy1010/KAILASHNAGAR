import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Languages,
    Loader2,
    Lock,
    ShieldCheck,
    Smartphone,
    UserRound
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        secretCode: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        createAdminAccount: isGujarati ? "એડમિન એકાઉન્ટ બનાવો" : "Create Admin Account",
        subtitle: isGujarati
            ? "નવું એડમિનિસ્ટ્રેટર એકાઉન્ટ બનાવવા માટે શાળા એડમિન સિક્રેટ કોડ દાખલ કરો."
            : "Enter the school Admin secret code to create a new administrator account.",
        redirecting: isGujarati ? "લોગિન પર રીડાયરેક્ટ થઈ રહ્યું છે..." : "Redirecting to login...",
        fullName: isGujarati ? "પૂરું નામ" : "Full Name",
        enterFullName: isGujarati ? "પૂરું નામ દાખલ કરો" : "Enter full name",
        mobileNumber: isGujarati ? "મોબાઇલ નંબર" : "Mobile Number",
        enterMobileNumber: isGujarati ? "મોબાઇલ નંબર દાખલ કરો" : "Enter mobile number",
        adminSecretCode: isGujarati ? "એડમિન સિક્રેટ કોડ" : "Admin Secret Code",
        enterSecretCode: isGujarati
            ? "6-અંકનો સિક્રેટ કોડ દાખલ કરો"
            : "Enter 6-digit secret code",
        password: isGujarati ? "પાસવર્ડ" : "Password",
        createPassword: isGujarati ? "પાસવર્ડ બનાવો" : "Create password",
        confirmPassword: isGujarati ? "પાસવર્ડની પુષ્ટિ કરો" : "Confirm Password",
        confirmPasswordPlaceholder: isGujarati ? "પાસવર્ડની પુષ્ટિ કરો" : "Confirm password",
        creatingAccount: isGujarati ? "એકાઉન્ટ બનાવી રહ્યું છે..." : "Creating Account...",
        alreadyHaveAccount: isGujarati ? "પહેલેથી એકાઉન્ટ છે?" : "Already have an account?",
        signIn: isGujarati ? "સાઇન ઇન" : "Sign In",
        passwordLengthError: isGujarati
            ? "પાસવર્ડમાં ઓછામાં ઓછા 6 અક્ષરો હોવા જોઈએ."
            : "Password must contain at least 6 characters.",
        passwordMismatchError: isGujarati
            ? "પાસવર્ડ અને પુષ્ટિ પાસવર્ડ મેળ ખાતા નથી."
            : "Password and confirm password do not match.",
        accountCreatedSuccess: isGujarati
            ? "એડમિન એકાઉન્ટ સફળતાપૂર્વક બનાવવામાં આવ્યું."
            : "Admin account created successfully.",
        createError: isGujarati
            ? "એડમિન એકાઉન્ટ બનાવી શકાયું નથી."
            : "Unable to create the admin account."
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password.length < 6) {
            setError(text.passwordLengthError);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(text.passwordMismatchError);
            return;
        }

        try {
            setLoading(true);

            const response = await register({
                name: formData.name.trim(),
                mobile: formData.mobile.trim(),
                password: formData.password,
                secretCode: formData.secretCode.trim()
            });

            if (response.success) {
                setSuccess(text.accountCreatedSuccess);

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || text.createError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell flex min-h-screen items-center justify-center bg-gradient-to-br from-[#160a45] via-[#3120a2] to-[#7c2ad8] p-4 sm:p-8">
            <div className="auth-card w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-10">
                <div className="mb-3 flex justify-end">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#5B2EFF] hover:text-[#5B2EFF]"
                    >
                        <Languages size={16} />
                        {text.switchLang}
                    </button>
                </div>

                <div className="mb-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B2EFF]/10 text-[#5B2EFF]">
                        <ShieldCheck size={30} />
                    </div>

                    <h1 className="mt-4 text-2xl font-bold text-gray-800 sm:text-3xl">
                        {text.createAdminAccount}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {text.subtitle}
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        {success} {text.redirecting}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            {text.fullName}
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <UserRound size={18} className="shrink-0 text-gray-400" />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={text.enterFullName}
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            {text.mobileNumber}
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <Smartphone size={18} className="shrink-0 text-gray-400" />

                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder={text.enterMobileNumber}
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            {text.adminSecretCode}
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <ShieldCheck size={18} className="shrink-0 text-gray-400" />

                            <input
                                type="password"
                                name="secretCode"
                                value={formData.secretCode}
                                onChange={handleChange}
                                placeholder={text.enterSecretCode}
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                maxLength="6"
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={text.createPassword}
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

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            {text.confirmPassword}
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <Lock size={18} className="shrink-0 text-gray-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder={text.confirmPasswordPlaceholder}
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#6A2BFF] via-[#5B2EFF] to-[#3A63FF] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {text.creatingAccount}
                            </>
                        ) : (
                            <>
                                {text.createAdminAccount}
                                <ArrowRight
                                    size={18}
                                    className="transition group-hover:translate-x-1"
                                />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    {text.alreadyHaveAccount}{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-[#5B2EFF] hover:underline"
                    >
                        {text.signIn}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
