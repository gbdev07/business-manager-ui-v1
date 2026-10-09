const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function formatDate(value: string | null | undefined) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "—";
}

export function formatDateTime(value: string | null | undefined) {
  const date = parseDate(value);
  return date ? dateTimeFormatter.format(date) : "—";
}

export function formatTime(value: string | null | undefined) {
  const date = parseDate(value);
  return date ? timeFormatter.format(date) : "—";
}

export function formatMoney(value: string | number | null | undefined, currency = "BRL") {
  if (value === null || value === undefined || value === "") return "—";
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function todayInputValue() {
  return toInputDate(new Date());
}

export function monthStartInputValue() {
  const now = new Date();
  return toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

export function dayRangeIso(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function weekRangeIso(date: string) {
  const current = new Date(`${date}T00:00:00`);
  const day = current.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(current);
  start.setDate(current.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function localInputToIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function omitEmpty(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== "" && item !== undefined && item !== null),
  );
}

function parseDate(value: string | null | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toInputDate(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
