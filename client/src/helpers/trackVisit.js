// src/helpers/trackVisit.js
// Sends a simple POST to the backend on every page load to record a unique visit.

const RAW_BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL =
  !RAW_BASE || RAW_BASE === "undefined" || RAW_BASE === "null"
    ? ""
    : RAW_BASE;

function getVisitorId() {
  const key = "sparvi_visitor_id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Record a unique visit per visitor per day.
 */
export function trackVisit() {
  const base = API_BASE_URL.replace(/\/$/, "");
  const url = base ? `${base}/api/page-hit` : "/api/page-hit";
  const payload = JSON.stringify({ visitorId: getVisitorId() });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(url, blob);
    return;
  }

  // Fire-and-forget POST - don't block the UI
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // silently ignore tracking failures
  });
}
