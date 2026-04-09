import express from "express";
import Message from "../models/Message.js";
import Lead from "../models/Lead.js";

const router = express.Router();

/* -------------------------------------------
   CREATE MESSAGE FROM CONTACT FORM
-------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { parentName, childName, phone, childAge, message } = req.body;

    if (!parentName || !phone || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const created = await Message.create({
      parentName,
      phone,
      childAge: childAge || null,
      message,
    });

    const normalizedMessage = (message || "").toString().toLowerCase();
    const wantsFreeSession =
      normalizedMessage.includes("free session") ||
      normalizedMessage.includes("trial") ||
      normalizedMessage.includes("حصة مجانية") ||
      normalizedMessage.includes("جلسة مجانية");

    let lead = null;
    try {
      lead = await Lead.create({
        parentName,
        childName: childName?.trim() || "Unknown Child",
        childAge: childAge || undefined,
        phone,
        source: wantsFreeSession ? "Free Session" : "Contact Form",
        notes: message?.trim()
          ? [
              {
                text: message.trim(),
                createdByName: "Website Contact Form",
                createdByRole: "system",
              },
            ]
          : [],
        freeSession: {
          requested: wantsFreeSession,
        },
      });
    } catch (leadErr) {
      console.error("Lead creation from contact form failed:", leadErr);
    }

    res.status(201).json({
      message: created,
      lead,
    });
  } catch (err) {
    console.error("Contact message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
