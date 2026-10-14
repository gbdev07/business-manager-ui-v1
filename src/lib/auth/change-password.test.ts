import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PASSWORD_CHANGED_MESSAGE,
  applyChangePasswordResult,
  interpretChangePasswordResponse,
  loginNoticeMessage,
  sessionAfterPasswordChange,
} from "./change-password";

describe("troca de senha autenticada", () => {
  it("só confirma a troca depois do sucesso e exige novo login, sem usar tokens da resposta", () => {
    const result = interpretChangePasswordResponse(200, {
      message: "Senha alterada com sucesso. Faça login novamente.",
      accessToken: "nao-usar",
      refreshToken: "nao-usar",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.mustReauthenticate, true);
      assert.equal(result.message, PASSWORD_CHANGED_MESSAGE);
      assert.equal("accessToken" in result, false);
    }
    assert.deepEqual(sessionAfterPasswordChange(result), {
      clearSession: true,
      redirectTo: "/login?notice=password-changed",
    });
  });

  it("não encerra a sessão quando a senha atual está incorreta", () => {
    const result = interpretChangePasswordResponse(400, { message: "Current password is incorrect" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.kind, "current");
      assert.equal(result.field, "currentPassword");
      assert.equal(result.message, "A senha atual está incorreta.");
    }
    assert.deepEqual(sessionAfterPasswordChange(result), { clearSession: false });
  });

  it("traduz senha inválida, repetida ou diferente da confirmação sem repetir o texto da API", () => {
    const policy = interpretChangePasswordResponse(400, { message: ["newPassword must contain uppercase, lowercase and a number"] });
    const same = interpretChangePasswordResponse(400, { message: "New password must be different from the current password" });
    const mismatch = interpretChangePasswordResponse(400, { message: "confirmPassword must match newPassword" });
    if (!policy.ok) assert.equal(policy.kind, "policy");
    if (!same.ok) assert.equal(same.field, "newPassword");
    if (!mismatch.ok) assert.equal(mismatch.field, "confirmPassword");
  });

  it("separa sessão expirada, conta não autenticada, rede e erro inesperado", () => {
    const expired = interpretChangePasswordResponse(401, { message: "Unauthorized" });
    const inactive = interpretChangePasswordResponse(401, { message: "User not found or inactive" });
    const network = interpretChangePasswordResponse(0, null);
    const unexpected = interpretChangePasswordResponse(500, { message: "Error at stack token=segredo" });
    if (!expired.ok) assert.equal(expired.kind, "session");
    if (!inactive.ok) assert.equal(inactive.kind, "unauthenticated");
    if (!network.ok) assert.equal(network.kind, "network");
    if (!unexpected.ok) {
      assert.equal(unexpected.kind, "unexpected");
      assert.doesNotMatch(unexpected.message, /segredo/);
    }
    assert.equal(sessionAfterPasswordChange(expired).clearSession, false);
  });

  it("encerra a sessão oficial só depois do sucesso e avisa na tela de login", async () => {
    const ignored: string[] = [];
    const failure = interpretChangePasswordResponse(400, { message: "Current password is incorrect" });
    await applyChangePasswordResult(failure, {
      logout: async () => {
        ignored.push("logout");
      },
      redirect: (href) => {
        ignored.push(href);
      },
    });
    assert.deepEqual(ignored, []);

    const calls: string[] = [];
    const success = interpretChangePasswordResponse(200, { message: "ok" });
    await applyChangePasswordResult(success, {
      logout: async () => {
        calls.push("logout");
      },
      redirect: (href) => {
        calls.push(href);
      },
    });
    assert.deepEqual(calls, ["logout", "/login?notice=password-changed"]);
    assert.equal(loginNoticeMessage("?notice=password-changed"), PASSWORD_CHANGED_MESSAGE);
    assert.equal(loginNoticeMessage("?notice=outro"), null);
  });
});
