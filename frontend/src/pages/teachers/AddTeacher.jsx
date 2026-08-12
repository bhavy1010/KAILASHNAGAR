import { useState } from "react";
import {
    ArrowLeft,
    Camera,
    Loader2,
    RotateCcw,
    Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import { addTeacher } from "../../services/teacherService";
import { uploadTeacherPhoto } from "../../services/uploadService";

const AVAILABLE_CLASSES = [
    "Std 1", "Std 2", "Std 3", "Std 4", "Std 5", "Std 6",
    "Std 7", "Std 8", "Std 9", "Std 10", "Std 11", "Std 12"
];

const AVAILABLE_SUBJECTS = [
    "Mathematics", "Science", "Gujarati", "English",
    "Social Science", "Hindi", "Sanskrit", "Computer",
    "Physics", "Chemistry", "Biology", "Economics", "Account"
];

const initialFormData = {
    fullName: "",
    mobile: "",
    email: "",
    qualification: "",
    subject: "",
    subjectsHandled: [],
    classesHandled: [],
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
    const { language } = useLanguage();
    const gu = language === "gu";

    const [formData, setFormData] = useState(initialFormData);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const text = {
        title: gu ? "શિક્ષક ઉમેરો" : "Add Teacher",
        subtitle: gu
            ? "શિક્ષકની વિગતો અને એકાઉન્ટ માહિતી ઉમેરો."
            : "Add teacher details and account information.",
        info: gu ? "શિક્ષકની માહિતી" : "Teacher Information",
        reset: gu ? "રીસેટ" : "Reset",
        save: gu ? "શિક્ષક સાચવો" : "Save Teacher",
        saving: gu ? "સાચવી રહ્યા છીએ..." : "Saving...",
        photo: gu ? "શિક્ષકનો ફોટો" : "Teacher Photo"
    };

    const inputClass =
        "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-[#5B2EFF]/10";

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });

        setError("");
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

    const handleSubmit = async (event) => {
        event.preventDefault();

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
                address: formData.address.trim(),
                experience: Number(formData.experience) || 0,
                salary: Number(formData.salary) || 0
            });

            if (!response.success || !response.teacher?._id) {
                throw new Error("Unable to save teacher.");
            }

            if (selectedPhoto) {
                await uploadTeacherPhoto(
                    response.teacher._id,
                    selectedPhoto
                );
            }

            navigate("/teachers");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    requestError.message ||
                    "Unable to add teacher."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/teachers")}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-gray-100"
                    >
                        <ArrowLeft size={21} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                            {text.title}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {text.subtitle}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-gray-100"
                >
                    <RotateCcw size={18} />
                    {text.reset}
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
                    <h2 className="mb-8 text-xl font-bold text-slate-800">
                        {text.info}
                    </h2>

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
                                    <Camera size={44} className="text-slate-400" />
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
                            {text.photo}: JPG, PNG or WEBP, maximum 2 MB.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label={gu ? "પૂરું નામ *" : "Full Name *"} name="fullName" form={formData} onChange={handleChange} className={inputClass} required />
                        <Field label={gu ? "મોબાઇલ નંબર *" : "Mobile Number *"} name="mobile" type="tel" form={formData} onChange={handleChange} className={inputClass} required />
                        <Field label={gu ? "ઈમેલ" : "Email"} name="email" type="email" form={formData} onChange={handleChange} className={inputClass} />

                        <div>
                            <label className="mb-2 block text-sm font-semibold">{gu ? "લિંગ *" : "Gender *"}</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
                                <option value="">{gu ? "લિંગ પસંદ કરો" : "Select gender"}</option>
                                <option value="Male">{gu ? "પુરુષ" : "Male"}</option>
                                <option value="Female">{gu ? "સ્ત્રી" : "Female"}</option>
                                <option value="Other">{gu ? "અન્ય" : "Other"}</option>
                            </select>
                        </div>

                        <Field label={gu ? "લાયકાત *" : "Qualification *"} name="qualification" form={formData} onChange={handleChange} className={inputClass} required />
                        <Field label={gu ? "મુખ્ય વિષય *" : "Main Subject *"} name="subject" form={formData} onChange={handleChange} className={inputClass} required />
                        <Field label={gu ? "અનુભવ (વર્ષ)" : "Experience (Years)"} name="experience" type="number" form={formData} onChange={handleChange} className={inputClass} />
                        <Field label={gu ? "પગાર" : "Salary"} name="salary" type="number" form={formData} onChange={handleChange} className={inputClass} />
                        <Field label={gu ? "જોડાવાની તારીખ" : "Joining Date"} name="joiningDate" type="date" form={formData} onChange={handleChange} className={inputClass} />

                        <div>
                            <label className="mb-2 block text-sm font-semibold">{gu ? "પાસવર્ડ" : "Account Password"}</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClass} />
                            <p className="mt-2 text-xs text-[#5B2EFF]">
                                {gu ? "ખાલી રાખશો તો મોબાઇલ નંબર પાસવર્ડ બનશે." : "If empty, mobile number becomes the password."}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">{gu ? "સ્થિતિ" : "Status"}</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                <option value="Active">{gu ? "સક્રિય" : "Active"}</option>
                                <option value="Inactive">{gu ? "નિષ્ક્રિય" : "Inactive"}</option>
                            </select>
                        </div>

                        {/* Assigned Subjects (Multiple Selection) */}
                        <div className="md:col-span-2 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 p-5 border border-indigo-100 dark:border-indigo-900/30">
                            <label className="mb-2 block text-sm font-bold text-indigo-900 dark:text-indigo-200">
                                📚 Assigned Subjects (Teacher can create quiz, homework & exams for these)
                            </label>
                            <p className="text-xs text-slate-500 mb-3">Click subjects to assign multiple subjects to this teacher:</p>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SUBJECTS.map((sub) => {
                                    const isSelected = (formData.subjectsHandled || []).includes(sub) || formData.subject === sub;
                                    return (
                                        <button
                                            key={sub}
                                            type="button"
                                            onClick={() => {
                                                const current = formData.subjectsHandled || [];
                                                const next = isSelected
                                                    ? current.filter((s) => s !== sub)
                                                    : [...current, sub];
                                                setFormData({
                                                    ...formData,
                                                    subjectsHandled: next,
                                                    subject: formData.subject || next[0] || sub
                                                });
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                                isSelected
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            {isSelected ? "✓ " : "+ "}{sub}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Assigned Handled Classes (Multiple Selection) */}
                        <div className="md:col-span-2 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 p-5 border border-purple-100 dark:border-purple-900/30">
                            <label className="mb-2 block text-sm font-bold text-purple-900 dark:text-purple-200">
                                🏫 Assigned Handled Classes (Teacher can access attendance & student data for these)
                            </label>
                            <p className="text-xs text-slate-500 mb-3">Click classes to assign multiple standards to this teacher:</p>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_CLASSES.map((cls) => {
                                    const isSelected = (formData.classesHandled || []).includes(cls);
                                    return (
                                        <button
                                            key={cls}
                                            type="button"
                                            onClick={() => {
                                                const current = formData.classesHandled || [];
                                                const next = isSelected
                                                    ? current.filter((c) => c !== cls)
                                                    : [...current, cls];
                                                setFormData({
                                                    ...formData,
                                                    classesHandled: next
                                                });
                                            }}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                                                isSelected
                                                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            {isSelected ? "✓ " : "+ "}{cls}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold">{gu ? "સરનામું *" : "Address *"}</label>
                            <textarea rows="4" name="address" value={formData.address} onChange={handleChange} required className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#5B2EFF]" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-7 py-3 font-semibold text-white shadow-lg hover:bg-[#4724db] disabled:opacity-60">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? text.saving : text.save}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Field = ({ label, name, type = "text", form, onChange, className, required }) => (
    <div>
        <label className="mb-2 block text-sm font-semibold">{label}</label>
        <input type={type} name={name} value={form[name]} onChange={onChange} className={className} required={required} />
    </div>
);

export default AddTeacher;