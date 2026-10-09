import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api/config";
import { clearAuth } from "@/lib/api/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

export async function POST() {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (access && refreshToken) {
    try {
      await fetch(apiUrl("auth/logout"), {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      // The local session is cleared even when the API is unreachable.
    }
  }

  await clearAuth();
  return NextResponse.json({ ok: true });
}
