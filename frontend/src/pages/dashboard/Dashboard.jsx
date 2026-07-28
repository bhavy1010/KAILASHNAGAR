import { useEffect, useMemo, useState } from "react";
import {
    Award,
    BookOpen,
    CalendarCheck2,
    ChevronRight,
    GraduationCap,
    Loader2,
    Megaphone,
    School,
    Trophy,
    Users
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getPublicHomeData } from "../../services/homeService";

const Dashboard = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();

    const [data, setData] = useState({
        schoolInfo: {},
        achievements: [],
        birthdays: [],
        todayRoses: [],
        stats: {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalAchievements: 0
        }
    });

    const [loading, setLoading] = useState(true);

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const getImageUrl = (image, folder = "home") => {
        if (!image) return "";

        if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
        }

        if (image.startsWith("/")) {
            return `${serverUrl}${image}`;
        }

        return `${serverUrl}/uploads/${folder}/${image}`;
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await getPublicHomeData();

                setData({
                    schoolInfo: response.schoolInfo || {},
                    achievements: response.achievements || [],
                    birthdays: response.birthdays || [],
                    todayRoses: response.todayRoses || [],
                    stats: response.stats || {
                        totalStudents: 0,
                        totalTeachers: 0,
                        totalClasses: 0,
                        totalAchievements: 0
                    }
                });
            } catch (error) {
                console.error("Dashboard load error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const firstName = useMemo(() => {
        const name = user?.fullName || user?.name || "User";
        return name.split(" ")[0];
    }, [user]);

    const role = user?.role || "";

    const statCards = [
        {
            label: t("dashboard.totalStudents"),
            value: data.stats.totalStudents,
            icon: Users,
            color: "from-blue-500 to-cyan-500",
            bg: "bg-blue-50",
            text: "text-blue-600",
            visible: role !== "student"
        },
        {
            label: t("dashboard.totalTeachers"),
            value: data.stats.totalTeachers,
            icon: GraduationCap,
            color: "from-violet-500 to-fuchsia-500",
            bg: "bg-violet-50",
            text: "text-violet-600",
            visible: role === "admin"
        },
        {
            label: t("dashboard.totalClasses"),
            value: data.stats.totalClasses,
            icon: School,
            color: "from-amber-500 to-orange-500",
            bg: "bg-amber-50",
            text: "text-amber-600",
            visible: role !== "student"
        },
        {
            label: t("home.achievements"),
            value: data.stats.totalAchievements,
            icon: Trophy,
            color: "from-rose-500 to-pink-500",
            bg: "bg-rose-50",
            text: "text-rose-600",
            visible: true
        }
    ].filter((card) => card.visible);

    const quickActions = [
        {
            label: t("dashboard.addStudent"),
            path: "/students/add",
            icon: Users,
            color: "bg-blue-600 hover:bg-blue-700",
            roles: ["admin", "teacher"]
        },
        {
            label: t("dashboard.markAttendance"),
            path: "/attendance/mark",
            icon: CalendarCheck2,
            color: "bg-emerald-600 hover:bg-emerald-700",
            roles: ["admin", "teacher"]
        },
        {
            label: t("dashboard.createHomework"),
            path: "/homework/create",
            icon: BookOpen,
            color: "bg-violet-600 hover:bg-violet-700",
            roles: ["admin", "teacher"]
        },
        {
            label: t("dashboard.createNotice"),
            path: "/notices/create",
            icon: Megaphone,
            color: "bg-rose-600 hover:bg-rose-700",
            roles: ["admin", "teacher"]
        }
    ].filter((action) => action.roles.includes(role));

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-7 pb-10">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
                <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-pink-300/20 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-indigo-100">
                            {new Date().toLocaleDateString(
                                language === "gu" ? "gu-IN" : "en-IN",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                }
                            )}
                        </p>

                        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                            {t("dashboard.welcomeBack")}, {firstName}!
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                            {data.schoolInfo.schoolName ||
                                "Your school information is ready in one place."}
                        </p>
                    </div>

                    <Link
                        to={role === "admin" ? "/home-management" : "/"}
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                    >
                        {role === "admin"
                            ? t("homeManagement.title")
                            : t("sidebar.home")}
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        {card.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                                        {card.value}
                                    </p>
                                </div>

                                <div
                                    className={`rounded-2xl ${card.bg} ${card.text} p-3 transition duration-300 group-hover:scale-110`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>

                            <div
                                className={`mt-5 h-1.5 rounded-full bg-gradient-to-r ${card.color}`}
                            />
                        </article>
                    );
                })}
            </section>

            {quickActions.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                            <CalendarCheck2 className="h-6 w-6" />
                        </div>

                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">
                                {t("dashboard.quickActions")}
                            </h2>
                            <p className="text-sm text-slate-500">
                                Frequently used school management tasks.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <Link
                                    key={action.path}
                                    to={action.path}
                                    className={`flex items-center justify-between rounded-2xl ${action.color} p-4 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                                >
                                    <span className="text-sm font-bold">
                                        {action.label}
                                    </span>
                                    <Icon className="h-5 w-5" />
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            <div className="grid gap-7 xl:grid-cols-5">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3 sm:p-7">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">
                                {t("home.achievements")}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Latest achievements from the school.
                            </p>
                        </div>

                        <Link
                            to="/"
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                        >
                            {t("home.viewMore")}
                        </Link>
                    </div>

                    {data.achievements.length === 0 ? (
                        <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                            {t("home.noAchievements")}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {data.achievements.slice(0, 4).map((achievement) => (
                                <article
                                    key={achievement._id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 transition hover:shadow-md"
                                >
                                    {achievement.photo ? (
                                        <img
                                            src={getImageUrl(achievement.photo, "home")}
                                            alt={achievement.title}
                                            className="h-32 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-32 items-center justify-center bg-amber-50 text-amber-500">
                                            <Trophy className="h-10 w-10" />
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                                            {achievement.category || "General"}
                                        </p>
                                        <h3 className="mt-1 truncate font-bold text-slate-900">
                                            {achievement.title}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                            {achievement.description}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-7 xl:col-span-2">
                    <article className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white shadow-lg sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-white/15 p-3">
                                <Award className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-rose-100">
                                    {t("home.studentOfTheDay")}
                                </p>
                                <h2 className="text-2xl font-extrabold">
                                    {t("home.todaysRose")}
                                </h2>
                            </div>
                        </div>

                        {data.todayRoses.length > 0 ? (
                            <div className="mt-5 space-y-4">
                                {data.todayRoses.map((rose) => (
                                    <div
                                        key={rose._id}
                                        className="flex items-center gap-4 border-t border-white/20 pt-4 first:border-t-0 first:pt-0"
                                    >
                                        {rose.photo ? (
                                            <img
                                                src={getImageUrl(rose.photo, "home")}
                                                alt={rose.studentName}
                                                className="h-16 w-16 shrink-0 rounded-2xl border-4 border-white/30 object-cover sm:h-20 sm:w-20"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:h-20 sm:w-20">
                                                <GraduationCap className="h-10 w-10" />
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <h3 className="truncate text-xl font-extrabold">
                                                {rose.studentName}
                                            </h3>
                                            <p className="mt-1 text-sm text-rose-100">
                                                Class {rose.standard}-
                                                {rose.division}
                                            </p>
                                            <p className="mt-2 line-clamp-2 text-sm text-white">
                                                {rose.reason}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-rose-50">
                                {t("home.noRose")}
                            </p>
                        )}
                    </article>

                    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                                <Award className="h-6 w-6" />
                            </div>

                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    {t("home.todaysBirthdays")}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Celebrate with our students.
                                </p>
                            </div>
                        </div>

                        {data.birthdays.length === 0 ? (
                            <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                                {t("home.noBirthday")}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.birthdays.slice(0, 4).map((student) => (
                                    <div
                                        key={student._id}
                                        className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3"
                                    >
                                        {student.profilePhoto || student.photo ? (
                                            <img
                                                src={getImageUrl(
                                                    student.profilePhoto ||
                                                        student.photo,
                                                    "students"
                                                )}
                                                alt={student.fullName}
                                                className="h-11 w-11 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-200 text-amber-700">
                                                <Users className="h-5 w-5" />
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-900">
                                                {student.fullName}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                Class {student.standard}-
                                                {student.division}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;