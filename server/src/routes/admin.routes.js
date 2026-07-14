// src/routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { authRequired, adminOnly } from "../middleware/auth.js";
import Session from "../models/Session.js";
import Enrollment from "../models/Enrollment.js";
import Round from "../models/Round.js";
import GalleryItem from "../models/GalleryItem.js";
import Message from "../models/Message.js";
import ChildPhoto from "../models/ChildPhoto.js";
import SessionRating from "../models/SessionRating.js";
import User from "../models/User.js";
import SiteVisit from "../models/SiteVisit.js";
import Lead from "../models/Lead.js";
import BlockProject from "../models/BlockProject.js";
import { sendBrevoEmail } from "../services/brevoEmail.service.js";

const router = express.Router();
const LOGIN_URL = `${(process.env.CLIENT_URL || "").replace(/\/$/, "")}/login`;

const formatDateInCairo = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
};

const formatTimeInCairo = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Cairo",
  });
};

const escapeHtml = (value = "") =>
  `${value}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildInstructorWelcomeEmail = ({
  name,
  email,
  password,
  campusCode,
}) => {
  const safeName = escapeHtml(name || "Instructor");
  const safeEmail = escapeHtml(email || "");
  const safePassword = escapeHtml(password || "");
  const safeCampus = escapeHtml(campusCode || "N/A");
  const safeLoginUrl = escapeHtml(LOGIN_URL || "/login");

  return {
    subject: "Welcome to SP School - Instructor Account Ready",
    textContent: [
      `Hello ${name || "Instructor"},`,
      "",
      "Welcome to SP School. Your instructor account has been created.",
      "",
      "Login details:",
      `Email: ${email || ""}`,
      `Password: ${password || ""}`,
      `Campus Code: ${campusCode || "N/A"}`,
      "",
      `Login URL: ${LOGIN_URL || "/login"}`,
      "",
      "Please sign in and change your password after first login.",
    ].join("\n"),
    htmlContent: `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#102a5a;color:#ffffff;padding:14px 16px;">
          <h2 style="margin:0;font-size:18px;line-height:1.2;">Welcome to SP School</h2>
        </div>
        <div style="padding:16px;color:#0f172a;">
          <p style="margin:0 0 12px;font-size:14px;">Hello <strong>${safeName}</strong>, your instructor account is ready.</p>
          <p style="margin:0 0 10px;font-size:13px;color:#475569;">Please use the credentials below to sign in:</p>
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin:0 0 8px;font-size:13px;"><strong>Password:</strong> ${safePassword}</p>
            <p style="margin:0;font-size:13px;"><strong>Campus Code:</strong> ${safeCampus}</p>
          </div>
          <p style="margin:14px 0 0;font-size:13px;">
            <a href="${safeLoginUrl}" style="color:#102a5a;font-weight:700;text-decoration:underline;">Go to Login Page</a>
          </p>
          <p style="margin:12px 0 0;font-size:12px;color:#64748b;">
            For security, please change your password after the first login.
          </p>
        </div>
      </div>
    `,
  };
};

const buildSalesAgentWelcomeEmail = ({ name, email, password }) => {
  const safeName = escapeHtml(name || "Sales Agent");
  const safeEmail = escapeHtml(email || "");
  const safePassword = escapeHtml(password || "");
  const safeLoginUrl = escapeHtml(LOGIN_URL || "/login");

  return {
    subject: "Welcome to SP School - Sales Account Ready",
    textContent: [
      `Hello ${name || "Sales Agent"},`,
      "",
      "Welcome to SP School. Your sales account has been created.",
      "",
      "Login details:",
      `Email: ${email || ""}`,
      `Password: ${password || ""}`,
      "",
      `Login URL: ${LOGIN_URL || "/login"}`,
      "",
      "Please sign in and change your password after first login.",
    ].join("\n"),
    htmlContent: `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#102a5a;color:#ffffff;padding:14px 16px;">
          <h2 style="margin:0;font-size:18px;line-height:1.2;">Welcome to SP School</h2>
        </div>
        <div style="padding:16px;color:#0f172a;">
          <p style="margin:0 0 12px;font-size:14px;">Hello <strong>${safeName}</strong>, your sales account is ready.</p>
          <p style="margin:0 0 10px;font-size:13px;color:#475569;">Please use the credentials below to sign in:</p>
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin:0;font-size:13px;"><strong>Password:</strong> ${safePassword}</p>
          </div>
          <p style="margin:14px 0 0;font-size:13px;">
            <a href="${safeLoginUrl}" style="color:#102a5a;font-weight:700;text-decoration:underline;">Go to Login Page</a>
          </p>
          <p style="margin:12px 0 0;font-size:12px;color:#64748b;">
            For security, please change your password after the first login.
          </p>
        </div>
      </div>
    `,
  };
};

/* =====================================================
   GET ADMIN DASHBOARD (MAIN AGGREGATED ENDPOINT)
===================================================== */
router.get("/dashboard", authRequired, adminOnly, async (req, res) => {
  try {
    const today = formatDateInCairo(new Date());
    const [
      sessions,
      enrollments,
      rounds,
      galleryItems,
      messages,
      childPhotos,
      sessionRatings,
      parents,
      instructors,
      salesAgents,
      freeSessionLeads,
    ] = await Promise.all([
      Session.find({ date: { $gte: today } }).sort({ date: 'asc', time: 'asc' }).lean(),
      Enrollment.find().lean(),
      Round.find().sort({ createdAt: 'desc' }).lean(),
      GalleryItem.find().lean(),
      Message.find().lean(),
      ChildPhoto.find().lean(),
      SessionRating.find().lean(),
      User.find({ role: "parent" })
        .select("name email phone photoUrl children createdAt linkedRoundCodes linkedRounds")
        .sort({ createdAt: "desc" })
        .lean(),
      User.find({ role: "instructor" })
        .select("name email phone campusCode photoUrl createdAt linkedRoundCodes linkedRounds")
        .sort({ createdAt: "desc" })
        .lean(),
      User.find({ role: "agent" })
        .select("name email phone photoUrl createdAt")
        .sort({ createdAt: "desc" })
        .lean(),
      Lead.find({
        $or: [
          { source: "Free Session" },
          { "freeSession.requested": true },
          { "freeSession.isAssigned": true },
          { status: "Demo Booked" },
          { "freeSession.scheduledAt": { $ne: null } },
        ],
      })
        .sort({ "freeSession.scheduledAt": 1, createdAt: -1 })
        .lean(),
    ]);

    const freeSessionsForAdmin = (freeSessionLeads || []).map((lead) => ({
      id: `free-${lead._id.toString()}`,
      leadId: lead._id.toString(),
      sessionType: "free",
      title: `Free Session - ${lead.childName || "Child"}`,
      level: "Free Session",
      date: formatDateInCairo(lead.freeSession?.scheduledAt),
      time: formatTimeInCairo(lead.freeSession?.scheduledAt),
      campus: lead.freeSession?.instructorName || "Free Session",
      enrolled: 1,
      capacity: 1,
      status: lead.status || "Free Session",
      parentName: lead.parentName || "",
      childName: lead.childName || "",
      childAge: lead.childAge || null,
      phone: lead.phone || "",
      source: lead.source || "Free Session",
      scheduledAt: lead.freeSession?.scheduledAt || null,
      endsAt: lead.freeSession?.endsAt || null,
      durationMinutes: lead.freeSession?.durationMinutes || 60,
      instructorName: lead.freeSession?.instructorName || "",
    }));

    const dashboardSessions = [
      ...sessions,
      ...freeSessionsForAdmin,
    ].sort((a, b) => {
      const aDate = a.scheduledAt ? new Date(a.scheduledAt).getTime() : new Date(`${a.date || "9999-12-31"}T${a.time || "00:00"}`).getTime();
      const bDate = b.scheduledAt ? new Date(b.scheduledAt).getTime() : new Date(`${b.date || "9999-12-31"}T${b.time || "00:00"}`).getTime();
      return (Number.isNaN(aDate) ? Number.MAX_SAFE_INTEGER : aDate) - (Number.isNaN(bDate) ? Number.MAX_SAFE_INTEGER : bDate);
    });

    /* ================= TOTAL KIDS ================= */
    const totalKids = parents.reduce(
      (sum, p) => sum + (p.children?.length || 0),
      0
    );

    /* ================= BLOCK PROJECTS (LATEST PER PARENT) ================= */
    const parentIds = parents.map((p) => p._id).filter(Boolean);
    const blockProjectsByUser = {};
    if (parentIds.length > 0) {
      const projects = await BlockProject.find({ user: { $in: parentIds } })
        .select("_id user title updatedAt")
        .sort({ updatedAt: -1 })
        .lean();

      for (const project of projects) {
        const userId = project.user?.toString?.();
        if (!userId || blockProjectsByUser[userId]) continue;
        blockProjectsByUser[userId] = {
          id: project._id?.toString?.() || project._id,
          title: project.title || "My page",
          updatedAt: project.updatedAt || null,
        };
      }
    }

    /* ---------- studentPhotos: grouped by enrollmentId ---------- */
    const studentPhotos = {};
    for (const photo of childPhotos) {
      const key = photo.enrollment?.toString();
      if (!key) continue;

      if (!studentPhotos[key]) studentPhotos[key] = [];
      studentPhotos[key].push({
        id: photo._id.toString(),
        url: photo.url,
        caption: photo.caption || "",
      });
    }

    /* ---------- build roundRatings from SessionRating ---------- */
    const roundIdToCode = {};
    for (const r of rounds) {
      roundIdToCode[r._id.toString()] = r.code;
    }

    const ratingAgg = {};
    for (const r of sessionRatings) {
      const roundId = r.round?.toString();
      const roundCode = roundIdToCode[roundId];
      if (!roundCode) continue;

      if (!ratingAgg[roundCode]) {
        ratingAgg[roundCode] = {
          roundCode,
          totalReviews: 0,
          sum: 0,
        };
      }

      ratingAgg[roundCode].totalReviews += 1;
      ratingAgg[roundCode].sum += Number(r.rating) || 0;
    }

    const roundRatings = Object.values(ratingAgg).map((r) => ({
      roundCode: r.roundCode,
      totalReviews: r.totalReviews,
      averageRating:
        r.totalReviews > 0 ? r.sum / r.totalReviews : 0,
    }));
    // const enrollmentsMap = Object.groupBy(enrollments, item => item.round)


    /* ================= TODAY'S VISITORS ================= */
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayAgg = await SiteVisit.aggregate([
      { $match: { date: todayStr } },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$visits", 1] } },
        },
      },
    ]);
    const todayVisitors = todayAgg[0]?.total || 0;
    const liveSince = new Date(Date.now() - 5 * 60 * 1000);
    const liveVisitors = await SiteVisit.countDocuments({
      lastSeen: { $gte: liveSince },
    });

    /* ================= FINAL RESPONSE ================= */
    res.json({
      totalKids,        // ✅ correct kids count
      todayVisitors,    // ✅ unique visitors today
      liveVisitors,     // ✅ active visitors last 5 minutes
      sessions: dashboardSessions,
      enrollments,      // still used for rounds
      rounds,
      galleryItems,
      messages,
      roundRatings,
      studentPhotos,
      instructors,
      salesAgents,
      parents,
      blockProjectsByUser,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/instructors", authRequired, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, password, campusCode } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const instructor = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "instructor",
      campusCode: campusCode || undefined,
    });

    let welcomeEmail = { sent: false, skipped: true, reason: "not_attempted" };
    try {
      const emailPayload = buildInstructorWelcomeEmail({
        name,
        email,
        password,
        campusCode,
      });
      welcomeEmail = await sendBrevoEmail({
        to: email,
        toName: name || "",
        subject: emailPayload.subject,
        textContent: emailPayload.textContent,
        htmlContent: emailPayload.htmlContent,
      });
    } catch (emailErr) {
      console.error("Instructor welcome email error:", emailErr);
      welcomeEmail = {
        sent: false,
        error: emailErr?.message || "welcome_email_failed",
      };
    }

    return res.status(201).json({
      instructor: instructor.toJSON(),
      welcomeEmail,
    });
  } catch (err) {
    console.error("Create instructor error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/sales-agents", authRequired, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const salesAgent = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "agent",
    });

    let welcomeEmail = { sent: false, skipped: true, reason: "not_attempted" };
    try {
      const emailPayload = buildSalesAgentWelcomeEmail({
        name,
        email,
        password,
      });
      welcomeEmail = await sendBrevoEmail({
        to: email,
        toName: name || "",
        subject: emailPayload.subject,
        textContent: emailPayload.textContent,
        htmlContent: emailPayload.htmlContent,
      });
    } catch (emailErr) {
      console.error("Sales agent welcome email error:", emailErr);
      welcomeEmail = {
        sent: false,
        error: emailErr?.message || "welcome_email_failed",
      };
    }

    return res.status(201).json({
      salesAgent: salesAgent.toJSON(),
      welcomeEmail,
    });
  } catch (err) {
    console.error("Create sales agent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/instructors/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const { campusCode } = req.body;
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "instructor" },
      { $set: { campusCode: campusCode || "" } },
      { new: true }
    ).select("name email phone campusCode photoUrl createdAt linkedRoundCodes linkedRounds");

    if (!updated) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    return res.json({ instructor: updated.toJSON() });
  } catch (err) {
    console.error("Update instructor error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/instructors/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const instructor = await User.findOne({
      _id: req.params.id,
      role: "instructor",
    })
      .select("name email")
      .lean();

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const assignedSessionsCount = await Lead.countDocuments({
      "freeSession.isAssigned": true,
      "freeSession.instructor": instructor._id,
    });

    if (assignedSessionsCount > 0) {
      return res.status(409).json({
        message:
          "This instructor has assigned free sessions. Reassign or clear them first.",
        assignedSessionsCount,
      });
    }

    await User.deleteOne({ _id: instructor._id, role: "instructor" });

    return res.json({
      message: "Instructor deleted successfully",
      instructorId: instructor._id.toString(),
    });
  } catch (err) {
    console.error("Delete instructor error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/sales-agents/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const salesAgent = await User.findOne({
      _id: req.params.id,
      role: "agent",
    })
      .select("name email")
      .lean();

    if (!salesAgent) {
      return res.status(404).json({ message: "Sales agent not found" });
    }

    await User.deleteOne({ _id: salesAgent._id, role: "agent" });

    return res.json({
      message: "Sales agent deleted successfully",
      salesAgentId: salesAgent._id.toString(),
    });
  } catch (err) {
    console.error("Delete sales agent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/parents/:parentId/children/:childId/rounds", authRequired, adminOnly, async (req, res) => {
  try {
    const { parentId, childId } = req.params;
    const { roundId, roundCode, code } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(parentId) ||
      !mongoose.Types.ObjectId.isValid(childId)
    ) {
      return res.status(400).json({ message: "Invalid parent or child id" });
    }

    if (!roundId && !roundCode && !code) {
      return res.status(400).json({ message: "Round is required" });
    }

    const parent = await User.findOne({ _id: parentId, role: "parent" });
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const child = parent.children.id(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found in parent profile" });
    }

    const normalizedCode = (roundCode || code || "").toString().trim().toUpperCase();
    const roundQuery = roundId
      ? { _id: roundId }
      : { code: normalizedCode };

    if (roundId && !mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({ message: "Invalid round id" });
    }

    const round = await Round.findOne(roundQuery).populate("sessions").lean();
    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    const firstSession = Array.isArray(round.sessions) ? round.sessions[0] : null;
    const capacity = Number(firstSession?.capacity || 0);
    const enrolled = Number(firstSession?.enrolled || 0);
    if (capacity > 0 && enrolled >= capacity) {
      return res.status(400).json({ message: "This round is fully booked." });
    }

    const existing = await Enrollment.findOne({
      user: parent._id,
      childId: child._id,
      $or: [{ round: round._id }, { roundCode: round.code }],
    }).lean();

    if (existing) {
      return res.status(409).json({
        message: `Child ${child.name} is already enrolled in this round`,
      });
    }

    const enrollment = await Enrollment.create({
      user: parent._id,
      childId: child._id,
      childName: child.name,
      parentName: parent.name,
      phone: parent.phone,
      level: round.level || "Level 1",
      sessionTitle: round.name || "",
      status: "Pending",
      roundCode: round.code,
      round: round._id,
    });

    await Session.updateMany(
      { round: round._id },
      { $inc: { enrolled: 1 } }
    );

    await User.updateOne(
      { _id: parent._id, "children._id": child._id },
      {
        $addToSet: {
          linkedRounds: round._id,
          linkedRoundCodes: round.code,
          "children.$.enrolledRounds": round._id,
        },
      }
    );

    const [updatedParent, updatedSessions] = await Promise.all([
      User.findById(parent._id)
        .select("name email phone photoUrl children createdAt linkedRoundCodes linkedRounds")
        .lean(),
      Session.find({ round: round._id }).lean(),
    ]);

    return res.status(201).json({
      message: "Round linked to child successfully",
      parent: updatedParent
        ? {
            ...updatedParent,
            id: updatedParent._id.toString(),
          }
        : null,
      enrollment: {
        ...enrollment.toObject(),
        id: enrollment._id.toString(),
      },
      round: {
        ...round,
        id: round._id.toString(),
      },
      updatedSessions: updatedSessions.map((session) => ({
        ...session,
        id: session._id.toString(),
      })),
    });
  } catch (err) {
    console.error("Admin link child round error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/parents/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const parent = await User.findOne({
      _id: req.params.id,
      role: "parent",
    })
      .select("name email children")
      .lean();

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const parentEnrollments = await Enrollment.find({ user: parent._id })
      .select("_id")
      .lean();
    const enrollmentIds = parentEnrollments.map((e) => e._id);
    const deletedEnrollmentIds = enrollmentIds.map((enrollmentId) =>
      enrollmentId.toString()
    );

    if (enrollmentIds.length > 0) {
      await ChildPhoto.deleteMany({ enrollment: { $in: enrollmentIds } });
      await Enrollment.deleteMany({ user: parent._id });
    }

    await User.deleteOne({ _id: parent._id, role: "parent" });

    return res.json({
      message: "Parent account deleted successfully",
      parentId: parent._id.toString(),
      deletedEnrollmentsCount: enrollmentIds.length,
      deletedEnrollmentIds,
      deletedChildrenCount: parent.children?.length || 0,
    });
  } catch (err) {
    console.error("Delete parent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ENROLLMENTS
===================================================== */
router.patch("/enrollments/:id/status", authRequired, adminOnly, async (req, res) => {
  try {
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Update enrollment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/enrollments/:id/note", authRequired, adminOnly, async (req, res) => {
  try {
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { note: req.body.note },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Update enrollment note error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   MESSAGES
===================================================== */
/* -------------------------------------------
   UPDATE MESSAGE STATUS (ADMIN)
-------------------------------------------- */
router.patch(
  "/messages/:id/status",
  authRequired,
  adminOnly,
  async (req, res) => {
    try {
      const { status } = req.body;

      const updated = await Message.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error("Update message status error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* -------------------------------------------
   UPDATE MESSAGE INTERNAL NOTE (ADMIN)
-------------------------------------------- */
router.patch(
  "/messages/:id/note",
  authRequired,
  adminOnly,
  async (req, res) => {
    try {
      const { internalNote } = req.body;

      const updated = await Message.findByIdAndUpdate(
        req.params.id,
        { internalNote },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error("Update message note error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   STUDENT PHOTOS (JSON VERSION – compatible with UI)
===================================================== */
router.post("/enrollments/:id/photos", authRequired, adminOnly, async (req, res) => {
  try {
    const { photos } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ message: "photos array is required" });
    }

    const docs = photos.map((p) => ({
      enrollment: req.params.id,
      url: p.url,
      caption: p.caption || "",
    }));

    const saved = await ChildPhoto.create(docs);
    res.json(saved);
  } catch (err) {
    console.error("Upload student photos error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
