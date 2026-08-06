const express = require("express");
const request = require("supertest");

const {
    loginLimiter,
    registerAdminLimiter,
    teacherResetPasswordLimiter
} = require("../../middlewares/rateLimit.middleware");

const buildApp = (limiter) => {
    const app = express();
    app.post("/test", limiter, (req, res) => res.status(200).json({ success: true }));
    return app;
};

describe("rateLimit middleware", () => {

    it("allows requests under the limit through", async () => {
        const app = buildApp(loginLimiter);

        // loginLimiter allows 10 per window — send 5, all should pass
        for (let i = 0; i < 5; i++) {
            const response = await request(app).post("/test");
            expect(response.status).toBe(200);
        }
    });

    it("blocks requests once the limit is exceeded, with a clean 429 shape", async () => {
        const app = buildApp(loginLimiter);

        let lastResponse;
        for (let i = 0; i < 12; i++) {
            lastResponse = await request(app).post("/test");
        }

        expect(lastResponse.status).toBe(429);
        expect(lastResponse.body).toEqual({
            success: false,
            message: expect.stringContaining("Too many login attempts")
        });
    });

    it("keeps registerAdminLimiter and teacherResetPasswordLimiter as independent buckets", async () => {
        // Exhaust registerAdminLimiter (5/hour) on one app instance
        const registerApp = buildApp(registerAdminLimiter);
        for (let i = 0; i < 6; i++) {
            await request(registerApp).post("/test");
        }
        const registerResponse = await request(registerApp).post("/test");
        expect(registerResponse.status).toBe(429);

        // A completely separate limiter instance must not be affected
        const teacherApp = buildApp(teacherResetPasswordLimiter);
        const teacherResponse = await request(teacherApp).post("/test");
        expect(teacherResponse.status).toBe(200);
    });

});