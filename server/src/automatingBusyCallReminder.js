import cron from "node-cron";
import { connectDB } from "./config/db.js";
import { processBusyCallReminders } from "./services/busyCallReminder.service.js";

export function automateBusyCallReminders() {
  let isRunning = false;

  cron.schedule(
    "*/5 * * * * *",
    async () => {
      if (isRunning) return;
      isRunning = true;

      try {
        await connectDB();
        await processBusyCallReminders(new Date());
      } catch (error) {
        console.error("[node-cron] busy call reminder automation failed:", error);
      } finally {
        isRunning = false;
      }
    },
    { timezone: "Africa/Cairo" }
  );
}

automateBusyCallReminders();
