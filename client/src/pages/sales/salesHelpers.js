export const LEAD_STATUSES = [
  "New",
  "Reserved Later",
  "Busy Call Later",
  "Demo Booked",
  "Follow-up",
  "Closed - Won",
  "Closed - Lost",
];

export const statusPill = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Reserved Later": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Demo Booked": "bg-violet-50 text-violet-700 border-violet-200",
  "Follow-up": "bg-amber-50 text-amber-700 border-amber-200",
  "Busy Call Later": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Closed - Won": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closed - Lost": "bg-rose-50 text-rose-700 border-rose-200",
};

export const normalizeLeadStatus = (status) => {
  if (status === "Contacted") return "Reserved Later";
  return status || "New";
};

export const toWhatsAppLink = (phone) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const normalizedDigits = digits.startsWith("20")
    ? digits
    : digits.startsWith("0")
      ? `20${digits.slice(1)}`
      : digits;
  return `https://web.whatsapp.com/send?phone=${normalizedDigits}`;
};

export const toWhatsAppMessageLink = (phone, message = "") => {
  const baseLink = toWhatsAppLink(phone);
  if (!baseLink) return "";
  const trimmedMessage = (message || "").trim();
  if (!trimmedMessage) return baseLink;
  return `${baseLink}&text=${encodeURIComponent(trimmedMessage)}`;
};

export const CUSTOM_WHATSAPP_MESSAGES_STORAGE_KEY = "sparvi_custom_whatsapp_messages";

export const normalizeCustomWhatsAppMessages = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((message) => ({
      id: (message?.id || "").toString(),
      title: (message?.title || "").toString().trim(),
      body: (message?.body || "").toString().trim(),
      createdAt: message?.createdAt || "",
    }))
    .filter((message) => message.id && message.title && message.body);
};

export const loadCustomWhatsAppMessages = () => {
  try {
    return normalizeCustomWhatsAppMessages(
      JSON.parse(localStorage.getItem(CUSTOM_WHATSAPP_MESSAGES_STORAGE_KEY) || "[]")
    );
  } catch {
    return [];
  }
};

export const saveCustomWhatsAppMessages = (messages) => {
  localStorage.setItem(
    CUSTOM_WHATSAPP_MESSAGES_STORAGE_KEY,
    JSON.stringify(normalizeCustomWhatsAppMessages(messages))
  );
};

export const fillWhatsAppMessageTemplate = (template, lead = {}) => {
  const values = {
    parentName: lead.parentName || "",
    childName: lead.childName || "",
    childAge: lead.childAge || "",
    phone: lead.phone || "",
    status: lead.status || "New",
    source: lead.source || "",
  };

  return (template || "").replace(/\{(parentName|childName|childAge|phone|status|source)\}/g, (_, key) =>
    values[key]
  );
};

const padDatePart = (value) => String(value).padStart(2, "0");
const DATE_KEY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const DASHBOARD_DATE_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const DASHBOARD_DATE_TIME_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})[\sT]+(\d{1,2}):(\d{2})$/;

const parseDateValue = (value) => {
  if (!value) return null;
  try {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

export const formatDate = (value) => {
  const date = parseDateValue(value);
  if (!date) return value || "-";
  return `${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatDateKey = (value) => {
  const match = `${value || ""}`.match(DATE_KEY_REGEX);
  if (!match) return formatDate(value);
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
};

export const parseDashboardDateInput = (value) => {
  const raw = `${value || ""}`.trim();
  const dashboardMatch = raw.match(DASHBOARD_DATE_REGEX);
  const isoMatch = raw.match(DATE_KEY_REGEX);
  const parts = dashboardMatch
    ? { day: dashboardMatch[1], month: dashboardMatch[2], year: dashboardMatch[3] }
    : isoMatch
      ? { year: isoMatch[1], month: isoMatch[2], day: isoMatch[3] }
      : null;

  if (!parts) return "";

  const day = Number(parts.day);
  const month = Number(parts.month);
  const year = Number(parts.year);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
};

export const parseDashboardDateTimeInput = (value) => {
  const raw = `${value || ""}`.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) return raw;

  const match = raw.match(DASHBOARD_DATE_TIME_REGEX);
  if (!match) return "";

  const [, day, month, year, hour, minute] = match;
  const dateKey = parseDashboardDateInput(`${day}/${month}/${year}`);
  if (!dateKey) return "";

  const hours = Number(hour);
  const minutes = Number(minute);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";

  return `${dateKey}T${padDatePart(hours)}:${padDatePart(minutes)}`;
};

export const formatTime = (value) => {
  const date = parseDateValue(value);
  if (!date) return value || "-";
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
};

export const formatDateTime = (value) => {
  const date = parseDateValue(value);
  if (!date) return value || "-";
  return `${formatDate(date)} ${formatTime(date)}`;
};
