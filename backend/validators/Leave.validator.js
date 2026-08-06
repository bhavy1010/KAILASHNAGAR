const { z } = require("zod");
const { dateString } = require("./common.validator");

const leaveTypeEnum = z.enum(
    ["Sick Leave", "Casual Leave", "Emergency Leave", "Other"],
    { error: "Please choose a valid leave type" }
);

// ======================================================
// POST /api/leave/add
// Runs through multer (uploadLeave.single) before this, so
// req.body only has the text fields — the attachment file
// itself is handled separately via req.file in the controller.
// ======================================================

const createLeaveSchema = z
    .object({

        leaveType: leaveTypeEnum,

        fromDate: dateString("From date"),

        toDate: dateString("To date"),

        reason: z
            .string({ error: "Reason is required" })
            .trim()
            .min(5, "Reason must be at least 5 characters")

    })
    .refine(
        (data) => new Date(data.toDate) >= new Date(data.fromDate),
        {
            message: "From date cannot be after to date",
            path: ["toDate"]
        }
    );

module.exports = {
    createLeaveSchema
};