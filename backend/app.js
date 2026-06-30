const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes")
const teacherRoutes = require("./routes/teacher.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const noticeRoutes = require("./routes/notice.routes");
const classRoutes = require("./routes/class.routes");
const homeworkRoutes = require("./routes/homework.routes");
const timetableRoutes = require("./routes/timetable.routes");
const examRoutes = require("./routes/exam.routes");
const resultRoutes = require("./routes/result.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const homeworkSubmissionRoutes = require("./routes/homeworkSubmission.routes");
const subjectRoutes = require("./routes/subject.routes");
const uploadRoutes = require("./routes/upload.routes");
const promotionRoutes = require("./routes/promotion.routes");
const leaveRoutes = require("./routes/leave.routes");
const academicYearRoutes = require("./routes/academicYear.routes");




const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(
    "/api/students",
    studentRoutes
)

app.use(
    "/api/teachers",
    teacherRoutes
);



app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/notices",
    noticeRoutes
);

app.use(
    "/api/classes",
    classRoutes
);

app.use(
    "/api/subjects",
    subjectRoutes
);

app.use(
    "/api/homework",
    homeworkRoutes
);

app.use(
    "/api/timetable",
    timetableRoutes
);

app.use(
    "/api/exams",
    examRoutes
);

app.use(
    "/api/results",
    resultRoutes
);

app.use(
    "/api/analytics",
    analyticsRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/homework-submission",
    homeworkSubmissionRoutes
);

app.use(

    "/uploads",

    express.static(

        path.join(
            __dirname,
            "uploads"
        )

    )

);

app.use(
    "/api/upload",
    uploadRoutes
);

app.use(
    "/api/promotion",
    promotionRoutes
);

app.use(
    "/api/leaves",
    leaveRoutes
);

app.use(
    "/api/academic-years",
    academicYearRoutes
);

app.get("/", (req, res) => {
    res.send("School Management API Running");
});

module.exports = app;