import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  secondary: "border border-border bg-transparent text-foreground hover:bg-surface",
  ghost: "text-foreground hover:bg-surface",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
