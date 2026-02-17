import express from "express";
import { authRequired, instructorOnly } from "../middleware/auth.js";
import Enrollment from "../models/Enrollment.js";
import Round from "../models/Round.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/dashboard", authRequired, instructorOnly, async (req, res) => {
  try {
    const instructor = await User.findById(req.user._id).lean();
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const linkedCodes = (instructor.linkedRoundCodes || [])
      .map((c) => c.toString().toUpperCase().trim())
      .filter(Boolean);

    if (!linkedCodes.length) {
      return res.json({
        instructor: {
          id: instructor._id.toString(),
          name: instructor.name,
          email: instructor.email,
          campusCode: instructor.campusCode || "",
        },
        rounds: [],
      });
    }

    const rounds = await Round.find({ code: { $in: linkedCodes } })
      .populate("sessions")
      .lean();

    const roundIds = rounds.map((r) => r._id);
    const enrollments = await Enrollment.find({ round: { $in: roundIds } }).lean();

    const enrollmentsByRound = enrollments.reduce((acc, enrollment) => {
      const key = enrollment.round?.toString();
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        ...enrollment,
        id: enrollment._id.toString(),
      });
      return acc;
    }, {});

    const roundsWithEnrollments = rounds.map((round) => ({
      ...round,
      id: round._id.toString(),
      sessions: (round.sessions || []).map((s) => ({
        ...s,
        id: s._id?.toString() || s.id,
      })),
      enrollments: enrollmentsByRound[round._id.toString()] || [],
    }));

    return res.json({
      instructor: {
        id: instructor._id.toString(),
        name: instructor.name,
        email: instructor.email,
        campusCode: instructor.campusCode || "",
      },
      rounds: roundsWithEnrollments,
    });
  } catch (err) {
    console.error("Instructor dashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/link-round", authRequired, instructorOnly, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Round code is required" });
    }

    const normalizedCode = code.toString().toUpperCase().trim();
    const round = await Round.findOne({ code: normalizedCode }).populate("sessions").lean();
    if (!round) {
      return res.status(404).json({ message: "Round code not found" });
    }

    await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: {
          linkedRoundCodes: normalizedCode,
          linkedRounds: round._id,
        },
      }
    );

    return res.json({
      round: {
        id: round._id.toString(),
        code: round.code,
        name: round.name,
        level: round.level,
        campus: round.campus,
        startDate: round.startDate,
        endDate: round.endDate,
        sessionsCount: round.sessionsCount,
        weeksPerSession: round.weeksPerSession,
        status: round.status,
        sessions: (round.sessions || []).map((s) => ({
          ...s,
          id: s._id?.toString() || s.id,
        })),
      },
    });
  } catch (err) {
    console.error("Link round error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/attendance", authRequired, instructorOnly, async (req, res) => {
  try {
    const { enrollmentId, sessionId, present } = req.body;
    if (!enrollmentId || !sessionId || typeof present !== "boolean") {
      return res.status(400).json({ message: "Missing attendance fields" });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const session = await Session.findById(sessionId).lean();
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (
      enrollment.round?.toString() &&
      session.round?.toString() &&
      enrollment.round.toString() !== session.round.toString()
    ) {
      return res.status(400).json({ message: "Session does not match round" });
    }

    const instructor = await User.findById(req.user._id).lean();
    const linkedCodes = (instructor?.linkedRoundCodes || [])
      .map((c) => c.toString().toUpperCase().trim());

    if (!linkedCodes.includes(enrollment.roundCode?.toString().toUpperCase())) {
      return res.status(403).json({ message: "Not authorized for this round" });
    }

    const existingIndex = (enrollment.attendance || []).findIndex(
      (a) => a.session?.toString() === sessionId
    );

    if (existingIndex >= 0) {
      enrollment.attendance[existingIndex].present = present;
      enrollment.attendance[existingIndex].markedAt = new Date();
      enrollment.attendance[existingIndex].markedBy = req.user._id;
    } else {
      enrollment.attendance = [
        ...(enrollment.attendance || []),
        {
          session: sessionId,
          present,
          markedAt: new Date(),
          markedBy: req.user._id,
        },
      ];
    }

    await enrollment.save();

    return res.json({
      enrollmentId: enrollment._id.toString(),
      attendance: enrollment.attendance,
    });
  } catch (err) {
    console.error("Attendance error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
