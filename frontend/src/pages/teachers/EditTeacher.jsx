import { useEffect, useState } from "react";
import { ArrowLeft, Save, RotateCcw, Camera } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getTeacherById,
    updateTeacher
} from "../../services/teacherService";

import { uploadTeacherPhoto } from "../../services/uploadService";

const EditTeacher = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [loading, setLoading] = useState(false);

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const [preview, setPreview] = useState("");

    const initialFormData = {

        fullName: "",

        mobile: "",

        email: "",

        gender: "",

        qualification: "",

        subject: "",

        experience: "",

        salary: "",

        joiningDate: "",

        address: "",

        status: "Active"

    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {

        loadTeacher();

    }, []);

    const loadTeacher = async () => {

        try {

            const response = await getTeacherById(id);

            if (response.success) {

                const teacher = response.teacher;

                setFormData({

                    fullName: teacher.fullName || "",

                    mobile: teacher.mobile || "",

                    email: teacher.email || "",

                    gender: teacher.gender || "",

                    qualification: teacher.qualification || "",

                    subject: teacher.subject || "",

                    experience: teacher.experience || "",

                    salary: teacher.salary || "",

                    joiningDate: teacher.joiningDate
                        ? teacher.joiningDate.substring(0, 10)
                        : "",

                    address: teacher.address || "",

                    status: teacher.status || "Active"

                });

                setPreview(
                    teacher.photo
                        ? `http://localhost:5000/uploads/teachers/${teacher.photo}`
                        : ""
                );

            }

        } catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        setFormData({

            ...formData,
            [e.target.name]: e.target.value

        });

    };

    const handlePhoto = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {

            alert("Maximum image size is 2 MB");

            return;

        }

        const allowed = [

            "image/jpeg",

            "image/png",

            "image/webp"

        ];

        if (!allowed.includes(file.type)) {

            alert("Only JPG PNG WEBP allowed");

            return;

        }

        setSelectedPhoto(file);

        setPreview(URL.createObjectURL(file));

    };

    const handleReset = () => {

        loadTeacher();

        setSelectedPhoto(null);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const response = await updateTeacher(

                id,

                formData

            );

            if (response.success && selectedPhoto) {

                await uploadTeacherPhoto(

                    id,

                    selectedPhoto

                );

            }

            alert("Teacher Updated Successfully");

            navigate("/teachers");

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to update teacher"

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="flex items-center justify-between mb-8">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/teachers")}
                        className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                    >

                        <ArrowLeft size={22} />

                    </button>

                    <div>

                        <h1 className="text-4xl font-bold text-slate-800">
                            Edit Teacher
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Update teacher information.
                        </p>

                    </div>

                </div>

                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 shadow hover:bg-gray-100"
                    >

                        <RotateCcw size={18} />

                        Reset

                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-[#5B2EFF] px-6 py-3 text-white hover:bg-[#4724db]"
                    >

                        <Save size={18} />

                        {loading ? "Updating..." : "Update Teacher"}

                    </button>

                </div>

            </div>

            <form onSubmit={handleSubmit}>

                <div className="rounded-3xl bg-white p-8 shadow">

                    <h2 className="mb-8 text-2xl font-bold">
                        Teacher Information
                    </h2>

                    <div className="mb-10 flex justify-center">

                        <div className="relative">

                            {

                                preview ?

                                (

                                    <img
                                        src={preview}
                                        alt="Teacher"
                                        className="w-40 h-40 rounded-full object-cover border-[6px] border-white shadow-2xl"
                                    />

                                )

                                :

                                (

                                    <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center shadow-2xl">

                                        <Camera
                                            size={45}
                                            className="text-gray-400"
                                        />

                                    </div>

                                )

                            }

                            <label
                                htmlFor="photo"
                                className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#5B2EFF] text-white flex items-center justify-center cursor-pointer shadow-xl hover:bg-[#4724db] transition"
                            >

                                <Camera size={20} />

                            </label>

                            <input
                                id="photo"
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                className="hidden"
                                onChange={handlePhoto}
                            />

                        </div>

                    </div>

                    <div className="grid grid-cols-2 gap-6">

                        <div>

                            <label className="mb-2 block font-medium">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block font-medium">
                                Mobile
                            </label>

                            <input
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block font-medium">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

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

                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>

                            </select>

                        </div>

                        <div>

                            <label className="mb-2 block font-medium">
                                Qualification
                            </label>

                            <input
                                type="text"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block font-medium">
                                Subject
                            </label>

                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block font-medium">
                                Experience (Years)
                            </label>

                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block font-medium">
                                Salary (Optional)
                            </label>

                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block font-medium">
                                Joining Date
                            </label>

                            <input
                                type="date"
                                name="joiningDate"
                                value={formData.joiningDate}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                            />

                        </div>

                        <div className="col-span-2">

                            <label className="mb-2 block font-medium">
                                Address
                            </label>

                            <textarea
                                rows="4"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF]"
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

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                <div className="mt-8 flex items-center justify-end gap-4">

                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-gray-300 px-8 py-3 hover:bg-gray-100"
                    >

                        Reset

                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-[#5B2EFF] px-10 py-3 text-white hover:bg-[#4724db]"
                    >

                        {loading ? "Saving..." : "Save Teacher"}

                    </button>

                </div>

            </form>

        </div>

    );

};

export default EditTeacher;