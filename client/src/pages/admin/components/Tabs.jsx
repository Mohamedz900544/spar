import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarClock,
  Image as ImageIcon,
  Inbox,
  Users,
  BarChart3,
  GraduationCap,
  Eye,
  FileArchive,
} from "lucide-react";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "rounds", label: "Rounds", icon: CalendarClock },
  { id: "sessions", label: "Sessions", icon: CalendarClock },
  { id: "enrollments", label: "Enrollments", icon: Users },
  { id: "instructors", label: "Instructors", icon: GraduationCap },
  { id: "users", label: "Users", icon: Users },
  { id: "sp-recording", label: "SP Recording", icon: FileArchive },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "full-overview", label: "Full Overview & Visitors", icon: Eye },
];

const Tabs = ({ activeTab, setActiveTab, newMessagesCount }) => {
  const [portalTargets, setPortalTargets] = useState({
    sidebar: null,
    mobile: null,
  });

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setPortalTargets({
        sidebar: document.getElementById("admin-sidebar-tabs-slot"),
        mobile: document.getElementById("admin-mobile-tabs-slot"),
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const renderBadge = (isActive) =>
    newMessagesCount > 0 && (
      <span
        className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
          isActive ? "bg-white/80 text-blue-700" : "bg-blue-600 text-white"
        }`}
      >
        {newMessagesCount}
      </span>
    );

  const desktopTabs = (
    <div className="space-y-1.5">
      {ADMIN_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <TabIcon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{tab.label}</span>
            {tab.id === "messages" && renderBadge(isActive)}
          </button>
        );
      })}
    </div>
  );

  const mobileTabs = (
    <>
      {ADMIN_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-500 ring-1 ring-blue-100 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <TabIcon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
            {tab.id === "messages" && renderBadge(isActive)}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {portalTargets.sidebar && createPortal(desktopTabs, portalTargets.sidebar)}
      {portalTargets.mobile && createPortal(mobileTabs, portalTargets.mobile)}
    </>
  );
};

export default Tabs;
