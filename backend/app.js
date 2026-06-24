const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes")
const teacherRoutes = require("./routes/teacher.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const noticeRoutes = require("./routes/notice.routes");
const classRoutes = require("./routes/class.routes");


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
"/api/students",
studentRoutes
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

app.get("/", (req, res) => {
    res.send("School Management API Running");
});

module.exports = app;