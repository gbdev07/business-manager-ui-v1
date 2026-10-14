export const RESET_PASSWORD_SUCCESS = "Sua senha foi alterada. Entre novamente com a nova senha.";

const TOKEN_MAX_LENGTH = 128;

export type ResetTokenRead =
  | { token: string }
  | { token: null; reason: "missing" | "invalid" };

export type ResetPasswordFailureKind =
  | "invalid"
  | "expired"
  | "used"
  | "rejected"
  | "policy"
  | "mismatch"
  | "rate"
  | "network"
  | "unexpected";

export type ResetPasswordResult =
  | { ok: true; message: string }
  | { ok: false; kind: ResetPasswordFailureKind; message: string; retryAfterSeconds?: number };

export function readResetToken(search: string): ResetTokenRead {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = params.get("token");
  if (raw === null || raw.trim() === "") return { token: null, reason: "missing" };
  const token = raw.trim();
  if (token.length > TOKEN_MAX_LENGTH) return { token: null, reason: "invalid" };
  return { token };
}

export function pathWithoutResetToken(pathname: string, search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("token");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function interpretResetPasswordResponse(
  status: number,
  payload: unknown,
  retryAfterHeader?: string | null,
): ResetPasswordResult {
  if (status === 200) return { ok: true, message: RESET_PASSWORD_SUCCESS };

  if (status === 429) {
    return {
      ok: false,
      kind: "rate",
      message: "Muitas tentativas. Aguarde e tente novamente.",
      retryAfterSeconds: parseRetryAfter(retryAfterHeader),
    };
  }

  if (status === 0 || status === 503) {
    return { ok: false, kind: "network", message: "Não foi possível conectar à API. Verifique se o servidor está no ar." };
  }

  if (status === 400) {
    const failure = classifyBadRequest(payloadText(payload));
    if (failure) return failure;
  }

  return { ok: false, kind: "unexpected", message: "Não foi possível redefinir a senha. Tente novamente." };
}

function classifyBadRequest(message: string): ResetPasswordResult | null {
  const text = message.toLowerCase();
  if (!text) return null;

  if (/must match/.test(text) || /confirmpassword/.test(text)) {
    return { ok: false, kind: "mismatch", message: "As senhas não coincidem." };
  }

  if (/uppercase|lowercase|longer than or equal to|shorter than or equal to|password must/.test(text)) {
    return {
      ok: false,
      kind: "policy",
      message: "A senha precisa ter de 8 a 72 caracteres, com letra maiúscula, minúscula e um número.",
    };
  }

  const expired = /expired|expir/.test(text);
  const used = /already used|already been used|used token/.test(text);
  const invalid = /invalid/.test(text);
  const resetToken = /reset token/.test(text);

  if (used && !expired && !invalid) {
    return { ok: false, kind: "used", message: "Este link já foi usado. Solicite um novo." };
  }
  if (expired && !invalid && !used) {
    return { ok: false, kind: "expired", message: "Este link expirou. Solicite um novo." };
  }
  if (invalid && !expired && !used) {
    return { ok: false, kind: "invalid", message: "Este link é inválido. Solicite um novo." };
  }
  if (resetToken || expired || invalid || used) {
    return {
      ok: false,
      kind: "rejected",
      message: "Este link é inválido, expirou ou já foi usado. Solicite um novo.",
    };
  }

  return null;
}

function payloadText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const message = (payload as { message?: unknown }).message;
  if (Array.isArray(message)) return message.map(String).join(" ");
  return typeof message === "string" ? message : "";
}

function parseRetryAfter(header: string | null | undefined) {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const timestamp = Date.parse(header);
  if (Number.isNaN(timestamp)) return undefined;
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}
