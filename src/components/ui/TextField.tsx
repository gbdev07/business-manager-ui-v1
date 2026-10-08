import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
};

export function TextField({ label, hint, error, id, className, ...props }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          "h-11 rounded-sm border bg-surface-raised px-3 text-base text-foreground transition-colors placeholder:text-subtle",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger-foreground">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
