import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RESET_PASSWORD_SUCCESS,
  interpretResetPasswordResponse,
  pathWithoutResetToken,
  readResetToken,
} from "./reset-password";

describe("redefinição de senha", () => {
  it("lê o token da query e descarta token ausente ou longo demais", () => {
    assert.deepEqual(readResetToken("?token=abc123"), { token: "abc123" });
    assert.deepEqual(readResetToken(""), { token: null, reason: "missing" });
    assert.deepEqual(readResetToken("?token="), { token: null, reason: "missing" });
    assert.deepEqual(readResetToken(`?token=${"a".repeat(129)}`), { token: null, reason: "invalid" });
  });

  it("remove o token da URL e preserva os demais parâmetros", () => {
    assert.equal(pathWithoutResetToken("/reset-password", "?token=segredo&origem=email"), "/reset-password?origem=email");
    assert.equal(pathWithoutResetToken("/reset-password", "?token=segredo"), "/reset-password");
  });

  it("só confirma sucesso depois de uma resposta 200 e com a mensagem fixa", () => {
    const result = interpretResetPasswordResponse(200, { message: "stack trace token=segredo" });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.message, RESET_PASSWORD_SUCCESS);
  });

  it("agrupa o token inválido, expirado ou usado quando a API usa a mesma mensagem", () => {
    const result = interpretResetPasswordResponse(400, { message: "Invalid or expired password reset token" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.kind, "rejected");
      assert.match(result.message, /inválido, expirou ou já foi usado/);
      assert.doesNotMatch(result.message, /Invalid or expired/);
    }
  });

  it("distingue token expirado, já usado e inválido quando a mensagem é específica", () => {
    assert.equal(interpretResetPasswordResponse(400, { message: "token expired" }).ok, false);
    const expired = interpretResetPasswordResponse(400, { message: "token expired" });
    const used = interpretResetPasswordResponse(400, { message: "token already used" });
    const invalid = interpretResetPasswordResponse(400, { message: "invalid token" });
    if (!expired.ok) assert.equal(expired.kind, "expired");
    if (!used.ok) assert.equal(used.kind, "used");
    if (!invalid.ok) assert.equal(invalid.kind, "invalid");
  });

  it("traduz senha fora da política e confirmação diferente sem repetir o texto da API", () => {
    const policy = interpretResetPasswordResponse(400, {
      message: ["newPassword must contain uppercase, lowercase and a number"],
    });
    const mismatch = interpretResetPasswordResponse(400, { message: "confirmPassword must match newPassword" });
    if (!policy.ok) {
      assert.equal(policy.kind, "policy");
      assert.match(policy.message, /8 a 72/);
    }
    if (!mismatch.ok) assert.equal(mismatch.kind, "mismatch");
  });

  it("trata falha de conexão, limite de tentativas e erro inesperado sem vazar o token", () => {
    const network = interpretResetPasswordResponse(0, null);
    const limited = interpretResetPasswordResponse(429, { message: "Rate limit exceeded" }, "15");
    const unexpected = interpretResetPasswordResponse(500, { message: "Error at token=segredo" });
    if (!network.ok) assert.equal(network.kind, "network");
    if (!limited.ok) {
      assert.equal(limited.kind, "rate");
      assert.equal(limited.retryAfterSeconds, 15);
    }
    if (!unexpected.ok) {
      assert.equal(unexpected.kind, "unexpected");
      assert.doesNotMatch(unexpected.message, /segredo/);
    }
  });
});
