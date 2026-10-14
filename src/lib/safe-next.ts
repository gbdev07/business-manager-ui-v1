export function safeNextPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if (value.startsWith("/api") || value.startsWith("/login") || value.startsWith("/register") || value.startsWith("/forgot-password")) {
    return fallback;
  }
  return value;
}
