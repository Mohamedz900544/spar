import Lead from "../models/Lead.js";
import { notifySalesBusyCallReminder } from "./leadNotifications.service.js";

export const processBusyCallReminders = async (now = new Date()) => {
  const candidates = await Lead.find({
    status: "Busy Call Later",
    "callLater.scheduledAt": { $ne: null, $lte: now },
    $or: [
      { "callLater.reminderSentAt": { $in: [null, undefined] } },
      { "callLater.reminderSentAt": { $exists: false } },
    ],
  })
    .select("parentName phone childName childAge status notes createdBy callLater")
    .lean();

  let sentCount = 0;

  for (const lead of candidates) {
    let result = null;
    try {
      result = await notifySalesBusyCallReminder({ lead });
      if (result?.sent) sentCount += 1;
    } catch (error) {
      console.error("[busy-call-reminder] notification failed:", error);
      result = { sent: false, error: error.message || "notification_error" };
    }

    await Lead.updateOne(
      { _id: lead._id },
      {
        $set: {
          "callLater.reminderSentAt": now,
        },
      }
    );
  }

  return {
    candidates: candidates.length,
    sentCount,
  };
};
