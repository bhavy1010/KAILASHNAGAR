import { Navigate, Route, Routes } from "react-router-dom";


import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/layout/Layout";

import Home from "./pages/home/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotAdminPassword from "./pages/auth/ForgotAdminPassword";
import ForgotTeacherPassword from "./pages/auth/ForgotTeacherpassword";

import Dashboard from "./pages/dashboard/Dashboard";

import Settings from "./pages/settings/Settings";
import Students from "./pages/students/Students";
import AddStudent from "./pages/students/AddStudent";
import EditStudent from "./pages/students/EditStudent";
import StudentProfile from "./pages/students/StudentProfile";
import StudentRiskDashboard from "./pages/studentRisk/StudentRiskDashboard";
import StudentRiskDetails from "./pages/studentRisk/StudentRiskDetails";

import Teachers from "./pages/teachers/Teachers";
import AddTeacher from "./pages/teachers/AddTeacher";
import EditTeacher from "./pages/teachers/EditTeacher";
import TeacherProfile from "./pages/teachers/TeacherProfile";

import Attendance from "./pages/attendance/Attendance";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import MarkAttendance from "./pages/attendance/MarkAttendance";
import TodayAttendance from "./pages/attendance/TodayAttendance";
import AttendanceHistory from "./pages/attendance/AttendanceHistory";
import StudentAttendanceReport from "./pages/attendance/StudentAttendanceReport";
import ClassAttendanceReport from "./pages/attendance/ClassAttendanceReport";
import LeaveManagement from "./pages/attendance/LeaveManagement";
import AttendanceAnalytics from "./pages/attendance/AttendanceAnalytics";

import Homework from "./pages/homework/Homework";
import HomeworkDashboard from "./pages/homework/HomeworkDashboard";
import HomeworkList from "./pages/homework/HomeworkList";
import CreateHomework from "./pages/homework/CreateHomework";
import EditHomework from "./pages/homework/EditHomework";
import HomeworkDetails from "./pages/homework/HomeworkDetails";
import StudentHomework from "./pages/homework/StudentHomework";
import SubmitHomework from "./pages/homework/SubmitHomework";

import Exams from "./pages/exams/Exams";
import ExamDashboard from "./pages/exams/ExamDashboard";
import ExamList from "./pages/exams/ExamList";
import CreateExam from "./pages/exams/CreateExam";
import MyResults from "./pages/exams/MyResults";
import ExamDetails from "./pages/exams/ExamDetails";
import EditExam from "./pages/exams/EditExam";
import ExamSchedule from "./pages/exams/ExamSchedule";
import MarksEntry from "./pages/exams/MarksEntry";
import ResultList from "./pages/exams/ResultList";
import StudentResult from "./pages/exams/StudentResult";

import Notices from "./pages/notices/Notices";
import NoticeDashboard from "./pages/notices/NoticeDashboard";
import NoticeList from "./pages/notices/NoticeList";
import CreateNotice from "./pages/notices/CreateNotice";
import EditNotice from "./pages/notices/EditNotice";
import NoticeDetails from "./pages/notices/NoticeDetails";
import StudentNoticeBoard from "./pages/notices/StudentNoticeBoard";

import HomeManagement from "./pages/home/HomeManagement";

import TimetableDashboard from "./pages/timetable/TimetableDashboard";
import Library from "./pages/library/Library";
import Profile from "./pages/profile/Profile";

import QuizDashboard from "./pages/quiz/QuizDashboard";
import CreateManualQuiz from "./pages/quiz/CreateManualQuiz";
import CreateAutoQuiz from "./pages/quiz/CreateAutoQuiz";
import StudentQuizScreen from "./pages/quiz/StudentQuizScreen";
import QuizResultView from "./pages/quiz/QuizResultView";
import QuizRankBoard from "./pages/quiz/QuizRankBoard";
import QuizPreviewEdit from "./pages/quiz/QuizPreviewEdit";

const App = () => {
    return (
        <Routes>
            {/* Public Pages */}

            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/admin/forgot-password"
                element={<ForgotAdminPassword />}
            />

            <Route
                path="/teacher/forgot-password"
                element={<ForgotTeacherPassword />}
            />

            {/* Protected Pages */}

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/dashboard"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <Dashboard />
                        </RoleRoute>
                    }
                />

                {/* Student Risk & Early Warning */}

                <Route
                    path="/student-risk"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <StudentRiskDashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/student-risk/:studentId"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <StudentRiskDetails />
                        </RoleRoute>
                    }
                />

                {/* Student Management */}

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

                {/* Teacher Management */}

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

                {/* Attendance */}

                <Route
                    path="/attendance"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
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
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
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
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
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
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
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

                {/* Homework */}

                <Route
                    path="/homework"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
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
                    path="/homework/edit/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <EditHomework />
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
                    path="/homework/:id"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <HomeworkDetails />
                        </RoleRoute>
                    }
                />

                {/* Exams */}

                <Route
                    path="/exams"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <Exams />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/dashboard"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <ExamDashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/list"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <ExamList />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/create"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <CreateExam />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/edit/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <EditExam />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/schedule/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <ExamSchedule />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/marks/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <MarksEntry />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/results/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <ResultList />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/report/:studentId/:examId"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <StudentResult />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/my-results"
                    element={
                        <RoleRoute roles={["student"]}>
                            <MyResults />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/analytics"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <ExamDashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/exams/:id"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <ExamDetails />
                        </RoleRoute>
                    }
                />

                {/* Notice Module */}

                <Route
                    path="/notices"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <Notices />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/notices/dashboard"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <NoticeDashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/notices/list"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <NoticeList />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/notices/create"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <CreateNotice />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/notices/edit/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <EditNotice />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/notices/board"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <StudentNoticeBoard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/notices/archived"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <NoticeList />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/notices/:id"
                    element={
                        <RoleRoute
                            roles={["admin", "teacher", "student"]}
                        >
                            <NoticeDetails />
                        </RoleRoute>
                    }
                />

                {/* Settings: will be replaced later by Home Content Management */}

                <Route
                    path="/timetable"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <TimetableDashboard />
                        </RoleRoute>
                    }
                />
                <Route path="/library" element={<RoleRoute roles={["admin", "teacher", "student"]}><Library /></RoleRoute>} />
                <Route path="/profile" element={<RoleRoute roles={["admin", "teacher", "student"]}><Profile /></RoleRoute>} />

                {/* Quiz Module Routes */}
                <Route
                    path="/quiz"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <QuizDashboard />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/quiz/create-manual"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <CreateManualQuiz />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/quiz/create-auto"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <CreateAutoQuiz />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/quiz/attempt-screen/:id"
                    element={
                        <RoleRoute roles={["student"]}>
                            <StudentQuizScreen />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/quiz/result/:attemptId"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <QuizResultView />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/quiz/rank"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <QuizRankBoard />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/quiz/rank/:quizId"
                    element={
                        <RoleRoute roles={["admin", "teacher", "student"]}>
                            <QuizRankBoard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/quiz/preview/:id"
                    element={
                        <RoleRoute roles={["admin", "teacher"]}>
                            <QuizPreviewEdit />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <Settings />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/home-management"
                    element={
                        <RoleRoute roles={["admin"]}>
                            <HomeManagement />
                        </RoleRoute>
                    }
                />
            </Route>

            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
};

export default App;
