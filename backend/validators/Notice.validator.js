const { z } = require("zod");
const { dateString } = require("./common.validator");

const categoryEnum = z.enum(
    ["General", "Academic", "Exam", "Holiday", "Event", "Sports", "Fee", "Urgent", "Other"],
    { error: "Please choose a valid category" }
);

const priorityEnum = z.enum(["Low", "Medium", "High", "Urgent"], {
    error: "Please choose a valid priority"
});

const audienceEnum = z.enum(["All", "Teachers", "Students", "Parents"], {
    error: "Please choose a valid audience"
});

// ======================================================
// POST /api/notices/add
// Note: this route runs through multer (uploadNotice.single)
// before validation, so req.body only ever contains the
// text fields here — the attachment itself is handled
// separately via req.file in the controller.
// ======================================================

const createNoticeSchema = z.object({

    title: z
        .string({ error: "Title is required" })
        .trim()
        .min(3, "Title must be at least 3 characters"),

    description: z
        .string({ error: "Description is required" })
        .trim()
        .min(5, "Description must be at least 5 characters"),

    category: categoryEnum.optional(),

    priority: priorityEnum.optional(),

    audience: audienceEnum.optional(),

    publishDate: dateString("Publish date").optional(),

    expiryDate: dateString("Expiry date").optional()

});

const updateNoticeSchema = createNoticeSchema.partial();

module.exports = {
    createNoticeSchema,
    updateNoticeSchema
};