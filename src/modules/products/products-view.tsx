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
import { productSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { Paginated, Product } from "@/types/contracts";

type ProductValues = { name: string; description: string; sku: string; price: number };

export function ProductsView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "catalog:manage");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const enabled = hasPermission(user.permissions, "catalog:read");
  const query = useQuery({
    queryKey: ["products", listing.page, listing.q, listing.active],
    enabled,
    queryFn: () => api<Paginated<Product>>(`products${toSearch({ page: listing.page, limit: "20", search: listing.q, isActive: listing.active || undefined })}`),
  });
  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader title="Produtos" description="Catálogo compartilhado de produtos." actions={canManage ? <Button onClick={() => setEditing("new")}>Novo produto</Button> : null} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="flex flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); listing.setParams({ q: String(new FormData(event.currentTarget).get("q") ?? "") || null }); }}>
          <SearchField key={listing.q} name="q" defaultValue={listing.q} aria-label="Buscar produtos" placeholder="Nome ou SKU" />
          <Button type="submit" variant="secondary">Buscar</Button>
        </form>
        <SelectField id="product-status" aria-label="Status" className="w-full sm:w-44" value={listing.active} onChange={(event) => listing.setParams({ active: event.target.value || null })}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </SelectField>
      </div>
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="Não foi possível carregar os produtos." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} /> : null}
      {query.data?.data.length === 0 ? <EmptyState title="Nenhum produto encontrado" description="Cadastre os produtos vendidos pelo negócio." /> : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable caption="Produtos" rows={query.data.data} columns={[
            { key: "name", header: "Nome", render: (row) => row.name },
            { key: "sku", header: "SKU", render: (row) => row.sku ?? "—" },
            { key: "price", header: "Preço", render: (row) => formatMoney(row.price) },
            { key: "status", header: "Status", render: (row) => <ActiveBadge active={row.isActive} /> },
            { key: "actions", header: "Ações", render: (row) => canManage ? <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>Editar</Button> : "—" },
          ]} />
          <PaginationBar page={query.data.meta.page} totalPages={query.data.meta.totalPages} total={query.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
        </Card>
      ) : null}
      {editing ? <ProductDialog product={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
    </section>
  );
}

function ProductDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: product?.name ?? "", description: product?.description ?? "", sku: product?.sku ?? "", price: product ? Number(product.price) : 0 },
  });
  const mutation = useMutation({
    mutationFn: (values: ProductValues) => {
      const body = omitEmpty(values);
      return product ? api(`products/${product.id}`, { method: "PATCH", body }) : api("products", { method: "POST", body });
    },
    onSuccess: () => {
      notify.success(product ? "Produto atualizado." : "Produto cadastrado.");
      void client.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: notify.failure,
  });
  const toggle = useMutation({
    mutationFn: () => api(`products/${product?.id}`, { method: "PATCH", body: { isActive: !product?.isActive } }),
    onSuccess: () => {
      notify.success("Status do produto atualizado.");
      void client.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: notify.failure,
  });

  return (
    <Dialog open title={product ? "Editar produto" : "Novo produto"} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <TextField id="product-name" label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
        <TextAreaField id="product-description" label="Descrição" {...form.register("description")} />
        <TextField id="product-sku" label="SKU" error={form.formState.errors.sku?.message} {...form.register("sku")} />
        <TextField id="product-price" label="Preço" type="number" step="0.01" min="0" error={form.formState.errors.price?.message} {...form.register("price", { valueAsNumber: true })} />
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Salvar"}</Button>
          {product ? <Button type="button" variant="secondary" onClick={() => toggle.mutate()}>{product.isActive ? "Desativar" : "Ativar"}</Button> : null}
        </div>
      </form>
    </Dialog>
  );
}
