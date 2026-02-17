import cron from 'node-cron'
import Session from './models/Session.js';
import { connectDB } from './config/db.js';

export async function updateStatusOfSession() {
    cron.schedule('* * * * *', async () => {
        console.log("⏰ Running session status check...");
        await connectDB();

        try {
            const activeSessions = await Session.find({
                status: { $ne: "Completed" }
            });

            const bulkOps = [];

            const cairoTimeString = new Date().toLocaleString("en-US", {
                timeZone: "Africa/Cairo",
            });

            const nowInCairo = new Date(cairoTimeString);

            for (const session of activeSessions) {
                if (!session.date || !session.time) continue;

                const sessionTimeStr = `${session.date.trim()}T${session.time.trim()}:00`;
                const sessionStart = new Date(sessionTimeStr);

                if (isNaN(sessionStart.getTime())) {
                    console.error(`❌ Invalid Date: ${sessionTimeStr}`);
                    continue;
                }

                const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);

                let newStatus = null;

                if (nowInCairo >= sessionEnd) {
                    if (session.status !== "Completed") newStatus = "Completed";
                } else if (nowInCairo >= sessionStart) {
                    if (session.status !== "Active") newStatus = "Active";
                }

                if (newStatus) {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: session._id },
                            update: { $set: { status: newStatus } }
                        }
                    });
                }
            }

            if (bulkOps.length > 0) {
                await Session.bulkWrite(bulkOps);
                console.log(`✅ Updated ${bulkOps.length} sessions.`);
            }

            return "welcome"

        } catch (error) {
            console.log(error.message)
        }
    })
}

updateStatusOfSession()
