"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type Ref } from "react";
import { createPortal } from "react-dom";
import { fieldErrorClass, fieldIdleClass, fieldControlClass } from "@/components/forms/control";
import { TimeColumns } from "@/components/forms/TimeField";
import { cx } from "@/lib/cx";

const weekdays = [
  { name: "domingo", label: "D" },
  { name: "segunda-feira", label: "S" },
  { name: "terça-feira", label: "T" },
  { name: "quarta-feira", label: "Q" },
  { name: "quinta-feira", label: "Q" },
  { name: "sexta-feira", label: "S" },
  { name: "sábado", label: "S" },
];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const PANEL_WIDTH = 288;

type DateFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  type?: "date" | "datetime-local";
  ref?: Ref<HTMLInputElement>;
};

export function DateField({
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
  min,
  max,
  type = "date",
  ...props
}: DateFieldProps) {
  const withTime = type === "datetime-local";
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [uncontrolled, setUncontrolled] = useState(() => String(defaultValue ?? ""));
  const [clock, setClock] = useState("09:00");
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const current = value !== undefined ? String(value) : uncontrolled;
  const selected = parseInput(current, withTime);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const minDate = parseBound(min);
  const maxDate = parseBound(max);
  const today = new Date();

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
      setCoords(panelPosition(button, withTime));
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, withTime]);

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
    const base = selected ?? new Date();
    setCursor(base);
    setClock(timeOf(current) || "09:00");
    setPortal(button.closest("dialog") ?? document.body);
    setCoords(panelPosition(button, withTime));
    setOpen(true);
  }

  function choose(day: Date) {
    if (isOutOfRange(day, minDate, maxDate)) return;
    setCursor(day);
    if (!withTime) {
      commit(toIsoDate(day), true);
      return;
    }
    commit(`${toIsoDate(day)}T${clock}`, false);
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
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const shift = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -7 : 7;
      const next = addDays(cursor, shift);
      if (!isOutOfRange(next, minDate, maxDate)) setCursor(next);
      return;
    }
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      setCursor((day) => addMonths(day, event.key === "PageUp" ? -1 : 1));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(cursor);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") setOpen(false);
  }

  const days = monthGrid(cursor);
  const display = formatDisplay(current, withTime);

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
        <span className={cx("truncate", !display && "text-subtle")}>{display || "dd/mm/aaaa"}</span>
        <Calendar aria-hidden className="size-4 shrink-0 text-muted" />
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
              onMouseDown={(event) => {
                if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <button type="button" className="rounded-sm p-1.5 text-muted hover:bg-surface hover:text-foreground" aria-label="Mês anterior" onMouseDown={(event) => event.preventDefault()} onClick={() => setCursor((month) => addMonths(month, -1))}>
                  <ChevronLeft className="size-4" />
                </button>
                <p className="text-sm font-medium capitalize">{monthFormatter.format(cursor)}</p>
                <button type="button" className="rounded-sm p-1.5 text-muted hover:bg-surface hover:text-foreground" aria-label="Próximo mês" onMouseDown={(event) => event.preventDefault()} onClick={() => setCursor((month) => addMonths(month, 1))}>
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1">
                {weekdays.map((day) => (
                  <div key={day.name} className="flex h-8 items-center justify-center text-xs font-medium text-muted" title={day.name}>
                    {day.label}
                  </div>
                ))}
                {days.map((day) => {
                  const out = isOutOfRange(day, minDate, maxDate);
                  const inMonth = day.getMonth() === cursor.getMonth();
                  const isSelected = selected ? sameDay(day, selected) : false;
                  const isActive = sameDay(day, cursor);
                  const isToday = sameDay(day, today);
                  return (
                    <button
                      key={toIsoDate(day)}
                      type="button"
                      disabled={out}
                      aria-pressed={isSelected}
                      aria-label={day.toLocaleDateString("pt-BR", { dateStyle: "full" })}
                      className={cx(
                        "flex size-8 items-center justify-center rounded-sm text-sm transition-colors",
                        out && "cursor-not-allowed opacity-40",
                        !out && !isSelected && "hover:bg-surface",
                        !inMonth && !isSelected && "text-subtle",
                        isToday && !isSelected && "font-semibold text-primary-text",
                        isActive && !isSelected && "bg-surface",
                        isSelected && "bg-primary text-primary-foreground",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(day)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
              {withTime ? (
                <div className="mt-3 border-t border-border pt-3">
                  <TimeColumns
                    value={clock}
                    onChange={(next) => {
                      setClock(next);
                      if (selected) commit(`${toIsoDate(selected)}T${next}`, false);
                    }}
                  />
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <button type="button" className="text-sm font-medium text-primary-text" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(new Date())}>
                  Hoje
                </button>
                <button
                  type="button"
                  className="text-sm text-muted hover:text-foreground"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit("", true)}
                >
                  Limpar
                </button>
              </div>
              {withTime ? (
                <button type="button" className="mt-3 h-9 w-full rounded-sm bg-primary text-sm font-medium text-primary-foreground hover:bg-primary-hover" onMouseDown={(event) => event.preventDefault()} onClick={() => setOpen(false)}>
                  Concluir
                </button>
              ) : null}
            </div>,
            portal,
          )
        : null}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

function FieldMessage({ id, error, hint }: { id?: string; error?: string; hint?: string }) {
  if (error) return <p id={`${id}-error`} className="text-sm text-danger-foreground">{error}</p>;
  if (hint) return <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>;
  return null;
}

function panelPosition(button: HTMLButtonElement, withTime: boolean) {
  const rect = button.getBoundingClientRect();
  const height = withTime ? 560 : 360;
  const spaceBelow = window.innerHeight - rect.bottom;
  const top = spaceBelow < height && rect.top > spaceBelow ? Math.max(8, rect.top - height - 4) : rect.bottom + 4;
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - PANEL_WIDTH - 8);
  return { top, left };
}

function parseInput(value: string, withTime: boolean) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), withTime ? Number(match[4] ?? 0) : 0, withTime ? Number(match[5] ?? 0) : 0);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseBound(value: InputHTMLAttributes<HTMLInputElement>["min"]) {
  if (typeof value !== "string") return undefined;
  return parseInput(value, false);
}

function timeOf(value: string) {
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match?.[1] ?? "";
}

function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(date.getDate(), last));
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + amount);
  return next;
}

function sameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function isOutOfRange(day: Date, min?: Date, max?: Date) {
  const value = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  if (min && value < new Date(min.getFullYear(), min.getMonth(), min.getDate()).getTime()) return true;
  if (max && value > new Date(max.getFullYear(), max.getMonth(), max.getDate()).getTime()) return true;
  return false;
}

function monthGrid(cursor: Date) {
  const monthStart = startOfMonth(cursor);
  const start = addDays(monthStart, -monthStart.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function formatDisplay(value: string, withTime: boolean) {
  const date = parseInput(value, withTime);
  if (!date) return "";
  const label = date.toLocaleDateString("pt-BR");
  if (!withTime) return label;
  const time = timeOf(value);
  return time ? `${label} ${time}` : label;
}
