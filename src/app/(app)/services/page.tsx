import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { ServicesView } from "@/modules/services/services-view";

export const metadata: Metadata = { title: "Serviços" };

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ServicesView />
    </Suspense>
  );
}
