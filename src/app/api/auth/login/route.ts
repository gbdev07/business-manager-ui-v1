import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api/config";
import { messageFromPayload } from "@/lib/api/errors";
import { persistAuth } from "@/lib/api/server";
import type { AuthResponse } from "@/types/contracts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  let response: Response;
  try {
    response = await fetch(apiUrl("auth/login"), {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: messageFromPayload(null, 0).message }, { status: 503 });
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = messageFromPayload(payload, response.status);
    return NextResponse.json({ message: response.status === 401 ? "E-mail ou senha incorretos." : parsed.message }, { status: response.status });
  }

  await persistAuth(payload as AuthResponse);
  return NextResponse.json({ user: (payload as AuthResponse).user });
}
