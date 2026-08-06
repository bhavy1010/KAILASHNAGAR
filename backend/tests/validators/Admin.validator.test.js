const {
    createNoticeSchema
} = require("../../validators/notice.validator");

const {
    createSubjectSchema
} = require("../../validators/subject.validator");

const { createClassSchema } = require("../../validators/class.validator");

const {
    createAcademicYearSchema
} = require("../../validators/academicYear.validator");

const {
    promoteStudentsSchema
} = require("../../validators/promotion.validator");

const VALID_ID = "507f1f77bcf86cd799439011";
const VALID_ID_2 = "507f1f77bcf86cd799439022";

describe("createNoticeSchema", () => {

    it("accepts a minimal valid notice", () => {
        expect(
            createNoticeSchema.safeParse({
                title: "Holiday Notice",
                description: "School closed for Diwali"
            }).success
        ).toBe(true);
    });

    it("rejects a missing title", () => {
        expect(
            createNoticeSchema.safeParse({
                description: "x".repeat(10)
            }).success
        ).toBe(false);
    });

    it("rejects an invalid category", () => {
        expect(
            createNoticeSchema.safeParse({
                title: "T",
                description: "Description here",
                category: "Nonsense"
            }).success
        ).toBe(false);
    });

});

describe("createSubjectSchema", () => {

    it("accepts a valid subject", () => {
        expect(
            createSubjectSchema.safeParse({
                subjectName: "Science",
                subjectCode: "SCI-8"
            }).success
        ).toBe(true);
    });

    it("rejects a missing subject code", () => {
        expect(
            createSubjectSchema.safeParse({ subjectName: "Science" }).success
        ).toBe(false);
    });

    it("rejects a malformed teacherId", () => {
        expect(
            createSubjectSchema.safeParse({
                subjectName: "Science",
                subjectCode: "SCI",
                teacherId: "xyz"
            }).success
        ).toBe(false);
    });

});

describe("createClassSchema", () => {

    it("accepts a valid class", () => {
        expect(
            createClassSchema.safeParse({
                standard: "3",
                division: "C",
                className: "3C"
            }).success
        ).toBe(true);
    });

    it("rejects a missing className", () => {
        expect(
            createClassSchema.safeParse({ standard: "3", division: "C" }).success
        ).toBe(false);
    });

});

describe("createAcademicYearSchema", () => {

    it("accepts a valid academic year", () => {
        expect(
            createAcademicYearSchema.safeParse({
                yearName: "2025-2026",
                startDate: "2025-06-01",
                endDate: "2026-04-30"
            }).success
        ).toBe(true);
    });

    it("rejects endDate before startDate", () => {
        expect(
            createAcademicYearSchema.safeParse({
                yearName: "2025-2026",
                startDate: "2026-04-30",
                endDate: "2025-06-01"
            }).success
        ).toBe(false);
    });

});

describe("promoteStudentsSchema", () => {

    it("accepts distinct source/target classes", () => {
        expect(
            promoteStudentsSchema.safeParse({
                fromClassId: VALID_ID,
                toClassId: VALID_ID_2
            }).success
        ).toBe(true);
    });

    it("rejects when source and target are the same class", () => {
        expect(
            promoteStudentsSchema.safeParse({
                fromClassId: VALID_ID,
                toClassId: VALID_ID
            }).success
        ).toBe(false);
    });

});