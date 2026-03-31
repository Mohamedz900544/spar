// src/helpers/trackVisit.js
// Sends a simple POST to the backend on every page load to record a unique visit.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getVisitorId() {
  const key = "sparvi_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Record a unique visit per visitor per day.
 */
export function trackVisit() {
  // Fire-and-forget POST — don't block the UI
  fetch(`${API_BASE_URL}/api/track-visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId: getVisitorId() }),
  }).catch(() => {
    // silently ignore tracking failures
  });
}
