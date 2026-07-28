import { useEffect, useMemo, useState } from "react";
import {
    Award,
    CalendarDays,
    ImagePlus,
    Languages,
    Loader2,
    MapPin,
    Plus,
    School,
    Trash2,
    Trophy,
    Upload,
    UserRound
} from "lucide-react";

import api from "../../config/axios";
import { useLanguage } from "../../context/LanguageContext";
import {
    addGalleryPhoto,
    createAchievement,
    createTodayRose,
    deleteAchievement,
    deleteGalleryPhoto,
    deleteTodayRose,
    getAchievements,
    getGalleryPhotos,
    getSchoolInfo,
    getTodayRoses,
    updateSchoolInfo
} from "../../services/homeService";

const initialSchoolForm = {
    schoolName: "",
    tagline: "",
    about: "",
    phone: "",
    email: "",
    address: "",
    mapLink: "",
    logo: null
};

const initialAchievementForm = {
    title: "",
    description: "",
    category: "General",
    achievementDate: new Date().toISOString().split("T")[0],
    photo: null
};

const initialRoseForm = {
    studentId: "",
    title: "Today's Rose",
    reason: "",
    awardDate: new Date().toISOString().split("T")[0],
    photo: null
};

const initialGalleryForm = {
    photo: null,
    caption: ""
};

