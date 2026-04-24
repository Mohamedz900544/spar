import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  AlertTriangle,
  Copy,
  KeyRound,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { getTokenOrRedirect } from "../../../helpers/helpers.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const parseResponseOrThrow = async (
  response,
  fallbackMessage = "Request failed"
) => {
  const raw = await response.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      const isHtml =
        raw.trimStart().startsWith("<!DOCTYPE") ||
        raw.trimStart().startsWith("<html");

      if (isHtml) {
        throw new Error(
          "API returned HTML instead of JSON. Check VITE_API_BASE_URL and ensure the backend is running."
        );
      }

      throw new Error("API returned invalid JSON response.");
    }
  }

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const formatRotatedAt = (value) => {
  if (!value) {
    return "Not rotated yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not rotated yet";
  }

  return date.toLocaleString();
};

const statusStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

const SparviInstructorAccessCard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [accessSummary, setAccessSummary] = useState({
    hasActivePassword: false,
    rotatedAt: null,
  });
  const [revealedPassword, setRevealedPassword] = useState("");
  const [revealedPasswordRotatedAt, setRevealedPasswordRotatedAt] =
    useState(null);
  const [rotationStatus, setRotationStatus] = useState({
    type: "",
    message: "",
  });
  const [copyFeedback, setCopyFeedback] = useState("");

  const loadAccessSummary = useCallback(
    async ({ showLoader = true } = {}) => {
      const token = getTokenOrRedirect(navigate);
      if (!token) {
        return;
      }

      try {
        if (showLoader) {
          setIsLoading(true);
        }

        setLoadError("");

        const response = await fetch(`${API_BASE_URL}/api/sparvi/access`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await parseResponseOrThrow(
          response,
          "Failed to load Sparvi instructor access"
        );

        setAccessSummary({
          hasActivePassword: Boolean(data.hasActivePassword),
          rotatedAt: data.rotatedAt ?? null,
        });
      } catch (err) {
        console.error("Load Sparvi access error:", err);
        setLoadError(
          err.message || "Failed to load the current Sparvi instructor access."
        );
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    loadAccessSummary();

    const intervalId = setInterval(() => {
      loadAccessSummary({ showLoader: false });
    }, 60000);

    return () => clearInterval(intervalId);
  }, [loadAccessSummary]);

  useEffect(() => {
    if (!revealedPassword) {
      return;
    }

    if (
      accessSummary.rotatedAt &&
      revealedPasswordRotatedAt &&
      accessSummary.rotatedAt !== revealedPasswordRotatedAt
    ) {
      setRevealedPassword("");
      setRevealedPasswordRotatedAt(null);
      setRotationStatus({
        type: "warning",
        message:
          "The active password was rotated in another admin session. Generate a new password to reveal the latest one here.",
      });
    }
  }, [accessSummary.rotatedAt, revealedPassword, revealedPasswordRotatedAt]);

  const handleRotatePassword = async () => {
    const confirmed = window.confirm(
      "Generate a new Sparvi instructor password? The previous password will stop working immediately."
    );

    if (!confirmed) {
      return;
    }

    const token = getTokenOrRedirect(navigate);
    if (!token) {
      return;
    }

    try {
      setIsRotating(true);
      setLoadError("");
      setRotationStatus({ type: "", message: "" });
      setCopyFeedback("");

      const response = await fetch(`${API_BASE_URL}/api/sparvi/rotate-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponseOrThrow(
        response,
        "Failed to rotate Sparvi instructor password"
      );

      setAccessSummary({
        hasActivePassword: true,
        rotatedAt: data.rotatedAt ?? Date.now(),
      });
      setRevealedPassword(data.password || "");
      setRevealedPasswordRotatedAt(data.rotatedAt ?? Date.now());
      setRotationStatus({
        type: "success",
        message:
          "New password generated. The previous instructor password is now invalid.",
      });
      toast.success("Sparvi password rotated");
    } catch (err) {
      console.error("Rotate Sparvi password error:", err);
      const message =
        err.message || "Failed to rotate the Sparvi instructor password.";
      setRotationStatus({
        type: "error",
        message,
      });
      toast.error(message);
    } finally {
      setIsRotating(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!revealedPassword) {
      return;
    }

    try {
      await navigator.clipboard.writeText(revealedPassword);
      setCopyFeedback("Copied");
      toast.success("Password copied");

      window.setTimeout(() => {
        setCopyFeedback("");
      }, 1500);
    } catch (err) {
      console.error("Copy Sparvi password error:", err);
      toast.error("Could not copy password");
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102a5a]/10 px-3 py-1 text-xs font-semibold text-[#102a5a]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sparvi Instructor Access
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#102a5a]">
              Desktop instructor password
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Sparvi desktop verifies instructors against the latest password
              stored in this dashboard backend. Only the newest generated
              password works.
            </p>
          </div>
          <div className="inline-flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Generating a new password invalidates the previous one
              immediately.
            </span>
          </div>
        </div>

        <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current status
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                accessSummary.hasActivePassword
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {accessSummary.hasActivePassword ? "Active password set" : "Not set"}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Last rotated: {formatRotatedAt(accessSummary.rotatedAt)}
          </p>
          <button
            type="button"
            onClick={handleRotatePassword}
            disabled={isRotating}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102a5a] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1a3a6b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRotating ? "animate-spin" : ""}`} />
            {isRotating ? "Generating..." : "Generate New Password"}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active instructor password
            </p>
            <p className="mt-1 text-xs text-slate-500">
              The password is shown only right after rotation for security.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyPassword}
            disabled={!revealedPassword}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            {copyFeedback || "Copy"}
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
          {revealedPassword ? (
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-[#102a5a]" />
              <code className="break-all text-lg font-bold tracking-[0.2em] text-[#102a5a]">
                {revealedPassword}
              </code>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {accessSummary.hasActivePassword
                ? "An active password exists, but it can only be revealed immediately after generating a new one in this dashboard session."
                : "No active instructor password has been generated yet."}
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading current Sparvi access status...
        </div>
      )}

      {loadError && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      )}

      {rotationStatus.message && (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            statusStyles[rotationStatus.type] || statusStyles.warning
          }`}
        >
          {rotationStatus.message}
        </div>
      )}
    </section>
  );
};

export default SparviInstructorAccessCard;
