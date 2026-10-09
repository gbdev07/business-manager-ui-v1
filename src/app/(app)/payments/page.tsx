import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { PaymentsView } from "@/modules/payments/payments-view";

export const metadata: Metadata = { title: "Pagamentos" };

export default function PaymentsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentsView />
    </Suspense>
  );
}
