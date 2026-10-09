"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Header, Sidebar } from "@/components/app/AppChrome";
import { QueryProvider, SessionProvider, ToastProvider } from "@/components/app/providers";
import { Alert } from "@/components/ui/Alert";
import type { AuthUser, Tenant } from "@/types/contracts";

const listeners = new Set<() => void>();

function subscribeSidebar(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readCollapsed() {
  return window.localStorage.getItem("koda-sidebar") === "collapsed";
}

function setSidebarCollapsed(collapsed: boolean) {
  window.localStorage.setItem("koda-sidebar", collapsed ? "collapsed" : "open");
  listeners.forEach((listener) => listener());
}

export function AppShell({
  user,
  tenant,
  tenantWarning,
  children,
}: {
  user: AuthUser;
  tenant: Tenant | null;
  tenantWarning?: string | null;
  children: ReactNode;
}) {
  const collapsed = useSyncExternalStore(subscribeSidebar, readCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SessionProvider value={{ user, tenant }}>
      <QueryProvider>
        <ToastProvider>
          <div className="min-h-screen bg-background text-foreground lg:flex">
            <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
            <div className="min-w-0 flex-1">
              <Header
                collapsed={collapsed}
                onToggleCollapse={() => setSidebarCollapsed(!collapsed)}
                onOpenMobile={() => setMobileOpen(true)}
              />
              <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:px-6">
                {tenantWarning ? (
                  <Alert tone="danger" title="Não foi possível carregar o negócio">
                    {tenantWarning}
                  </Alert>
                ) : null}
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
