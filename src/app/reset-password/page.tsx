import type { Metadata } from "next";
import { ResetPasswordForm } from "@/modules/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
