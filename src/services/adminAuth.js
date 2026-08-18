const ADMIN_SESSION_ENDPOINT = "/api/admin-session";
const CSRF_TOKEN_KEY = "gnz_csrf_token";

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await readJson(response);

    if (!response.ok || !payload.user) {
      return { success: false, error: payload.error || "Connexion impossible" };
    }

    return { success: true, user: payload.user };
  } catch {
    return { success: false, error: "Service administrateur indisponible" };
  }
};

export const logout = async () => {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: "DELETE",
      credentials: "same-origin",
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const getSession = async () => {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    const payload = await readJson(response);
    return response.ok && payload.authenticated ? payload.user : null;
  } catch {
    return null;
  }
};

export const generateCSRFToken = () => {
  if (typeof window === "undefined") return null;
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch {}
  return token;
};

export const getCSRFToken = () => {
  if (typeof window === "undefined") return null;
  let token = null;
  try {
    token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  } catch {}
  return token || generateCSRFToken();
};
