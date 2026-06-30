import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Pencil,
    User,
    Phone,
    GraduationCap,
    MapPin,
    Calendar
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getStudentById } from "../../services/studentService";
import { uploadStudentPhoto } from "../../services/uploadService";

const StudentProfile = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const { user } = useAuth();

    const [student, setStudent] = useState(null);

    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {

        loadStudent();

    }, []);

    const loadStudent = async () => {

        try {

            const response = await getStudentById(id);

            setStudent(response.student);

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

        const response = await uploadStudentPhoto(

            student._id,

            file

        );

        if (response.success) {

            setStudent({

                ...student,

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

    const loadImage = (src) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

    const handleDownloadIdCard = async () => {

        const width = 700;
        const height = 440;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Card background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);

        // Header band
        const headerHeight = 110;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "#1e3a8a");
        gradient.addColorStop(1, "#4f46e5");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, headerHeight);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px Arial";
        ctx.textBaseline = "middle";
        ctx.fillText("STUDENT IDENTITY CARD", 30, 45);

        ctx.font = "16px Arial";
        ctx.fillStyle = "#dbeafe";
        ctx.fillText(`GR Number: ${student.grNumber || "-"}`, 30, 80);

        // Photo box
        const photoX = width - 200;
        const photoY = headerHeight + 30;
        const photoSize = 160;

        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(photoX, photoY, photoSize, photoSize);
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX, photoY, photoSize, photoSize);

        try {
            if (student.photo) {
                const img = await loadImage(
                    `http://localhost:5000/uploads/students/${student.photo}`
                );
                ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
                ctx.strokeRect(photoX, photoY, photoSize, photoSize);
            } else {
                throw new Error("No photo");
            }
        } catch (err) {
            ctx.fillStyle = "#9ca3af";
            ctx.font = "bold 60px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                (student.fullName || "?").charAt(0).toUpperCase(),
                photoX + photoSize / 2,
                photoY + photoSize / 2
            );
            ctx.textAlign = "left";
        }

        // Details
        const labelX = 30;
        let y = headerHeight + 50;
        const lineGap = 36;

        ctx.fillStyle = "#111827";
        ctx.font = "bold 24px Arial";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(student.fullName || "-", labelX, y);
        y += lineGap + 4;

        const fields = [
            ["Class", `Std ${student.standard || "-"} - ${student.division || "-"}`],
            ["Date of Birth", student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : "-"],
            ["Parent Mobile", student.parentMobile || "-"],
            ["Address", student.address || "-"],
            ["Status", student.status || "-"]
        ];

        ctx.font = "15px Arial";
        fields.forEach(([label, value]) => {
            ctx.fillStyle = "#6b7280";
            ctx.fillText(`${label}`, labelX, y);
            ctx.fillStyle = "#111827";
            ctx.font = "bold 15px Arial";
            const wrapped = String(value).slice(0, 38);
            ctx.fillText(wrapped, labelX + 140, y);
            ctx.font = "15px Arial";
            y += lineGap;
        });

        // Footer strip
        ctx.fillStyle = "#1e3a8a";
        ctx.fillRect(0, height - 14, width, 14);

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${student.fullName || "student"}-id-card.png`;
        link.click();
    };

    const handlePrint = () => {
        window.print();
    };

    return (

        <div className="space-y-8" id="student-profile-print">

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #student-profile-print,
                    #student-profile-print * {
                        visibility: visible;
                    }
                    #student-profile-print {
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

            Students

            <span className="mx-2">›</span>

            Student Profile

        </p>

        <h1 className="text-4xl font-bold text-gray-800 mt-2">

            Student Profile

        </h1>

        <p className="text-gray-500 mt-2">

            View and manage student information

        </p>

    </div>

    <div className="flex flex-wrap gap-3 no-print">

        <button

            onClick={handlePrint}

            className="px-6 py-3 rounded-xl border bg-white shadow hover:shadow-md transition"

        >

            🖨 Print

        </button>

        <button

            onClick={handleDownloadIdCard}

            className="px-6 py-3 rounded-xl border bg-white shadow hover:shadow-md transition"

        >

            🪪 Download ID Card

        </button>

        {

            (user?.role === "admin" ||

                user?.role === "teacher") && (

                <button

                    onClick={() =>

                        navigate(`/students/edit/${student._id}`)

                    }

                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:scale-105 transition"

                >

                    ✏ Edit Student

                </button>

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

                    student.photo ?

                    (

                        <img

                            src={`http://localhost:5000/uploads/students/${student.photo}`}

                            alt={student.fullName}

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

                        {student.fullName}

                    </h1>

                    <span className="text-blue-600 text-2xl">

                        ✔

                    </span>

                </div>

                <div className="mt-4">

                    <span

                        className={`px-5 py-2 rounded-full font-semibold text-sm ${

                            student.status === "Active"

                                ? "bg-green-100 text-green-700"

                                : "bg-red-100 text-red-700"

                        }`}

                    >

                        {student.status}

                    </span>

                </div>

                <h2 className="text-2xl mt-6">

                    GR Number :

                    <span className="ml-2 font-bold text-indigo-600">

                        {student.grNumber}

                    </span>

                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

                    <div className="bg-white rounded-2xl p-5 shadow">

                        <p className="text-sm text-gray-500">

                            Gender

                        </p>

                        <h3 className="text-xl font-bold mt-2">

                            {student.gender}

                        </h3>

                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow">

                        <p className="text-sm text-gray-500">

                            Date Of Birth

                        </p>

                        <h3 className="text-xl font-bold mt-2">

                            {

                                new Date(

                                    student.dateOfBirth

                                ).toLocaleDateString()

                            }

                        </h3>

                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow">

                        <p className="text-sm text-gray-500">

                            Parent Mobile

                        </p>

                        <h3 className="text-xl font-bold mt-2">

                            {student.parentMobile}

                        </h3>

                    </div>

                </div>

            </div>

            <div className="hidden xl:flex flex-col gap-4">

                <div className="bg-white rounded-2xl p-6 shadow w-56">

                    <p className="text-gray-500">

                        Admission Date

                    </p>

                    <h3 className="font-bold mt-2">

                        {

                            new Date(

                                student.admissionDate

                            ).toLocaleDateString()

                        }

                    </h3>

                </div>

                <div className="bg-white rounded-2xl p-6 shadow w-56">

                    <p className="text-gray-500">

                        Class

                    </p>

                    <h3 className="font-bold mt-2">

                        Std {student.standard}

                    </h3>

                </div>

                <div className="bg-white rounded-2xl p-6 shadow w-56">

                    <p className="text-gray-500">

                        Division

                    </p>

                    <h3 className="font-bold mt-2">

                        {student.division}

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

                    Basic student details

                </p>

            </div>

        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-7">

            <InfoItem

                label="Full Name"

                value={student.fullName}

            />

            <InfoItem

                label="Father Name"

                value={student.fatherName}

            />

            <InfoItem

                label="Mother Name"

                value={student.motherName}

            />

            <InfoItem

                label="Gender"

                value={student.gender}

            />

            <InfoItem

                label="Date Of Birth"

                value={

                    new Date(

                        student.dateOfBirth

                    ).toLocaleDateString()

                }

            />

            <InfoItem

                label="Age"

                value="12 Years"

            />

            <InfoItem

                label="Parent Mobile"

                value={student.parentMobile}

            />

            <InfoItem

                label="Status"

                value={student.status}

            />

        </div>

    </div>

    {/* Academic */}

    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

        <div className="flex items-center gap-3 mb-8">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

                <GraduationCap className="text-blue-600"/>

            </div>

            <div>

                <h2 className="text-2xl font-bold">

                    Academic

                </h2>

                <p className="text-gray-500">

                    School information

                </p>

            </div>

        </div>

        <div className="space-y-6">

            <InfoItem

                label="Class"

                value={`Std ${student.standard}`}

            />

            <InfoItem

                label="Division"

                value={student.division}

            />

            <InfoItem

                label="Admission Date"

                value={

                    new Date(

                        student.admissionDate

                    ).toLocaleDateString()

                }

            />

            <InfoItem

                label="Class Room"

                value={

                    student.classId

                    ?

                    `${student.classId.className}

                    (${student.classId.roomNumber})`

                    :

                    "-"

                }

            />

            <InfoItem

                label="Academic Year"

                value="2026 - 2027"

            />

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

            label="Parent Mobile"

            value={student.parentMobile}

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

            {student.address}

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

                    92%

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

            <div className="h-full w-[92%] rounded-full bg-indigo-600"></div>

        </div>

    </div>

    {/* Homework */}

    <div className="group bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 border border-green-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

        <div className="flex justify-between">

            <div>

                <p className="text-green-600 font-semibold">

                    Homework

                </p>

                <h2 className="text-4xl font-bold mt-3">

                    18

                </h2>

                <p className="text-gray-500">

                    Submitted

                </p>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">

                <GraduationCap

                    className="text-green-600"

                    size={32}

                />

            </div>

        </div>

        <div className="mt-6 h-2 rounded-full bg-green-100">

            <div className="w-[90%] h-full bg-green-500 rounded-full"></div>

        </div>

    </div>

    {/* Exams */}

    <div className="group bg-gradient-to-br from-orange-50 to-white rounded-3xl p-6 border border-orange-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

        <div className="flex justify-between">

            <div>

                <p className="text-orange-600 font-semibold">

                    Exams

                </p>

                <h2 className="text-4xl font-bold mt-3">

                    4

                </h2>

                <p className="text-gray-500">

                    Completed

                </p>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

                🏆

            </div>

        </div>

        <div className="mt-6 h-2 rounded-full bg-orange-100">

            <div className="w-[75%] h-full bg-orange-500 rounded-full"></div>

        </div>

    </div>

    {/* Average */}

    <div className="group bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 border border-blue-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

        <div className="flex justify-between">

            <div>

                <p className="text-blue-600 font-semibold">

                    Average Score

                </p>

                <h2 className="text-4xl font-bold mt-3">

                    86%

                </h2>

                <p className="text-gray-500">

                    Overall

                </p>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">

                ⭐

            </div>

        </div>

        <div className="mt-6 h-2 rounded-full bg-blue-100">

            <div className="w-[86%] h-full bg-blue-500 rounded-full"></div>

        </div>

    </div>

</div>

{/* ================= Student Activity ================= */}

<div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

    {/* Recent Attendance */}

    <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100">

        <div className="flex items-center justify-between p-7 border-b">

            <div>

                <h2 className="text-2xl font-bold">

                    Recent Attendance

                </h2>

                <p className="text-gray-500 mt-1">

                    Last 7 attendance records

                </p>

            </div>

            <button className="text-indigo-600 font-semibold hover:underline no-print">

                View All

            </button>

        </div>

        <div className="overflow-x-auto">

            <table className="w-full">

                <thead className="bg-gray-50">

                    <tr>

                        <th className="text-left px-6 py-4">

                            Date

                        </th>

                        <th className="text-left px-6 py-4">

                            Day

                        </th>

                        <th className="text-left px-6 py-4">

                            Status

                        </th>

                        <th className="text-left px-6 py-4">

                            Teacher

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {[

                        {

                            date:"15 Jul",

                            day:"Monday",

                            status:"Present",

                            teacher:"Mr. Sharma"

                        },

                        {

                            date:"14 Jul",

                            day:"Sunday",

                            status:"Present",

                            teacher:"Mr. Sharma"

                        },

                        {

                            date:"13 Jul",

                            day:"Saturday",

                            status:"Absent",

                            teacher:"Mrs. Patel"

                        },

                        {

                            date:"12 Jul",

                            day:"Friday",

                            status:"Present",

                            teacher:"Mr. Shah"

                        }

                    ].map((item,index)=>(

                        <tr

                            key={index}

                            className="border-b hover:bg-gray-50"

                        >

                            <td className="px-6 py-5">

                                {item.date}

                            </td>

                            <td className="px-6 py-5">

                                {item.day}

                            </td>

                            <td className="px-6 py-5">

                                <span

                                    className={`px-4 py-1 rounded-full text-sm font-semibold ${

                                        item.status==="Present"

                                        ?

                                        "bg-green-100 text-green-700"

                                        :

                                        "bg-red-100 text-red-700"

                                    }`}

                                >

                                    {item.status}

                                </span>

                            </td>

                            <td className="px-6 py-5">

                                {item.teacher}

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    </div>

    {/* Teacher Remark */}

    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

        <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">

                👨‍🏫

            </div>

            <div>

                <h2 className="text-xl font-bold">

                    Class Teacher

                </h2>

                <p className="text-gray-500">

                    Mr. Rajesh Sharma

                </p>

            </div>

        </div>

        <div className="mt-8 rounded-2xl bg-indigo-50 p-6">

            <p className="text-gray-700 leading-8">

                Rahul is a disciplined and hardworking student.

                He actively participates in classroom discussions,

                completes assignments on time, and maintains

                excellent attendance. Keep encouraging him to

                participate in extracurricular activities.

            </p>

        </div>

        <div className="mt-8">

            <div className="flex justify-between">

                <span className="text-gray-500">

                    Behaviour

                </span>

                <span className="font-bold text-green-600">

                    Excellent

                </span>

            </div>

            <div className="mt-5 flex justify-between">

                <span className="text-gray-500">

                    Discipline

                </span>

                <span className="font-bold text-green-600">

                    A+

                </span>

            </div>

            <div className="mt-5 flex justify-between">

                <span className="text-gray-500">

                    Participation

                </span>

                <span className="font-bold text-blue-600">

                    Active

                </span>

            </div>

        </div>

    </div>

</div>

        </div>

    );

};

export default StudentProfile;