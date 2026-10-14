export const FORGOT_PASSWORD_SUCCESS =
  "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.";

export type ForgotPasswordResult =
  | { ok: true; message: string }
  | { ok: false; message: string; retryAfterSeconds?: number };

export function interpretForgotPasswordResponse(status: number, retryAfterHeader?: string | null): ForgotPasswordResult {
  if (status === 200 || status === 202) {
    return { ok: true, message: FORGOT_PASSWORD_SUCCESS };
  }

  if (status === 429) {
    return {
      ok: false,
      message: "Muitas tentativas. Aguarde e tente novamente.",
      retryAfterSeconds: parseRetryAfter(retryAfterHeader),
    };
  }

  if (status === 0 || status === 503) {
    return { ok: false, message: "Não foi possível conectar à API. Verifique se o servidor está no ar." };
  }

  if (status === 400) {
    return { ok: false, message: "Informe um e-mail válido." };
  }

  return { ok: false, message: "Não foi possível enviar as instruções. Tente novamente." };
}

function parseRetryAfter(header: string | null | undefined) {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const timestamp = Date.parse(header);
  if (Number.isNaN(timestamp)) return undefined;
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}
