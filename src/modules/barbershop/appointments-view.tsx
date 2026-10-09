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
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { TextField } from "@/components/ui/TextField";
import { api, toSearch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { dayRangeIso, formatTime, localInputToIso, omitEmpty, todayInputValue, weekRangeIso } from "@/lib/format";
import { appointmentStatusLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import { appointmentSchema } from "@/lib/validations/schemas";
import type { Appointment, AppointmentStatus, Barber, CatalogService, Customer, Paginated } from "@/types/contracts";

const statuses = Object.keys(appointmentStatusLabel) as AppointmentStatus[];

export function AppointmentsView() {
  const { user } = useSession();
  const canManage = hasPermission(user.permissions, "barbershop.appointments:manage");
  const enabled = hasPermission(user.permissions, "barbershop.appointments:read") && user.businessType === "BARBERSHOP";
  const [date, setDate] = useState(todayInputValue);
  const [mode, setMode] = useState<"day" | "week">("day");
  const [barberId, setBarberId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [cancel, setCancel] = useState<Appointment | null>(null);
  const [reason, setReason] = useState("");
  const notify = useNotify();
  const client = useQueryClient();
  const range = mode === "day" ? dayRangeIso(date) : weekRangeIso(date);
  const query = useQuery({
    queryKey: ["appointments", date, mode, barberId, status, page],
    enabled,
    queryFn: () => api<Paginated<Appointment>>(`barbershop/appointments${toSearch({ page: String(page), limit: "100", from: range.from, to: range.to, barberId: barberId || undefined, status: status || undefined })}`),
  });
  const barbers = useQuery({
    queryKey: ["barbers", "options"],
    enabled,
    queryFn: () => api<Paginated<Barber>>("barbershop/barbers?limit=100&isActive=true"),
  });
  const action = useMutation({
    mutationFn: (input: { id: string; kind: "confirm" | "complete" | "no-show" | "cancel"; reason?: string }) => {
      if (input.kind === "cancel") return api(`barbershop/appointments/${input.id}/cancel`, { method: "PATCH", body: omitEmpty({ reason: input.reason }) });
      return api(`barbershop/appointments/${input.id}/${input.kind}`, { method: "PATCH" });
    },
    onSuccess: () => {
      notify.success("Agendamento atualizado.");
      setCancel(null);
      void client.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: notify.failure,
  });

  if (user.businessType !== "BARBERSHOP") return <ForbiddenState />;
  if (!hasPermission(user.permissions, "barbershop.appointments:read")) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader title="Agendamentos" description="Agenda do período. Conflitos de horário são validados pela API." actions={canManage ? <Button onClick={() => setCreating(true)}>Novo agendamento</Button> : null} />
      <div className="flex flex-wrap items-end gap-3">
        <TextField id="agenda-date" label="Data" type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} />
        <div className="flex gap-2">
          <Button variant={mode === "day" ? "primary" : "secondary"} onClick={() => { setMode("day"); setPage(1); }}>Dia</Button>
          <Button variant={mode === "week" ? "primary" : "secondary"} onClick={() => { setMode("week"); setPage(1); }}>Semana</Button>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Profissional
          <select className="h-11 rounded-sm border border-border bg-surface-raised px-3" value={barberId} onChange={(event) => { setBarberId(event.target.value); setPage(1); }}>
            <option value="">Todos</option>
            {barbers.data?.data.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Status
          <select className="h-11 rounded-sm border border-border bg-surface-raised px-3" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">Todos</option>
            {statuses.map((item) => <option key={item} value={item}>{appointmentStatusLabel[item]}</option>)}
          </select>
        </label>
      </div>
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="Não foi possível carregar a agenda." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} /> : null}
      {query.data?.data.length === 0 ? <EmptyState title="Nenhum agendamento neste período" description="Escolha outra data ou cadastre um horário." /> : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable caption="Agendamentos" rows={[...query.data.data].sort((a, b) => a.startsAt.localeCompare(b.startsAt))} columns={[
            { key: "time", header: "Horário", render: (row) => `${formatTime(row.startsAt)}–${formatTime(row.endsAt)}` },
            { key: "customer", header: "Cliente", render: (row) => row.customer.name },
            { key: "barber", header: "Profissional", render: (row) => row.barber.name },
            { key: "service", header: "Serviço", render: (row) => row.service.name },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} labels={appointmentStatusLabel} /> },
            {
              key: "actions",
              header: "Ações",
              render: (row) => canManage && isOpen(row.status) ? (
                <div className="flex flex-wrap gap-2">
                  {row.status === "SCHEDULED" ? <Button size="sm" variant="secondary" onClick={() => action.mutate({ id: row.id, kind: "confirm" })}>Confirmar</Button> : null}
                  <Button size="sm" variant="secondary" onClick={() => action.mutate({ id: row.id, kind: "complete" })}>Concluir</Button>
                  <Button size="sm" variant="ghost" onClick={() => setReschedule(row)}>Remarcar</Button>
                  {new Date(row.startsAt).getTime() <= Date.now() ? <Button size="sm" variant="ghost" onClick={() => action.mutate({ id: row.id, kind: "no-show" })}>Falta</Button> : null}
                  <Button size="sm" variant="ghost" onClick={() => { setCancel(row); setReason(""); }}>Cancelar</Button>
                </div>
              ) : "—",
            },
          ]} />
          <PaginationBar page={query.data.meta.page} totalPages={query.data.meta.totalPages} total={query.data.meta.total} onPage={setPage} />
        </Card>
      ) : null}
      {creating ? <AppointmentDialog onClose={() => setCreating(false)} /> : null}
      {reschedule ? <RescheduleDialog appointment={reschedule} onClose={() => setReschedule(null)} /> : null}
      <ConfirmDialog open={Boolean(cancel)} title="Cancelar agendamento" description={cancel ? `${cancel.customer.name} · ${formatTime(cancel.startsAt)}` : ""} confirmLabel="Cancelar agendamento" pending={action.isPending} onClose={() => setCancel(null)} onConfirm={() => cancel && action.mutate({ id: cancel.id, kind: "cancel", reason })}>
        <TextAreaField id="appointment-reason" label="Motivo" value={reason} onChange={(event) => setReason(event.target.value)} />
      </ConfirmDialog>
    </section>
  );
}

