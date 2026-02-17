import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/* -------------------------------------------
   CREATE MESSAGE FROM CONTACT FORM
-------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { parentName, phone, childAge, message } = req.body;

    if (!parentName || !phone || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const created = await Message.create({
      parentName,
      phone,
      childAge: childAge || null,
      message,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Contact message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
