import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {

    getTeachers,

    deleteTeacher,

    searchTeachers

} from "../../services/teacherService";

const Teachers = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [teachers, setTeachers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [subject, setSubject] = useState("");

    const [gender, setGender] = useState("");

    const [status, setStatus] = useState("");

    useEffect(() => {

        loadTeachers();

    }, []);

    const loadTeachers = async () => {

        try {

            setLoading(true);

            const response = await getTeachers();

            setTeachers(response.teachers || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleSearch = async () => {

        if (!search.trim()) {

            loadTeachers();

            return;

        }

        try {

            const response = await searchTeachers(search);

            setTeachers(response.teachers || []);

        } catch (error) {

            console.log(error);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this teacher?")) {

            return;

        }

        try {

            await deleteTeacher(id);

            loadTeachers();

        } catch (error) {

            console.log(error);

        }

    };

    const filteredTeachers = teachers.filter((teacher) => {

        const subjectMatch = subject
            ? teacher.subject === subject
            : true;

        const genderMatch = gender
            ? teacher.gender === gender
            : true;

        const statusMatch = status
            ? teacher.status === status
            : true;

        return subjectMatch && genderMatch && statusMatch;

    });

    const subjectOptions = [...new Set(teachers.map((t) => t.subject).filter(Boolean))];

    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-gray-800">

                        Teachers

                    </h1>

                    <p className="text-gray-500 mt-1">

                        Total Teachers : {filteredTeachers.length}

                    </p>

                </div>

                {

                    user?.role === "admin" && (

                        <button
                            onClick={() => navigate("/teachers/add")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                        >

                            <Plus size={18} />

                            Add Teacher

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
                                placeholder="Search by Teacher Name..."
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
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">

                            All Subjects

                        </option>

                        {

                            subjectOptions.map((sub) => (

                                <option
                                    key={sub}
                                    value={sub}
                                >

                                    {sub}

                                </option>

                            ))

                        }

                    </select>

                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">

                            All Genders

                        </option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                        <option value="Other">Other</option>

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

                            setSubject("");

                            setGender("");

                            setStatus("");

                            loadTeachers();

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

                                        Teacher

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Subject

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Qualification

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Mobile

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

                                    filteredTeachers.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center py-16"
                                            >

                                                <GraduationCap
                                                    size={60}
                                                    className="mx-auto text-gray-300 mb-4"
                                                />

                                                <h2 className="text-xl font-semibold text-gray-600">

                                                    No Teachers Found

                                                </h2>

                                                <p className="text-gray-400 mt-2">

                                                    Try changing the search or filters.

                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredTeachers.map((teacher) => (

                                            <tr
                                                key={teacher._id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

                                                <td className="px-6 py-4">

                                                    {

                                                        teacher.photo ? (

                                                            <img
                                                                src={`http://localhost:5000/uploads/teachers/${teacher.photo}`}
                                                                alt={teacher.fullName}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />

                                                        ) : (

                                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">

                                                                {teacher.fullName.charAt(0)}

                                                            </div>

                                                        )

                                                    }

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className="font-semibold text-gray-800">

                                                            {teacher.fullName}

                                                        </p>

                                                        <p className="text-sm text-gray-500">

                                                            {teacher.gender}

                                                        </p>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    {teacher.subject}

                                                </td>

                                                <td className="px-6 py-4">

                                                    {teacher.qualification}

                                                </td>

                                                <td className="px-6 py-4">

                                                    {teacher.mobile}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            teacher.status === "Active"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >

                                                        {teacher.status}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center justify-center gap-2">

                                                        <button
                                                            onClick={() => navigate(`/teachers/${teacher._id}`)}
                                                            className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition"
                                                        >

                                                            View

                                                        </button>

                                                        {

                                                            user?.role === "admin" && (

                                                                <button
                                                                    onClick={() => navigate(`/teachers/edit/${teacher._id}`)}
                                                                    className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition"
                                                                >

                                                                    Edit

                                                                </button>

                                                            )

                                                        }

                                                        {

                                                            user?.role === "admin" && (

                                                                <button
                                                                    onClick={() => handleDelete(teacher._id)}
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

export default Teachers;