const HomeManagement = () => {
    const { language, toggleLanguage } = useLanguage();
    const isGujarati = language === "gu";

    const [students, setStudents] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [todayRoses, setTodayRoses] = useState([]);
    const [galleryPhotos, setGalleryPhotos] = useState([]);
    const [schoolForm, setSchoolForm] = useState(initialSchoolForm);
    const [achievementForm, setAchievementForm] = useState(initialAchievementForm);
    const [galleryForm, setGalleryForm] = useState(initialGalleryForm);
    const [savingGalleryPhoto, setSavingGalleryPhoto] = useState(false);
    const [roseForm, setRoseForm] = useState(initialRoseForm);

    const [selectedClass, setSelectedClass] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingSchoolInfo, setSavingSchoolInfo] = useState(false);
    const [savingAchievement, setSavingAchievement] = useState(false);
    const [savingRose, setSavingRose] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const serverUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const text = {
        switchLang: isGujarati ? "English" : "ગુજરાતી",
        websiteControl: isGujarati ? "શાળા વેબસાઇટ નિયંત્રણ" : "School Website Control",
        title: isGujarati ? "હોમ મેનેજમેન્ટ" : "Home Management",
        subtitle: isGujarati
            ? "જાહેર હોમ પેજ પર દેખાતી શાળાની વિગતો, સિદ્ધિઓ અને આજના ગુલાબનું સંચાલન કરો."
            : "Manage the school details, achievements, and Today's Rose shown on the public home page.",
        achievementsSuffix: isGujarati ? "સિદ્ધિઓ" : "Achievements",
        roseRecordsSuffix: isGujarati ? "ગુલાબ રેકોર્ડ" : "Rose Records",
        schoolInformation: isGujarati ? "શાળા માહિતી" : "School Information",
        schoolInfoSub: isGujarati
            ? "આ માહિતી જાહેર હોમ પેજ પર દેખાય છે."
            : "This information appears on the public home page.",
        schoolName: isGujarati ? "શાળાનું નામ" : "School Name",
        enterSchoolName: isGujarati ? "શાળાનું નામ દાખલ કરો" : "Enter school name",
        tagline: isGujarati ? "ટેગલાઇન" : "Tagline",
        taglinePlaceholder: isGujarati
            ? "ઉદાહરણ: ઉજ્જવળ ભવિષ્ય માટે શિક્ષણ"
            : "Example: Learning for a brighter future",
        aboutSchool: isGujarati ? "શાળા વિશે" : "About School",
        aboutPlaceholder: isGujarati
            ? "તમારી શાળા વિશે ટૂંકો પરિચય લખો"
            : "Write a short introduction about your school",
        phoneNumber: isGujarati ? "ફોન નંબર" : "Phone Number",
        enterPhoneNumber: isGujarati ? "ફોન નંબર દાખલ કરો" : "Enter phone number",
        emailAddress: isGujarati ? "ઇમેઇલ સરનામું" : "Email Address",
        enterEmail: isGujarati ? "શાળા ઇમેઇલ દાખલ કરો" : "Enter school email",
        schoolAddress: isGujarati ? "શાળાનું સરનામું" : "School Address",
        addressPlaceholder: isGujarati
            ? "સંપૂર્ણ શાળા સરનામું દાખલ કરો"
            : "Enter full school address",
        googleMapsLink: isGujarati ? "ગૂગલ મેપ્સ લિંક" : "Google Maps Link",
        mapLinkPlaceholder: isGujarati
            ? "ગૂગલ મેપ્સ એમ્બેડ અથવા સ્થાન લિંક પેસ્ટ કરો"
            : "Paste Google Maps embed or location link",
        schoolLogo: isGujarati ? "શાળાનો લોગો" : "School Logo",
        chooseLogo: isGujarati ? "લોગો પસંદ કરો" : "Choose Logo",
        saveSchoolInfo: isGujarati ? "શાળા માહિતી સાચવો" : "Save School Information",
        addAchievement: isGujarati ? "સિદ્ધિ ઉમેરો" : "Add Achievement",
        addAchievementSub: isGujarati
            ? "હોમ પેજ ગેલેરી માટે સિદ્ધિઓ ઉમેરો."
            : "Add achievements for the home page gallery.",
        achievementTitlePlaceholder: isGujarati ? "સિદ્ધિનું શીર્ષક" : "Achievement title",
        achievementDescPlaceholder: isGujarati
            ? "સિદ્ધિનું વર્ણન"
            : "Achievement description",
        categoryPlaceholder: isGujarati ? "શ્રેણી" : "Category",
        chooseAchievementPhoto: isGujarati
            ? "સિદ્ધિનો ફોટો પસંદ કરો"
            : "Choose Achievement Photo",
        todaysRose: isGujarati ? "આજનો ગુલાબ" : "Today's Rose",
        todaysRoseSub: isGujarati
            ? "ધોરણ પસંદ કરો, પછી વિદ્યાર્થી પસંદ કરો."
            : "Select a class, then choose the student.",
        selectClass: isGujarati ? "ધોરણ પસંદ કરો" : "Select class",
        selectStudent: isGujarati ? "વિદ્યાર્થી પસંદ કરો" : "Select student",
        selectClassFirst: isGujarati ? "પહેલા ધોરણ પસંદ કરો" : "Select class first",
        grLabel: isGujarati ? "GR:" : "GR:",
        classLabel: isGujarati ? "ધોરણ" : "Class",
        awardTitlePlaceholder: isGujarati ? "પુરસ્કારનું શીર્ષક" : "Award title",
        awardReasonPlaceholder: isGujarati ? "પુરસ્કારનું કારણ" : "Award reason",
        addDifferentPhoto: isGujarati ? "અલગ ફોટો ઉમેરો" : "Add Different Photo",
        awardDate: isGujarati ? "પુરસ્કાર તારીખ" : "Award Date",
        saveTodaysRose: isGujarati ? "આજનો ગુલાબ સાચવો" : "Save Today's Rose",
        savedAchievements: isGujarati ? "સાચવેલી સિદ્ધિઓ" : "Saved Achievements",
        achievementRecordsFound: isGujarati
            ? "સિદ્ધિ રેકોર્ડ મળ્યા."
            : "achievement records found.",
        noAchievementsYet: isGujarati
            ? "હજુ સુધી કોઈ સિદ્ધિ ઉમેરવામાં આવી નથી."
            : "No achievements have been added yet.",
        deleteAchievementTitle: isGujarati ? "સિદ્ધિ કાઢી નાખો" : "Delete achievement",
        todaysRoseHistory: isGujarati ? "આજના ગુલાબનો ઇતિહાસ" : "Today's Rose History",
        todaysRoseHistorySub: isGujarati
            ? "બધા સાચવેલા આજના શ્રેષ્ઠ વિદ્યાર્થીના રેકોર્ડ."
            : "All saved Student of the Day records.",
        noRoseYet: isGujarati
            ? "હજુ સુધી કોઈ આજના ગુલાબનો રેકોર્ડ ઉમેરવામાં આવ્યો નથી."
            : "No Today's Rose record has been added yet.",
        deleteRoseTitle: isGujarati ? "આજનો ગુલાબ કાઢી નાખો" : "Delete Today's Rose",
        loadError: isGujarati
            ? "હોમ મેનેજમેન્ટ ડેટા લોડ કરી શકાયો નથી."
            : "Unable to load home management data.",
        schoolInfoSaved: isGujarati
            ? "શાળા માહિતી સફળતાપૂર્વક સાચવવામાં આવી."
            : "School information saved successfully.",
        schoolInfoSaveError: isGujarati
            ? "શાળા માહિતી સાચવી શકાઈ નથી."
            : "Unable to save school information.",
        achievementAdded: isGujarati
            ? "સિદ્ધિ સફળતાપૂર્વક ઉમેરવામાં આવી."
            : "Achievement added successfully.",
        achievementAddError: isGujarati
            ? "સિદ્ધિ ઉમેરી શકાઈ નથી."
            : "Unable to add achievement.",
        selectStudentError: isGujarati
            ? "કૃપા કરીને પહેલા વિદ્યાર્થી પસંદ કરો."
            : "Please select a student first.",
        roseSaved: isGujarati
            ? "આજનો ગુલાબ સફળતાપૂર્વક સાચવવામાં આવ્યો."
            : "Today's Rose saved successfully.",
        roseSaveError: isGujarati
            ? "આજનો ગુલાબ સાચવી શકાયો નથી."
            : "Unable to save Today's Rose.",
        confirmDeleteAchievement: isGujarati
            ? "શું તમે આ સિદ્ધિ કાઢી નાખવા માંગો છો?"
            : "Do you want to delete this achievement?",
        achievementDeleted: isGujarati
            ? "સિદ્ધિ સફળતાપૂર્વક કાઢી નાખવામાં આવી."
            : "Achievement deleted successfully.",
        achievementDeleteError: isGujarati
            ? "સિદ્ધિ કાઢી શકાઈ નથી."
            : "Unable to delete achievement.",
        confirmDeleteRose: isGujarati
            ? "શું તમે આ આજના ગુલાબનો રેકોર્ડ કાઢી નાખવા માંગો છો?"
            : "Do you want to delete this Today's Rose record?",
        roseDeleted: isGujarati
            ? "આજનો ગુલાબ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો."
            : "Today's Rose deleted successfully.",
        roseDeleteError: isGujarati
            ? "આજનો ગુલાબ કાઢી શકાયો નથી."
            : "Unable to delete Today's Rose.",
        photoGallery: isGujarati ? "ફોટો ગેલેરી" : "Photo Gallery",
        photoGallerySub: isGujarati
            ? "હોમ પેજની ટોચ પર દેખાતી સ્લાઇડશોમાં 10-20 ફોટા ઉમેરો."
            : "Add 10-20 photos shown in the slideshow at the top of the home page.",
        galleryCaptionPlaceholder: isGujarati
            ? "કૅપ્શન (વૈકલ્પિક)"
            : "Caption (optional)",
        chooseGalleryPhoto: isGujarati ? "ગેલેરી ફોટો પસંદ કરો" : "Choose Gallery Photo",
        addPhoto: isGujarati ? "ફોટો ઉમેરો" : "Add Photo",
        galleryPhotosFound: isGujarati ? "ફોટા ઉમેરાયા" : "photos added",
        galleryLimitNote: isGujarati
            ? "મહત્તમ 20 ફોટા સુધી ઉમેરી શકાય છે."
            : "You can add up to 20 photos.",
        noGalleryPhotosYet: isGujarati
            ? "હજુ સુધી કોઈ ગેલેરી ફોટો ઉમેરવામાં આવ્યો નથી."
            : "No gallery photos have been added yet.",
        deleteGalleryPhotoTitle: isGujarati ? "ફોટો કાઢી નાખો" : "Delete photo",
        chooseGalleryPhotoError: isGujarati
            ? "કૃપા કરીને ફોટો પસંદ કરો."
            : "Please choose a photo.",
        galleryPhotoAdded: isGujarati
            ? "ગેલેરી ફોટો સફળતાપૂર્વક ઉમેરવામાં આવ્યો."
            : "Gallery photo added successfully.",
        galleryPhotoAddError: isGujarati
            ? "ગેલેરી ફોટો ઉમેરી શકાયો નથી."
            : "Unable to add gallery photo.",
        confirmDeleteGalleryPhoto: isGujarati
            ? "શું તમે આ ફોટો કાઢી નાખવા માંગો છો?"
            : "Do you want to delete this photo?",
        galleryPhotoDeleted: isGujarati
            ? "ફોટો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો."
            : "Photo deleted successfully.",
        galleryPhotoDeleteError: isGujarati
            ? "ફોટો કાઢી શકાયો નથી."
            : "Unable to delete photo."
    };

    const showMessage = (type, msgText) => {
        setMessage({ type, text: msgText });

        window.setTimeout(() => {
            setMessage({ type: "", text: "" });
        }, 4000);
    };

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

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(isGujarati ? "gu-IN" : "en-IN");
    };

    const loadData = async () => {
        try {
            setLoading(true);

            const [
                schoolInfoResponse,
                achievementsResponse,
                rosesResponse,
                galleryResponse,
                studentsResponse
            ] = await Promise.all([
                getSchoolInfo(),
                getAchievements(),
                getTodayRoses(),
                getGalleryPhotos(),
                api.get("/students/all")
            ]);

            const schoolInfo = schoolInfoResponse.schoolInfo || {};

            setSchoolForm({
                schoolName: schoolInfo.schoolName || "",
                tagline: schoolInfo.tagline || "",
                about: schoolInfo.about || "",
                phone: schoolInfo.phone || "",
                email: schoolInfo.email || "",
                address: schoolInfo.address || "",
                mapLink: schoolInfo.mapLink || "",
                logo: null,
                existingLogo: schoolInfo.logo || ""
            });

            setAchievements(achievementsResponse.achievements || []);
            setTodayRoses(rosesResponse.todayRoses || []);
            setGalleryPhotos(galleryResponse.galleryPhotos || []);

            const studentData =
                studentsResponse.data?.students ||
                studentsResponse.data?.data ||
                studentsResponse.data ||
                [];

            setStudents(Array.isArray(studentData) ? studentData : []);
        } catch (error) {
            console.error(error);
            showMessage("error", error.response?.data?.message || text.loadError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const classOptions = useMemo(() => {
        const classes = students
            .filter((student) => student.standard && student.division)
            .map((student) => `Class ${student.standard} - ${student.division}`);

        return [...new Set(classes)].sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );
    }, [students]);

    const filteredStudents = useMemo(() => {
        if (!selectedClass) return [];

        const [standardPart, divisionPart] = selectedClass.split(" - ");
        const standard = Number(standardPart.replace("Class ", ""));
        const division = divisionPart?.trim();

        return students.filter(
            (student) =>
                Number(student.standard) === standard &&
                String(student.division) === division
        );
    }, [students, selectedClass]);

    const selectedStudent = useMemo(
        () => students.find((student) => student._id === roseForm.studentId),
        [students, roseForm.studentId]
    );

    const handleSchoolChange = (event) => {
        const { name, value, files } = event.target;

        setSchoolForm((previous) => ({
            ...previous,
            [name]: files ? files[0] : value
        }));
    };

    const handleAchievementChange = (event) => {
        const { name, value, files } = event.target;

        setAchievementForm((previous) => ({
            ...previous,
            [name]: files ? files[0] : value
        }));
    };

    const handleRoseChange = (event) => {
        const { name, value, files } = event.target;

        setRoseForm((previous) => ({
            ...previous,
            [name]: files ? files[0] : value
        }));
    };

    const handleSchoolSubmit = async (event) => {
        event.preventDefault();

        try {
            setSavingSchoolInfo(true);

            const response = await updateSchoolInfo(schoolForm);

            setSchoolForm((previous) => ({
                ...previous,
                logo: null,
                existingLogo: response.schoolInfo?.logo || previous.existingLogo
            }));

            showMessage("success", response.message || text.schoolInfoSaved);
        } catch (error) {
            showMessage(
                "error",
                error.response?.data?.message || text.schoolInfoSaveError
            );
        } finally {
            setSavingSchoolInfo(false);
        }
    };

    const handleAchievementSubmit = async (event) => {
        event.preventDefault();

        try {
            setSavingAchievement(true);

            const response = await createAchievement(achievementForm);

            setAchievements((previous) => [response.achievement, ...previous]);

            setAchievementForm(initialAchievementForm);

            showMessage("success", response.message || text.achievementAdded);
        } catch (error) {
            showMessage(
                "error",
                error.response?.data?.message || text.achievementAddError
            );
        } finally {
            setSavingAchievement(false);
        }
    };

    const handleRoseSubmit = async (event) => {
        event.preventDefault();

        if (!roseForm.studentId) {
            showMessage("error", text.selectStudentError);
            return;
        }

        try {
            setSavingRose(true);

            const response = await createTodayRose(roseForm);

            setTodayRoses((previous) => {
                const withoutSameStudentSameDay = previous.filter(
                    (rose) =>
                        !(
                            String(rose.studentId?._id || rose.studentId) ===
                                String(
                                    response.todayRose.studentId?._id ||
                                        response.todayRose.studentId
                                ) &&
                            new Date(rose.awardDate).toDateString() ===
                                new Date(response.todayRose.awardDate).toDateString()
                        )
                );

                return [response.todayRose, ...withoutSameStudentSameDay];
            });

            setRoseForm(initialRoseForm);
            setSelectedClass("");

            showMessage("success", response.message || text.roseSaved);
        } catch (error) {
            showMessage("error", error.response?.data?.message || text.roseSaveError);
        } finally {
            setSavingRose(false);
        }
    };

    const handleDeleteAchievement = async (id) => {
        if (!window.confirm(text.confirmDeleteAchievement)) return;

        try {
            await deleteAchievement(id);

            setAchievements((previous) =>
                previous.filter((achievement) => achievement._id !== id)
            );

            showMessage("success", text.achievementDeleted);
        } catch (error) {
            showMessage(
                "error",
                error.response?.data?.message || text.achievementDeleteError
            );
        }
    };

    const handleDeleteRose = async (id) => {
        if (!window.confirm(text.confirmDeleteRose)) return;

        try {
            await deleteTodayRose(id);

            setTodayRoses((previous) => previous.filter((rose) => rose._id !== id));

            showMessage("success", text.roseDeleted);
        } catch (error) {
            showMessage("error", error.response?.data?.message || text.roseDeleteError);
        }
    };

    const handleGalleryChange = (event) => {
        const { name, value, files } = event.target;

        setGalleryForm((previous) => ({
            ...previous,
            [name]: files ? files[0] : value
        }));
    };

    const handleGallerySubmit = async (event) => {
        event.preventDefault();

        if (!galleryForm.photo) {
            showMessage("error", text.chooseGalleryPhotoError);
            return;
        }

        try {
            setSavingGalleryPhoto(true);

            const response = await addGalleryPhoto(galleryForm);

            setGalleryPhotos((previous) => [...previous, response.galleryPhoto]);

            setGalleryForm(initialGalleryForm);

            showMessage("success", response.message || text.galleryPhotoAdded);
        } catch (error) {
            showMessage(
                "error",
                error.response?.data?.message || text.galleryPhotoAddError
            );
        } finally {
            setSavingGalleryPhoto(false);
        }
    };

    const handleDeleteGalleryPhoto = async (id) => {
        if (!window.confirm(text.confirmDeleteGalleryPhoto)) return;

        try {
            await deleteGalleryPhoto(id);

            setGalleryPhotos((previous) => previous.filter((photo) => photo._id !== id));

            showMessage("success", text.galleryPhotoDeleted);
        } catch (error) {
            showMessage(
                "error",
                error.response?.data?.message || text.galleryPhotoDeleteError
            );
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-full space-y-6 bg-[#F5F7FB] p-4 pb-10 sm:space-y-7 sm:p-6 lg:p-8">
            {/* ============================== Hero ============================== */}

            <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-xl sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-100">
                            <School className="h-4 w-4 shrink-0" />
                            {text.websiteControl}
                        </p>

                        <h1 className="text-2xl font-extrabold sm:text-4xl">
                            {text.title}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-indigo-100 sm:text-base">
                            {text.subtitle}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
                        >
                            <Languages size={16} />
                            {text.switchLang}
                        </button>

                        <div className="rounded-2xl bg-white/15 px-5 py-3 text-sm font-semibold backdrop-blur">
                            {achievements.length} {text.achievementsSuffix} ·{" "}
                            {todayRoses.length} {text.roseRecordsSuffix}
                        </div>
                    </div>
                </div>
            </section>

            {message.text && (
                <div
                    className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
                        message.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* ============================== School Information ============================== */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                        <School className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {text.schoolInformation}
                        </h2>
                        <p className="text-sm text-slate-500">{text.schoolInfoSub}</p>
                    </div>
                </div>

                <form onSubmit={handleSchoolSubmit} className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {text.schoolName}
                        </span>
                        <input
                            name="schoolName"
                            value={schoolForm.schoolName}
                            onChange={handleSchoolChange}
                            placeholder={text.enterSchoolName}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {text.tagline}
                        </span>
                        <input
                            name="tagline"
                            value={schoolForm.tagline}
                            onChange={handleSchoolChange}
                            placeholder={text.taglinePlaceholder}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {text.aboutSchool}
                        </span>
                        <textarea
                            name="about"
                            value={schoolForm.about}
                            onChange={handleSchoolChange}
                            rows="4"
                            placeholder={text.aboutPlaceholder}
                            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {text.phoneNumber}
                        </span>
                        <input
                            name="phone"
                            value={schoolForm.phone}
                            onChange={handleSchoolChange}
                            placeholder={text.enterPhoneNumber}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {text.emailAddress}
                        </span>
                        <input
                            type="email"
                            name="email"
                            value={schoolForm.email}
                            onChange={handleSchoolChange}
                            placeholder={text.enterEmail}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {text.schoolAddress}
                        </span>
                        <textarea
                            name="address"
                            value={schoolForm.address}
                            onChange={handleSchoolChange}
                            rows="3"
                            placeholder={text.addressPlaceholder}
                            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {text.googleMapsLink}
                        </span>
                        <input
                            type="url"
                            name="mapLink"
                            value={schoolForm.mapLink}
                            onChange={handleSchoolChange}
                            placeholder={text.mapLinkPlaceholder}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <div className="space-y-2 md:col-span-2">
                        <span className="block text-sm font-semibold text-slate-700">
                            {text.schoolLogo}
                        </span>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            {(schoolForm.logo || schoolForm.existingLogo) && (
                                <img
                                    src={
                                        schoolForm.logo
                                            ? URL.createObjectURL(schoolForm.logo)
                                            : getImageUrl(schoolForm.existingLogo)
                                    }
                                    alt="School logo"
                                    className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover"
                                />
                            )}

                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100">
                                <Upload className="h-4 w-4 shrink-0" />
                                {text.chooseLogo}
                                <input
                                    type="file"
                                    name="logo"
                                    accept="image/*"
                                    onChange={handleSchoolChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={savingSchoolInfo}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {savingSchoolInfo ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <School className="h-5 w-5" />
                            )}
                            {text.saveSchoolInfo}
                        </button>
                    </div>
                </form>
            </section>

            {/* ============================== Achievement + Rose Forms ============================== */}

            <div className="grid gap-6 sm:gap-7 xl:grid-cols-2">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                            <Trophy className="h-6 w-6" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {text.addAchievement}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {text.addAchievementSub}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAchievementSubmit} className="space-y-4">
                        <input
                            name="title"
                            value={achievementForm.title}
                            onChange={handleAchievementChange}
                            placeholder={text.achievementTitlePlaceholder}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                        />

                        <textarea
                            name="description"
                            value={achievementForm.description}
                            onChange={handleAchievementChange}
                            placeholder={text.achievementDescPlaceholder}
                            rows="4"
                            required
                            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                name="category"
                                value={achievementForm.category}
                                onChange={handleAchievementChange}
                                placeholder={text.categoryPlaceholder}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                            />

                            <input
                                type="date"
                                name="achievementDate"
                                value={achievementForm.achievementDate}
                                onChange={handleAchievementChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                            />
                        </div>

                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-4 text-sm font-bold text-amber-700 transition hover:bg-amber-100">
                            <ImagePlus className="h-5 w-5 shrink-0" />
                            <span className="truncate">
                                {achievementForm.photo
                                    ? achievementForm.photo.name
                                    : text.chooseAchievementPhoto}
                            </span>
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleAchievementChange}
                                className="hidden"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={savingAchievement}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {savingAchievement ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                            {text.addAchievement}
                        </button>
                    </form>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                            <Award className="h-6 w-6" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {text.todaysRose}
                            </h2>
                            <p className="text-sm text-slate-500">{text.todaysRoseSub}</p>
                        </div>
                    </div>

                    <form onSubmit={handleRoseSubmit} className="space-y-4">
                        <select
                            value={selectedClass}
                            onChange={(event) => {
                                setSelectedClass(event.target.value);
                                setRoseForm((previous) => ({
                                    ...previous,
                                    studentId: ""
                                }));
                            }}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                        >
                            <option value="">{text.selectClass}</option>

                            {classOptions.map((className) => (
                                <option key={className} value={className}>
                                    {className}
                                </option>
                            ))}
                        </select>

                        <select
                            name="studentId"
                            value={roseForm.studentId}
                            onChange={handleRoseChange}
                            disabled={!selectedClass}
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                            <option value="">
                                {selectedClass ? text.selectStudent : text.selectClassFirst}
                            </option>

                            {filteredStudents.map((student) => (
                                <option key={student._id} value={student._id}>
                                    {student.fullName} ({student.grNumber})
                                </option>
                            ))}
                        </select>

                        {selectedStudent && (
                            <div className="flex items-center gap-4 rounded-2xl bg-rose-50 p-4">
                                {selectedStudent.profilePhoto || selectedStudent.photo ? (
                                    <img
                                        src={getImageUrl(
                                            selectedStudent.profilePhoto ||
                                                selectedStudent.photo,
                                            "students"
                                        )}
                                        alt={selectedStudent.fullName}
                                        className="h-16 w-16 shrink-0 rounded-2xl border-2 border-rose-200 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-200 text-rose-700">
                                        <UserRound className="h-8 w-8" />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-900">
                                        {selectedStudent.fullName}
                                    </p>
                                    <p className="truncate text-sm text-slate-600">
                                        {text.grLabel} {selectedStudent.grNumber} ·{" "}
                                        {text.classLabel} {selectedStudent.standard}-
                                        {selectedStudent.division}
                                    </p>
                                </div>
                            </div>
                        )}

                        <input
                            name="title"
                            value={roseForm.title}
                            onChange={handleRoseChange}
                            placeholder={text.awardTitlePlaceholder}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                        />

                        <textarea
                            name="reason"
                            value={roseForm.reason}
                            onChange={handleRoseChange}
                            placeholder={text.awardReasonPlaceholder}
                            rows="3"
                            required
                            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-rose-300 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100">
                                <Upload className="h-4 w-4 shrink-0" />
                                <span className="truncate">{text.addDifferentPhoto}</span>
                                <input
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handleRoseChange}
                                    className="hidden"
                                />
                            </label>

                            <input
                                type="date"
                                name="awardDate"
                                value={roseForm.awardDate}
                                onChange={handleRoseChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={savingRose}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3.5 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {savingRose ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Award className="h-5 w-5" />
                            )}
                            {text.saveTodaysRose}
                        </button>
                    </form>
                </section>
            </div>

            {/* ============================== Saved Achievements ============================== */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                        <Trophy className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {text.savedAchievements}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {achievements.length} {text.achievementRecordsFound}
                        </p>
                    </div>
                </div>

                {achievements.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                        {text.noAchievementsYet}
                    </p>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {achievements.map((achievement) => (
                            <article
                                key={achievement._id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >
                                {achievement.photo ? (
                                    <img
                                        src={getImageUrl(achievement.photo)}
                                        alt={achievement.title}
                                        className="h-44 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-44 items-center justify-center bg-amber-50 text-amber-500">
                                        <Trophy className="h-12 w-12" />
                                    </div>
                                )}

                                <div className="p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                                        {achievement.category || "General"}
                                    </p>

                                    <h3 className="mt-1 truncate text-lg font-bold text-slate-900">
                                        {achievement.title}
                                    </h3>

                                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                                        {achievement.description}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            {formatDate(achievement.achievementDate)}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteAchievement(achievement._id)
                                            }
                                            className="shrink-0 rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                                            title={text.deleteAchievementTitle}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* ============================== Rose History ============================== */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                        <Award className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {text.todaysRoseHistory}
                        </h2>
                        <p className="text-sm text-slate-500">{text.todaysRoseHistorySub}</p>
                    </div>
                </div>

                {todayRoses.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                        {text.noRoseYet}
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {todayRoses.map((rose) => (
                            <article
                                key={rose._id}
                                className="flex gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4"
                            >
                                {rose.photo ? (
                                    <img
                                        src={getImageUrl(rose.photo)}
                                        alt={rose.studentName}
                                        className="h-16 w-16 shrink-0 rounded-2xl border-2 border-rose-200 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-200 text-rose-700">
                                        <UserRound className="h-8 w-8" />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="truncate font-bold text-slate-900">
                                                {rose.studentName}
                                            </h3>

                                            <p className="truncate text-xs text-slate-600">
                                                {text.classLabel} {rose.standard}-
                                                {rose.division} · {text.grLabel} {rose.grNumber}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteRose(rose._id)}
                                            className="shrink-0 rounded-lg p-1.5 text-rose-500 transition hover:bg-white"
                                            title={text.deleteRoseTitle}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-rose-700">
                                        {rose.title}
                                    </p>

                                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                        {rose.reason}
                                    </p>

                                    <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        {formatDate(rose.awardDate)}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* ============================== Photo Gallery ============================== */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-600">
                        <ImagePlus className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {text.photoGallery}
                        </h2>
                        <p className="text-sm text-slate-500">{text.photoGallerySub}</p>
                    </div>
                </div>

                <form
                    onSubmit={handleGallerySubmit}
                    className="mb-7 flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-fuchsia-300 bg-fuchsia-50 px-4 py-3 text-sm font-bold text-fuchsia-700 transition hover:bg-fuchsia-100">
                        <ImagePlus className="h-5 w-5 shrink-0" />
                        <span className="truncate">
                            {galleryForm.photo
                                ? galleryForm.photo.name
                                : text.chooseGalleryPhoto}
                        </span>
                        <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleGalleryChange}
                            className="hidden"
                        />
                    </label>

                    <input
                        name="caption"
                        value={galleryForm.caption}
                        onChange={handleGalleryChange}
                        placeholder={text.galleryCaptionPlaceholder}
                        className="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 sm:w-auto"
                    />

                    <button
                        type="submit"
                        disabled={savingGalleryPhoto || galleryPhotos.length >= 20}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-3 font-bold text-white transition hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {savingGalleryPhoto ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Plus className="h-5 w-5" />
                        )}
                        {text.addPhoto}
                    </button>
                </form>

                <p className="mb-4 text-sm text-slate-500">
                    {galleryPhotos.length} {text.galleryPhotosFound} · {text.galleryLimitNote}
                </p>

                {galleryPhotos.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                        {text.noGalleryPhotosYet}
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                        {galleryPhotos.map((photo) => (
                            <div
                                key={photo._id}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200"
                            >
                                <img
                                    src={getImageUrl(photo.photo)}
                                    alt={photo.caption || "Gallery"}
                                    className="h-32 w-full object-cover sm:h-36"
                                />

                                <button
                                    type="button"
                                    onClick={() => handleDeleteGalleryPhoto(photo._id)}
                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-rose-600 opacity-0 shadow transition group-hover:opacity-100"
                                    title={text.deleteGalleryPhotoTitle}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                {photo.caption && (
                                    <p className="truncate bg-black/50 px-2 py-1 text-xs text-white">
                                        {photo.caption}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomeManagement;