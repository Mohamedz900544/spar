import Session from "../src/models/Session.js";
import Lead from "../src/models/Lead.js";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";
import {
    notifyInstructorSessionReminder,
    notifyParentSessionReminder,
} from "../src/services/leadNotifications.service.js";

const processFreeSessionReminders = async () => {
    const now = new Date();
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

    let instructorReminderCount = 0;
    let parentReminderCount = 0;

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
            const instructorResult = await notifyInstructorSessionReminder({
                lead,
                instructor,
            });
            updatePayload["freeSession.reminderSentAt"] = now;
            if (instructorResult?.sent) instructorReminderCount += 1;
        }

        if (parentNeedsReminder) {
            const parentResult = await notifyParentSessionReminder({ lead });
            updatePayload["freeSession.parentReminderSentAt"] = now;
            if (parentResult?.sent) parentReminderCount += 1;
        }

        if (Object.keys(updatePayload).length) {
            await Lead.updateOne({ _id: lead._id }, { $set: updatePayload });
        }
    }

    return {
        candidates: candidates.length,
        instructorReminderCount,
        parentReminderCount,
    };
};

export default async function handler(req, res) {
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
                console.error("[cron] invalid session date");
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
        }

        const freeSessionReminders = await processFreeSessionReminders();

        return res.status(200).json({
            success: true,
            sessionStatusUpdates: bulkOps.length,
            freeSessionReminders,
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
