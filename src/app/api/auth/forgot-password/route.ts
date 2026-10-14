import { NextResponse } from "next/server";
import { FORGOT_PASSWORD_SUCCESS, interpretForgotPasswordResponse } from "@/lib/auth/forgot-password";
import { apiUrl } from "@/lib/api/config";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body === "object" && body && "email" in body ? String(body.email ?? "").trim() : "";
  if (!email) {
    return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(apiUrl("auth/forgot-password"), {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
  } catch {
    const result = interpretForgotPasswordResponse(0);
    return NextResponse.json({ message: result.ok ? FORGOT_PASSWORD_SUCCESS : result.message }, { status: 503 });
  }

  const result = interpretForgotPasswordResponse(response.status, response.headers.get("retry-after"));
  if (result.ok) {
    return NextResponse.json({ message: result.message }, { status: 202 });
  }

  const headers = new Headers();
  if (result.retryAfterSeconds !== undefined) headers.set("retry-after", String(result.retryAfterSeconds));
  return NextResponse.json({ message: result.message }, { status: response.status || 500, headers });
}
