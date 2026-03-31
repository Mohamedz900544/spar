// src/helpers/trackVisit.js
// Sends a simple POST to the backend on every page load to record a visit.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Record a visit. Every call = one visit counted.
 */
export function trackVisit() {
  // Fire-and-forget POST — don't block the UI
  fetch(`${API_BASE_URL}/api/track-visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: Date.now() }),
  }).catch(() => {
    // silently ignore tracking failures
  });
}
