jest.mock("../../models/Class");

const Class = require("../../models/Class");
const {
    isClassTeacherOf,
    isClassTeacherOfAnyClass
} = require("../../services/classTeacher.service");

describe("classTeacher.service", () => {

    describe("isClassTeacherOf", () => {

        it("returns true when the teacher is assigned to that exact standard+division", async () => {
            Class.findOne.mockResolvedValue({
                standard: 5,
                division: "A",
                classTeacher: "teacher-1"
            });

            const result = await isClassTeacherOf("teacher-1", 5, "A");

            expect(result).toBe(true);
            expect(Class.findOne).toHaveBeenCalledWith({
                standard: 5,
                division: "A",
                classTeacher: "teacher-1"
            });
        });

        it("returns false when no matching class is found", async () => {
            Class.findOne.mockResolvedValue(null);

            const result = await isClassTeacherOf("teacher-2", 6, "B");

            expect(result).toBe(false);
        });

    });

    describe("isClassTeacherOfAnyClass", () => {

        it("returns true when the teacher owns at least one class", async () => {
            Class.findOne.mockResolvedValue({
                standard: 5,
                division: "A",
                classTeacher: "teacher-1"
            });

            expect(await isClassTeacherOfAnyClass("teacher-1")).toBe(true);
        });

        it("returns false for a teacher who isn't assigned to any class", async () => {
            Class.findOne.mockResolvedValue(null);

            expect(await isClassTeacherOfAnyClass("teacher-3")).toBe(false);
        });

    });

});