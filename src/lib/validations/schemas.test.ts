import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { changePasswordSchema, customerSchema, forgotPasswordSchema, loginSchema, passwordSchema, resetPasswordSchema } from "./schemas";

describe("validação dos formulários", () => {
  it("rejeita login sem e-mail válido", () => {
    assert.equal(loginSchema.safeParse({ email: "ana", password: "x" }).success, false);
    assert.equal(loginSchema.safeParse({ email: "ana@koda.com", password: "senha" }).success, true);
  });

  it("exige e-mail válido para recuperar a senha", () => {
    assert.equal(forgotPasswordSchema.safeParse({ email: "ana" }).success, false);
    assert.equal(forgotPasswordSchema.safeParse({ email: "  ana@koda.com  " }).success, true);
  });

  it("exige senha forte e confirmação igual para redefinir a senha", () => {
    assert.equal(resetPasswordSchema.safeParse({ newPassword: "", confirmPassword: "" }).success, false);
    assert.equal(resetPasswordSchema.safeParse({ newPassword: "senhafraca", confirmPassword: "senhafraca" }).success, false);
    assert.equal(resetPasswordSchema.safeParse({ newPassword: "Senha123", confirmPassword: "Senha124" }).success, false);
    assert.equal(resetPasswordSchema.safeParse({ newPassword: "Senha123", confirmPassword: "Senha123" }).success, true);
  });

  it("exige a senha atual, a política e uma confirmação diferente na troca", () => {
    assert.equal(changePasswordSchema.safeParse({ currentPassword: "", newPassword: "", confirmPassword: "" }).success, false);
    assert.equal(changePasswordSchema.safeParse({ currentPassword: "Senha123", newPassword: "fraca", confirmPassword: "fraca" }).success, false);
    assert.equal(changePasswordSchema.safeParse({ currentPassword: "Senha123", newPassword: "Senha1234", confirmPassword: "Senha1235" }).success, false);
    assert.equal(changePasswordSchema.safeParse({ currentPassword: "Senha123", newPassword: "Senha123", confirmPassword: "Senha123" }).success, false);
    assert.equal(changePasswordSchema.safeParse({ currentPassword: "Senha123", newPassword: "NovaSenha123", confirmPassword: "NovaSenha123" }).success, true);
  });

  it("exige senha forte no mesmo critério da API", () => {
    assert.equal(passwordSchema.safeParse("senhafraca").success, false);
    assert.equal(passwordSchema.safeParse("Senha123").success, true);
  });

  it("aceita cliente sem e-mail e rejeita nome curto", () => {
    assert.equal(
      customerSchema.safeParse({ name: "Ana Lima", email: "", phone: "", document: "", birthDate: "", notes: "" }).success,
      true,
    );
    assert.equal(
      customerSchema.safeParse({ name: "A", email: "ruim", phone: "", document: "", birthDate: "", notes: "" }).success,
      false,
    );
  });
});
