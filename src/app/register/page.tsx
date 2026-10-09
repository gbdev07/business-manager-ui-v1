import type { Metadata } from "next";
import { RegisterForm } from "@/modules/auth/register-form";

export const metadata: Metadata = { title: "Criar negócio" };

export default function RegisterPage() {
  return <RegisterForm />;
}
