import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Apple,
    Award,
    Backpack,
    BookOpen,
    CalendarDays,
    Cake,
    GraduationCap,
    LocateFixed,
    Mail,
    MapPin,
    Palette,
    PencilRuler,
    Phone,
    Rocket,
    School,
    Sparkles,
    Star,
    Trophy,
    Users
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { getPublicHomeData } from "../../services/homeService";

/* ============================================================
   Reveal
   Same IntersectionObserver logic as before — only addition is
   an optional `delay` (ms) and `direction` prop so sections can
   stagger in, purely presentational, default behaviour unchanged.
   ============================================================ */
const Reveal = ({ children, className = "", delay = 0, direction = "up" }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    const hidden =
        direction === "up"
            ? "translate-y-8 opacity-0"
            : direction === "left"
            ? "-translate-x-8 opacity-0"
            : direction === "right"
            ? "translate-x-8 opacity-0"
            : "scale-95 opacity-0";

    return (
        <div
            ref={ref}
            style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
            className={`transition-all duration-700 ease-out ${
                visible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : hidden
            } ${className}`}
        >
            {children}
        </div>
    );
};

/* Small decorative "spiral notebook" hole strip — the page's signature motif */
const RingStrip = ({ tone = "violet" }) => {
    const dot =
        tone === "violet"
            ? "bg-[#6D3AFF]/25"
            : tone === "coral"
            ? "bg-[#FF6B6A]/30"
            : tone === "sun"
            ? "bg-[#FFB020]/30"
            : "bg-[#17B890]/30";

    return (
        <div className="absolute left-0 top-0 flex h-full w-4 flex-col items-center justify-evenly py-3 sm:w-5">
            {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${dot}`} />
            ))}
        </div>
    );
};

/* Floating student-life doodles that live in the empty gutters on wide
   screens (beyond the max-w-7xl content column). Purely decorative,
   fixed to the viewport so they read as a gentle frame while scrolling,
   and hidden below xl where there's no spare space to fill anyway. */
const SIDE_DOODLES = {
    left: [
        { Icon: PencilRuler, top: "12%", bg: "bg-[#6D3AFF]", tint: "text-white", size: 22, delay: "0s", dur: "5.5s" },
        { Icon: Apple, top: "34%", bg: "bg-[#FF6B6A]", tint: "text-white", size: 20, delay: "0.6s", dur: "6.5s" },
        { Icon: BookOpen, top: "58%", bg: "bg-[#2F80ED]", tint: "text-white", size: 22, delay: "1.2s", dur: "5s" },
        { Icon: Star, top: "80%", bg: "bg-[#FFB020]", tint: "text-white", size: 18, delay: "0.3s", dur: "7s" }
    ],
    right: [
        { Icon: GraduationCap, top: "18%", bg: "bg-[#17B890]", tint: "text-white", size: 22, delay: "0.4s", dur: "6s" },
        { Icon: Backpack, top: "42%", bg: "bg-[#6D3AFF]", tint: "text-white", size: 20, delay: "1s", dur: "5.5s" },
        { Icon: Palette, top: "64%", bg: "bg-[#FF6B6A]", tint: "text-white", size: 20, delay: "0.2s", dur: "6.5s" },
        { Icon: Rocket, top: "86%", bg: "bg-[#2F80ED]", tint: "text-white", size: 20, delay: "0.8s", dur: "5s" }
    ]
};

const SideDoodles = () => (
    <>
        <div className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden w-[max(0px,calc((100vw-1280px)/2))] xl:block">
            {SIDE_DOODLES.left.map(({ Icon, top, bg, tint, size, delay, dur }, i) => (
                <div
                    key={i}
                    className={`absolute left-1/2 -translate-x-1/2 rounded-2xl ${bg} ${tint} p-3 shadow-lg animate-float-slow`}
                    style={{ top, animationDelay: delay, animationDuration: dur }}
                >
                    <Icon size={size} />
                </div>
            ))}
        </div>

        <div className="pointer-events-none fixed inset-y-0 right-0 z-0 hidden w-[max(0px,calc((100vw-1280px)/2))] xl:block">
            {SIDE_DOODLES.right.map(({ Icon, top, bg, tint, size, delay, dur }, i) => (
                <div
                    key={i}
                    className={`absolute left-1/2 -translate-x-1/2 rounded-2xl ${bg} ${tint} p-3 shadow-lg animate-float-slow`}
                    style={{ top, animationDelay: delay, animationDuration: dur }}
                >
                    <Icon size={size} />
                </div>
            ))}
        </div>
    </>
);

const Home = () => {
    const { t } = useLanguage();

    const [data, setData] = useState({
        schoolInfo: null,
        stats: {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalAchievements: 0
        },
        birthdays: [],
        todayRoses: [],
        galleryPhotos: [],
        achievements: []
    });

    const [loading, setLoading] = useState(true);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

    // How long each gallery photo stays on screen before the slideshow
    // moves to the next one. Change this single value to slow down or
    // speed up the rotation (currently 5 seconds per photo).
    const GALLERY_ROTATE_MS = 5000;

    const serverUrl = (import.meta.env.VITE_API_URL || "").replace(
        /\/api\/?$/,
        ""
    );

    const schoolInfo = data.schoolInfo || {};

    const getImageUrl = (photo, folder) => {
        if (!photo) return "";

        if (photo.startsWith("http")) return photo;

        if (photo.startsWith("/uploads/")) {
            return `${serverUrl}${photo}`;
        }

        return `${serverUrl}/uploads/${folder}/${photo}`;
    };

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const response = await getPublicHomeData();

                if (response.success) {
                    setData({
                        schoolInfo: response.schoolInfo || null,
                        stats: response.stats || {
                            totalStudents: 0,
                            totalTeachers: 0,
                            totalClasses: 0,
                            totalAchievements: 0
                        },
                        birthdays: response.birthdays || [],
                        todayRoses: response.todayRoses || [],
                        galleryPhotos: response.galleryPhotos || [],
                        achievements: response.achievements || []
                    });
                }
            } catch (error) {
                console.log("HOME DATA ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, []);

    useEffect(() => {
        if (data.galleryPhotos.length <= 1) return;

        const interval = window.setInterval(() => {
            setActiveGalleryIndex(
                (previous) => (previous + 1) % data.galleryPhotos.length
            );
        }, GALLERY_ROTATE_MS);

        return () => window.clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.galleryPhotos.length]);

    const getRoseImage = (rose) =>
        rose.photo
            ? getImageUrl(rose.photo, "home")
            : getImageUrl(rose.studentId?.photo, "students");

    const statBoxes = [
        {
            value: data.stats.totalStudents,
            title: t("dashboard.students"),
            icon: <Users size={22} />,
            from: "from-[#6D3AFF]",
            to: "to-[#8B5CF6]"
        },
        {
            value: data.stats.totalTeachers,
            title: t("dashboard.teachers"),
            icon: <GraduationCap size={22} />,
            from: "from-[#2F80ED]",
            to: "to-[#4F9BFF]"
        },
        {
            value: data.stats.totalClasses,
            title: t("dashboard.classes"),
            icon: <School size={22} />,
            from: "from-[#17B890]",
            to: "to-[#2AD8AC]"
        },
        {
            value: data.stats.totalAchievements,
            title: t("home.achievements"),
            icon: <Trophy size={22} />,
            from: "from-[#FFB020]",
            to: "to-[#FF9142]"
        }
    ];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#FAF9F6] text-[#1B1B2F]">
            {/* Soft dot-grid "notebook paper" texture across the full page,
                so the gutters read as designed space rather than blank margin. */}
            <div
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #D9D4FF 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                }}
            />

            <SideDoodles />

            {/* ============================== Global styles: fonts, keyframes ============================== */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

                .font-display { font-family: 'Baloo 2', 'Inter', sans-serif; }
                .font-body { font-family: 'Inter', sans-serif; }

                @keyframes floatY {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-16px) rotate(6deg); }
                }
                @keyframes kenburns {
                    0% { transform: scale(1.0); }
                    100% { transform: scale(1.08); }
                }
                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.4); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes blob {
                    0%, 100% { border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; }
                    50% { border-radius: 62% 38% 40% 60% / 55% 62% 38% 45%; }
                }

                .animate-float { animation: floatY 4.5s ease-in-out infinite; }
                .animate-float-slow { animation: floatSlow 7s ease-in-out infinite; }
                .animate-kenburns { animation: kenburns 8s ease-in-out infinite alternate; }
                .animate-pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }
                .animate-blob { animation: blob 9s ease-in-out infinite; }
                .shimmer-text {
                    background: linear-gradient(90deg, #6D3AFF 0%, #FFB020 25%, #6D3AFF 50%, #FF6B6A 75%, #6D3AFF 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: shimmer 6s linear infinite;
                }
            `}</style>

            {/* ============================== Header ============================== */}

            <header className="sticky top-0 z-40 border-b border-[#EDE9FE] bg-white/85 backdrop-blur-xl relative">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <Link to="/" className="group flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D3AFF] to-[#2F80ED] text-white shadow-lg shadow-[#6D3AFF]/30 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                            <School size={22} />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate font-display text-sm font-bold tracking-tight sm:text-lg">
                                {schoolInfo.schoolName || t("app.name")}
                            </h1>

                            <p className="truncate text-xs text-slate-500">
                                {schoolInfo.tagline || t("app.tagline")}
                            </p>
                        </div>
                    </Link>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <Link
                            to="/login"
                            className="rounded-xl border-2 border-[#6D3AFF] px-3 py-2 text-xs font-bold text-[#6D3AFF] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6D3AFF]/10 sm:px-5 sm:py-2.5 sm:text-sm"
                        >
                            {t("auth.login")}
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-xl bg-gradient-to-r from-[#6D3AFF] to-[#2F80ED] px-3 py-2 text-xs font-bold text-white shadow-lg shadow-[#6D3AFF]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:px-5 sm:py-2.5 sm:text-sm"
                        >
                            {t("auth.signup")}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8 lg:px-8">
                {/* ============================== Photo Gallery ============================== */}

                {data.galleryPhotos.length > 0 && (
                    <Reveal direction="scale">
                        <section className="relative h-[45vh] w-full overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl ring-4 ring-white sm:h-[55vh] lg:h-[70vh]">
                            {data.galleryPhotos.map((photo, index) => (
                                <img
                                    key={photo._id}
                                    src={getImageUrl(photo.photo, "home")}
                                    alt={photo.caption || "School gallery"}
                                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
                                        index === activeGalleryIndex
                                            ? "opacity-100 animate-kenburns"
                                            : "opacity-0"
                                    }`}
                                />
                            ))}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-black/10" />

                            {/* Live badge */}
                            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md backdrop-blur">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-[#FF6B6A]" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF6B6A]" />
                                </span>
                                {t("app.name") ? "Campus" : "Campus"}
                            </div>

                            {data.galleryPhotos.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                                    {data.galleryPhotos.map((photo, index) => (
                                        <button
                                            key={photo._id}
                                            type="button"
                                            onClick={() => setActiveGalleryIndex(index)}
                                            aria-label={`Show photo ${index + 1}`}
                                            className={`h-2.5 rounded-full transition-all duration-300 ${
                                                index === activeGalleryIndex
                                                    ? "w-8 bg-white"
                                                    : "w-2.5 bg-white/50 hover:bg-white/80"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </Reveal>
                )}

                {/* ============================== Tagline / About + Stats ============================== */}

                <Reveal>
                    <section
                        id="about"
                        className="relative overflow-hidden rounded-[2rem] border border-[#EDE9FE] bg-white shadow-sm"
                    >
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#6D3AFF] via-[#7C3AED] to-[#2F80ED] p-5 text-white sm:p-8">
                            {/* ambient blobs */}
                            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 animate-blob bg-white/10" />
                            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 animate-blob bg-[#FFB020]/20" style={{ animationDelay: "2s" }} />

                            <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
                                <div>
                                    <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-100">
                                        <Sparkles size={16} className="animate-float" />
                                        {schoolInfo.tagline || t("app.tagline")}
                                    </p>

                                    <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                                        {t("home.about")}
                                    </h2>

                                    <p className="mt-4 leading-7 text-indigo-100">
                                        {schoolInfo.about ||
                                            "A caring, disciplined and inspiring environment where every child can discover their potential."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {statBoxes.map((item, idx) => (
                                        <div
                                            key={item.title}
                                            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:p-5 ${item.from} ${item.to}`}
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            <div className="text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                                                {item.icon}
                                            </div>

                                            <p className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                                                {item.value}
                                            </p>

                                            <p className="mt-1 truncate text-sm text-white/85">
                                                {item.title}
                                            </p>

                                            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </Reveal>

                {/* ============================== Star Page ============================== */}

                <Reveal>
                    <section className="rounded-[2rem] border border-[#EDE9FE] bg-white p-5 shadow-sm sm:p-8">
                        <div className="mb-6 flex items-center justify-center gap-2 border-b-2 border-dashed border-slate-100 pb-5 text-center">
                            <CalendarDays className="text-[#FF6B6A]" size={22} />
                            <h2 className="font-display text-xl font-bold sm:text-2xl">
                                {t("home.todaysStars")}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12 text-[#6D3AFF]">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#6D3AFF]" />
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Today's Stars (Birthdays) */}

                                <Reveal direction="left">
                                    <div className="relative overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-4 pl-7 sm:p-6 sm:pl-9">
                                        <RingStrip tone="coral" />

                                        <h3 className="mb-4 flex items-center justify-center gap-2 text-center font-display text-lg font-bold text-pink-700">
                                            <Cake size={20} className="animate-float" />
                                            {t("home.happyBirthday")}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {data.birthdays.length > 0 ? (
                                                data.birthdays.map((student) => (
                                                    <div
                                                        key={student._id}
                                                        className="group flex flex-col items-center rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-pink-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                                    >
                                                        {student.photo ? (
                                                            <img
                                                                src={getImageUrl(
                                                                    student.photo,
                                                                    "students"
                                                                )}
                                                                alt={student.fullName}
                                                                className="h-14 w-14 rounded-full border-2 border-pink-200 object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-200 font-bold text-pink-700">
                                                                {student.fullName
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()}
                                                            </div>
                                                        )}

                                                        <p className="mt-2 truncate text-sm font-bold">
                                                            {student.fullName}
                                                        </p>

                                                        <p className="truncate text-xs text-slate-500">
                                                            Std. {student.standard} -{" "}
                                                            {student.division}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="col-span-full py-4 text-center text-sm text-slate-500">
                                                    {t("common.noRecords")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Reveal>

                                {/* Today's Rose */}

                                <Reveal direction="right">
                                    <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4 pl-7 sm:p-6 sm:pl-9">
                                        <RingStrip tone="coral" />

                                        <h3 className="mb-4 flex items-center justify-center gap-2 text-center font-display text-lg font-bold text-rose-700">
                                            <span className="animate-float-slow">🌹</span>
                                            {t("home.todaysRose")}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {data.todayRoses.length > 0 ? (
                                                data.todayRoses.map((rose) => {
                                                    const roseStudent = rose.studentId;
                                                    const roseImage = getRoseImage(rose);

                                                    return (
                                                        <div
                                                            key={rose._id}
                                                            className="group flex flex-col items-center rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-rose-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                                        >
                                                            {roseImage ? (
                                                                <img
                                                                    src={roseImage}
                                                                    alt={roseStudent?.fullName}
                                                                    className="h-14 w-14 rounded-full border-2 border-rose-200 object-cover transition-transform duration-300 group-hover:scale-105"
                                                                    onError={(event) => {
                                                                        event.currentTarget.style.display =
                                                                            "none";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-200 text-2xl">
                                                                    🌹
                                                                </div>
                                                            )}

                                                            <p className="mt-2 truncate text-sm font-bold">
                                                                {roseStudent?.fullName}
                                                            </p>

                                                            <p className="truncate text-xs text-slate-500">
                                                                Std. {roseStudent?.standard} -{" "}
                                                                {roseStudent?.division}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="col-span-full py-4 text-center text-sm text-slate-500">
                                                    {t("common.noRecords")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Reveal>
                            </div>
                        )}
                    </section>
                </Reveal>

                {/* ============================== Achievement Page ============================== */}

                <Reveal>
                    <section
                        id="achievements"
                        className="rounded-[2rem] border border-[#EDE9FE] bg-white p-5 shadow-sm sm:p-8"
                    >
                        <div className="mb-6 flex items-center justify-center gap-2 border-b-2 border-dashed border-slate-100 pb-5 text-center">
                            <Trophy className="text-[#FFB020]" size={22} />
                            <h2 className="font-display text-xl font-bold sm:text-2xl">
                                {t("home.schoolAchievements")}
                            </h2>
                        </div>

                        {data.achievements.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {data.achievements.map((achievement, idx) => (
                                    <Reveal key={achievement._id} delay={idx * 80} direction="up">
                                        <article className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                                            <div className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#FFB020] shadow-md backdrop-blur transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                                <Award size={18} />
                                            </div>

                                            {achievement.photo ? (
                                                <div className="h-48 w-full overflow-hidden">
                                                    <img
                                                        src={getImageUrl(achievement.photo, "home")}
                                                        alt={achievement.title}
                                                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-[#FFB020]">
                                                    <Trophy size={50} className="animate-float" />
                                                </div>
                                            )}

                                            <div className="p-6">
                                                <h3 className="font-display text-xl font-bold">
                                                    {achievement.title}
                                                </h3>

                                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                                    {achievement.description}
                                                </p>
                                            </div>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-sm text-slate-500">
                                {t("common.noRecords")}
                            </p>
                        )}
                    </section>
                </Reveal>
            </main>

            {/* ============================== Footer ============================== */}

            <footer id="contact" className="relative z-10 bg-[#14163A] px-4 pb-10 pt-16 text-white sm:px-6 lg:px-8">
                {/* spiral notebook edge */}
                <svg
                    className="absolute -top-px left-0 h-6 w-full text-[#FAF9F6]"
                    viewBox="0 0 400 24"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M0 0H400V24C400 24 380 4 200 4C20 4 0 24 0 24V0Z" fill="currentColor" />
                </svg>

                <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
                    <div>
                        <h2 className="font-display text-xl font-bold">
                            {schoolInfo.schoolName || t("app.name")}
                        </h2>

                        <p className="mt-4 text-slate-300">
                            {schoolInfo.tagline || t("app.tagline")}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-[#FFB020]">
                            {t("home.contactUs")}
                        </h3>

                        <p className="mt-4 flex items-center gap-3 text-sm text-slate-300 transition-colors hover:text-white">
                            <Phone size={17} className="text-[#6D3AFF]" />
                            {schoolInfo.phone || "-"}
                        </p>

                        <p className="mt-3 flex items-center gap-3 text-sm text-slate-300 transition-colors hover:text-white">
                            <Mail size={17} className="text-[#6D3AFF]" />
                            {schoolInfo.email || "-"}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-[#FFB020]">
                            {t("home.location")}
                        </h3>

                        <p className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                            <MapPin size={17} className="text-[#6D3AFF]" />
                            {schoolInfo.address || "-"}
                        </p>

                        {schoolInfo.mapLink && (
                            <a
                                href={schoolInfo.mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 font-bold text-[#8B5CF6] transition-colors hover:text-white"
                            >
                                <LocateFixed size={17} />
                                {t("home.viewOnMap")}
                            </a>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;