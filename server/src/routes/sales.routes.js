import express from "express";
import Lead, { LEAD_STATUSES } from "../models/Lead.js";
import { authRequired, agentOrAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import {
  notifyInstructorFreeSessionAssigned,
  notifyParentFreeSessionAssigned,
  notifySalesFollowUpReminder,
  sendWhatsAppAutomationTest,
} from "../services/leadNotifications.service.js";
import {
  normalizePhoneForWhatsApp,
  sendWhatsAppTemplate,
  sendWhatsAppText,
} from "../services/whatsapp.service.js";
import { sendBrevoEmail } from "../services/brevoEmail.service.js";
import { sendBrevoSms } from "../services/brevoSms.service.js";
import {
  getFreeSessionDurationMinutes,
  getFreeSessionFollowUpDelayMinutes,
} from "../services/freeSessionTiming.service.js";

const router = express.Router();
const WHATSAPP_TEST_PHONE = process.env.WHATSAPP_TEST_PHONE || "01007775705";
const WHATSAPP_TEST_TEMPLATE = process.env.WHATSAPP_TEMPLATE_DEFAULT || "hello_world";
const WHATSAPP_TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";
const EMAIL_TEST_RECIPIENT =
  process.env.BREVO_TEST_EMAIL || "mohamedz90054@gmail.com";
const SMS_TEST_RECIPIENT =
  process.env.BREVO_TEST_SMS_NUMBER || "01280669844";
const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const TIME_RANGE_REGEX = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;
const FREE_SESSION_TIMEZONE = "Africa/Cairo";
const LOCAL_DATE_TIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/;
const WEEKDAY_NAME_TO_KEY = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
};

const assertValidStatus = (status) => LEAD_STATUSES.includes(status);
const isReminderStatus = (status) =>
  status === "Reserved Later" || status === "Busy Call Later";

const toMinutes = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

const getTimeZoneOffsetMs = (date, timeZone = FREE_SESSION_TIMEZONE) => {
  const fields = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  const asUtc = Date.UTC(
    Number(fields.year),
    Number(fields.month) - 1,
    Number(fields.day),
    Number(fields.hour),
    Number(fields.minute),
    Number(fields.second)
  );

  return asUtc - date.getTime();
};

const parseDateTimeInTimeZone = (value, timeZone = FREE_SESSION_TIMEZONE) => {
  if (value instanceof Date) return value;

  const raw = `${value || ""}`.trim();
  if (!raw) return new Date(raw);

  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)) {
    return new Date(raw);
  }

  const match = raw.match(LOCAL_DATE_TIME_REGEX);
  if (!match) return new Date(raw);

  const [, year, month, day, hour, minute, second = "0"] = match;
  const localUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  let utcMs = localUtcMs;
  for (let index = 0; index < 3; index += 1) {
    const offsetMs = getTimeZoneOffsetMs(new Date(utcMs), timeZone);
    const nextUtcMs = localUtcMs - offsetMs;
    if (Math.abs(nextUtcMs - utcMs) < 1) break;
    utcMs = nextUtcMs;
  }

  return new Date(utcMs);
};

const parseCallLaterAt = (value) => {
  const scheduledAt = parseDateTimeInTimeZone(value);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Valid reminder date/time is required" };
  }
  if (scheduledAt.getTime() <= Date.now()) {
    return { error: "Reminder date/time must be in the future" };
  }
  return { scheduledAt };
};

const getDateTimePartsInTimeZone = (
  value,
  timeZone = FREE_SESSION_TIMEZONE
) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const fields = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    dayKey: WEEKDAY_NAME_TO_KEY[(fields.weekday || "").toLowerCase()] || "",
    hours: Number(fields.hour),
    minutes: Number(fields.minute),
  };
};

