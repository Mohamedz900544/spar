import User from "../models/User.js";
import {
  normalizePhoneForWhatsApp,
  sendWhatsAppTemplate,
  sendWhatsAppText,
} from "./whatsapp.service.js";
import { sendBrevoEmail } from "./brevoEmail.service.js";

const getNotificationConfig = () => ({
  followUpTemplateName: process.env.WHATSAPP_TEMPLATE_FOLLOW_UP || "",
  instructorAssignTemplateName:
    process.env.WHATSAPP_TEMPLATE_INSTRUCTOR_ASSIGN || "",
  defaultTemplateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US",
  defaultTemplateFallback: process.env.WHATSAPP_TEMPLATE_DEFAULT || "hello_world",
  defaultSalesPhone: process.env.WHATSAPP_DEFAULT_SALES_PHONE || "",
  defaultSalesEmail: process.env.BREVO_DEFAULT_SALES_EMAIL || "",
});

const escapeHtml = (value = "") =>
  `${value}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toHtmlFromText = (text, title = "Notification") => {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(text || "").replace(/\n/g, "<br />");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #102a5a; color: #ffffff; padding: 14px 16px; font-size: 16px; font-weight: 700;">
        ${safeTitle}
      </div>
      <div style="padding: 16px; color: #0f172a; line-height: 1.6; font-size: 14px;">
        ${safeBody}
      </div>
    </div>
  `;
};

const sendNotificationEmail = async ({
  toEmail,
  toName,
  subject,
  textBody,
  title,
}) => {
  if (!toEmail) {
    return { sent: false, skipped: true, reason: "missing_recipient_email" };
  }

  return sendBrevoEmail({
    to: toEmail,
    toName: toName || "",
    subject,
    textContent: textBody,
    htmlContent: toHtmlFromText(textBody, title),
  });
};

const combineChannelResults = (whatsappResult, emailResult) => ({
  sent: Boolean(whatsappResult?.sent || emailResult?.sent),
  whatsappSent: Boolean(whatsappResult?.sent),
  emailSent: Boolean(emailResult?.sent),
  whatsapp: whatsappResult,
  email: emailResult,
});

const formatCairoDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return value;
  }
};

const extractLatestNotes = (lead) => {
  const notes = Array.isArray(lead?.notes) ? [...lead.notes] : [];
  if (!notes.length) return "لا يوجد ملاحظات";

  return notes
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3)
    .map((note, index) => `${index + 1}) ${note.text || ""}`)
    .join("\n");
};

const resolveSalesRecipient = async (
  lead,
  fallbackSalesUser = null,
  config = getNotificationConfig()
) => {
  if (lead?.createdBy) {
    const owner = await User.findById(lead.createdBy)
      .select("name phone email role")
      .lean();
    if ((owner?.phone || owner?.email) && ["agent", "admin"].includes(owner.role)) {
      return {
        id: owner._id?.toString(),
        name: owner.name || "Sales",
        phone: owner.phone,
        email: owner.email || "",
      };
    }
  }

  if (
    (fallbackSalesUser?.phone || fallbackSalesUser?.email) &&
    ["agent", "admin"].includes(fallbackSalesUser?.role || "")
  ) {
    return {
      id: fallbackSalesUser._id?.toString(),
      name: fallbackSalesUser.name || "Sales",
      phone: fallbackSalesUser.phone,
      email: fallbackSalesUser.email || "",
    };
  }

  if (lead?.freeSession?.assignedBy) {
    const assignedBy = await User.findById(lead.freeSession.assignedBy)
      .select("name phone email role")
      .lean();
    if (
      (assignedBy?.phone || assignedBy?.email) &&
      ["agent", "admin"].includes(assignedBy.role)
    ) {
      return {
        id: assignedBy._id?.toString(),
        name: assignedBy.name || "Sales",
        phone: assignedBy.phone,
        email: assignedBy.email || "",
      };
    }
  }

  if (config.defaultSalesPhone || config.defaultSalesEmail) {
    return {
      id: null,
      name: "Default Sales",
      phone: config.defaultSalesPhone,
      email: config.defaultSalesEmail,
    };
  }

  return null;
};

/**
 * Sends a WhatsApp notification trying the most reliable method first:
 *   1. Custom template (if configured)
 *   2. Default template fallback (hello_world – known to work)
 *   3. Free-form text (only works inside the 24-hour window)
 */
