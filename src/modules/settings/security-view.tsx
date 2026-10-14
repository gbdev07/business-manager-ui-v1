"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChangePasswordForm } from "@/modules/settings/change-password-form";

export function SecurityView() {
  const router = useRouter();

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Segurança da conta"
        description="Altere a senha usada para entrar. Ao concluir, as sessões abertas são encerradas e é preciso entrar novamente."
      />
      <ChangePasswordForm
        onChanged={(href) => {
          router.push(href);
          router.refresh();
        }}
      />
    </section>
  );
}
