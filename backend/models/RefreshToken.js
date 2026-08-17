const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({

    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "userModel"
    },

    userModel: {
        type: String,
        required: true,
        enum: ["User", "Teacher", "Student"]
    },

    role: {
        type: String,
        required: true,
        enum: ["admin", "teacher", "student"]
    },

    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }

}, {
    timestamps: true
});

refreshTokenSchema.index({ userId: 1, userModel: 1 });

module.exports = mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshTokenSchema);
