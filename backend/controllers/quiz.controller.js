const fs = require("fs");
const path = require("path");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Student = require("../models/Student");
const User = require("../models/User");
const { checkTeacherPermission } = require("../services/teacherPermission.service");

// Helper to normalize subject name to file basename
const getSubjectFileName = (subjectName) => {
    const s = subjectName.trim().toLowerCase();
    if (s.includes("social")) return "social-science.json";
    if (s.includes("env") || s.includes("પર્યાવરણ")) return "environment.json";
    if (s.includes("math") || s.includes("ગણિત")) return "mathematics.json";
    if (s.includes("guj") || s.includes("ગુજરાતી")) return "gujarati.json";
    if (s.includes("hin") || s.includes("હિન્દી")) return "hindi.json";
    if (s.includes("san") || s.includes("સંસ્કૃત")) return "sanskrit.json";
    if (s.includes("sci") || s.includes("વિજ્ઞાન")) return "science.json";
    if (s.includes("eng") || s.includes("અંગ્રેજી")) return "english.json";
    return `${s.replace(/\s+/g, "-")}.json`;
};

// Fisher-Yates shuffle helper
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// ======================================================
// 1. Create Manual Quiz (Admin / Teacher)
// ======================================================
exports.createManualQuiz = async (req, res) => {
    try {
        const {
            title,
            standard,
            subject,
            chapters,
            questionCount,
            timeLimitPerQuestion,
            showAnswerReview,
            status,
            questions
        } = req.body;

        if (!title || !standard || !subject || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields and add at least one question."
            });
        }

        // Teacher subject & class permission check
        if (req.user.role === "teacher") {
            const perm = await checkTeacherPermission({
                teacherId: req.user.id,
                role: req.user.role,
                subject,
                standard
            });
            if (!perm.authorized) {
                return res.status(403).json({ success: false, message: perm.message });
            }
        }

        if (standard < 1 || standard > 8) {
            return res.status(400).json({
                success: false,
                message: "Standard must be between 1 and 8."
            });
        }

        // Validate each manual question
        const formattedQuestions = [];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have valid question text and between 2 to 4 options.`
                });
            }
            if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have a valid correct answer selected.`
                });
            }

            formattedQuestions.push({
                id: `manual_${Date.now()}_${i + 1}`,
                chapter: q.chapter || (chapters && chapters[0]) || 1,
                question: q.question.trim(),
                options: q.options.map(opt => opt.trim()),
                correctAnswer: Number(q.correctAnswer)
            });
        }

        const user = await User.findById(req.user.id);
        const createdByName = user ? user.name : "Teacher/Admin";

        const quiz = await Quiz.create({
            title: title.trim(),
            quizType: "manual",
            standard: Number(standard),
            subject: subject.trim(),
            chapters: Array.isArray(chapters) ? chapters.map(Number) : [1],
            questionCount: formattedQuestions.length,
            timeLimitPerQuestion: Number(timeLimitPerQuestion) || 0,
            showAnswerReview: showAnswerReview !== undefined ? showAnswerReview : true,
            status: status || "draft",
            createdBy: req.user.id,
            createdByName,
            questions: formattedQuestions
        });

        return res.status(201).json({
            success: true,
            message: "Manual Quiz created successfully.",
            quiz
        });
    } catch (error) {
        console.error("Create Manual Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create manual quiz."
        });
    }
};

