import { useEffect, useState } from "react";
import { ArrowLeft, Save, RotateCcw, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { addStudent } from "../../services/studentService";
import { getClasses } from "../../services/classService";
import { uploadStudentPhoto } from "../../services/uploadService";

const AddStudent = () => {

    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(false);

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const [preview, setPreview] = useState("");

    const [formData, setFormData] = useState({

        grNumber: "",

        fullName: "",

        fatherName: "",

        motherName: "",

        gender: "",

        dateOfBirth: "",

        parentMobile: "",

        standard: "",

        division: "",

        classId: "",

        address: "",

        admissionDate: "",

        status: "Active"

    });

    useEffect(() => {

        loadClasses();

    }, []);

    const loadClasses = async () => {

        try {

            const response = await getClasses();

            if (response.success) {

                setClasses(response.classes);

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

            alert("Image size should be less than 2 MB");

            return;

        }

        const allowed = [

            "image/jpeg",

            "image/jpg",

            "image/png",

            "image/webp"

        ];

        if (!allowed.includes(file.type)) {

            alert("Only JPG, PNG and WEBP images are allowed.");

            return;

        }

        setSelectedPhoto(file);

        setPreview(URL.createObjectURL(file));

    };

    const handleReset = () => {

        setFormData({

            grNumber: "",

            fullName: "",

            fatherName: "",

            motherName: "",

            gender: "",

            dateOfBirth: "",

            parentMobile: "",

            standard: "",

            division: "",

            classId: "",

            address: "",

            admissionDate: "",

            status: "Active"

        });

        setSelectedPhoto(null);

        setPreview("");

    };


// ======================================================
// Save Student
// ======================================================

const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        setLoading(true);

        // ----------------------------
        // Save Student Details
        // ----------------------------

        const response = await addStudent(formData);

if (selectedPhoto) {

    await uploadStudentPhoto(

        response.student._id,

        selectedPhoto

    );

}

navigate("/students");
        if (!response.success) {

            throw new Error("Unable to save student");

        }

        // ----------------------------
        // Upload Photo (Optional)
        // ----------------------------

        if (selectedPhoto) {

            await uploadStudentPhoto(

                response.student._id,

                selectedPhoto

            );

        }

        console.log("Student Added Successfully");

        navigate("/students");

    } catch (error) {

        console.log(error);

        alert(

            error.response?.data?.message ||

            error.message ||

            "Something went wrong"

        );

    } finally {

        setLoading(false);

    }

};


  return (

    <div className="p-8 bg-[#F5F7FB] min-h-full">

          <div className="flex items-center justify-between mb-8">

            <div className="flex items-center gap-4">

              <button
                onClick={() => navigate("/students")}
                className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
              >

                <ArrowLeft size={22} />

              </button>

              <div>

                <h1 className="text-4xl font-bold text-slate-800">
                  Add Student
                </h1>

                <p className="mt-2 text-slate-500">
                  Fill student details below.
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
    type="submit"
    disabled={loading}
    className={`

        min-w-[180px]

        rounded-xl

        bg-[#5B2EFF]

        px-8

        py-3

        text-white

        font-semibold

        shadow-lg

        transition-all

        duration-300

        hover:bg-[#4724db]

        hover:scale-105

        disabled:opacity-60

        disabled:cursor-not-allowed

        disabled:hover:scale-100

    `}
>

    {

        loading ? (

            <div className="flex items-center justify-center gap-3">

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

                Saving...

            </div>

        ) : (

            <div className="flex items-center gap-2">

                <Save size={18} />

                Save Student

            </div>

        )

    }

</button>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="rounded-3xl bg-white p-8 shadow">

              <h2 className="mb-8 text-2xl font-bold">
                Student Information
              </h2>

              {/* ====================================================== */}
{/* Student Photo */}
{/* ====================================================== */}

<div className="mb-12 flex justify-center">

    <div className="relative">

        {
            preview ? (

                <img

                    src={preview}

                    alt="Student"

                    className="w-40 h-40 rounded-full object-cover border-[6px] border-white shadow-2xl"

                />

            ) : (

                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-[6px] border-white shadow-2xl flex items-center justify-center">

                    <Camera

                        size={50}

                        className="text-slate-400"

                    />

                </div>

            )
        }

        {/* Camera Button */}

        <label

            htmlFor="studentPhoto"

            className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#5B2EFF] hover:bg-[#4724db] text-white flex items-center justify-center cursor-pointer shadow-xl transition-all duration-300 hover:scale-110"

        >

            <Camera size={20} />

        </label>

        {/* Hidden Input */}

        <input

            id="studentPhoto"

            type="file"

            accept=".jpg,.jpeg,.png,.webp"

            className="hidden"

            onChange={handlePhoto}

        />

    </div>

</div>

<div className="text-center mb-10">

    <h3 className="text-xl font-semibold text-slate-700">

        Student Photo

    </h3>

    <p className="text-sm text-slate-500 mt-2">

        JPG, PNG or WEBP (Maximum 2 MB)

    </p>

</div>

              <div className="grid grid-cols-2 gap-6">

                <div>

                  <label className="mb-2 block font-medium">
                    GR Number
                  </label>

                  <input
                    type="text"
                    name="grNumber"
                    value={formData.grNumber}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                  />

                </div>

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
                    Father Name
                  </label>

                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Mother Name
                  </label>

                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
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
                    Date Of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#5B2EFF]">
                    Student password is generated automatically from Date of Birth.
                    Example: 10/10/2005 becomes 101005.
                </p>

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Parent Mobile
                  </label>

                  <input
                    type="text"
                    name="parentMobile"
                    value={formData.parentMobile}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Standard
                  </label>

                  <input
                    type="number"
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Division
                  </label>

                  <input
                    type="text"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Class
                  </label>

                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border px-4 outline-none focus:border-[#5B2EFF]"
                  >

                    <option value="">
                      Select Class
                    </option>

                    {classes.map((item) => (

                      <option
                        key={item._id}
                        value={item._id}
                      >

                        {item.className} - {item.roomNumber}

                      </option>

                    ))}

                  </select>

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
    disabled={loading}
    className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-medium shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
>

    Reset

</button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#5B2EFF] px-10 py-3 text-white hover:bg-[#4724db]"
              >

                {loading ? "Saving..." : "Save Student"}

              </button>

            </div>

          </form>

            </div>

);

};

export default AddStudent;
