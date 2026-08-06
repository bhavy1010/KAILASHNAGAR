const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

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

const app = express();

// ======================================================
// Security headers (Helmet)
//
// This app is a pure JSON API + a static file server for
// uploaded photos/documents — it never serves rendered HTML
// pages itself (the React frontend is a separate origin).
// Two of Helmet's defaults are tuned accordingly:
//
// - contentSecurityPolicy: off. CSP is designed to restrict
//   what a *served HTML page* can load/execute. We don't
//   serve HTML, so it adds no protection here and can only
//   cause confusing header side effects on the static/API
//   responses we do send.
//
// - crossOriginResourcePolicy: "cross-origin". The frontend
//   (a different origin/port) loads uploaded images directly,
//   e.g. <img src="http://api-host/uploads/students/xyz.jpg">.
//   Helmet's default ("same-origin") would silently block the
//   browser from rendering those images.
// ======================================================

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "School Management API is running."
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error."
    });
});

module.exports = app;
