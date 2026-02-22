// src/pages/admin/components/StatCard.jsx
import React from "react";

const StatCard = ({ title, value, icon: Icon, helper, barPercent }) => {
  const percent = typeof barPercent === "number"
    ? Math.max(0, Math.min(100, barPercent))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {Icon && <Icon className="w-7 h-7 text-[#102a5a]" />}
      </div>

      {helper && (
        <p className="text-[11px] text-slate-500 mt-0.5">{helper}</p>
      )}

      {percent !== null && (
        <div className="mt-2 w-20 sm:w-24 h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
          <div
            className="h-full bg-[#102a5a] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default StatCard;
