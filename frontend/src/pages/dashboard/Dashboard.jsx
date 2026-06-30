import { useEffect, useState } from "react";

import {
    Users,
    GraduationCap,
    School,
    UserCheck,
    UserX,
    UserPlus,
    BookOpen,
    CalendarDays
} from "lucide-react";

import DashboardCard from "../../components/dashboard/DashboardCard";

import { getDashboardStats } from "../../services/dashboardService";

const Dashboard = () => {

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const response = await getDashboardStats();

            setDashboard(response);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="h-screen flex items-center justify-center text-xl font-semibold">

                Loading Dashboard...

            </div>

        );

    }

    return (

        <div className="p-8 bg-gray-100 min-h-screen">

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-4xl font-bold text-gray-800">

                        Dashboard

                    </h1>

                    <p className="text-gray-500 mt-2">

                        Welcome to KailashNagar School ERP

                    </p>

                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">

                <DashboardCard
                    title="Students"
                    value={dashboard.stats.totalStudents}
                    icon={<Users size={28} />}
                    color="bg-blue-500"
                />

                <DashboardCard
                    title="Teachers"
                    value={dashboard.stats.totalTeachers}
                    icon={<GraduationCap size={28} />}
                    color="bg-green-500"
                />

                <DashboardCard
                    title="Classes"
                    value={dashboard.stats.totalClasses}
                    icon={<School size={28} />}
                    color="bg-orange-500"
                />

                <DashboardCard
                    title="Active"
                    value={dashboard.stats.activeStudents}
                    icon={<UserCheck size={28} />}
                    color="bg-emerald-500"
                />

                <DashboardCard
                    title="Inactive"
                    value={dashboard.stats.inactiveStudents}
                    icon={<UserX size={28} />}
                    color="bg-red-500"
                />

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
                                <div className="bg-white rounded-2xl shadow-md p-6">

                    <div className="flex items-center justify-between mb-6">

                        <h2 className="text-xl font-bold text-gray-800">

                            Recent Students

                        </h2>

                        <UserPlus className="text-blue-500" />

                    </div>

                    {

                        dashboard.recentStudents.length === 0 ? (

                            <p className="text-gray-500">

                                No Students Found

                            </p>

                        ) : (

                            dashboard.recentStudents.map((student) => (

                                <div
                                    key={student._id}
                                    className="flex items-center justify-between py-4 border-b last:border-none"
                                >

                                    <div>

                                        <h3 className="font-semibold text-gray-800">

                                            {student.fullName}

                                        </h3>

                                        <p className="text-sm text-gray-500">

                                            {student.grNumber}

                                        </p>

                                    </div>

                                    <div className="text-right">

                                        <p className="font-semibold">

                                            Std {student.standard}

                                        </p>

                                        <p className="text-gray-500">

                                            Div {student.division}

                                        </p>

                                    </div>

                                </div>

                            ))

                        )

                    }

                </div>

                <div className="bg-white rounded-2xl shadow-md p-6">

                    <div className="flex items-center justify-between mb-6">

                        <h2 className="text-xl font-bold text-gray-800">

                            Recent Teachers

                        </h2>

                        <GraduationCap className="text-green-500" />

                    </div>

                    {

                        dashboard.recentTeachers.length === 0 ? (

                            <p className="text-gray-500">

                                No Teachers Found

                            </p>

                        ) : (

                            dashboard.recentTeachers.map((teacher) => (

                                <div
                                    key={teacher._id}
                                    className="flex items-center justify-between py-4 border-b last:border-none"
                                >

                                    <div>

                                        <h3 className="font-semibold text-gray-800">

                                            {teacher.fullName}

                                        </h3>

                                        <p className="text-sm text-gray-500">

                                            {teacher.mobile}

                                        </p>

                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">

                                        {teacher.subject}

                                    </span>

                                </div>

                            ))

                        )

                    }

                </div>

            </div>

            <div className="mt-10 bg-white rounded-2xl shadow-md p-6">

                <div className="flex items-center gap-3 mb-6">

                    <CalendarDays className="text-purple-500" />

                    <h2 className="text-xl font-bold">

                        Quick Actions

                    </h2>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    <button className="h-24 rounded-xl bg-blue-500 text-white font-semibold hover:scale-105 transition">

                        Add Student

                    </button>

                    <button className="h-24 rounded-xl bg-green-500 text-white font-semibold hover:scale-105 transition">

                        Add Teacher

                    </button>

                    <button className="h-24 rounded-xl bg-orange-500 text-white font-semibold hover:scale-105 transition">

                        Attendance

                    </button>

                    <button className="h-24 rounded-xl bg-purple-500 text-white font-semibold hover:scale-105 transition">

                        Homework

                    </button>

                </div>

            </div>

        </div>

    );

};

export default Dashboard;