// ======================================================
// 2. Create Auto Quiz (Admin / Teacher)
// ======================================================
exports.createAutoQuiz = async (req, res) => {
    try {
        const {
            title,
            standard,
            subject,
            chapters, // Array of numbers or [0] for all
            questionCount,
            timeLimitPerQuestion,
            showAnswerReview,
            status
        } = req.body;

        const stdNum = Number(standard);
        const count = Number(questionCount);

        if (!title || !stdNum || !subject || !count || count <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields correctly."
            });
        }

        // Teacher subject & class permission check
        if (req.user.role === "teacher") {
            const perm = await checkTeacherPermission({
                teacherId: req.user.id,
                role: req.user.role,
                subject,
                standard: stdNum
            });
            if (!perm.authorized) {
                return res.status(403).json({ success: false, message: perm.message });
            }
        }

        if (stdNum < 1 || stdNum > 8) {
            return res.status(400).json({
                success: false,
                message: "Standard must be between 1 and 8."
            });
        }

        // Locate Question Bank JSON file
        const fileName = getSubjectFileName(subject);
        const filePath = path.join(__dirname, `../question-bank/std-${stdNum}/${fileName}`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: `Question bank file for Standard ${stdNum} ${subject} was not found.`
            });
        }

        const rawData = fs.readFileSync(filePath, "utf8");
        const bankData = JSON.parse(rawData);
        const allQuestions = bankData.questions || [];

        if (allQuestions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No questions available in the selected subject question bank."
            });
        }

        // Extract available chapter numbers
        const availableChapters = [...new Set(allQuestions.map(q => q.c))].sort((a, b) => a - b);
        let selectedChapters = Array.isArray(chapters) && chapters.length > 0 ? chapters.map(Number) : availableChapters;

        if (selectedChapters.includes(0) || selectedChapters.length === 0) {
            selectedChapters = availableChapters;
        }

        // Filter questions belonging to selected chapters
        const questionsByChapter = {};
        selectedChapters.forEach(ch => {
            questionsByChapter[ch] = allQuestions.filter(q => q.c === ch);
        });

        // Calculate distribution target per chapter
        const C = selectedChapters.length;
        const baseCount = Math.floor(count / C);
        const remainder = count % C;

        // Shuffle chapters order to distribute remainder fairly
        const shuffledChapters = shuffleArray(selectedChapters);
        const chapterTargets = {};
        shuffledChapters.forEach((ch, idx) => {
            chapterTargets[ch] = baseCount + (idx < remainder ? 1 : 0);
        });

        // Verify chapter availability
        for (const ch of selectedChapters) {
            const needed = chapterTargets[ch];
            const avail = questionsByChapter[ch] ? questionsByChapter[ch].length : 0;
            if (avail < needed) {
                return res.status(400).json({
                    success: false,
                    message: `Chapter ${ch} has only ${avail} questions available. Add more questions or reduce the quiz question count.`
                });
            }
        }

        // Fetch recent auto quizzes for duplicate question prevention
        const recentQuizzes = await Quiz.find({
            standard: stdNum,
            subject: subject.trim(),
            quizType: "auto"
        }).sort({ createdAt: -1 }).limit(10);

        const usedQuestionIds = new Set();
        recentQuizzes.forEach(q => {
            if (q.autoQuestionIds && Array.isArray(q.autoQuestionIds)) {
                q.autoQuestionIds.forEach(id => usedQuestionIds.add(id));
            }
        });

        // Select questions per chapter
        const selectedQuestions = [];
        const selectedIds = [];

        for (const ch of selectedChapters) {
            const target = chapterTargets[ch];
            const pool = questionsByChapter[ch] || [];

            const unusedPool = pool.filter(q => !usedQuestionIds.has(q.id));
            let chosenForChapter = [];

            if (unusedPool.length >= target) {
                chosenForChapter = shuffleArray(unusedPool).slice(0, target);
            } else {
                chosenForChapter = [...unusedPool];
                const neededExtra = target - unusedPool.length;
                const usedPool = pool.filter(q => usedQuestionIds.has(q.id));
                const extraChosen = shuffleArray(usedPool).slice(0, neededExtra);
                chosenForChapter = chosenForChapter.concat(extraChosen);
            }

            chosenForChapter.forEach(q => {
                selectedQuestions.push({
                    id: q.id,
                    chapter: q.c,
                    question: q.q,
                    options: q.o,
                    correctAnswer: q.a
                });
                selectedIds.push(q.id);
            });
        }

        // Final shuffle so questions are mixed across chapters
        const finalQuestions = shuffleArray(selectedQuestions);

        const user = await User.findById(req.user.id);
        const createdByName = user ? user.name : "Teacher/Admin";

        const quiz = await Quiz.create({
            title: title.trim(),
            quizType: "auto",
            standard: stdNum,
            subject: subject.trim(),
            chapters: selectedChapters,
            questionCount: finalQuestions.length,
            timeLimitPerQuestion: Number(timeLimitPerQuestion) || 0,
            showAnswerReview: showAnswerReview !== undefined ? showAnswerReview : true,
            status: status || "draft",
            createdBy: req.user.id,
            createdByName,
            questions: finalQuestions,
            autoQuestionIds: selectedIds
        });

        return res.status(201).json({
            success: true,
            message: "Auto Quiz created successfully.",
            quiz
        });
    } catch (error) {
        console.error("Create Auto Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create auto quiz."
        });
    }
};

