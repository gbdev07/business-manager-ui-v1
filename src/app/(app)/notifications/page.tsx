import type { Metadata } from "next";
import { NotificationsView } from "@/modules/notifications/notifications-view";

export const metadata: Metadata = { title: "Notificações" };

export default function NotificationsPage() {
  return <NotificationsView />;
}
