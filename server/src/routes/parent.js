// src/routes/parent.js
import express from "express";
import { authRequired, parentOnly } from "../middleware/auth.js";

import User from "../models/User.js";
import Round from "../models/Round.js";
import Enrollment from "../models/Enrollment.js";
import RoundRating from "../models/RoundRating.js";
import ChildPhoto from "../models/ChildPhoto.js";

const router = express.Router();

/* -------------------------------------------
   GET /api/parent/dashboard
   يرجع:
   - بيانات الأب
   - الراوندات المربوطة بيه
   - الـ enrollments بتاعة أولاده
   - الصور بتاعة أولاده
-------------------------------------------- */
router.get("/dashboard", authRequired, parentOnly, async (req, res) => {
  try {
    const userId = req.user._id;

    const parent = await User.findById(userId).lean();

    // الأكواد اللي الأب رابطها بحسابه
    let linkedRoundCodes = Array.isArray(parent?.linkedRoundCodes)
      ? parent.linkedRoundCodes
      : [];

    // لو لسه مفيش linkedRoundCodes ممكن نستنتجها من الـ enrollments
    const enrollments = await Enrollment.find({ parentId: userId }).lean();

    if (!linkedRoundCodes.length) {
      const fromEnrollments = [
        ...new Set(
          (enrollments || [])
            .map((e) => e.roundCode)
            .filter(Boolean)
        ),
      ];
      linkedRoundCodes = fromEnrollments;
    }

    const rounds = linkedRoundCodes.length
      ? await Round.find({ code: { $in: linkedRoundCodes } }).lean()
      : [];

    const enrollmentIds = enrollments.map((e) => e._id);

    const photos = enrollmentIds.length
      ? await ChildPhoto.find({
          enrollmentId: { $in: enrollmentIds },
        }).lean()
      : [];

    return res.json({
      parent: {
        id: parent._id,
        name: parent.name,
        fullName: parent.fullName,
        email: parent.email,
      },
      rounds,
      enrollments,
      photos,
    });
  } catch (err) {
    console.error("GET /api/parent/dashboard error:", err);
    return res
      .status(500)
      .json({ message: "Failed to load parent dashboard" });
  }
});

/* -------------------------------------------
   POST /api/parent/link-round
   body: { code }
   - يتحقق إن الـ round موجود
   - يربط الكود في User.linkedRoundCodes
   - يرجع round + enrollments + photos محدثة
-------------------------------------------- */
router.post("/link-round", authRequired, parentOnly, async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Round code is required" });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const round = await Round.findOne({ code: normalizedCode }).lean();
    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    // اربط الكود في حساب الأب
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { linkedRoundCodes: normalizedCode } },
      { new: true }
    );

    // enrollments بتاعة الأب
    const enrollments = await Enrollment.find({ parentId: userId }).lean();
    const enrollmentIds = enrollments.map((e) => e._id);

    const photos = enrollmentIds.length
      ? await ChildPhoto.find({
          enrollmentId: { $in: enrollmentIds },
        }).lean()
      : [];

    return res.json({
      message: "Round linked successfully",
      round,
      enrollments,
      photos,
    });
  } catch (err) {
    console.error("POST /api/parent/link-round error:", err);
    return res
      .status(500)
      .json({ message: "Could not link this round. Please try again." });
  }
});

/* -------------------------------------------
   POST /api/parent/rate-session
   body: { roundCode, sessionId, rating }
   - يتحقق إن الأب بالفعل ليه enrollment في الراوند ده
   - يخزن التقييم في RoundRating (aggregate per round)
   - الأدمِن داشبورد بيقرا RoundRating ويعرض المتوسط
-------------------------------------------- */
router.post("/rate-session", authRequired, parentOnly, async (req, res) => {
  try {
    const userId = req.user._id;
    const { roundCode, sessionId, rating } = req.body;

    if (!roundCode || !sessionId || !rating) {
      return res
        .status(400)
        .json({ message: "roundCode, sessionId and rating are required" });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const normalizedCode = String(roundCode).trim().toUpperCase();

    // تأكد إن الأب فعلاً مشارك في الراوند ده
    const hasEnrollment = await Enrollment.exists({
      parentId: userId,
      roundCode: normalizedCode,
    });

    if (!hasEnrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this round, cannot rate it.",
      });
    }

    // ✨ هنا بنعمل aggregate بسيط في RoundRating (واحد لكل roundCode)
    let rr = await RoundRating.findOne({ roundCode: normalizedCode });

    if (!rr) {
      rr = new RoundRating({
        roundCode: normalizedCode,
        averageRating: numericRating,
        totalReviews: 1,
      });
    } else {
      const newTotal = rr.totalReviews + 1;
      rr.averageRating =
        (rr.averageRating * rr.totalReviews + numericRating) / newTotal;
      rr.totalReviews = newTotal;
    }

    await rr.save();

    return res.json({
      message: "Rating saved",
      roundRating: rr,
    });
  } catch (err) {
    console.error("POST /api/parent/rate-session error:", err);
    return res
      .status(500)
      .json({ message: "Could not save rating. Please try again." });
  }
});

export default router;
