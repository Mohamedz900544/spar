// src/routes/visit.routes.js
import express from "express";
import crypto from "crypto";
import SiteVisit from "../models/SiteVisit.js";

const router = express.Router();

/**
 * POST /api/track-visit
 * Public endpoint — no auth required.
 * Upserts one record per visitor per day (unique visitors).
 */
router.post("/track-visit", async (req, res) => {
  try {
    const { visitorId } = req.body;
    const safeVisitorId =
      visitorId ||
      crypto
        .createHash("sha256")
        .update(`${req.ip}|${req.get("user-agent") || ""}`)
        .digest("hex");

    const now = new Date();
    const today = now.toLocaleDateString("en-CA"); // YYYY-MM-DD

    await SiteVisit.updateOne(
      { date: today, visitorId: safeVisitorId },
      {
        $setOnInsert: { date: today, visitorId: safeVisitorId },
        $set: { lastSeen: now },
        $inc: { visits: 1 },
      },
      { upsert: true }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("Track visit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
