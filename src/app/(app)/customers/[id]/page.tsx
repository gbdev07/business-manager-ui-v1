import type { Metadata } from "next";
import { CustomerDetailView } from "@/modules/customers/customers-view";

export const metadata: Metadata = { title: "Cliente" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerDetailView id={id} />;
}
