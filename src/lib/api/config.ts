export function apiOrigin() {
  return (process.env.API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export function apiPrefix() {
  return (process.env.API_PREFIX ?? "api/v1").replace(/^\/|\/$/g, "");
}

export function apiUrl(path: string) {
  const clean = path.replace(/^\//, "");
  return `${apiOrigin()}/${apiPrefix()}/${clean}`;
}
