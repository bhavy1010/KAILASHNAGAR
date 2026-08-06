const { createLeaveSchema } = require("../../validators/leave.validator");

describe("createLeaveSchema", () => {

    const valid = {
        leaveType: "Sick Leave",
        fromDate: "2026-08-01",
        toDate: "2026-08-03",
        reason: "Fever and cold"
    };

    it("accepts a valid leave application", () => {
        expect(createLeaveSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects a leave type outside the allowed list", () => {
        expect(
            createLeaveSchema.safeParse({ ...valid, leaveType: "Vacation" })
                .success
        ).toBe(false);
    });

    it("rejects when toDate is before fromDate", () => {
        const result = createLeaveSchema.safeParse({
            ...valid,
            fromDate: "2026-08-05",
            toDate: "2026-08-01"
        });

        expect(result.success).toBe(false);
    });

    it("rejects a reason shorter than 5 characters", () => {
        expect(
            createLeaveSchema.safeParse({ ...valid, reason: "ill" }).success
        ).toBe(false);
    });

    it("rejects a missing reason", () => {
        const { reason, ...rest } = valid;
        expect(createLeaveSchema.safeParse(rest).success).toBe(false);
    });

    it("accepts fromDate === toDate (a single-day leave)", () => {
        expect(
            createLeaveSchema.safeParse({
                ...valid,
                fromDate: "2026-08-01",
                toDate: "2026-08-01"
            }).success
        ).toBe(true);
    });

});