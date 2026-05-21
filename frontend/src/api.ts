const API = "/api";

function headers(): HeadersInit {
  const token = localStorage.getItem("agrosat_token");
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const authApi = {
  register: (body: object) => api<{ access_token: string; profile_complete: boolean }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: object) => api<{ access_token: string; profile_complete: boolean }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => api<Record<string, unknown>>("/auth/me"),
  updateProfile: (body: object) => api("/auth/profile", { method: "PATCH", body: JSON.stringify(body) }),
};