// ======================================================
// 3. Get Quizzes List
// ======================================================
exports.getQuizzes = async (req, res) => {
    try {
        const { standard, subject, quizType, status, search } = req.query;
        const filter = {};

        // If user is a student, restrict to published quizzes for their standard
        if (req.user.role === "student") {
            const student = await Student.findById(req.user.id);
            if (!student) {
                return res.status(404).json({ success: false, message: "Student record not found." });
            }
            filter.standard = student.standard;
            filter.status = "published";
        } else {
            if (standard) filter.standard = Number(standard);
            if (status) filter.status = status;
        }

        if (subject) filter.subject = new RegExp(subject, "i");
        if (quizType) filter.quizType = quizType;
        if (search) filter.title = new RegExp(search, "i");

        const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

        // If student, sanitize questions from response
        const formattedQuizzes = quizzes.map(q => {
            const qObj = q.toObject();
            if (req.user.role === "student") {
                delete qObj.questions;
                delete qObj.autoQuestionIds;
            }
            return qObj;
        });

        return res.json({
            success: true,
            quizzes: formattedQuizzes
        });
    } catch (error) {
        console.error("Get Quizzes Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch quizzes."
        });
    }
};

// ======================================================
// 4. Get Quiz Details / Edit Data
// ======================================================
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found." });
        }

        if (req.user.role === "student") {
            const student = await Student.findById(req.user.id);
            if (!student || student.standard !== quiz.standard) {
                return res.status(403).json({
                    success: false,
                    message: "You can only view quizzes assigned to your standard."
                });
            }
            if (quiz.status !== "published") {
                return res.status(403).json({
                    success: false,
                    message: "This quiz is not published yet."
                });
            }

            // Sanitize question answers for student preview
            const sanitizedQuiz = quiz.toObject();
            sanitizedQuiz.questions = sanitizedQuiz.questions.map(q => {
                const { correctAnswer, ...rest } = q;
                return rest;
            });
            return res.json({ success: true, quiz: sanitizedQuiz });
        }

        return res.json({ success: true, quiz });
    } catch (error) {
        console.error("Get Quiz By Id Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch quiz details." });
    }
};

// ======================================================
// 5. Start Quiz Attempt (Student)
// ======================================================
exports.startQuiz = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ success: false, message: "Only students can attempt quizzes." });
        }

        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student record not found." });
        }

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz || quiz.status !== "published") {
            return res.status(404).json({ success: false, message: "Quiz not available or not published." });
        }

        if (student.standard !== quiz.standard) {
            return res.status(403).json({
                success: false,
                message: `You can only attempt quizzes assigned to Standard ${student.standard}.`
            });
        }

        // Check for existing active in-progress attempt
        let attempt = await QuizAttempt.findOne({
            quiz: quiz._id,
            student: student._id,
            status: "in_progress"
        });

        if (!attempt) {
            // Prepare shuffled options and recalculate correct answer indices
            const attemptAnswers = quiz.questions.map(q => {
                const originalCorrectText = q.options[q.correctAnswer];
                const shuffledOptions = shuffleArray(q.options);
                const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

                return {
                    questionId: q.id,
                    questionText: q.question,
                    options: shuffledOptions,
                    selectedOption: -1,
                    correctAnswer: newCorrectIndex,
                    isCorrect: false,
                    timeSpent: 0
                };
            });

            attempt = await QuizAttempt.create({
                quiz: quiz._id,
                student: student._id,
                studentName: student.fullName,
                studentPhoto: student.photo || "",
                standard: student.standard,
                answers: attemptAnswers,
                score: 0,
                totalQuestions: quiz.questions.length,
                percentage: 0,
                status: "in_progress",
                startedAt: new Date()
            });
        }

        // Sanitize attempt payload returned to student: hide correctAnswer & isCorrect
        const clientAttempt = {
            _id: attempt._id,
            quizId: quiz._id,
            title: quiz.title,
            subject: quiz.subject,
            standard: quiz.standard,
            questionCount: quiz.questionCount,
            timeLimitPerQuestion: quiz.timeLimitPerQuestion,
            status: attempt.status,
            startedAt: attempt.startedAt,
            questions: attempt.answers.map(ans => ({
                questionId: ans.questionId,
                questionText: ans.questionText,
                options: ans.options,
                selectedOption: ans.selectedOption
            }))
        };

        return res.json({
            success: true,
            attempt: clientAttempt
        });
    } catch (error) {
        console.error("Start Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Failed to start quiz attempt." });
    }
};

// ======================================================
// 6. Save Answer (Student Autosave during Quiz)
// ======================================================
exports.saveAnswer = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { questionId, selectedOption, timeSpent } = req.body;

        const attempt = await QuizAttempt.findOne({
            _id: attemptId,
            student: req.user.id,
            status: "in_progress"
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Active quiz attempt not found." });
        }

        const answerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
        if (answerIndex !== -1) {
            attempt.answers[answerIndex].selectedOption = Number(selectedOption);
            if (timeSpent !== undefined) {
                attempt.answers[answerIndex].timeSpent = Number(timeSpent);
            }
            await attempt.save();
        }

        return res.json({ success: true, message: "Answer saved." });
    } catch (error) {
        console.error("Save Answer Error:", error);
        return res.status(500).json({ success: false, message: "Failed to save answer." });
    }
};

// ======================================================
// 7. Submit Quiz Attempt (Student)
// ======================================================
exports.submitQuiz = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body; // Optional final answers array [{ questionId, selectedOption }]

        const attempt = await QuizAttempt.findOne({
            _id: attemptId,
            student: req.user.id
        }).populate("quiz", "title subject showAnswerReview");

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Quiz attempt not found." });
        }

        if (attempt.status === "completed") {
            return res.json({
                success: true,
                message: "Quiz attempt already submitted.",
                attempt
            });
        }

        // Update answers if passed in submission payload
        if (answers && Array.isArray(answers)) {
            answers.forEach(item => {
                const ans = attempt.answers.find(a => a.questionId === item.questionId);
                if (ans) {
                    ans.selectedOption = Number(item.selectedOption);
                    if (item.timeSpent !== undefined) {
                        ans.timeSpent = Number(item.timeSpent);
                    }
                }
            });
        }

        // Calculate score
        let score = 0;
        attempt.answers.forEach(ans => {
            if (ans.selectedOption === ans.correctAnswer) {
                ans.isCorrect = true;
                score += 1;
            } else {
                ans.isCorrect = false;
            }
        });

        const now = new Date();
        const total = attempt.totalQuestions || attempt.answers.length;
        const percentage = Number(((score / total) * 100).toFixed(2));
        const timeTakenSeconds = Math.round((now - new Date(attempt.startedAt)) / 1000);

        attempt.score = score;
        attempt.percentage = percentage;
        attempt.status = "completed";
        attempt.completedAt = now;
        attempt.timeTakenSeconds = timeTakenSeconds;

        await attempt.save();

        // Format result summary
        const quizObj = attempt.quiz || {};
        const resultSummary = {
            _id: attempt._id,
            quizTitle: quizObj.title,
            subject: quizObj.subject,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            correctCount: score,
            wrongCount: total - score,
            percentage: attempt.percentage,
            timeTakenSeconds: attempt.timeTakenSeconds,
            showAnswerReview: quizObj.showAnswerReview !== false,
            answers: quizObj.showAnswerReview !== false ? attempt.answers : []
        };

        return res.json({
            success: true,
            message: "Quiz submitted successfully.",
            result: resultSummary
        });
    } catch (error) {
        console.error("Submit Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Failed to submit quiz." });
    }
};

// ======================================================
// 8. Publish / Unpublish Quiz (Admin / Teacher)
// ======================================================
exports.togglePublishStatus = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found." });
        }

        quiz.status = quiz.status === "published" ? "draft" : "published";
        await quiz.save();

        return res.json({
            success: true,
            message: `Quiz status updated to ${quiz.status}.`,
            status: quiz.status
        });
    } catch (error) {
        console.error("Toggle Publish Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update quiz status." });
    }
};

