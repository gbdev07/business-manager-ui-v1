"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/brand/Logo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { interpretForgotPasswordResponse } from "@/lib/auth/forgot-password";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

type ForgotPasswordValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [retryLocked, setRetryLocked] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setError(null);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = interpretForgotPasswordResponse(response.status, response.headers.get("retry-after"));
    if (result.ok) {
      setSent(true);
      return;
    }
    if (result.retryAfterSeconds) {
      const wait = result.retryAfterSeconds * 1000;
      setRetryLocked(true);
      window.setTimeout(() => setRetryLocked(false), wait);
    }
    setError(result.message);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Logo variant="horizontal" className="theme-icon-light h-8 w-auto" alt="KODA" />
        <Logo variant="on-dark" className="theme-icon-dark h-8 w-auto" alt="" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Esqueceu sua senha?</h1>
        <p className="mt-1 text-sm text-muted">Informe o e-mail da conta. Você receberá um link para redefinir a senha.</p>
        <Card className="mt-6">
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {sent ? (
              <Alert tone="success" title="Solicitação processada">
                Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.
              </Alert>
            ) : null}
            {error ? (
              <Alert tone="danger" title="Não foi possível enviar">
                {error}
              </Alert>
            ) : null}
            <TextField
              id="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <Button type="submit" disabled={form.formState.isSubmitting || retryLocked}>
              {form.formState.isSubmitting ? "Enviando…" : sent ? "Enviar novamente" : "Enviar instruções"}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-sm text-muted">
          <Link href="/login" className="font-medium text-primary-text">
            Voltar ao login
          </Link>
        </p>
      </div>
    </main>
  );
}
