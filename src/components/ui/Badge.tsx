import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type BadgeTone = "neutral" | "green" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface text-foreground",
  green: "bg-wash text-primary-text",
  success: "bg-success-wash text-success-foreground",
  warning: "bg-warning-wash text-warning-foreground",
  danger: "bg-danger-wash text-danger-foreground",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
