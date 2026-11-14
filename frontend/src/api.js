const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "ptm_token";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = auth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  const isAuthForm = path === "/auth/login" || path === "/auth/register";
  if (res.status === 401 && !isAuthForm) {
    auth.clear();
    onUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail.map((d) => d.msg).join(", ");
      }
    } catch {
      // response had no JSON body, keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me: () => request("/auth/me"),

  getProjects: () => request("/projects"),

  getStats: () => request("/stats"),

  createProject: (data) =>
    request("/projects", { method: "POST", body: JSON.stringify(data) }),

  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE" }),

  createTask: (projectId, data) =>
    request(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });
    const qs = query.toString();
    return request(`/tasks${qs ? `?${qs}` : ""}`);
  },

  updateTaskStatus: (id, status) =>
    request(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};