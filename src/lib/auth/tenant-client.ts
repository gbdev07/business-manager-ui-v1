"use client";

import { api } from "@/lib/api/client";
import { ApiError, messageFromPayload } from "@/lib/api/errors";
import { sessionFromSwitchPayload } from "@/lib/auth/tenant-context";
import type { AccessibleTenant, AuthUser } from "@/types/contracts";

export function listAccessibleTenants() {
  return api<AccessibleTenant[]>("auth/tenants");
}

export async function switchActiveTenant(tenantId: string): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch("/api/auth/switch-tenant", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ tenantId }),
    });
  } catch {
    throw new ApiError(0, messageFromPayload(null, 0).message);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event("koda:unauthorized"));
    const parsed = messageFromPayload(payload, response.status);
    throw new ApiError(response.status, parsed.message, parsed.detail);
  }

  const session = sessionFromSwitchPayload(payload);
  if (!session) throw new ApiError(500, "Não foi possível trocar de empresa. Tente novamente.");
  return session.user;
}
