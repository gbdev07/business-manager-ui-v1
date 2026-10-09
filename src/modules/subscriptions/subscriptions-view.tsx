"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotify, useSession } from "@/components/app/providers";
import { PaginationBar } from "@/components/data-display/PaginationBar";
import { ActiveBadge, StatusBadge } from "@/components/data-display/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "@/components/feedback/States";
import { SelectField, TextAreaField } from "@/components/forms/Fields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Dialog } from "@/components/overlay/Dialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { TextField } from "@/components/ui/TextField";
import { api, toSearch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { formatDate, formatMoney, omitEmpty } from "@/lib/format";
import { billingIntervalLabel, subscriptionStatusLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import { planSchema, subscriptionSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { BillingInterval, Customer, Paginated, Subscription, SubscriptionPlan, SubscriptionStatus } from "@/types/contracts";

const intervals = Object.keys(billingIntervalLabel) as BillingInterval[];

export function SubscriptionsView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "subscriptions:manage");
  const enabled = hasPermission(user.permissions, "subscriptions:read");
  const [planOpen, setPlanOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const notify = useNotify();
  const client = useQueryClient();
  const plans = useQuery({
    queryKey: ["subscription-plans", listing.page],
    enabled,
    queryFn: () => api<Paginated<SubscriptionPlan>>(`subscription-plans${toSearch({ page: listing.page, limit: "20" })}`),
  });
  const subscriptions = useQuery({
    queryKey: ["subscriptions", listing.page, listing.status],
    enabled,
    queryFn: () => api<Paginated<Subscription>>(`subscriptions${toSearch({ page: listing.page, limit: "20", status: listing.status || undefined })}`),
  });
  const expiring = useQuery({
    queryKey: ["subscriptions", "expiring"],
    enabled,
    queryFn: () => api<Subscription[]>("subscriptions/expiring?days=7"),
  });
  const mutate = useMutation({
    mutationFn: async (input: { kind: "renew" | "cancel" | "lifecycle"; id?: string; reason?: string }) => {
      if (input.kind === "lifecycle") return api<{ expired: number; reminded: number }>("subscriptions/lifecycle/run", { method: "POST" });
      if (input.kind === "renew" && input.id) return api(`subscriptions/${input.id}/renew`, { method: "PATCH" });
      return api(`subscriptions/${input.id}/cancel`, { method: "PATCH", body: omitEmpty({ reason: input.reason }) });
    },
    onSuccess: (result, input) => {
      if (input.kind === "lifecycle" && result && typeof result === "object" && "expired" in result && "reminded" in result) {
        const summary = result as { expired: number; reminded: number };
        notify.success(`${summary.expired} assinatura(s) expirada(s), ${summary.reminded} lembrete(s) processado(s).`);
      } else {
        notify.success("Assinatura atualizada.");
      }
      setCancelId(null);
      void client.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: notify.failure,
  });

  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-8">
      <PageHeader
        title="Assinaturas"
        description="Planos e contratos do negócio. A renovação aqui estende o período; ela não cobra um gateway automaticamente."
        actions={canManage ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => mutate.mutate({ kind: "lifecycle" })} disabled={mutate.isPending}>Processar vencimentos</Button>
            <Button variant="secondary" onClick={() => setPlanOpen(true)}>Novo plano</Button>
            <Button onClick={() => setSubOpen(true)}>Nova assinatura</Button>
          </div>
        ) : null}
      />
      {expiring.data && expiring.data.length > 0 ? (
        <Card>
          <h2 className="text-base font-semibold">Vencem em 7 dias</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {expiring.data.map((item) => (
              <li key={item.id}>{item.planName} · {formatDate(item.endDate)} · {formatMoney(item.price)}</li>
            ))}
          </ul>
        </Card>
      ) : null}
      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Planos</h2>
        {plans.isLoading ? <LoadingState /> : null}
        {plans.isError ? <ErrorState title="Não foi possível carregar os planos." description={plans.error instanceof ApiError ? plans.error.message : "Falha de conexão."} onRetry={() => plans.refetch()} /> : null}
        {plans.data?.data.length === 0 ? <EmptyState title="Nenhum plano" description="Cadastre um plano antes de criar assinaturas." /> : null}
        {plans.data && plans.data.data.length > 0 ? (
          <Card>
            <DataTable caption="Planos" rows={plans.data.data} columns={[
              { key: "name", header: "Plano", render: (row) => row.name },
              { key: "interval", header: "Intervalo", render: (row) => billingIntervalLabel[row.billingInterval] },
              { key: "days", header: "Duração", render: (row) => `${row.durationDays} dias` },
              { key: "price", header: "Valor", render: (row) => formatMoney(row.price, row.currency) },
              { key: "status", header: "Status", render: (row) => <ActiveBadge active={row.isActive} /> },
            ]} />
          </Card>
        ) : null}
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Contratos</h2>
          <select aria-label="Status da assinatura" className="h-11 rounded-sm border border-border bg-surface-raised px-3" value={listing.status} onChange={(event) => listing.setParams({ status: event.target.value || null })}>
            <option value="">Todos</option>
            {Object.entries(subscriptionStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {subscriptions.isLoading ? <LoadingState /> : null}
        {subscriptions.isError ? <ErrorState title="Não foi possível carregar as assinaturas." description={subscriptions.error instanceof ApiError ? subscriptions.error.message : "Falha de conexão."} onRetry={() => subscriptions.refetch()} /> : null}
        {subscriptions.data?.data.length === 0 ? <EmptyState title="Nenhuma assinatura" description="Os contratos dos clientes aparecem aqui." /> : null}
        {subscriptions.data && subscriptions.data.data.length > 0 ? (
          <Card className="grid gap-4">
            <DataTable caption="Assinaturas" rows={subscriptions.data.data} columns={[
              { key: "plan", header: "Plano", render: (row) => row.planName },
              { key: "price", header: "Valor", render: (row) => formatMoney(row.price) },
              { key: "start", header: "Início", render: (row) => formatDate(row.startDate) },
              { key: "end", header: "Expira", render: (row) => formatDate(row.endDate) },
              { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} labels={subscriptionStatusLabel} /> },
              { key: "renewal", header: "Preferência", render: (row) => row.autoRenew ? "Renovação registrada" : "Sem renovação automática" },
              {
                key: "actions",
                header: "Ações",
                render: (row) => canManage ? (
                  <div className="flex gap-2">
                    {canRenew(row.status) ? <Button size="sm" variant="secondary" onClick={() => mutate.mutate({ kind: "renew", id: row.id })}>Renovar período</Button> : null}
                    {canCancel(row.status) ? <Button size="sm" variant="ghost" onClick={() => setCancelId(row.id)}>Cancelar</Button> : null}
                  </div>
                ) : "—",
              },
            ]} />
            <PaginationBar page={subscriptions.data.meta.page} totalPages={subscriptions.data.meta.totalPages} total={subscriptions.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
          </Card>
        ) : null}
      </div>
      {planOpen ? <PlanDialog onClose={() => setPlanOpen(false)} /> : null}
      {subOpen ? <SubscriptionDialog onClose={() => setSubOpen(false)} /> : null}
      <ConfirmDialog open={Boolean(cancelId)} title="Cancelar assinatura" description="O contrato será cancelado. Isso não estorna pagamentos já registrados." confirmLabel="Cancelar assinatura" pending={mutate.isPending} onClose={() => setCancelId(null)} onConfirm={() => cancelId && mutate.mutate({ kind: "cancel", id: cancelId, reason })}>
        <TextAreaField id="cancel-reason" label="Motivo" value={reason} onChange={(event) => setReason(event.target.value)} />
      </ConfirmDialog>
    </section>
  );
}

function canRenew(status: SubscriptionStatus) {
  return status === "ACTIVE" || status === "EXPIRED";
}

function canCancel(status: SubscriptionStatus) {
  return status === "ACTIVE" || status === "PAUSED" || status === "EXPIRED";
}

function PlanDialog({ onClose }: { onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm({ resolver: zodResolver(planSchema), defaultValues: { name: "", description: "", price: 0, billingInterval: "MONTHLY" as BillingInterval, durationDays: 30 } });
  const mutation = useMutation({
    mutationFn: (values: { name: string; description: string; price: number; billingInterval: BillingInterval; durationDays: number }) =>
      api("subscription-plans", { method: "POST", body: omitEmpty(values) }),
    onSuccess: () => {
      notify.success("Plano cadastrado.");
      void client.invalidateQueries({ queryKey: ["subscription-plans"] });
      onClose();
    },
    onError: notify.failure,
  });
  return (
    <Dialog open title="Novo plano" onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="plan-name" label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
        <TextAreaField id="plan-description" label="Descrição" {...form.register("description")} />
        <TextField id="plan-price" label="Valor" type="number" step="0.01" min="0" error={form.formState.errors.price?.message} {...form.register("price", { valueAsNumber: true })} />
        <SelectField id="plan-interval" label="Intervalo" {...form.register("billingInterval")}>
          {intervals.map((interval) => <option key={interval} value={interval}>{billingIntervalLabel[interval]}</option>)}
        </SelectField>
        <TextField id="plan-days" label="Duração em dias" type="number" min="1" error={form.formState.errors.durationDays?.message} {...form.register("durationDays", { valueAsNumber: true })} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar plano"}</Button>
      </form>
    </Dialog>
  );
}

function SubscriptionDialog({ onClose }: { onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const plans = useQuery({ queryKey: ["subscription-plans", "options"], queryFn: () => api<Paginated<SubscriptionPlan>>("subscription-plans?limit=100&isActive=true") });
  const customers = useQuery({ queryKey: ["customers", "options"], queryFn: () => api<Paginated<Customer>>("customers?limit=100&isActive=true") });
  const form = useForm({ resolver: zodResolver(subscriptionSchema), defaultValues: { planId: "", customerId: "", startDate: "", autoRenew: false } });
  const mutation = useMutation({
    mutationFn: (values: { planId: string; customerId: string; startDate: string; autoRenew: boolean }) =>
      api("subscriptions", { method: "POST", body: omitEmpty({ ...values, startDate: values.startDate || undefined }) }),
    onSuccess: () => {
      notify.success("Assinatura criada.");
      void client.invalidateQueries({ queryKey: ["subscriptions"] });
      onClose();
    },
    onError: notify.failure,
  });
  return (
    <Dialog open title="Nova assinatura" description="A preferência de renovação fica registrada no contrato. A cobrança recorrente depende de um gateway disponível." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <SelectField id="sub-plan" label="Plano" error={form.formState.errors.planId?.message} {...form.register("planId")}>
          <option value="">Selecione</option>
          {plans.data?.data.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
        </SelectField>
        <SelectField id="sub-customer" label="Cliente" error={form.formState.errors.customerId?.message} {...form.register("customerId")}>
          <option value="">Selecione</option>
          {customers.data?.data.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
        </SelectField>
        <TextField id="sub-start" label="Início" type="date" hint="Opcional. Sem data, a API usa o momento atual." {...form.register("startDate")} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("autoRenew")} />
          Registrar preferência de renovação
        </label>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Criar assinatura"}</Button>
      </form>
    </Dialog>
  );
}
