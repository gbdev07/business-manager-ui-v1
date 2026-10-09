"use client";

import { Clock } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type Ref } from "react";
import { createPortal } from "react-dom";
import { fieldControlClass, fieldErrorClass, fieldIdleClass } from "@/components/forms/control";
import { cx } from "@/lib/cx";

const hours = range(24);
const minutes = range(60);
const PANEL_WIDTH = 220;

type TimeFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  ref?: Ref<HTMLInputElement>;
};

export function TimeField({
  label,
  hint,
  error,
  id,
  className,
  disabled,
  value,
  defaultValue,
  onChange,
  onBlur,
  ref,
  ...props
}: TimeFieldProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [uncontrolled, setUncontrolled] = useState(() => String(defaultValue ?? ""));
  const current = value !== undefined ? String(value) : uncontrolled;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function place() {
      const button = buttonRef.current;
      if (!button) return;
      setCoords(panelPosition(button));
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  function assignRef(node: HTMLInputElement | null) {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
    if (node && value === undefined) setUncontrolled(node.value);
  }

  function commit(next: string, close: boolean) {
    const input = inputRef.current;
    if (!input) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, next);
    setUncontrolled(next);
    onChange?.({ target: input, currentTarget: input } as ChangeEvent<HTMLInputElement>);
    if (close) setOpen(false);
  }

  function openPanel() {
    if (disabled) return;
    const button = buttonRef.current;
    if (!button) return;
    setPortal(button.closest("dialog") ?? document.body);
    setCoords(panelPosition(button));
    setOpen(true);
  }

  function onButtonBlur(event: FocusEvent<HTMLButtonElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && (rootRef.current?.contains(next) || panelRef.current?.contains(next))) return;
    setOpen(false);
    const input = inputRef.current;
    if (input) onBlur?.({ target: input, currentTarget: input } as FocusEvent<HTMLInputElement>);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
      event.preventDefault();
      openPanel();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      commit(shiftTime(current, "hour", event.key === "ArrowUp" ? -1 : 1), false);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      commit(shiftTime(current, "minute", event.key === "ArrowLeft" ? -1 : 1), false);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") setOpen(false);
  }

  return (
    <div className={cx("grid gap-2", className)} ref={rootRef}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        ref={assignRef}
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={onChange}
        {...(value !== undefined ? { value: current } : { defaultValue })}
        className="pointer-events-none absolute size-px overflow-hidden opacity-0"
        onFocus={() => buttonRef.current?.focus()}
      />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        className={cx(
          fieldControlClass,
          "flex h-11 items-center justify-between gap-3 text-left",
          error ? fieldErrorClass : fieldIdleClass,
          open && "border-ring hover:border-ring",
        )}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onBlur={onButtonBlur}
        onKeyDown={onKeyDown}
      >
        <span className={cx("truncate tabular-nums", !current && "text-subtle")}>{current || "hh:mm"}</span>
        <Clock aria-hidden className="size-4 shrink-0 text-muted" />
      </button>
      {open && portal
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={label}
              style={{ top: coords.top, left: coords.left, width: PANEL_WIDTH }}
              className="fixed z-50 rounded-sm border border-border bg-surface-raised p-3 text-foreground shadow-[var(--koda-shadow-md)] motion-safe:animate-[koda-menu-in_160ms_ease-out]"
              onMouseDown={(event) => event.preventDefault()}
            >
              <TimeColumns value={current} onChange={(next) => commit(next, false)} />
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <button type="button" className="text-sm text-muted hover:text-foreground" onClick={() => commit("", true)}>
                  Limpar
                </button>
                <button type="button" className="text-sm font-medium text-primary-text" onClick={() => setOpen(false)}>
                  Concluir
                </button>
              </div>
            </div>,
            portal,
          )
        : null}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function TimeColumns({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hour, minute] = splitTime(value);

  useEffect(() => {
    const root = rootRef.current;
    scrollInColumn(root?.querySelector(`[data-time-hour="${hour}"]`) ?? null);
    scrollInColumn(root?.querySelector(`[data-time-minute="${minute}"]`) ?? null);
  }, [hour, minute]);

  return (
    <div ref={rootRef} className="grid grid-cols-2 gap-2">
      <TimeList label="Hora" marker="hour" values={hours} selected={hour} onSelect={(next) => onChange(joinTime(next, minute || "00"))} />
      <TimeList label="Minuto" marker="minute" values={minutes} selected={minute} onSelect={(next) => onChange(joinTime(hour || "00", next))} />
    </div>
  );
}

function TimeList({
  label,
  marker,
  values,
  selected,
  onSelect,
}: {
  label: string;
  marker: "hour" | "minute";
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-center text-xs font-medium text-muted">{label}</p>
      <div className="max-h-40 overflow-y-auto rounded-sm border border-border p-1">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            data-time-hour={marker === "hour" ? item : undefined}
            data-time-minute={marker === "minute" ? item : undefined}
            aria-pressed={item === selected}
            className={cx(
              "flex h-8 w-full items-center justify-center rounded-sm text-sm tabular-nums transition-colors",
              item === selected ? "bg-primary text-primary-foreground" : "hover:bg-surface",
            )}
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function FieldMessage({ id, error, hint }: { id?: string; error?: string; hint?: string }) {
  if (error) return <p id={`${id}-error`} className="text-sm text-danger-foreground">{error}</p>;
  if (hint) return <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>;
  return null;
}

function panelPosition(button: HTMLButtonElement) {
  const rect = button.getBoundingClientRect();
  const height = 280;
  const spaceBelow = window.innerHeight - rect.bottom;
  const top = spaceBelow < height && rect.top > spaceBelow ? Math.max(8, rect.top - height - 4) : rect.bottom + 4;
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - PANEL_WIDTH - 8);
  return { top, left };
}

function scrollInColumn(node: Element | null) {
  if (!(node instanceof HTMLElement)) return;
  const parent = node.parentElement;
  if (!parent) return;
  const top = node.getBoundingClientRect().top - parent.getBoundingClientRect().top + parent.scrollTop;
  parent.scrollTop = top - parent.clientHeight / 2 + node.clientHeight / 2;
}

function range(length: number) {
  return Array.from({ length }, (_, index) => String(index).padStart(2, "0"));
}

function splitTime(value: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  return match ? [match[1], match[2]] : ["", ""];
}

function joinTime(hour: string, minute: string) {
  return `${hour}:${minute}`;
}

function shiftTime(value: string, part: "hour" | "minute", delta: number) {
  const [hour, minute] = splitTime(value);
  const currentHour = Number(hour || "0");
  const currentMinute = Number(minute || "0");
  if (part === "hour") return joinTime(String((currentHour + delta + 24) % 24).padStart(2, "0"), minute || "00");
  return joinTime(hour || "00", String((currentMinute + delta + 60) % 60).padStart(2, "0"));
}
