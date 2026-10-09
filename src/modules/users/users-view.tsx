"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type SelectHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { useNotify, useSession } from "@/components/app/providers";
import { PaginationBar } from "@/components/data-display/PaginationBar";
import { ActiveBadge } from "@/components/data-display/StatusBadge";
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
import { formatDateTime } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { userSchema, userUpdateSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { Paginated, RoleDefinition, TenantUser } from "@/types/contracts";

export function UsersView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "users:manage");
  const [editing, setEditing] = useState<TenantUser | "new" | null>(null);
  const [confirm, setConfirm] = useState<TenantUser | null>(null);
  const notify = useNotify();
  const client = useQueryClient();
  const enabled = hasPermission(user.permissions, "users:read");
  const query = useQuery({
    queryKey: ["users", listing.page, listing.q, listing.active],
    enabled,
    queryFn: () => api<Paginated<TenantUser>>(`users${toSearch({ page: listing.page, limit: "20", search: listing.q, isActive: listing.active || undefined })}`),
  });
  const roles = useQuery({
    queryKey: ["users", "roles"],
    enabled,
    queryFn: () => api<RoleDefinition[]>("users/roles"),
  });
  const toggle = useMutation({
    mutationFn: (target: TenantUser) => api(`users/${target.id}/${target.isActive ? "deactivate" : "activate"}`, { method: "PATCH" }),
    onSuccess: () => {
      notify.success("Status do usuário atualizado.");
      setConfirm(null);
      void client.invalidateQueries({ queryKey: ["users"] });
    },
    onError: notify.failure,
  });

  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Usuários"
        description="Papéis e permissões vêm da API. A senha de um usuário existente não pode ser alterada por este contrato."
        actions={canManage ? <Button onClick={() => setEditing("new")}>Novo usuário</Button> : null}
      />
      <FilterRow q={listing.q} active={listing.active} onSearch={(q) => listing.setParams({ q })} onActive={(active) => listing.setParams({ active })} />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="Não foi possível carregar os usuários." description={messageOf(query.error)} onRetry={() => query.refetch()} /> : null}
      {query.data?.data.length === 0 ? <EmptyState title="Nenhum usuário encontrado" description="Ajuste a busca ou cadastre um usuário." /> : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable
            caption="Usuários do negócio"
            rows={query.data.data}
            columns={[
              { key: "name", header: "Nome", render: (row) => row.name },
              { key: "email", header: "E-mail", render: (row) => row.email },
              { key: "role", header: "Papel", render: (row) => roles.data?.find((role) => role.key === row.role)?.name ?? row.role },
              { key: "status", header: "Status", render: (row) => <ActiveBadge active={row.isActive} /> },
              { key: "login", header: "Último acesso", render: (row) => formatDateTime(row.lastLoginAt) },
              {
                key: "actions",
                header: "Ações",
                render: (row) => canManage ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>Editar</Button>
                    <Button size="sm" variant="ghost" disabled={row.id === user.id} onClick={() => setConfirm(row)}>{row.isActive ? "Desativar" : "Ativar"}</Button>
                  </div>
                ) : "—",
              },
            ]}
          />
          <PaginationBar page={query.data.meta.page} totalPages={query.data.meta.totalPages} total={query.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
        </Card>
      ) : null}
      {roles.data ? (
        <Card className="grid gap-3">
          <h2 className="text-base font-semibold">Papéis disponíveis</h2>
          {roles.data.map((role) => (
            <div key={role.key}>
              <p className="text-sm font-medium">{role.name}</p>
              <p className="text-sm text-muted">{role.description}</p>
            </div>
          ))}
        </Card>
      ) : null}
      {editing ? (
        <UserDialog roles={roles.data ?? []} user={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      ) : null}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.isActive ? "Desativar usuário" : "Ativar usuário"}
        description={confirm ? `${confirm.name} ${confirm.isActive ? "perderá o acesso" : "voltará a acessar o negócio"}.` : ""}
        confirmLabel={confirm?.isActive ? "Desativar" : "Ativar"}
        pending={toggle.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && toggle.mutate(confirm)}
      />
    </section>
  );
}

function UserDialog({ roles, user, onClose }: { roles: RoleDefinition[]; user: TenantUser | null; onClose: () => void }) {
  if (!user) return <CreateUserDialog roles={roles} onClose={onClose} />;
  return <EditUserDialog roles={roles} user={user} onClose={onClose} />;
}

function CreateUserDialog({ roles, onClose }: { roles: RoleDefinition[]; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "", role: roles[0]?.key ?? "" },
  });
  const mutation = useMutation({
    mutationFn: (values: { name: string; email: string; password: string; role: string }) => api("users", { method: "POST", body: values }),
    onSuccess: () => {
      notify.success("Usuário cadastrado.");
      void client.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: notify.failure,
  });

  return (
    <Dialog open title="Novo usuário" onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="user-name" label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
        <TextField id="user-email" label="E-mail" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
        <TextField id="user-password" label="Senha" type="password" error={form.formState.errors.password?.message} {...form.register("password")} />
        <RoleSelect roles={roles} error={form.formState.errors.role?.message} {...form.register("role")} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialog>
  );
}

function EditUserDialog({ roles, user, onClose }: { roles: RoleDefinition[]; user: TenantUser; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: { name: user.name, role: user.role },
  });
  const mutation = useMutation({
    mutationFn: (values: { name: string; role: string }) => api(`users/${user.id}`, { method: "PATCH", body: values }),
    onSuccess: () => {
      notify.success("Usuário atualizado.");
      void client.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: notify.failure,
  });

  return (
    <Dialog open title="Editar usuário" description="A API não oferece troca de senha neste endpoint." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="user-name" label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
        <RoleSelect roles={roles} error={form.formState.errors.role?.message} {...form.register("role")} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialog>
  );
}

function RoleSelect({ roles, error, ...props }: { roles: RoleDefinition[]; error?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <SelectField id="user-role" label="Papel" error={error} {...props}>
      {roles.map((role) => <option key={role.key} value={role.key}>{role.name}</option>)}
    </SelectField>
  );
}

function FilterRow({ q, active, onSearch, onActive }: { q: string; active: string; onSearch: (value: string | null) => void; onActive: (value: string | null) => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <form className="flex flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); onSearch(String(new FormData(event.currentTarget).get("q") ?? "") || null); }}>
        <input key={q} name="q" defaultValue={q} aria-label="Buscar usuários" placeholder="Nome ou e-mail" className="h-11 w-full rounded-sm border border-border bg-surface-raised px-3" />
        <Button type="submit" variant="secondary">Buscar</Button>
      </form>
      <select className="h-11 rounded-sm border border-border bg-surface-raised px-3" value={active} aria-label="Status" onChange={(event) => onActive(event.target.value || null)}>
        <option value="">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
    </div>
  );
}

function messageOf(error: unknown) {
  return error instanceof ApiError ? error.message : "Falha de conexão.";
}
