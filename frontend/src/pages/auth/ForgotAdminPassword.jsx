import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    ShieldCheck,
    Smartphone
} from "lucide-react";

import { resetAdminPassword } from "../../services/authService";

const ForgotAdminPassword = () => {
    const navigate = useNavigate();

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

        if (formData.newPassword.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Password and confirm password do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await resetAdminPassword({
                mobile: formData.mobile.trim(),
                secretCode: formData.secretCode.trim(),
                newPassword: formData.newPassword
            });

            if (response.success) {
                setSuccess("Password updated successfully.");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2B1CFF] via-[#4328FF] to-[#5D1FFF] p-4 sm:p-8">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
                <div className="mb-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B2EFF]/10 text-[#5B2EFF]">
                        <ShieldCheck size={30} />
                    </div>

                    <h1 className="mt-4 text-3xl font-bold text-gray-800">
                        Reset Admin Password
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Verify your mobile number and Admin secret code to
                        create a new password.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        {success} Redirecting to login...
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Admin Mobile Number
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <Smartphone
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter mobile number"
                                className="flex-1 bg-transparent text-sm outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Admin Secret Code
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <ShieldCheck
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="password"
                                name="secretCode"
                                value={formData.secretCode}
                                onChange={handleChange}
                                placeholder="Enter 6-digit secret code"
                                className="flex-1 bg-transparent text-sm outline-none"
                                maxLength="6"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            New Password
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <Lock
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
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

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Confirm New Password
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#5B2EFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B2EFF]/10">
                            <Lock
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className="flex-1 bg-transparent text-sm outline-none"
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
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Updating Password...
                            </>
                        ) : (
                            <>
                                Reset Password
                                <ArrowRight
                                    size={18}
                                    className="transition group-hover:translate-x-1"
                                />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Remembered your password?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-[#5B2EFF] hover:underline"
                    >
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotAdminPassword;