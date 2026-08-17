const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");

const { globalLimiter } = require("./middlewares/Ratelimit.middleware");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const teacherRoutes = require("./routes/teacher.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const noticeRoutes = require("./routes/notice.routes");
const classRoutes = require("./routes/class.routes");
const homeworkRoutes = require("./routes/homework.routes");
const homeworkSubmissionRoutes = require("./routes/homeworkSubmission.routes");
const timetableRoutes = require("./routes/timetable.routes");
const examRoutes = require("./routes/exam.routes");
const examScheduleRoutes = require("./routes/examSchedule.routes");
const resultRoutes = require("./routes/result.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const subjectRoutes = require("./routes/subject.routes");
const uploadRoutes = require("./routes/upload.routes");
const promotionRoutes = require("./routes/promotion.routes");
const leaveRoutes = require("./routes/leave.routes");
const notificationRoutes = require("./routes/notification.routes");
const academicYearRoutes = require("./routes/academicYear.routes");
const homeRoutes = require("./routes/home.routes");
const libraryRoutes = require("./routes/library.routes");
const quizRoutes = require("./routes/quiz.routes");
const videoLibraryRoutes = require("./routes/videoLibrary.routes");

const app = express();

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// ======================================================
// Security headers (Helmet)
// ======================================================

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://res.cloudinary.com",
                    "https://*.cloudinary.com"
                ],
                connectSrc: ["'self'", clientUrl, "https://api.cloudinary.com"],
                frameSrc: ["'self'", "https://*.cloudinary.com"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);

// ======================================================
// CORS
// ======================================================

app.use(
    cors({
        origin: clientUrl,
        credentials: true
    })
);

// ======================================================
// Global rate limiting
// ======================================================

app.use(globalLimiter);

// ======================================================
// Body parsing
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================================================
// Static files
// ======================================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================================================
// Routes
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/homework-submission", homeworkSubmissionRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exam-schedule", examScheduleRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/promotion", promotionRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/video-library", videoLibraryRoutes);

// ======================================================
// Health check
// ======================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "School Management API is running."
    });
});

// ======================================================
// 404 handler
// ======================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// ======================================================
// Error handler
// ======================================================

app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error."
    });
});

module.exports = app;
