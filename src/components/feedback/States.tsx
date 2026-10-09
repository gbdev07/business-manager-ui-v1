import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="grid gap-3" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="h-8 w-48 animate-pulse rounded-sm bg-surface" />
      <div className="h-28 animate-pulse rounded-sm bg-surface" />
      <div className="h-28 animate-pulse rounded-sm bg-surface" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-border px-6 py-10 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  detail,
  onRetry,
}: {
  title: string;
  description: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-sm border border-danger-foreground/30 bg-danger-wash px-5 py-4 text-danger-foreground">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-sm">{description}</p>
      {detail && process.env.NODE_ENV === "development" ? <p className="mt-2 text-xs">{detail}</p> : null}
      {onRetry ? (
        <Button className="mt-4" variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function ForbiddenState() {
  return (
    <div className="rounded-sm border border-border bg-surface-raised px-5 py-8">
      <h1 className="text-lg font-semibold">Acesso não permitido</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Sua conta não tem permissão para esta área. A autorização continua sendo validada pela API.
      </p>
    </div>
  );
}
