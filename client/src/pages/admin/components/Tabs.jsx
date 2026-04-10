import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Image as ImageIcon,
  Inbox,
  Users,
  BarChart3,
  GraduationCap,
  Eye,
} from "lucide-react";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "rounds", label: "Rounds", icon: CalendarClock },
  { id: "sessions", label: "Sessions", icon: CalendarClock },
  { id: "enrollments", label: "Enrollments", icon: Users },
  { id: "instructors", label: "Instructors", icon: GraduationCap },
  { id: "users", label: "Users", icon: Users },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "full-overview", label: "Full Overview & Visitors", icon: Eye },
];

const Tabs = ({ activeTab, setActiveTab, tabButtonBase, newMessagesCount }) => {
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("admin-header-tabs-slot"));
  }, []);

  const tabsContent = (
    <nav className="mt-3 border-t border-white/10 pt-2">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
        {ADMIN_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white/85 hover:bg-white/5"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>

              {tab.id === "messages" && newMessagesCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#FBBF24] text-[10px] font-bold text-[#102a5a] leading-none">
                  {newMessagesCount}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="adminTabIndicator"
                  className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FBBF24] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );

  if (portalTarget) {
    return createPortal(tabsContent, portalTarget);
  }

  return tabsContent;
};

export default Tabs;
