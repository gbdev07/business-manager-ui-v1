"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotify, useSession } from "@/components/app/providers";
import { PaginationBar } from "@/components/data-display/PaginationBar";
import { ActiveBadge } from "@/components/data-display/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "@/components/feedback/States";
import { Checkbox, SelectField } from "@/components/forms/Fields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Dialog } from "@/components/overlay/Dialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { SearchField, TextField } from "@/components/ui/TextField";
import { api, toSearch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { omitEmpty } from "@/lib/format";
import { weekdayLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import { barberSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { Barber, Paginated, TenantUser, WeekdayKey } from "@/types/contracts";

const weekdays: WeekdayKey[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

type BarberValues = {
  name: string;
  email: string;
  phone: string;
  userId: string;
  specialties: string;
  workDays: string[];
  workStartTime: string;
  workEndTime: string;
};

export function BarbersView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "barbershop.barbers:manage");
  const enabled = hasPermission(user.permissions, "barbershop.barbers:read") && user.businessType === "BARBERSHOP";
  const [editing, setEditing] = useState<Barber | "new" | null>(null);
  const [confirm, setConfirm] = useState<Barber | null>(null);
  const notify = useNotify();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["barbers", listing.page, listing.q, listing.active],
    enabled,
    queryFn: () => api<Paginated<Barber>>(`barbershop/barbers${toSearch({ page: listing.page, limit: "20", search: listing.q, isActive: listing.active || undefined })}`),
  });
  const toggle = useMutation({
    mutationFn: (barber: Barber) => api(`barbershop/barbers/${barber.id}/${barber.isActive ? "deactivate" : "activate"}`, { method: "PATCH" }),
    onSuccess: () => {
      notify.success("Status do profissional atualizado.");
      setConfirm(null);
      void client.invalidateQueries({ queryKey: ["barbers"] });
    },
    onError: notify.failure,
  });

  if (user.businessType !== "BARBERSHOP") return <ForbiddenState />;
  if (!hasPermission(user.permissions, "barbershop.barbers:read")) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader title="Profissionais" description="Barbeiros do módulo de barbearia. Um profissional pode ser associado a um usuário já existente." actions={canManage ? <Button onClick={() => setEditing("new")}>Novo profissional</Button> : null} />
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); listing.setParams({ q: String(new FormData(event.currentTarget).get("q") ?? "") || null }); }}>
        <SearchField key={listing.q} name="q" defaultValue={listing.q} aria-label="Buscar profissionais" placeholder="Nome" className="max-w-sm" />
        <Button type="submit" variant="secondary">Buscar</Button>
      </form>
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="Não foi possível carregar os profissionais." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} /> : null}
      {query.data?.data.length === 0 ? <EmptyState title="Nenhum profissional encontrado" description="Cadastre quem atende na barbearia." /> : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable caption="Profissionais" rows={query.data.data} columns={[
            { key: "name", header: "Nome", render: (row) => row.name },
            { key: "specialties", header: "Especialidades", render: (row) => row.specialties.join(", ") || "—" },
            { key: "days", header: "Dias", render: (row) => row.workDays.map((day) => weekdayLabel[day] ?? day).join(", ") || "—" },
            { key: "hours", header: "Horário", render: (row) => row.workStartTime && row.workEndTime ? `${row.workStartTime}–${row.workEndTime}` : "—" },
            { key: "status", header: "Status", render: (row) => <ActiveBadge active={row.isActive} /> },
            { key: "actions", header: "Ações", render: (row) => canManage ? <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setEditing(row)}>Editar</Button><Button size="sm" variant="secondary" onClick={() => setConfirm(row)}>{row.isActive ? "Desativar" : "Ativar"}</Button></div> : "—" },
          ]} />
          <PaginationBar page={query.data.meta.page} totalPages={query.data.meta.totalPages} total={query.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
        </Card>
      ) : null}
      {editing ? <BarberDialog barber={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog open={Boolean(confirm)} title={confirm?.isActive ? "Desativar profissional" : "Ativar profissional"} description={confirm ? confirm.name : ""} confirmLabel={confirm?.isActive ? "Desativar" : "Ativar"} pending={toggle.isPending} onClose={() => setConfirm(null)} onConfirm={() => confirm && toggle.mutate(confirm)} />
    </section>
  );
}

function BarberDialog({ barber, onClose }: { barber: Barber | null; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const users = useQuery({ queryKey: ["users", "options"], queryFn: () => api<Paginated<TenantUser>>("users?limit=100&isActive=true") });
  const form = useForm<BarberValues>({
    resolver: zodResolver(barberSchema),
    defaultValues: {
      name: barber?.name ?? "",
      email: barber?.email ?? "",
      phone: barber?.phone ?? "",
      userId: barber?.userId ?? "",
      specialties: barber?.specialties.join(", ") ?? "",
      workDays: barber?.workDays ?? [],
      workStartTime: barber?.workStartTime ?? "",
      workEndTime: barber?.workEndTime ?? "",
    },
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(barber?.workDays ?? []);
  const mutation = useMutation({
    mutationFn: (values: BarberValues) => {
      const body = omitEmpty({
        ...values,
        specialties: values.specialties.split(",").map((item) => item.trim()).filter(Boolean),
        workDays: values.workDays,
      });
      return barber ? api(`barbershop/barbers/${barber.id}`, { method: "PATCH", body }) : api("barbershop/barbers", { method: "POST", body });
    },
    onSuccess: () => {
      notify.success(barber ? "Profissional atualizado." : "Profissional cadastrado.");
      void client.invalidateQueries({ queryKey: ["barbers"] });
      onClose();
    },
    onError: notify.failure,
  });

  return (
    <Dialog open title={barber ? "Editar profissional" : "Novo profissional"} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="barber-name" label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
        <TextField id="barber-email" label="E-mail" error={form.formState.errors.email?.message} {...form.register("email")} />
        <TextField id="barber-phone" label="Telefone" {...form.register("phone")} />
        <SelectField id="barber-user" label="Usuário associado" hint="Opcional. Não cria outro usuário." {...form.register("userId")}>
          <option value="">Sem usuário</option>
          {users.data?.data.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </SelectField>
        <TextField id="barber-specialties" label="Especialidades" hint="Separe por vírgula." {...form.register("specialties")} />
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Dias de trabalho</legend>
          <div className="flex flex-wrap gap-3">
            {weekdays.map((day) => (
              <Checkbox
                key={day}
                label={weekdayLabel[day]}
                checked={selectedDays.includes(day)}
                onChange={(event) => {
                  const next = event.target.checked ? [...selectedDays, day] : selectedDays.filter((item) => item !== day);
                  setSelectedDays(next);
                  form.setValue("workDays", next);
                }}
              />
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="barber-start" label="Início" type="time" error={form.formState.errors.workStartTime?.message} {...form.register("workStartTime")} />
          <TextField id="barber-end" label="Fim" type="time" error={form.formState.errors.workEndTime?.message} {...form.register("workEndTime")} />
        </div>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialog>
  );
}
