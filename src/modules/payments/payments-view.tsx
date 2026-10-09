"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotify, useSession } from "@/components/app/providers";
import { PaginationBar } from "@/components/data-display/PaginationBar";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "@/components/feedback/States";
import { SelectField, TextAreaField } from "@/components/forms/Fields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Dialog } from "@/components/overlay/Dialog";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { TextField } from "@/components/ui/TextField";
import { api, toSearch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { formatDate, formatMoney, localInputToIso, omitEmpty } from "@/lib/format";
import { paymentGatewayLabel, paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import { paymentSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { Customer, Paginated, Payment, PaymentGatewayStatus, PaymentMethod } from "@/types/contracts";

const methods = Object.keys(paymentMethodLabel) as PaymentMethod[];

type PaymentValues = {
  amount: number;
  gateway: string;
  method: string;
  customerId: string;
  description: string;
  dueDate: string;
};

export function PaymentsView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "payments:manage");
  const [open, setOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const notify = useNotify();
  const client = useQueryClient();
  const enabled = hasPermission(user.permissions, "payments:read");
  const query = useQuery({
    queryKey: ["payments", listing.page, listing.status],
    enabled,
    queryFn: () => api<Paginated<Payment>>(`payments${toSearch({ page: listing.page, limit: "20", status: listing.status || undefined })}`),
  });
  const gateways = useQuery({
    queryKey: ["payments", "gateways"],
    enabled,
    queryFn: () => api<PaymentGatewayStatus[]>("payments/gateways"),
  });
  const action = useMutation({
    mutationFn: ({ id, kind }: { id: string; kind: "confirm" | "cancel" | "sync" }) =>
      kind === "sync"
        ? api(`payments/${id}/sync`, { method: "POST" })
        : api(`payments/${id}/${kind}`, { method: "PATCH", body: kind === "confirm" ? {} : undefined }),
    onSuccess: () => {
      notify.success("Pagamento atualizado.");
      setCancelId(null);
      void client.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: notify.failure,
  });
  const unavailable = (gateways.data ?? []).filter((gateway) => !gateway.available);

  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader title="Pagamentos" description="Cobranças do negócio. Gateways externos só podem ser usados quando a API os marca como disponíveis." actions={canManage ? <Button onClick={() => setOpen(true)}>Registrar pagamento</Button> : null} />
      {unavailable.length > 0 ? (
        <Alert tone="danger" title="Integrações indisponíveis">
          {unavailable.map((gateway) => paymentGatewayLabel[gateway.gateway]).join(", ")} ainda não estão integrados. Nenhuma cobrança será simulada nesses canais.
        </Alert>
      ) : null}
      <SelectField id="payment-status" aria-label="Status do pagamento" className="max-w-xs" value={listing.status} onChange={(event) => listing.setParams({ status: event.target.value || null })}>
        <option value="">Todos os status</option>
        {Object.entries(paymentStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </SelectField>
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="Não foi possível carregar os pagamentos." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} /> : null}
      {query.data?.data.length === 0 ? <EmptyState title="Nenhum pagamento encontrado" description="Os pagamentos registrados aparecem aqui." /> : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable caption="Pagamentos" rows={query.data.data} columns={[
            { key: "date", header: "Data", render: (row) => formatDate(row.createdAt) },
            { key: "amount", header: "Valor", render: (row) => formatMoney(row.amount, row.currency) },
            { key: "method", header: "Método", render: (row) => paymentMethodLabel[row.method ?? ""] ?? "—" },
            { key: "gateway", header: "Gateway", render: (row) => paymentGatewayLabel[row.gateway] ?? row.gateway },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} labels={paymentStatusLabel} /> },
            {
              key: "actions",
              header: "Ações",
              render: (row) => canManage ? (
                <div className="flex flex-wrap gap-2">
                  {row.status === "PENDING" && row.gateway === "MANUAL" ? <Button size="sm" variant="secondary" onClick={() => action.mutate({ id: row.id, kind: "confirm" })}>Confirmar</Button> : null}
                  {row.gateway !== "MANUAL" ? <Button size="sm" variant="secondary" onClick={() => action.mutate({ id: row.id, kind: "sync" })}>Sincronizar</Button> : null}
                  {row.checkoutUrl ? <a className="text-sm text-primary-text" href={row.checkoutUrl} target="_blank" rel="noreferrer">Checkout</a> : null}
                  {row.status === "PENDING" ? <Button size="sm" variant="secondary" onClick={() => setCancelId(row.id)}>Cancelar</Button> : null}
                </div>
              ) : "—",
            },
          ]} />
          <PaginationBar page={query.data.meta.page} totalPages={query.data.meta.totalPages} total={query.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
        </Card>
      ) : null}
      {open && gateways.data ? <PaymentDialog gateways={gateways.data} onClose={() => setOpen(false)} /> : null}
      <ConfirmDialog open={Boolean(cancelId)} title="Cancelar pagamento" description="O pagamento pendente será cancelado na API." confirmLabel="Cancelar pagamento" pending={action.isPending} onClose={() => setCancelId(null)} onConfirm={() => cancelId && action.mutate({ id: cancelId, kind: "cancel" })} />
    </section>
  );
}

