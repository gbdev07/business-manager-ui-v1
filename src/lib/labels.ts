export type BadgeTone = "neutral" | "green" | "success" | "warning" | "danger";

export const businessTypeLabel: Record<string, string> = {
  BARBERSHOP: "Barbearia",
  SALON: "Salão de beleza",
  RETAIL: "Varejo",
  SERVICES: "Serviços",
  OTHER: "Outro",
};

export const tenantStatusLabel: Record<string, string> = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  CANCELLED: "Cancelado",
};

export const appointmentStatusLabel: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

export const billingIntervalLabel: Record<string, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  YEARLY: "Anual",
};

export const subscriptionStatusLabel: Record<string, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

export const paymentStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  FAILED: "Falhou",
  REFUNDED: "Estornado",
  CANCELLED: "Cancelado",
};

export const paymentGatewayLabel: Record<string, string> = {
  MANUAL: "Manual",
  ASAAS: "Asaas",
  MERCADO_PAGO: "Mercado Pago",
  STRIPE: "Stripe",
};

export const paymentMethodLabel: Record<string, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  BANK_SLIP: "Boleto",
  BANK_TRANSFER: "Transferência",
  OTHER: "Outro",
};

export const commissionTypeLabel: Record<string, string> = {
  PERCENTAGE: "Percentual",
  FIXED: "Valor fixo",
};

export const commissionStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  CANCELLED: "Cancelada",
};

export const commissionSourceLabel: Record<string, string> = {
  SERVICE: "Serviço",
  SALE: "Venda",
};

export const saleStatusLabel: Record<string, string> = {
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const channelLabel: Record<string, string> = {
  EMAIL: "E-mail",
  WHATSAPP: "WhatsApp",
  PUSH: "Push",
};

export const weekdayLabel: Record<string, string> = {
  sunday: "Domingo",
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
};

export const historyTypeLabel: Record<string, string> = {
  sale: "Venda",
  payment: "Pagamento",
  subscription: "Assinatura",
};

const tones: Record<string, BadgeTone> = {
  ACTIVE: "success",
  CONFIRMED: "success",
  COMPLETED: "success",
  PAID: "success",
  PENDING: "warning",
  SCHEDULED: "warning",
  PAUSED: "warning",
  EXPIRED: "warning",
  CANCELLED: "neutral",
  SUSPENDED: "warning",
  FAILED: "danger",
  NO_SHOW: "danger",
  REFUNDED: "neutral",
};

export function statusTone(status: string): BadgeTone {
  return tones[status] ?? "neutral";
}

export function labelOf(map: Record<string, string>, value: string | null | undefined) {
  if (!value) return "—";
  return map[value] ?? value;
}
