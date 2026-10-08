"use client";

import { FormEvent, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { tagline } from "@/lib/brand";

export function LoginScreen() {
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) {
      setError("Preencha e-mail e senha para entrar.");
      return;
    }
    setError("");
  }

  return (
    <div className="grid bg-graphite md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col justify-between gap-10 p-8 text-ivory md:p-10">
        <Logo variant="on-dark" alt="KODA" className="h-8 w-auto" />
        <p className="max-w-xs text-2xl font-medium leading-tight tracking-[-0.03em]">{tagline}</p>
      </div>
      <form onSubmit={onSubmit} className="bg-ivory p-8 text-graphite md:p-10" noValidate>
        <p className="text-xs font-semibold tracking-[0.16em] text-[#526B50] uppercase">KODA Gestão</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-graphite">Entrar</h3>
        <div className="mt-6 grid gap-4">
          <TextField id="login-email" name="email" label="E-mail" type="email" autoComplete="username" error={error || undefined} />
          <TextField id="login-password" name="password" label="Senha" type="password" autoComplete="current-password" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit">Entrar</Button>
          <Button variant="ghost" className="text-graphite">
            Esqueci minha senha
          </Button>
        </div>
      </form>
    </div>
  );
}
