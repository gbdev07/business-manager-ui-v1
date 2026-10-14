import { navigation, visibleNavigation } from "@/config/navigation";
import type { AccessibleTenant, AuthUser } from "@/types/contracts";

const roleLabels: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  EMPLOYEE: "Equipe",
};

export function membershipRoleLabel(role: string) {
  return roleLabels[role] ?? role;
}

export function sessionFromSwitchPayload(payload: unknown): { user: AuthUser } | null {
  if (!payload || typeof payload !== "object" || !("user" in payload)) return null;
  const user = (payload as { user?: unknown }).user;
  if (!isAuthUser(user)) return null;
  return { user };
}

export function canRequestSwitch(pendingId: string | null, targetId: string, currentId: string | null) {
  if (pendingId) return false;
  return targetId !== currentId;
}

export function pathAfterTenantSwitch(pathname: string, user: Pick<AuthUser, "permissions" | "businessType">) {
  if (pathname === "/settings/security" || pathname.startsWith("/settings/security/")) return pathname;
  const items = visibleNavigation(navigation, {
    permissions: user.permissions,
    businessType: user.businessType,
  }).flatMap((group) => group.items);
  const allowed = items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (allowed) return pathname;
  return items.find((item) => item.href === "/dashboard")?.href ?? items[0]?.href ?? "/settings/security";
}

export async function dropTenantCache(cache: { cancelQueries: () => Promise<unknown>; clear: () => void }) {
  await cache.cancelQueries();
  cache.clear();
}

export async function applyTenantSwitch(input: {
  tenantId: string;
  pathname: string;
  switchRequest: (tenantId: string) => Promise<AuthUser>;
  clearCache: () => Promise<void>;
  navigate: (href: string) => void;
  refresh: () => void;
}) {
  const user = await input.switchRequest(input.tenantId);
  await input.clearCache();
  const href = pathAfterTenantSwitch(input.pathname, user);
  if (href !== input.pathname) input.navigate(href);
  input.refresh();
  return { user, href };
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<AuthUser>;
  return Boolean(
    typeof user.id === "string" &&
      user.id &&
      typeof user.tenantId === "string" &&
      user.tenantId &&
      typeof user.businessType === "string" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      typeof user.role === "string" &&
      Array.isArray(user.permissions),
  );
}

export function currentTenantId(tenants: readonly AccessibleTenant[], fallback: string | null) {
  return tenants.find((tenant) => tenant.isCurrent)?.id ?? fallback;
}

export type TenantMenuMode = "loading" | "error" | "empty" | "single" | "multiple";

export function tenantMenuMode(status: "loading" | "error" | "ready", tenants: readonly AccessibleTenant[]): TenantMenuMode {
  if (status === "loading") return "loading";
  if (status === "error") return "error";
  if (tenants.length === 0) return "empty";
  if (tenants.length === 1) return "single";
  return "multiple";
}
