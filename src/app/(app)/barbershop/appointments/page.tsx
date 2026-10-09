import type { Metadata } from "next";
import { AppointmentsView } from "@/modules/barbershop/appointments-view";

export const metadata: Metadata = { title: "Agendamentos" };

export default function AppointmentsPage() {
  return <AppointmentsView />;
}
