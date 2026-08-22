jest.mock("../../models/Student");
jest.mock("../../models/Teacher");
jest.mock("../../models/User");
jest.mock("../../services/refreshToken.service");

const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");
const User = require("../../models/User");
const { generateRefreshToken } = require("../../services/refreshToken.service");

const { loginUser } = require("../../controllers/auth.controller");

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.post("/login", loginUser);
    return app;
};

generateRefreshToken.mockResolvedValue("fake-refresh-token");

const fakeAccount = (overrides = {}) => ({
    _id: "account-id",
    comparePassword: jest.fn().mockResolvedValue(true),
    generateAuthToken: jest.fn().mockReturnValue("fake-jwt-token"),
    ...overrides
});

describe("loginUser", () => {

    it("logs in a student with a valid GR number + password", async () => {
        const account = fakeAccount({
            fullName: "Aarav Patel",
            grNumber: "2024001",
            photo: ""
        });
        Student.findOne.mockResolvedValue(account);

        const app = buildApp();
        const response = await request(app).post("/login").send({
            identifier: "2024001",
            password: "010512",
            role: "student"
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user.role).toBe("student");
        expect(Student.findOne).toHaveBeenCalledWith({
            grNumber: "2024001",
            status: { $ne: "Inactive" }
        });
    });

    it("rejects a student login with the wrong password", async () => {
        const account = fakeAccount({
            comparePassword: jest.fn().mockResolvedValue(false)
        });
        Student.findOne.mockResolvedValue(account);

        const app = buildApp();
        const response = await request(app).post("/login").send({
            identifier: "2024001",
            password: "wrongpass",
            role: "student"
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid password/i);
    });

    it("rejects a student login for a GR number that doesn't exist", async () => {
        Student.findOne.mockResolvedValue(null);

        const app = buildApp();
        const response = await request(app).post("/login").send({
            identifier: "9999999",
            password: "x",
            role: "student"
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid gr number/i);
    });

    it("logs in a teacher with a valid mobile + password", async () => {
        const account = fakeAccount({
            fullName: "Meera Shah",
            mobile: "9998887777",
            photo: ""
        });
        Teacher.findOne.mockResolvedValue(account);

        const app = buildApp();
        const response = await request(app).post("/login").send({
            identifier: "9998887777",
            password: "secret1",
            role: "teacher"
        });

        expect(response.status).toBe(200);
        expect(response.body.user.role).toBe("teacher");
    });

    it("logs in an admin with a valid mobile + password", async () => {
        const account = fakeAccount({
            name: "Admin User",
            mobile: "9876543210"
        });
        User.findOne.mockResolvedValue(account);

        const app = buildApp();
        const response = await request(app).post("/login").send({
            identifier: "9876543210",
            password: "adminpass",
            role: "admin"
        });

        expect(response.status).toBe(200);
        expect(response.body.user.role).toBe("admin");
        expect(User.findOne).toHaveBeenCalledWith({
            mobile: "9876543210",
            role: "admin"
        });
    });

    it("sets an httpOnly auth cookie on successful login", async () => {
        Student.findOne.mockResolvedValue(fakeAccount({ fullName: "X", grNumber: "1" }));

        const app = buildApp();
        const response = await request(app).post("/login").send({
            identifier: "1",
            password: "x",
            role: "student"
        });

        const cookies = response.headers["set-cookie"] || [];
        expect(cookies.some((c) => c.startsWith("token="))).toBe(true);
        expect(cookies.some((c) => /HttpOnly/i.test(c))).toBe(true);
    });

    it("rejects a request missing required fields", async () => {
        const app = buildApp();
        const response = await request(app).post("/login").send({
            identifier: "1"
        });

        expect(response.status).toBe(400);
    });

});