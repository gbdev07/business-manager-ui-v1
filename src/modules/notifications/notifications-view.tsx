"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/components/app/providers";
import { ErrorState, ForbiddenState, LoadingState } from "@/components/feedback/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { channelLabel } from "@/lib/labels";
import { hasPermission } from "@/lib/permissions";
import type { NotificationChannelStatus } from "@/types/contracts";

export function NotificationsView() {
  const { user } = useSession();
  const enabled = hasPermission(user.permissions, "tenant:read");
  const query = useQuery({
    queryKey: ["notifications", "channels"],
    enabled,
    queryFn: () => api<NotificationChannelStatus[]>("notifications/channels"),
  });

  if (!enabled) return <ForbiddenState />;

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Notificações"
        description="A API informa se cada canal está disponível. Não há consulta de mensagens enviadas nem disparo pela interface."
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState title="Não foi possível consultar os canais." description={query.error instanceof ApiError ? query.error.message : "Falha de conexão."} onRetry={() => query.refetch()} />
      ) : null}
      {query.data ? (
        <div className="grid gap-3">
          {query.data.map((channel) => (
            <Card key={channel.channel} className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-medium">{channelLabel[channel.channel] ?? channel.channel}</h2>
                <p className="text-sm text-muted">
                  {channel.available ? "Canal disponível para envio pela API." : "Canal ainda não integrado. Nenhuma mensagem será enviada por aqui."}
                </p>
              </div>
              <Badge tone={channel.available ? "success" : "warning"}>{channel.available ? "Disponível" : "Indisponível"}</Badge>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
