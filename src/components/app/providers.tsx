"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/errors";
import type { AuthUser, Tenant } from "@/types/contracts";

type SessionValue = {
  user: AuthUser;
  tenant: Tenant | null;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ value, children }: { value: SessionValue; children: ReactNode }) {
  const stable = useMemo(() => value, [value]);
  return <SessionContext.Provider value={stable}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Sessão indisponível.");
  return value;
}

type ToastItem = { id: number; tone: "success" | "danger"; message: string };
type ToastContextValue = { push: (tone: ToastItem["tone"], message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      push(tone, message) {
        const id = Date.now() + Math.random();
        setItems((current) => [...current, { id, tone, message }]);
        window.setTimeout(() => {
          setItems((current) => current.filter((item) => item.id !== id));
        }, 5000);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 grid w-[min(100%-2rem,22rem)] gap-2" aria-live="polite">
        {items.map((item) => (
          <p
            key={item.id}
            role={item.tone === "danger" ? "alert" : "status"}
            className={
              item.tone === "danger"
                ? "rounded-sm border border-danger-foreground/30 bg-danger-wash px-4 py-3 text-sm text-danger-foreground"
                : "rounded-sm border border-success-foreground/30 bg-success-wash px-4 py-3 text-sm text-success-foreground"
            }
          >
            {item.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useNotify() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("Feedback indisponível.");
  return {
    success(message: string) {
      toast.push("success", message);
    },
    failure(error: unknown) {
      toast.push("danger", error instanceof ApiError ? error.message : "Não foi possível conectar à API.");
    },
  };
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: (failureCount, error) => error instanceof ApiError && error.status >= 500 && failureCount < 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
