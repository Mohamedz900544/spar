import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  Baby,
  ChevronDown,
  Link2,
  Phone,
  PlusCircle,
  Sparkles,
  StickyNote,
  UserRound,
} from "lucide-react";
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

  const filled = [form.parentName, form.childName, form.phone].filter(Boolean).length;
  const progress = Math.round((filled / 3) * 100);

  return (
    <section className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div
          className="px-6 py-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #071228 0%, #102a5a 55%, #1a3a6b 100%)" }}
        >
          <div className="absolute top-3 right-6 w-16 h-16 rounded-full bg-[#FBBF24]/10" />
          <div className="absolute -bottom-4 left-1/4 w-10 h-10 rounded-full bg-[#2dd4bf]/10" />

          <div className="mt-4 relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Completion</span>
              <span className="text-xs font-bold text-[#FBBF24]">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                <UserRound className="w-3.5 h-3.5 text-[#102a5a]" />
                Parent Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.parentName}
                onChange={(e) => updateField("parentName", e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all"
                placeholder="e.g. Ahmed Mohamed"
                required
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                <Baby className="w-3.5 h-3.5 text-[#102a5a]" />
                Child Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.childName}
                onChange={(e) => updateField("childName", e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all"
                placeholder="e.g. Youssef"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                Child Age
              </label>
              <input
                type="number"
                min={3}
                max={18}
                value={form.childAge}
                onChange={(e) => updateField("childAge", e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all"
                placeholder="3 - 18"
              />
            </div>

            <div className="relative">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                <StickyNote className="w-3.5 h-3.5 text-slate-400" />
                Source
              </label>
              <div className="relative">
                <select
                  value={form.source}
                  onChange={(e) => updateField("source", e.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all cursor-pointer"
                >
                  <option value="Manual">Manual</option>
                  <option value="Free Session">Free Session</option>
                  <option value="Contact Form">Contact Form</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact & Notes</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <EgyptPhoneInput value={form.phone} onChange={(value) => updateField("phone", value)} />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <Link2 className="w-3.5 h-3.5 text-blue-500" />
              Payment Link
              <span className="text-[10px] font-normal text-slate-400 normal-case tracking-normal ml-1">(optional)</span>
            </label>
            <input
              type="url"
              value={form.paymentLink}
              onChange={(e) => updateField("paymentLink", e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all"
              placeholder="https://pay.example.com/..."
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <StickyNote className="w-3.5 h-3.5 text-violet-500" />
              Initial Note
            </label>
            <textarea
              rows={4}
              value={form.initialNote}
              onChange={(e) => updateField("initialNote", e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#FBBF24] focus:bg-white focus:ring-4 focus:ring-[#FBBF24]/10 transition-all resize-none"
              placeholder="Parent asked for callback on Thursday..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={sales.isCreatingLead}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 group"
              style={{ background: "linear-gradient(135deg, #102a5a 0%, #1a3a6b 100%)" }}
            >
              {sales.isCreatingLead ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Lead...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Create Lead
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SalesNewLeadPage;
