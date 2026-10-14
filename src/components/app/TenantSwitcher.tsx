"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { TenantOptions } from "@/components/app/TenantOptions";
import { useNotify, useSession } from "@/components/app/providers";
import { ApiError } from "@/lib/api/errors";
import { listAccessibleTenants, switchActiveTenant } from "@/lib/auth/tenant-client";
import { applyTenantSwitch, canRequestSwitch, currentTenantId, dropTenantCache, tenantMenuMode } from "@/lib/auth/tenant-context";
import type { AccessibleTenant } from "@/types/contracts";

export function TenantSwitcher() {
  const { tenant } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["auth", "tenants"], queryFn: listAccessibleTenants });
  const tenants = query.data ?? [];
  const mode = tenantMenuMode(query.isLoading ? "loading" : query.isError ? "error" : "ready", tenants);
  const activeId = currentTenantId(tenants, tenant?.id ?? null);
  const currentName = tenants.find((item) => item.id === activeId)?.name ?? tenant?.name ?? "";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function select(target: AccessibleTenant) {
    if (!canRequestSwitch(pendingId, target.id, activeId)) {
      setOpen(false);
      return;
    }
    setPendingId(target.id);
    setError(null);
    try {
      await applyTenantSwitch({
        tenantId: target.id,
        pathname,
        switchRequest: switchActiveTenant,
        clearCache: () => dropTenantCache(queryClient),
        navigate: (href) => router.push(href),
        refresh: () => router.refresh(),
      });
      setOpen(false);
      notify.success(`Empresa alterada para ${target.name}.`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível trocar de empresa. Tente novamente.");
      setOpen(true);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div ref={rootRef} className="min-w-0">
      <TenantOptions
        mode={mode}
        tenants={tenants}
        currentName={currentName}
        open={open}
        pendingId={pendingId}
        error={error}
        menuId={menuId}
        activeId={activeId}
        onToggle={() => setOpen((current) => !current)}
        onSelect={(target) => void select(target)}
        onRetry={() => void query.refetch()}
      />
    </div>
  );
}
