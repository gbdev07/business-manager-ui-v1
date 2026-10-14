import type { Metadata } from "next";
import { SecurityView } from "@/modules/settings/security-view";

export const metadata: Metadata = { title: "Segurança" };

export default function SecurityPage() {
  return <SecurityView />;
}
