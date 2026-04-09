import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import EgyptPhoneInput from "../../components/EgyptPhoneInput";

const SalesNewLeadPage = () => {
  const sales = useOutletContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    parentName: "",
    childName: "",
    childAge: "",
    phone: "",
    source: "Manual",
    paymentLink: "",
    initialNote: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const created = await sales.createLead(form);
    if (created) {
      setForm({
        parentName: "",
        childName: "",
        childAge: "",
        phone: "",
        source: "Manual",
        paymentLink: "",
        initialNote: "",
      });
      navigate("/sales/pipeline");
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-base font-bold text-[#102a5a] mb-4 flex items-center gap-2">
        <PlusCircle className="w-4 h-4 text-[#FBBF24]" />
        Add New Lead
      </h2>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Parent name</label>
          <input
            type="text"
            value={form.parentName}
            onChange={(e) => updateField("parentName", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Child name</label>
          <input
            type="text"
            value={form.childName}
            onChange={(e) => updateField("childName", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Child age</label>
          <input
            type="number"
            min={3}
            max={18}
            value={form.childAge}
            onChange={(e) => updateField("childAge", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Source</label>
          <select
            value={form.source}
            onChange={(e) => updateField("source", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
          >
            <option value="Manual">Manual</option>
            <option value="Free Session">Free Session</option>
            <option value="Contact Form">Contact Form</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
          <EgyptPhoneInput
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Payment link (optional)</label>
          <input
            type="url"
            value={form.paymentLink}
            onChange={(e) => updateField("paymentLink", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Initial note</label>
          <textarea
            rows={4}
            value={form.initialNote}
            onChange={(e) => updateField("initialNote", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FBBF24]/40"
            placeholder="Parent asked for callback on Thursday..."
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={sales.isCreatingLead}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#102a5a] text-white hover:bg-[#1a3a6b] disabled:opacity-60 transition-all"
          >
            {sales.isCreatingLead ? "Adding..." : "Create Lead"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SalesNewLeadPage;
