import api from "../config/axios";

// ======================================================
// Mark / Update Class Attendance
// ======================================================

export const markClassAttendance = async (payload) => {

    const response = await api.post(

        "/attendance/class",

        payload

    );

    return response.data;

};

// ======================================================
// Get Class Attendance (for a specific class/division/date)
// ======================================================

export const getClassAttendance = async (

    standard,

    division,

    date

) => {

    const response = await api.get(

        `/attendance/class?standard=${standard}&division=${division}&date=${date}`

    );

    return response.data;

};

// ======================================================
// Dashboard Stats
// ======================================================

export const getDashboardStats = async (date) => {

    const query = date ? `?date=${date}` : "";

    const response = await api.get(

        `/attendance/dashboard${query}`

    );

    return response.data;

};

// ======================================================
// Today's Attendance
// ======================================================

export const getTodayAttendance = async (date) => {

    const query = date ? `?date=${date}` : "";

    const response = await api.get(

        `/attendance/today${query}`

    );

    return response.data;

};

// ======================================================
// Attendance History (filterable)
// ======================================================

export const getAttendanceHistory = async (filters = {}) => {

    const params = new URLSearchParams(

        Object.entries(filters).filter(

            ([, value]) => value !== "" && value !== undefined

        )

    );

    const response = await api.get(

        `/attendance/history?${params.toString()}`

    );

    return response.data;

};

// ======================================================
// Student Attendance Report
// ======================================================

export const getStudentAttendanceReport = async (

    studentId,

    month,

    year

) => {

    const params = new URLSearchParams();

    if (month) params.append("month", month);

    if (year) params.append("year", year);

    const response = await api.get(

        `/attendance/student/${studentId}?${params.toString()}`

    );

    return response.data;

};

// ======================================================
// Class Attendance Report
// ======================================================

export const getClassAttendanceReport = async (

    standard,

    division,

    month,

    year

) => {

    const params = new URLSearchParams({

        standard,

        division

    });

    if (month) params.append("month", month);

    if (year) params.append("year", year);

    const response = await api.get(

        `/attendance/class-report?${params.toString()}`

    );

    return response.data;

};

// ======================================================
// Calendar View
// ======================================================

export const getCalendarAttendance = async (

    studentId,

    month,

    year

) => {

    const response = await api.get(

        `/attendance/calendar?studentId=${studentId}&month=${month}&year=${year}`

    );

    return response.data;

};

// ======================================================
// Analytics
// ======================================================

export const getAttendanceAnalytics = async (month, year) => {

    const params = new URLSearchParams();

    if (month) params.append("month", month);

    if (year) params.append("year", year);

    const response = await api.get(

        `/attendance/analytics?${params.toString()}`

    );

    return response.data;

};