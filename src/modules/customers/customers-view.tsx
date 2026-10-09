"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotify, useSession } from "@/components/app/providers";
import { PaginationBar } from "@/components/data-display/PaginationBar";
import { ActiveBadge } from "@/components/data-display/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
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
import { formatDate, formatMoney, omitEmpty } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { customerSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { Customer, Paginated } from "@/types/contracts";

type CustomerValues = {
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
  notes: string;
};

const emptyCustomer: CustomerValues = { name: "", email: "", phone: "", document: "", birthDate: "", notes: "" };

export function CustomersView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "customers:manage");
  const [editing, setEditing] = useState<Customer | null | "new">(null);
  const [confirm, setConfirm] = useState<Customer | null>(null);
  const notify = useNotify();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["customers", listing.page, listing.q, listing.active],
    enabled: hasPermission(user.permissions, "customers:read"),
    queryFn: () =>
      api<Paginated<Customer>>(
        `customers${toSearch({ page: listing.page, limit: "20", search: listing.q, isActive: listing.active || undefined })}`,
      ),
  });

  const toggle = useMutation({
    mutationFn: (customer: Customer) =>
      api<Customer>(`customers/${customer.id}/${customer.isActive ? "deactivate" : "activate"}`, { method: "PATCH" }),
    onSuccess: () => {
      notify.success("Status do cliente atualizado.");
      setConfirm(null);
      void client.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => notify.failure(error),
  });

  if (!hasPermission(user.permissions, "customers:read")) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Clientes"
        description="Cadastro compartilhado do negócio."
        actions={
          canManage ? (
            <Button onClick={() => setEditing("new")}>Novo cliente</Button>
          ) : null
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            listing.setParams({ q: String(data.get("q") ?? "") || null });
          }}
        >
          <SearchField key={listing.q} name="q" defaultValue={listing.q} aria-label="Buscar clientes" placeholder="Nome, e-mail ou telefone" />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
        <SelectField id="customer-status" label="Status" className="w-full sm:w-44" value={listing.active} onChange={(event) => listing.setParams({ active: event.target.value || null })}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </SelectField>
      </div>
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          title="Não foi possível carregar os clientes."
          description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."}
          detail={query.error instanceof ApiError ? query.error.detail : undefined}
          onRetry={() => query.refetch()}
        />
      ) : null}
      {query.data && query.data.data.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description={listing.q || listing.active ? "Ajuste a busca ou o filtro." : "Cadastre o primeiro cliente do negócio."}
          action={canManage && !listing.q ? <Button onClick={() => setEditing("new")}>Novo cliente</Button> : undefined}
        />
      ) : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable
            caption="Clientes"
            rows={query.data.data}
            columns={[
              { key: "name", header: "Nome", render: (row) => <Link className="font-medium text-primary-text" href={`/customers/${row.id}`}>{row.name}</Link> },
              { key: "phone", header: "Telefone", render: (row) => row.phone ?? "—" },
              { key: "email", header: "E-mail", render: (row) => row.email ?? "—" },
              { key: "status", header: "Status", render: (row) => <ActiveBadge active={row.isActive} /> },
              { key: "created", header: "Cadastro", render: (row) => formatDate(row.createdAt) },
              {
                key: "actions",
                header: "Ações",
                render: (row) =>
                  canManage ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>Editar</Button>
                      <Button size="sm" variant="secondary" onClick={() => setConfirm(row)}>{row.isActive ? "Desativar" : "Ativar"}</Button>
                    </div>
                  ) : (
                    "—"
                  ),
              },
            ]}
          />
          <PaginationBar
            page={query.data.meta.page}
            totalPages={query.data.meta.totalPages}
            total={query.data.meta.total}
            onPage={(page) => listing.setParams({ page: String(page) })}
          />
        </Card>
      ) : null}
      <CustomerDialog
        key={typeof editing === "string" ? editing : (editing?.id ?? "closed")}
        open={editing !== null}
        customer={editing && editing !== "new" ? editing : null}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.isActive ? "Desativar cliente" : "Ativar cliente"}
        description={confirm ? `${confirm.name} ficará ${confirm.isActive ? "inativo" : "ativo"}.` : ""}
        confirmLabel={confirm?.isActive ? "Desativar" : "Ativar"}
        pending={toggle.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && toggle.mutate(confirm)}
      />
    </section>
  );
}

