import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Award,
    CalendarDays,
    GraduationCap,
    Heart,
    Loader2,
    LocateFixed,
    Mail,
    MapPin,
    Phone,
    School,
    Sparkles,
    Trophy,
    Users
} from "lucide-react";

import { getPublicHomeData } from "../../services/homeService";

const Home = () => {
    const [data, setData] = useState({
        schoolInfo: null,
        birthdays: [],
        todayRose: null,
        achievements: []
    });

    const [loading, setLoading] = useState(true);

    const serverUrl = (
        import.meta.env.VITE_API_URL || ""
    ).replace(/\/api\/?$/, "");

    const schoolInfo = data.schoolInfo || {};

    const getPhotoUrl = (photo) => {
        if (!photo) return "";

        if (photo.startsWith("http")) return photo;

        return `${serverUrl}${photo.startsWith("/") ? "" : "/"}${photo}`;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getPublicHomeData();

                if (response.success) {
                    setData({
                        schoolInfo: response.schoolInfo || null,
                        birthdays: response.birthdays || [],
                        todayRose: response.todayRose || null,
                        achievements: response.achievements || []
                    });
                }
            } catch (error) {
                console.log("HOME DATA ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B2EFF] to-[#3A63FF] text-white shadow-lg">
                            <School size={24} />
                        </div>

                        <div>
                            <h1 className="text-base font-extrabold sm:text-lg">
                                {schoolInfo.schoolName ||
                                    "KailashNagar School"}
                            </h1>

                            <p className="text-xs text-slate-500">
                                {schoolInfo.tagline ||
                                    "Learn • Grow • Achieve"}
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
                        <a href="#about" className="hover:text-[#5B2EFF]">
                            About
                        </a>

                        <a
                            href="#achievements"
                            className="hover:text-[#5B2EFF]"
                        >
                            Achievements
                        </a>

                        <a
                            href="#contact"
                            className="hover:text-[#5B2EFF]"
                        >
                            Contact
                        </a>
                    </nav>

                    <Link
                        to="/login"
                        className="rounded-xl bg-[#5B2EFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4820d6]"
                    >
                        Login
                    </Link>
                </div>
            </header>

            <main>
                <section className="bg-gradient-to-br from-[#2617a8] via-[#5B2EFF] to-[#3267dc] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                                <Sparkles size={17} />
                                Welcome to our school community
                            </div>

                            <h2 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
                                Building bright
                                <span className="block text-yellow-300">
                                    futures together.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
                                {schoolInfo.about ||
                                    "A caring, disciplined, and inspiring environment where every child can discover their potential."}
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <a
                                    href="#about"
                                    className="rounded-xl bg-white px-5 py-3 font-bold text-[#4e26e9]"
                                >
                                    Explore Our School
                                </a>

                                <Link
                                    to="/login"
                                    className="rounded-xl border border-white/30 px-5 py-3 font-bold text-white"
                                >
                                    Student Login
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {[
                                ["500+", "Happy Students", <Users />],
                                ["30+", "Skilled Teachers", <GraduationCap />],
                                ["100+", "Achievements", <Trophy />],
                                ["1", "Caring Community", <Heart />]
                            ].map(([value, title, icon]) => (
                                <div
                                    key={title}
                                    className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-7"
                                >
                                    <div className="text-yellow-300">
                                        {icon}
                                    </div>

                                    <p className="mt-8 text-3xl font-extrabold">
                                        {value}
                                    </p>

                                    <p className="mt-1 text-sm text-white/75">
                                        {title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="about"
                    className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
                >
                    <p className="font-bold uppercase tracking-widest text-[#5B2EFF]">
                        About Our School
                    </p>

                    <h2 className="mt-3 max-w-3xl text-3xl font-extrabold sm:text-4xl">
                        Learning with purpose and joy.
                    </h2>

                    <p className="mt-5 max-w-3xl leading-7 text-slate-600">
                        {schoolInfo.about ||
                            "Our dedicated teachers and modern learning approach help students become responsible, capable, and kind individuals."}
                    </p>
                </section>

                <section className="bg-amber-50 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
                                <CalendarDays size={17} />
                                Celebration Corner
                            </div>

                            <h2 className="mt-4 text-3xl font-extrabold">
                                Today at School
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10 text-[#5B2EFF]">
                                <Loader2 className="animate-spin" size={30} />
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="rounded-3xl bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays
                                            className="text-pink-600"
                                            size={27}
                                        />

                                        <div>
                                            <p className="font-bold text-pink-600">
                                                Happy Birthday
                                            </p>

                                            <h3 className="text-2xl font-extrabold">
                                                Today&apos;s Stars
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        {data.birthdays.length ? (
                                            data.birthdays.map((student) => (
                                                <div
                                                    key={student._id}
                                                    className="flex items-center gap-3 rounded-2xl bg-pink-50 p-3"
                                                >
                                                    {student.photo ? (
                                                        <img
                                                            src={getPhotoUrl(
                                                                student.photo
                                                            )}
                                                            alt={student.fullName}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-200 font-bold text-pink-700">
                                                            {student.fullName
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-bold">
                                                            {student.fullName}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            Std.{" "}
                                                            {student.standard}{" "}
                                                            -{" "}
                                                            {student.division}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No student birthdays today.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Award size={27} />

                                        <div>
                                            <p className="font-bold text-pink-100">
                                                Student of the Day
                                            </p>

                                            <h3 className="text-2xl font-extrabold">
                                                Today&apos;s Rose
                                            </h3>
                                        </div>
                                    </div>

                                    {data.todayRose?.student ? (
                                        <div className="mt-6 flex items-center gap-5">
                                            <img
                                                src={
                                                    data.todayRose.photo
                                                        ? `${serverUrl}${data.todayRose.photo}`
                                                        : `${serverUrl}/uploads/students/${data.todayRose.student.photo}`
                                                }
                                                alt={data.todayRose.student.fullName}
                                                className="h-24 w-24 rounded-2xl border-4 border-white/30 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />

                                            <div>
                                                <h4 className="text-2xl font-extrabold">
                                                    {
                                                        data.todayRose.student
                                                            .fullName
                                                    }
                                                </h4>

                                                <p className="mt-3 text-sm">
                                                    {data.todayRose.reason}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-6 text-white/85">
                                            Today&apos;s Rose will be announced
                                            soon.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section
                    id="achievements"
                    className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold uppercase tracking-widest text-[#5B2EFF]">
                                Our Pride
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold">
                                School Achievements
                            </h2>
                        </div>

                        <Trophy className="text-amber-500" size={42} />
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {data.achievements.map((achievement) => (
                            <article
                                key={achievement._id}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                            >
                                {achievement.photo ? (
                                    <img
                                        src={getPhotoUrl(achievement.photo)}
                                        alt={achievement.title}
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-48 items-center justify-center bg-indigo-100 text-[#5B2EFF]">
                                        <Trophy size={50} />
                                    </div>
                                )}

                                <div className="p-6">
                                    <h3 className="text-xl font-extrabold">
                                        {achievement.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {achievement.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    id="contact"
                    className="bg-slate-900 px-4 py-16 text-white sm:px-6 lg:px-8"
                >
                    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
                        <div>
                            <div className="flex items-center gap-3">
                                <School size={26} />

                                <h2 className="text-xl font-extrabold">
                                    {schoolInfo.schoolName ||
                                        "KailashNagar School"}
                                </h2>
                            </div>

                            <p className="mt-5 leading-7 text-slate-300">
                                {schoolInfo.tagline ||
                                    "A place of knowledge, character, creativity, and lasting friendships."}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold">Contact Us</h3>

                            <div className="mt-5 space-y-3 text-sm text-slate-300">
                                <p className="flex items-center gap-3">
                                    <Phone size={17} />
                                    {schoolInfo.phone ||
                                        "Phone number not added"}
                                </p>

                                <p className="flex items-center gap-3">
                                    <Mail size={17} />
                                    {schoolInfo.email ||
                                        "Email address not added"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold">Location</h3>

                            <p className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-300">
                                <MapPin
                                    size={18}
                                    className="mt-1 shrink-0"
                                />
                                {schoolInfo.address ||
                                    "School address not added"}
                            </p>

                            {schoolInfo.mapLink && (
                                <a
                                    href={schoolInfo.mapLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-300 hover:text-white"
                                >
                                    <LocateFixed size={17} />
                                    View on Map
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;