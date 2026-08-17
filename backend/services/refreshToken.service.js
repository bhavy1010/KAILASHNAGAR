const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const REFRESH_TOKEN_EXPIRY = "30d";

// ======================================================
// Generate a refresh token for a user
// ======================================================

const generateRefreshToken = async (userId, userModel, role) => {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await RefreshToken.create({
        token,
        userId,
        userModel,
        role,
        expiresAt
    });

    return token;
};

// ======================================================
// Validate a refresh token and return the associated user
// ======================================================

const validateRefreshToken = async (token) => {
    const record = await RefreshToken.findOne({ token });

    if (!record) {
        throw new Error("Invalid refresh token");
    }

    if (record.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ _id: record._id });
        throw new Error("Refresh token expired");
    }

    let UserModel;
    switch (record.userModel) {
        case "User":
            UserModel = require("../models/User");
            break;
        case "Teacher":
            UserModel = require("../models/Teacher");
            break;
        case "Student":
            UserModel = require("../models/Student");
            break;
        default:
            throw new Error("Invalid user model");
    }

    const user = await UserModel.findById(record.userId);

    if (!user) {
        await RefreshToken.deleteMany({ userId: record.userId });
        throw new Error("User not found");
    }

    return { user, userModel: record.userModel };
};

// ======================================================
// Revoke a refresh token (logout)
// ======================================================

const revokeRefreshToken = async (token) => {
    await RefreshToken.deleteOne({ token });
};

// ======================================================
// Revoke all refresh tokens for a user (force logout)
// ======================================================

const revokeAllUserTokens = async (userId, userModel) => {
    await RefreshToken.deleteMany({ userId, userModel });
};

module.exports = {
    generateRefreshToken,
    validateRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens
};
