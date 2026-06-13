const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const clearStoredAuth = () => {
  [
    "sparvi_token",
    "sparvi_role",
    "sparvi_user",
    "sparvi_user_email",
    "sparvi_user_name",
    "token",
    "role",
    "user",
  ].forEach((key) => localStorage.removeItem(key));
};

export const getDesktopAuthParams = (searchParams) => {
  const redirectUri = searchParams.get("redirect_uri") || "";
  const state = searchParams.get("state") || "";
  const enabled = searchParams.get("desktop_auth") === "1" || Boolean(redirectUri);

  return {
    enabled,
    redirectUri,
    state,
  };
};

export const buildDesktopAuthSearch = ({ redirectUri, state }) => {
  const params = new URLSearchParams();
  params.set("desktop_auth", "1");
  if (redirectUri) params.set("redirect_uri", redirectUri);
  if (state) params.set("state", state);
  return params.toString();
};

const buildCallbackUrl = ({ redirectUri, code, state }) => {
  const separator = redirectUri.includes("?") ? "&" : "?";
  const params = new URLSearchParams();
  params.set("code", code);
  if (state) params.set("state", state);
  return `${redirectUri}${separator}${params.toString()}`;
};

export const completeDesktopAuth = async ({ token, redirectUri, state }) => {
  if (!token) {
    throw new Error("Missing browser auth token");
  }

  if (!redirectUri) {
    throw new Error("Missing desktop redirect URI");
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/desktop/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      redirectUri,
      state,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || "Could not authorize desktop app");
    error.status = res.status;
    throw error;
  }

  window.location.href = buildCallbackUrl({
    redirectUri,
    code: data.code,
    state: data.state || state,
  });
};
