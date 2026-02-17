// src/pages/admin/components/StatusBadge.jsx
import React from "react";

const STATUS_STYLES = {
  // Sessions / rounds
  Active: "bg-[#dcfce7] text-[#166534]",
  Full: "bg-[#fee2e2] text-[#b91c1c]",
  Draft: "bg-[#e5e7eb] text-[#374151]",
  Completed: "bg-[#f5f3ff] text-[#6d28d9]",
  Planned: "bg-[#e0f2fe] text-[#075985]",

  // Enrollments
  Confirmed: "bg-[#dcfce7] text-[#166534]",
  Waiting: "bg-[#fef9c3] text-[#854d0e]",
  "Pending Call": "bg-[#e0f2fe] text-[#075985]",

  // Gallery
  Published: "bg-[#dcfce7] text-[#166534]",

  // Messages
  New: "bg-[#fee2e2] text-[#b91c1c]",
  "In Progress": "bg-[#e0f2fe] text-[#075985]",
  Closed: "bg-[#dcfce7] text-[#166534]",
};

const StatusBadge = ({ status }) => {
  const classes =
    STATUS_STYLES[status] || "bg-[#e5e7eb] text-[#374151]";

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${classes}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
