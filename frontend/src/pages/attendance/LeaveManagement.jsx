import { useEffect, useState } from "react";
import { Search, RefreshCw, Plane } from "lucide-react";

import { getLeaves, updateLeaveStatus } from "../../services/leaveService";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLE = {

    Pending: "bg-yellow-100 text-yellow-700",

    Approved: "bg-green-100 text-green-700",

    Rejected: "bg-red-100 text-red-700"

};

const LeaveManagement = () => {

    const { user } = useAuth();

    const [leaves, setLeaves] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {

        loadLeaves();

    }, [statusFilter]);

    const loadLeaves = async () => {

        try {

            setLoading(true);

            const response = await getLeaves(

                statusFilter ? { status: statusFilter } : {}

            );

            setLeaves(response.leaves || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleStatusUpdate = async (id, status) => {

        if (

            !window.confirm(

                `${status === "Approved" ? "Approve" : "Reject"} this leave request?`

            )

        ) {

            return;

        }

        try {

            setActionLoading(id);

            await updateLeaveStatus(id, status);

            loadLeaves();

        } catch (error) {

            alert(

                error.response?.data?.message ||

                "Unable to update leave status"

            );

        } finally {

            setActionLoading(null);

        }

    };

    const filteredLeaves = leaves.filter((leave) => {

        if (!search) return true;

        const name =
            leave.studentId?.fullName?.toLowerCase() || "";

        const gr =
            leave.studentId?.grNumber?.toLowerCase() || "";

        return (

            name.includes(search.toLowerCase()) ||

            gr.includes(search.toLowerCase())

        );

    });

    const pendingCount = leaves.filter(

        (l) => l.status === "Pending"

    ).length;

    const approvedCount = leaves.filter(

        (l) => l.status === "Approved"

    ).length;

    const rejectedCount = leaves.filter(

        (l) => l.status === "Rejected"

    ).length;

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-slate-800">

                    Leave Management

                </h1>

                <p className="mt-2 text-slate-500">

                    Review and action student leave requests.

                </p>

            </div>

            {/* ===================== Summary Cards ===================== */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                <div className="bg-gradient-to-br from-yellow-50 to-white rounded-3xl p-6 border border-yellow-100 shadow">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-yellow-600 font-semibold text-sm">

                                Pending

                            </p>

                            <h2 className="text-4xl font-bold mt-2">

                                {pendingCount}

                            </h2>

                            <p className="text-gray-400 mt-1 text-sm">

                                Awaiting action

                            </p>

                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">

                            <Plane size={30} className="text-yellow-600" />

                        </div>

                    </div>

                </div>

                <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 border border-green-100 shadow">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-green-600 font-semibold text-sm">

                                Approved

                            </p>

                            <h2 className="text-4xl font-bold mt-2">

                                {approvedCount}

                            </h2>

                            <p className="text-gray-400 mt-1 text-sm">

                                Total approved

                            </p>

                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">

                            ✅

                        </div>

                    </div>

                </div>

                <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl p-6 border border-red-100 shadow">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-red-600 font-semibold text-sm">

                                Rejected

                            </p>

                            <h2 className="text-4xl font-bold mt-2">

                                {rejectedCount}

                            </h2>

                            <p className="text-gray-400 mt-1 text-sm">

                                Total rejected

                            </p>

                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-2xl">

                            ❌

                        </div>

                    </div>

                </div>

            </div>

            {/* ===================== Filters ===================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-7">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="md:col-span-2">

                        <div className="flex items-center bg-gray-100 rounded-xl px-4">

                            <Search
                                size={18}
                                className="text-gray-500"
                            />

                            <input
                                type="text"
                                placeholder="Search by student name or GR number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent px-3 py-3 outline-none"
                            />

                        </div>

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 outline-none"
                    >

                        <option value="">All Status</option>

                        <option value="Pending">Pending</option>

                        <option value="Approved">Approved</option>

                        <option value="Rejected">Rejected</option>

                    </select>

                </div>

                <div className="flex justify-end mt-4">

                    <button
                        onClick={() => {

                            setSearch("");

                            setStatusFilter("");

                        }}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition"
                    >

                        <RefreshCw size={16} />

                        Reset

                    </button>

                </div>

            </div>

            {/* ===================== Table ===================== */}

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

                                        Student

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Class

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Reason

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        From

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        To

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Days

                                    </th>

                                    <th className="text-left px-6 py-4">

                                        Status

                                    </th>

                                    {

                                        user?.role !== "student" && (

                                            <th className="text-center px-6 py-4">

                                                Actions

                                            </th>

                                        )

                                    }

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    filteredLeaves.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="text-center py-16"
                                            >

                                                <Plane
                                                    size={56}
                                                    className="mx-auto text-gray-300 mb-4"
                                                />

                                                <h2 className="text-xl font-semibold text-gray-600">

                                                    No Leave Requests

                                                </h2>

                                                <p className="text-gray-400 mt-2">

                                                    No leave requests found.

                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredLeaves.map((leave) => {

                                            const fromDate = new Date(leave.fromDate);

                                            const toDate = new Date(leave.toDate);

                                            const days =
                                                Math.ceil(

                                                    (toDate - fromDate) /

                                                    (1000 * 60 * 60 * 24)

                                                ) + 1;

                                            const isPending =
                                                leave.status === "Pending";

                                            return (

                                                <tr
                                                    key={leave._id}
                                                    className="border-t hover:bg-gray-50 transition"
                                                >

                                                    <td className="px-6 py-4">

                                                        <p className="font-semibold text-gray-800">

                                                            {leave.studentId?.fullName || "-"}

                                                        </p>

                                                        <p className="text-sm text-gray-500">

                                                            GR : {leave.studentId?.grNumber || "-"}

                                                        </p>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        {

                                                            leave.studentId?.standard

                                                                ? `Std ${leave.studentId.standard} - ${leave.studentId.division}`

                                                                : "-"

                                                        }

                                                    </td>

                                                    <td className="px-6 py-4 max-w-xs">

                                                        <p className="text-gray-700 truncate">

                                                            {leave.reason}

                                                        </p>

                                                    </td>

                                                    <td className="px-6 py-4 text-gray-600">

                                                        {fromDate.toLocaleDateString(

                                                            undefined,

                                                            {

                                                                day: "2-digit",

                                                                month: "short",

                                                                year: "numeric"

                                                            }

                                                        )}

                                                    </td>

                                                    <td className="px-6 py-4 text-gray-600">

                                                        {toDate.toLocaleDateString(

                                                            undefined,

                                                            {

                                                                day: "2-digit",

                                                                month: "short",

                                                                year: "numeric"

                                                            }

                                                        )}

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">

                                                            {days} {days === 1 ? "Day" : "Days"}

                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span

                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[leave.status]}`}

                                                        >

                                                            {leave.status}

                                                        </span>

                                                    </td>

                                                    {

                                                        user?.role !== "student" && (

                                                            <td className="px-6 py-4">

                                                                <div className="flex items-center justify-center gap-2">

                                                                    {

                                                                        isPending ? (

                                                                            <>

                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleStatusUpdate(
                                                                                            leave._id,
                                                                                            "Approved"
                                                                                        )
                                                                                    }
                                                                                    disabled={actionLoading === leave._id}
                                                                                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition disabled:opacity-60"
                                                                                >

                                                                                    {

                                                                                        actionLoading === leave._id

                                                                                            ? "..."

                                                                                            : "Approve"

                                                                                    }

                                                                                </button>

                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleStatusUpdate(
                                                                                            leave._id,
                                                                                            "Rejected"
                                                                                        )
                                                                                    }
                                                                                    disabled={actionLoading === leave._id}
                                                                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition disabled:opacity-60"
                                                                                >

                                                                                    Reject

                                                                                </button>

                                                                            </>

                                                                        ) : (

                                                                            <span className="text-gray-400 text-sm">

                                                                                {leave.status}

                                                                            </span>

                                                                        )

                                                                    }

                                                                </div>

                                                            </td>

                                                        )

                                                    }

                                                </tr>

                                            );

                                        })

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

export default LeaveManagement;