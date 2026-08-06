const {
    markClassAttendanceSchema
} = require("../../validators/attendance.validator");

const { objectId, dateString } = require("../../validators/common.validator");

const VALID_ID = "507f1f77bcf86cd799439011";
const VALID_ID_2 = "507f1f77bcf86cd799439022";

describe("markClassAttendanceSchema", () => {

    const valid = {
        attendanceDate: "2026-07-30",
        standard: "5",
        division: "A",
        academicYearId: VALID_ID,
        records: [
            {
                studentId: VALID_ID_2,
                grNumber: "2024001",
                fullName: "Test Student",
                status: "Present"
            }
        ]
    };

    it("accepts a valid bulk attendance payload", () => {
        expect(markClassAttendanceSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects an empty records array", () => {
        expect(
            markClassAttendanceSchema.safeParse({ ...valid, records: [] })
                .success
        ).toBe(false);
    });

    it("rejects an invalid status on one record and reports which one", () => {
        const result = markClassAttendanceSchema.safeParse({
            ...valid,
            records: [
                valid.records[0],
                { ...valid.records[0], status: "Maybe" }
            ]
        });

        expect(result.success).toBe(false);

        // Confirm the error points at the exact bad record, not just
        // "something in the array is wrong" — this is what lets the
        // frontend eventually highlight the right row.
        const badField = result.error.issues[0].path.join(".");
        expect(badField).toBe("records.1.status");
    });

    it("rejects a malformed studentId inside a record", () => {
        const result = markClassAttendanceSchema.safeParse({
            ...valid,
            records: [{ ...valid.records[0], studentId: "bad-id" }]
        });

        expect(result.success).toBe(false);
    });

});

describe("common.validator helpers", () => {

    describe("objectId", () => {

        const schema = objectId("Homework ID");

        it("accepts a valid 24-char hex ObjectId", () => {
            expect(schema.safeParse(VALID_ID).success).toBe(true);
        });

        it("rejects a malformed id with a clear message", () => {
            const result = schema.safeParse("not-an-id");

            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toBe(
                "Homework ID is not a valid ID"
            );
        });

        it("rejects a missing id with a clear message (not a generic one)", () => {
            const result = schema.safeParse(undefined);

            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toBe(
                "Homework ID is required"
            );
        });

    });

    describe("dateString", () => {

        const schema = dateString("Due date");

        it("accepts an ISO date string", () => {
            expect(schema.safeParse("2026-08-01").success).toBe(true);
        });

        it("rejects an unparseable string", () => {
            expect(schema.safeParse("not-a-date").success).toBe(false);
        });

    });

});