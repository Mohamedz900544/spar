import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { formatDateTime } from "./salesHelpers";

const SalesClosedDealsPage = () => {
  const sales = useOutletContext();

  const won = useMemo(
    () =>
      (sales.leads || [])
        .filter((lead) => (lead.status || "New") === "Closed - Won")
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [sales.leads]
  );

  const lost = useMemo(
    () =>
      (sales.leads || [])
        .filter((lead) => (lead.status || "New") === "Closed - Lost")
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [sales.leads]
  );

  const totalClosed = won.length + lost.length;
  const conversion = totalClosed ? Math.round((won.length / totalClosed) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700">Won</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{won.length}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-rose-700">Lost</p>
          <p className="text-2xl font-bold text-rose-800 mt-1">{lost.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Conversion</p>
          <p className="text-2xl font-bold text-[#102a5a] mt-1">{conversion}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-emerald-700 mb-3">Closed - Won</h2>
          {won.length === 0 ? (
            <p className="text-sm text-slate-500">No won deals yet.</p>
          ) : (
            <div className="space-y-2">
              {won.map((lead) => (
                <div key={lead.id || lead._id} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <p className="text-sm font-semibold text-[#102a5a]">{lead.parentName}</p>
                  <p className="text-xs text-slate-600">
                    Child: {lead.childName} · {lead.phone}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Closed at: {formatDateTime(lead.updatedAt || lead.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-rose-700 mb-3">Closed - Lost</h2>
          {lost.length === 0 ? (
            <p className="text-sm text-slate-500">No lost deals.</p>
          ) : (
            <div className="space-y-2">
              {lost.map((lead) => (
                <div key={lead.id || lead._id} className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                  <p className="text-sm font-semibold text-[#102a5a]">{lead.parentName}</p>
                  <p className="text-xs text-slate-600">
                    Child: {lead.childName} · {lead.phone}
                  </p>
                  <p className="text-[11px] text-rose-700 mt-1">
                    Reason: {lead.lostReason || "No reason added"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Closed at: {formatDateTime(lead.updatedAt || lead.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SalesClosedDealsPage;
