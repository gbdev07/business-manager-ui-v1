"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
import { fieldControlClass, fieldErrorClass, fieldIdleClass } from "@/components/forms/control";
import { cx } from "@/lib/cx";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  id: string;
  describedBy?: string;
};

export function PasswordField({ label, error, id, className, describedBy, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const described = [error ? errorId : undefined, describedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          {...props}
          className={cx(fieldControlClass, "h-11 pr-12", error ? fieldErrorClass : fieldIdleClass, className)}
          type={visible ? "text" : "password"}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-foreground"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-danger-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
