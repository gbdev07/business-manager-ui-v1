import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api/config";
import { messageFromPayload } from "@/lib/api/errors";
import { clearAuth, persistAuth, refreshAccessToken } from "@/lib/api/server";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { sessionFromSwitchPayload } from "@/lib/auth/tenant-context";
import type { AuthResponse } from "@/types/contracts";

const tenantIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const tenantId = typeof body === "object" && body && "tenantId" in body ? String(body.tenantId ?? "") : "";
  if (!tenantIdPattern.test(tenantId)) {
    return NextResponse.json({ message: "Selecione uma empresa válida." }, { status: 400 });
  }

  const jar = await cookies();
  let access = jar.get(ACCESS_COOKIE)?.value;
  if (!access) access = (await refreshAccessToken()) ?? undefined;
  if (!access) {
    await clearAuth();
    return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  }

  return completeSwitch(access, tenantId, 0);
}

async function completeSwitch(access: string, tenantId: string, attempt: number): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(apiUrl("auth/tenants/switch"), {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ tenantId }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: messageFromPayload(null, 0).message }, { status: 503 });
  }

  const payload = await response.json().catch(() => null);
  if (response.status === 401 && attempt === 0) {
    const fresh = await refreshAccessToken();
    if (fresh) return completeSwitch(fresh, tenantId, 1);
    await clearAuth();
    return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  }

  if (!response.ok) {
    const parsed = messageFromPayload(payload, response.status);
    const message = response.status === 403 ? "Você não tem acesso a esta empresa." : parsed.message;
    return NextResponse.json({ message }, { status: response.status });
  }

  const session = sessionFromSwitchPayload(payload);
  if (!session || !hasReplacementTokens(payload)) {
    return NextResponse.json({ message: "Não foi possível trocar de empresa. Tente novamente." }, { status: 502 });
  }

  await persistAuth(payload);
  return NextResponse.json({ user: session.user });
}

function hasReplacementTokens(payload: unknown): payload is AuthResponse {
  if (!payload || typeof payload !== "object") return false;
  const body = payload as Partial<AuthResponse>;
  return typeof body.accessToken === "string" && body.accessToken.length > 0 && typeof body.refreshToken === "string" && body.refreshToken.length > 0 && typeof body.expiresIn === "number";
}
