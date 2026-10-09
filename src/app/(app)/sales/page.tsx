import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { SalesView } from "@/modules/sales/sales-view";

export const metadata: Metadata = { title: "Vendas" };

export default function SalesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SalesView />
    </Suspense>
  );
}
