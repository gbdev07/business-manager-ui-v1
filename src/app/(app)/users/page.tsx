import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/States";
import { UsersView } from "@/modules/users/users-view";

export const metadata: Metadata = { title: "Usuários" };

export default function UsersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UsersView />
    </Suspense>
  );
}
