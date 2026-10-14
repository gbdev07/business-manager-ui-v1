import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyTenantSwitch,
  canRequestSwitch,
  currentTenantId,
  dropTenantCache,
  membershipRoleLabel,
  pathAfterTenantSwitch,
  sessionFromSwitchPayload,
  tenantMenuMode,
} from "./tenant-context";
import type { AccessibleTenant, AuthUser } from "@/types/contracts";

const home: AccessibleTenant = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Casa",
  slug: "casa",
  status: "ACTIVE",
  businessType: "BARBERSHOP",
  role: "OWNER",
  isCurrent: true,
};

const shop: AccessibleTenant = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Loja",
  slug: "loja",
  status: "ACTIVE",
  businessType: "RETAIL",
  role: "EMPLOYEE",
  isCurrent: false,
};

const retailUser: AuthUser = {
  id: "user-1",
  tenantId: shop.id,
  businessType: "RETAIL",
  name: "Ana",
  email: "ana@koda.com",
  role: "EMPLOYEE",
  permissions: ["dashboard:read", "customers:read"],
};

describe("contexto de empresa", () => {
  it("mostra o tenant ativo e distingue lista vazia, única e múltipla", () => {
    assert.equal(currentTenantId([shop, home], null), home.id);
    assert.equal(tenantMenuMode("loading", []), "loading");
    assert.equal(tenantMenuMode("error", []), "error");
    assert.equal(tenantMenuMode("ready", []), "empty");
    assert.equal(tenantMenuMode("ready", [home]), "single");
    assert.equal(tenantMenuMode("ready", [home, shop]), "multiple");
    assert.equal(membershipRoleLabel("OWNER"), "Proprietário");
    assert.equal(membershipRoleLabel("EMPLOYEE"), "Equipe");
  });

  it("guarda só o usuário público da sessão nova", () => {
    const session = sessionFromSwitchPayload({
      accessToken: "segredo-access",
      refreshToken: "segredo-refresh",
      tokenType: "Bearer",
      expiresIn: 900,
      user: retailUser,
    });
    assert.equal(session?.user.tenantId, shop.id);
    assert.equal(session && "accessToken" in session, false);
    assert.equal(session && "refreshToken" in session, false);
    assert.equal(sessionFromSwitchPayload({ accessToken: "segredo" }), null);
  });

  it("troca a sessão, limpa o cache e mantém a rota quando ela continua válida", async () => {
    const calls: string[] = [];
    const result = await applyTenantSwitch({
      tenantId: shop.id,
      pathname: "/customers/cliente-1",
      switchRequest: async (tenantId) => {
        calls.push(`switch:${tenantId}`);
        return retailUser;
      },
      clearCache: async () => {
        calls.push("clear");
      },
      navigate: (href) => {
        calls.push(`go:${href}`);
      },
      refresh: () => {
        calls.push("refresh");
      },
    });
    assert.deepEqual(calls, [`switch:${shop.id}`, "clear", "refresh"]);
    assert.equal(result.href, "/customers/cliente-1");
    assert.equal(result.user.businessType, "RETAIL");
  });

  it("não altera o contexto quando a troca falha e impede um segundo clique", async () => {
    const calls: string[] = [];
    await assert.rejects(() =>
      applyTenantSwitch({
        tenantId: shop.id,
        pathname: "/dashboard",
        switchRequest: async () => {
          throw new Error("falha");
        },
        clearCache: async () => {
          calls.push("clear");
        },
        navigate: () => {
          calls.push("go");
        },
        refresh: () => {
          calls.push("refresh");
        },
      }),
    );
    assert.deepEqual(calls, []);
    assert.equal(canRequestSwitch("pending", shop.id, home.id), false);
    assert.equal(canRequestSwitch(null, home.id, home.id), false);
    assert.equal(canRequestSwitch(null, shop.id, home.id), true);
  });

  it("sai de um módulo indisponível e cancela respostas antigas antes de limpar o cache", async () => {
    const steps: string[] = [];
    const result = await applyTenantSwitch({
      tenantId: shop.id,
      pathname: "/barbershop/appointments",
      switchRequest: async () => retailUser,
      clearCache: () => dropTenantCache({
        cancelQueries: async () => {
          steps.push("cancel");
        },
        clear: () => {
          steps.push("clear");
        },
      }),
      navigate: (href) => {
        steps.push(`go:${href}`);
      },
      refresh: () => {
        steps.push("refresh");
      },
    });
    assert.deepEqual(steps, ["cancel", "clear", "go:/dashboard", "refresh"]);
    assert.equal(result.href, "/dashboard");
    assert.equal(pathAfterTenantSwitch("/settings/security", { permissions: [], businessType: "RETAIL" }), "/settings/security");
  });
});
