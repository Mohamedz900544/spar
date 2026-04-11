import express from "express";
import Lead, { LEAD_STATUSES } from "../models/Lead.js";
import { authRequired, agentOrAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import {
  notifyInstructorFreeSessionAssigned,
  notifySalesFollowUpReminder,
} from "../services/leadNotifications.service.js";
import {
  normalizePhoneForWhatsApp,
  sendWhatsAppTemplate,
  sendWhatsAppText,
} from "../services/whatsapp.service.js";
import { sendBrevoEmail } from "../services/brevoEmail.service.js";

const router = express.Router();
const FREE_SESSION_DEFAULT_DURATION_MINUTES = Number(
  process.env.FREE_SESSION_DURATION_MINUTES || 60
);
const FOLLOW_UP_DELAY_AFTER_END_MINUTES = Number(
  process.env.FREE_SESSION_FOLLOW_UP_DELAY_MINUTES || 180
);
const WHATSAPP_TEST_PHONE = process.env.WHATSAPP_TEST_PHONE || "01007775705";
const WHATSAPP_TEST_TEMPLATE = process.env.WHATSAPP_TEMPLATE_DEFAULT || "hello_world";
const WHATSAPP_TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";
const EMAIL_TEST_RECIPIENT =
  process.env.BREVO_TEST_EMAIL || "mohamedz90054@gmail.com";

const assertValidStatus = (status) => LEAD_STATUSES.includes(status);

router.get("/dashboard", authRequired, agentOrAdmin, async (_req, res) => {
  try {
    const [leads, instructors] = await Promise.all([
      Lead.find().sort({ createdAt: -1 }).lean(),
      User.find({ role: "instructor" })
        .select("name email phone campusCode")
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
    const { status, lostReason = "" } = req.body;

    if (!assertValidStatus(status)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    if (status === "Closed - Lost" && !lostReason.trim()) {
      return res
        .status(400)
        .json({ message: "lostReason is required for Closed - Lost" });
    }

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const updatePayload = {
      status,
      lostReason: status === "Closed - Lost" ? lostReason.trim() : "",
    };

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

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduledAt date" });
    }

    const durationMinutes =
      Number.isFinite(FREE_SESSION_DEFAULT_DURATION_MINUTES) &&
      FREE_SESSION_DEFAULT_DURATION_MINUTES > 0
        ? FREE_SESSION_DEFAULT_DURATION_MINUTES
        : 60;
    const followUpDelayMinutes =
      Number.isFinite(FOLLOW_UP_DELAY_AFTER_END_MINUTES) &&
      FOLLOW_UP_DELAY_AFTER_END_MINUTES >= 0
        ? FOLLOW_UP_DELAY_AFTER_END_MINUTES
        : 180;
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

    const leadBefore = await Lead.findById(req.params.id).lean();
    if (!leadBefore) {
      return res.status(404).json({ message: "Lead not found" });
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
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const notificationResult = await notifyInstructorFreeSessionAssigned({
      lead: updated.toObject(),
      instructor,
    });
    const whatsappNotificationTarget = {
      instructorId: instructor._id?.toString?.() || instructorId,
      instructorName: instructor.name || "",
      instructorPhoneRaw: instructor.phone || "",
      instructorPhoneNormalized: normalizePhoneForWhatsApp(instructor.phone || ""),
    };

    if (!notificationResult?.whatsappSent) {
      console.warn("[sales][free-session] instructor whatsapp notification failed:", {
        leadId: updated._id?.toString?.() || updated.id,
        instructorId: whatsappNotificationTarget.instructorId,
        instructorPhone: whatsappNotificationTarget.instructorPhoneRaw,
        result: notificationResult?.whatsapp || notificationResult,
      });
    }

    return res.json({
      ...updated.toJSON(),
      notificationResult,
      whatsappNotification: notificationResult?.whatsapp || null,
      emailNotification: notificationResult?.email || null,
      whatsappNotificationTarget,
    });
  } catch (err) {
    console.error("Assign free session error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
