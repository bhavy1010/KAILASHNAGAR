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
    Smartphone
} from "lucide-react";

import { resetTeacherPassword } from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext";

const ForgotTeacherPassword = () => {
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [formData, setFormData] = useState({
        mobile: "",
        secretCode: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        title: isGujarati ? "શિક્ષક પાસવર્ડ રીસેટ કરો" : "Reset Teacher Password",
        subtitle: isGujarati
            ? "નવો પાસવર્ડ બનાવવા માટે તમારો મોબાઇલ નંબર અને શિક્ષક સિક્રેટ કોડ ચકાસો. આ કોડ એડમિન પાસેથી મેળવો."
            : "Verify your mobile number and the Teacher secret code to create a new password. Get this code from your Admin.",
        redirecting: isGujarati ? "લોગિન પર રીડાયરેક્ટ થઈ રહ્યું છે..." : "Redirecting to login...",
        teacherMobileNumber: isGujarati ? "શિક્ષક મોબાઇલ નંબર" : "Teacher Mobile Number",
        enterMobileNumber: isGujarati ? "મોબાઇલ નંબર દાખલ કરો" : "Enter mobile number",
        teacherSecretCode: isGujarati ? "શિક્ષક સિક્રેટ કોડ" : "Teacher Secret Code",
        enterSecretCode: isGujarati
            ? "6-અંકનો સિક્રેટ કોડ દાખલ કરો"
            : "Enter 6-digit secret code",
        newPassword: isGujarati ? "નવો પાસવર્ડ" : "New Password",
        enterNewPassword: isGujarati ? "નવો પાસવર્ડ દાખલ કરો" : "Enter new password",
        confirmNewPassword: isGujarati ? "નવા પાસવર્ડની પુષ્ટિ કરો" : "Confirm New Password",
        confirmNewPasswordPlaceholder: isGujarati
            ? "નવા પાસવર્ડની પુષ્ટિ કરો"
            : "Confirm new password",
        updatingPassword: isGujarati ? "પાસવર્ડ અપડેટ થઈ રહ્યો છે..." : "Updating Password...",
        resetPassword: isGujarati ? "પાસવર્ડ રીસેટ કરો" : "Reset Password",
        rememberedPassword: isGujarati
            ? "તમારો પાસવર્ડ યાદ છે?"
            : "Remembered your password?",
        backToLogin: isGujarati ? "લોગિન પર પાછા જાઓ" : "Back to Login",
        passwordLengthError: isGujarati
            ? "પાસવર્ડમાં ઓછામાં ઓછા 6 અક્ષરો હોવા જોઈએ."
            : "Password must contain at least 6 characters.",
        passwordMismatchError: isGujarati
            ? "પાસવર્ડ અને પુષ્ટિ પાસવર્ડ મેળ ખાતા નથી."
            : "Password and confirm password do not match.",
        secretCodeLengthError: isGujarati
            ? "સિક્રેટ કોડ બરાબર 6 અંકનો હોવો જોઈએ."
            : "Secret code must be exactly 6 digits.",
        updateSuccess: isGujarati
            ? "પાસવર્ડ સફળતાપૂર્વક અપડેટ થયો."
            : "Password updated successfully.",
        resetError: isGujarati ? "પાસવર્ડ રીસેટ કરી શકાયો નથી." : "Unable to reset password."
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Secret code is numbers-only, capped at 6 digits — matches
        // what the backend expects, and stops obviously-wrong input
        // before the user even submits.
        if (name === "secretCode") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
            setFormData((prev) => ({ ...prev, secretCode: digitsOnly }));
            setError("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.secretCode.length !== 6) {
            setError(text.secretCodeLengthError);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError(text.passwordLengthError);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError(text.passwordMismatchError);
            return;
        }

        try {
            setLoading(true);

            const response = await resetTeacherPassword({
                mobile: formData.mobile.trim(),
                secretCode: formData.secretCode.trim(),
                newPassword: formData.newPassword
            });

            if (response.success) {
                setSuccess(text.updateSuccess);

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || text.resetError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2B1CFF] via-[#4328FF] to-[#5D1FFF] p-4 sm:p-8">
            <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-10">
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
                        {text.title}
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
                            {text.teacherMobileNumber}
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
                            {text.teacherSecretCode}
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <ShieldCheck size={18} className="shrink-0 text-gray-400" />

                            <input
                                type="password"
                                inputMode="numeric"
                                name="secretCode"
                                value={formData.secretCode}
                                onChange={handleChange}
                                placeholder={text.enterSecretCode}
                                className="min-w-0 flex-1 bg-transparent text-sm tracking-widest outline-none"
                                maxLength="6"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            {text.newPassword}
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <Lock size={18} className="shrink-0 text-gray-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder={text.enterNewPassword}
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
                            {text.confirmNewPassword}
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <Lock size={18} className="shrink-0 text-gray-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder={text.confirmNewPasswordPlaceholder}
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
                                {text.updatingPassword}
                            </>
                        ) : (
                            <>
                                {text.resetPassword}
                                <ArrowRight
                                    size={18}
                                    className="transition group-hover:translate-x-1"
                                />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    {text.rememberedPassword}{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-[#5B2EFF] hover:underline"
                    >
                        {text.backToLogin}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotTeacherPassword;