import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Paperclip, X, CheckCircle, Clock } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getHomeworkById } from "../../services/homeworkService";
import { submitHomework } from "../../services/homeworkSubmissionService";

const SubmitHomework = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();

    const [homework, setHomework] = useState(null);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [answer, setAnswer] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);

    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    const [existingSubmission, setExistingSubmission] = useState(null);

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

            alert("File size must be under 10 MB");

            return;

        }

        setSelectedFile(file);

    };

    const removeFile = () => {

        setSelectedFile(null);

    };

    const handleSubmit = async () => {

        if (!answer.trim() && !selectedFile) {

            alert("Please write an answer or upload a file before submitting.");

            return;

        }

        const studentId = user?.studentId || user?.id;

        if (!studentId) {

            alert("Unable to identify student. Please log in again.");

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

            alert(response.message || "Homework Submitted Successfully");

            navigate("/homework/my");

        } catch (error) {

            console.log(error);

            alert(error.response?.data?.message || "Unable to submit homework");

        } finally {

            setSubmitting(false);

        }

    };

    if (loading) {

        return (

            <div className="h-full flex items-center justify-center">

                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

            </div>

        );

    }

    if (!homework) {

        return (

            <div className="p-8 text-center">

                <h2 className="text-xl font-semibold text-gray-600">Homework Not Found</h2>

            </div>

        );

    }

    const isOverdue = new Date(homework.dueDate) < new Date();

    const dueDate = new Date(homework.dueDate).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    return (

        <div className="p-8 bg-[#F5F7FB] min-h-full">

            {/* ============================== Header ============================== */}

            <div className="flex items-center gap-4 mb-8">

                <button
                    onClick={() => navigate("/homework/my")}
                    className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-100"
                >

                    <ArrowLeft size={22} />

                </button>

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">Submit Homework</h1>

                    <p className="mt-2 text-slate-500">Write your answer or upload a file.</p>

                </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

                {/* ============================== Left — Submission Form ============================== */}

                <div className="xl:col-span-2 space-y-7">

                    {/* Overdue Warning */}

                    {isOverdue && (

                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">

                            <Clock size={24} className="text-red-500 shrink-0" />

                            <div>

                                <p className="font-semibold text-red-700">This homework is overdue</p>

                                <p className="text-sm text-red-500 mt-1">
                                    Due date was {dueDate}. You can still submit but it will be marked as Late.
                                </p>

                            </div>

                        </div>

                    )}

                    {/* Written Answer */}

                    <div className="bg-white rounded-3xl shadow p-8">

                        <h2 className="text-xl font-bold mb-2">Written Answer</h2>

                        <p className="text-gray-400 text-sm mb-5">
                            Type your answer below. You can also upload a file instead or along with your answer.
                        </p>

                        <textarea
                            rows="10"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Write your answer here..."
                            className="w-full rounded-xl border p-4 outline-none resize-none focus:border-[#5B2EFF] text-gray-700"
                        />

                        <div className="flex justify-end mt-3">

                            <span className="text-sm text-gray-400">
                                {answer.length} characters
                            </span>

                        </div>

                    </div>

                    {/* File Upload */}

                    <div className="bg-white rounded-3xl shadow p-8">

                        <h2 className="text-xl font-bold mb-2">File Upload</h2>

                        <p className="text-gray-400 text-sm mb-5">
                            Upload your answer as PDF, Word, Excel or Image. Max 10 MB.
                        </p>

                        {selectedFile && (

                            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-5">

                                <div className="flex items-center gap-3">

                                    <Paperclip size={20} className="text-indigo-600" />

                                    <div>

                                        <p className="font-semibold text-gray-800">
                                            {selectedFile.name}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition"
                                >

                                    <X size={16} className="text-red-600" />

                                </button>

                            </div>

                        )}

                        <label
                            htmlFor="submissionFile"
                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 cursor-pointer hover:border-[#5B2EFF] hover:bg-indigo-50 transition"
                        >

                            <Upload size={36} className="text-gray-400 mb-3" />

                            <p className="font-semibold text-gray-600">
                                {selectedFile ? "Click to change file" : "Click to upload file"}
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                                PDF, Word, Excel or Image
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

                    <div className="flex gap-4">

                        <button
                            onClick={() => navigate("/homework/my")}
                            className="rounded-xl border border-gray-300 bg-white px-8 py-4 font-medium hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-3 rounded-xl bg-[#5B2EFF] py-4 text-white font-semibold hover:bg-[#4724db] hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100 shadow-lg"
                        >

                            {submitting ? (

                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>

                            ) : (

                                <CheckCircle size={20} />

                            )}

                            {submitting ? "Submitting..." : isOverdue ? "Submit Late" : "Submit Homework"}

                        </button>

                    </div>

                </div>

                {/* ============================== Right — Homework Info ============================== */}

                <div className="space-y-6">

                    {/* Homework Card */}

                    <div className="bg-white rounded-3xl shadow p-7">

                        <h2 className="text-lg font-bold mb-5">Homework Info</h2>

                        <div className="space-y-4">

                            <div>
                                <p className="text-xs text-gray-400">Title</p>
                                <p className="font-semibold text-gray-800 mt-1">{homework.title}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Subject</p>
                                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                                    {homework.subject}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Class</p>
                                <p className="font-semibold text-gray-800 mt-1">
                                    Std {homework.standard} - {homework.division}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Teacher</p>
                                <p className="font-semibold text-gray-800 mt-1">
                                    {homework.teacherId?.fullName || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Due Date</p>
                                <p className={"font-semibold mt-1 " + (isOverdue ? "text-red-600" : "text-gray-800")}>
                                    {dueDate}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Total Marks</p>
                                <p className="font-semibold text-gray-800 mt-1">{homework.totalMarks}</p>
                            </div>

                        </div>

                    </div>

                    {/* Description */}

                    <div className="bg-white rounded-3xl shadow p-7">

                        <h2 className="text-lg font-bold mb-4">Instructions</h2>

                        <p className="text-gray-600 leading-relaxed text-sm">
                            {homework.description}
                        </p>

                    </div>

                    {/* Attachment from teacher */}

                    {homework.attachment && (

                        <div className="bg-indigo-50 rounded-3xl p-7 border border-indigo-100">

                            <h2 className="text-lg font-bold mb-4">Question Paper</h2>

                            <a
                                href={"http://localhost:5000/uploads/homework/questions/" + homework.attachment}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                            >

                                <Paperclip size={20} className="text-indigo-600" />

                                <div>

                                    <p className="font-semibold text-gray-800 text-sm">
                                        {homework.attachmentOriginalName || "Download File"}
                                    </p>

                                    <p className="text-xs text-indigo-500 mt-1">
                                        Click to open
                                    </p>

                                </div>

                            </a>

                        </div>

                    )}

                    {/* Tips */}

                    <div className="bg-yellow-50 rounded-3xl p-7 border border-yellow-100">

                        <h2 className="text-lg font-bold mb-4">Tips</h2>

                        <ul className="space-y-3 text-sm text-gray-600">

                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                You can write your answer in the text box or upload a file — or both.
                            </li>

                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                Accepted formats: PDF, Word, Excel, JPG, PNG.
                            </li>

                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                Maximum file size is 10 MB.
                            </li>

                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                You can re-submit to update your answer before grading.
                            </li>

                        </ul>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default SubmitHomework;