const normalizeInstructorWorkingHours = (workingHours) => {
  const daysSource = workingHours?.days || {};
  const days = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  for (const day of WEEK_DAYS) {
    days[day] = (Array.isArray(daysSource[day]) ? daysSource[day] : [])
      .map((slot) => ({
        start: (slot?.start || "").toString().trim(),
        end: (slot?.end || "").toString().trim(),
      }))
      .filter(
        (slot) =>
          TIME_RANGE_REGEX.test(slot.start) &&
          TIME_RANGE_REGEX.test(slot.end) &&
          toMinutes(slot.start) < toMinutes(slot.end)
      )
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }

  const slotDuration = Number(workingHours?.slotDurationMinutes);

  return {
    timezone: workingHours?.timezone?.trim?.() || "Africa/Cairo",
    slotDurationMinutes:
      Number.isFinite(slotDuration) && slotDuration >= 15 && slotDuration <= 180
        ? Math.round(slotDuration)
        : 60,
    days,
    updatedAt: workingHours?.updatedAt || null,
  };
};

const isInsideWorkingHours = (scheduledDate, durationMinutes, workingHours) => {
  const scheduledParts = getDateTimePartsInTimeZone(
    scheduledDate,
    workingHours?.timezone || FREE_SESSION_TIMEZONE
  );
  if (!scheduledParts) return false;

  const dayKey = scheduledParts.dayKey;
  const slots = workingHours?.days?.[dayKey] || [];
  if (!slots.length) return false;

  const startMinutes = scheduledParts.hours * 60 + scheduledParts.minutes;
  const endMinutes = startMinutes + durationMinutes;

  return slots.some((slot) => {
    const slotStart = toMinutes(slot.start);
    const slotEnd = toMinutes(slot.end);
    return startMinutes >= slotStart && endMinutes <= slotEnd;
  });
};

const resolveFreeSessionRange = (freeSession, fallbackDurationMinutes) => {
  const startRaw = freeSession?.scheduledAt;
  const startDate = startRaw ? new Date(startRaw) : null;
  if (!startDate || Number.isNaN(startDate.getTime())) {
    return null;
  }

  const durationRaw = Number(freeSession?.durationMinutes);
  const durationMinutes =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? durationRaw
      : fallbackDurationMinutes;

  const explicitEnd = freeSession?.endsAt ? new Date(freeSession.endsAt) : null;
  const endDate =
    explicitEnd && !Number.isNaN(explicitEnd.getTime())
      ? explicitEnd
      : new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return {
    startDate,
    endDate,
  };
};

const rangesOverlap = (firstRange, secondRange) => {
  if (!firstRange || !secondRange) return false;
  return (
    firstRange.startDate.getTime() < secondRange.endDate.getTime() &&
    secondRange.startDate.getTime() < firstRange.endDate.getTime()
  );
};

const hasParentWelcomeBeenSent = async (phone) => {
  const normalizedPhone = normalizePhoneForWhatsApp(phone || "");
  if (!normalizedPhone) return false;

  const welcomedLeads = await Lead.find({
    "freeSession.parentWelcomeSentAt": { $ne: null },
  })
    .select("phone")
    .lean();

  return welcomedLeads.some(
    (lead) => normalizePhoneForWhatsApp(lead.phone || "") === normalizedPhone
  );
};

