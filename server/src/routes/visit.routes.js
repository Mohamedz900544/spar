// src/routes/visit.routes.js
import express from "express";
import SiteVisit from "../models/SiteVisit.js";

const router = express.Router();

/**
 * POST /api/track-visit
 * Public endpoint — no auth required.
 * Every call creates one visit record for today.
 */
router.post("/track-visit", async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    await SiteVisit.create({ date: today });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Track visit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
