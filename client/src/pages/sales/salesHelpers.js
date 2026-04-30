export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Demo Booked",
  "Follow-up",
  "Busy Call Later",
  "Closed - Won",
  "Closed - Lost",
];

export const statusPill = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Demo Booked": "bg-violet-50 text-violet-700 border-violet-200",
  "Follow-up": "bg-amber-50 text-amber-700 border-amber-200",
  "Busy Call Later": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Closed - Won": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closed - Lost": "bg-rose-50 text-rose-700 border-rose-200",
};

export const toWhatsAppLink = (phone) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("20")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/20${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};
