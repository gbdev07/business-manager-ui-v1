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
import { formatDateTime, formatMoney, omitEmpty } from "@/lib/format";
import { saleStatusLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import { saleSchema } from "@/lib/validations/schemas";
import { useListing } from "@/modules/shared/use-listing";
import type { CatalogService, Customer, Paginated, Product, Sale } from "@/types/contracts";

type SaleValues = {
  customerId: string;
  type: "SERVICE" | "PRODUCT";
  serviceId: string;
  productId: string;
  quantity: number;
  discount: string;
  notes: string;
};

export function SalesView() {
  const { user } = useSession();
  const listing = useListing();
  const canManage = hasPermission(user.permissions, "sales:manage");
  const [open, setOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const notify = useNotify();
  const client = useQueryClient();
  const enabled = hasPermission(user.permissions, "sales:read");
  const query = useQuery({
    queryKey: ["sales", listing.page, listing.status],
    enabled,
    queryFn: () => api<Paginated<Sale>>(`sales${toSearch({ page: listing.page, limit: "20", status: listing.status || undefined })}`),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => api(`sales/${id}/cancel`, { method: "PATCH" }),
    onSuccess: () => {
      notify.success("Venda cancelada.");
      setCancelId(null);
      void client.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: notify.failure,
  });

  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader title="Vendas" description="Vendas registradas no negócio." actions={canManage ? <Button onClick={() => setOpen(true)}>Nova venda</Button> : null} />
      <SelectField id="sale-status" aria-label="Status da venda" className="max-w-xs" value={listing.status} onChange={(event) => listing.setParams({ status: event.target.value || null })}>
        <option value="">Todos os status</option>
        <option value="COMPLETED">Concluídas</option>
        <option value="CANCELLED">Canceladas</option>
      </SelectField>
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="Não foi possível carregar as vendas." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} /> : null}
      {query.data?.data.length === 0 ? <EmptyState title="Nenhuma venda encontrada" description="As vendas concluídas aparecem nesta lista." /> : null}
      {query.data && query.data.data.length > 0 ? (
        <Card className="grid gap-4">
          <DataTable caption="Vendas" rows={query.data.data} columns={[
            { key: "when", header: "Data", render: (row) => formatDateTime(row.createdAt) },
            { key: "items", header: "Itens", render: (row) => row.items.map((item) => item.description).join(", ") },
            { key: "total", header: "Total", render: (row) => formatMoney(row.total) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} labels={saleStatusLabel} /> },
            { key: "actions", header: "Ações", render: (row) => canManage && row.status === "COMPLETED" ? <Button size="sm" variant="secondary" onClick={() => setCancelId(row.id)}>Cancelar</Button> : "—" },
          ]} />
          <PaginationBar page={query.data.meta.page} totalPages={query.data.meta.totalPages} total={query.data.meta.total} onPage={(page) => listing.setParams({ page: String(page) })} />
        </Card>
      ) : null}
      {open ? <SaleDialog onClose={() => setOpen(false)} /> : null}
      <ConfirmDialog open={Boolean(cancelId)} title="Cancelar venda" description="A venda será cancelada. Esta ação não gera estorno automático." confirmLabel="Cancelar venda" pending={cancel.isPending} onClose={() => setCancelId(null)} onConfirm={() => cancelId && cancel.mutate(cancelId)} />
    </section>
  );
}

function SaleDialog({ onClose }: { onClose: () => void }) {
  const notify = useNotify();
  const client = useQueryClient();
  const form = useForm<SaleValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: { customerId: "", type: "SERVICE", serviceId: "", productId: "", quantity: 1, discount: "", notes: "" },
  });
  const [itemType, setItemType] = useState<"SERVICE" | "PRODUCT">("SERVICE");
  const customers = useQuery({ queryKey: ["customers", "options"], queryFn: () => api<Paginated<Customer>>("customers?limit=100&isActive=true") });
  const services = useQuery({ queryKey: ["services", "options"], queryFn: () => api<Paginated<CatalogService>>("services?limit=100&isActive=true") });
  const products = useQuery({ queryKey: ["products", "options"], queryFn: () => api<Paginated<Product>>("products?limit=100&isActive=true") });
  const mutation = useMutation({
    mutationFn: (values: SaleValues) => {
      const discount = values.discount ? Number(values.discount) : undefined;
      if (values.discount && (Number.isNaN(discount) || (discount ?? 0) < 0)) throw new ApiError(400, "Informe um desconto válido.");
      return api("sales", {
        method: "POST",
        body: omitEmpty({
          customerId: values.customerId,
          discount,
          notes: values.notes,
          items: [{ type: values.type, quantity: values.quantity, serviceId: values.type === "SERVICE" ? values.serviceId : undefined, productId: values.type === "PRODUCT" ? values.productId : undefined }],
        }),
      });
    },
    onSuccess: () => {
      notify.success("Venda registrada.");
      void client.invalidateQueries({ queryKey: ["sales"] });
      onClose();
    },
    onError: notify.failure,
  });

  return (
    <Dialog open title="Nova venda" description="Um item por lançamento. O preço vem do catálogo quando não é informado." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        <SelectField id="sale-customer" label="Cliente" {...form.register("customerId")}>
          <option value="">Sem cliente</option>
          {customers.data?.data.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
        </SelectField>
        <SelectField
          id="sale-type"
          label="Tipo"
          value={itemType}
          onChange={(event) => {
            const next = event.target.value === "PRODUCT" ? "PRODUCT" : "SERVICE";
            setItemType(next);
            form.setValue("type", next);
          }}
        >
          <option value="SERVICE">Serviço</option>
          <option value="PRODUCT">Produto</option>
        </SelectField>
        {itemType === "SERVICE" ? (
          <SelectField id="sale-service" label="Serviço" error={form.formState.errors.serviceId?.message} {...form.register("serviceId")}>
            <option value="">Selecione</option>
            {services.data?.data.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </SelectField>
        ) : (
          <SelectField id="sale-product" label="Produto" error={form.formState.errors.productId?.message} {...form.register("productId")}>
            <option value="">Selecione</option>
            {products.data?.data.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </SelectField>
        )}
        <TextField id="sale-quantity" label="Quantidade" type="number" min="1" error={form.formState.errors.quantity?.message} {...form.register("quantity", { valueAsNumber: true })} />
        <TextField id="sale-discount" label="Desconto" type="number" step="0.01" min="0" hint="Opcional" {...form.register("discount")} />
        <TextAreaField id="sale-notes" label="Observações" {...form.register("notes")} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando…" : "Registrar venda"}</Button>
      </form>
    </Dialog>
  );
}
