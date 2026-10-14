import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Use letra maiúscula, minúscula e um número.");

export const loginSchema = z.object({
  email: z.string().trim().regex(emailPattern, "Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().regex(emailPattern, "Informe um e-mail válido."),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "A nova senha precisa ser diferente da atual.",
  });

export const registerSchema = z.object({
  businessName: z.string().trim().min(2, "Informe o nome do negócio.").max(120),
  businessType: z.enum(["BARBERSHOP", "SALON", "RETAIL", "SERVICES", "OTHER"]),
  ownerName: z.string().trim().min(2, "Informe o nome do responsável.").max(120),
  email: z.string().trim().regex(emailPattern, "Informe um e-mail válido."),
  password: passwordSchema,
  phone: z.string().trim(),
  timezone: z.string().trim(),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  email: z.string().trim().refine((value) => value === "" || emailPattern.test(value), "Informe um e-mail válido."),
  phone: z.string().trim(),
  document: z.string().trim(),
  birthDate: z.string().trim(),
  notes: z.string().trim(),
});

export const userSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  email: z.string().trim().regex(emailPattern, "Informe um e-mail válido."),
  password: passwordSchema,
  role: z.string().min(1, "Selecione um papel."),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  role: z.string().min(1, "Selecione um papel."),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  description: z.string().trim(),
  price: z.number().min(0, "Informe um preço válido."),
  durationMinutes: z.string().trim(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  description: z.string().trim(),
  sku: z.string().trim().max(60, "O SKU pode ter no máximo 60 caracteres."),
  price: z.number().min(0, "Informe um preço válido."),
});

export const barberSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome.").max(120),
    email: z.string().trim().refine((value) => value === "" || emailPattern.test(value), "Informe um e-mail válido."),
    phone: z.string().trim(),
    userId: z.string().trim(),
    specialties: z.string().trim(),
    workDays: z.array(z.string()),
    workStartTime: z.string().trim(),
    workEndTime: z.string().trim(),
  })
  .superRefine((value, context) => {
    if (value.workStartTime && !timePattern.test(value.workStartTime)) {
      context.addIssue({ code: "custom", path: ["workStartTime"], message: "Use o formato HH:mm." });
    }
    if (value.workEndTime && !timePattern.test(value.workEndTime)) {
      context.addIssue({ code: "custom", path: ["workEndTime"], message: "Use o formato HH:mm." });
    }
    if (Boolean(value.workStartTime) !== Boolean(value.workEndTime)) {
      context.addIssue({
        code: "custom",
        path: ["workEndTime"],
        message: "Informe o início e o fim do expediente.",
      });
    }
  });

export const appointmentSchema = z.object({
  customerId: z.string().min(1, "Selecione o cliente."),
  barberId: z.string().min(1, "Selecione o profissional."),
  serviceId: z.string().min(1, "Selecione o serviço."),
  startsAt: z.string().min(1, "Informe a data e a hora."),
  notes: z.string().trim().max(500, "As observações podem ter no máximo 500 caracteres."),
});

export const planSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  description: z.string().trim(),
  price: z.number().min(0, "Informe um valor válido."),
  billingInterval: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUAL", "YEARLY"]),
  durationDays: z.number().int().min(1, "Informe a duração.").max(3660),
});

export const subscriptionSchema = z.object({
  planId: z.string().min(1, "Selecione o plano."),
  customerId: z.string().min(1, "Selecione o cliente."),
  startDate: z.string().trim(),
  autoRenew: z.boolean(),
});

export const paymentSchema = z.object({
  amount: z.number().min(0.01, "Informe um valor maior que zero."),
  gateway: z.string().min(1, "Selecione o gateway."),
  method: z.string().trim(),
  customerId: z.string().trim(),
  description: z.string().trim(),
  dueDate: z.string().trim(),
});

export const saleSchema = z
  .object({
    customerId: z.string().trim(),
    type: z.enum(["SERVICE", "PRODUCT"]),
    serviceId: z.string().trim(),
    productId: z.string().trim(),
    quantity: z.number().int().min(1, "Informe a quantidade.").max(1000),
    discount: z.string().trim(),
    notes: z.string().trim(),
  })
  .superRefine((value, context) => {
    if (value.type === "SERVICE" && !value.serviceId) {
      context.addIssue({ code: "custom", path: ["serviceId"], message: "Selecione o serviço." });
    }
    if (value.type === "PRODUCT" && !value.productId) {
      context.addIssue({ code: "custom", path: ["productId"], message: "Selecione o produto." });
    }
  });

export const commissionRuleSchema = z
  .object({
    barberId: z.string().trim(),
    serviceId: z.string().trim(),
    productId: z.string().trim(),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().min(0, "Informe um valor válido."),
  })
  .superRefine((value, context) => {
    if (value.type === "PERCENTAGE" && value.value > 100) {
      context.addIssue({ code: "custom", path: ["value"], message: "O percentual não pode passar de 100." });
    }
  });

export const tenantSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  document: z.string().trim(),
  email: z.string().trim().refine((value) => value === "" || emailPattern.test(value), "Informe um e-mail válido."),
  phone: z.string().trim(),
  timezone: z.string().trim().min(1, "Informe o fuso horário."),
  currency: z.string().trim().length(3, "Use o código de 3 letras, como BRL.").toUpperCase(),
});
