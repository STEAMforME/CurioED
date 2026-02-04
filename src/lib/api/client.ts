const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(text || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "GET" }, token),
  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      token
    ),
  patch: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(
      path,
      { method: "PATCH", body: JSON.stringify(body) },
      token
    ),
  del: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "DELETE" }, token),
};
