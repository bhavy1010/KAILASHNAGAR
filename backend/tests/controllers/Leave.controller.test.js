jest.mock("../../models/Leave");
jest.mock("../../models/Teacher");
jest.mock("../../models/User");
jest.mock("../../models/Student");
jest.mock("../../models/Class");
jest.mock("../../services/notification.service");
jest.mock("../../services/classTeacher.service");
jest.mock("../../services/authorization.service");

const express = require("express");
const request = require("supertest");

const Leave = require("../../models/Leave");
const Teacher = require("../../models/Teacher");
const User = require("../../models/User");
const Student = require("../../models/Student");
const Class = require("../../models/Class");
const { notifyUser } = require("../../services/notification.service");
const { isClassTeacherOf } = require("../../services/classTeacher.service");
const { canAccessClass } = require("../../services/authorization.service");

const {
    createLeave,
    getLeaves,
    updateLeaveStatus
} = require("../../controllers/leave.controller");

const withFakeUser = (req, res, next) => {
    req.user = {
        id: req.headers["x-user-id"],
        role: req.headers["x-user-role"]
    };
    next();
};

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use(withFakeUser);

    app.post("/leave/add", createLeave);
    app.get("/leave/all", getLeaves);
    app.put("/leave/:id/status", updateLeaveStatus);

    return app;
};

describe("createLeave", () => {

    it("lets a student apply for leave", async () => {
        Leave.create.mockResolvedValue({
            _id: "leave-1",
            leaveType: "Sick Leave",
            status: "Pending"
        });

        const app = buildApp();
        const response = await request(app)
            .post("/leave/add")
            .set("x-user-id", "student-1")
            .set("x-user-role", "student")
            .send({
                leaveType: "Sick Leave",
                fromDate: "2026-08-01",
                toDate: "2026-08-03",
                reason: "Fever"
            });

        expect(response.status).toBe(201);
        expect(Leave.create).toHaveBeenCalledWith(
            expect.objectContaining({
                studentId: "student-1",
                status: "Pending"
            })
        );
    });

    it("blocks a teacher from applying for leave (student-only feature)", async () => {
        const app = buildApp();
        const response = await request(app)
            .post("/leave/add")
            .set("x-user-id", "teacher-1")
            .set("x-user-role", "teacher")
            .send({ leaveType: "Sick Leave" });

        expect(response.status).toBe(403);
        expect(Leave.create).not.toHaveBeenCalled();
    });

});

describe("getLeaves", () => {

    it("scopes a student's request to only their own leaves", async () => {
        const populateMock = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
        Leave.find.mockReturnValue({ populate: populateMock });
        Leave.updateMany.mockResolvedValue({});

        const app = buildApp();
        await request(app)
            .get("/leave/all")
            .set("x-user-id", "student-9")
            .set("x-user-role", "student");

        expect(Leave.find).toHaveBeenCalledWith({ studentId: "student-9" });
    });

    it("scopes a teacher's request to students in their authorized classes", async () => {
        const populateMock = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
        Leave.find.mockReturnValue({ populate: populateMock });
        Leave.updateMany.mockResolvedValue({});

        Teacher.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ classesHandled: ["Std 5 - A"] })
        });

        Class.find.mockResolvedValue([]);

        Student.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([{ _id: "student-5a" }])
        });

        const app = buildApp();
        const response = await request(app)
            .get("/leave/all")
            .set("x-user-id", "teacher-1")
            .set("x-user-role", "teacher");

        expect(response.status).toBe(200);
        expect(Leave.find).toHaveBeenCalledWith({
            studentId: { $in: ["student-5a"] }
        });
    });

});

describe("updateLeaveStatus (approve/reject)", () => {

    const buildExistingLeave = (overrides = {}) => ({
        _id: "leave-1",
        leaveType: "Sick Leave",
        studentId: { _id: "student-1", standard: 5, division: "A" },
        ...overrides
    });

    it("lets an admin approve any leave regardless of class", async () => {
        Leave.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(buildExistingLeave())
        });
        Leave.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockResolvedValue(
                buildExistingLeave({ status: "Approved" })
            )
        });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ name: "Admin User" })
        });
        canAccessClass.mockResolvedValue(true);

        const app = buildApp();
        const response = await request(app)
            .put("/leave/leave-1/status")
            .set("x-user-id", "admin-1")
            .set("x-user-role", "admin")
            .send({ status: "Approved" });

        expect(response.status).toBe(200);
        expect(notifyUser).toHaveBeenCalled();
    });

    it("blocks a teacher who is NOT authorized for the student's class", async () => {
        Leave.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(buildExistingLeave())
        });
        Teacher.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ fullName: "Some Teacher" })
        });
        canAccessClass.mockResolvedValue(false);

        const app = buildApp();
        const response = await request(app)
            .put("/leave/leave-1/status")
            .set("x-user-id", "teacher-2")
            .set("x-user-role", "teacher")
            .send({ status: "Approved" });

        expect(response.status).toBe(403);
        expect(Leave.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("allows the assigned class teacher to approve", async () => {
        Leave.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(buildExistingLeave())
        });
        Leave.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockResolvedValue(
                buildExistingLeave({ status: "Approved" })
            )
        });
        Teacher.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ fullName: "Class Teacher" })
        });
        canAccessClass.mockResolvedValue(true);

        const app = buildApp();
        const response = await request(app)
            .put("/leave/leave-1/status")
            .set("x-user-id", "teacher-1")
            .set("x-user-role", "teacher")
            .send({ status: "Approved", remark: "Get well soon" });

        expect(response.status).toBe(200);
        expect(notifyUser).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "student-1",
                type: "leave"
            })
        );
    });

    it("rejects an invalid status value", async () => {
        const app = buildApp();
        const response = await request(app)
            .put("/leave/leave-1/status")
            .set("x-user-id", "admin-1")
            .set("x-user-role", "admin")
            .send({ status: "Cancelled" });

        expect(response.status).toBe(400);
    });

    it("returns 404 when the leave doesn't exist", async () => {
        Leave.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
        });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ name: "Admin" })
        });

        const app = buildApp();
        const response = await request(app)
            .put("/leave/does-not-exist/status")
            .set("x-user-id", "admin-1")
            .set("x-user-role", "admin")
            .send({ status: "Approved" });

        expect(response.status).toBe(404);
    });

});
