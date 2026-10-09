"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    function redirectToLogin() {
      if (window.location.pathname !== "/login") {
        router.push("/login");
        router.refresh();
      }
    }

    window.addEventListener("koda:unauthorized", redirectToLogin);
    return () => window.removeEventListener("koda:unauthorized", redirectToLogin);
  }, [router]);

  return null;
}
