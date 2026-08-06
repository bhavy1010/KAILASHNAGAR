const { z } = require("zod");
const { objectId } = require("./common.validator");

// ======================================================
// POST /api/promotion/promote
// ======================================================

const promoteStudentsSchema = z
    .object({

        fromClassId: objectId("Source class ID"),

        toClassId: objectId("Target class ID")

    })
    .refine(
        (data) => data.fromClassId !== data.toClassId,
        {
            message: "Source and target class cannot be the same",
            path: ["toClassId"]
        }
    );

module.exports = {
    promoteStudentsSchema
};