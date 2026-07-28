import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Upload,
    Paperclip,
    X,
    CheckCircle,
    Clock,
    Loader2
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeworkById } from "../../services/homeworkService";
import { submitHomework } from "../../services/homeworkSubmissionService";

const SubmitHomework = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const { language } = useLanguage();
    const isGujarati = language === "gu";

    const [homework, setHomework] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answer, setAnswer] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const text = {
        loading: isGujarati ? "ગૃહકાર્ય લોડ થઈ રહ્યું છે..." : "Loading homework...",
        notFound: isGujarati ? "ગૃહકાર્ય મળ્યું નથી" : "Homework Not Found",
        pageTitle: isGujarati ? "ગૃહકાર્ય સબમિટ કરો" : "Submit Homework",
        pageSubtitle: isGujarati
            ? "તમારો જવાબ લખો અથવા ફાઈલ અપલોડ કરો."
            : "Write your answer or upload a file.",
        overdueTitle: isGujarati
            ? "આ ગૃહકાર્યની મુદત વીતી ગઈ છે"
            : "This homework is overdue",
        overdueText: isGujarati
            ? "છેલ્લી તારીખ હતી"
            : "Due date was",
        overdueTextEnd: isGujarati
            ? "તમે હજુ પણ સબમિટ કરી શકો છો પરંતુ તે મોડું ગણાશે."
            : "You can still submit but it will be marked as Late.",
        writtenAnswer: isGujarati ? "લેખિત જવાબ" : "Written Answer",
        writtenAnswerSubtitle: isGujarati
            ? "નીચે તમારો જવાબ લખો. તમે જવાબની સાથે અથવા તેના બદલે ફાઈલ પણ અપલોડ કરી શકો છો."
            : "Type your answer below. You can also upload a file instead or along with your answer.",
        answerPlaceholder: isGujarati
            ? "તમારો જવાબ અહીં લખો..."
            : "Write your answer here...",
        characters: isGujarati ? "અક્ષરો" : "characters",
        fileUpload: isGujarati ? "ફાઈલ અપલોડ" : "File Upload",
        fileUploadSubtitle: isGujarati
            ? "તમારો જવાબ PDF, Word, Excel અથવા Image તરીકે અપલોડ કરો. મહત્તમ 10 MB."
            : "Upload your answer as PDF, Word, Excel or Image. Max 10 MB.",
        clickToChange: isGujarati ? "ફાઈલ બદલવા ક્લિક કરો" : "Click to change file",
        clickToUpload: isGujarati ? "ફાઈલ અપલોડ કરવા ક્લિક કરો" : "Click to upload file",
        acceptedFormats: isGujarati
            ? "PDF, Word, Excel અથવા Image"
            : "PDF, Word, Excel or Image",
        cancel: isGujarati ? "રદ કરો" : "Cancel",
        submitting: isGujarati ? "સબમિટ થઈ રહ્યું છે..." : "Submitting...",
        submitLate: isGujarati ? "મોડું સબમિટ કરો" : "Submit Late",
        submitHomeworkBtn: isGujarati ? "ગૃહકાર્ય સબમિટ કરો" : "Submit Homework",
        homeworkInfo: isGujarati ? "ગૃહકાર્યની માહિતી" : "Homework Info",
        title: isGujarati ? "શીર્ષક" : "Title",
        subject: isGujarati ? "વિષય" : "Subject",
        class: isGujarati ? "વર્ગ" : "Class",
        teacher: isGujarati ? "શિક્ષક" : "Teacher",
        dueDateLabel: isGujarati ? "છેલ્લી તારીખ" : "Due Date",
        totalMarks: isGujarati ? "કુલ ગુણ" : "Total Marks",
        instructions: isGujarati ? "સૂચનાઓ" : "Instructions",
        questionPaper: isGujarati ? "પ્રશ્નપત્ર" : "Question Paper",
        downloadFile: isGujarati ? "ફાઈલ ડાઉનલોડ કરો" : "Download File",
        clickToOpen: isGujarati ? "ખોલવા ક્લિક કરો" : "Click to open",
        tips: isGujarati ? "સૂચનો" : "Tips",
        tip1: isGujarati
            ? "તમે તમારો જવાબ ટેક્સ્ટ બોક્સમાં લખી શકો છો અથવા ફાઈલ અપલોડ કરી શકો છો — અથવા બંને."
            : "You can write your answer in the text box or upload a file — or both.",
        tip2: isGujarati
            ? "સ્વીકૃત ફોર્મેટ: PDF, Word, Excel, JPG, PNG."
            : "Accepted formats: PDF, Word, Excel, JPG, PNG.",
        tip3: isGujarati
            ? "મહત્તમ ફાઈલ સાઈઝ 10 MB છે."
            : "Maximum file size is 10 MB.",
        tip4: isGujarati
            ? "ગ્રેડિંગ પહેલાં તમે તમારો જવાબ ફરીથી સબમિટ કરી શકો છો."
            : "You can re-submit to update your answer before grading.",
        alertFileSize: isGujarati
            ? "ફાઈલનું કદ 10 MB થી ઓછું હોવું જોઈએ"
            : "File size must be under 10 MB",
        alertNoAnswer: isGujarati
            ? "કૃપા કરીને સબમિટ કરતા પહેલા જવાબ લખો અથવા ફાઈલ અપલોડ કરો."
            : "Please write an answer or upload a file before submitting.",
        alertNoStudent: isGujarati
            ? "વિદ્યાર્થીની ઓળખ કરવામાં અસમર્થ. કૃપા કરીને ફરીથી લોગિન કરો."
            : "Unable to identify student. Please log in again.",
        alertSuccess: isGujarati
            ? "ગૃહકાર્ય સફળતાપૂર્વક સબમિટ થયું"
            : "Homework Submitted Successfully",
        alertError: isGujarati
            ? "ગૃહકાર્ય સબમિટ કરવામાં અસમર્થ"
            : "Unable to submit homework",
        dash: "-"
    };

    useEffect(() => {
        loadHomework();
    }, []);

    const loadHomework = async () => {
        try {
            setLoading(true);

            const response = await getHomeworkById(id);
            setHomework(response.homework);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert(text.alertFileSize);
            return;
        }

        setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = async () => {
        if (!answer.trim() && !selectedFile) {
            alert(text.alertNoAnswer);
            return;
        }

        const studentId = user?.studentId || user?.id;

        if (!studentId) {
            alert(text.alertNoStudent);
            return;
        }

        try {
            setSubmitting(true);

            const data = new FormData();
            data.append("homeworkId", id);
            data.append("studentId", studentId);
            data.append("answer", answer);

            if (selectedFile) {
                data.append("fileAttachment", selectedFile);
            }

            const response = await submitHomework(data);
            alert(response.message || text.alertSuccess);

            navigate("/homework/my");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || text.alertError);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-full flex-col items-center justify-center gap-3">
                <Loader2 size={38} className="animate-spin text-[#5B2EFF]" />
                <p className="font-medium text-slate-500">{text.loading}</p>
            </div>
        );
    }

    if (!homework) {
        return (
            <div className="p-4 text-center sm:p-8">
                <h2 className="text-xl font-semibold text-gray-600">
                    {text.notFound}
                </h2>
            </div>
        );
    }

    const isOverdue = new Date(homework.dueDate) < new Date();

    const dueDate = new Date(homework.dueDate).toLocaleDateString(
        isGujarati ? "gu-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

    return (
        <div className="min-h-full bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
            {/* ============================== Header ============================== */}
            <div className="mb-7 flex items-center gap-4">
                <button
                    onClick={() => navigate("/homework/my")}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-100 sm:h-12 sm:w-12"
                >
                    <ArrowLeft size={22} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">
                        {text.pageTitle}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 sm:mt-2 sm:text-base">
                        {text.pageSubtitle}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-7">
                {/* ============================== Left — Submission Form ============================== */}
                <div className="space-y-6 xl:col-span-2 xl:space-y-7">
                    {/* Overdue Warning */}
                    {isOverdue && (
                        <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
                            <Clock size={24} className="shrink-0 text-red-500" />

                            <div>
                                <p className="font-semibold text-red-700">
                                    {text.overdueTitle}
                                </p>

                                <p className="mt-1 text-sm text-red-500">
                                    {text.overdueText} {dueDate}. {text.overdueTextEnd}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Written Answer */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                        <h2 className="mb-2 text-lg font-bold sm:text-xl">
                            {text.writtenAnswer}
                        </h2>

                        <p className="mb-5 text-sm text-gray-400">
                            {text.writtenAnswerSubtitle}
                        </p>

                        <textarea
                            rows="10"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={text.answerPlaceholder}
                            className="w-full resize-none rounded-xl border p-4 text-gray-700 outline-none focus:border-[#5B2EFF]"
                        />

                        <div className="mt-3 flex justify-end">
                            <span className="text-sm text-gray-400">
                                {answer.length} {text.characters}
                            </span>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                        <h2 className="mb-2 text-lg font-bold sm:text-xl">
                            {text.fileUpload}
                        </h2>

                        <p className="mb-5 text-sm text-gray-400">
                            {text.fileUploadSubtitle}
                        </p>

                        {selectedFile && (
                            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 sm:px-5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Paperclip size={20} className="shrink-0 text-indigo-600" />

                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-gray-800">
                                            {selectedFile.name}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 transition hover:bg-red-200"
                                >
                                    <X size={16} className="text-red-600" />
                                </button>
                            </div>
                        )}

                        <label
                            htmlFor="submissionFile"
                            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-6 cursor-pointer transition hover:border-[#5B2EFF] hover:bg-indigo-50 sm:p-10"
                        >
                            <Upload size={36} className="mb-3 text-gray-400" />

                            <p className="text-center font-semibold text-gray-600">
                                {selectedFile ? text.clickToChange : text.clickToUpload}
                            </p>

                            <p className="mt-1 text-center text-sm text-gray-400">
                                {text.acceptedFormats}
                            </p>

                            <input
                                id="submissionFile"
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                                className="hidden"
                                onChange={handleFile}
                            />
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <button
                            onClick={() => navigate("/homework/my")}
                            className="rounded-xl border border-gray-300 bg-white px-8 py-4 font-medium hover:bg-gray-100"
                        >
                            {text.cancel}
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#5B2EFF] py-4 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#4724db] disabled:opacity-60 disabled:hover:scale-100"
                        >
                            {submitting ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                            ) : (
                                <CheckCircle size={20} />
                            )}

                            {submitting
                                ? text.submitting
                                : isOverdue
                                ? text.submitLate
                                : text.submitHomeworkBtn}
                        </button>
                    </div>
                </div>

                {/* ============================== Right — Homework Info ============================== */}
                <div className="space-y-6">
                    {/* Homework Card */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                        <h2 className="mb-5 text-lg font-bold">{text.homeworkInfo}</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400">{text.title}</p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {homework.title}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.subject}</p>
                                <span className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                                    {homework.subject}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.class}</p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {isGujarati
                                        ? `${homework.standard} ધોરણ - ${homework.division}`
                                        : `Std ${homework.standard} - ${homework.division}`}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.teacher}</p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {homework.teacherId?.fullName || text.dash}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.dueDateLabel}</p>
                                <p
                                    className={`mt-1 font-semibold ${
                                        isOverdue ? "text-red-600" : "text-gray-800"
                                    }`}
                                >
                                    {dueDate}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">{text.totalMarks}</p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {homework.totalMarks}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                        <h2 className="mb-4 text-lg font-bold">{text.instructions}</h2>

                        <p className="break-words text-sm leading-relaxed text-gray-600">
                            {homework.description}
                        </p>
                    </div>

                    {/* Attachment from teacher */}
                    {homework.attachment && (
                        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 sm:p-7">
                            <h2 className="mb-4 text-lg font-bold">{text.questionPaper}</h2>

                            <a
                                href={`http://localhost:5000/uploads/homework/questions/${homework.attachment}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                            >
                                <Paperclip size={20} className="shrink-0 text-indigo-600" />

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-800">
                                        {homework.attachmentOriginalName || text.downloadFile}
                                    </p>

                                    <p className="mt-1 text-xs text-indigo-500">
                                        {text.clickToOpen}
                                    </p>
                                </div>
                            </a>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="rounded-3xl border border-yellow-100 bg-yellow-50 p-5 sm:p-7">
                        <h2 className="mb-4 text-lg font-bold">{text.tips}</h2>

                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-yellow-500">•</span>
                                {text.tip1}
                            </li>

                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-yellow-500">•</span>
                                {text.tip2}
                            </li>

                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-yellow-500">•</span>
                                {text.tip3}
                            </li>

                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-yellow-500">•</span>
                                {text.tip4}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitHomework;