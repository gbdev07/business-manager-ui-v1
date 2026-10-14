export const PASSWORD_CHANGED_NOTICE = "password-changed";
export const PASSWORD_CHANGED_MESSAGE = "Sua senha foi alterada. Entre novamente para continuar.";

export type ChangePasswordField = "currentPassword" | "newPassword" | "confirmPassword";

export type ChangePasswordResult =
  | { ok: true; mustReauthenticate: true; message: string }
  | { ok: false; kind: "current" | "same" | "policy" | "mismatch" | "session" | "unauthenticated" | "network" | "rate" | "unexpected"; message: string; field?: ChangePasswordField };

export function interpretChangePasswordResponse(status: number, payload: unknown): ChangePasswordResult {
  if (status === 200) {
    return { ok: true, mustReauthenticate: true, message: PASSWORD_CHANGED_MESSAGE };
  }

  if (status === 401) {
    const text = payloadText(payload).toLowerCase();
    if (/not found or inactive/.test(text)) {
      return { ok: false, kind: "unauthenticated", message: "Não foi possível confirmar sua conta. Entre novamente." };
    }
    return { ok: false, kind: "session", message: "Sua sessão expirou. Entre novamente." };
  }

  if (status === 0 || status === 503) {
    return { ok: false, kind: "network", message: "Não foi possível conectar à API. Verifique se o servidor está no ar." };
  }

  if (status === 429) {
    return { ok: false, kind: "rate", message: "Muitas tentativas. Aguarde e tente novamente." };
  }

  if (status === 400) {
    const failure = classifyBadRequest(payloadText(payload));
    if (failure) return failure;
    return { ok: false, kind: "unexpected", message: "Os dados enviados não foram aceitos." };
  }

  return { ok: false, kind: "unexpected", message: "Não foi possível alterar a senha. Tente novamente." };
}

export function sessionAfterPasswordChange(result: ChangePasswordResult) {
  if (!result.ok || !result.mustReauthenticate) return { clearSession: false as const };
  return { clearSession: true as const, redirectTo: `/login?notice=${PASSWORD_CHANGED_NOTICE}` };
}

export async function applyChangePasswordResult(
  result: ChangePasswordResult,
  actions: { logout: () => Promise<void>; redirect: (href: string) => void },
) {
  const next = sessionAfterPasswordChange(result);
  if (!next.clearSession) return next;
  try {
    await actions.logout();
  } finally {
    actions.redirect(next.redirectTo);
  }
  return next;
}

export function loginNoticeMessage(search: string) {
  const notice = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("notice");
  return notice === PASSWORD_CHANGED_NOTICE ? PASSWORD_CHANGED_MESSAGE : null;
}

function classifyBadRequest(message: string): ChangePasswordResult | null {
  const text = message.toLowerCase();
  if (!text) return null;
  if (/current password is incorrect/.test(text)) {
    return { ok: false, kind: "current", field: "currentPassword", message: "A senha atual está incorreta." };
  }
  if (/different from the current password/.test(text)) {
    return { ok: false, kind: "same", field: "newPassword", message: "A nova senha precisa ser diferente da atual." };
  }
  if (/must match|confirmpassword/.test(text)) {
    return { ok: false, kind: "mismatch", field: "confirmPassword", message: "As senhas não coincidem." };
  }
  if (/uppercase|lowercase|longer than or equal to|shorter than or equal to|password must/.test(text)) {
    return {
      ok: false,
      kind: "policy",
      field: "newPassword",
      message: "A senha precisa ter de 8 a 72 caracteres, com letra maiúscula, minúscula e um número.",
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
