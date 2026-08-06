const {
    createStudentSchema,
    updateStudentSchema
} = require("../../validators/student.validator");

const {
    createTeacherSchema,
    updateTeacherSchema
} = require("../../validators/teacher.validator");

describe("createStudentSchema", () => {

    const valid = {
        grNumber: "2024001",
        fullName: "Aarav Patel",
        fatherName: "Rakesh Patel",
        motherName: "Sunita Patel",
        gender: "Male",
        dateOfBirth: "2012-05-10",
        parentMobile: "9876543210",
        standard: "5",
        division: "A",
        address: "123 Main Street, Vadnagar"
    };

    it("accepts a valid student payload and coerces standard to a number", () => {
        const result = createStudentSchema.safeParse(valid);

        expect(result.success).toBe(true);
        expect(result.data.standard).toBe(5);
        expect(typeof result.data.standard).toBe("number");
    });

    it("rejects a missing full name", () => {
        const { fullName, ...rest } = valid;
        expect(createStudentSchema.safeParse(rest).success).toBe(false);
    });

    it("rejects standard outside 1-12", () => {
        expect(
            createStudentSchema.safeParse({ ...valid, standard: "13" }).success
        ).toBe(false);
    });

    it("rejects an invalid gender", () => {
        expect(
            createStudentSchema.safeParse({ ...valid, gender: "X" }).success
        ).toBe(false);
    });

    it("rejects a parent mobile number that isn't 10 digits", () => {
        expect(
            createStudentSchema.safeParse({ ...valid, parentMobile: "123" })
                .success
        ).toBe(false);
    });

    it("rejects an unparseable date of birth", () => {
        expect(
            createStudentSchema.safeParse({ ...valid, dateOfBirth: "not-a-date" })
                .success
        ).toBe(false);
    });

    it("does NOT accept a client-supplied password (must be derived server-side)", () => {
        const result = createStudentSchema.safeParse({
            ...valid,
            password: "hacked123"
        });

        // password isn't part of the schema at all, so it's silently
        // dropped from the parsed output rather than causing a failure
        expect(result.success).toBe(true);
        expect(result.data.password).toBeUndefined();
    });

    it("allows a partial update payload", () => {
        expect(updateStudentSchema.safeParse({ status: "Inactive" }).success)
            .toBe(true);
    });

    it("allows an empty update payload", () => {
        expect(updateStudentSchema.safeParse({}).success).toBe(true);
    });

});

describe("createTeacherSchema", () => {

    const valid = {
        fullName: "Meera Shah",
        mobile: "9998887777",
        gender: "Female",
        qualification: "M.Ed",
        subject: "Mathematics",
        address: "45 School Road, Vadnagar"
    };

    it("accepts a minimal valid payload without password/email", () => {
        expect(createTeacherSchema.safeParse(valid).success).toBe(true);
    });

    it("accepts an empty-string email (treated as not provided)", () => {
        expect(
            createTeacherSchema.safeParse({ ...valid, email: "" }).success
        ).toBe(true);
    });

    it("rejects a malformed email", () => {
        expect(
            createTeacherSchema.safeParse({ ...valid, email: "not-an-email" })
                .success
        ).toBe(false);
    });

    it("rejects a password under 6 characters when provided", () => {
        expect(
            createTeacherSchema.safeParse({ ...valid, password: "123" }).success
        ).toBe(false);
    });

    it("rejects a missing mobile number", () => {
        const { mobile, ...rest } = valid;
        expect(createTeacherSchema.safeParse(rest).success).toBe(false);
    });

    it("allows a partial update payload", () => {
        expect(updateTeacherSchema.safeParse({ salary: "30000" }).success)
            .toBe(true);
    });

});