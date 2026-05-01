import cron from "node-cron";
import { connectDB } from "./config/db.js";
import { processLeadFollowUpStatus } from "./services/leadFollowUpStatus.service.js";

export async function automateLeadFollowUpStatus() {
  let isRunning = false;

  cron.schedule(
    "* * * * *",
    async () => {
      if (isRunning) return;
      isRunning = true;

      try {
        await connectDB();
        await processLeadFollowUpStatus();
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
