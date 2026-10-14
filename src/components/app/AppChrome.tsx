"use client";

import {
  Bell,
  CalendarClock,
  Contact,
  HandCoins,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  Repeat,
  Scissors,
  Settings,
  UserRound,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { useSession } from "@/components/app/providers";
import type { NavIcon } from "@/config/navigation";
import { visibleNavigation, navigation } from "@/config/navigation";
import { businessTypeLabel } from "@/lib/labels";
import { cx } from "@/lib/cx";
import { TenantSwitcher } from "@/components/app/TenantSwitcher";
import { dropTenantCache } from "@/lib/auth/tenant-context";
import { hasPermission } from "@/lib/permissions";

const icons: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  customers: Contact,
  services: Scissors,
  products: Package,
  sales: Receipt,
  appointments: CalendarClock,
  barbers: UserRound,
  payments: Wallet,
  subscriptions: Repeat,
  commissions: HandCoins,
  users: Users,
  notifications: Bell,
  settings: Settings,
};

const crumbs: Record<string, string> = {
  dashboard: "Painel",
  customers: "Clientes",
  services: "Serviços",
  products: "Produtos",
  sales: "Vendas",
  payments: "Pagamentos",
  subscriptions: "Assinaturas",
  users: "Usuários",
  notifications: "Notificações",
  settings: "Configurações",
  security: "Segurança",
  barbershop: "Barbearia",
  barbers: "Profissionais",
  appointments: "Agendamentos",
  commissions: "Comissões",
};

export function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { user, tenant } = useSession();
  const groups = visibleNavigation(navigation, {
    permissions: user.permissions,
    businessType: tenant?.businessType ?? user.businessType,
  });

  const content = (
    <div className="flex h-full flex-col bg-nav text-nav-foreground">
      <div className={cx("flex items-center gap-3 px-4 py-5", collapsed && "lg:justify-center lg:px-2")}>
        <Logo variant={collapsed ? "symbol-on-dark" : "on-dark"} className={collapsed ? "h-8 w-8 lg:h-8" : "h-8 w-auto"} alt="KODA" />
      </div>
      <div className={cx("px-4 pb-4", collapsed && "lg:hidden")}>
        <p className="text-xs tracking-[0.14em] text-ivory/55 uppercase">Negócio</p>
        <p className="mt-1 truncate text-sm font-medium">{tenant?.name ?? "Carregando negócio"}</p>
        <p className="text-xs text-ivory/60">{businessTypeLabel[tenant?.businessType ?? user.businessType] ?? user.businessType}</p>
      </div>
      <nav aria-label="Módulos" className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map((group) => (
          <div key={group.id} className="mt-4">
            <p className={cx("px-3 pb-1 text-xs tracking-[0.14em] text-ivory/45 uppercase", collapsed && "lg:sr-only")}>{group.label}</p>
            <ul className="grid gap-1">
              {group.items.map((item) => {
                const Icon = icons[item.icon];
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={cx(
                        "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                        active ? "bg-white/15 text-ivory" : "text-ivory/75 hover:bg-white/10 hover:text-ivory",
                        collapsed && "lg:justify-center lg:px-2",
                      )}
                    >
                      <Icon aria-hidden size={18} />
                      <span className={cx(collapsed && "lg:sr-only")}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <aside className={cx("sticky top-0 hidden h-screen shrink-0 lg:block", collapsed ? "w-16" : "w-64")}>{content}</aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-graphite/50" aria-label="Fechar menu" onClick={onNavigate} />
          <div className="relative h-full w-72 max-w-[85vw]">{content}</div>
        </div>
      ) : null}
    </>
  );
}

export function Header({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const parts = pathname.split("/").filter(Boolean);

  async function logout() {
    await dropTenantCache(queryClient);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-sm hover:bg-surface lg:hidden" onClick={onOpenMobile}>
        <Menu aria-hidden size={18} />
        <span className="sr-only">Abrir menu</span>
      </button>
      <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-sm hover:bg-surface lg:inline-flex" onClick={onToggleCollapse} aria-pressed={collapsed}>
        {collapsed ? <Menu aria-hidden size={18} /> : <X aria-hidden size={18} />}
        <span className="sr-only">{collapsed ? "Expandir menu" : "Recolher menu"}</span>
      </button>
      <nav aria-label="Trilha" className="min-w-0 flex-1">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li className="min-w-0 font-medium text-foreground">
            <TenantSwitcher />
          </li>
          {parts.map((part, index) => (
            <li key={`${part}-${index}`} className="flex items-center gap-2">
              <span aria-hidden>/</span>
              <span className={index === parts.length - 1 ? "text-foreground" : undefined}>{crumbs[part] ?? "Detalhe"}</span>
            </li>
          ))}
        </ol>
      </nav>
      {hasPermission(user.permissions, "tenant:read") ? (
        <Link href="/notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-sm hover:bg-surface" aria-label="Canais de notificação">
          <Bell aria-hidden size={18} />
        </Link>
      ) : null}
      <ThemeToggle />
      <details className="relative">
        <summary className="cursor-pointer list-none rounded-sm px-2 py-1 text-sm hover:bg-surface">
          <span className="block font-medium">{user.name}</span>
          <span className="block text-xs text-muted">{user.role}</span>
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-sm border border-border bg-surface-raised p-2 shadow-[var(--koda-shadow-md)]">
          <p className="px-2 py-1 text-xs text-muted">{user.email}</p>
          <Link href="/settings/security" className="block rounded-sm px-2 py-2 text-sm hover:bg-surface">
            Segurança
          </Link>
          <Link href="/settings" className="block rounded-sm px-2 py-2 text-sm hover:bg-surface">
            Configurações
          </Link>
          <button type="button" className="block w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-surface" onClick={logout}>
            Sair
          </button>
        </div>
      </details>
    </header>
  );
}
