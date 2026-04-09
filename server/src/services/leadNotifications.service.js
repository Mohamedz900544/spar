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
  // "hello_world" is the default approved template in most WhatsApp test setups.
  defaultTemplateFallback: process.env.WHATSAPP_TEMPLATE_DEFAULT || "hello_world",
  defaultSalesPhone: process.env.WHATSAPP_DEFAULT_SALES_PHONE || "",
});

const formatCairoDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("ar-EG", {
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

export const notifySalesFollowUpReminder = async ({
  lead,
  fallbackSalesUser = null,
}) => {
  const config = getNotificationConfig();
  const recipient = await resolveSalesRecipient(lead, fallbackSalesUser, config);
  if (!recipient) {
    return { sent: false, skipped: true, reason: "missing_sales_recipient" };
  }

  const body = [
    "تذكير متابعة عميل",
    `اسم ولي الأمر: ${lead.parentName || "-"}`,
    `رقم ولي الأمر: ${lead.phone || "-"}`,
    `اسم الطفل: ${lead.childName || "-"}`,
    `سن الطفل: ${lead.childAge || "-"}`,
    `الحالة الحالية: ${lead.status || "Follow-up"}`,
    `موعد المتابعة: ${formatCairoDateTime(new Date())}`,
  ].join("\n");

  let result;
  if (config.followUpTemplateName) {
    result = await sendWhatsAppTemplate({
      to: normalizePhoneForWhatsApp(recipient.phone),
      templateName: config.followUpTemplateName,
      languageCode: config.defaultTemplateLanguage,
      bodyParams: [
        lead.parentName || "-",
        lead.phone || "-",
        lead.childName || "-",
        `${lead.childAge || "-"}`,
        "Follow-up",
        formatCairoDateTime(new Date()),
      ],
    });
  } else {
    result = await sendWhatsAppText({
      to: normalizePhoneForWhatsApp(recipient.phone),
      body,
    });
  }

  if (!result?.sent) {
    if (config.defaultTemplateFallback && !config.followUpTemplateName) {
      result = await sendWhatsAppTemplate({
        to: normalizePhoneForWhatsApp(recipient.phone),
        templateName: config.defaultTemplateFallback,
        languageCode: config.defaultTemplateLanguage,
      });
    }
  }

  if (!result?.sent) {
    console.warn("[whatsapp][follow-up] not sent:", result);
  }
  return result;
};

export const notifyInstructorFreeSessionAssigned = async ({
  lead,
  instructor,
}) => {
  const config = getNotificationConfig();
  if (!instructor?.phone) {
    return { sent: false, skipped: true, reason: "missing_instructor_phone" };
  }

  const body = [
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

  let result;
  if (config.instructorAssignTemplateName) {
    result = await sendWhatsAppTemplate({
      to: normalizePhoneForWhatsApp(instructor.phone),
      templateName: config.instructorAssignTemplateName,
      languageCode: config.defaultTemplateLanguage,
      bodyParams: [
        lead.parentName || "-",
        lead.phone || "-",
        lead.childName || "-",
        `${lead.childAge || "-"}`,
        formatCairoDateTime(lead?.freeSession?.scheduledAt),
        instructor.name || "-",
        extractLatestNotes(lead),
      ],
    });
  } else {
    result = await sendWhatsAppText({
      to: normalizePhoneForWhatsApp(instructor.phone),
      body,
    });
  }

  if (!result?.sent) {
    if (
      config.defaultTemplateFallback &&
      !config.instructorAssignTemplateName
    ) {
      result = await sendWhatsAppTemplate({
        to: normalizePhoneForWhatsApp(instructor.phone),
        templateName: config.defaultTemplateFallback,
        languageCode: config.defaultTemplateLanguage,
      });
    }
  }

  if (!result?.sent) {
    console.warn("[whatsapp][assign] not sent:", result);
  }
  return result;
};
