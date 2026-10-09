"use client";

import { ApiError, messageFromPayload } from "@/lib/api/errors";

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/backend/${path}`, {
      method: init?.method ?? "GET",
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        ...(init?.body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, messageFromPayload(null, 0).message);
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("koda:unauthorized"));
    }
    const parsed = messageFromPayload(payload, response.status);
    throw new ApiError(response.status, parsed.message, parsed.detail);
  }

  return payload as T;
}

export function toSearch(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
