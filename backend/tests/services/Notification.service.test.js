jest.mock("../../models/Notification");
jest.mock("../../models/Student");
jest.mock("../../models/Teacher");

const Notification = require("../../models/Notification");
const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");

const {
    notifyUser,
    notifyStudentsByClass,
    notifyAudience
} = require("../../services/notification.service");

describe("notification.service", () => {

    describe("notifyUser", () => {

        it("creates a notification with the given fields", async () => {
            Notification.create.mockResolvedValue({});

            await notifyUser({
                userId: "student-1",
                userRole: "student",
                title: "Leave Approved",
                message: "Your leave was approved",
                type: "leave",
                link: "/attendance/leaves"
            });

            expect(Notification.create).toHaveBeenCalledWith({
                userId: "student-1",
                userRole: "student",
                title: "Leave Approved",
                message: "Your leave was approved",
                type: "leave",
                link: "/attendance/leaves"
            });
        });

        // The core promise of this service: a DB failure while sending
        // a notification must never bubble up and break the caller's
        // actual action (e.g. approving a leave).
        it("never throws, even if the DB insert fails", async () => {
            Notification.create.mockRejectedValue(new Error("DB is down"));

            await expect(
                notifyUser({
                    userId: "student-1",
                    userRole: "student",
                    title: "x",
                    message: "y"
                })
            ).resolves.not.toThrow();
        });

    });

    describe("notifyStudentsByClass", () => {

        it("inserts one notification per active student in that class", async () => {
            Student.find.mockResolvedValue([
                { _id: "s1" },
                { _id: "s2" },
                { _id: "s3" }
            ]);
            Notification.insertMany.mockResolvedValue([]);

            await notifyStudentsByClass({
                standard: 5,
                division: "A",
                title: "New Homework",
                message: "Math homework assigned"
            });

            expect(Student.find).toHaveBeenCalledWith(
                { standard: 5, division: "A", status: "Active" },
                "_id"
            );

            const insertedDocs = Notification.insertMany.mock.calls[0][0];
            expect(insertedDocs).toHaveLength(3);
            expect(insertedDocs[0]).toMatchObject({
                userId: "s1",
                userRole: "student",
                title: "New Homework"
            });
        });

        it("does nothing when the class has no students", async () => {
            Student.find.mockResolvedValue([]);

            await notifyStudentsByClass({
                standard: 9,
                division: "Z",
                title: "x",
                message: "y"
            });

            expect(Notification.insertMany).not.toHaveBeenCalled();
        });

    });

    describe("notifyAudience", () => {

        it("notifies only students when audience is 'Students'", async () => {
            Student.find.mockResolvedValue([{ _id: "s1" }]);
            Notification.insertMany.mockResolvedValue([]);

            await notifyAudience({
                audience: "Students",
                title: "Notice",
                message: "hello"
            });

            expect(Student.find).toHaveBeenCalled();
            expect(Teacher.find).not.toHaveBeenCalled();
        });

        it("notifies only teachers when audience is 'Teachers'", async () => {
            Teacher.find.mockResolvedValue([{ _id: "t1" }]);
            Notification.insertMany.mockResolvedValue([]);

            await notifyAudience({
                audience: "Teachers",
                title: "Notice",
                message: "hello"
            });

            expect(Teacher.find).toHaveBeenCalled();
            expect(Student.find).not.toHaveBeenCalled();
        });

        it("notifies both students and teachers when audience is 'All'", async () => {
            Student.find.mockResolvedValue([{ _id: "s1" }]);
            Teacher.find.mockResolvedValue([{ _id: "t1" }]);
            Notification.insertMany.mockResolvedValue([]);

            await notifyAudience({
                audience: "All",
                title: "Notice",
                message: "hello"
            });

            const insertedDocs = Notification.insertMany.mock.calls[0][0];
            expect(insertedDocs).toHaveLength(2);
        });

        it("does nothing for 'Parents' (no separate parent login exists)", async () => {
            await notifyAudience({
                audience: "Parents",
                title: "Notice",
                message: "hello"
            });

            expect(Student.find).not.toHaveBeenCalled();
            expect(Teacher.find).not.toHaveBeenCalled();
            expect(Notification.insertMany).not.toHaveBeenCalled();
        });

    });

});