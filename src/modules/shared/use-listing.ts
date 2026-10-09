"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useListing() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = search.get("page") ?? "1";
  const q = search.get("q") ?? "";
  const active = search.get("active") ?? "";
  const status = search.get("status") ?? "";

  function setParams(changes: Record<string, string | null>) {
    const next = new URLSearchParams(search.toString());
    const touchesPage = Object.hasOwn(changes, "page");
    for (const [key, value] of Object.entries(changes)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    if (!touchesPage) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return { page, q, active, status, setParams };
}
