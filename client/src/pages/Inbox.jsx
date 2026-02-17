import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ConversationsList from "./inbox/ConversationsList";
import ChatWindow from "./inbox/ChatWindow";

const Inbox = () => {
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();
  const isAdminView = location.pathname.startsWith("/admin");

  const token = localStorage.getItem("sparvi_token");

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    root.classList.add("inbox-root");
    return () => root.classList.remove("inbox-root");
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className={`inbox-shell ${isAdminView ? "inbox-shell-admin" : ""}`}>
      <div className="inbox-topbar">
        <div>
          <h2 className="inbox-topbar-title">WhatsApp Unified Inbox</h2>
          <p className="inbox-topbar-subtitle">
            Manage conversations and reply instantly from one place
          </p>
        </div>
        <button
          type="button"
          className="inbox-ghost-button"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>
      <div className={`inbox-app ${isAdminView ? "inbox-admin" : ""}`}>
        <ConversationsList
          selectedId={selectedId}
          onSelect={setSelectedId}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          refreshKey={refreshKey}
          token={token}
          onError={setError}
        />
        <ChatWindow
          conversationId={selectedId}
          token={token}
          onSent={handleRefresh}
          onError={setError}
          error={error}
        />
      </div>
    </div>
  );
};

export default Inbox;
