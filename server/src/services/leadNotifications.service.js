import User from "../models/User.js";
import {
  normalizePhoneForWhatsApp,
  sendWhatsAppTemplate,
  sendWhatsAppText,
} from "./whatsapp.service.js";

const getNotificationConfig = () => ({
  followUpTemplateName: process.env.WHATSAPP_TEMPLATE_FOLLOW_UP || "",
  instructorAssignTemplateName:
    process.env.WHATSAPP_TEMPLATE_INSTRUCTOR_ASSIGN || "",
  defaultTemplateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US",
  defaultTemplateFallback: process.env.WHATSAPP_TEMPLATE_DEFAULT || "hello_world",
  defaultSalesPhone: process.env.WHATSAPP_DEFAULT_SALES_PHONE || "",
});

const formatCairoDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
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
      .select("name phone role")
      .lean();
    if (owner?.phone && ["agent", "admin"].includes(owner.role)) {
      return {
        id: owner._id?.toString(),
        name: owner.name || "Sales",
        phone: owner.phone,
      };
    }
  }

  if (
    fallbackSalesUser?.phone &&
    ["agent", "admin"].includes(fallbackSalesUser?.role || "")
  ) {
    return {
      id: fallbackSalesUser._id?.toString(),
      name: fallbackSalesUser.name || "Sales",
      phone: fallbackSalesUser.phone,
    };
  }

  if (lead?.freeSession?.assignedBy) {
    const assignedBy = await User.findById(lead.freeSession.assignedBy)
      .select("name phone role")
      .lean();
    if (assignedBy?.phone && ["agent", "admin"].includes(assignedBy.role)) {
      return {
        id: assignedBy._id?.toString(),
        name: assignedBy.name || "Sales",
        phone: assignedBy.phone,
      };
    }
  }

  if (config.defaultSalesPhone) {
    return {
      id: null,
      name: "Default Sales",
      phone: config.defaultSalesPhone,
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
    `اسم ولي الأمر: ${lead.parentName || "-"}`,
    `رقم ولي الأمر: ${lead.phone || "-"}`,
    `اسم الطفل: ${lead.childName || "-"}`,
    `سن الطفل: ${lead.childAge || "-"}`,
    `الحالة الحالية: ${lead.status || "Follow-up"}`,
    `موعد المتابعة: ${formatCairoDateTime(new Date())}`,
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
  return result;
};

export const notifyInstructorFreeSessionAssigned = async ({
  lead,
  instructor,
}) => {
  const config = getNotificationConfig();
  if (!instructor?.phone) {
    console.warn("[whatsapp][assign] skipped – instructor has no phone:", instructor?.name || instructor?._id);
    return { sent: false, skipped: true, reason: "missing_instructor_phone" };
  }

  console.log("[whatsapp][assign] sending to instructor:", {
    instructorName: instructor.name,
    instructorPhone: instructor.phone,
    leadId: lead?._id || lead?.id,
  });

  const textBody = [
    "تم تعيين حصة مجانية جديدة",
    `اسم ولي الأمر: ${lead.parentName || "-"}`,
    `رقم ولي الأمر: ${lead.phone || "-"}`,
    `اسم الطفل: ${lead.childName || "-"}`,
    `سن الطفل: ${lead.childAge || "-"}`,
    `موعد الحصة: ${formatCairoDateTime(lead?.freeSession?.scheduledAt)}`,
    `اسم المدرب: ${instructor.name || "-"}`,
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
  return result;
};
