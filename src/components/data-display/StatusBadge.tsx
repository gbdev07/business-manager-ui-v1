import { Badge } from "@/components/ui/Badge";
import { labelOf, statusTone } from "@/lib/labels";

export function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  return <Badge tone={statusTone(status)}>{labelOf(labels, status)}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "success" : "neutral"}>{active ? "Ativo" : "Inativo"}</Badge>;
}
