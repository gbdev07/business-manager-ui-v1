import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("aceita o coringa global", () => {
    assert.equal(hasPermission(["*"], "customers:manage"), true);
  });

  it("aceita correspondência exata e coringa do recurso", () => {
    assert.equal(hasPermission(["customers:read"], "customers:read"), true);
    assert.equal(hasPermission(["customers:*"], "customers:manage"), true);
  });

  it("nega permissão ausente e trata requisito vazio como liberado", () => {
    assert.equal(hasPermission(["customers:read"], "users:manage"), false);
    assert.equal(hasPermission([], undefined), true);
  });
});
