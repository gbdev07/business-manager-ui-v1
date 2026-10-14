import { NextResponse } from "next/server";
import { interpretResetPasswordResponse } from "@/lib/auth/reset-password";
import { apiUrl } from "@/lib/api/config";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body === "object" && body && "token" in body ? String(body.token ?? "").trim() : "";
  const newPassword = typeof body === "object" && body && "newPassword" in body ? String(body.newPassword ?? "") : "";
  const confirmPassword = typeof body === "object" && body && "confirmPassword" in body ? String(body.confirmPassword ?? "") : "";

  if (!token || token.length > 128) {
    return NextResponse.json(
      { message: "Este link é inválido. Solicite um novo.", kind: "invalid" },
      { status: 400 },
    );
  }
  if (!newPassword || !confirmPassword) {
    return NextResponse.json(
      { message: "Informe e confirme a nova senha.", kind: "policy" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(apiUrl("auth/reset-password"), {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
      cache: "no-store",
    });
  } catch {
    const result = interpretResetPasswordResponse(0, null);
    return NextResponse.json({ message: result.message, kind: "network" }, { status: 503 });
  }

  const payload = await response.json().catch(() => null);
  const result = interpretResetPasswordResponse(response.status, payload, response.headers.get("retry-after"));
  if (result.ok) {
    return NextResponse.json({ message: result.message }, { status: 200 });
  }

  const headers = new Headers();
  if (result.retryAfterSeconds !== undefined) headers.set("retry-after", String(result.retryAfterSeconds));
  return NextResponse.json({ message: result.message, kind: result.kind }, { status: response.status || 500, headers });
}
