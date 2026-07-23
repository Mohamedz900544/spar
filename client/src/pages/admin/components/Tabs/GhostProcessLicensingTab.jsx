import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Activity,
  Ban,
  CheckCircle2,
  Clock3,
  KeyRound,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emptyLicenseForm = {
  code: "",
  customer_name: "",
  phone: "",
  remaining_questions: 25,
  count: 1,
  window_start: "",
  window_end: "",
  window_timezone: "Africa/Cairo",
};

const getLicenseId = (license) => license?.id || license?._id;

const getToken = () => localStorage.getItem("sparvi_token");

const parseApiResponse = async (res, fallbackMessage = "Request failed") => {
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : {};
  if (!res.ok) {
    throw new Error(data.message || data.error || fallbackMessage);
  }
  return data;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDatetimeLocalInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const buildWindowDrafts = (licenses) =>
  Object.fromEntries(
    licenses.map((license) => [
      getLicenseId(license),
      {
        window_start: toDatetimeLocalInput(license.window_start),
        window_end: toDatetimeLocalInput(license.window_end),
        window_timezone: license.window_timezone || "Africa/Cairo",
      },
    ])
  );

const StatusBadge = ({ status }) => {
  const revoked = status === "revoked";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold ${
        revoked
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      }`}
    >
      {revoked ? <Ban className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
      {revoked ? "Revoked" : "Active"}
    </span>
  );
};

const GhostProcessLicensingTab = () => {
  const [licenses, setLicenses] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [consumptionLogs, setConsumptionLogs] = useState([]);
  const [keyStatus, setKeyStatus] = useState({
    openai_key_version: "",
    has_openai_key: false,
  });
  const [newLicense, setNewLicense] = useState(emptyLicenseForm);
  const [questionDrafts, setQuestionDrafts] = useState({});
  const [windowDrafts, setWindowDrafts] = useState({});
  const [selectedLicenseId, setSelectedLicenseId] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingLogs, setIsDeletingLogs] = useState(false);
  const [isRefreshingKey, setIsRefreshingKey] = useState(false);

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const res = await fetch(`${API_BASE_URL}/api/admin/ghostprocess${path}`, {
      ...options,
      headers,
    });

    return parseApiResponse(res);
  }, []);

  const loadLicenses = useCallback(async () => {
    const data = await apiFetch("/licenses");
    setLicenses(data.licenses || []);
    setKeyStatus(data.key_status || {});
    setWindowDrafts(buildWindowDrafts(data.licenses || []));
  }, [apiFetch]);

  const loadLogs = useCallback(
    async (licenseId = selectedLicenseId) => {
      const params = new URLSearchParams({ limit: "120" });
      if (licenseId) params.set("license_id", licenseId);
      const data = await apiFetch(`/logs?${params.toString()}`);
      setApiLogs(data.api_logs || []);
      setConsumptionLogs(data.consumption_logs || []);
    },
    [apiFetch, selectedLicenseId]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const licensesData = await apiFetch("/licenses");
        if (cancelled) return;
        setLicenses(licensesData.licenses || []);
        setKeyStatus(licensesData.key_status || {});
        setWindowDrafts(buildWindowDrafts(licensesData.licenses || []));

        const logsData = await apiFetch("/logs?limit=120");
        if (cancelled) return;
        setApiLogs(logsData.api_logs || []);
        setConsumptionLogs(logsData.consumption_logs || []);
      } catch (error) {
        toast.error(error.message || "Could not load GhostProcess data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [apiFetch]);

  const filteredLicenses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return licenses;
    return licenses.filter((license) =>
      [
        license.code,
        license.customer_name,
        license.phone,
        license.hardware_id,
        license.status,
      ]
        .filter(Boolean)
        .some((value) => `${value}`.toLowerCase().includes(q))
    );
  }, [licenses, search]);

  const replaceLicense = (updatedLicense) => {
    setLicenses((current) =>
      current.map((license) =>
        getLicenseId(license) === getLicenseId(updatedLicense)
          ? updatedLicense
          : license
      )
    );
    setWindowDrafts((current) => ({
      ...current,
      [getLicenseId(updatedLicense)]: {
        window_start: toDatetimeLocalInput(updatedLicense.window_start),
        window_end: toDatetimeLocalInput(updatedLicense.window_end),
        window_timezone: updatedLicense.window_timezone || "Africa/Cairo",
      },
    }));
  };

  const handleCreateLicense = async (event) => {
    event.preventDefault();
    try {
      setIsCreating(true);
      const payload = {
        ...newLicense,
        remaining_questions: Number(newLicense.remaining_questions) || 0,
        count: Number(newLicense.count) || 1,
      };
      const data = await apiFetch("/licenses", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setLicenses((current) => [...(data.licenses || []), ...current]);
      setWindowDrafts((current) => ({
        ...buildWindowDrafts(data.licenses || []),
        ...current,
      }));
      setNewLicense(emptyLicenseForm);
      toast.success("Activation code generated");
    } catch (error) {
      toast.error(error.message || "Could not generate activation code");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddQuestions = async (licenseId) => {
    const amount = Number(questionDrafts[licenseId] || 0);
    if (!amount || amount <= 0) {
      toast.error("Enter a question amount");
      return;
    }

    try {
      const data = await apiFetch(`/licenses/${licenseId}/questions`, {
        method: "PATCH",
        body: JSON.stringify({ amount }),
      });
      replaceLicense(data.license);
      setQuestionDrafts((current) => ({ ...current, [licenseId]: "" }));
      toast.success("Questions added");
    } catch (error) {
      toast.error(error.message || "Could not add questions");
    }
  };

  const handleSaveWindow = async (licenseId) => {
    try {
      const draft = windowDrafts[licenseId] || {};
      const data = await apiFetch(`/licenses/${licenseId}/window`, {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      replaceLicense(data.license);
      toast.success("Allowed window saved");
    } catch (error) {
      toast.error(error.message || "Could not save allowed window");
    }
  };

  const handleResetHardware = async (license) => {
    const confirmed = window.confirm(`Reset hardware binding for ${license.code}?`);
    if (!confirmed) return;

    try {
      const data = await apiFetch(`/licenses/${getLicenseId(license)}/reset-hardware`, {
        method: "POST",
      });
      replaceLicense(data.license);
      toast.success("Hardware binding reset");
      loadLogs(selectedLicenseId);
    } catch (error) {
      toast.error(error.message || "Could not reset hardware");
    }
  };

  const handleToggleStatus = async (license) => {
    const nextStatus = license.status === "revoked" ? "active" : "revoked";
    try {
      const data = await apiFetch(`/licenses/${getLicenseId(license)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      replaceLicense(data.license);
      toast.success(nextStatus === "revoked" ? "License revoked" : "License active");
    } catch (error) {
      toast.error(error.message || "Could not update license status");
    }
  };

  const handleRefreshKey = async () => {
    try {
      setIsRefreshingKey(true);
      const data = await apiFetch("/refresh-key", { method: "POST" });
      setKeyStatus({
        openai_key_version: data.openai_key_version,
        has_openai_key: data.has_openai_key,
      });
      await loadLicenses();
      toast.success("Key version refreshed");
    } catch (error) {
      toast.error(error.message || "Could not refresh key version");
    } finally {
      setIsRefreshingKey(false);
    }
  };

  const handleSelectLogs = async (licenseId) => {
    setSelectedLicenseId(licenseId);
    try {
      await loadLogs(licenseId);
    } catch (error) {
      toast.error(error.message || "Could not load logs");
    }
  };

  const handleDeleteLogs = async () => {
    const selectedLicense = licenses.find(
      (license) => `${getLicenseId(license)}` === `${selectedLicenseId}`
    );
    const targetLabel = selectedLicense
      ? `logs for ${selectedLicense.code}`
      : "all GhostProcess logs";
    const confirmed = window.confirm(`Delete ${targetLabel}?`);
    if (!confirmed) return;

    try {
      setIsDeletingLogs(true);
      const params = new URLSearchParams();
      if (selectedLicenseId) params.set("license_id", selectedLicenseId);
      const path = params.toString() ? `/logs?${params.toString()}` : "/logs";
      const data = await apiFetch(path, { method: "DELETE" });
      setApiLogs([]);
      setConsumptionLogs([]);
      const deletedCount =
        Number(data.api_logs_deleted || 0) +
        Number(data.consumption_logs_removed || 0);
      toast.success(
        deletedCount > 0 ? `Deleted ${deletedCount} logs` : "No logs to delete"
      );
    } catch (error) {
      toast.error(error.message || "Could not delete logs");
    } finally {
      setIsDeletingLogs(false);
    }
  };

  const handleWindowDraftChange = (licenseId, field, value) => {
    setWindowDrafts((current) => ({
      ...current,
      [licenseId]: {
        ...(current[licenseId] || {}),
        [field]: value,
      },
    }));
  };

  const totalRemaining = useMemo(
    () =>
      licenses.reduce(
        (sum, license) => sum + Number(license.remaining_questions || 0),
        0
      ),
    [licenses]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold tracking-normal text-slate-950">
              GhostProcess Licensing
            </h2>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">
              {licenses.length} codes
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
              {totalRemaining} questions
            </span>
            <span
              className={`rounded-md px-2 py-1 ${
                keyStatus.has_openai_key
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              OpenAI key {keyStatus.has_openai_key ? "set" : "missing"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            <span className="block text-[10px] uppercase tracking-wider text-blue-400">
              Key version
            </span>
            <span className="block max-w-[280px] truncate">
              {keyStatus.openai_key_version || "-"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefreshKey}
            disabled={isRefreshingKey}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingKey ? "animate-spin" : ""}`} />
            Refresh KEY
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-base font-semibold tracking-normal text-slate-950">
            Generate Activation Code
          </h3>
          <form onSubmit={handleCreateLicense} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">
                Customer name
              </label>
              <input
                value={newLicense.customer_name}
                onChange={(event) =>
                  setNewLicense((current) => ({
                    ...current,
                    customer_name: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">
                Phone
              </label>
              <input
                value={newLicense.phone}
                onChange={(event) =>
                  setNewLicense((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Questions
                </label>
                <input
                  type="number"
                  min="0"
                  value={newLicense.remaining_questions}
                  onChange={(event) =>
                    setNewLicense((current) => ({
                      ...current,
                      remaining_questions: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newLicense.count}
                  onChange={(event) =>
                    setNewLicense((current) => ({
                      ...current,
                      count: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">
                Custom code
              </label>
              <input
                value={newLicense.code}
                onChange={(event) =>
                  setNewLicense((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 font-mono text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">
                Timezone
              </label>
              <input
                value={newLicense.window_timezone}
                onChange={(event) =>
                  setNewLicense((current) => ({
                    ...current,
                    window_timezone: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Window start
                </label>
                <input
                  type="datetime-local"
                  value={newLicense.window_start}
                  onChange={(event) =>
                    setNewLicense((current) => ({
                      ...current,
                      window_start: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Window end
                </label>
                <input
                  type="datetime-local"
                  value={newLicense.window_end}
                  onChange={(event) =>
                    setNewLicense((current) => ({
                      ...current,
                      window_end: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? "Generating..." : "Generate"}
            </button>
          </form>
        </section>

        <section className="min-w-0 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-base font-semibold tracking-normal text-slate-950">
              Activation Codes
            </h3>
            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-blue-100 bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Search codes"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-3 font-bold">Code</th>
                  <th className="py-3 pr-3 font-bold">Customer</th>
                  <th className="py-3 pr-3 font-bold">Hardware</th>
                  <th className="py-3 pr-3 font-bold">Questions</th>
                  <th className="py-3 pr-3 font-bold">Allowed Window</th>
                  <th className="py-3 pr-3 font-bold">Status</th>
                  <th className="py-3 pr-3 font-bold">Activity</th>
                  <th className="py-3 pr-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((license) => {
                  const licenseId = getLicenseId(license);
                  const draft = windowDrafts[licenseId] || {};
                  return (
                    <tr
                      key={licenseId}
                      className="border-b border-blue-50 align-top text-slate-700"
                    >
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => handleSelectLogs(`${licenseId}`)}
                          className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-bold text-blue-700 hover:bg-blue-100"
                        >
                          {license.code}
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-slate-950">
                          {license.customer_name}
                        </p>
                        <p className="text-xs text-slate-500">{license.phone}</p>
                      </td>
                      <td className="max-w-[190px] py-3 pr-3">
                        <p className="break-all font-mono text-[11px] leading-5 text-slate-600">
                          {license.hardware_id || "Unbound"}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="mb-2 text-lg font-bold text-slate-950">
                          {license.remaining_questions}
                        </p>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={questionDrafts[licenseId] || ""}
                            onChange={(event) =>
                              setQuestionDrafts((current) => ({
                                ...current,
                                [licenseId]: event.target.value,
                              }))
                            }
                            className="h-8 w-20 rounded-md border border-blue-100 px-2 text-xs font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddQuestions(licenseId)}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-2 text-xs font-bold text-white hover:bg-blue-700"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="w-[300px] py-3 pr-3">
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="datetime-local"
                            value={draft.window_start || ""}
                            onChange={(event) =>
                              handleWindowDraftChange(
                                licenseId,
                                "window_start",
                                event.target.value
                              )
                            }
                            className="h-8 rounded-md border border-blue-100 px-2 text-xs font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                          <input
                            type="datetime-local"
                            value={draft.window_end || ""}
                            onChange={(event) =>
                              handleWindowDraftChange(
                                licenseId,
                                "window_end",
                                event.target.value
                              )
                            }
                            className="h-8 rounded-md border border-blue-100 px-2 text-xs font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              value={draft.window_timezone || "Africa/Cairo"}
                              onChange={(event) =>
                                handleWindowDraftChange(
                                  licenseId,
                                  "window_timezone",
                                  event.target.value
                                )
                              }
                              className="h-8 min-w-0 flex-1 rounded-md border border-blue-100 px-2 text-xs font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveWindow(licenseId)}
                              className="inline-flex h-8 items-center justify-center rounded-md bg-slate-900 px-2 text-xs font-bold text-white hover:bg-slate-800"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={license.status} />
                        <p className="mt-2 text-[11px] font-semibold text-slate-500">
                          Key ack: {license.openai_key_version_ack || "-"}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-xs text-slate-500">
                        <p>Created: {formatDateTime(license.created_at)}</p>
                        <p>Activated: {formatDateTime(license.activated_at)}</p>
                        <p>Last seen: {formatDateTime(license.last_seen_at)}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetHardware(license)}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-blue-100 bg-white px-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(license)}
                            className={`inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-xs font-bold ${
                              license.status === "revoked"
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-rose-600 text-white hover:bg-rose-700"
                            }`}
                          >
                            {license.status === "revoked" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                            {license.status === "revoked" ? "Unrevoke" : "Revoke"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!isLoading && filteredLicenses.length === 0 && (
              <div className="py-10 text-center text-sm font-semibold text-slate-500">
                No activation codes found.
              </div>
            )}
            {isLoading && (
              <div className="py-10 text-center text-sm font-semibold text-slate-500">
                Loading licenses...
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold tracking-normal text-slate-950">
              Logs
            </h3>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={selectedLicenseId}
              onChange={(event) => handleSelectLogs(event.target.value)}
              className="h-10 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All codes</option>
              {licenses.map((license) => (
                <option key={getLicenseId(license)} value={getLicenseId(license)}>
                  {license.code} - {license.customer_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadLogs(selectedLicenseId)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleDeleteLogs}
              disabled={
                isDeletingLogs ||
                (apiLogs.length === 0 && consumptionLogs.length === 0)
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingLogs ? "Deleting..." : "Delete Logs"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Clock3 className="h-4 w-4 text-blue-600" />
              API Logs
            </div>
            <div className="overflow-x-auto rounded-lg border border-blue-100">
              <table className="min-w-[760px] w-full text-left text-xs">
                <thead className="bg-blue-50 text-[10px] uppercase tracking-wider text-blue-500">
                  <tr>
                    <th className="px-3 py-2 font-bold">Time</th>
                    <th className="px-3 py-2 font-bold">Code</th>
                    <th className="px-3 py-2 font-bold">Endpoint</th>
                    <th className="px-3 py-2 font-bold">Status</th>
                    <th className="px-3 py-2 font-bold">Error</th>
                    <th className="px-3 py-2 font-bold">Hardware</th>
                  </tr>
                </thead>
                <tbody>
                  {apiLogs.map((log) => (
                    <tr key={log.id} className="border-t border-blue-50">
                      <td className="px-3 py-2 text-slate-500">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-blue-700">
                        {log.code || "-"}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                        {log.method} {log.endpoint}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-md px-2 py-1 font-bold ${
                            log.ok
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {log.status_code}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-rose-700">
                        {log.error_code || "-"}
                      </td>
                      <td className="max-w-[170px] break-all px-3 py-2 font-mono text-[11px] text-slate-500">
                        {log.hardware_id || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {apiLogs.length === 0 && (
                <div className="py-8 text-center text-sm font-semibold text-slate-500">
                  No API logs.
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Consumption Logs
            </div>
            <div className="overflow-x-auto rounded-lg border border-blue-100">
              <table className="min-w-[720px] w-full text-left text-xs">
                <thead className="bg-blue-50 text-[10px] uppercase tracking-wider text-blue-500">
                  <tr>
                    <th className="px-3 py-2 font-bold">Time</th>
                    <th className="px-3 py-2 font-bold">Code</th>
                    <th className="px-3 py-2 font-bold">Request</th>
                    <th className="px-3 py-2 font-bold">Before</th>
                    <th className="px-3 py-2 font-bold">After</th>
                    <th className="px-3 py-2 font-bold">Hardware</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionLogs.map((log) => (
                    <tr key={log.id} className="border-t border-blue-50">
                      <td className="px-3 py-2 text-slate-500">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-blue-700">
                        {log.code || "-"}
                      </td>
                      <td className="max-w-[180px] break-all px-3 py-2 font-mono text-[11px] text-slate-700">
                        {log.request_id}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-700">
                        {log.remaining_before}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-700">
                        {log.remaining_after}
                      </td>
                      <td className="max-w-[170px] break-all px-3 py-2 font-mono text-[11px] text-slate-500">
                        {log.hardware_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {consumptionLogs.length === 0 && (
                <div className="py-8 text-center text-sm font-semibold text-slate-500">
                  No consumption logs.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GhostProcessLicensingTab;
