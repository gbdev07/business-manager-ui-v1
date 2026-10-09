import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { ProductsView } from "@/modules/products/products-view";

export const metadata: Metadata = { title: "Produtos" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductsView />
    </Suspense>
  );
}
