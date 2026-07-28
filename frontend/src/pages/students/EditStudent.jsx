import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getStudentById, updateStudent } from "../../services/studentService";
import { uploadStudentPhoto } from "../../services/uploadService";

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const formatDate = (value) => {
        if (!value) return "";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? ""
            : date.toISOString().split("T")[0];
    };

    const getPhotoUrl = (photo) => {
        if (!photo) return "";

        if (photo.startsWith("http://") || photo.startsWith("https://")) {
            return photo;
        }

        if (photo.startsWith("/")) {
            return `${serverUrl}${photo}`;
        }

        return `${serverUrl}/uploads/students/${photo}`;
    };

    useEffect(() => {
        const loadStudent = async () => {
            try {
                setLoading(true);

                const response = await getStudentById(id);
                const student =
                    response.student || response.data || response;

                setFormData({
                    grNumber: student.grNumber || "",
                    fullName: student.fullName || "",
                    fatherName: student.fatherName || "",
                    motherName: student.motherName || "",
                    gender: student.gender || "",
                    dateOfBirth: formatDate(student.dateOfBirth),
                    parentMobile: student.parentMobile || "",
                    standard: student.standard || "",
                    division: student.division || "",
                    address: student.address || "",
                    admissionDate: formatDate(student.admissionDate),
                    status: student.status || "Active",
                    existingPhoto: student.photo || ""
                });
            } catch (error) {
                console.error(error);
                setMessage(
                    error.response?.data?.message ||
                        "Unable to load student details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadStudent();
    }, [id]);

    const handleChange = (event) => {
        setFormData((previous) => ({
            ...previous,
            [event.target.name]: event.target.value
        }));
    };

    const handlePhoto = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const imageTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!imageTypes.includes(file.type)) {
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const { existingPhoto, ...studentData } = formData;

            await updateStudent(id, studentData);

            if (selectedPhoto) {
                await uploadStudentPhoto(id, selectedPhoto);
            }

            navigate("/students");
        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message ||
                    "Unable to update student."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#5B2EFF]" />
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="p-8 text-center text-red-600">
                Unable to load student details.
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/students")}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow transition hover:bg-gray-100"
                >
                    <ArrowLeft size={22} />
                </button>

                <div>
                    <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                        Edit Student
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Update student details below.
                    </p>
                </div>
            </div>

            {message && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-medium text-red-700">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
                    <h2 className="mb-8 text-2xl font-bold">
                        Student Information
                    </h2>

                    <div className="mb-10 flex justify-center">
                        <div className="relative">
                            {preview || formData.existingPhoto ? (
                                <img
                                    src={
                                        preview ||
                                        getPhotoUrl(formData.existingPhoto)
                                    }
                                    alt={formData.fullName}
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
                                className="absolute bottom-2 right-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#5B2EFF] text-white shadow-xl transition hover:scale-110 hover:bg-[#4724db]"
                            >
                                <Camera size={20} />

                                <input
                                    id="studentPhoto"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    className="hidden"
                                    onChange={handlePhoto}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="GR Number" name="grNumber" formData={formData} onChange={handleChange} />
                        <Field label="Full Name" name="fullName" formData={formData} onChange={handleChange} />
                        <Field label="Father Name" name="fatherName" formData={formData} onChange={handleChange} />
                        <Field label="Mother Name" name="motherName" formData={formData} onChange={handleChange} />

                        <div>
                            <label className="mb-2 block font-medium">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <Field label="Date Of Birth" name="dateOfBirth" type="date" formData={formData} onChange={handleChange} />
                        <Field label="Parent Mobile" name="parentMobile" type="tel" formData={formData} onChange={handleChange} />
                        <Field label="Standard" name="standard" type="number" formData={formData} onChange={handleChange} />
                        <Field label="Division" name="division" formData={formData} onChange={handleChange} />
                        <Field label="Admission Date" name="admissionDate" type="date" formData={formData} onChange={handleChange} />

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
                                className="w-full resize-none rounded-xl border p-4 outline-none focus:border-[#5B2EFF]"
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
                        {saving ? "Saving..." : "Update Student"}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Field = ({ label, name, type = "text", formData, onChange }) => (
    <div>
        <label className="mb-2 block font-medium">{label}</label>
        <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={onChange}
            className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
        />
    </div>
);

export default EditStudent;