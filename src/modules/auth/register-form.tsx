"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/brand/Logo";
import { SelectField } from "@/components/forms/Fields";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { omitEmpty } from "@/lib/format";
import { businessTypeLabel } from "@/lib/labels";
import { registerSchema } from "@/lib/validations/schemas";
import type { BusinessType } from "@/types/contracts";

const types: BusinessType[] = ["BARBERSHOP", "SALON", "RETAIL", "SERVICES", "OTHER"];

type RegisterValues = {
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  timezone: string;
};

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      businessType: "BARBERSHOP",
      ownerName: "",
      email: "",
      password: "",
      phone: "",
      timezone: "America/Sao_Paulo",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(omitEmpty(values)),
    });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    if (!response.ok) {
      setError(payload?.message ?? "Não foi possível criar o negócio.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <Logo className="h-8 w-auto" alt="KODA" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Criar negócio</h1>
        <p className="mt-1 text-sm text-muted">O primeiro usuário entra como responsável do negócio.</p>
        <Card className="mt-6">
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {error ? (
              <Alert tone="danger" title="Não foi possível criar a conta">
                {error}
              </Alert>
            ) : null}
            <TextField id="businessName" label="Nome do negócio" error={form.formState.errors.businessName?.message} {...form.register("businessName")} />
            <SelectField id="businessType" label="Segmento" error={form.formState.errors.businessType?.message} {...form.register("businessType")}>
              {types.map((type) => (
                <option key={type} value={type}>
                  {businessTypeLabel[type]}
                </option>
              ))}
            </SelectField>
            <TextField id="ownerName" label="Seu nome" error={form.formState.errors.ownerName?.message} {...form.register("ownerName")} />
            <TextField id="email" label="E-mail" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} />
            <TextField id="password" label="Senha" type="password" autoComplete="new-password" hint="Mínimo de 8 caracteres, com maiúscula, minúscula e número." error={form.formState.errors.password?.message} {...form.register("password")} />
            <TextField id="phone" label="Telefone" hint="Opcional" error={form.formState.errors.phone?.message} {...form.register("phone")} />
            <TextField id="timezone" label="Fuso horário" error={form.formState.errors.timezone?.message} {...form.register("timezone")} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Criando…" : "Criar negócio"}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-sm text-muted">
          Já tem acesso?{" "}
          <Link href="/login" className="font-medium text-primary-text">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
