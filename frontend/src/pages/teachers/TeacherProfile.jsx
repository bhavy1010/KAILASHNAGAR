import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    User,
    Phone,
    GraduationCap,
    MapPin,
    BookOpen
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getTeacherById, deleteTeacher } from "../../services/teacherService";
import { uploadTeacherPhoto } from "../../services/uploadService";

const TeacherProfile = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const { user } = useAuth();

    const [teacher, setTeacher] = useState(null);

    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {

        loadTeacher();

    }, []);

    const loadTeacher = async () => {

        try {

            const response = await getTeacherById(id);

            setTeacher(response.teacher);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="h-full flex items-center justify-center">

                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

            </div>

        );

    }

    const InfoItem = ({ label, value }) => (

        <div className="border-b border-gray-100 pb-4">

            <p className="text-sm text-gray-500">

                {label}

            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-2">

                {value}

            </h3>

        </div>

    );

    const handlePhotoUpload = async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        try {

            setUploading(true);

            const response = await uploadTeacherPhoto(

                teacher._id,

                file

            );

            if (response.success) {

                setTeacher({

                    ...teacher,

                    photo: response.photo

                });

                alert("Photo Uploaded Successfully");

            }

        } catch (error) {

            alert(

                error.response?.data?.message ||

                "Upload Failed"

            );

        } finally {

            setUploading(false);

        }

    };

    const handleDelete = async () => {

        if (!window.confirm("Delete this teacher? This action cannot be undone.")) {

            return;

        }

        try {

            await deleteTeacher(teacher._id);

            navigate("/teachers");

        } catch (error) {

            alert(

                error.response?.data?.message ||

                "Unable to delete teacher"

            );

        }

    };

    const handlePrint = () => {
        window.print();
    };

    return (

        <div className="space-y-8" id="teacher-profile-print">

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #teacher-profile-print,
                    #teacher-profile-print * {
                        visibility: visible;
                    }
                    #teacher-profile-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-break-avoid {
                        break-inside: avoid;
                    }
                }
            `}</style>

            {/* ================= Header ================= */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div className="no-print">

                    <button

                        onClick={() => navigate(-1)}

                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4 transition"

                    >

                        <ArrowLeft size={18} />

                        Back

                    </button>

                </div>

                <div>

                    <p className="text-sm text-gray-500">

                        Teachers

                        <span className="mx-2">›</span>

                        Teacher Profile

                    </p>

                    <h1 className="text-4xl font-bold text-gray-800 mt-2">

                        Teacher Profile

                    </h1>

                    <p className="text-gray-500 mt-2">

                        View and manage teacher information

                    </p>

                </div>

                <div className="flex flex-wrap gap-3 no-print">

                    <button

                        onClick={handlePrint}

                        className="px-6 py-3 rounded-xl border bg-white shadow hover:shadow-md transition"

                    >

                        🖨 Print

                    </button>

                    {

                        user?.role === "admin" && (

                            <>

                                <button

                                    onClick={() =>

                                        navigate(`/teachers/edit/${teacher._id}`)

                                    }

                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:scale-105 transition"

                                >

                                    ✏ Edit Teacher

                                </button>

                                <button

                                    onClick={handleDelete}

                                    className="px-6 py-3 rounded-xl bg-red-600 text-white shadow-lg hover:bg-red-700 transition"

                                >

                                    🗑 Delete

                                </button>

                            </>

                        )

                    }

                </div>

            </div>

            <input

                ref={fileInputRef}

                type="file"

                accept="image/*"

                className="hidden no-print"

                onChange={handlePhotoUpload}

            />

            {/* ================= Hero Card ================= */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-100 via-white to-indigo-100 border shadow-lg">

                <div className="absolute inset-0 opacity-20">

                    <div className="absolute -right-32 -top-20 w-96 h-96 rounded-full bg-blue-300 blur-3xl"></div>

                    <div className="absolute -left-32 bottom-0 w-80 h-80 rounded-full bg-indigo-300 blur-3xl"></div>

                </div>

                <div className="relative p-10">

                    <div className="flex flex-col xl:flex-row items-center gap-10">

                        <div className="relative">

                            {

                                teacher.photo ?

                                (

                                    <img

                                        src={`http://localhost:5000/uploads/teachers/${teacher.photo}`}

                                        alt={teacher.fullName}

                                        className="w-52 h-52 rounded-full object-cover border-[6px] border-white shadow-xl"

                                    />

                                )

                                :

                                (

                                    <div className="w-52 h-52 rounded-full bg-blue-100 flex items-center justify-center border-[6px] border-white shadow-xl">

                                        <User

                                            size={90}

                                            className="text-blue-600"

                                        />

                                    </div>

                                )

                            }

                            <button

                                onClick={() => fileInputRef.current.click()}

                                disabled={uploading}

                                className="absolute bottom-2 right-2 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition no-print"

                            >

                                {

                                    uploading
                                        ? "..."
                                        : "📷"

                                }

                            </button>

                        </div>

                        <div className="flex-1">

                            <div className="flex items-center gap-3">

                                <h1 className="text-5xl font-bold text-gray-800">

                                    {teacher.fullName}

                                </h1>

                                <span className="text-blue-600 text-2xl">

                                    ✔

                                </span>

                            </div>

                            <div className="mt-4">

                                <span

                                    className={`px-5 py-2 rounded-full font-semibold text-sm ${

                                        teacher.status === "Active"

                                            ? "bg-green-100 text-green-700"

                                            : "bg-red-100 text-red-700"

                                    }`}

                                >

                                    {teacher.status}

                                </span>

                            </div>

                            <h2 className="text-2xl mt-6">

                                Subject :

                                <span className="ml-2 font-bold text-indigo-600">

                                    {teacher.subject}

                                </span>

                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

                                <div className="bg-white rounded-2xl p-5 shadow">

                                    <p className="text-sm text-gray-500">

                                        Gender

                                    </p>

                                    <h3 className="text-xl font-bold mt-2">

                                        {teacher.gender}

                                    </h3>

                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow">

                                    <p className="text-sm text-gray-500">

                                        Qualification

                                    </p>

                                    <h3 className="text-xl font-bold mt-2">

                                        {teacher.qualification}

                                    </h3>

                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow">

                                    <p className="text-sm text-gray-500">

                                        Mobile

                                    </p>

                                    <h3 className="text-xl font-bold mt-2">

                                        {teacher.mobile}

                                    </h3>

                                </div>

                            </div>

                        </div>

                        <div className="hidden xl:flex flex-col gap-4">

                            <div className="bg-white rounded-2xl p-6 shadow w-56">

                                <p className="text-gray-500">

                                    Joining Date

                                </p>

                                <h3 className="font-bold mt-2">

                                    {
                                        teacher.joiningDate
                                            ? new Date(teacher.joiningDate).toLocaleDateString()
                                            : "-"
                                    }

                                </h3>

                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow w-56">

                                <p className="text-gray-500">

                                    Experience

                                </p>

                                <h3 className="font-bold mt-2">

                                    {teacher.experience || 0} Years

                                </h3>

                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow w-56">

                                <p className="text-gray-500">

                                    Classes Handled

                                </p>

                                <h3 className="font-bold mt-2">

                                    {
                                        teacher.classesHandled?.length
                                            ? teacher.classesHandled.join(", ")
                                            : "Not Assigned"
                                    }

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ================= Information Section ================= */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

                {/* Personal Information */}

                <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">

                            <User className="text-indigo-600"/>

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold">

                                Personal Information

                            </h2>

                            <p className="text-gray-500">

                                Basic teacher details

                            </p>

                        </div>

                    </div>

                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-7">

                        <InfoItem

                            label="Full Name"

                            value={teacher.fullName}

                        />

                        <InfoItem

                            label="Gender"

                            value={teacher.gender}

                        />

                        <InfoItem

                            label="Mobile"

                            value={teacher.mobile}

                        />

                        <InfoItem

                            label="Email"

                            value={teacher.email || "-"}

                        />

                        <InfoItem

                            label="Joining Date"

                            value={
                                teacher.joiningDate
                                    ? new Date(teacher.joiningDate).toLocaleDateString()
                                    : "-"
                            }

                        />

                        <InfoItem

                            label="Status"

                            value={teacher.status}

                        />

                    </div>

                </div>

                {/* Professional */}

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

                            <GraduationCap className="text-blue-600"/>

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold">

                                Professional

                            </h2>

                            <p className="text-gray-500">

                                Qualification & expertise

                            </p>

                        </div>

                    </div>

                    <div className="space-y-6">

                        <InfoItem

                            label="Qualification"

                            value={teacher.qualification}

                        />

                        <InfoItem

                            label="Subject"

                            value={teacher.subject}

                        />

                        <InfoItem

                            label="Experience"

                            value={`${teacher.experience || 0} Years`}

                        />

                        {

                            user?.role === "admin" && (

                                <InfoItem

                                    label="Salary"

                                    value={
                                        teacher.salary
                                            ? `₹ ${teacher.salary}`
                                            : "-"
                                    }

                                />

                            )

                        }

                    </div>

                </div>

            </div>

            {/* Contact */}

            <div className="grid lg:grid-cols-2 gap-7">

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

                            <Phone className="text-green-600"/>

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold">

                                Contact Information

                            </h2>

                        </div>

                    </div>

                    <InfoItem

                        label="Mobile"

                        value={teacher.mobile}

                    />

                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">

                            <MapPin className="text-orange-600"/>

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold">

                                Address

                            </h2>

                        </div>

                    </div>

                    <p className="text-gray-700 leading-8">

                        {teacher.address}

                    </p>

                </div>

            </div>

            {/* ================= Statistics ================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Attendance */}

                <div className="group bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 border border-indigo-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                    <div className="flex justify-between items-start">

                        <div>

                            <p className="text-sm text-indigo-500 font-semibold">

                                Attendance

                            </p>

                            <h2 className="text-4xl font-bold mt-3">

                                96%

                            </h2>

                            <p className="text-gray-500 mt-2">

                                This Month

                            </p>

                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">

                            <User className="text-indigo-600" size={32}/>

                        </div>

                    </div>

                    <div className="mt-6 h-2 rounded-full bg-indigo-100 overflow-hidden">

                        <div className="h-full w-[96%] rounded-full bg-indigo-600"></div>

                    </div>

                </div>

                {/* Classes Handled */}

                <div className="group bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 border border-green-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-green-600 font-semibold">

                                Classes Handled

                            </p>

                            <h2 className="text-4xl font-bold mt-3">

                                {teacher.classesHandled?.length || 0}

                            </h2>

                            <p className="text-gray-500">

                                Active Classes

                            </p>

                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">

                            <BookOpen

                                className="text-green-600"

                                size={32}

                            />

                        </div>

                    </div>

                    <div className="mt-6 h-2 rounded-full bg-green-100">

                        <div className="w-[80%] h-full bg-green-500 rounded-full"></div>

                    </div>

                </div>

                {/* Experience */}

                <div className="group bg-gradient-to-br from-orange-50 to-white rounded-3xl p-6 border border-orange-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-orange-600 font-semibold">

                                Experience

                            </p>

                            <h2 className="text-4xl font-bold mt-3">

                                {teacher.experience || 0}

                            </h2>

                            <p className="text-gray-500">

                                Years

                            </p>

                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

                            🏆

                        </div>

                    </div>

                    <div className="mt-6 h-2 rounded-full bg-orange-100">

                        <div className="w-[70%] h-full bg-orange-500 rounded-full"></div>

                    </div>

                </div>

                {/* Performance */}

                <div className="group bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 border border-blue-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-blue-600 font-semibold">

                                Performance

                            </p>

                            <h2 className="text-4xl font-bold mt-3">

                                89%

                            </h2>

                            <p className="text-gray-500">

                                Overall Rating

                            </p>

                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">

                            ⭐

                        </div>

                    </div>

                    <div className="mt-6 h-2 rounded-full bg-blue-100">

                        <div className="w-[89%] h-full bg-blue-500 rounded-full"></div>

                    </div>

                </div>

            </div>

            {/* ================= Timetable & Recent Activity ================= */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

                {/* Timetable Preview */}

                <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100">

                    <div className="flex items-center justify-between p-7 border-b">

                        <div>

                            <h2 className="text-2xl font-bold">

                                Weekly Timetable

                            </h2>

                            <p className="text-gray-500 mt-1">

                                Current teaching schedule

                            </p>

                        </div>

                        <button
                            onClick={() => navigate(`/teachers/${teacher._id}/timetable`)}
                            className="text-indigo-600 font-semibold hover:underline no-print"
                        >

                            View Full Timetable

                        </button>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="text-left px-6 py-4">

                                        Day

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Period

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Subject

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Class

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {[

                                    {
                                        day: "Monday",
                                        period: "1st Period",
                                        subject: teacher.subject,
                                        class: "Std 8 - A"
                                    },

                                    {
                                        day: "Monday",
                                        period: "3rd Period",
                                        subject: teacher.subject,
                                        class: "Std 9 - B"
                                    },

                                    {
                                        day: "Tuesday",
                                        period: "2nd Period",
                                        subject: teacher.subject,
                                        class: "Std 8 - A"
                                    },

                                    {
                                        day: "Wednesday",
                                        period: "4th Period",
                                        subject: teacher.subject,
                                        class: "Std 10 - C"
                                    }

                                ].map((item, index) => (

                                    <tr
                                        key={index}
                                        className="border-b hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-5">

                                            {item.day}

                                        </td>

                                        <td className="px-6 py-5">

                                            {item.period}

                                        </td>

                                        <td className="px-6 py-5">

                                            {item.subject}

                                        </td>

                                        <td className="px-6 py-5">

                                            {item.class}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* Recent Activities */}

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

                    <div className="flex items-center gap-4">

                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">

                            👨‍🏫

                        </div>

                        <div>

                            <h2 className="text-xl font-bold">

                                Recent Activities

                            </h2>

                            <p className="text-gray-500">

                                Last updates

                            </p>

                        </div>

                    </div>

                    <div className="mt-8 space-y-5">

                        <div className="rounded-2xl bg-indigo-50 p-5">

                            <p className="text-gray-700">

                                Marked attendance for Std 8 - A

                            </p>

                            <p className="text-xs text-gray-400 mt-2">

                                Today, 9:30 AM

                            </p>

                        </div>

                        <div className="rounded-2xl bg-green-50 p-5">

                            <p className="text-gray-700">

                                Submitted homework for Std 9 - B

                            </p>

                            <p className="text-xs text-gray-400 mt-2">

                                Yesterday, 4:15 PM

                            </p>

                        </div>

                        <div className="rounded-2xl bg-orange-50 p-5">

                            <p className="text-gray-700">

                                Updated exam marks for Std 10 - C

                            </p>

                            <p className="text-xs text-gray-400 mt-2">

                                2 Days Ago

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default TeacherProfile;