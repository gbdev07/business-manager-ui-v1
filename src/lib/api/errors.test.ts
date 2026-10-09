import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError, messageFromPayload, toUserMessage } from "./errors";

describe("erros da API", () => {
  it("traduz conflito de horário e senha", () => {
    assert.equal(
      messageFromPayload({ message: "The barber already has an appointment in this time slot" }, 409).message,
      "Este horário já está ocupado para o profissional.",
    );
    assert.equal(
      messageFromPayload({ message: ["password must contain uppercase, lowercase and a number"] }, 400).message,
      "A senha precisa ter letra maiúscula, minúscula e um número.",
    );
  });

  it("não transforma falha de rede em sucesso", () => {
    assert.match(messageFromPayload(null, 0).message, /conectar/);
    assert.match(toUserMessage(new ApiError(403, "Você não tem permissão para esta ação.")), /permissão/);
    assert.match(toUserMessage(new TypeError("failed")), /conectar/);
  });
});
