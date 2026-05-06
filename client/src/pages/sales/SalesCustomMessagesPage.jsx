import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MessageSquareText, PlusCircle, Save, Trash2 } from "lucide-react";
import { formatDateTime } from "./salesHelpers";

const PLACEHOLDERS = ["{parentName}", "{childName}", "{childAge}", "{phone}", "{status}", "{source}"];

const createMessageId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const SalesCustomMessagesPage = () => {
  const sales = useOutletContext();
  const [form, setForm] = useState({
    title: "",
    body: "",
  });

  const sortedMessages = useMemo(
    () =>
      [...(sales.customWhatsAppMessages || [])].sort(
        (first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
      ),
    [sales.customWhatsAppMessages]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addMessage = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const body = form.body.trim();
    if (!title || !body) return;

    sales.setCustomWhatsAppMessages((prev) => [
      {
        id: createMessageId(),
        title,
        body,
        createdAt: new Date().toISOString(),
      },
      ...(prev || []),
    ]);
    setForm({ title: "", body: "" });
  };

  const deleteMessage = (messageId) => {
    sales.setCustomWhatsAppMessages((prev) =>
      (prev || []).filter((message) => message.id !== messageId)
    );
  };

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form onSubmit={addMessage} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Add New Custom WhatsApp Message</h2>
            <p className="text-xs font-medium text-slate-400">Create reusable messages for customers.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Message Name
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Example: Demo reminder"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              WhatsApp Message
            </label>
            <textarea
              rows={8}
              value={form.body}
              onChange={(event) => updateField("body", event.target.value)}
              placeholder="Hi {parentName}, this is SP School..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-bold text-slate-500">Available placeholders</p>
            <div className="flex flex-wrap gap-2">
              {PLACEHOLDERS.map((placeholder) => (
                <button
                  key={placeholder}
                  type="button"
                  onClick={() => updateField("body", `${form.body}${form.body ? " " : ""}${placeholder}`)}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {placeholder}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!form.title.trim() || !form.body.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Message
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Custom Messages</h2>
              <p className="text-xs font-medium text-slate-400">
                {sortedMessages.length} saved message{sortedMessages.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {sortedMessages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No custom messages yet.</p>
            <p className="mt-1 text-sm text-slate-500">Add your first WhatsApp message from the form.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((message) => (
              <article key={message.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-800">{message.title}</h3>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      Added {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMessage(message.id)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-white p-0 text-rose-600 transition-all hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{message.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default SalesCustomMessagesPage;
