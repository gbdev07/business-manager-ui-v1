"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PasswordField } from "@/components/forms/PasswordField";
import { PasswordRules } from "@/components/forms/PasswordRules";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { applyChangePasswordResult, interpretChangePasswordResponse, PASSWORD_CHANGED_MESSAGE } from "@/lib/auth/change-password";
import { changePasswordSchema } from "@/lib/validations/schemas";

type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordForm({ onChanged }: { onChanged: (href: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    setError(null);
    try {
      const payload = await api<unknown>("auth/change-password", {
        method: "PATCH",
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
      });
      const result = interpretChangePasswordResponse(200, payload);
      if (!result.ok) return;
      setPassword("");
      form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setDone(true);
      await applyChangePasswordResult(result, {
        logout: async () => {
          await fetch("/api/auth/logout", { method: "POST" });
        },
        redirect: onChanged,
      });
    } catch (caught) {
      const status = caught instanceof ApiError ? caught.status : 0;
      const detail = caught instanceof ApiError ? caught.detail : undefined;
      const result = interpretChangePasswordResponse(status, detail ? { message: detail } : null);
      if (result.ok) return;
      if (result.field) form.setError(result.field, { message: result.message });
      else setError(result.message);
    }
  }

  return (
    <Card>
      {done ? (
        <Alert tone="success" title="Senha alterada">
          {PASSWORD_CHANGED_MESSAGE}
        </Alert>
      ) : (
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {error ? (
            <Alert tone="danger" title="Não foi possível alterar">
              {error}
            </Alert>
          ) : null}
          <PasswordField
            id="current-password"
            label="Senha atual"
            autoComplete="current-password"
            error={form.formState.errors.currentPassword?.message}
            {...form.register("currentPassword")}
          />
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando…" : "Alterar senha"}
          </Button>
        </form>
      )}
    </Card>
  );
}
