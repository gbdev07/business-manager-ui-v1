export type BusinessType = "BARBERSHOP" | "SALON" | "RETAIL" | "SERVICES" | "OTHER";
export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";
export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type BillingInterval = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";
export type PaymentGateway = "MANUAL" | "ASAAS" | "MERCADO_PAGO" | "STRIPE";
export type PaymentMethod = "CASH" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_SLIP" | "BANK_TRANSFER" | "OTHER";
export type CommissionType = "PERCENTAGE" | "FIXED";
export type CommissionStatus = "PENDING" | "PAID" | "CANCELLED";
export type CommissionSource = "SERVICE" | "SALE";
export type SaleStatus = "COMPLETED" | "CANCELLED";
export type SaleItemType = "PRODUCT" | "SERVICE";
export type WeekdayKey = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PageMeta;
};

export type AuthUser = {
  id: string;
  tenantId: string;
  businessType: BusinessType;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
};

export type AccessibleTenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  businessType: BusinessType;
  role: string;
  isCurrent: boolean;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  status: TenantStatus;
  document: string | null;
  email: string | null;
  phone: string | null;
  timezone: string;
  currency: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  birthDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerHistory = {
  customer: Customer;
  entries: Array<{
    type: "sale" | "payment" | "subscription";
    id: string;
    status: string;
    amount: string;
    description: string | null;
    occurredAt: string;
  }>;
};

export type RoleDefinition = {
  key: string;
  name: string;
  description: string;
  permissions: string[];
};

export type TenantUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogService = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number | null;
  isActive: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: string;
  isActive: boolean;
  createdAt: string;
};

export type Sale = {
  id: string;
  customerId: string | null;
  userId: string | null;
  status: SaleStatus;
  subtotal: string;
  discount: string;
  total: string;
  notes: string | null;
  items: Array<{
    id: string;
    type: SaleItemType;
    productId: string | null;
    serviceId: string | null;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  completedAt: string;
  cancelledAt: string | null;
  createdAt: string;
};

export type DashboardMetric = {
  key: string;
  label: string;
  value: number | string;
  unit: "count" | "currency" | "percent";
};

export type DashboardSection = {
  key: string;
  label: string;
  metrics: DashboardMetric[];
};

export type DashboardOverview = {
  period: { from: string; to: string };
  core: DashboardSection;
  modules: DashboardSection[];
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  billingInterval: BillingInterval;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
};

export type Subscription = {
  id: string;
  planId: string;
  planName: string;
  customerId: string;
  status: SubscriptionStatus;
  price: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  nextRenewalAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  method: PaymentMethod | null;
  customerId: string | null;
  saleId: string | null;
  subscriptionId: string | null;
  referenceType: string | null;
  referenceId: string | null;
  externalId: string | null;
  description: string | null;
  checkoutUrl: string | null;
  dueDate: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

export type PaymentGatewayStatus = {
  gateway: PaymentGateway;
  available: boolean;
  isDefault: boolean;
};

export type NotificationChannelStatus = {
  channel: "EMAIL" | "WHATSAPP" | "PUSH";
  available: boolean;
};

export type DayHours = {
  open?: string;
  close?: string;
  closed?: boolean;
};

export type OperatingHours = Partial<Record<WeekdayKey, DayHours>>;

export type BarbershopSettings = {
  operatingHours: OperatingHours;
  updatedAt: string;
};

export type Barber = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  userId: string | null;
  specialties: string[];
  workDays: string[];
  workStartTime: string | null;
  workEndTime: string | null;
  isActive: boolean;
  createdAt: string;
};

export type NamedRef = { id: string; name: string };

export type Appointment = {
  id: string;
  customer: NamedRef;
  barber: NamedRef;
  service: NamedRef;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  price: string | null;
  notes: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
};

export type CommissionRule = {
  id: string;
  barberId: string | null;
  serviceId: string | null;
  productId: string | null;
  type: CommissionType;
  value: string;
  isActive: boolean;
  createdAt: string;
};

export type Commission = {
  id: string;
  barberId: string;
  barberName: string;
  ruleId: string | null;
  source: CommissionSource;
  appointmentId: string | null;
  saleId: string | null;
  baseAmount: string;
  amount: string;
  status: CommissionStatus;
  paidAt: string | null;
  createdAt: string;
};

export type PaginatedCommissions = Paginated<Commission> & {
  totals: { pending: string; paid: string };
};