const sendNotification = async ({
  phone,
  customTemplateName,
  templateLanguage,
  templateBodyParams,
  textBody,
  config,
  logPrefix,
}) => {
  // ── 1. Custom template ──
  if (customTemplateName) {
    const templateResult = await sendWhatsAppTemplate({
      to: phone,
      templateName: customTemplateName,
      languageCode: templateLanguage,
      bodyParams: templateBodyParams,
    });
    if (templateResult?.sent) {
      console.log(`[whatsapp][${logPrefix}] custom template sent to ${normalizePhoneForWhatsApp(phone)}`);

      // Send formatted details as a follow-up text so the message shape stays readable.
      if (textBody) {
        const textResult = await sendWhatsAppText({ to: phone, body: textBody });
        if (textResult?.sent) {
          console.log(`[whatsapp][${logPrefix}] follow-up text also sent`);
        } else {
          console.warn(`[whatsapp][${logPrefix}] follow-up text failed after custom template:`, textResult);
        }
      }

      return templateResult;
    }
    console.warn(`[whatsapp][${logPrefix}] custom template failed:`, templateResult);
  }

  // ── 2. Default template fallback (hello_world) ──
  if (config.defaultTemplateFallback) {
    const fallbackResult = await sendWhatsAppTemplate({
      to: phone,
      templateName: config.defaultTemplateFallback,
      languageCode: templateLanguage,
    });
    if (fallbackResult?.sent) {
      console.log(`[whatsapp][${logPrefix}] default template (${config.defaultTemplateFallback}) sent to ${normalizePhoneForWhatsApp(phone)}`);

      // Also try to send the detailed text for extra context (best-effort, within 24h window)
      if (textBody) {
        const textResult = await sendWhatsAppText({ to: phone, body: textBody });
        if (textResult?.sent) {
          console.log(`[whatsapp][${logPrefix}] follow-up text also sent`);
        }
      }

      return fallbackResult;
    }
    console.warn(`[whatsapp][${logPrefix}] default template fallback failed:`, fallbackResult);
  }

  // ── 3. Free-form text (last resort – only works inside 24h window) ──
  if (textBody) {
    const textResult = await sendWhatsAppText({ to: phone, body: textBody });
    if (textResult?.sent) {
      console.log(`[whatsapp][${logPrefix}] text message sent to ${normalizePhoneForWhatsApp(phone)}`);
      return textResult;
    }
    console.warn(`[whatsapp][${logPrefix}] text message also failed:`, textResult);
    return textResult;
  }

  return { sent: false, error: "all_methods_failed" };
};

export const notifySalesFollowUpReminder = async ({
  lead,
  fallbackSalesUser = null,
}) => {
  const config = getNotificationConfig();
  const recipient = await resolveSalesRecipient(lead, fallbackSalesUser, config);
  if (!recipient) {
    console.warn("[whatsapp][follow-up] skipped – no sales recipient found for lead:", lead?._id || lead?.id);
    return { sent: false, skipped: true, reason: "missing_sales_recipient" };
  }

  console.log("[whatsapp][follow-up] sending to:", {
    recipientName: recipient.name,
    recipientPhone: recipient.phone,
    leadId: lead?._id || lead?.id,
  });

  const textBody = [
    "تذكير متابعة عميل",
    "",
    "اسم ولي الأمر:",
    `${lead.parentName || "-"}`,
    "",
    "رقم ولي الأمر:",
    `${lead.phone || "-"}`,
    "",
    "اسم الطفل:",
    `${lead.childName || "-"}`,
    "",
    "سن الطفل:",
    `${lead.childAge || "-"}`,
    "",
    "الحالة الحالية:",
    `${lead.status || "Follow-up"}`,
    "",
    "موعد المتابعة:",
    `${formatCairoDateTime(new Date())}`,
  ].join("\n");

  const result = await sendNotification({
    phone: recipient.phone,
    customTemplateName: config.followUpTemplateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: [
      lead.parentName || "-",
      lead.phone || "-",
      lead.childName || "-",
      `${lead.childAge || "-"}`,
      "Follow-up",
      formatCairoDateTime(new Date()),
    ],
    textBody,
    config,
    logPrefix: "follow-up",
  });

  if (!result?.sent) {
    console.warn("[whatsapp][follow-up] NOT sent:", result);
  }

  const emailResult = await sendNotificationEmail({
    toEmail: recipient.email,
    toName: recipient.name,
    subject: `Follow-up reminder: ${lead.parentName || "Lead"}`,
    textBody,
    title: "Sales Follow-up Reminder",
  });
  if (!emailResult?.sent && !emailResult?.skipped) {
    console.warn("[brevo][follow-up] NOT sent:", emailResult);
  }

  return combineChannelResults(result, emailResult);
};

