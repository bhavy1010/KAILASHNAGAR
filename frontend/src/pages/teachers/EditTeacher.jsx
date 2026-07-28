import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Camera,
    Loader2,
    Save
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import {
    getTeacherById,
    updateTeacher
} from "../../services/teacherService";
import { uploadTeacherPhoto } from "../../services/uploadService";

const EditTeacher = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const gu = language === "gu";

    const [form, setForm] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const labels = {
        title: gu ? "શિક્ષક સંપાદિત કરો" : "Edit Teacher",
        subtitle: gu
            ? "શિક્ષકની માહિતી અપડેટ કરો."
            : "Update teacher details below.",
        info: gu ? "શિક્ષકની માહિતી" : "Teacher Information",
        fullName: gu ? "પૂરું નામ" : "Full Name",
        mobile: gu ? "મોબાઇલ નંબર" : "Mobile Number",
        email: gu ? "ઈમેલ સરનામું" : "Email Address",
        password: gu
            ? "નવો પાસવર્ડ (વૈકલ્પિક)"
            : "New Password (Optional)",
        gender: gu ? "લિંગ" : "Gender",
        qualification: gu ? "લાયકાત" : "Qualification",
        subject: gu ? "મુખ્ય વિષય" : "Main Subject",
        experience: gu ? "અનુભવ (વર્ષ)" : "Experience (Years)",
        salary: gu ? "પગાર" : "Salary",
        classes: gu ? "ભણાવવાના વર્ગો" : "Classes Handled",
        joining: gu ? "જોડાવાની તારીખ" : "Joining Date",
        address: gu ? "સરનામું" : "Address",
        status: gu ? "સ્થિતિ" : "Status",
        photo: gu ? "શિક્ષકનો ફોટો" : "Teacher Photo",
        save: gu ? "શિક્ષક અપડેટ કરો" : "Update Teacher",
        saving: gu ? "સાચવી રહ્યા છીએ..." : "Saving..."
    };

    const inputClass =
        "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#5B2EFF] focus:ring-2 focus:ring-[#5B2EFF]/10";

    const getPhotoUrl = (photo) => {
        if (!photo) return "";

        if (photo.startsWith("http://") || photo.startsWith("https://")) {
            return photo;
        }

        if (photo.startsWith("/")) {
            return `${serverUrl}${photo}`;
        }

        return `${serverUrl}/uploads/teachers/${photo}`;
    };

    useEffect(() => {
        const loadTeacher = async () => {
            try {
                const response = await getTeacherById(id);
                const teacher = response.teacher || response.data || response;

                setForm({
                    fullName: teacher.fullName || "",
                    mobile: teacher.mobile || "",
                    email: teacher.email || "",
                    password: "",
                    gender: teacher.gender || "",
                    qualification: teacher.qualification || "",
                    subject: teacher.subject || "",
                    experience: teacher.experience || 0,
                    salary: teacher.salary || 0,
                    classesHandled: (teacher.classesHandled || []).join(", "),
                    joiningDate: teacher.joiningDate
                        ? new Date(teacher.joiningDate)
                              .toISOString()
                              .split("T")[0]
                        : "",
                    address: teacher.address || "",
                    status: teacher.status || "Active",
                    existingPhoto: teacher.photo || ""
                });
            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                        "Unable to load teacher information."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTeacher();
    }, [id]);

    const handleChange = (event) => {
        setForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value
        }));
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
            setMessage("Image size must be less than 2 MB.");
            return;
        }

        setSelectedPhoto(file);
        setPreview(URL.createObjectURL(file));
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const { existingPhoto, ...teacherData } = form;

            await updateTeacher(id, {
                ...teacherData,
                experience: Number(form.experience) || 0,
                salary: Number(form.salary) || 0,
                classesHandled: form.classesHandled
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
            });

            if (selectedPhoto) {
                await uploadTeacherPhoto(id, selectedPhoto);
            }

            navigate("/teachers");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Unable to update teacher."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#5B2EFF]" />
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/teachers")}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow transition hover:bg-gray-100"
                >
                    <ArrowLeft size={22} />
                </button>

                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        {labels.title}
                    </h1>
                    <p className="mt-2 text-slate-500">
                        {labels.subtitle}
                    </p>
                </div>
            </div>

            {message && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                    <h2 className="mb-8 text-2xl font-bold">
                        {labels.info}
                    </h2>

                    <div className="mb-10 flex flex-col items-center">
                        <div className="relative">
                            {preview || form.existingPhoto ? (
                                <img
                                    src={
                                        preview ||
                                        getPhotoUrl(form.existingPhoto)
                                    }
                                    alt={form.fullName}
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
                            {labels.photo}: JPG, PNG or WEBP, maximum 2 MB.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label={labels.fullName} name="fullName" form={form} onChange={handleChange} className={inputClass} required />
                        <Field label={labels.mobile} name="mobile" form={form} onChange={handleChange} className={inputClass} required />
                        <Field label={labels.email} name="email" type="email" form={form} onChange={handleChange} className={inputClass} />
                        <Field label={labels.password} name="password" type="password" form={form} onChange={handleChange} className={inputClass} />

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                {labels.gender}
                            </label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Male">{gu ? "પુરુષ" : "Male"}</option>
                                <option value="Female">{gu ? "સ્ત્રી" : "Female"}</option>
                                <option value="Other">{gu ? "અન્ય" : "Other"}</option>
                            </select>
                        </div>

                        <Field label={labels.qualification} name="qualification" form={form} onChange={handleChange} className={inputClass} />
                        <Field label={labels.subject} name="subject" form={form} onChange={handleChange} className={inputClass} />
                        <Field label={labels.experience} name="experience" type="number" form={form} onChange={handleChange} className={inputClass} />
                        <Field label={labels.salary} name="salary" type="number" form={form} onChange={handleChange} className={inputClass} />
                        <Field label={labels.classes} name="classesHandled" form={form} onChange={handleChange} className={inputClass} />
                        <Field label={labels.joining} name="joiningDate" type="date" form={form} onChange={handleChange} className={inputClass} />

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                {labels.status}
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Active">
                                    {gu ? "સક્રિય" : "Active"}
                                </option>
                                <option value="Inactive">
                                    {gu ? "નિષ્ક્રિય" : "Inactive"}
                                </option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold">
                                {labels.address}
                            </label>
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows="4"
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#5B2EFF]"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-10 py-3 font-semibold text-white transition hover:bg-[#4724db] disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {saving ? labels.saving : labels.save}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Field = ({
    label,
    name,
    type = "text",
    form,
    onChange,
    className,
    required
}) => (
    <div>
        <label className="mb-2 block text-sm font-semibold">{label}</label>
        <input
            type={type}
            name={name}
            value={form[name]}
            onChange={onChange}
            required={required}
            className={className}
        />
    </div>
);

export default EditTeacher;