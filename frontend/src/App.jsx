import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/layout/Layout";

import Dashboard from "./pages/dashboard/Dashboard";
import Students from "./pages/students/Students";
import AddStudent from "./pages/students/AddStudent";
import Teachers from "./pages/teachers/Teachers";
import Attendance from "./pages/attendance/Attendance";
import Homework from "./pages/homework/Homework";
import Exams from "./pages/exams/Exams";
import Notices from "./pages/notices/Notices";
import Settings from "./pages/settings/Settings";
import EditStudent from "./pages/students/EditStudent";
import StudentProfile from "./pages/students/StudentProfile";
import AddTeacher from "./pages/teachers/AddTeacher";
import EditTeacher from "./pages/teachers/EditTeacher";
import TeacherProfile from "./pages/teachers/TeacherProfile";

const App = () => {

    return (

        <Routes>

            {/* Public Routes */}

            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            {/* Protected Layout */}

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
                        <RoleRoute roles={["admin","teacher","student"]}>
                            <Dashboard />
                        </RoleRoute>
                    }
                />

                {/* Students */}

                <Route
                    path="/students"
                    element={
                        <RoleRoute roles={["admin","teacher"]}>
                            <Students />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/students/add"
                    element={
                        <RoleRoute roles={["admin","teacher"]}>
                            <AddStudent />
                        </RoleRoute>
                    }
                />

                {/* Teachers */}

                <Route
                    path="/teachers"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <Teachers />
                        </RoleRoute>
                    }
                />

                {/* Attendance */}

                <Route
                    path="/attendance"
                    element={
                        <RoleRoute roles={["admin","teacher","student"]}>
                            <Attendance />
                        </RoleRoute>
                    }
                />

                {/* Homework */}

                <Route
                    path="/homework"
                    element={
                        <RoleRoute roles={["admin","teacher","student"]}>
                            <Homework />
                        </RoleRoute>
                    }
                />

                {/* Exams */}

                <Route
                    path="/exams"
                    element={
                        <RoleRoute roles={["admin","teacher","student"]}>
                            <Exams />
                        </RoleRoute>
                    }
                />

                {/* Notices */}

                <Route
                    path="/notices"
                    element={
                        <RoleRoute roles={["admin","teacher","student"]}>
                            <Notices />
                        </RoleRoute>
                    }
                />

                {/* Settings */}

                <Route
                    path="/settings"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <Settings />
                        </RoleRoute>
                    }
                />

            </Route>

            <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
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

        </Routes>

    );

};

export default App;