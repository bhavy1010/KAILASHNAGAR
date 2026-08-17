const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const teacherSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        default: ""
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    qualification: {
        type: String,
        required: true,
        trim: true
    },

    subject: {
        type: String,
        required: true,
        trim: true
    },

    subjectsHandled: {
        type: [String],
        default: []
    },

    experience: {
        type: Number,
        default: 0
    },

    salary: {
        type: Number,
        default: 0
    },

    classesHandled: {
        type: [String],
        default: []
    },

    joiningDate: {
        type: Date,
        default: Date.now
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },

    photo: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

// ======================================================
// Hash Password
// ======================================================

teacherSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);

});

// ======================================================
// Compare Password
// ======================================================

teacherSchema.methods.comparePassword = async function (password) {

    return await bcrypt.compare(
        password,
        this.password
    );

};

// ======================================================
// Generate JWT
// ======================================================

teacherSchema.methods.generateAuthToken = function () {

    return jwt.sign(

        {
            id: this._id,
            role: "teacher"
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

};

module.exports = mongoose.model("Teacher", teacherSchema);