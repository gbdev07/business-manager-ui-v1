import type { InputHTMLAttributes } from "react";
import { DateField } from "@/components/forms/DateField";
import { TimeField } from "@/components/forms/TimeField";
import { fieldControlClass, fieldErrorClass, fieldIdleClass } from "@/components/forms/control";
import { cx } from "@/lib/cx";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
};

export function TextField({ label, hint, error, id, className, type, ...props }: TextFieldProps) {
  if (type === "date" || type === "datetime-local") {
    return <DateField id={id} label={label} hint={hint} error={error} className={className} type={type} {...props} />;
  }
  if (type === "time") {
    return <TimeField id={id} label={label} hint={hint} error={error} className={className} {...props} />;
  }
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
        className={cx(fieldControlClass, "h-11", error ? fieldErrorClass : fieldIdleClass, className)}
        type={type}
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

export function SearchField({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(fieldControlClass, "h-11", fieldIdleClass, className)} {...props} />;
}