router.get("/dashboard", authRequired, agentOrAdmin, async (_req, res) => {
  try {
    const [leads, instructors] = await Promise.all([
      Lead.find().sort({ createdAt: -1 }).lean(),
      User.find({ role: "instructor" })
        .select("name email phone campusCode workingHours")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const stats = LEAD_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {}
    );

    for (const lead of leads) {
      if (stats[lead.status] !== undefined) {
        stats[lead.status] += 1;
      }
    }

    return res.json({
      statuses: LEAD_STATUSES,
      stats,
      leads: leads.map((lead) => ({
        ...lead,
        id: lead._id.toString(),
      })),
      instructors: instructors.map((instructor) => ({
        ...instructor,
        id: instructor._id.toString(),
        workingHours: normalizeInstructorWorkingHours(instructor.workingHours),
      })),
    });
  } catch (err) {
    console.error("Sales dashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/whatsapp/test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const requestedPhone = req.body?.phone || WHATSAPP_TEST_PHONE;
    const to = normalizePhoneForWhatsApp(requestedPhone);

    if (!to) {
      return res.status(400).json({ message: "Invalid test phone number" });
    }

    const agentName = req.user?.name || "Sales Agent";
    const now = new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" });

    let result = await sendWhatsAppTemplate({
      to,
      templateName: WHATSAPP_TEST_TEMPLATE,
      languageCode: WHATSAPP_TEMPLATE_LANGUAGE,
    });

    if (!result?.sent) {
      result = await sendWhatsAppText({
        to,
        body: `WhatsApp test from Sales Dashboard\nAgent: ${agentName}\nTime: ${now}`,
      });
    }

    if (!result?.sent) {
      return res.status(502).json({
        message: "WhatsApp test failed",
        details: result,
      });
    }

    return res.json({
      message: `WhatsApp test sent to ${to}`,
      to,
      result,
    });
  } catch (err) {
    console.error("WhatsApp test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/whatsapp/automation-test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const requestedPhone = req.body?.phone || WHATSAPP_TEST_PHONE;
    const type = req.body?.type || "";
    const to = normalizePhoneForWhatsApp(requestedPhone);

    if (!to) {
      return res.status(400).json({ message: "Invalid test phone number" });
    }

    const result = await sendWhatsAppAutomationTest({ type, phone: to });
    if (result?.reason === "invalid_automation_test_type") {
      return res.status(400).json({
        message: "Invalid WhatsApp automation test type",
        details: result,
      });
    }

    if (result?.reason === "invalid_test_phone_number") {
      return res.status(400).json({
        message: "Invalid WhatsApp test phone number",
        details: result,
      });
    }

    if (result?.reason === "missing_busy_call_template_env") {
      return res.status(400).json({
        message:
          "Missing WHATSAPP_TEMPLATE_BUSY_CALL_REMINDER env for reserved later reminder",
        details: result,
      });
    }

    if (!result?.sent) {
      return res.status(502).json({
        message: "WhatsApp automation test failed",
        details: result,
      });
    }

    return res.json({
      message: `${result.label || "WhatsApp automation"} test sent to ${to}`,
      to,
      type,
      result,
    });
  } catch (err) {
    console.error("WhatsApp automation test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/email/test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const to = EMAIL_TEST_RECIPIENT;
    const agentName = req.user?.name || "Sales Agent";
    const now = new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" });

    const subject = "Brevo Email Test from Sales Dashboard";
    const textContent = [
      "Brevo test email",
      `Agent: ${agentName}`,
      `Time: ${now}`,
      "Source: Sales Dashboard",
    ].join("\n");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #102a5a; color: #fff; padding: 12px 16px; font-size: 16px; font-weight: 700;">
          Brevo Test Email
        </div>
        <div style="padding: 16px; color: #0f172a; line-height: 1.6; font-size: 14px;">
          <p style="margin: 0 0 8px;">This is a test email from Sales Dashboard.</p>
          <p style="margin: 0 0 6px;"><strong>Agent:</strong> ${agentName}</p>
          <p style="margin: 0;"><strong>Time:</strong> ${now}</p>
        </div>
      </div>
    `;

    const result = await sendBrevoEmail({
      to,
      toName: "Mohamed Zalama",
      subject,
      textContent,
      htmlContent,
    });

    if (!result?.sent) {
      return res.status(502).json({
        message: "Email test failed",
        details: result,
      });
    }

    return res.json({
      message: `Email test sent to ${to}`,
      to,
      result,
    });
  } catch (err) {
    console.error("Email test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/sms/test", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const requestedPhone = req.body?.phone || SMS_TEST_RECIPIENT;
    const to = normalizePhoneForWhatsApp(requestedPhone);

    if (!to) {
      return res.status(400).json({ message: "Invalid test SMS phone number" });
    }

    const agentName = req.user?.name || "Sales Agent";
    const now = new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" });
    const content = [
      "Sparvi SMS test",
      "",
      "Agent:",
      agentName,
      "",
      "Time:",
      now,
    ].join("\n");

    const result = await sendBrevoSms({
      recipient: to,
      content,
      tag: "sales_sms_test",
    });

    if (!result?.sent) {
      const reason = result?.reason || result?.error || "";
      const message =
        reason === "no_sms_credits"
          ? "SMS credits are 0 on Brevo account"
          : "SMS test failed";
      return res.status(502).json({
        message,
        details: result,
      });
    }

    return res.json({
      message: `SMS test sent to ${requestedPhone}`,
      to,
      result,
    });
  } catch (err) {
    console.error("SMS test error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/leads", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const {
      parentName,
      childName,
      childAge,
      phone,
      source,
      paymentLink,
      initialNote,
    } = req.body;

    if (!parentName || !childName || !phone) {
      return res.status(400).json({
        message: "parentName, childName and phone are required",
      });
    }

    const notes = [];
    if (initialNote?.trim()) {
      notes.push({
        text: initialNote.trim(),
        createdBy: req.user._id,
        createdByName: req.user.name || "",
        createdByRole: req.user.role || "",
      });
    }

    const lead = await Lead.create({
      parentName,
      childName,
      childAge: childAge || undefined,
      phone,
      source: source || "Manual",
      paymentLink: paymentLink || "",
      createdBy: req.user._id,
      notes,
      freeSession: {
        requested: (source || "Manual") === "Free Session",
      },
    });

    return res.status(201).json(lead.toJSON());
  } catch (err) {
    console.error("Create lead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/status", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { status, lostReason = "", callLaterAt = "" } = req.body;

    if (!assertValidStatus(status)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    if (status === "Closed - Lost" && !lostReason.trim()) {
      return res
        .status(400)
        .json({ message: "lostReason is required for Closed - Lost" });
    }

    const callLaterParse = isReminderStatus(status) ? parseCallLaterAt(callLaterAt) : null;
    if (callLaterParse?.error) {
      return res.status(400).json({ message: callLaterParse.error });
    }

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const updatePayload = {
      status,
      lostReason: status === "Closed - Lost" ? lostReason.trim() : "",
    };

    if (isReminderStatus(status)) {
      updatePayload["callLater.scheduledAt"] = callLaterParse.scheduledAt;
      updatePayload["callLater.scheduledBy"] = req.user._id;
      updatePayload["callLater.scheduledByName"] = req.user.name || "";
      updatePayload["callLater.scheduledAtSet"] = new Date();
      updatePayload["callLater.reminderSentAt"] = null;
      updatePayload["callLater.reminderLastAttemptAt"] = null;
      updatePayload["callLater.reminderLastError"] = "";
    } else {
      updatePayload["callLater.scheduledAt"] = null;
      updatePayload["callLater.reminderSentAt"] = null;
      updatePayload["callLater.reminderLastAttemptAt"] = null;
      updatePayload["callLater.reminderLastError"] = "";
    }

    // If telesales marks a lead as Demo Booked manually, treat it as a free-session request.
    if (status === "Demo Booked") {
      updatePayload["freeSession.requested"] = true;
    }

    if (!leadBefore.createdBy && ["agent", "admin"].includes(req.user.role)) {
      updatePayload.createdBy = req.user._id;
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );

    const statusChangedToFollowUp =
      status === "Follow-up" && (leadBefore.status || "") !== "Follow-up";

    let notificationResult = null;
    if (statusChangedToFollowUp && updated) {
      try {
        notificationResult = await notifySalesFollowUpReminder({
          lead: updated.toObject(),
          fallbackSalesUser: req.user,
        });
      } catch (waErr) {
        console.error("[sales][status] follow-up notification error:", waErr);
        notificationResult = { sent: false, error: waErr.message || "notification_error" };
      }
    }

    return res.json({
      ...updated.toJSON(),
      ...(notificationResult
        ? {
            notificationResult,
            whatsappNotification: notificationResult.whatsapp || null,
            emailNotification: notificationResult.email || null,
          }
        : {}),
    });
  } catch (err) {
    console.error("Update lead status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/call-later", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { callLaterAt, status = "Busy Call Later" } = req.body;
    if (!isReminderStatus(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Reserved Later or Busy Call Later" });
    }

    const parsed = parseCallLaterAt(callLaterAt);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const updatePayload = {
      status,
      lostReason: "",
      "callLater.scheduledAt": parsed.scheduledAt,
      "callLater.scheduledBy": req.user._id,
      "callLater.scheduledByName": req.user.name || "",
      "callLater.scheduledAtSet": new Date(),
      "callLater.reminderSentAt": null,
      "callLater.reminderLastAttemptAt": null,
      "callLater.reminderLastError": "",
    };

    if (!leadBefore.createdBy && ["agent", "admin"].includes(req.user.role)) {
      updatePayload.createdBy = req.user._id;
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Schedule busy call later error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/leads/:id/notes", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            text: text.trim(),
            createdBy: req.user._id,
            createdByName: req.user.name || "",
            createdByRole: req.user.role || "",
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Add lead note error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/payment-link", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { paymentLink = "" } = req.body;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: { paymentLink: paymentLink.trim() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Update payment link error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/leads/:id/free-session", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const { scheduledAt, instructorId } = req.body;

    if (!scheduledAt || !instructorId) {
      return res
        .status(400)
        .json({ message: "scheduledAt and instructorId are required" });
    }

    const scheduledDate = parseDateTimeInTimeZone(
      scheduledAt,
      FREE_SESSION_TIMEZONE
    );
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduledAt date" });
    }

    const durationMinutes = getFreeSessionDurationMinutes();
    const followUpDelayMinutes = getFreeSessionFollowUpDelayMinutes();
    const endsAt = new Date(
      scheduledDate.getTime() + durationMinutes * 60 * 1000
    );
    const followUpDueAt = new Date(
      endsAt.getTime() + followUpDelayMinutes * 60 * 1000
    );

    const instructor = await User.findOne({
      _id: instructorId,
      role: "instructor",
    }).lean();

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    const normalizedWorkingHours = normalizeInstructorWorkingHours(
      instructor.workingHours
    );

    if (!isInsideWorkingHours(scheduledDate, durationMinutes, normalizedWorkingHours)) {
      return res.status(400).json({
        message: "Selected time is outside the instructor working hours",
      });
    }

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
    }
    const shouldSendParentWelcome = !(await hasParentWelcomeBeenSent(
      leadBefore.phone
    ));

    const targetRange = {
      startDate: scheduledDate,
      endDate: endsAt,
    };
    const instructorAssignedSessions = await Lead.find({
      _id: { $ne: req.params.id },
      "freeSession.isAssigned": true,
      "freeSession.instructor": instructor._id,
      "freeSession.scheduledAt": { $ne: null },
    })
      .select("parentName childName freeSession")
      .lean();

    const conflictingLead = instructorAssignedSessions.find((existingLead) => {
      const existingRange = resolveFreeSessionRange(
        existingLead.freeSession,
        durationMinutes
      );
      return rangesOverlap(targetRange, existingRange);
    });

    if (conflictingLead) {
      const conflictStart = conflictingLead.freeSession?.scheduledAt
        ? new Date(conflictingLead.freeSession.scheduledAt).toLocaleString("en-GB", {
            timeZone: "Africa/Cairo",
          })
        : "this selected time";
      return res.status(409).json({
        message: `This instructor already has a session at ${conflictStart}. Choose another slot.`,
        conflict: {
          leadId: conflictingLead._id?.toString?.() || "",
          parentName: conflictingLead.parentName || "",
          childName: conflictingLead.childName || "",
          scheduledAt: conflictingLead.freeSession?.scheduledAt || null,
        },
      });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(leadBefore?.createdBy
            ? {}
            : ["agent", "admin"].includes(req.user.role)
              ? { createdBy: req.user._id }
              : {}),
          status: "Demo Booked",
          freeSession: {
            requested: true,
            isAssigned: true,
            scheduledAt: scheduledDate,
            durationMinutes,
            endsAt,
            followUpDueAt,
            movedToFollowUpAt: null,
            instructor: instructor._id,
            instructorName: instructor.name || "",
            assignedBy: req.user._id,
            assignedByName: req.user.name || "",
            assignedAt: new Date(),
            reminderSentAt: null,
            parentWelcomeSentAt:
              leadBefore?.freeSession?.parentWelcomeSentAt || null,
            parentAssignmentNotifiedAt: null,
            parentReminderSentAt: null,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const [notificationResult, parentNotificationResult] = await Promise.all([
      notifyInstructorFreeSessionAssigned({
        lead: updated.toObject(),
        instructor,
      }),
      notifyParentFreeSessionAssigned({
        lead: updated.toObject(),
        shouldSendWelcome: shouldSendParentWelcome,
      }),
    ]);
    const notificationUpdates = {};
    const notificationTimestamp = new Date();
    if (parentNotificationResult?.welcomeSent) {
      notificationUpdates["freeSession.parentWelcomeSentAt"] =
        notificationTimestamp;
    }
    if (parentNotificationResult?.assignmentSent) {
      notificationUpdates["freeSession.parentAssignmentNotifiedAt"] =
        notificationTimestamp;
    }
    if (Object.keys(notificationUpdates).length) {
      await Lead.updateOne({ _id: updated._id }, { $set: notificationUpdates });
      Object.assign(updated.freeSession, {
        ...(notificationUpdates["freeSession.parentWelcomeSentAt"]
          ? { parentWelcomeSentAt: notificationTimestamp }
          : {}),
        ...(notificationUpdates["freeSession.parentAssignmentNotifiedAt"]
          ? { parentAssignmentNotifiedAt: notificationTimestamp }
          : {}),
      });
    }
    const whatsappNotificationTarget = {
      instructorId: instructor._id?.toString?.() || instructorId,
      instructorName: instructor.name || "",
      instructorEmail: instructor.email || "",
      instructorPhoneRaw: instructor.phone || "",
      instructorPhoneNormalized: normalizePhoneForWhatsApp(instructor.phone || ""),
    };
    const parentNotificationTarget = {
      parentName: updated.parentName || "",
      parentPhoneRaw: updated.phone || "",
      parentPhoneNormalized: normalizePhoneForWhatsApp(updated.phone || ""),
    };

    if (!notificationResult?.whatsappSent) {
      console.warn("[sales][free-session] instructor whatsapp notification failed");
    }

    return res.json({
      ...updated.toJSON(),
      notificationResult,
      parentNotificationResult,
      whatsappNotification: notificationResult?.whatsapp || null,
      parentWhatsAppNotification: parentNotificationResult || null,
      emailNotification: notificationResult?.email || null,
      whatsappNotificationTarget,
      parentNotificationTarget,
    });
  } catch (err) {
    console.error("Assign free session error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/leads/:id/free-session", authRequired, agentOrAdmin, async (req, res) => {
  try {
    const removeRequest = req.query?.removeRequest === "true";
    const lead = await Lead.findById(req.params.id).lean();
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (!removeRequest && !lead.freeSession?.isAssigned && !lead.freeSession?.scheduledAt) {
      return res.status(400).json({ message: "This lead has no assigned free session" });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(lead.status === "Demo Booked" ? { status: "New" } : {}),
          ...(removeRequest && lead.source === "Free Session" ? { source: "Manual" } : {}),
          "freeSession.requested": removeRequest ? false : true,
          "freeSession.isAssigned": false,
          "freeSession.scheduledAt": null,
          "freeSession.durationMinutes": 60,
          "freeSession.endsAt": null,
          "freeSession.followUpDueAt": null,
          "freeSession.movedToFollowUpAt": null,
          "freeSession.instructor": null,
          "freeSession.instructorName": "",
          "freeSession.assignedBy": null,
          "freeSession.assignedByName": "",
          "freeSession.assignedAt": null,
          "freeSession.reminderSentAt": null,
          "freeSession.parentAssignmentNotifiedAt": null,
          "freeSession.parentReminderSentAt": null,
        },
      },
      { new: true }
    );

    return res.json(updated.toJSON());
  } catch (err) {
    console.error("Clear free session assignment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
