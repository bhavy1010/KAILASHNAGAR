import { useState } from "react";
import { ArrowLeft, Save, RotateCcw, Camera, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { addStudent } from "../../services/studentService";
import { uploadStudentPhoto } from "../../services/uploadService";
import CameraModal from "../../components/CameraModal";

const initialFormData = {
    grNumber: "",
    fullName: "",
    fatherName: "",
    motherName: "",
    gender: "",
    dateOfBirth: "",
    parentMobile: "",
    standard: "",
    division: "",
    address: "",
    admissionDate: "",
    status: "Active"
};

const AddStudent = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState(initialFormData);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleCameraCapture = (file, dataUrl) => {
        setSelectedPhoto(file);
        setPreview(dataUrl);
    };

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handlePhoto = (event) => {
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
            setMessage("Image size should be less than 2 MB.");
            return;
        }

        setSelectedPhoto(file);
        setPreview(URL.createObjectURL(file));
        setMessage("");
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setSelectedPhoto(null);
        setPreview("");
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await addStudent(formData);

            if (!response.success || !response.student?._id) {
                throw new Error("Unable to save student.");
            }

            if (selectedPhoto) {
                await uploadStudentPhoto(response.student._id, selectedPhoto);
            }

            navigate("/students");
        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message ||
                    error.message ||
                    "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/students")}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow transition hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                            Add Student
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Fill student details below.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 shadow transition hover:bg-gray-100 disabled:opacity-60"
                    >
                        <RotateCcw size={18} />
                        Reset
                    </button>

                    <button
                        type="submit"
                        form="studentForm"
                        disabled={loading}
                        className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-7 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#4724db] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <>
                                <LoaderIcon />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Student
                            </>
                        )}
                    </button>
                </div>
            </div>

            {message && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-medium text-red-700">
                    {message}
                </div>
            )}

            <form id="studentForm" onSubmit={handleSubmit}>
                <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                    <h2 className="mb-8 text-2xl font-bold">
                        Student Information
                    </h2>

                    <div className="mb-10 flex flex-col items-center">
                        <div className="relative mb-4">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-40 w-40 rounded-full border-[6px] border-white object-cover shadow-2xl"
                                />
                            ) : (
                                <div className="flex h-40 w-40 items-center justify-center rounded-full border-[6px] border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl">
                                    <Camera
                                        size={50}
                                        className="text-slate-400"
                                    />
                                </div>
                            )}

                            <label
                                htmlFor="studentPhoto"
                                className="absolute bottom-2 right-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#5B2EFF] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#4724db]"
                                title="Choose Photo from Gallery"
                            >
                                <Camera size={20} />
                            </label>

                            <input
                                id="studentPhoto"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handlePhoto}
                            />
                        </div>

                        {/* Direct Live Camera Option for Teacher/Admin */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCameraOpen(true)}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition"
                            >
                                <Video className="h-4 w-4" />
                                Take Photo with Phone Camera
                            </button>
                        </div>

                        <CameraModal
                            isOpen={isCameraOpen}
                            onClose={() => setIsCameraOpen(false)}
                            onCapture={handleCameraCapture}
                        />
                    </div>

                    <div className="mb-10 text-center">
                        <h3 className="text-xl font-semibold text-slate-700">
                            Student Photo
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            JPG, PNG or WEBP (Maximum 2 MB)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <InputField
                            label="GR Number"
                            name="grNumber"
                            value={formData.grNumber}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Father Name"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Mother Name"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <label className="mb-2 block font-medium">
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Date Of Birth
                            </label>

                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                            <p className="mt-2 text-xs leading-5 text-[#5B2EFF]">
                                Student password is generated from date of birth.
                                Example: 10/10/2005 becomes 101005.
                            </p>
                        </div>

                        <InputField
                            label="Parent Mobile"
                            type="tel"
                            name="parentMobile"
                            value={formData.parentMobile}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Standard"
                            type="number"
                            min="1"
                            max="12"
                            name="standard"
                            value={formData.standard}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Division"
                            name="division"
                            value={formData.division}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <label className="mb-2 block font-medium">
                                Admission Date
                            </label>

                            <input
                                type="date"
                                name="admissionDate"
                                value={formData.admissionDate}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block font-medium">
                                Address
                            </label>

                            <textarea
                                rows="4"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="w-full resize-none rounded-xl border p-4 outline-none focus:border-[#5B2EFF]"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-medium shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
                    >
                        Reset
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#5B2EFF] px-10 py-3 font-semibold text-white transition hover:bg-[#4724db] disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <LoaderIcon />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Student
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    required,
    min,
    max
}) => (
    <div>
        <label className="mb-2 block font-medium">{label}</label>

        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            max={max}
            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
        />
    </div>
);

const LoaderIcon = () => (
    <svg
        className="h-5 w-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />

        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
    </svg>
);

export default AddStudent;