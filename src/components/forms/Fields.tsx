import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

const controlClass = "w-full rounded-sm border bg-surface-raised px-3 text-base text-foreground placeholder:text-subtle";

export function SelectField({
  id,
  label,
  hint,
  error,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string; children: ReactNode }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(controlClass, "h-11", error ? "border-danger" : "border-border", className)}
        {...props}
      >
        {children}
      </select>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(controlClass, "min-h-24 py-2", error ? "border-danger" : "border-border", className)}
        {...props}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

function FieldMessage({ id, error, hint }: { id?: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="text-sm text-danger-foreground">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="text-sm text-muted">
        {hint}
      </p>
    );
  }
  return null;
}
