// ======================================================
// Photo URL Utility
// Converts a stored filename or partial path into a full URL
// pointing to the backend uploads directory.
// ======================================================

const SERVER_URL =
    (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
        /\/api\/?$/,
        ""
    );

/**
 * Build a full URL for a student photo.
 * @param {string} photo  - raw filename or full URL stored in DB
 */
export const getStudentPhotoUrl = (photo) => {
    if (!photo) return "";
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
    if (photo.startsWith("/")) return `${SERVER_URL}${photo}`;
    return `${SERVER_URL}/uploads/students/${photo}`;
};

/**
 * Build a full URL for a teacher photo.
 * @param {string} photo  - raw filename or full URL stored in DB
 */
export const getTeacherPhotoUrl = (photo) => {
    if (!photo) return "";
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
    if (photo.startsWith("/")) return `${SERVER_URL}${photo}`;
    return `${SERVER_URL}/uploads/teachers/${photo}`;
};

/**
 * Build a full URL for an admin photo.
 * @param {string} photo  - raw filename or full URL stored in DB
 */
export const getAdminPhotoUrl = (photo) => {
    if (!photo) return "";
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
    if (photo.startsWith("/")) return `${SERVER_URL}${photo}`;
    return `${SERVER_URL}/uploads/admins/${photo}`;
};

/**
 * Auto-detect role and return the correct photo URL.
 * @param {string} photo - raw filename or full URL
 * @param {string} role  - "student" | "teacher" | "admin"
 */
export const getPhotoUrl = (photo, role = "student") => {
    const r = (role || "").toLowerCase();
    if (r === "teacher") return getTeacherPhotoUrl(photo);
    if (r === "admin") return getAdminPhotoUrl(photo);
    return getStudentPhotoUrl(photo);
};
