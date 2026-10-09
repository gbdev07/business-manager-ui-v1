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
import { SelectField } from "@/components/forms/Fields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Dialog } from "@/components/overlay/Dialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { TextField } from "@/components/ui/TextField";
import { api, toSearch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { formatDate, formatMoney, omitEmpty } from "@/lib/format";
import { commissionSourceLabel, commissionStatusLabel, commissionTypeLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import { commissionRuleSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { Barber, CatalogService, CommissionRule, CommissionType, Paginated, PaginatedCommissions, Product } from "@/types/contracts";

export function CommissionsView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "barbershop.commissions:manage");
  const enabled = hasPermission(user.permissions, "barbershop.commissions:read") && user.businessType === "BARBERSHOP";
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<{ id: string; kind: "pay" | "cancel" } | null>(null);
  const notify = useNotify();
  const client = useQueryClient();
  const rules = useQuery({
    queryKey: ["commission-rules"],
    enabled,
    queryFn: () => api<Paginated<CommissionRule>>("barbershop/commission-rules?limit=100"),
  });
  const commissions = useQuery({
    queryKey: ["commissions", listing.page, listing.status],
    enabled,
    queryFn: () => api<PaginatedCommissions>(`barbershop/commissions${toSearch({ page: listing.page, limit: "20", status: listing.status || undefined })}`),
  });
  const action = useMutation({
    mutationFn: (input: { id: string; kind: "pay" | "cancel" }) => api(`barbershop/commissions/${input.id}/${input.kind}`, { method: "PATCH" }),
    onSuccess: () => {
      notify.success("Comissão atualizada.");
      setTarget(null);
      void client.invalidateQueries({ queryKey: ["commissions"] });
    },
    onError: notify.failure,
  });

  if (user.businessType !== "BARBERSHOP") return <ForbiddenState />;
  if (!hasPermission(user.permissions, "barbershop.commissions:read")) return <ForbiddenState />;

  return (
    <section className="grid gap-8">
      <PageHeader title="Comissões" description="Regras e comissões calculadas pela API. O pagamento registrado aqui não transfere dinheiro para um banco." actions={canManage ? <Button onClick={() => setOpen(true)}>Nova regra</Button> : null} />
      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Regras</h2>
        {rules.isLoading ? <LoadingState /> : null}
        {rules.isError ? <ErrorState title="Não foi possível carregar as regras." description={rules.error instanceof ApiError ? rules.error.message : "Falha de conexão."} onRetry={() => rules.refetch()} /> : null}
        {rules.data?.data.length === 0 ? <EmptyState title="Nenhuma regra" description="Cadastre como a comissão é calculada." /> : null}
        {rules.data && rules.data.data.length > 0 ? (
          <Card>
            <DataTable caption="Regras de comissão" rows={rules.data.data} columns={[
              { key: "type", header: "Tipo", render: (row) => commissionTypeLabel[row.type] },
              { key: "value", header: "Valor", render: (row) => row.type === "PERCENTAGE" ? `${row.value}%` : formatMoney(row.value) },
              { key: "scope", header: "Escopo", render: (row) => row.barberId || row.serviceId || row.productId ? "Restrita" : "Geral" },
              { key: "status", header: "Status", render: (row) => <ActiveBadge active={row.isActive} /> },
            ]} />
          </Card>
        ) : null}
      </div>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Lançamentos</h2>
          <SelectField id="commission-status" aria-label="Status da comissão" className="w-full sm:w-48" value={listing.status} onChange={(event) => listing.setParams({ status: event.target.value || null })}>
            <option value="">Todos</option>
            {Object.entries(commissionStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </SelectField>
        </div>
        {commissions.data ? (
          <p className="text-sm text-muted">Pendente: {formatMoney(commissions.data.totals.pending)} · Pago: {formatMoney(commissions.data.totals.paid)}</p>
        ) : null}
        {commissions.isLoading ? <LoadingState /> : null}
        {commissions.isError ? <ErrorState title="Não foi possível carregar as comissões." description={commissions.error instanceof ApiError ? commissions.error.message : "Falha de conexão."} onRetry={() => commissions.refetch()} /> : null}
        {commissions.data?.data.length === 0 ? <EmptyState title="Nenhuma comissão" description="Os lançamentos gerados pela API aparecem aqui." /> : null}
        {commissions.data && commissions.data.data.length > 0 ? (
          <Card className="grid gap-4">
            <DataTable caption="Comissões" rows={commissions.data.data} columns={[
              { key: "barber", header: "Profissional", render: (row) => row.barberName },
              { key: "source", header: "Origem", render: (row) => commissionSourceLabel[row.source] },
              { key: "base", header: "Base", render: (row) => formatMoney(row.baseAmount) },
              { key: "amount", header: "Comissão", render: (row) => formatMoney(row.amount) },
              { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} labels={commissionStatusLabel} /> },
              { key: "date", header: "Data", render: (row) => formatDate(row.createdAt) },
              {
                key: "actions",
                header: "Ações",
                render: (row) => canManage && row.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setTarget({ id: row.id, kind: "pay" })}>Marcar como paga</Button>
                    <Button size="sm" variant="secondary" onClick={() => setTarget({ id: row.id, kind: "cancel" })}>Cancelar</Button>
                  </div>
                ) : "—",
              },
            ]} />
            <PaginationBar page={commissions.data.meta.page} totalPages={commissions.data.meta.totalPages} total={commissions.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
          </Card>
        ) : null}
      </div>
      {open ? <RuleDialog onClose={() => setOpen(false)} /> : null}
      <ConfirmDialog
        open={Boolean(target)}
        title={target?.kind === "pay" ? "Marcar comissão como paga" : "Cancelar comissão"}
        description={target?.kind === "pay" ? "Isso registra o pagamento na API. Não há transferência bancária automática." : "A comissão pendente será cancelada."}
        confirmLabel={target?.kind === "pay" ? "Confirmar" : "Cancelar comissão"}
        pending={action.isPending}
        onClose={() => setTarget(null)}
        onConfirm={() => target && action.mutate(target)}
      />
    </section>
  );
}

function RuleDialog({ onClose }: { onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const barbers = useQuery({ queryKey: ["barbers", "options"], queryFn: () => api<Paginated<Barber>>("barbershop/barbers?limit=100&isActive=true") });
  const services = useQuery({ queryKey: ["services", "options"], queryFn: () => api<Paginated<CatalogService>>("services?limit=100&isActive=true") });
  const products = useQuery({ queryKey: ["products", "options"], queryFn: () => api<Paginated<Product>>("products?limit=100&isActive=true") });
  const form = useForm({
    resolver: zodResolver(commissionRuleSchema),
    defaultValues: { barberId: "", serviceId: "", productId: "", type: "PERCENTAGE" as CommissionType, value: 0 },
  });
  const mutation = useMutation({
    mutationFn: (values: { barberId: string; serviceId: string; productId: string; type: CommissionType; value: number }) =>
      api("barbershop/commission-rules", { method: "POST", body: omitEmpty(values) }),
    onSuccess: () => {
      notify.success("Regra cadastrada.");
      void client.invalidateQueries({ queryKey: ["commission-rules"] });
      onClose();
    },
    onError: notify.failure,
  });
  return (
    <Dialog open title="Nova regra" description="Deixe profissional, serviço ou produto em branco para aplicar a regra de forma mais ampla." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <SelectField id="rule-type" label="Tipo" {...form.register("type")}>
          {Object.entries(commissionTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </SelectField>
        <TextField id="rule-value" label="Valor" type="number" step="0.01" min="0" error={form.formState.errors.value?.message} {...form.register("value", { valueAsNumber: true })} />
        <SelectField id="rule-barber" label="Profissional" {...form.register("barberId")}>
          <option value="">Todos</option>
          {barbers.data?.data.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
        </SelectField>
        <SelectField id="rule-service" label="Serviço" {...form.register("serviceId")}>
          <option value="">Qualquer serviço</option>
          {services.data?.data.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </SelectField>
        <SelectField id="rule-product" label="Produto" {...form.register("productId")}>
          <option value="">Qualquer produto</option>
          {products.data?.data.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </SelectField>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar regra"}</Button>
      </form>
    </Dialog>
  );
}
