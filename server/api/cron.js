import "../src/config/env.js";
import Lead from "../src/models/Lead.js";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";
import { processRoundSessionReminders } from "../src/services/roundSessionReminders.service.js";
import { completeFinishedRounds } from "../src/services/roundStatus.service.js";
import { processBusyCallReminders } from "../src/services/busyCallReminder.service.js";
import { updateSessionStatuses } from "../src/services/sessionStatus.service.js";
import { processLeadFollowUpStatus } from "../src/services/leadFollowUpStatus.service.js";
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
        const sessionStatusUpdates = await updateSessionStatuses();
        const leadFollowUpStatus = await processLeadFollowUpStatus();
        const freeSessionReminders = await processFreeSessionReminders();
        const roundSessionReminders = await processRoundSessionReminders();
        const roundStatusUpdates = await completeFinishedRounds();
        const busyCallReminders = await processBusyCallReminders();

        return res.status(200).json({
            success: true,
            sessionStatusUpdates,
            leadFollowUpStatus,
            roundStatusUpdates,
            freeSessionReminders,
            roundSessionReminders,
            busyCallReminders,
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
