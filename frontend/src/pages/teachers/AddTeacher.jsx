import { useState } from "react";
import {
    ArrowLeft,
    Camera,
    Loader2,
    RotateCcw,
    Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { addTeacher } from "../../services/teacherService";
import { uploadTeacherPhoto } from "../../services/uploadService";

const initialFormData = {
    fullName: "",
    mobile: "",
    email: "",
    qualification: "",
    subject: "",
    experience: "",
    salary: "",
    joiningDate: "",
    gender: "",
    address: "",
    password: "",
    status: "Active"
};

const AddTeacher = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialFormData);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
    };

    const handlePhoto = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, PNG and WEBP images are allowed.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image size must be less than 2 MB.");
            return;
        }

        setSelectedPhoto(file);
        setPreview(URL.createObjectURL(file));
        setError("");
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setSelectedPhoto(null);
        setPreview("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.fullName ||
            !formData.mobile ||
            !formData.gender ||
            !formData.qualification ||
            !formData.subject ||
            !formData.address
        ) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await addTeacher({
                ...formData,
                fullName: formData.fullName.trim(),
                mobile: formData.mobile.trim(),
                email: formData.email.trim(),
                qualification: formData.qualification.trim(),
                subject: formData.subject.trim(),
                address: formData.address.trim()
            });

            if (!response.success) {
                throw new Error("Unable to save teacher.");
            }

            if (selectedPhoto) {
                await uploadTeacherPhoto(
                    response.teacher._id,
                    selectedPhoto
                );
            }

            navigate("/teachers");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to add teacher."
            );

        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-[#5B2EFF]/10";

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/teachers")}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-gray-100"
                        aria-label="Back to teachers"
                    >
                        <ArrowLeft size={21} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                            Add Teacher
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Add teacher details and account information.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-gray-100"
                >
                    <RotateCcw size={18} />
                    Reset
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800">
                            Teacher Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Fields marked with * are required.
                        </p>
                    </div>

                    <div className="mb-10 flex flex-col items-center">
                        <div className="relative">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Teacher preview"
                                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl sm:h-40 sm:w-40"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl sm:h-40 sm:w-40">
                                    <Camera
                                        size={44}
                                        className="text-slate-400"
                                    />
                                </div>
                            )}

                            <label
                                htmlFor="teacherPhoto"
                                className="absolute bottom-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#5B2EFF] text-white shadow-lg transition hover:bg-[#4724db]"
                            >
                                <Camera size={19} />
                            </label>

                            <input
                                id="teacherPhoto"
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                className="hidden"
                                onChange={handlePhoto}
                            />
                        </div>

                        <p className="mt-4 text-center text-sm text-slate-500">
                            Teacher photo: JPG, PNG or WEBP, maximum 2 MB.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Full Name *
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Mobile Number *
                            </label>

                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Enter mobile number"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Gender *
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Qualification *
                            </label>

                            <input
                                type="text"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Example: B.Ed, M.Sc"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Subject *
                            </label>

                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Example: Mathematics"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Experience (Years)
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Salary
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Optional"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Joining Date
                            </label>

                            <input
                                type="date"
                                name="joiningDate"
                                value={formData.joiningDate}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Account Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Optional password"
                            />

                            <p className="mt-2 text-xs leading-5 text-[#5B2EFF]">
                                If left empty, the teacher&apos;s mobile number
                                becomes their password.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold">
                                Address *
                            </label>

                            <textarea
                                rows="4"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-[#5B2EFF]/10"
                                placeholder="Enter complete address"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold transition hover:bg-gray-100 disabled:opacity-60"
                    >
                        Reset Form
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-7 py-3 font-semibold text-white shadow-lg transition hover:bg-[#4724db] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Teacher
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTeacher;