const Timetable = require("../models/Timetable");

const cleanEntries = (entries = []) => entries.map((entry) => ({
    day: entry.day,
    startTime: entry.startTime,
    endTime: entry.endTime,
    type: entry.type === "break" ? "break" : "class",
    subject: entry.type === "break" ? "" : entry.subject,
    teacherName: entry.type === "break" ? "" : entry.teacherName,
    label: entry.type === "break" ? entry.label : "",
    color: entry.color || "indigo"
}));

const createTimetable = async (req, res) => {
    try {
        const existing = await Timetable.findOne({ classId: req.body.classId });
        if (existing) return res.status(409).json({ success: false, message: "A timetable already exists for this class." });
        const timetable = await Timetable.create({ classId: req.body.classId, entries: cleanEntries(req.body.entries) });
        res.status(201).json({ success: true, timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getClassTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ classId: req.params.classId });
        res.status(200).json({ success: true, timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndUpdate(req.params.id, { entries: cleanEntries(req.body.entries) }, { new: true, runValidators: true });
        if (!timetable) return res.status(404).json({ success: false, message: "Timetable not found." });
        res.status(200).json({ success: true, timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndDelete(req.params.id);
        if (!timetable) return res.status(404).json({ success: false, message: "Timetable not found." });
        res.status(200).json({ success: true, message: "Timetable deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createTimetable, getClassTimetable, updateTimetable, deleteTimetable };
