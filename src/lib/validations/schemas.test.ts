import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { customerSchema, loginSchema, passwordSchema } from "./schemas";

describe("validação dos formulários", () => {
  it("rejeita login sem e-mail válido", () => {
    assert.equal(loginSchema.safeParse({ email: "ana", password: "x" }).success, false);
    assert.equal(loginSchema.safeParse({ email: "ana@koda.com", password: "senha" }).success, true);
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
