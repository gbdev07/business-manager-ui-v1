/** Same rules as the API: exact match, global `*`, or resource wildcard (`customers:*`). */
export function hasPermission(granted: readonly string[], required?: string) {
  if (!required) return true;
  if (granted.includes("*") || granted.includes(required)) return true;

  const separator = required.lastIndexOf(":");
  if (separator === -1) return false;
  return granted.includes(`${required.slice(0, separator)}:*`);
}
