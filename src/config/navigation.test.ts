import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { navigation, visibleNavigation } from "./navigation";

describe("navegação modular", () => {
  it("mostra a barbearia apenas para o segmento correspondente", () => {
    const retail = visibleNavigation(navigation, { permissions: ["*"], businessType: "RETAIL" });
    const labels = retail.flatMap((group) => group.items.map((item) => item.label));
    assert.equal(labels.includes("Agendamentos"), false);
    assert.equal(labels.includes("Clientes"), true);

    const barbershop = visibleNavigation(navigation, { permissions: ["*"], businessType: "BARBERSHOP" });
    assert.equal(barbershop.flatMap((group) => group.items.map((item) => item.label)).includes("Agendamentos"), true);
  });

  it("esconde rotas sem a permissão exigida", () => {
    const employee = visibleNavigation(navigation, {
      permissions: ["customers:read", "barbershop.appointments:read"],
      businessType: "BARBERSHOP",
    });
    const labels = employee.flatMap((group) => group.items.map((item) => item.label));
    assert.deepEqual(labels, ["Clientes", "Agendamentos"]);
  });
});
