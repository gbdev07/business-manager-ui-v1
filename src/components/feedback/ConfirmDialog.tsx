"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/overlay/Dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} description={description} onClose={onClose}>
      {children}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Voltar
        </Button>
        <Button onClick={onConfirm} disabled={pending}>
          {pending ? "Aguarde…" : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