// ======================================================
// 9. Update Quiz (Admin / Teacher)
// ======================================================
exports.updateQuiz = async (req, res) => {
    try {
        const { title, timeLimitPerQuestion, showAnswerReview, status, questions } = req.body;
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found." });
        }

        if (title) quiz.title = title.trim();
        if (timeLimitPerQuestion !== undefined) quiz.timeLimitPerQuestion = Number(timeLimitPerQuestion);
        if (showAnswerReview !== undefined) quiz.showAnswerReview = showAnswerReview;
        if (status) quiz.status = status;

        if (quiz.quizType === "manual" && questions && Array.isArray(questions)) {
            quiz.questions = questions.map((q, idx) => ({
                id: q.id || `manual_${Date.now()}_${idx}`,
                chapter: q.chapter || 1,
                question: q.question.trim(),
                options: q.options.map(o => o.trim()),
                correctAnswer: Number(q.correctAnswer)
            }));
            quiz.questionCount = quiz.questions.length;
        }

        await quiz.save();

        return res.json({
            success: true,
            message: "Quiz updated successfully.",
            quiz
        });
    } catch (error) {
        console.error("Update Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update quiz." });
    }
};

// ======================================================
// 10. Delete Quiz & Complete Data Memory Cleanup
// ======================================================
exports.deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found." });
        }

        // Delete Quiz document
        await Quiz.findByIdAndDelete(quizId);

        // Memory cleanup: Delete all QuizAttempt documents for this quiz from MongoDB
        const deletedAttempts = await QuizAttempt.deleteMany({ quiz: quizId });

        return res.json({
            success: true,
            message: "Quiz and all associated attempt data deleted from MongoDB.",
            deletedAttemptsCount: deletedAttempts.deletedCount
        });
    } catch (error) {
        console.error("Delete Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete quiz." });
    }
};

// ======================================================
// 11. Get Student Attempt Results
// ======================================================
exports.getStudentAttempts = async (req, res) => {
    try {
        let studentId = req.user.id;
        if (req.user.role !== "student" && req.query.studentId) {
            studentId = req.query.studentId;
        }

        const filter = { student: studentId };
        if (req.query.quizId) filter.quiz = req.query.quizId;

        const attempts = await QuizAttempt.find(filter)
            .populate("quiz", "title subject standard quizType showAnswerReview")
            .sort({ completedAt: -1, createdAt: -1 });

        return res.json({
            success: true,
            attempts
        });
    } catch (error) {
        console.error("Get Student Attempts Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch student attempts." });
    }
};

// ======================================================
// 12. Get Quiz Attempt Detail Result View
// ======================================================
exports.getAttemptById = async (req, res) => {
    try {
        const attempt = await QuizAttempt.findById(req.params.attemptId)
            .populate("quiz", "title subject standard showAnswerReview");

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Quiz attempt not found." });
        }

        // Auth check: student can only view their own attempt
        if (req.user.role === "student" && attempt.student.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access to attempt." });
        }

        const quizObj = attempt.quiz || {};
        const showReview = quizObj.showAnswerReview !== false || req.user.role !== "student";

        return res.json({
            success: true,
            attempt: {
                _id: attempt._id,
                quizId: attempt.quiz?._id,
                quizTitle: quizObj.title || "Quiz",
                subject: quizObj.subject || "",
                studentName: attempt.studentName,
                studentPhoto: attempt.studentPhoto,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                percentage: attempt.percentage,
                status: attempt.status,
                timeTakenSeconds: attempt.timeTakenSeconds,
                startedAt: attempt.startedAt,
                completedAt: attempt.completedAt,
                showAnswerReview: showReview,
                answers: showReview ? attempt.answers : []
            }
        });
    } catch (error) {
        console.error("Get Attempt By Id Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch attempt detail." });
    }
};

