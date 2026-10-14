"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/brand/Logo";
import { PasswordField } from "@/components/forms/PasswordField";
import { PasswordRules } from "@/components/forms/PasswordRules";
import { Alert } from "@/components/ui/Alert";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { pathWithoutResetToken, readResetToken, RESET_PASSWORD_SUCCESS, type ResetPasswordFailureKind } from "@/lib/auth/reset-password";
import { resetPasswordSchema } from "@/lib/validations/schemas";

type ResetPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

type TokenPresence = "pending" | "ready" | "missing" | "invalid";

let rememberedToken: string | null = null;
let capturedPresence: Exclude<TokenPresence, "pending"> | null = null;

function rememberToken(token: string) {
  rememberedToken = token;
  capturedPresence = "ready";
}

function releaseToken() {
  rememberedToken = null;
  capturedPresence = null;
}

function currentToken() {
  const fromUrl = readResetToken(window.location.search);
  if (fromUrl.token) return fromUrl.token;
  return rememberedToken;
}

function tokenPresence(): TokenPresence {
  const fromUrl = readResetToken(window.location.search);
  if (fromUrl.token !== null) {
    rememberedToken = fromUrl.token;
    capturedPresence = "ready";
    return "ready";
  }
  if (fromUrl.reason === "invalid") {
    capturedPresence = "invalid";
    return "invalid";
  }
  if (capturedPresence) return capturedPresence;
  if (rememberedToken) return "ready";
  return "missing";
}

function pendingToken(): TokenPresence {
  return "pending";
}

function subscribe() {
  return () => {};
}

export function ResetPasswordForm() {
  const presence = useSyncExternalStore(subscribe, tokenPresence, pendingToken);
  const [done, setDone] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(presence === "missing" || presence === "invalid" ? presence : null);
  const [error, setError] = useState<string | null>(null);
  const [retryLocked, setRetryLocked] = useState(false);
  const [password, setPassword] = useState("");
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    const fromUrl = readResetToken(window.location.search);
    if (fromUrl.token) rememberToken(fromUrl.token);
    if (!window.location.search.includes("token=")) return;
    window.history.replaceState(window.history.state, "", pathWithoutResetToken(window.location.pathname, window.location.search));
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    const token = currentToken();
    if (!token) {
      setBlocked("missing");
      return;
    }
    setError(null);
    let response: Response;
    try {
      response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.newPassword, confirmPassword: values.confirmPassword }),
      });
    } catch {
      setError("Não foi possível conectar à API. Verifique se o servidor está no ar.");
      return;
    }
    const payload = (await response.json().catch(() => null)) as { message?: unknown; kind?: unknown } | null;
    if (response.ok) {
      releaseToken();
      setPassword("");
      form.reset({ newPassword: "", confirmPassword: "" });
      window.history.replaceState(window.history.state, "", pathWithoutResetToken(window.location.pathname, window.location.search));
      setDone(true);
      return;
    }

    const kind = typeof payload?.kind === "string" ? payload.kind : "unexpected";
    const message = typeof payload?.message === "string" ? payload.message : "Não foi possível redefinir a senha. Tente novamente.";
    if (isTokenFailure(kind)) {
      releaseToken();
      window.history.replaceState(window.history.state, "", pathWithoutResetToken(window.location.pathname, window.location.search));
      setBlocked(kind);
      setError(message);
      return;
    }
    if (kind === "policy") {
      form.setError("newPassword", { message });
      return;
    }
    if (kind === "mismatch") {
      form.setError("confirmPassword", { message });
      return;
    }
    if (kind === "rate") {
      const wait = Number(response.headers.get("retry-after"));
      if (Number.isFinite(wait) && wait > 0) {
        setRetryLocked(true);
        window.setTimeout(() => setRetryLocked(false), wait * 1000);
      }
    }
    setError(message);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Logo variant="horizontal" className="theme-icon-light h-8 w-auto" alt="KODA" />
        <Logo variant="on-dark" className="theme-icon-dark h-8 w-auto" alt="" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Definir nova senha</h1>
        <p className="mt-1 text-sm text-muted">Escolha uma senha nova para entrar na sua conta.</p>
        <Card className="mt-6">
          {done ? (
            <div className="grid gap-4">
              <Alert tone="success" title="Senha alterada">
                {RESET_PASSWORD_SUCCESS}
              </Alert>
              <Link href="/login" className={buttonClass()}>
                Voltar para o login
              </Link>
            </div>
          ) : presence === "pending" ? (
            <p className="text-sm text-muted" role="status">
              Carregando…
            </p>
          ) : blocked || presence === "missing" || presence === "invalid" ? (
            <div className="grid gap-4">
              <Alert tone="danger" title="Link indisponível">
                {error ?? (presence === "invalid" || blocked === "invalid" ? "Este link é inválido. Solicite um novo." : "Abra o link enviado por e-mail para definir uma nova senha.")}
              </Alert>
              <Link href="/forgot-password" className={buttonClass()} onClick={releaseToken}>
                Solicitar um novo link
              </Link>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              {error ? (
                <Alert tone="danger" title="Não foi possível redefinir">
                  {error}
                </Alert>
              ) : null}
              <PasswordField
                id="new-password"
                label="Nova senha"
                autoComplete="new-password"
                describedBy="password-rules"
                error={form.formState.errors.newPassword?.message}
                {...form.register("newPassword", {
                  onChange: (event: { target: { value: string } }) => setPassword(event.target.value),
                })}
              />
              <PasswordRules id="password-rules" value={password} />
              <PasswordField
                id="confirm-password"
                label="Confirmar nova senha"
                autoComplete="new-password"
                error={form.formState.errors.confirmPassword?.message}
                {...form.register("confirmPassword")}
              />
              <Button type="submit" disabled={form.formState.isSubmitting || retryLocked}>
                {form.formState.isSubmitting ? "Salvando…" : "Redefinir senha"}
              </Button>
            </form>
          )}
        </Card>
        {done ? null : (
          <p className="mt-4 text-sm text-muted">
            <Link href="/login" className="font-medium text-primary-text" onClick={releaseToken}>
              Voltar ao login
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

function isTokenFailure(kind: string): kind is ResetPasswordFailureKind {
  return kind === "invalid" || kind === "expired" || kind === "used" || kind === "rejected";
}