function CustomerDialog({ open, customer, onClose }: { open: boolean; customer: Customer | null; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          document: customer.document ?? "",
          birthDate: customer.birthDate ? customer.birthDate.slice(0, 10) : "",
          notes: customer.notes ?? "",
        }
      : emptyCustomer,
  });

  const mutation = useMutation({
    mutationFn: (values: CustomerValues) => {
      const body = omitEmpty(values);
      return customer
        ? api<Customer>(`customers/${customer.id}`, { method: "PATCH", body })
        : api<Customer>("customers", { method: "POST", body });
    },
    onSuccess: () => {
      notify.success(customer ? "Cliente atualizado." : "Cliente cadastrado.");
      void client.invalidateQueries({ queryKey: ["customers"] });
      onClose();
    },
    onError: (error) => notify.failure(error),
  });

  return (
    <Dialog open={open} title={customer ? "Editar cliente" : "Novo cliente"} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="customer-name" label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
        <TextField id="customer-phone" label="Telefone" error={form.formState.errors.phone?.message} {...form.register("phone")} />
        <TextField id="customer-email" label="E-mail" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
        <TextField id="customer-document" label="Documento" error={form.formState.errors.document?.message} {...form.register("document")} />
        <TextField id="customer-birth" label="Nascimento" type="date" error={form.formState.errors.birthDate?.message} {...form.register("birthDate")} />
        <TextAreaField id="customer-notes" label="Observações" error={form.formState.errors.notes?.message} {...form.register("notes")} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialog>
  );
}

export function CustomerDetailView({ id }: { id: string }) {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["customers", id, "history"],
    enabled: hasPermission(user.permissions, "customers:read"),
    queryFn: () => api<import("@/types/contracts").CustomerHistory>(`customers/${id}/history`),
  });

  if (!hasPermission(user.permissions, "customers:read")) return <ForbiddenState />;
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Não foi possível abrir o cliente."
        description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."}
        onRetry={() => query.refetch()}
      />
    );
  }

  const { customer, entries } = query.data;
  return (
    <section className="grid gap-6">
      <PageHeader title={customer.name} description="Dados e histórico registrado pela API." />
      <Card className="grid gap-2 text-sm">
        <p>Telefone: {customer.phone ?? "—"}</p>
        <p>E-mail: {customer.email ?? "—"}</p>
        <p>Documento: {customer.document ?? "—"}</p>
        <p>Nascimento: {formatDate(customer.birthDate)}</p>
        <p>Observações: {customer.notes ?? "—"}</p>
        <ActiveBadge active={customer.isActive} />
      </Card>
      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Histórico</h2>
        {entries.length === 0 ? <EmptyState title="Sem movimentações" description="Vendas, pagamentos e assinaturas deste cliente aparecem aqui." /> : null}
        {entries.length > 0 ? (
          <Card>
            <DataTable
              caption="Histórico do cliente"
              rows={entries}
              columns={[
                { key: "type", header: "Tipo", render: (row) => row.type === "sale" ? "Venda" : row.type === "payment" ? "Pagamento" : "Assinatura" },
                { key: "description", header: "Descrição", render: (row) => row.description ?? "—" },
                { key: "status", header: "Status", render: (row) => row.status },
                { key: "amount", header: "Valor", render: (row) => formatMoney(row.amount) },
                { key: "when", header: "Data", render: (row) => formatDate(row.occurredAt) },
              ]}
            />
          </Card>
        ) : null}
      </div>
    </section>
  );
}
