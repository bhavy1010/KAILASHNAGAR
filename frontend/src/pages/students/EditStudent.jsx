import { useEffect, useState } from "react";
import { ArrowLeft, Save, RotateCcw, Camera } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getStudentById,
    updateStudent
} from "../../services/studentService";

import { getClasses } from "../../services/classService";
import { uploadStudentPhoto } from "../../services/uploadService";

const EditStudent = () => {

const navigate = useNavigate();

const { id } = useParams();

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

    loadStudent();

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

  const loadStudent = async () => {

    try {

        const response = await getStudentById(id);

        console.log("Student Response:", response.student);

        if (response.success) {

            const student = response.student;

            console.log("student.classId =", student.classId);

            setFormData({
                grNumber: student.grNumber || "",

                fullName: student.fullName || "",

                fatherName: student.fatherName || "",

                motherName: student.motherName || "",

                gender: student.gender || "",

                dateOfBirth: student.dateOfBirth
                    ? student.dateOfBirth.substring(0, 10)
                    : "",

                parentMobile: student.parentMobile || "",

                standard: student.standard || "",

                division: student.division || "",

                classId:
                student.classId?._id ||
                student.classId ||
                "",

                address: student.address || "",

                admissionDate: student.admissionDate
                    ? student.admissionDate.substring(0, 10)
                    : "",

                status: student.status || "Active"

            });

            setPreview(
                student.photo
                    ? `http://localhost:5000/uploads/students/${student.photo}`
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
      status: "Active",
      photo: ""

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        setLoading(true);

        const response = await updateStudent(

            id,

            formData

        );

        if (response.success && selectedPhoto) {

            await uploadStudentPhoto(

                id,

                selectedPhoto

            );

        }

        alert("Student Updated Successfully");

        navigate("/students");

    }

    catch (error) {

        console.log(error);

        alert(

            error.response?.data?.message ||

            "Unable to update student"

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
                onClick={() => navigate("/students")}
                className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
              >

                <ArrowLeft size={22} />

              </button>

              <div>

                <h1 className="text-4xl font-bold text-slate-800">
                  Edit Student
                </h1>

                <p className="mt-2 text-slate-500">
                  Update student information.
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

                {loading ? "Updating..." : "Update Student"}

              </button>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="rounded-3xl bg-white p-8 shadow">

              <h2 className="mb-8 text-2xl font-bold">
                Student Information
              </h2>

              <div className="mb-10 flex justify-center">

    <div className="relative">

        {

            preview ?

            (

                <img

                    src={preview}

                    alt="Student"

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
                className="rounded-xl border border-gray-300 px-8 py-3 hover:bg-gray-100"
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

export default EditStudent;