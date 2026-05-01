import cron from 'node-cron'
import { connectDB } from './config/db.js';
import { completeFinishedRounds } from './services/roundStatus.service.js';
import { updateSessionStatuses } from './services/sessionStatus.service.js';

export async function updateStatusOfSession() {
    let isRunning = false;

    cron.schedule('* * * * *', async () => {
        if (isRunning) {
            console.warn("[node-cron] skipped run: previous job still running");
            return;
        }

        isRunning = true;
        const startedAt = Date.now();

        try {
            await connectDB();
            await updateSessionStatuses();
            await completeFinishedRounds();
        } catch (error) {
            console.error("[node-cron] update status failed:", error);
        } finally {
            isRunning = false;
            const durationMs = Date.now() - startedAt;
            if (durationMs > 55000) {
                console.warn(
                    `[node-cron] run took ${durationMs}ms; consider reducing load`
                );
            }
        }
    }, {
        timezone: "Africa/Cairo",
    })
}

updateStatusOfSession()
