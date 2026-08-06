const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

process.env.JWT_SECRET = "test-secret-for-jest-only";

const authMiddleware = require("../../middlewares/auth.middleware");

const buildApp = () => {
    const app = express();
    app.use(cookieParser());

    app.get("/protected", authMiddleware, (req, res) => {
        res.status(200).json({ success: true, user: req.user });
    });

    return app;
};

const signToken = (payload, options = {}) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h", ...options });

describe("authMiddleware", () => {

    it("rejects a request with no token at all", async () => {
        const app = buildApp();

        const response = await request(app).get("/protected");

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/token missing/i);
    });

    it("rejects a malformed/invalid token", async () => {
        const app = buildApp();

        const response = await request(app)
            .get("/protected")
            .set("Authorization", "Bearer not-a-real-token");

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid or expired/i);
    });

    it("rejects an expired token", async () => {
        const app = buildApp();

        const expiredToken = signToken(
            { id: "user-1", role: "student" },
            { expiresIn: "-1s" }
        );

        const response = await request(app)
            .get("/protected")
            .set("Authorization", `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
    });

    it("accepts a valid token via the Authorization header and populates req.user", async () => {
        const app = buildApp();

        const token = signToken({ id: "teacher-42", role: "teacher" });

        const response = await request(app)
            .get("/protected")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toEqual({
            id: "teacher-42",
            role: "teacher"
        });
    });

    it("accepts a valid token via the httpOnly cookie", async () => {
        const app = buildApp();

        const token = signToken({ id: "student-7", role: "student" });

        const response = await request(app)
            .get("/protected")
            .set("Cookie", [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.user.id).toBe("student-7");
    });

    it("prefers the cookie token over the Authorization header when both are present", async () => {
        const app = buildApp();

        const cookieToken = signToken({ id: "from-cookie", role: "admin" });
        const headerToken = signToken({ id: "from-header", role: "admin" });

        const response = await request(app)
            .get("/protected")
            .set("Cookie", [`token=${cookieToken}`])
            .set("Authorization", `Bearer ${headerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.user.id).toBe("from-cookie");
    });

});