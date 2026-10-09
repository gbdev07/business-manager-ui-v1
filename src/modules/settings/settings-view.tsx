"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotify, useSession } from "@/components/app/providers";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorState, ForbiddenState, LoadingState } from "@/components/feedback/States";
import { Checkbox } from "@/components/forms/Fields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { omitEmpty } from "@/lib/format";
import { businessTypeLabel, tenantStatusLabel, weekdayLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import { tenantSchema } from "@/lib/validations/schemas";
import type { BarbershopSettings, OperatingHours, Tenant, WeekdayKey } from "@/types/contracts";

const weekdays: WeekdayKey[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

type TenantValues = {
  name: string;
  document: string;
  email: string;
  phone: string;
  timezone: string;
  currency: string;
};

export function SettingsView() {
  const { user } = useSession();
  const canRead = hasPermission(user.permissions, "tenant:read");
  const canManage = hasPermission(user.permissions, "tenant:manage");
  const query = useQuery({
    queryKey: ["tenant"],
    enabled: canRead,
    queryFn: () => api<Tenant>("tenants/current"),
  });

  if (!canRead) return <ForbiddenState />;
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return <ErrorState title="Não foi possível carregar as configurações." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} />;
  }

  const current = query.data;
  return (
    <section className="grid gap-6">
      <PageHeader title="Configurações" description="Dados gerais do negócio. O tipo de negócio é definido no cadastro e não é alterado por este contrato." />
      <Card className="grid gap-2 text-sm">
        <p>Segmento: {businessTypeLabel[current.businessType]}</p>
        <p>Situação: <StatusBadge status={current.status} labels={tenantStatusLabel} /></p>
      </Card>
      <TenantForm tenant={current} canManage={canManage} />
      {current.businessType === "BARBERSHOP" ? <HoursForm canManage={hasPermission(user.permissions, "barbershop.settings:manage")} /> : null}
    </section>
  );
}

function TenantForm({ tenant, canManage }: { tenant: Tenant; canManage: boolean }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm<TenantValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant.name,
      document: tenant.document ?? "",
      email: tenant.email ?? "",
      phone: tenant.phone ?? "",
      timezone: tenant.timezone,
      currency: tenant.currency,
    },
  });
  const mutation = useMutation({
    mutationFn: (values: TenantValues) => api("tenants/current", { method: "PATCH", body: omitEmpty(values) }),
    onSuccess: () => {
      notify.success("Negócio atualizado.");
      void client.invalidateQueries({ queryKey: ["tenant"] });
    },
    onError: notify.failure,
  });

  return (
    <Card>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="tenant-name" label="Nome" disabled={!canManage} error={form.formState.errors.name?.message} {...form.register("name")} />
        <TextField id="tenant-document" label="Documento" disabled={!canManage} {...form.register("document")} />
        <TextField id="tenant-email" label="E-mail" type="email" disabled={!canManage} error={form.formState.errors.email?.message} {...form.register("email")} />
        <TextField id="tenant-phone" label="Telefone" disabled={!canManage} {...form.register("phone")} />
        <TextField id="tenant-timezone" label="Fuso horário" disabled={!canManage} error={form.formState.errors.timezone?.message} {...form.register("timezone")} />
        <TextField id="tenant-currency" label="Moeda" disabled={!canManage} error={form.formState.errors.currency?.message} {...form.register("currency")} />
        {canManage ? <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar dados"}</Button> : <p className="text-sm text-muted">Você pode consultar, mas não alterar estes dados.</p>}
      </form>
    </Card>
  );
}

function HoursForm({ canManage }: { canManage: boolean }) {
  const notify = useNotify();
  const query = useQuery({ queryKey: ["barbershop-settings"], queryFn: () => api<BarbershopSettings>("barbershop/settings") });
  const [hours, setHours] = useState<OperatingHours | null>(null);
  const current = hours ?? query.data?.operatingHours ?? {};
  const mutation = useMutation({
    mutationFn: () => api("barbershop/settings", { method: "PUT", body: { operatingHours: current } }),
    onSuccess: () => notify.success("Horários da barbearia atualizados."),
    onError: notify.failure,
  });

  if (query.isLoading) return <LoadingState label="Carregando horários…" />;
  if (query.isError) return <ErrorState title="Não foi possível carregar os horários da barbearia." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} />;

  return (
    <Card className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold">Horários da barbearia</h2>
        <p className="text-sm text-muted">Configuração específica do módulo, separada dos dados gerais.</p>
      </div>
      {weekdays.map((day) => {
        const value = current[day] ?? {};
        return (
          <div key={day} className="grid items-end gap-3 sm:grid-cols-[8rem_1fr_1fr_auto]">
            <p className="text-sm font-medium">{weekdayLabel[day]}</p>
            <TextField id={`${day}-open`} label="Abre" type="time" disabled={!canManage || value.closed} value={value.open ?? ""} onChange={(event) => setHours({ ...current, [day]: { ...value, open: event.target.value } })} />
            <TextField id={`${day}-close`} label="Fecha" type="time" disabled={!canManage || value.closed} value={value.close ?? ""} onChange={(event) => setHours({ ...current, [day]: { ...value, close: event.target.value } })} />
            <Checkbox className="pb-3" label="Fechado" disabled={!canManage} checked={Boolean(value.closed)} onChange={(event) => setHours({ ...current, [day]: { ...value, closed: event.target.checked } })} />
          </div>
        );
      })}
      {canManage ? <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar horários"}</Button> : null}
    </Card>
  );
}
