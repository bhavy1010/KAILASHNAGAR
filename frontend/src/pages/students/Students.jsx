import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {

    getStudents,

    deleteStudent,

    searchStudents

} from "../../services/studentService";

const Students = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [standard, setStandard] = useState("");

    const [division, setDivision] = useState("");

    const [status, setStatus] = useState("");

    useEffect(() => {

        loadStudents();

    }, []);

    const loadStudents = async () => {

        try {

            setLoading(true);

            const response = await getStudents();

            setStudents(response.students || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleSearch = async () => {

        if (!search.trim()) {

            loadStudents();

            return;

        }

        try {

            const response = await searchStudents(search);

            setStudents(response.students || []);

        } catch (error) {

            console.log(error);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this student?")) {

            return;

        }

        try {

            await deleteStudent(id);

            loadStudents();

        } catch (error) {

            console.log(error);

        }

    };

    const filteredStudents = students.filter((student) => {

        const standardMatch = standard
            ? String(student.standard) === standard
            : true;

        const divisionMatch = division
            ? student.division === division
            : true;

        const statusMatch = status
            ? student.status === status
            : true;

        return standardMatch && divisionMatch && statusMatch;

    });

    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-gray-800">

                        Students

                    </h1>

                    <p className="text-gray-500 mt-1">

                        Total Students : {filteredStudents.length}

                    </p>

                </div>

                {

                    (user?.role === "admin" || user?.role === "teacher") && (

                        <button
                            onClick={() => navigate("/students/add")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                        >

                            <Plus size={18} />

                            Add Student

                        </button>

                    )

                }

            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                      <div className="md:col-span-2">

                        <div className="flex items-center bg-gray-100 rounded-xl px-4">

                            <Search
                                size={18}
                                className="text-gray-500"
                            />

                            <input
                                type="text"
                                placeholder="Search by Student Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent px-3 py-3 outline-none"
                            />

                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                            >

                                Search

                            </button>

                        </div>

                    </div>

                    <select
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">

                            All Standards

                        </option>

                        {

                            [...Array(12)].map((_, index) => (

                                <option
                                    key={index + 1}
                                    value={index + 1}
                                >

                                    Standard {index + 1}

                                </option>

                            ))

                        }

                    </select>

                    <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">

                            All Divisions

                        </option>

                        <option value="A">A</option>

                        <option value="B">B</option>

                        <option value="C">C</option>

                        <option value="D">D</option>

                    </select>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">

                            All Status

                        </option>

                        <option value="Active">

                            Active

                        </option>

                        <option value="Inactive">

                            Inactive

                        </option>

                    </select>

                </div>

                <div className="flex justify-end mt-5">

                    <button
                        onClick={() => {

                            setSearch("");

                            setStandard("");

                            setDivision("");

                            setStatus("");

                            loadStudents();

                        }}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition"
                    >

                        <RefreshCw size={18} />

                        Reset Filters

                    </button>

                </div>

            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {

                    loading ? (

                        <div className="py-20 flex justify-center">

                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

                        </div>

                    ) : (

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="text-left px-6 py-4">

                                        Photo

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        GR Number

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Student

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Class

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Parent Mobile

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Status

                                    </th>

                                    <th className="text-center px-6 py-4">

                                        Actions

                                    </th>

                                </tr>

                            </thead>

                            <tbody>
                                                              {

                                    filteredStudents.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center py-16"
                                            >

                                                <Users
                                                    size={60}
                                                    className="mx-auto text-gray-300 mb-4"
                                                />

                                                <h2 className="text-xl font-semibold text-gray-600">

                                                    No Students Found

                                                </h2>

                                                <p className="text-gray-400 mt-2">

                                                    Try changing the search or filters.

                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredStudents.map((student) => (

                                            <tr
                                                key={student._id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

                                                <td className="px-6 py-4">

                                                    {

                                                        student.photo ? (

                                                            <img
                                                                src={`http://localhost:5000/uploads/students/${student.photo}`}
                                                                alt={student.fullName}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />

                                                        ) : (

                                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">

                                                                {student.fullName.charAt(0)}

                                                            </div>

                                                        )

                                                    }

                                                </td>

                                                <td className="px-6 py-4 font-medium">

                                                    {student.grNumber}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className="font-semibold text-gray-800">

                                                            {student.fullName}

                                                        </p>

                                                        <p className="text-sm text-gray-500">

                                                            {student.gender}

                                                        </p>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    Std {student.standard} - {student.division}

                                                </td>

                                                <td className="px-6 py-4">

                                                    {student.parentMobile}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            student.status === "Active"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >

                                                        {student.status}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center justify-center gap-2">

                                                        <button
                                                            onClick={() => navigate(`/students/${student._id}`)}
                                                            className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition"
                                                        >

                                                            View

                                                        </button>

                                                        {

                                                            (user?.role === "admin" || user?.role === "teacher") && (

                                                                <button
                                                                    onClick={() => navigate(`/students/edit/${student._id}`)}
                                                                    className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition"
                                                                >

                                                                    Edit

                                                                </button>

                                                            )

                                                        }

                                                        {

                                                            user?.role === "admin" && (

                                                                <button
                                                                    onClick={() => handleDelete(student._id)}
                                                                    className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                                                                >

                                                                    Delete

                                                                </button>

                                                            )

                                                        }

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    )

                                }

                            </tbody>

                        </table>

                    )

                }

            </div>

        </div>

    );

};

export default Students;