export const notifyInstructorFreeSessionAssigned = async ({
  lead,
  instructor,
}) => {
  const config = getNotificationConfig();
  if (!instructor?.phone && !instructor?.email) {
    console.warn("[whatsapp][assign] skipped – instructor has no phone:", instructor?.name || instructor?._id);
    return { sent: false, skipped: true, reason: "missing_instructor_phone_and_email" };
  }

  console.log("[whatsapp][assign] sending to instructor:", {
    instructorName: instructor.name,
    instructorPhone: instructor.phone,
    leadId: lead?._id || lead?.id,
  });

  const textBody = [
    "تم تعيين حصة مجانية جديدة",
    "",
    "اسم ولي الأمر:",
    `${lead.parentName || "-"}`,
    "",
    "رقم ولي الأمر:",
    `${lead.phone || "-"}`,
    "",
    "اسم الطفل:",
    `${lead.childName || "-"}`,
    "",
    "سن الطفل:",
    `${lead.childAge || "-"}`,
    "",
    "موعد الحصة:",
    `${formatCairoDateTime(lead?.freeSession?.scheduledAt)}`,
    "",
    "اسم المدرب:",
    `${instructor.name || "-"}`,
    "",
    "ملاحظات العميل:",
    extractLatestNotes(lead),
  ].join("\n");

  const result = await sendNotification({
    phone: instructor.phone,
    customTemplateName: config.instructorAssignTemplateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: [
      lead.parentName || "-",
      lead.phone || "-",
      lead.childName || "-",
      `${lead.childAge || "-"}`,
      formatCairoDateTime(lead?.freeSession?.scheduledAt),
      instructor.name || "-",
      extractLatestNotes(lead),
    ],
    textBody,
    config,
    logPrefix: "assign",
  });

  if (!result?.sent) {
    console.warn("[whatsapp][assign] NOT sent:", result);
  }

  const emailResult = await sendNotificationEmail({
    toEmail: instructor.email || "",
    toName: instructor.name || "",
    subject: `New free session assigned: ${lead.childName || "-"}`,
    textBody,
    title: "Free Session Assigned",
  });
  if (!emailResult?.sent && !emailResult?.skipped) {
    console.warn("[brevo][assign] NOT sent:", emailResult);
  }

  return combineChannelResults(result, emailResult);
};

export const notifyInstructorSessionReminder = async ({
  lead,
  instructor,
}) => {
  const config = getNotificationConfig();
  if (!instructor?.phone && !instructor?.email) {
    console.warn("[whatsapp][reminder] skipped – instructor has no phone:", instructor?.name || instructor?._id);
    return { sent: false, skipped: true, reason: "missing_instructor_phone_and_email" };
  }

  console.log("[whatsapp][reminder] sending 1-hour reminder to instructor:", {
    instructorName: instructor.name,
    instructorPhone: instructor.phone,
    leadId: lead?._id || lead?.id,
    scheduledAt: lead?.freeSession?.scheduledAt,
  });

  const textBody = [
    "⏰ تذكير: لديك حصة مجانية بعد ساعة",
    "",
    "اسم ولي الأمر:",
    `${lead.parentName || "-"}`,
    "",
    "رقم ولي الأمر:",
    `${lead.phone || "-"}`,
    "",
    "اسم الطفل:",
    `${lead.childName || "-"}`,
    "",
    "سن الطفل:",
    `${lead.childAge || "-"}`,
    "",
    "موعد الحصة:",
    `${formatCairoDateTime(lead?.freeSession?.scheduledAt)}`,
    "",
    "اسم المدرب:",
    `${instructor.name || "-"}`,
    "",
    "ملاحظات العميل:",
    extractLatestNotes(lead),
  ].join("\n");

  const result = await sendNotification({
    phone: instructor.phone,
    customTemplateName: "",
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: [],
    textBody,
    config,
    logPrefix: "reminder",
  });

  if (!result?.sent) {
    console.warn("[whatsapp][reminder] NOT sent:", result);
  }

  const emailResult = await sendNotificationEmail({
    toEmail: instructor.email || "",
    toName: instructor.name || "",
    subject: `Session reminder (1 hour): ${lead.childName || "-"}`,
    textBody,
    title: "Upcoming Session Reminder",
  });
  if (!emailResult?.sent && !emailResult?.skipped) {
    console.warn("[brevo][reminder] NOT sent:", emailResult);
  }

  return combineChannelResults(result, emailResult);
};
