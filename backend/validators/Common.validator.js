const { z } = require("zod");

// A MongoDB ObjectId as a 24-character hex string — used for any
// field that references another document (teacherId, classId, etc.)

const objectId = (label = "ID") =>
    z
        .string({ error: `${label} is required` })
        .regex(/^[0-9a-fA-F]{24}$/, `${label} is not a valid ID`);

// Accepts any string a JS Date can parse ("YYYY-MM-DD" from an
// HTML date input, or a full ISO string) and rejects garbage.

const dateString = (label) =>
    z
        .string({ error: `${label} is required` })
        .refine(
            (value) => !Number.isNaN(new Date(value).getTime()),
            `Please enter a valid ${label.toLowerCase()}`
        );

module.exports = {
    objectId,
    dateString
};