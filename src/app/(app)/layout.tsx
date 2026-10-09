import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { LoadingState } from "@/components/feedback/States";
import { loadSession } from "@/lib/api/server";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingState label="Carregando sessão…" />}>
      <AuthenticatedFrame>{children}</AuthenticatedFrame>
    </Suspense>
  );
}

async function AuthenticatedFrame({ children }: { children: React.ReactNode }) {
  const session = await loadSession();
  if (session.kind === "anonymous") redirect("/login");
  if (session.kind === "refresh") {
    const headerStore = await headers();
    const nextPath = headerStore.get("x-koda-path") || "/dashboard";
    redirect(`/api/auth/continue?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <AppShell
      user={session.user}
      tenant={session.kind === "ok" ? session.tenant : null}
      tenantWarning={session.kind === "tenant-error" ? session.message : null}
    >
      {children}
    </AppShell>
  );
}
