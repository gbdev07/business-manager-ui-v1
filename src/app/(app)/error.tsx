"use client";

import { ErrorState } from "@/components/feedback/States";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="Não foi possível carregar esta página."
      description="Tente novamente. Se o problema continuar, verifique sua conexão com a API."
      detail={error.message}
      onRetry={reset}
    />
  );
}
