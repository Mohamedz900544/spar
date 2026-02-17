import express from "express";
import Conversation from "../models/Conversation.js";
import InboxMessage from "../models/InboxMessage.js";

const router = express.Router();

const toMessageDate = (timestamp) => {
  if (!timestamp) return new Date();
  const seconds = Number(timestamp);
  if (Number.isNaN(seconds)) return new Date();
  return new Date(seconds * 1000);
};

const handleVerification = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

router.get("/", handleVerification);
router.get("/whatsapp", handleVerification);

const handleWebhook = async (req, res) => {
  try {
    const entries = req.body?.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        for (const message of messages) {
          const customerPhone = message.from;
          const text = message.text?.body || "";
          const timestamp = toMessageDate(message.timestamp);

          if (!customerPhone) continue;

          let conversation = await Conversation.findOne({ customerPhone });
          if (!conversation) {
            conversation = await Conversation.create({
              customerPhone,
              lastMessageText: text,
              lastMessageAt: timestamp,
              status: "new",
            });
          } else {
            conversation.lastMessageText = text;
            conversation.lastMessageAt = timestamp;
            if (conversation.status === "closed") {
              conversation.status = "open";
            }
            await conversation.save();
          }

          await InboxMessage.create({
            conversationId: conversation._id,
            from: "customer",
            text,
            timestamp,
            rawPayload: message,
          });
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    res.sendStatus(500);
  }
};

router.post("/", handleWebhook);
router.post("/whatsapp", handleWebhook);

export default router;
