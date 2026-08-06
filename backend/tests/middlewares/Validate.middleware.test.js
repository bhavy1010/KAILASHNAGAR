const express = require("express");
const request = require("supertest");
const { z } = require("zod");

const validate = require("../../middlewares/validate.middleware");

const buildApp = (schema) => {
    const app = express();
    app.use(express.json());

    app.post("/test", validate(schema), (req, res) => {
        // Echo back req.body so tests can confirm it was sanitized/coerced
        res.status(200).json({ success: true, body: req.body });
    });

    return app;
};

describe("validate middleware", () => {

    const schema = z.object({
        name: z.string({ error: "Name is required" }).trim().min(2),
        age: z.coerce.number().min(0)
    });

    it("calls next() and passes through parsed data on valid input", async () => {
        const app = buildApp(schema);

        const response = await request(app)
            .post("/test")
            .send({ name: "  Aarav  ", age: "10" });

        expect(response.status).toBe(200);
        // trimmed
        expect(response.body.body.name).toBe("Aarav");
        // coerced string -> number
        expect(response.body.body.age).toBe(10);
    });

    it("responds 400 with a field-level error list on invalid input", async () => {
        const app = buildApp(schema);

        const response = await request(app)
            .post("/test")
            .send({ name: "A" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it("never lets invalid input reach the route handler", async () => {
        const app = express();
        app.use(express.json());

        const handler = jest.fn((req, res) => res.status(200).json({}));
        app.post("/test", validate(schema), handler);

        await request(app).post("/test").send({ name: "" });

        expect(handler).not.toHaveBeenCalled();
    });

});