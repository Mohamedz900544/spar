const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

let initialized = false;

const hasWindow = () => typeof window !== "undefined";

export const isMetaPixelEnabled = () =>
  hasWindow() && Boolean(`${PIXEL_ID || ""}`.trim());

export const initMetaPixel = () => {
  if (!isMetaPixelEnabled() || initialized) return;

  const pixelId = `${PIXEL_ID}`.trim();

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );
  /* eslint-enable */

  window.fbq("init", pixelId);
  initialized = true;
};

export const trackMetaPixelEvent = (eventName, params = {}) => {
  if (!isMetaPixelEnabled()) return;

  initMetaPixel();

  if (typeof window.fbq !== "function") return;
  window.fbq("track", eventName, params);
};

export const trackMetaPixelCustomEvent = (eventName, params = {}) => {
  if (!isMetaPixelEnabled()) return;

  initMetaPixel();

  if (typeof window.fbq !== "function") return;
  window.fbq("trackCustom", eventName, params);
};
