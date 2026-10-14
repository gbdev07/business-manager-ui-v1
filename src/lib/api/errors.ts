export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const STATUS_MESSAGE: Record<number, string> = {
  400: "Os dados enviados não foram aceitos.",
  401: "Sua sessão expirou. Entre novamente.",
  403: "Você não tem permissão para esta ação.",
  404: "Não encontramos este registro.",
  409: "A operação conflita com outro registro.",
  422: "Não foi possível concluir a operação.",
  429: "Muitas tentativas. Aguarde e tente novamente.",
  500: "O servidor encontrou um erro. Tente novamente.",
  501: "Esta integração ainda não está disponível.",
  503: "O serviço está indisponível no momento.",
};

export function messageFromPayload(payload: unknown, status: number): { message: string; detail?: string } {
  if (status === 0) {
    return { message: "Não foi possível conectar à API. Verifique se o servidor está no ar." };
  }

  const detail = extractMessage(payload);
  const known = detail ? translateKnown(detail) : undefined;

  return {
    message: known ?? STATUS_MESSAGE[status] ?? "Não foi possível concluir a operação.",
    detail: detail || undefined,
  };
}

export function toUserMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Não foi possível conectar à API. Verifique se o servidor está no ar.";
}

function extractMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const message = (payload as { message?: unknown }).message;
  if (Array.isArray(message)) return message.map(String).join(" ");
  return typeof message === "string" ? message : "";
}

function translateKnown(message: string) {
  if (/current password is incorrect/i.test(message)) {
    return "A senha atual está incorreta.";
  }
  if (/different from the current password/i.test(message)) {
    return "A nova senha precisa ser diferente da atual.";
  }
  if (/must match/i.test(message)) {
    return "As senhas não coincidem.";
  }
  if (/password must contain/i.test(message)) {
    return "A senha precisa ter letra maiúscula, minúscula e um número.";
  }
  if (/time slot|already has an appointment/i.test(message)) {
    return "Este horário já está ocupado para o profissional.";
  }
  if (/not found or inactive/i.test(message)) {
    return "O registro não existe ou está inativo.";
  }
  if (/future appointment as no-show/i.test(message)) {
    return "Não é possível marcar falta em um agendamento futuro.";
  }
  if (/not integrated/i.test(message)) {
    return "Esta integração ainda não está disponível.";
  }
  if (/Cannot renew/i.test(message)) {
    return "Esta assinatura não pode ser renovada no status atual.";
  }
  if (/Cannot cancel/i.test(message)) {
    return "Esta assinatura não pode ser cancelada no status atual.";
  }
  if (/do not have access to this tenant/i.test(message)) {
    return "Você não tem acesso a esta empresa.";
  }
  return undefined;
}
