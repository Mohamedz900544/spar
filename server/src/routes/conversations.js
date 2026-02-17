import express from "express";
import Conversation from "../models/Conversation.js";
import InboxMessage from "../models/InboxMessage.js";
import { sendWhatsAppTemplate, sendWhatsAppText } from "../services/whatsapp.js";

const router = express.Router();

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const filter = status ? { status } : {};

    const [items, total] = await Promise.all([
      Conversation.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments(filter),
    ]);

    res.json({
      conversations: items,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await InboxMessage.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 });

    res.json({ conversation, messages });
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const update = {};
    if (status) update.status = status;
    if (assignedTo !== undefined) update.assignedTo = assignedTo || null;

    const updated = await Conversation.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update conversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/messages", async (req, res) => {
  try {
    const { text, templateName, templateLanguage } = req.body;
    if (!text && !templateName) {
      return res.status(400).json({ message: "Text or template is required" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!conversation.customerPhone) {
      return res.status(400).json({ message: "Conversation has no customer phone" });
    }

    if (templateName) {
      await sendWhatsAppTemplate({
        to: conversation.customerPhone,
        name: templateName,
        language: templateLanguage,
      });
    } else {
      try {
        await sendWhatsAppText({
          to: conversation.customerPhone,
          text,
        });
      } catch (err) {
        const code = err.response?.data?.error?.code;
        const fallbackTemplate = process.env.WHATSAPP_FALLBACK_TEMPLATE;
        const fallbackLanguage = process.env.WHATSAPP_FALLBACK_LANGUAGE || "en_US";
        const shouldFallback = code === 131047 || code === 131053;
        if (shouldFallback && fallbackTemplate) {
          await sendWhatsAppTemplate({
            to: conversation.customerPhone,
            name: fallbackTemplate,
            language: fallbackLanguage,
          });
        } else {
          throw err;
        }
      }
    }

    const message = await InboxMessage.create({
      conversationId: conversation._id,
      from: "agent",
      text: text || `[template:${templateName || process.env.WHATSAPP_FALLBACK_TEMPLATE}]`,
      timestamp: new Date(),
    });

    conversation.lastMessageText = text;
    conversation.lastMessageAt = message.timestamp;
    if (conversation.status === "new") {
      conversation.status = "open";
    }
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    console.error("Send message error:", err);
    if (err.message === "WhatsApp credentials are missing") {
      return res.status(400).json({ message: err.message });
    }
    const status = err.response?.status || 502;
    const details = err.response?.data || null;
    return res.status(status).json({
      message: "WhatsApp send failed",
      details,
    });
  }
});

export default router;
