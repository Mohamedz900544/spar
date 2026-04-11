import express from "express";
import { authRequired, instructorOnly } from "../middleware/auth.js";
import Enrollment from "../models/Enrollment.js";
import Round from "../models/Round.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";

const router = express.Router();
const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const TIME_RANGE_REGEX = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;

const createEmptyWorkingDays = () => ({
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
});

const toMinutes = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

const normalizeWorkingHoursForResponse = (workingHours) => {
  const source = workingHours || {};
  const daysSource = source.days || {};
  const days = createEmptyWorkingDays();

  for (const day of WEEK_DAYS) {
    days[day] = (Array.isArray(daysSource[day]) ? daysSource[day] : [])
      .map((slot) => ({
        start: (slot?.start || "").toString().trim(),
        end: (slot?.end || "").toString().trim(),
      }))
      .filter(
        (slot) =>
          TIME_RANGE_REGEX.test(slot.start) &&
          TIME_RANGE_REGEX.test(slot.end) &&
          toMinutes(slot.start) < toMinutes(slot.end)
      )
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }

  const slotDuration = Number(source.slotDurationMinutes);
  return {
    timezone: source.timezone?.trim?.() || "Africa/Cairo",
    slotDurationMinutes:
      Number.isFinite(slotDuration) && slotDuration >= 15 && slotDuration <= 180
        ? Math.round(slotDuration)
        : 60,
    days,
    updatedAt: source.updatedAt || null,
  };
};

const parseWorkingHoursInput = (rawWorkingHours) => {
  const source = rawWorkingHours || {};
  const sourceDays = source.days && typeof source.days === "object" ? source.days : {};
  const days = createEmptyWorkingDays();

  for (const day of WEEK_DAYS) {
    const slots = Array.isArray(sourceDays[day]) ? sourceDays[day] : [];
    const normalized = slots.map((slot, index) => {
      const start = (slot?.start || "").toString().trim();
      const end = (slot?.end || "").toString().trim();

      if (!TIME_RANGE_REGEX.test(start) || !TIME_RANGE_REGEX.test(end)) {
        throw new Error(`Invalid time format in ${day} slot ${index + 1}`);
      }

      if (toMinutes(start) >= toMinutes(end)) {
        throw new Error(`Start time must be before end time in ${day} slot ${index + 1}`);
      }

      return { start, end };
    });

    normalized.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    for (let i = 1; i < normalized.length; i += 1) {
      if (toMinutes(normalized[i].start) < toMinutes(normalized[i - 1].end)) {
        throw new Error(`Overlapping slots found in ${day}`);
      }
    }

    days[day] = normalized;
  }

  const slotDuration = Number(source.slotDurationMinutes);
  const timezone = source.timezone?.toString?.().trim() || "Africa/Cairo";

  return {
    timezone,
    slotDurationMinutes:
      Number.isFinite(slotDuration) && slotDuration >= 15 && slotDuration <= 180
        ? Math.round(slotDuration)
        : 60,
    days,
    updatedAt: new Date(),
  };
};

router.get("/working-hours", authRequired, instructorOnly, async (req, res) => {
  try {
    const instructor = await User.findById(req.user._id).select("workingHours").lean();
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    return res.json({
      workingHours: normalizeWorkingHoursForResponse(instructor.workingHours),
    });
  } catch (err) {
    console.error("Get instructor working hours error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/working-hours", authRequired, instructorOnly, async (req, res) => {
  try {
    const payload = parseWorkingHoursInput(req.body?.workingHours || req.body);

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { workingHours: payload } },
      { new: true }
    )
      .select("workingHours")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    return res.json({
      workingHours: normalizeWorkingHoursForResponse(updated.workingHours),
    });
  } catch (err) {
    if (err?.message?.toLowerCase?.().includes("slot") || err?.message?.toLowerCase?.().includes("time")) {
      return res.status(400).json({ message: err.message });
    }
    console.error("Update instructor working hours error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

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

router.get("/trial-leads", authRequired, instructorOnly, async (_req, res) => {
  try {
    const leads = await Lead.find({
      status: { $in: ["Demo Booked", "Follow-up", "Closed - Won", "Closed - Lost"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      leads: leads.map((lead) => ({
        ...lead,
        id: lead._id.toString(),
      })),
    });
  } catch (err) {
    console.error("Trial leads error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/trial-leads/:id/evaluation", authRequired, instructorOnly, async (req, res) => {
  try {
    const { strengths = "", favoriteProject = "" } = req.body;

    if (!strengths.trim() && !favoriteProject.trim()) {
      return res
        .status(400)
        .json({ message: "Provide strengths or favoriteProject" });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          trainerEvaluation: {
            strengths: strengths.trim(),
            favoriteProject: favoriteProject.trim(),
            updatedAt: new Date(),
            updatedBy: req.user._id,
            updatedByName: req.user.name || "",
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Update trial lead evaluation error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my-free-sessions", authRequired, instructorOnly, async (req, res) => {
  try {
    const leads = await Lead.find({
      "freeSession.isAssigned": true,
      "freeSession.instructor": req.user._id,
      "freeSession.scheduledAt": { $ne: null },
    })
      .sort({ "freeSession.scheduledAt": 1 })
      .lean();

    return res.json({
      freeSessions: leads.map((lead) => ({
        id: lead._id.toString(),
        parentName: lead.parentName || "-",
        childName: lead.childName || "-",
        childAge: lead.childAge || null,
        phone: lead.phone || "-",
        scheduledAt: lead.freeSession.scheduledAt,
        durationMinutes: lead.freeSession.durationMinutes || 60,
        endsAt: lead.freeSession.endsAt,
        status: lead.status,
        notes: (lead.notes || [])
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 3)
          .map((n) => n.text || ""),
      })),
    });
  } catch (err) {
    console.error("My free sessions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
