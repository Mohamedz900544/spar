import cron from "node-cron";
import Lead from "./models/Lead.js";
import { connectDB } from "./config/db.js";
import { notifySalesFollowUpReminder } from "./services/leadNotifications.service.js";

const FREE_SESSION_DEFAULT_DURATION_MINUTES = Number(
  process.env.FREE_SESSION_DURATION_MINUTES || 60
);
const FOLLOW_UP_DELAY_AFTER_END_MINUTES = Number(
  process.env.FREE_SESSION_FOLLOW_UP_DELAY_MINUTES || 60
);

const normalizeDuration = (value) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return FREE_SESSION_DEFAULT_DURATION_MINUTES > 0
    ? FREE_SESSION_DEFAULT_DURATION_MINUTES
    : 60;
};

const normalizeFollowUpDelay = () => {
  const parsed = Number(FOLLOW_UP_DELAY_AFTER_END_MINUTES);
  if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  return 60;
};

export async function automateLeadFollowUpStatus() {
  let isRunning = false;

  cron.schedule(
    "* * * * *",
    async () => {
      if (isRunning) return;
      isRunning = true;

      try {
        await connectDB();

        const candidates = await Lead.find({
          status: "Demo Booked",
          "freeSession.isAssigned": true,
          "freeSession.scheduledAt": { $ne: null },
        })
          .select("parentName phone childName childAge status notes createdBy freeSession")
          .lean();

        const now = new Date();
        const followUpDelayMinutes = normalizeFollowUpDelay();
        const ops = [];
        const movedToFollowUpLeads = [];

        for (const lead of candidates) {
          const freeSession = lead.freeSession || {};
          const scheduledAt = freeSession.scheduledAt
            ? new Date(freeSession.scheduledAt)
            : null;
          if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) continue;

          const durationMinutes = normalizeDuration(freeSession.durationMinutes);
          const computedEndsAt = new Date(
            scheduledAt.getTime() + durationMinutes * 60 * 1000
          );
          const storedEndsAt = freeSession.endsAt
            ? new Date(freeSession.endsAt)
            : null;
          const endsAt =
            storedEndsAt && !Number.isNaN(storedEndsAt.getTime())
              ? storedEndsAt
              : computedEndsAt;

          const computedFollowUpDueAt = new Date(
            endsAt.getTime() + followUpDelayMinutes * 60 * 1000
          );
          const storedFollowUpDueAt = freeSession.followUpDueAt
            ? new Date(freeSession.followUpDueAt)
            : null;
          const followUpDueAt =
            storedFollowUpDueAt && !Number.isNaN(storedFollowUpDueAt.getTime())
              ? storedFollowUpDueAt
              : computedFollowUpDueAt;

          const commonSet = {
            "freeSession.durationMinutes": durationMinutes,
            "freeSession.endsAt": endsAt,
            "freeSession.followUpDueAt": followUpDueAt,
          };

          if (now >= followUpDueAt) {
            const movedLead = await Lead.findOneAndUpdate(
              { _id: lead._id, status: "Demo Booked" },
              {
                $set: {
                  ...commonSet,
                  status: "Follow-up",
                  "freeSession.movedToFollowUpAt": now,
                },
              },
              { new: true }
            ).lean();

            if (movedLead) {
              movedToFollowUpLeads.push(movedLead);
            }
          } else if (!freeSession.endsAt || !freeSession.followUpDueAt) {
            ops.push({
              updateOne: {
                filter: { _id: lead._id, status: "Demo Booked" },
                update: { $set: commonSet },
              },
            });
          }
        }

        if (ops.length) {
          await Lead.bulkWrite(ops);
        }

        if (movedToFollowUpLeads.length) {
          await Promise.all(
            movedToFollowUpLeads.map((lead) =>
              notifySalesFollowUpReminder({ lead })
            )
          );
        }

      } catch (error) {
        console.error("[node-cron] lead follow-up automation failed:", error);
      } finally {
        isRunning = false;
      }
    },
    { timezone: "Africa/Cairo" }
  );
}

automateLeadFollowUpStatus();
