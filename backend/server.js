require("dotenv").config()

const app = require("./app")
const connectDB = require("./db/db")

const PORT = process.env.PORT || 5000

// ======================================================
// Config safety check
// The admin and teacher password-reset codes must never be
// the same value — if they are, whoever knows the teacher
// code could also reset the admin account. Warn loudly at
// boot rather than letting this go unnoticed.
// ======================================================

if (
    process.env.ADMIN_SIGNUP_CODE &&
    process.env.TEACHER_RESET_CODE &&
    process.env.ADMIN_SIGNUP_CODE === process.env.TEACHER_RESET_CODE
) {
    console.warn(
        "WARNING: ADMIN_SIGNUP_CODE and TEACHER_RESET_CODE are set to the " +
        "same value in .env. They must be different — please change one " +
        "of them before this goes to real users."
    )
}

const start = async () => {
    // Wait for the DB connection to succeed (or exit the process, see
    // db/db.js) before accepting any HTTP traffic.
    await connectDB()

    app.listen(PORT, () => {
        console.log(`Server Running On ${PORT}`)
    })
}

start()