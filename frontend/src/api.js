const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

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