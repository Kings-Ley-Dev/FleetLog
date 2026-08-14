"use client";

/** Thin fetch wrapper for calling FleetLog's own API routes from Client
 * Components: always sends cookies, always parses JSON, and normalizes
 * errors into a single Error so callers can just try/catch. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError((data && data.error) || "Something went wrong.", res.status);
  }
  return data as T;
}
