import { cookies } from "next/headers";
import { apiUrl } from "@/lib/api/config";
import { messageFromPayload } from "@/lib/api/errors";
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_MAX_AGE_SECONDS, authCookieOptions } from "@/lib/auth/cookies";
import type { AuthResponse, AuthUser, Tenant } from "@/types/contracts";

type SessionResult =
  | { kind: "ok"; user: AuthUser; tenant: Tenant }
  | { kind: "tenant-error"; user: AuthUser; message: string }
  | { kind: "refresh" }
  | { kind: "anonymous" };

let refreshing: Promise<boolean> | null = null;

export async function persistAuth(body: AuthResponse) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, body.accessToken, authCookieOptions(body.expiresIn));
  jar.set(REFRESH_COOKIE, body.refreshToken, authCookieOptions(REFRESH_MAX_AGE_SECONDS));
}

export async function clearAuth() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export function refreshSession() {
  refreshing ??= performRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function loadSession(): Promise<SessionResult> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!access) return refresh ? { kind: "refresh" } : { kind: "anonymous" };

  const me = await authorizedGet<AuthUser>("auth/me", access);
  if (me.status === 401) return { kind: "refresh" };
  if (!me.ok || !me.data) return { kind: "anonymous" };

  const tenant = await authorizedGet<Tenant>("tenants/current", access);
  if (tenant.status === 401) return { kind: "refresh" };
  if (!tenant.ok || !tenant.data) {
    return { kind: "tenant-error", user: me.data, message: tenant.message };
  }
  return { kind: "ok", user: me.data, tenant: tenant.data };
}

export async function proxyBackend(path: string, request: Request) {
  if (isSensitivePath(path)) {
    return Response.json({ message: "Use a rota de autenticação correspondente." }, { status: 400 });
  }

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  return forward(path, request.method, request.url, body, 0);
}

async function performRefresh() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return false;

  try {
    const response = await fetch(apiUrl("auth/refresh"), {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) {
      await clearAuth();
      return false;
    }
    const body = (await response.json()) as AuthResponse;
    await persistAuth(body);
    return true;
  } catch {
    return false;
  }
}

async function forward(path: string, method: string, requestUrl: string, body: string | undefined, attempt: number): Promise<Response> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const target = new URL(apiUrl(path));
  target.search = new URL(requestUrl).search;

  let response: Response;
  try {
    response = await fetch(target, {
      method,
      headers: {
        accept: "application/json",
        ...(body ? { "content-type": "application/json" } : {}),
        ...(access ? { authorization: `Bearer ${access}` } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    const parsed = messageFromPayload(null, 0);
    return Response.json({ message: parsed.message }, { status: 503 });
  }

  if (response.status === 401 && attempt === 0) {
    const refreshed = await refreshSession();
    if (refreshed) return forward(path, method, requestUrl, body, 1);
    await clearAuth();
  }

  const payload = await response.arrayBuffer();
  return new Response(payload, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}

async function authorizedGet<T>(path: string, access: string) {
  try {
    const response = await fetch(apiUrl(path), {
      headers: { accept: "application/json", authorization: `Bearer ${access}` },
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as T | null;
    if (!response.ok) {
      return { ok: false as const, status: response.status, message: messageFromPayload(payload, response.status).message, data: null };
    }
    return { ok: true as const, status: response.status, message: "", data: payload };
  } catch {
    return { ok: false as const, status: 0, message: messageFromPayload(null, 0).message, data: null };
  }
}

function isSensitivePath(path: string) {
  return /^auth\/(login|register|refresh|logout)$/.test(path);
}
