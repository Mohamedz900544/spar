// src/pages/MessagesPage.jsx
import React from "react";
import {
  Inbox,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

const MessagesPage = () => {
  const {
    isLoading,
    loadError,
    filteredMessages,
    messageStatusFilter,
    setMessageStatusFilter,
    handleMessageStatusChange,
    handleMessageNoteChange,
  } = useAdminDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff] flex flex-col">
      <header className="bg-[#0b63c7] text-white px-5 md:px-8 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg md:text-2xl font-extrabold leading-tight">
            Messages
          </h1>
          {isLoading && (
            <p className="text-[11px] text-blue-100 mt-0.5">
              Loading messages…
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Inbox className="w-4 h-4" />
          <span>Parent requests</span>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-10 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {loadError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs md:text-sm text-red-700">
              {loadError}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Parent messages & requests
              </h2>
              <div className="flex items-center gap-1 text-[11px]">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                {["All", "New", "In Progress", "Closed"].map((status) => (
                  <button
                    key={status}
                    className={`px-2 py-1 rounded-full border text-[10px] ${
                      messageStatusFilter === status
                        ? "bg-[#0b63c7] text-white border-[#0b63c7]"
                        : "border-[#dbeafe] text-slate-700"
                    }`}
                    onClick={() => setMessageStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredMessages.map((m) => (
                <div
                  key={m.id}
                  className="border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-xs md:text-sm flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {m.parentName} · {m.phone}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Child age: {m.childAge}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.status === "New"
                            ? "bg-[#fee2e2] text-[#b91c1c]"
                            : m.status === "In Progress"
                            ? "bg-[#e0f2fe] text-[#075985]"
                            : "bg-[#dcfce7] text-[#166534]"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] md:text-xs text-slate-600">
                    {m.message}
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      className="w-full rounded-lg border border-[#dbeafe] text-[11px] px-2 py-1 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#0ea5e9]"
                      placeholder="Internal note – e.g. sent WhatsApp message, waiting for reply..."
                      value={m.internalNote}
                      onChange={(e) =>
                        handleMessageNoteChange(m.id, e.target.value)
                      }
                      rows={2}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          handleMessageStatusChange(m.id, "In Progress")
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium border-[#e0f2fe] text-[#075985] hover:bg-[#e0f2fe]"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark in progress
                      </button>
                      <button
                        onClick={() =>
                          handleMessageStatusChange(m.id, "Closed")
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark closed
                      </button>
                      <button
                        onClick={() =>
                          handleMessageStatusChange(m.id, "New")
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium border-[#fee2e2] text-[#b91c1c] hover:bg-[#fee2e2]"
                      >
                        <XCircle className="w-3 h-3" />
                        Mark as new
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredMessages.length === 0 && (
                <p className="text-xs text-slate-500">
                  No messages match your filters.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
