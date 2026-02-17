// src/routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import { authRequired, adminOnly } from "../middleware/auth.js";
import Session from "../models/Session.js";
import Enrollment from "../models/Enrollment.js";
import Round from "../models/Round.js";
import GalleryItem from "../models/GalleryItem.js";
import Message from "../models/Message.js";
import ChildPhoto from "../models/ChildPhoto.js";
import SessionRating from "../models/SessionRating.js";
import User from "../models/User.js";

const router = express.Router();

/* =====================================================
   GET ADMIN DASHBOARD (MAIN AGGREGATED ENDPOINT)
===================================================== */
router.get("/dashboard", authRequired, adminOnly, async (req, res) => {
  try {
    console.log("ADMIN DASHBOARD USER:", req.user?.email);
    const today = new Date().toLocaleDateString('en-CA');
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
    ] = await Promise.all([
      Session.find({ date: { $gte: today } }).sort({ date: 'asc', time: 'asc' }).lean(),
      Enrollment.find().lean(),
      Round.find().sort({ createdAt: 'desc' }).lean(),
      GalleryItem.find().lean(),
      Message.find().lean(),
      ChildPhoto.find().lean(),
      SessionRating.find().lean(),
      User.find({ role: "parent" }).select("children").lean(),
      User.find({ role: "instructor" })
        .select("name email phone campusCode photoUrl createdAt linkedRoundCodes linkedRounds")
        .sort({ createdAt: "desc" })
        .lean(),
    ]);

    /* ================= TOTAL KIDS ================= */
    const totalKids = parents.reduce(
      (sum, p) => sum + (p.children?.length || 0),
      0
    );

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


    /* ================= FINAL RESPONSE ================= */
    res.json({
      totalKids,        // ✅ correct kids count
      sessions: sessions,
      enrollments,      // still used for rounds
      rounds,
      galleryItems,
      messages,
      roundRatings,
      studentPhotos,
      instructors,
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

    return res.status(201).json({
      instructor: instructor.toJSON(),
    });
  } catch (err) {
    console.error("Create instructor error:", err);
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
