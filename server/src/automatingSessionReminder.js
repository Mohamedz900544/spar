import cron from "node-cron";
import Lead from "./models/Lead.js";
import User from "./models/User.js";
import { connectDB } from "./config/db.js";
import {
  notifyInstructorSessionReminder,
  notifyParentSessionReminder,
} from "./services/leadNotifications.service.js";
import { processRoundSessionReminders } from "./services/roundSessionReminders.service.js";

/**
 * Cron job that runs every minute.
 * Finds free sessions starting within the next 55-65 minute window
 * and sends reminders to the assigned instructor and parent.
 *
 * Uses `freeSession.reminderSentAt` flag to avoid duplicate reminders.
 */
export async function automateSessionReminder() {
  let isRunning = false;

  cron.schedule(
    "* * * * *",
    async () => {
      if (isRunning) return;
      isRunning = true;

      try {
        await connectDB();

        const now = new Date();
        // Window: sessions starting between 55 and 65 minutes from now
        const windowStart = new Date(now.getTime() + 55 * 60 * 1000);
        const windowEnd = new Date(now.getTime() + 65 * 60 * 1000);

        const candidates = await Lead.find({
          "freeSession.isAssigned": true,
          "freeSession.scheduledAt": {
            $gte: windowStart,
            $lte: windowEnd,
          },
          $or: [
            { "freeSession.reminderSentAt": { $in: [null, undefined] } },
            { "freeSession.parentReminderSentAt": { $in: [null, undefined] } },
          ],
          status: { $in: ["Demo Booked", "Follow-up"] },
        }).lean();

        for (const lead of candidates) {
          const instructorNeedsReminder = !lead.freeSession?.reminderSentAt;
          const parentNeedsReminder = !lead.freeSession?.parentReminderSentAt;
          const instructorId = lead.freeSession?.instructor;
          let instructor = null;

          if (instructorNeedsReminder && instructorId) {
            instructor = await User.findById(instructorId)
              .select("name phone email role")
              .lean();
          }

          const updatePayload = {};
          if (instructorNeedsReminder && instructor) {
            await notifyInstructorSessionReminder({
              lead,
              instructor,
            });
            updatePayload["freeSession.reminderSentAt"] = now;
          }

          if (parentNeedsReminder) {
            await notifyParentSessionReminder({ lead });
            updatePayload["freeSession.parentReminderSentAt"] = now;
          }

          if (Object.keys(updatePayload).length) {
            await Lead.updateOne({ _id: lead._id }, { $set: updatePayload });
          }
        }

        await processRoundSessionReminders();
      } catch {
        console.error("[cron][reminder] session reminder failed");
      } finally {
        isRunning = false;
      }
    },
    { timezone: "UTC" }
  );
}

automateSessionReminder();
