import { hasPermission } from "../lib/permissions";
import type { BusinessType } from "../types/contracts";

export type NavIcon =
  | "dashboard"
  | "customers"
  | "services"
  | "products"
  | "sales"
  | "appointments"
  | "barbers"
  | "payments"
  | "subscriptions"
  | "commissions"
  | "users"
  | "notifications"
  | "settings";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  permission?: string;
  module?: BusinessType;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    id: "overview",
    label: "Visão geral",
    items: [{ href: "/dashboard", label: "Painel", icon: "dashboard", permission: "dashboard:read" }],
  },
  {
    id: "management",
    label: "Gestão",
    items: [
      { href: "/customers", label: "Clientes", icon: "customers", permission: "customers:read" },
      { href: "/services", label: "Serviços", icon: "services", permission: "catalog:read" },
      { href: "/products", label: "Produtos", icon: "products", permission: "catalog:read" },
    ],
  },
  {
    id: "operation",
    label: "Operação",
    items: [
      {
        href: "/barbershop/appointments",
        label: "Agendamentos",
        icon: "appointments",
        permission: "barbershop.appointments:read",
        module: "BARBERSHOP",
      },
      {
        href: "/barbershop/barbers",
        label: "Profissionais",
        icon: "barbers",
        permission: "barbershop.barbers:read",
        module: "BARBERSHOP",
      },
    ],
  },
  {
    id: "finance",
    label: "Financeiro",
    items: [
      { href: "/sales", label: "Vendas", icon: "sales", permission: "sales:read" },
      { href: "/payments", label: "Pagamentos", icon: "payments", permission: "payments:read" },
      { href: "/subscriptions", label: "Assinaturas", icon: "subscriptions", permission: "subscriptions:read" },
      {
        href: "/barbershop/commissions",
        label: "Comissões",
        icon: "commissions",
        permission: "barbershop.commissions:read",
        module: "BARBERSHOP",
      },
    ],
  },
  {
    id: "admin",
    label: "Administração",
    items: [
      { href: "/users", label: "Usuários", icon: "users", permission: "users:read" },
      { href: "/notifications", label: "Notificações", icon: "notifications", permission: "tenant:read" },
      { href: "/settings", label: "Configurações", icon: "settings", permission: "tenant:read" },
    ],
  },
];

export function visibleNavigation(
  groups: readonly NavGroup[],
  input: { permissions: readonly string[]; businessType: BusinessType | null },
) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.module && item.module !== input.businessType) return false;
        return hasPermission(input.permissions, item.permission);
      }),
    }))
    .filter((group) => group.items.length > 0);
}
