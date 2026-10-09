"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({ open, title, description, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClose={onClose}
      className="w-[min(calc(100%_-_2rem),40rem)] rounded-sm border border-border bg-surface-raised p-5 text-foreground shadow-[var(--koda-shadow-md)] backdrop:bg-graphite/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="dialog-title" className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        <button type="button" className="text-sm text-muted hover:text-foreground" onClick={onClose}>
          Fechar
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </dialog>
  );
}
