import Lead from "../models/Lead.js";
import { notifySalesBusyCallReminder } from "./leadNotifications.service.js";

export const processBusyCallReminders = async (now = new Date()) => {
  const candidates = await Lead.find({
    status: { $in: ["Reserved Later", "Busy Call Later"] },
    "callLater.scheduledAt": { $ne: null, $lte: now },
    $or: [
      { "callLater.reminderSentAt": { $in: [null, undefined] } },
      { "callLater.reminderSentAt": { $exists: false } },
      { "callLater.reminderLastAttemptAt": { $exists: false } },
    ],
  })
    .select("parentName phone childName childAge status notes createdBy callLater")
    .lean();

  let sentCount = 0;
  let failedCount = 0;

  for (const lead of candidates) {
    let result = null;
    try {
      result = await notifySalesBusyCallReminder({ lead });
      if (result?.sent) sentCount += 1;
    } catch (error) {
      console.error("[busy-call-reminder] notification failed:", error);
      result = { sent: false, error: error.message || "notification_error" };
    }

    const failureReason =
      result?.whatsapp?.error ||
      result?.whatsapp?.reason ||
      result?.error ||
      result?.reason ||
      "";

    if (!result?.sent) {
      failedCount += 1;
      console.warn("[busy-call-reminder] reminder not sent", {
        leadId: lead._id?.toString?.(),
        reason: failureReason || "unknown_error",
      });
    }

    await Lead.updateOne(
      { _id: lead._id },
      {
        $set: {
          "callLater.reminderLastAttemptAt": now,
          "callLater.reminderLastError": result?.sent ? "" : failureReason || "unknown_error",
          ...(result?.sent ? { "callLater.reminderSentAt": now } : {}),
        },
      }
    );
  }

  return {
    candidates: candidates.length,
    sentCount,
    failedCount,
  };
};
