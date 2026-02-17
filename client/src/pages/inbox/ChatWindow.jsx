import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString();
};

const ChatWindow = ({ conversationId, token, onSent, onError, error }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const headers = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    const fetchConversation = async () => {
      if (!conversationId) {
        setConversation(null);
        setMessages([]);
        return;
      }
      setIsLoading(true);
      if (onError) onError("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/conversations/${conversationId}`,
          { headers }
        );
      const data = await res.json();
      if (!res.ok) {
        const detailsMessage =
          data.details?.error?.error_user_msg ||
          data.details?.error?.message ||
          "";
        const message = [data.message, detailsMessage]
          .filter(Boolean)
          .join(" - ");
        throw new Error(message || "Failed to load conversation");
      }
        if (!isMounted) return;
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } catch (err) {
        if (onError) onError(err.message || "Failed to load conversation");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchConversation();
    return () => {
      isMounted = false;
    };
  }, [conversationId, headers, onError]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !conversationId) return;
    setIsSending(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({ text: replyText.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const detailsMessage =
          data.details?.error?.error_user_msg ||
          data.details?.error?.message ||
          "";
        const message = [data.message, detailsMessage]
          .filter(Boolean)
          .join(" - ");
        throw new Error(message || "Failed to send message");
      }
      setMessages((prev) => [...prev, data]);
      setReplyText("");
      if (onSent) onSent();
    } catch (err) {
      if (onError) onError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!conversationId) {
    return (
      <main className="inbox-main">
        {error && <div className="inbox-error">{error}</div>}
        <div className="inbox-placeholder">Select a conversation</div>
      </main>
    );
  }

  return (
    <main className="inbox-main">
      {error && <div className="inbox-error">{error}</div>}
      {!conversation ? (
        <div className="inbox-placeholder">Loading conversation...</div>
      ) : (
        <div className="inbox-panel">
          <div className="inbox-panel-header">
            <div>
              <h3 className="inbox-panel-title">
                {conversation.customerPhone}
              </h3>
              <div className="inbox-panel-meta">
                Last update {formatDateTime(conversation.lastMessageAt)}
              </div>
            </div>
            <span className={`inbox-status ${conversation.status}`}>
              {conversation.status}
            </span>
          </div>

          <div className="inbox-messages">
            {isLoading ? (
              <div className="inbox-placeholder">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="inbox-placeholder">
                No messages yet. Start the conversation by sending a reply.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id || message.id}
                  className={`inbox-message ${message.from === "agent" ? "agent" : "customer"}`}
                >
                  <div className="inbox-message-bubble">
                    <div className="inbox-message-text">{message.text}</div>
                    <div className="inbox-message-time">
                      {formatDateTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="inbox-reply" onSubmit={handleSend}>
            <input
              className="inbox-input"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type a reply..."
            />
            <button className="inbox-button" type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

export default ChatWindow;
