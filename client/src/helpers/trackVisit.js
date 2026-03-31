// src/helpers/trackVisit.js
// Generates a lightweight browser fingerprint and sends it to the backend
// to track unique daily visitors. No personal data is collected.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Create a simple fingerprint from browser properties.
 * Not meant to be perfect — just enough to de-duplicate
 * most repeat visits from the same browser on the same day.
 */
function generateFingerprint() {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset(),
  ];
  // Simple hash (djb2)
  const str = parts.join("|");
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

/**
 * Track this visit. Safe to call multiple times —
 * the backend upserts, so only one record per fingerprint per day.
 */
export function trackVisit() {
  // Don't track admin/parent/instructor dashboard visits
  const path = window.location.pathname;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/parent") ||
    path.startsWith("/instructor")
  ) {
    return;
  }

  const fingerprint = generateFingerprint();

  // Fire-and-forget POST — don't block the UI
  fetch(`${API_BASE_URL}/api/track-visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fingerprint }),
  }).catch(() => {
    // silently ignore tracking failures
  });
}
