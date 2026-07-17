import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    CalendarCheck,
    ClipboardCheck,
    FileText,
    GraduationCap,
    MessageSquareText,
    School,
    Sparkles,
    UserCheck,
    Users,
    UserX
} from "lucide-react";

import DashboardCard from "../../components/dashboard/DashboardCard";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/dashboardService";

const Dashboard = () => {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(
        user?.role !== "student"
    );

    useEffect(() => {
        if (user?.role === "student") {
            setLoading(false);
            return;
        }

        const loadDashboard = async () => {
            try {
                const response = await getDashboardStats();

                setDashboard(response);
            } catch (error) {
                console.log("DASHBOARD ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [user?.role]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#5B2EFF] border-t-transparent" />

                    <p className="mt-4 font-semibold text-gray-600">
                        Loading Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (user?.role === "student") {
        return <StudentDashboard user={user} />;
    }

    return <StaffDashboard dashboard={dashboard} user={user} />;
};

// ======================================================
// Student Friendly Dashboard
// ======================================================

const StudentDashboard = ({ user }) => {
    const cards = [
        {
            title: "My Homework",
            text: "View assignments and submit your work.",
            path: "/homework/my",
            icon: <BookOpen size={25} />,
            color: "from-violet-500 to-purple-600"
        },
        {
            title: "My Attendance",
            text: "Check your daily attendance record.",
            path: "/attendance/today",
            icon: <CalendarCheck size={25} />,
            color: "from-sky-500 to-blue-600"
        },
        {
            title: "My Results",
            text: "See your marks and exam results.",
            path: "/exams/my-results",
            icon: <FileText size={25} />,
            color: "from-emerald-500 to-teal-600"
        },
        {
            title: "Notice Board",
            text: "Read important school announcements.",
            path: "/notices/board",
            icon: <MessageSquareText size={25} />,
            color: "from-orange-500 to-amber-500"
        }
    ];

    return (
        <div className="mx-auto max-w-7xl">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#2B1CFF] via-[#5B2EFF] to-[#3A63FF] p-6 text-white shadow-xl sm:p-10">
                <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                            <Sparkles size={17} />
                            Student Dashboard
                        </div>

                        <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">
                            Hello, {user?.name || "Student"}! 👋
                        </h1>

                        <p className="mt-3 max-w-xl text-white/80">
                            Learn something new, complete your work, and make
                            today a great day.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur">
                        <p className="text-sm text-white/70">
                            Your GR Number
                        </p>

                        <p className="mt-1 text-xl font-extrabold">
                            {user?.grNumber || "Student"}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-8">
                <div className="mb-5">
                    <p className="font-bold uppercase tracking-widest text-[#5B2EFF]">
                        Quick Access
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-gray-800">
                        What would you like to do?
                    </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Link
                            key={card.path}
                            to={card.path}
                            className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div
                                className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${card.color}`}
                            >
                                {card.icon}
                            </div>

                            <h3 className="mt-5 text-xl font-extrabold text-gray-800">
                                {card.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {card.text}
                            </p>

                            <p className="mt-5 font-bold text-[#5B2EFF]">
                                Open →
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-3 text-[#5B2EFF] shadow-sm">
                            <ClipboardCheck size={25} />
                        </div>

                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800">
                                Stay Ready
                            </h2>

                            <p className="text-sm text-gray-500">
                                Check your homework every day.
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 leading-7 text-gray-600">
                        Complete your assignments on time and submit them before
                        the due date. Your teachers are ready to help you learn.
                    </p>

                    <Link
                        to="/homework/my"
                        className="mt-6 inline-flex rounded-xl bg-[#5B2EFF] px-5 py-3 font-bold text-white hover:bg-[#4820d6]"
                    >
                        View Homework
                    </Link>
                </div>

                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-3 text-amber-500 shadow-sm">
                            <School size={25} />
                        </div>

                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800">
                                School Notice Board
                            </h2>

                            <p className="text-sm text-gray-500">
                                Never miss an important update.
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 leading-7 text-gray-600">
                        Read the latest announcements about school activities,
                        exams, events, holidays, and more.
                    </p>

                    <Link
                        to="/notices/board"
                        className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 font-bold text-white hover:bg-amber-600"
                    >
                        Open Notice Board
                    </Link>
                </div>
            </section>
        </div>
    );
};

// ======================================================
// Admin and Teacher Dashboard
// ======================================================

const StaffDashboard = ({ dashboard, user }) => {
    const stats = dashboard?.stats || {};
    const recentStudents = dashboard?.recentStudents || [];
    const recentTeachers = dashboard?.recentTeachers || [];

    return (
        <div className="mx-auto max-w-7xl">
            <div className="mb-8">
                <p className="font-bold uppercase tracking-widest text-[#5B2EFF]">
                    {user?.role === "admin"
                        ? "Administration"
                        : "Teacher Portal"}
                </p>

                <h1 className="mt-2 text-3xl font-extrabold text-gray-800 sm:text-4xl">
                    Welcome back, {user?.name || "User"}
                </h1>

                <p className="mt-2 text-gray-500">
                    Here is the latest overview of your school.
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                <DashboardCard
                    title="Students"
                    value={stats.totalStudents || 0}
                    icon={<Users size={28} />}
                    color="bg-blue-500"
                />

                <DashboardCard
                    title="Teachers"
                    value={stats.totalTeachers || 0}
                    icon={<GraduationCap size={28} />}
                    color="bg-green-500"
                />

                <DashboardCard
                    title="Classes"
                    value={stats.totalClasses || 0}
                    icon={<School size={28} />}
                    color="bg-orange-500"
                />

                <DashboardCard
                    title="Active"
                    value={stats.activeStudents || 0}
                    icon={<UserCheck size={28} />}
                    color="bg-emerald-500"
                />

                <DashboardCard
                    title="Inactive"
                    value={stats.inactiveStudents || 0}
                    icon={<UserX size={28} />}
                    color="bg-red-500"
                />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <section className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-gray-800">
                            Recent Students
                        </h2>

                        <Users className="text-blue-500" />
                    </div>

                    <div className="mt-4">
                        {recentStudents.length === 0 ? (
                            <p className="py-5 text-gray-500">
                                No students found.
                            </p>
                        ) : (
                            recentStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className="flex items-center justify-between border-b py-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {student.fullName}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            GR: {student.grNumber}
                                        </p>
                                    </div>

                                    <p className="text-right text-sm font-semibold text-gray-600">
                                        Std. {student.standard}
                                        <br />
                                        Div. {student.division}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-gray-800">
                            Recent Teachers
                        </h2>

                        <GraduationCap className="text-green-500" />
                    </div>

                    <div className="mt-4">
                        {recentTeachers.length === 0 ? (
                            <p className="py-5 text-gray-500">
                                No teachers found.
                            </p>
                        ) : (
                            recentTeachers.map((teacher) => (
                                <div
                                    key={teacher._id}
                                    className="flex items-center justify-between border-b py-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {teacher.fullName}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {teacher.mobile}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                        {teacher.subject}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-gray-800">
                    Quick Actions
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        to="/students/add"
                        className="rounded-2xl bg-blue-500 p-5 font-bold text-white transition hover:bg-blue-600"
                    >
                        Add Student
                    </Link>

                    {user?.role === "admin" && (
                        <Link
                            to="/teachers/add"
                            className="rounded-2xl bg-green-500 p-5 font-bold text-white transition hover:bg-green-600"
                        >
                            Add Teacher
                        </Link>
                    )}

                    <Link
                        to="/attendance/mark"
                        className="rounded-2xl bg-orange-500 p-5 font-bold text-white transition hover:bg-orange-600"
                    >
                        Mark Attendance
                    </Link>

                    <Link
                        to="/homework/create"
                        className="rounded-2xl bg-purple-500 p-5 font-bold text-white transition hover:bg-purple-600"
                    >
                        Create Homework
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;