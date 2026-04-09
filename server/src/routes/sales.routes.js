import express from "express";
import Lead, { LEAD_STATUSES } from "../models/Lead.js";
import { authRequired, agentOrAdmin } from "../middleware/auth.js";

const router = express.Router();

const assertValidStatus = (status) => LEAD_STATUSES.includes(status);

router.get("/dashboard", authRequired, agentOrAdmin, async (_req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();

    const stats = LEAD_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {}
    );

    for (const lead of leads) {
      if (stats[lead.status] !== undefined) {
        stats[lead.status] += 1;
      }
    }

    return res.json({
      statuses: LEAD_STATUSES,
      stats,
      leads: leads.map((lead) => ({
        ...lead,
        id: lead._id.toString(),
      })),
    });
  } catch (err) {
    console.error("Sales dashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/leads", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const {
      parentName,
      childName,
      childAge,
      phone,
      source,
      paymentLink,
      initialNote,
    } = req.body;

    if (!parentName || !childName || !phone) {
      return res.status(400).json({
        message: "parentName, childName and phone are required",
      });
    }

    const notes = [];
    if (initialNote?.trim()) {
      notes.push({
        text: initialNote.trim(),
        createdBy: req.user._id,
        createdByName: req.user.name || "",
        createdByRole: req.user.role || "",
      });
    }

    const lead = await Lead.create({
      parentName,
      childName,
      childAge: childAge || undefined,
      phone,
      source: source || "Manual",
      paymentLink: paymentLink || "",
      createdBy: req.user._id,
      notes,
    });

    return res.status(201).json(lead.toJSON());
  } catch (err) {
    console.error("Create lead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/status", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { status, lostReason = "" } = req.body;

    if (!assertValidStatus(status)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    if (status === "Closed - Lost" && !lostReason.trim()) {
      return res
        .status(400)
        .json({ message: "lostReason is required for Closed - Lost" });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          lostReason: status === "Closed - Lost" ? lostReason.trim() : "",
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Update lead status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/leads/:id/notes", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            text: text.trim(),
            createdBy: req.user._id,
            createdByName: req.user.name || "",
            createdByRole: req.user.role || "",
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
    console.error("Add lead note error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/payment-link", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { paymentLink = "" } = req.body;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: { paymentLink: paymentLink.trim() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Update payment link error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
