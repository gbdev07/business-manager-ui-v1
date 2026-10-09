export const ACCESS_COOKIE = "koda_access";
export const REFRESH_COOKIE = "koda_refresh";

/** Matches the backend default refresh lifetime (7 days). */
export const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
