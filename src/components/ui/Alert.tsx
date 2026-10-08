import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type AlertTone = "success" | "danger";

const tones: Record<AlertTone, string> = {
  success: "border-success-foreground/30 bg-success-wash text-success-foreground",
  danger: "border-danger-foreground/30 bg-danger-wash text-danger-foreground",
};

type AlertProps = {
  tone: AlertTone;
  title: string;
  children: ReactNode;
};

export function Alert({ tone, title, children }: AlertProps) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;

  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx("flex gap-3 rounded-sm border p-4", tones[tone])}>
      <Icon aria-hidden size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
