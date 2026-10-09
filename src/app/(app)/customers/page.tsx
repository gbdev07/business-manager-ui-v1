import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { CustomersView } from "@/modules/customers/customers-view";

export const metadata: Metadata = { title: "Clientes" };

export default function CustomersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CustomersView />
    </Suspense>
  );
}
