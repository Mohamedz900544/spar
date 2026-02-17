import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString();
};

const ConversationsList = ({
  selectedId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  refreshKey,
  token,
  onError,
}) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const headers = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    const fetchConversations = async () => {
      setIsLoading(true);
      if (onError) onError("");
      try {
        const url = new URL(`${API_BASE_URL}/api/conversations`);
        if (statusFilter !== "all") {
          url.searchParams.set("status", statusFilter);
        }
        const res = await fetch(url, { headers });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load conversations");
        }
        if (!isMounted) return;
        setConversations(data.conversations || []);
        if (!selectedId && data.conversations?.length) {
          onSelect(data.conversations[0]._id || data.conversations[0].id);
        }
      } catch (err) {
        if (onError) onError(err.message || "Failed to load conversations");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchConversations();
    return () => {
      isMounted = false;
    };
  }, [headers, onError, onSelect, refreshKey, selectedId, statusFilter]);

  return (
    <aside className="inbox-sidebar">
      <div className="inbox-sidebar-header">
        <div>
          <h2 className="inbox-section-title">Conversations</h2>
          <p className="inbox-meta">
            {conversations.length} active conversations
          </p>
        </div>
        <select
          className="inbox-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {isLoading ? (
        <div className="inbox-placeholder">Loading conversations...</div>
      ) : (
        <div className="inbox-list">
          {conversations.map((conv) => {
            const convId = conv._id || conv.id;
            const isActive = convId === selectedId;
            return (
              <button
                key={convId}
                className={`inbox-list-item ${isActive ? "active" : ""}`}
                onClick={() => onSelect(convId)}
              >
                <div className="inbox-list-title">{conv.customerPhone}</div>
                <div className="inbox-list-text">
                  {conv.lastMessageText || "No messages yet"}
                </div>
                <div className="inbox-list-meta">
                  <span className={`inbox-status ${conv.status}`}>
                    {conv.status}
                  </span>
                  <span>{formatDateTime(conv.lastMessageAt)}</span>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="inbox-placeholder">
              No conversations yet. Incoming WhatsApp messages will appear here.
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default ConversationsList;
