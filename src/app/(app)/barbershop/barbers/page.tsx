import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { BarbersView } from "@/modules/barbershop/barbers-view";

export const metadata: Metadata = { title: "Profissionais" };

export default function BarbersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BarbersView />
    </Suspense>
  );
}
