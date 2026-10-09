import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("aceita caminho interno e recusa redirecionamento externo", () => {
    assert.equal(safeNextPath("/customers"), "/customers");
    assert.equal(safeNextPath("//evil.example"), "/dashboard");
    assert.equal(safeNextPath("/api/backend/customers"), "/dashboard");
    assert.equal(safeNextPath("https://evil.example"), "/dashboard");
  });
});
