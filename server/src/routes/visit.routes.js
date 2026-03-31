// src/routes/visit.routes.js
import express from "express";
import SiteVisit from "../models/SiteVisit.js";

const router = express.Router();

/**
 * POST /api/track-visit
 * Public endpoint — no auth required.
 * Records a unique visit per fingerprint per day.
 */
router.post("/track-visit", async (req, res) => {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint || typeof fingerprint !== "string") {
      return res.status(400).json({ message: "fingerprint is required" });
    }

    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    // upsert: insert only if this fingerprint hasn't been seen today
    await SiteVisit.updateOne(
      { fingerprint, date: today },
      { $setOnInsert: { fingerprint, date: today } },
      { upsert: true }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("Track visit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
