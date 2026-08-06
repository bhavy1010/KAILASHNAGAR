const {
    createHomeworkSchema
} = require("../../validators/homework.validator");

const {
    submitHomeworkSchema,
    gradeSubmissionSchema
} = require("../../validators/homeworkSubmission.validator");

const {
    createExamSchema,
    updateExamSchema
} = require("../../validators/exam.validator");

const {
    createScheduleSchema
} = require("../../validators/examSchedule.validator");

const { saveResultSchema } = require("../../validators/result.validator");

const VALID_ID = "507f1f77bcf86cd799439011";
const VALID_ID_2 = "507f1f77bcf86cd799439022";

describe("createHomeworkSchema", () => {

    const valid = {
        title: "Math HW",
        description: "Complete exercise 4",
        subject: "Math",
        standard: "5",
        division: "A",
        dueDate: "2026-08-05"
    };

    it("accepts a valid homework payload", () => {
        expect(createHomeworkSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects a malformed classId", () => {
        expect(
            createHomeworkSchema.safeParse({ ...valid, classId: "not-an-id" })
                .success
        ).toBe(false);
    });

    it("accepts an empty-string classId (treated as not provided)", () => {
        expect(
            createHomeworkSchema.safeParse({ ...valid, classId: "" }).success
        ).toBe(true);
    });

    it("rejects a missing due date", () => {
        const { dueDate, ...rest } = valid;
        expect(createHomeworkSchema.safeParse(rest).success).toBe(false);
    });

});

describe("homework submission schemas", () => {

    it("submitHomeworkSchema accepts a valid payload", () => {
        expect(
            submitHomeworkSchema.safeParse({
                homeworkId: VALID_ID,
                studentId: VALID_ID_2,
                answer: "my answer"
            }).success
        ).toBe(true);
    });

    it("submitHomeworkSchema rejects a missing homeworkId", () => {
        expect(
            submitHomeworkSchema.safeParse({ studentId: VALID_ID_2 }).success
        ).toBe(false);
    });

    it("gradeSubmissionSchema accepts a valid grade", () => {
        expect(
            gradeSubmissionSchema.safeParse({ grade: "8", feedback: "Good job" })
                .success
        ).toBe(true);
    });

    it("gradeSubmissionSchema rejects a negative grade", () => {
        expect(
            gradeSubmissionSchema.safeParse({ grade: "-5" }).success
        ).toBe(false);
    });

});

describe("exam schemas", () => {

    const valid = {
        examName: "Unit Test 1",
        examType: "Unit Test",
        standard: "8",
        division: "B",
        startDate: "2026-08-01",
        endDate: "2026-08-05"
    };

    it("createExamSchema accepts a valid payload", () => {
        expect(createExamSchema.safeParse(valid).success).toBe(true);
    });

    it("createExamSchema rejects endDate before startDate", () => {
        expect(
            createExamSchema.safeParse({ ...valid, endDate: "2026-07-01" })
                .success
        ).toBe(false);
    });

    it("createExamSchema rejects an invalid exam type", () => {
        expect(
            createExamSchema.safeParse({ ...valid, examType: "Pop Quiz" })
                .success
        ).toBe(false);
    });

    it("updateExamSchema allows a partial payload", () => {
        expect(
            updateExamSchema.safeParse({ status: "Ongoing" }).success
        ).toBe(true);
    });

});

describe("createScheduleSchema", () => {

    const valid = {
        examId: VALID_ID,
        subject: "Math",
        examDate: "2026-08-01",
        startTime: "09:00",
        endTime: "11:00",
        totalMarks: 100,
        passingMarks: 35
    };

    it("accepts a valid schedule", () => {
        expect(createScheduleSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects endTime before startTime", () => {
        expect(
            createScheduleSchema.safeParse({ ...valid, endTime: "08:00" })
                .success
        ).toBe(false);
    });

    it("rejects a malformed time string", () => {
        expect(
            createScheduleSchema.safeParse({ ...valid, startTime: "9am" })
                .success
        ).toBe(false);
    });

    it("rejects passingMarks greater than totalMarks", () => {
        expect(
            createScheduleSchema.safeParse({ ...valid, passingMarks: 150 })
                .success
        ).toBe(false);
    });

});

describe("saveResultSchema", () => {

    const valid = {
        examId: VALID_ID,
        studentId: VALID_ID_2,
        subjectResults: [
            { subject: "Math", totalMarks: 100, passingMarks: 35, marksObtained: 88 }
        ]
    };

    it("accepts a valid result payload", () => {
        expect(saveResultSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects marksObtained greater than totalMarks", () => {
        const result = saveResultSchema.safeParse({
            ...valid,
            subjectResults: [
                { subject: "Math", totalMarks: 100, passingMarks: 35, marksObtained: 150 }
            ]
        });

        expect(result.success).toBe(false);
    });

    it("rejects passingMarks greater than totalMarks", () => {
        const result = saveResultSchema.safeParse({
            ...valid,
            subjectResults: [
                { subject: "Math", totalMarks: 100, passingMarks: 120, marksObtained: 50 }
            ]
        });

        expect(result.success).toBe(false);
    });

    it("rejects an empty subjectResults array", () => {
        expect(
            saveResultSchema.safeParse({ ...valid, subjectResults: [] }).success
        ).toBe(false);
    });

});