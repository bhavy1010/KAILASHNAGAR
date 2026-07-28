const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const studentSchema = new mongoose.Schema({

    grNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    fatherName: {
        type: String,
        required: true,
        trim: true
    },

    motherName: {
        type: String,
        required: true,
        trim: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    parentMobile: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    standard: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },

    division: {
        type: String,
        required: true,
        trim: true
    },

    // classId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Class",
    //     required: true
    // },

    address: {
        type: String,
        required: true,
        trim: true
    },

    admissionDate: {
        type: Date,
        default: Date.now
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

studentSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);

});

// ======================================================
// Compare Password
// ======================================================

studentSchema.methods.comparePassword = async function (password) {

    return await bcrypt.compare(
        password,
        this.password
    );

};

// ======================================================
// Generate JWT
// ======================================================

studentSchema.methods.generateAuthToken = function () {

    return jwt.sign(

        {
            id: this._id,
            role: "student"
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

};

module.exports = mongoose.model("Student", studentSchema);