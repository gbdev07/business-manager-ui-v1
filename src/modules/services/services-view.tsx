"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotify, useSession } from "@/components/app/providers";
import { PaginationBar } from "@/components/data-display/PaginationBar";
import { ActiveBadge } from "@/components/data-display/StatusBadge";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "@/components/feedback/States";
import { SelectField, TextAreaField } from "@/components/forms/Fields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Dialog } from "@/components/overlay/Dialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { SearchField, TextField } from "@/components/ui/TextField";
import { api, toSearch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { formatMoney, omitEmpty } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { serviceSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { CatalogService, Paginated } from "@/types/contracts";

type ServiceValues = { name: string; description: string; price: number; durationMinutes: string };

export function ServicesView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "catalog:manage");
  const [editing, setEditing] = useState<CatalogService | "new" | null>(null);
  const enabled = hasPermission(user.permissions, "catalog:read");
  const query = useQuery({
    queryKey: ["services", listing.page, listing.q, listing.active],
    enabled,
    queryFn: () => api<Paginated<CatalogService>>(`services${toSearch({ page: listing.page, limit: "20", search: listing.q, isActive: listing.active || undefined })}`),
  });

  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader title="Serviços" description="Catálogo compartilhado. A barbearia usa estes serviços na agenda." actions={canManage ? <Button onClick={() => setEditing("new")}>Novo serviço</Button> : null} />
      <SearchStatus q={listing.q} active={listing.active} label="Buscar serviços" onSearch={(q) => listing.setParams({ q })} onActive={(active) => listing.setParams({ active })} />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="Não foi possível carregar os serviços." description={text(query.error)} onRetry={() => query.refetch()} /> : null}
      {query.data?.data.length === 0 ? <EmptyState title="Nenhum serviço encontrado" description="Cadastre os serviços oferecidos pelo negócio." action={canManage ? <Button onClick={() => setEditing("new")}>Novo serviço</Button> : undefined} /> : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable
            caption="Serviços"
            rows={query.data.data}
            columns={[
              { key: "name", header: "Nome", render: (row) => row.name },
              { key: "duration", header: "Duração", render: (row) => row.durationMinutes ? `${row.durationMinutes} min` : "—" },
              { key: "price", header: "Preço", render: (row) => formatMoney(row.price) },
              { key: "status", header: "Status", render: (row) => <ActiveBadge active={row.isActive} /> },
              { key: "actions", header: "Ações", render: (row) => canManage ? <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>Editar</Button> : "—" },
            ]}
          />
          <PaginationBar page={query.data.meta.page} totalPages={query.data.meta.totalPages} total={query.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
        </Card>
      ) : null}
      {editing ? <ServiceDialog service={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
    </section>
  );
}

function ServiceDialog({ service, onClose }: { service: CatalogService | null; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? "",
      description: service?.description ?? "",
      price: service ? Number(service.price) : 0,
      durationMinutes: service?.durationMinutes ? String(service.durationMinutes) : "",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: ServiceValues) => {
      const duration = values.durationMinutes ? Number(values.durationMinutes) : undefined;
      if (values.durationMinutes && (!Number.isInteger(duration) || (duration ?? 0) < 5 || (duration ?? 0) > 1440)) {
        throw new ApiError(400, "A duração deve ficar entre 5 e 1440 minutos.");
      }
      const body = omitEmpty({ name: values.name, description: values.description, price: values.price, durationMinutes: duration, isActive: service?.isActive });
      return service ? api(`services/${service.id}`, { method: "PATCH", body }) : api("services", { method: "POST", body: omitEmpty({ name: values.name, description: values.description, price: values.price, durationMinutes: duration }) });
    },
    onSuccess: () => {
      notify.success(service ? "Serviço atualizado." : "Serviço cadastrado.");
      void client.invalidateQueries({ queryKey: ["services"] });
      onClose();
    },
    onError: notify.failure,
  });
  const toggle = useMutation({
    mutationFn: () => api(`services/${service?.id}`, { method: "PATCH", body: { isActive: !service?.isActive } }),
    onSuccess: () => {
      notify.success("Status do serviço atualizado.");
      void client.invalidateQueries({ queryKey: ["services"] });
      onClose();
    },
    onError: notify.failure,
  });

  return (
    <Dialog open title={service ? "Editar serviço" : "Novo serviço"} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="service-name" label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
        <TextAreaField id="service-description" label="Descrição" {...form.register("description")} />
        <TextField id="service-price" label="Preço" type="number" step="0.01" min="0" error={form.formState.errors.price?.message} {...form.register("price", { valueAsNumber: true })} />
        <TextField id="service-duration" label="Duração (minutos)" type="number" hint="Opcional. Entre 5 e 1440." error={form.formState.errors.durationMinutes?.message} {...form.register("durationMinutes")} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar"}</Button>
          {service ? <Button type="button" variant="secondary" disabled={toggle.isPending} onClick={() => toggle.mutate()}>{service.isActive ? "Desativar" : "Ativar"}</Button> : null}
        </div>
      </form>
    </Dialog>
  );
}

function SearchStatus({ q, active, label, onSearch, onActive }: { q: string; active: string; label: string; onSearch: (value: string | null) => void; onActive: (value: string | null) => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form className="flex flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); onSearch(String(new FormData(event.currentTarget).get("q") ?? "") || null); }}>
        <SearchField key={q} name="q" defaultValue={q} aria-label={label} placeholder={label} />
        <Button type="submit" variant="secondary">Buscar</Button>
      </form>
      <SelectField id="service-status" aria-label="Status" className="w-full sm:w-44" value={active} onChange={(event) => onActive(event.target.value || null)}>
        <option value="">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </SelectField>
    </div>
  );
}

function text(error: unknown) {
  return error instanceof ApiError ? error.message : "Falha de conexão.";
}
