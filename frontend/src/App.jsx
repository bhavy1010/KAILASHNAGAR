import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/layout/Layout";

// ======================================================
// Dashboard
// ======================================================

import Dashboard from "./pages/dashboard/Dashboard";

// ======================================================
// Students
// ======================================================

import Students from "./pages/students/Students";
import AddStudent from "./pages/students/AddStudent";
import EditStudent from "./pages/students/EditStudent";
import StudentProfile from "./pages/students/StudentProfile";

// ======================================================
// Teachers
// ======================================================

import Teachers from "./pages/teachers/Teachers";
import AddTeacher from "./pages/teachers/AddTeacher";
import EditTeacher from "./pages/teachers/EditTeacher";
import TeacherProfile from "./pages/teachers/TeacherProfile";

// ======================================================
// Attendance
// ======================================================

import Attendance from "./pages/attendance/Attendance";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import MarkAttendance from "./pages/attendance/MarkAttendance";
import TodayAttendance from "./pages/attendance/TodayAttendance";
import AttendanceHistory from "./pages/attendance/AttendanceHistory";
import StudentAttendanceReport from "./pages/attendance/StudentAttendanceReport";
import ClassAttendanceReport from "./pages/attendance/ClassAttendanceReport";
import LeaveManagement from "./pages/attendance/LeaveManagement";
import AttendanceAnalytics from "./pages/attendance/AttendanceAnalytics";

// ======================================================
// Homework
// ======================================================

import Homework from "./pages/homework/Homework";
import HomeworkDashboard from "./pages/homework/HomeworkDashboard";
import HomeworkList from "./pages/homework/HomeworkList";
import CreateHomework from "./pages/homework/CreateHomework";
import EditHomework from "./pages/homework/EditHomework";
import HomeworkDetails from "./pages/homework/HomeworkDetails";
import StudentHomework from "./pages/homework/StudentHomework";
import SubmitHomework from "./pages/homework/SubmitHomework";

// ======================================================
// Other Modules
// ======================================================

import Exams from "./pages/exams/Exams";
import Notices from "./pages/notices/Notices";
import Settings from "./pages/settings/Settings";

const App = () => {

    return (

        <Routes>

            {/* ============================== Public Routes ============================== */}

            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            {/* ============================== Protected Layout ============================== */}

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >

                {/* Dashboard */}

                <Route
                    path="/dashboard"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <Dashboard />
                        </RoleRoute>
                    }
                />

                {/* ==================== Students ==================== */}

                <Route
                    path="/students"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <Students />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/students/add"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <AddStudent />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/students/edit/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <EditStudent />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/students/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <StudentProfile />
                        </RoleRoute>
                    }
                />

                {/* ==================== Teachers ==================== */}

                <Route
                    path="/teachers"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <Teachers />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teachers/add"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <AddTeacher />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teachers/edit/:id"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <EditTeacher />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teachers/:id"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <TeacherProfile />
                        </RoleRoute>
                    }
                />

                {/* ==================== Attendance ==================== */}

                <Route
                    path="/attendance"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <Attendance />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/dashboard"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <AttendanceDashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/mark"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <MarkAttendance />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/today"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <TodayAttendance />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/history"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <AttendanceHistory />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/student/:studentId"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <StudentAttendanceReport />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/class-report"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <ClassAttendanceReport />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/leaves"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <LeaveManagement />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance/analytics"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <AttendanceAnalytics />
                        </RoleRoute>
                    }
                />

                {/* ==================== Homework ==================== */}

                <Route
                    path="/homework"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <Homework />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/homework/dashboard"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <HomeworkDashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/homework/list"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <HomeworkList />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/homework/create"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <CreateHomework />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/homework/my"
                    element={
                        <RoleRoute roles={["student"]}>
                            <StudentHomework />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/homework/submit/:id"
                    element={
                        <RoleRoute roles={["student"]}>
                            <SubmitHomework />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/homework/edit/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <EditHomework />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/homework/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <HomeworkDetails />
                        </RoleRoute>
                    }
                />

                {/* ==================== Exams ==================== */}

                <Route
                    path="/exams"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <Exams />
                        </RoleRoute>
                    }
                />

                {/* ==================== Notices ==================== */}

                <Route
                    path="/notices"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <Notices />
                        </RoleRoute>
                    }
                />

                {/* ==================== Settings ==================== */}

                <Route
                    path="/settings"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <Settings />
                        </RoleRoute>
                    }
                />

            </Route>

            {/* ============================== Fallback ============================== */}

            <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
            />

        </Routes>

    );

};

export default App;