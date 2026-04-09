import express from "express";

const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ message: "Webhook verification failed" });
});

router.post("/", (req, res) => {
  try {
    const payload = req.body || {};

    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        if (change?.field !== "messages") continue;

        const value = change.value || {};
        const statuses = Array.isArray(value.statuses) ? value.statuses : [];
        const messages = Array.isArray(value.messages) ? value.messages : [];

        if (statuses.length) {
          for (const status of statuses) {
            console.log("[whatsapp][webhook][status]", {
              id: status.id,
              status: status.status,
              recipient_id: status.recipient_id,
              timestamp: status.timestamp,
            });
          }
        }

        if (messages.length) {
          for (const message of messages) {
            console.log("[whatsapp][webhook][incoming]", {
              from: message.from,
              id: message.id,
              type: message.type,
              timestamp: message.timestamp,
            });
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("[whatsapp][webhook] failed to process payload:", error);
    return res.sendStatus(200);
  }
});

export default router;
