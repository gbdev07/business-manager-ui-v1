"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "@/components/app/providers";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ErrorState, ForbiddenState, LoadingState } from "@/components/feedback/States";
import { api, toSearch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { dayRangeIso, formatMoney, formatNumber, monthStartInputValue, todayInputValue } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import type { DashboardMetric, DashboardOverview } from "@/types/contracts";

export function DashboardView() {
  const { user } = useSession();
  const [from, setFrom] = useState(monthStartInputValue);
  const [to, setTo] = useState(todayInputValue);
  const enabled = hasPermission(user.permissions, "dashboard:read");
  const query = useQuery({
    queryKey: ["dashboard", from, to],
    enabled,
    queryFn: () => {
      const start = dayRangeIso(from).from;
      const end = dayRangeIso(to).to;
      if (!start || !end) throw new ApiError(400, "Informe um período válido.");
      return api<DashboardOverview>(`dashboard${toSearch({ from: start, to: end })}`);
    },
  });

  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Painel"
        description="Indicadores do período retornados pela API. Não há série histórica neste contrato."
      />
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setFrom(String(data.get("from") ?? ""));
          setTo(String(data.get("to") ?? ""));
        }}
      >
        <TextField id="from" name="from" label="De" type="date" defaultValue={from} />
        <TextField id="to" name="to" label="Até" type="date" defaultValue={to} />
        <Button type="submit" variant="secondary">
          Atualizar
        </Button>
      </form>
      {query.isLoading ? <LoadingState label="Carregando indicadores…" /> : null}
      {query.isError ? (
        <ErrorState
          title="Não foi possível carregar o painel."
          description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."}
          detail={query.error instanceof ApiError ? query.error.detail : undefined}
          onRetry={() => query.refetch()}
        />
      ) : null}
      {query.data ? (
        <div className="grid gap-6">
          <MetricSection section={query.data.core} currency="BRL" />
          {query.data.modules.map((section) => (
            <MetricSection key={section.key} section={section} currency="BRL" />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MetricSection({
  section,
  currency,
}: {
  section: DashboardOverview["core"];
  currency: string;
}) {
  return (
    <div className="grid gap-3">
      <h2 className="text-sm font-medium tracking-[0.14em] text-muted uppercase">{section.label}</h2>
      {section.metrics.length === 0 ? (
        <p className="text-sm text-muted">Nenhum indicador neste bloco.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {section.metrics.map((metric) => (
            <Card key={metric.key}>
              <p className="text-sm text-muted">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{formatMetric(metric, currency)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function formatMetric(metric: DashboardMetric, currency: string) {
  if (metric.unit === "currency") return formatMoney(metric.value, currency);
  if (metric.unit === "percent") return `${formatNumber(Number(metric.value))} %`;
  return formatNumber(Number(metric.value));
}