// ======================================================
// 13. Quiz Rank / Leaderboard (Olympic Medal System)
// ======================================================
exports.getQuizLeaderboard = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found." });
        }

        // Fetch completed attempts for this quiz
        const attempts = await QuizAttempt.find({
            quiz: quizId,
            status: "completed"
        }).lean();

        if (attempts.length === 0) {
            return res.json({
                success: true,
                quizTitle: quiz.title,
                subject: quiz.subject,
                standard: quiz.standard,
                totalStudentsAttempted: 0,
                podium: { first: null, second: null, third: null },
                rankings: []
            });
        }

        // Fetch student details to ensure fresh photos & names
        const studentIds = attempts.map(a => a.student);
        const students = await Student.find({ _id: { $in: studentIds } }, "fullName photo grNumber").lean();
        const studentMap = {};
        students.forEach(s => {
            studentMap[s._id.toString()] = s;
        });

        // Group attempts by student to get each student's best attempt
        const bestAttemptMap = {};
        attempts.forEach(att => {
            const sId = att.student.toString();
            const existing = bestAttemptMap[sId];
            if (!existing) {
                bestAttemptMap[sId] = att;
            } else {
                if (
                    att.score > existing.score ||
                    (att.score === existing.score && att.timeTakenSeconds < existing.timeTakenSeconds)
                ) {
                    bestAttemptMap[sId] = att;
                }
            }
        });

        const uniqueAttempts = Object.values(bestAttemptMap);

        // Sort by score descending, then timeTakenSeconds ascending
        uniqueAttempts.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
        });

        // Format rankings list
        const formattedRankings = uniqueAttempts.map((att, index) => {
            const stInfo = studentMap[att.student.toString()] || {};
            return {
                rank: index + 1,
                studentId: att.student,
                fullName: stInfo.fullName || att.studentName || "Student",
                photo: stInfo.photo || att.studentPhoto || "",
                grNumber: stInfo.grNumber || "",
                score: att.score,
                totalQuestions: att.totalQuestions,
                percentage: att.percentage,
                timeTakenSeconds: att.timeTakenSeconds || 0,
                completedAt: att.completedAt
            };
        });

        const podium = {
            first: formattedRankings[0] || null,  // 🥇 Gold
            second: formattedRankings[1] || null, // 🥈 Silver
            third: formattedRankings[2] || null   // 🥉 Bronze
        };

        const remainingRankings = formattedRankings.slice(3);

        return res.json({
            success: true,
            quizTitle: quiz.title,
            subject: quiz.subject,
            standard: quiz.standard,
            totalStudentsAttempted: formattedRankings.length,
            podium,
            rankings: remainingRankings,
            allRankings: formattedRankings
        });
    } catch (error) {
        console.error("Get Quiz Leaderboard Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch leaderboard." });
    }
};

// ======================================================
// 14. Quiz Analytics for Admin / Teacher
// ======================================================
exports.getQuizAnalytics = async (req, res) => {
    try {
        const { standard, subject } = req.query;
        const filter = {};
        if (standard) filter.standard = Number(standard);
        if (subject) filter.subject = new RegExp(subject, "i");

        const totalQuizzes = await Quiz.countDocuments(filter);
        const publishedQuizzes = await Quiz.countDocuments({ ...filter, status: "published" });

        const attempts = await QuizAttempt.find({ status: "completed" }).populate("quiz", "standard subject title");

        const filteredAttempts = attempts.filter(att => {
            if (!att.quiz) return false;
            if (standard && att.quiz.standard !== Number(standard)) return false;
            if (subject && !att.quiz.subject.toLowerCase().includes(subject.toLowerCase())) return false;
            return true;
        });

        const totalAttempts = filteredAttempts.length;
        let avgScore = 0;
        let highestScore = 0;
        let lowestScore = totalAttempts > 0 ? 100 : 0;
        let totalPercentageSum = 0;

        filteredAttempts.forEach(att => {
            totalPercentageSum += att.percentage;
            if (att.percentage > highestScore) highestScore = att.percentage;
            if (att.percentage < lowestScore) lowestScore = att.percentage;
        });

        if (totalAttempts > 0) {
            avgScore = Number((totalPercentageSum / totalAttempts).toFixed(2));
        }

        return res.json({
            success: true,
            analytics: {
                totalQuizzes,
                publishedQuizzes,
                totalAttempts,
                avgScore,
                highestScore,
                lowestScore: totalAttempts > 0 ? lowestScore : 0
            }
        });
    } catch (error) {
        console.error("Get Quiz Analytics Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch quiz analytics." });
    }
};
