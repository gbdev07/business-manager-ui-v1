import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { CommissionsView } from "@/modules/barbershop/commissions-view";

export const metadata: Metadata = { title: "Comissões" };

export default function CommissionsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CommissionsView />
    </Suspense>
  );
}
