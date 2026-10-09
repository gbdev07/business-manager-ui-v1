import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { SubscriptionsView } from "@/modules/subscriptions/subscriptions-view";

export const metadata: Metadata = { title: "Assinaturas" };

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SubscriptionsView />
    </Suspense>
  );
}
