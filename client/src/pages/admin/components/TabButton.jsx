// src/pages/admin/components/TabButton.jsx
import React from "react";

const baseClasses =
  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-200";

const TabButton = ({ active, icon: Icon, label, onClick, badge }) => {
  const activeClasses = "bg-[#102a5a] text-white shadow-md";
  const inactiveClasses =
    "bg-white/80 text-slate-700 border border-[#e2e8f0] hover:bg-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      {typeof badge === "number" && badge > 0 && (
        <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#fee2e2] text-[10px] font-semibold text-[#b91c1c]">
          {badge}
        </span>
      )}
    </button>
  );
};

export default TabButton;
