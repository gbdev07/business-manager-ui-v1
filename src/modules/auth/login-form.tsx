"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/brand/Logo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { loginSchema } from "@/lib/validations/schemas";
import { safeNextPath } from "@/lib/safe-next";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: LoginValues) {
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    if (!response.ok) {
      setError(payload?.message ?? "Não foi possível entrar.");
      return;
    }
    const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
    router.push(next);
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Logo variant="horizontal" className="theme-icon-light h-8 w-auto" alt="KODA" />
        <Logo variant="on-dark" className="theme-icon-dark h-8 w-auto" alt="" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-1 text-sm text-muted">Acesse o negócio vinculado à sua conta.</p>
        <Card className="mt-6">
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {error ? (
              <Alert tone="danger" title="Não foi possível entrar">
                {error}
              </Alert>
            ) : null}
            <TextField id="email" label="E-mail" type="email" autoComplete="username" error={form.formState.errors.email?.message} {...form.register("email")} />
            <TextField id="password" label="Senha" type="password" autoComplete="current-password" error={form.formState.errors.password?.message} {...form.register("password")} />
            <p className="text-right text-sm">
              <Link href="/forgot-password" className="font-medium text-primary-text">
                Esqueceu sua senha?
              </Link>
            </p>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-sm text-muted">
          Ainda não tem um negócio?{" "}
          <Link href="/register" className="font-medium text-primary-text">
            Criar conta
          </Link>
        </p>
        <p className="mt-2 text-sm text-muted">
          <Link href="/marca" className="text-primary-text">
            Identidade visual
          </Link>
        </p>
      </div>
    </main>
  );
}
