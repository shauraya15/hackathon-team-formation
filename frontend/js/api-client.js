const API_BASE = window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api";

function getApiToken() {
  return localStorage.getItem("formfactorApiToken");
}

function setApiSession(token, account) {
  localStorage.setItem("formfactorApiToken", token);
  localStorage.setItem("formfactorApiAccount", JSON.stringify(account));
}

function clearApiSession() {
  localStorage.removeItem("formfactorApiToken");
  localStorage.removeItem("formfactorApiAccount");
}

function getApiAccount() {
  try {
    return JSON.parse(localStorage.getItem("formfactorApiAccount")) || null;
  } catch (error) {
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getApiToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}.`);
  return body;
}

async function apiGet(path) {
  return apiRequest(path);
}

async function apiPost(path, body) {
  return apiRequest(path, { method: "POST", body: JSON.stringify(body) });
}
