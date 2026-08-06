const {
    loginSchema,
    registerAdminSchema,
    resetAdminPasswordSchema,
    resetTeacherPasswordSchema
} = require("../../validators/auth.validator");

describe("loginSchema", () => {

    it("accepts a valid login payload", () => {
        const result = loginSchema.safeParse({
            identifier: "9876543210",
            password: "abc123",
            role: "student"
        });

        expect(result.success).toBe(true);
    });

    it("trims whitespace from identifier", () => {
        const result = loginSchema.safeParse({
            identifier: "  9876543210  ",
            password: "x",
            role: "admin"
        });

        expect(result.success).toBe(true);
        expect(result.data.identifier).toBe("9876543210");
    });

    it("rejects a missing role", () => {
        const result = loginSchema.safeParse({
            identifier: "9876543210",
            password: "abc123"
        });

        expect(result.success).toBe(false);
    });

    it("rejects a role outside admin/teacher/student", () => {
        const result = loginSchema.safeParse({
            identifier: "9876543210",
            password: "abc123",
            role: "hacker"
        });

        expect(result.success).toBe(false);
    });

    it("rejects an empty password", () => {
        const result = loginSchema.safeParse({
            identifier: "9876543210",
            password: "",
            role: "admin"
        });

        expect(result.success).toBe(false);
    });

});

describe("registerAdminSchema", () => {

    const valid = {
        name: "Jignesh",
        mobile: "9876543210",
        password: "secret1",
        secretCode: "101005"
    };

    it("accepts a valid registration payload", () => {
        expect(registerAdminSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects a mobile number that isn't exactly 10 digits", () => {
        const result = registerAdminSchema.safeParse({
            ...valid,
            mobile: "987654321"
        });

        expect(result.success).toBe(false);
    });

    it("rejects a password under 6 characters", () => {
        const result = registerAdminSchema.safeParse({
            ...valid,
            password: "123"
        });

        expect(result.success).toBe(false);
    });

    it("rejects a missing name", () => {
        const { name, ...rest } = valid;
        const result = registerAdminSchema.safeParse(rest);

        expect(result.success).toBe(false);
    });

});

describe("resetAdminPasswordSchema", () => {

    it("accepts a valid reset payload", () => {
        const result = resetAdminPasswordSchema.safeParse({
            mobile: "9876543210",
            secretCode: "101005",
            newPassword: "newpass1"
        });

        expect(result.success).toBe(true);
    });

    it("rejects a missing secret code", () => {
        const result = resetAdminPasswordSchema.safeParse({
            mobile: "9876543210",
            newPassword: "newpass1"
        });

        expect(result.success).toBe(false);
    });

});

describe("resetTeacherPasswordSchema", () => {

    const originalAdminCode = process.env.ADMIN_SIGNUP_CODE;

    beforeAll(() => {
        process.env.ADMIN_SIGNUP_CODE = "101005";
    });

    afterAll(() => {
        process.env.ADMIN_SIGNUP_CODE = originalAdminCode;
    });

    it("accepts a valid 6-digit teacher code", () => {
        const result = resetTeacherPasswordSchema.safeParse({
            mobile: "9876543210",
            secretCode: "482913",
            newPassword: "newpass1"
        });

        expect(result.success).toBe(true);
    });

    it("rejects a code that isn't exactly 6 digits", () => {
        const result = resetTeacherPasswordSchema.safeParse({
            mobile: "9876543210",
            secretCode: "48291",
            newPassword: "newpass1"
        });

        expect(result.success).toBe(false);
    });

    it("rejects a non-numeric code", () => {
        const result = resetTeacherPasswordSchema.safeParse({
            mobile: "9876543210",
            secretCode: "abc123",
            newPassword: "newpass1"
        });

        expect(result.success).toBe(false);
    });

    // The whole point of this endpoint having a separate code —
    // reusing the admin's own code must never work here.
    it("rejects the code when it matches ADMIN_SIGNUP_CODE", () => {
        const result = resetTeacherPasswordSchema.safeParse({
            mobile: "9876543210",
            secretCode: process.env.ADMIN_SIGNUP_CODE,
            newPassword: "newpass1"
        });

        expect(result.success).toBe(false);
    });

});