function PaymentDialog({ gateways, onClose }: { gateways: PaymentGatewayStatus[]; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const available = gateways.filter((gateway) => gateway.available);
  const fallback = available.find((gateway) => gateway.isDefault)?.gateway ?? available[0]?.gateway ?? "";
  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, gateway: fallback, method: "", customerId: "", description: "", dueDate: "" },
  });
  const customers = useQuery({ queryKey: ["customers", "options"], queryFn: () => api<Paginated<Customer>>("customers?limit=100&isActive=true") });
  const mutation = useMutation({
    mutationFn: (values: PaymentValues) =>
      api("payments", {
        method: "POST",
        body: omitEmpty({
          amount: values.amount,
          gateway: values.gateway,
          method: values.method,
          customerId: values.customerId,
          description: values.description,
          dueDate: values.dueDate ? localInputToIso(`${values.dueDate}T12:00:00`) : undefined,
        }),
      }),
    onSuccess: () => {
      notify.success("Pagamento registrado.");
      void client.invalidateQueries({ queryKey: ["payments"] });
      onClose();
    },
    onError: notify.failure,
  });

  return (
    <Dialog open title="Registrar pagamento" description={available.length === 0 ? "Nenhum gateway está disponível." : "Use apenas gateways marcados como disponíveis."} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="payment-amount" label="Valor" type="number" step="0.01" min="0.01" error={form.formState.errors.amount?.message} {...form.register("amount", { valueAsNumber: true })} />
        <SelectField id="payment-gateway" label="Gateway" error={form.formState.errors.gateway?.message} {...form.register("gateway")}>
          {gateways.map((gateway) => (
            <option key={gateway.gateway} value={gateway.gateway} disabled={!gateway.available}>
              {paymentGatewayLabel[gateway.gateway]}{gateway.available ? "" : " — indisponível"}
            </option>
          ))}
        </SelectField>
        <SelectField id="payment-method" label="Método" {...form.register("method")}>
          <option value="">Não informado</option>
          {methods.map((method) => <option key={method} value={method}>{paymentMethodLabel[method]}</option>)}
        </SelectField>
        <SelectField id="payment-customer" label="Cliente" {...form.register("customerId")}>
          <option value="">Sem cliente</option>
          {customers.data?.data.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
        </SelectField>
        <TextField id="payment-due" label="Vencimento" type="date" {...form.register("dueDate")} />
        <TextAreaField id="payment-description" label="Descrição" {...form.register("description")} />
        <Button type="submit" disabled={mutation.isPending || available.length === 0}>{mutation.isPending ? "Salvando…" : "Registrar"}</Button>
      </form>
    </Dialog>
  );
}
