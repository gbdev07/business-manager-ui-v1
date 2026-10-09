"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { fieldControlClass, fieldErrorClass, fieldIdleClass } from "@/components/forms/control";
import { cx } from "@/lib/cx";

type SelectOption = {
  value: string;
  label: ReactNode;
  disabled: boolean;
};

export function SelectField({
  id,
  label,
  hint,
  error,
  children,
  className,
  "aria-label": ariaLabel,
  disabled,
  value,
  defaultValue,
  onChange,
  onBlur,
  ref,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  ref?: Ref<HTMLSelectElement>;
}) {
  const options = readOptions(children);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(() => String(defaultValue ?? ""));
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const current = value !== undefined ? String(value) : uncontrolled;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === current));
  const selected = options.find((option) => option.value === current);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function assignRef(node: HTMLSelectElement | null) {
    selectRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
    if (node && value === undefined) setUncontrolled(node.value);
  }

  function commit(next: string) {
    const select = selectRef.current;
    if (!select) return;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set?.call(select, next);
    setUncontrolled(next);
    onChange?.({ target: select, currentTarget: select } as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  function toggle() {
    if (disabled) return;
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setPlacement(spaceBelow < 240 && rect.top > spaceBelow ? "top" : "bottom");
    }
    setActive(selectedIndex);
    setOpen(true);
  }

  function onButtonBlur(event: FocusEvent<HTMLButtonElement>) {
    if (rootRef.current?.contains(event.relatedTarget)) return;
    setOpen(false);
    const select = selectRef.current;
    if (select) onBlur?.({ target: select, currentTarget: select } as FocusEvent<HTMLSelectElement>);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!open) {
        toggle();
        return;
      }
      setActive((index) => nextEnabled(options, index, direction));
      return;
    }
    if (event.key === "Home" && open) {
      event.preventDefault();
      setActive(nextEnabled(options, -1, 1));
      return;
    }
    if (event.key === "End" && open) {
      event.preventDefault();
      setActive(nextEnabled(options, options.length, -1));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        toggle();
        return;
      }
      const option = options[active];
      if (option && !option.disabled) commit(option.value);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") setOpen(false);
  }

  return (
    <div className={cx("grid gap-2", className)} ref={rootRef}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      ) : null}
      <select
        {...props}
        ref={assignRef}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={onChange}
        {...(value !== undefined ? { value } : { defaultValue })}
        className="pointer-events-none absolute size-px overflow-hidden opacity-0"
        onFocus={() => buttonRef.current?.focus()}
      >
        {children}
      </select>
      <div className="relative">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          disabled={disabled}
          role="combobox"
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${id}-option-${active}` : undefined}
          className={cx(
            fieldControlClass,
            "flex h-11 items-center justify-between gap-3 text-left",
            error ? fieldErrorClass : fieldIdleClass,
            open && "border-ring hover:border-ring",
          )}
          onClick={toggle}
          onBlur={onButtonBlur}
          onKeyDown={onKeyDown}
        >
          <span className={cx("truncate", !selected && "text-subtle")}>{selected?.label ?? "Selecione"}</span>
          <ChevronDown aria-hidden className={cx("size-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")} />
        </button>
        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={id}
            className={cx(
              "absolute z-30 max-h-60 w-full overflow-auto rounded-sm border border-border bg-surface-raised p-1 shadow-[var(--koda-shadow-md)] motion-safe:animate-[koda-menu-in_160ms_ease-out]",
              placement === "top" ? "bottom-full mb-1 origin-bottom" : "top-full mt-1 origin-top",
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === current;
              const isActive = index === active;
              return (
                <li key={`${option.value}-${index}`} role="presentation">
                  <button
                    id={`${id}-option-${index}`}
                    type="button"
                    role="option"
                    data-option-index={index}
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    className={cx(
                      "flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-left text-sm transition-colors",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                      isSelected ? "bg-wash" : isActive && "bg-surface",
                    )}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => commit(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                    <Check aria-hidden className={cx("size-4 shrink-0 text-primary-text transition-opacity duration-150", isSelected ? "opacity-100" : "opacity-0")} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

function readOptions(children: ReactNode) {
  const options: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child) || child.type !== "option") return;
    const optionValue = child.props.value != null ? String(child.props.value) : "";
    options.push({ value: optionValue, label: child.props.children, disabled: Boolean(child.props.disabled) });
  });
  return options;
}

function nextEnabled(options: SelectOption[], from: number, direction: 1 | -1) {
  if (options.length === 0) return 0;
  let index = from;
  for (let step = 0; step < options.length; step += 1) {
    index = (index + direction + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return from;
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
        className={cx(fieldControlClass, "min-h-24 py-2", error ? fieldErrorClass : fieldIdleClass, className)}
        {...props}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function Checkbox({ label, id, className, disabled, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label htmlFor={fieldId} className={cx("inline-flex cursor-pointer items-center gap-2 text-sm", disabled && "cursor-not-allowed opacity-40", className)}>
      <span className="relative inline-flex size-5 shrink-0">
        <input
          {...props}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          className="peer absolute inset-0 z-10 size-5 cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className="pointer-events-none flex size-5 items-center justify-center rounded-sm border border-border bg-surface-raised transition-colors peer-hover:border-foreground/30 peer-focus-visible:border-ring peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100"
        >
          <Check className="size-3.5 scale-75 text-primary-foreground opacity-0 transition duration-150" />
        </span>
      </span>
      {label}
    </label>
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