function isOpen(status: AppointmentStatus) {
  return status === "SCHEDULED" || status === "CONFIRMED";
}

function AppointmentDialog({ onClose }: { onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const customers = useQuery({ queryKey: ["customers", "options"], queryFn: () => api<Paginated<Customer>>("customers?limit=100&isActive=true") });
  const barbers = useQuery({ queryKey: ["barbers", "options"], queryFn: () => api<Paginated<Barber>>("barbershop/barbers?limit=100&isActive=true") });
  const services = useQuery({ queryKey: ["services", "options"], queryFn: () => api<Paginated<CatalogService>>("services?limit=100&isActive=true") });
  const form = useForm({ resolver: zodResolver(appointmentSchema), defaultValues: { customerId: "", barberId: "", serviceId: "", startsAt: "", notes: "" } });
  const mutation = useMutation({
    mutationFn: (values: { customerId: string; barberId: string; serviceId: string; startsAt: string; notes: string }) => {
      const startsAt = localInputToIso(values.startsAt);
      if (!startsAt) throw new ApiError(400, "Informe uma data válida.");
      return api("barbershop/appointments", { method: "POST", body: omitEmpty({ ...values, startsAt }) });
    },
    onSuccess: () => {
      notify.success("Agendamento criado.");
      void client.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
    onError: notify.failure,
  });
  return (
    <Dialog open title="Novo agendamento" description="A duração vem do serviço escolhido." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <SelectField id="appt-customer" label="Cliente" error={form.formState.errors.customerId?.message} {...form.register("customerId")}>
          <option value="">Selecione</option>
          {customers.data?.data.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
        </SelectField>
        <SelectField id="appt-barber" label="Profissional" error={form.formState.errors.barberId?.message} {...form.register("barberId")}>
          <option value="">Selecione</option>
          {barbers.data?.data.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
        </SelectField>
        <SelectField id="appt-service" label="Serviço" error={form.formState.errors.serviceId?.message} {...form.register("serviceId")}>
          <option value="">Selecione</option>
          {services.data?.data.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </SelectField>
        <TextField id="appt-start" label="Data e hora" type="datetime-local" error={form.formState.errors.startsAt?.message} {...form.register("startsAt")} />
        <TextAreaField id="appt-notes" label="Observações" error={form.formState.errors.notes?.message} {...form.register("notes")} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Agendar"}</Button>
      </form>
    </Dialog>
  );
}

function RescheduleDialog({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const [startsAt, setStartsAt] = useState("");
  const [barberId, setBarberId] = useState("");
  const barbers = useQuery({ queryKey: ["barbers", "options"], queryFn: () => api<Paginated<Barber>>("barbershop/barbers?limit=100&isActive=true") });
  const mutation = useMutation({
    mutationFn: () => {
      const iso = localInputToIso(startsAt);
      if (!iso) throw new ApiError(400, "Informe a nova data.");
      return api(`barbershop/appointments/${appointment.id}/reschedule`, { method: "PATCH", body: omitEmpty({ startsAt: iso, barberId }) });
    },
    onSuccess: () => {
      notify.success("Agendamento remarcado.");
      void client.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
    onError: notify.failure,
  });
  return (
    <Dialog open title="Remarcar" description={`${appointment.customer.name} com ${appointment.barber.name}`} onClose={onClose}>
      <div className="grid gap-4">
        <TextField id="reschedule-start" label="Nova data e hora" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
        <SelectField id="reschedule-barber" label="Profissional" value={barberId} onChange={(event) => setBarberId(event.target.value)}>
          <option value="">Manter o atual</option>
          {barbers.data?.data.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
        </SelectField>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Remarcar"}</Button>
      </div>
    </Dialog>
  );
}
