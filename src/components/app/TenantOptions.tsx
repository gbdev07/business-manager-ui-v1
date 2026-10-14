import { Check, ChevronDown } from "lucide-react";
import { membershipRoleLabel, type TenantMenuMode } from "@/lib/auth/tenant-context";
import type { AccessibleTenant } from "@/types/contracts";

export function TenantOptions({
  mode,
  tenants,
  currentName,
  open,
  pendingId,
  error,
  menuId,
  activeId,
  onToggle,
  onSelect,
  onRetry,
}: {
  mode: TenantMenuMode;
  tenants: AccessibleTenant[];
  currentName: string;
  open: boolean;
  pendingId: string | null;
  error: string | null;
  menuId: string;
  activeId: string | null;
  onToggle: () => void;
  onSelect: (tenant: AccessibleTenant) => void;
  onRetry: () => void;
}) {
  const label = currentName || "Empresa";

  if (mode === "loading") {
    return (
      <p className="truncate text-sm font-medium" role="status">
        {currentName || "Carregando empresa…"}
      </p>
    );
  }

  if (mode === "error") {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <p className="truncate text-sm font-medium">{label}</p>
        <button type="button" className="shrink-0 text-xs font-medium text-primary-text" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (mode === "empty") {
    return <p className="truncate text-sm font-medium">Nenhuma empresa disponível</p>;
  }

  if (mode === "single") {
    return <p className="max-w-[12rem] truncate text-sm font-medium sm:max-w-xs">{tenants[0]?.name ?? label}</p>;
  }

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        className="flex max-w-[12rem] items-center gap-1 rounded-sm px-1 py-1 text-sm font-medium hover:bg-surface sm:max-w-xs"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-busy={pendingId !== null || undefined}
        onClick={onToggle}
      >
        <span className="truncate">{label}</span>
        <ChevronDown aria-hidden size={16} className={open ? "shrink-0 rotate-180 transition-transform" : "shrink-0 transition-transform"} />
      </button>
      {open ? (
        <div id={menuId} role="menu" aria-label="Empresas" className="absolute left-0 z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-sm border border-border bg-surface-raised p-1 shadow-[var(--koda-shadow-md)]">
          {error ? (
            <p role="alert" className="px-2 py-2 text-xs text-danger-foreground">
              {error}
            </p>
          ) : null}
          <ul className="grid">
            {tenants.map((item) => {
              const current = item.id === activeId;
              const pending = pendingId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left hover:bg-surface disabled:opacity-40"
                    aria-current={current ? "true" : undefined}
                    disabled={pendingId !== null}
                    onClick={() => onSelect(item)}
                  >
                    <Check aria-hidden size={16} className={current ? "mt-0.5 shrink-0 text-primary-text" : "mt-0.5 shrink-0 opacity-0"} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.name}</span>
                      <span className="block truncate text-xs text-muted">{pending ? "Trocando…" : membershipRoleLabel(item.role)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
