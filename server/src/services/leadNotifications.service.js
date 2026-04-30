import User from "../models/User.js";
import {
  sendWhatsAppTemplate,
  sendWhatsAppText,
} from "./whatsapp.service.js";
import { sendBrevoEmail } from "./brevoEmail.service.js";

const getNotificationConfig = () => ({
  followUpTemplateName: process.env.WHATSAPP_TEMPLATE_FOLLOW_UP || "",
  busyCallReminderTemplateName:
    process.env.WHATSAPP_TEMPLATE_BUSY_CALL_REMINDER ||
    process.env.WHATSAPP_TEMPLATE_FOLLOW_UP ||
    "",
  instructorAssignTemplateName:
    process.env.WHATSAPP_TEMPLATE_INSTRUCTOR_ASSIGN || "",
  instructorSessionReminderTemplateName:
    process.env.WHATSAPP_TEMPLATE_INSTRUCTOR_SESSION_REMINDER || "",
  parentWelcomeTemplateName:
    process.env.WHATSAPP_TEMPLATE_PARENT_WELCOME || "",
  parentFreeSessionAssignedTemplateName:
    process.env.WHATSAPP_TEMPLATE_PARENT_FREE_SESSION_ASSIGNED || "",
  parentSessionReminderTemplateName:
    process.env.WHATSAPP_TEMPLATE_PARENT_SESSION_REMINDER || "",
  defaultTemplateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US",
  // Keep WHATSAPP_TEMPLATE_DEFAULT for the manual test endpoint only.
  // Automation should not fall back to hello_world because it sends Meta's test copy.
  automationTemplateFallback:
    process.env.WHATSAPP_TEMPLATE_AUTOMATION_FALLBACK || "",
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
      timeZone: "Africa/Cairo",
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

const formatCairoDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      timeZone: "Africa/Cairo",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const formatCairoTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleTimeString("en-US", {
      timeZone: "Africa/Cairo",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return value;
  }
};

const formatCairoWeekday = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("ar-EG", {
      timeZone: "Africa/Cairo",
      weekday: "long",
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

const namedTemplateParam = (name, value) => ({ name, value });
const valueOrDash = (value) => {
  const text = `${value ?? ""}`.trim();
  return text || "-";
};

const buildSalesFollowUpBody = (lead, followUpAt = new Date()) =>
  [
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
    `${formatCairoDateTime(followUpAt)}`,
  ].join("\n");

const buildSalesFollowUpParams = (lead, followUpAt = new Date()) => [
  namedTemplateParam("parent_name", valueOrDash(lead.parentName)),
  namedTemplateParam("parent_phone", valueOrDash(lead.phone)),
  namedTemplateParam("child_name", valueOrDash(lead.childName)),
  namedTemplateParam("child_age", valueOrDash(lead.childAge)),
  namedTemplateParam("lead_status", valueOrDash(lead.status || "Follow-up")),
  namedTemplateParam("follow_up_time", formatCairoDateTime(followUpAt)),
];

const buildSalesBusyCallReminderBody = (lead, callAt = new Date()) =>
  [
    "Call-later reminder",
    "",
    "Parent name:",
    `${lead.parentName || "-"}`,
    "",
    "Parent phone:",
    `${lead.phone || "-"}`,
    "",
    "Child name:",
    `${lead.childName || "-"}`,
    "",
    "Child age:",
    `${lead.childAge || "-"}`,
    "",
    "Call time:",
    `${formatCairoDateTime(callAt)}`,
    "",
    "Latest notes:",
    extractLatestNotes(lead),
  ].join("\n");

const buildSalesBusyCallReminderParams = (lead, callAt = new Date()) => [
  namedTemplateParam("parent_name", valueOrDash(lead.parentName)),
  namedTemplateParam("parent_phone", valueOrDash(lead.phone)),
  namedTemplateParam("child_name", valueOrDash(lead.childName)),
  namedTemplateParam("child_age", valueOrDash(lead.childAge)),
  namedTemplateParam("lead_status", valueOrDash(lead.status || "Busy Call Later")),
  namedTemplateParam("follow_up_time", formatCairoDateTime(callAt)),
  namedTemplateParam("call_time", formatCairoDateTime(callAt)),
];

const buildInstructorFreeSessionAssignedBody = (lead, instructor) =>
  [
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

const buildInstructorFreeSessionAssignedParams = (lead, instructor) => [
  namedTemplateParam("parent_name", valueOrDash(lead.parentName)),
  namedTemplateParam("parent_phone", valueOrDash(lead.phone)),
  namedTemplateParam("child_name", valueOrDash(lead.childName)),
  namedTemplateParam("child_age", valueOrDash(lead.childAge)),
  namedTemplateParam(
    "session_time",
    formatCairoDateTime(lead?.freeSession?.scheduledAt)
  ),
  namedTemplateParam("instructor_name", valueOrDash(instructor.name)),
  namedTemplateParam("lead_notes", valueOrDash(extractLatestNotes(lead))),
];

const buildInstructorSessionReminderBody = (lead, instructor) =>
  [
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

const buildInstructorSessionReminderParams = (lead, instructor) => [
  namedTemplateParam("parent_name", valueOrDash(lead.parentName)),
  namedTemplateParam("parent_phone", valueOrDash(lead.phone)),
  namedTemplateParam("child_name", valueOrDash(lead.childName)),
  namedTemplateParam("child_age", valueOrDash(lead.childAge)),
  namedTemplateParam(
    "session_time",
    formatCairoDateTime(lead?.freeSession?.scheduledAt)
  ),
  namedTemplateParam("instructor_name", valueOrDash(instructor.name)),
  namedTemplateParam("lead_notes", valueOrDash(extractLatestNotes(lead))),
];

const resolveSalesRecipient = async (
  lead,
  fallbackSalesUser = null,
  config = getNotificationConfig()
) => {
  if (lead?.callLater?.scheduledBy) {
    const scheduledBy = await User.findById(lead.callLater.scheduledBy)
      .select("name phone email role")
      .lean();
    if (
      (scheduledBy?.phone || scheduledBy?.email) &&
      ["agent", "admin"].includes(scheduledBy.role)
    ) {
      return {
        id: scheduledBy._id?.toString(),
        name: scheduledBy.name || "Sales",
        phone: scheduledBy.phone,
        email: scheduledBy.email || "",
      };
    }
  }

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
 *   2. Optional automation fallback template
 *   3. Free-form text (only works inside the 24-hour window)
 *
 * Template bodies should use named variables that match templateBodyParams.
 * Keep text before and after variables to satisfy Meta template validation.
 */
const sendNotification = async ({
  phone,
  customTemplateName,
  templateLanguage,
  templateBodyParams,
  textBody,
  config,
  sendTextAfterTemplate = true,
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
      // Send formatted details as a follow-up text so the message shape stays readable.
      if (sendTextAfterTemplate && textBody) {
        await sendWhatsAppText({ to: phone, body: textBody });
      }

      return templateResult;
    }
  }

  // ── 2. Optional automation fallback template ──
  if (config.automationTemplateFallback) {
    const fallbackResult = await sendWhatsAppTemplate({
      to: phone,
      templateName: config.automationTemplateFallback,
      languageCode: templateLanguage,
      bodyParams: templateBodyParams,
    });
    if (fallbackResult?.sent) {
      // Also try to send the detailed text for extra context (best-effort, within 24h window)
      if (sendTextAfterTemplate && textBody) {
        await sendWhatsAppText({ to: phone, body: textBody });
      }

      return fallbackResult;
    }
  }

  // ── 3. Free-form text (last resort – only works inside 24h window) ──
  if (textBody) {
    const textResult = await sendWhatsAppText({ to: phone, body: textBody });
    if (textResult?.sent) {
      return textResult;
    }
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
    return { sent: false, skipped: true, reason: "missing_sales_recipient" };
  }

  const followUpAt = new Date();
  const textBody = buildSalesFollowUpBody(lead, followUpAt);

  const result = await sendNotification({
    phone: recipient.phone,
    customTemplateName: config.followUpTemplateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: buildSalesFollowUpParams(lead, followUpAt),
    textBody,
    config,
    sendTextAfterTemplate: false,
  });

  const emailResult = await sendNotificationEmail({
    toEmail: recipient.email,
    toName: recipient.name,
    subject: `Follow-up reminder: ${lead.parentName || "Lead"}`,
    textBody,
    title: "Sales Follow-up Reminder",
  });
  if (!emailResult?.sent && !emailResult?.skipped) {
    console.warn("[brevo][follow-up] notification not sent");
  }

  return combineChannelResults(result, emailResult);
};

export const notifySalesBusyCallReminder = async ({
  lead,
  fallbackSalesUser = null,
}) => {
  const config = getNotificationConfig();
  const recipient = await resolveSalesRecipient(lead, fallbackSalesUser, config);
  if (!recipient) {
    return { sent: false, skipped: true, reason: "missing_sales_recipient" };
  }

  const callAt = lead?.callLater?.scheduledAt || new Date();
  const textBody = buildSalesBusyCallReminderBody(lead, callAt);
  const recipientPhone = recipient.phone || config.defaultSalesPhone;
  if (!recipientPhone) {
    return { sent: false, skipped: true, reason: "missing_sales_phone" };
  }

  const result = await sendNotification({
    phone: recipientPhone,
    customTemplateName: config.busyCallReminderTemplateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: buildSalesBusyCallReminderParams(lead, callAt),
    textBody,
    config,
    sendTextAfterTemplate: false,
  });

  return {
    sent: Boolean(result?.sent),
    whatsappSent: Boolean(result?.sent),
    whatsapp: result,
  };
};

const buildParentWelcomeBody = () =>
  [
    "أهلا بيك أنا كيدفتي من عائلة Sparvi وهكون المساعد الشخصي لحضرتك 😊",
    "دوري هنا أذكر حضرتك بالمواعيد وابعتلك آخر تطورات المهندس الصغير🥰",
  ].join("\n");

const buildParentFreeSessionAssignedBody = (lead) =>
  [
    `تم تسجيل حصة تجريبية للمهندس الصغير يوم ${formatCairoWeekday(
      lead?.freeSession?.scheduledAt
    )} الساعة ${formatCairoTime(
      lead?.freeSession?.scheduledAt
    )} بتاريخ ${formatCairoDate(lead?.freeSession?.scheduledAt)}.`,
    "نتمنى يستمتع بيها ويتعلم مهارة جديدة💪",
  ].join("\n");

const buildParentFreeSessionAssignedParams = (lead) => [
  namedTemplateParam(
    "session_day",
    formatCairoWeekday(lead?.freeSession?.scheduledAt)
  ),
  namedTemplateParam(
    "session_time",
    formatCairoTime(lead?.freeSession?.scheduledAt)
  ),
  namedTemplateParam(
    "session_date",
    formatCairoDate(lead?.freeSession?.scheduledAt)
  ),
];

const buildParentSessionReminderBody = () =>
  [
    "أهلا بحضرتك أتمنى تكون بكل خير🥰",
    "بفكرك إن فيه سشن بعد ساعة. نتمنى الطفل يستمتع بيها ويتعلم مهارة جديدة النهارده💪",
    "المدرب هيتواصل مع حضرتك وهيبعت رابط دخول السشن خلال الساعة القادمة📩",
  ].join("\n");

const buildParentRoundSessionReminderBody = ({ session, round, enrollment }) => {
  const durationMinutes = Number(session.durationMinutes) || 120;
  const [startHour = 0, startMinute = 0] = `${session.time || "00:00"}`
    .split(":")
    .map((part) => Number(part));
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = startTotalMinutes + durationMinutes;
  const endHour = String(Math.floor((endTotalMinutes / 60) % 24)).padStart(2, "0");
  const endMinute = String(endTotalMinutes % 60).padStart(2, "0");
  const sessionDate = new Date(`${session.date}T00:00:00`);
  const sessionDay = Number.isNaN(sessionDate.getTime())
    ? "-"
    : sessionDate.toLocaleDateString("en-US", { weekday: "long" });
  const sessionDateLabel = Number.isNaN(sessionDate.getTime())
    ? session.date || "-"
    : sessionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return [
    `Reminder: ${enrollment?.childName || "your child"} has an upcoming Sparvi Lab session in about 1 hour.`,
    "",
    `Round: ${round?.name || "-"}`,
    `Session: ${session?.title || "-"}`,
    `Day: ${sessionDay}`,
    `Date: ${sessionDateLabel}`,
    `Time: ${session.time || "-"} - ${endHour}:${endMinute}`,
    `Duration: ${durationMinutes / 60} hours`,
    "",
    "Please be ready before the session starts.",
  ].join("\n");
};

const sendParentWhatsApp = async ({
  phone,
  templateName,
  templateBodyParams = [],
  textBody,
  config,
}) =>
  sendNotification({
    phone,
    customTemplateName: templateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams,
    textBody,
    config,
    sendTextAfterTemplate: false,
  });

const createWhatsAppTestLead = (phone) => {
  const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return {
    parentName: "ولي الأمر التجريبي",
    phone,
    childName: "المهندس الصغير",
    childAge: 8,
    status: "Follow-up",
    notes: [
      {
        text: "مهتم بتجربة الحصة ومعرفة مستوى الطفل.",
        createdAt: new Date(),
      },
    ],
    freeSession: {
      scheduledAt,
    },
    callLater: {
      scheduledAt,
    },
  };
};

const createWhatsAppTestInstructor = (phone) => ({
  name: "مدرب Kidvity",
  phone,
  email: "instructor@example.com",
});

const WHATSAPP_AUTOMATION_TEST_LABELS = {
  sales_follow_up: "Sales follow-up",
  busy_call_reminder: "Busy call later reminder",
  instructor_assignment: "Instructor assignment",
  instructor_reminder: "Instructor 1-hour reminder",
  parent_welcome: "Parent welcome",
  parent_assignment: "Parent free-session booking",
  parent_reminder: "Parent 1-hour reminder",
};

export const sendWhatsAppAutomationTest = async ({ type, phone }) => {
  const config = getNotificationConfig();
  const label = WHATSAPP_AUTOMATION_TEST_LABELS[type] || "";
  if (!label) {
    return { sent: false, skipped: true, reason: "invalid_automation_test_type" };
  }

  const lead = createWhatsAppTestLead(phone);
  const instructor = createWhatsAppTestInstructor(phone);
  let result = null;

  if (type === "sales_follow_up") {
    const followUpAt = new Date();
    const textBody = buildSalesFollowUpBody(lead, followUpAt);
    result = await sendNotification({
      phone,
      customTemplateName: config.followUpTemplateName,
      templateLanguage: config.defaultTemplateLanguage,
      templateBodyParams: buildSalesFollowUpParams(lead, followUpAt),
      textBody,
      config,
      sendTextAfterTemplate: false,
    });
  }

  if (type === "busy_call_reminder") {
    const callAt = lead.callLater.scheduledAt;
    const textBody = buildSalesBusyCallReminderBody(lead, callAt);
    result = await sendNotification({
      phone,
      customTemplateName: config.busyCallReminderTemplateName,
      templateLanguage: config.defaultTemplateLanguage,
      templateBodyParams: buildSalesBusyCallReminderParams(lead, callAt),
      textBody,
      config,
      sendTextAfterTemplate: false,
    });
  }

  if (type === "instructor_assignment") {
    const textBody = buildInstructorFreeSessionAssignedBody(lead, instructor);
    result = await sendNotification({
      phone,
      customTemplateName: config.instructorAssignTemplateName,
      templateLanguage: config.defaultTemplateLanguage,
      templateBodyParams: buildInstructorFreeSessionAssignedParams(
        lead,
        instructor
      ),
      textBody,
      config,
      sendTextAfterTemplate: false,
    });
  }

  if (type === "instructor_reminder") {
    const textBody = buildInstructorSessionReminderBody(lead, instructor);
    result = await sendNotification({
      phone,
      customTemplateName: config.instructorSessionReminderTemplateName,
      templateLanguage: config.defaultTemplateLanguage,
      templateBodyParams: buildInstructorSessionReminderParams(
        lead,
        instructor
      ),
      textBody,
      config,
      sendTextAfterTemplate: false,
    });
  }

  if (type === "parent_welcome") {
    const textBody = buildParentWelcomeBody();
    result = await sendParentWhatsApp({
      phone,
      templateName: config.parentWelcomeTemplateName,
      templateBodyParams: [],
      textBody,
      config,
    });
  }

  if (type === "parent_assignment") {
    const textBody = buildParentFreeSessionAssignedBody(lead);
    result = await sendParentWhatsApp({
      phone,
      templateName: config.parentFreeSessionAssignedTemplateName,
      templateBodyParams: buildParentFreeSessionAssignedParams(lead),
      textBody,
      config,
    });
  }

  if (type === "parent_reminder") {
    const textBody = buildParentSessionReminderBody();
    result = await sendParentWhatsApp({
      phone,
      templateName: config.parentSessionReminderTemplateName,
      templateBodyParams: [],
      textBody,
      config,
    });
  }

  return {
    ...result,
    label,
    type,
  };
};

export const notifyParentFreeSessionAssigned = async ({
  lead,
  shouldSendWelcome = false,
}) => {
  const config = getNotificationConfig();
  if (!lead?.phone) {
    return { sent: false, skipped: true, reason: "missing_parent_phone" };
  }

  let welcomeResult = null;
  if (shouldSendWelcome) {
    const welcomeBody = buildParentWelcomeBody();
    welcomeResult = await sendParentWhatsApp({
      phone: lead.phone,
      templateName: config.parentWelcomeTemplateName,
      templateBodyParams: [],
      textBody: welcomeBody,
      config,
    });
  }

  const assignmentBody = buildParentFreeSessionAssignedBody(lead);
  const assignmentResult = await sendParentWhatsApp({
    phone: lead.phone,
    templateName: config.parentFreeSessionAssignedTemplateName,
    templateBodyParams: buildParentFreeSessionAssignedParams(lead),
    textBody: assignmentBody,
    config,
  });

  return {
    sent: Boolean(welcomeResult?.sent || assignmentResult?.sent),
    welcomeSent: Boolean(welcomeResult?.sent),
    assignmentSent: Boolean(assignmentResult?.sent),
    welcomeSkipped: !shouldSendWelcome,
    welcome: welcomeResult,
    assignment: assignmentResult,
  };
};

export const notifyParentSessionReminder = async ({ lead }) => {
  const config = getNotificationConfig();
  if (!lead?.phone) {
    return { sent: false, skipped: true, reason: "missing_parent_phone" };
  }

  const reminderBody = buildParentSessionReminderBody();
  const reminderResult = await sendParentWhatsApp({
    phone: lead.phone,
    templateName: config.parentSessionReminderTemplateName,
    templateBodyParams: [],
    textBody: reminderBody,
    config,
  });

  return {
    sent: Boolean(reminderResult?.sent),
    reminderSent: Boolean(reminderResult?.sent),
    reminder: reminderResult,
  };
};

export const notifyParentRoundSessionReminder = async ({
  parent,
  enrollment,
  session,
  round,
}) => {
  const config = getNotificationConfig();
  const phone = parent?.phone || enrollment?.phone;
  if (!phone) {
    return { sent: false, skipped: true, reason: "missing_parent_phone" };
  }

  const reminderBody = buildParentRoundSessionReminderBody({
    session,
    round,
    enrollment,
  });

  const reminderResult = await sendNotification({
    phone,
    customTemplateName: config.parentSessionReminderTemplateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: [],
    textBody: reminderBody,
    config,
    sendTextAfterTemplate: true,
  });

  return {
    sent: Boolean(reminderResult?.sent),
    reminderSent: Boolean(reminderResult?.sent),
    reminder: reminderResult,
  };
};

export const notifyInstructorFreeSessionAssigned = async ({
  lead,
  instructor,
}) => {
  const config = getNotificationConfig();
  if (!instructor?.phone && !instructor?.email) {
    return { sent: false, skipped: true, reason: "missing_instructor_phone_and_email" };
  }

  const textBody = buildInstructorFreeSessionAssignedBody(lead, instructor);

  const result = await sendNotification({
    phone: instructor.phone,
    customTemplateName: config.instructorAssignTemplateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: buildInstructorFreeSessionAssignedParams(
      lead,
      instructor
    ),
    textBody,
    config,
    sendTextAfterTemplate: false,
  });

  const emailResult = await sendNotificationEmail({
    toEmail: instructor.email || "",
    toName: instructor.name || "",
    subject: `New free session assigned: ${lead.childName || "-"}`,
    textBody,
    title: "Free Session Assigned",
  });
  if (!emailResult?.sent && !emailResult?.skipped) {
    console.warn("[brevo][assign] notification not sent");
  }

  return combineChannelResults(result, emailResult);
};

export const notifyInstructorSessionReminder = async ({
  lead,
  instructor,
}) => {
  const config = getNotificationConfig();
  if (!instructor?.phone && !instructor?.email) {
    return { sent: false, skipped: true, reason: "missing_instructor_phone_and_email" };
  }

  const textBody = buildInstructorSessionReminderBody(lead, instructor);

  const result = await sendNotification({
    phone: instructor.phone,
    customTemplateName: config.instructorSessionReminderTemplateName,
    templateLanguage: config.defaultTemplateLanguage,
    templateBodyParams: buildInstructorSessionReminderParams(lead, instructor),
    textBody,
    config,
    sendTextAfterTemplate: false,
  });

  const emailResult = await sendNotificationEmail({
    toEmail: instructor.email || "",
    toName: instructor.name || "",
    subject: `Session reminder (1 hour): ${lead.childName || "-"}`,
    textBody,
    title: "Upcoming Session Reminder",
  });
  if (!emailResult?.sent && !emailResult?.skipped) {
    console.warn("[brevo][reminder] notification not sent");
  }

  return combineChannelResults(result, emailResult);
};
