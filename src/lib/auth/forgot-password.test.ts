import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FORGOT_PASSWORD_SUCCESS, interpretForgotPasswordResponse } from "./forgot-password";

describe("recuperação de senha", () => {
  it("responde com a mensagem genérica mesmo quando a API aceita o pedido", () => {
    const result = interpretForgotPasswordResponse(202);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.message, FORGOT_PASSWORD_SUCCESS);
  });

  it("não trata limitação de tentativas como sucesso", () => {
    const result = interpretForgotPasswordResponse(429, "30");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /Muitas tentativas/);
      assert.equal(result.retryAfterSeconds, 30);
    }
  });

  it("traduz falha de rede e e-mail inválido sem expor a resposta interna", () => {
    assert.match(interpretForgotPasswordResponse(0).ok ? "" : interpretForgotPasswordResponse(0).message, /conectar/);
    const invalid = interpretForgotPasswordResponse(400);
    assert.equal(invalid.ok, false);
    if (!invalid.ok) assert.equal(invalid.message, "Informe um e-mail válido.");
    const unexpected = interpretForgotPasswordResponse(500);
    assert.equal(unexpected.ok, false);
    if (!unexpected.ok) assert.match(unexpected.message, /Não foi possível enviar/);
  });
});
