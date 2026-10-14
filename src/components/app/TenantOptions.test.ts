import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "node:test";
import { TenantOptions } from "./TenantOptions";
import type { AccessibleTenant } from "@/types/contracts";

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

const base = {
  open: false,
  pendingId: null,
  error: null,
  menuId: "empresas",
  activeId: home.id,
  onToggle: () => undefined,
  onSelect: () => undefined,
  onRetry: () => undefined,
};

describe("seletor de empresa", () => {
  it("mostra só o nome quando existe uma empresa", () => {
    const html = renderToStaticMarkup(createElement(TenantOptions, { ...base, mode: "single", tenants: [home], currentName: "Casa" }));
    assert.match(html, /Casa/);
    assert.doesNotMatch(html, /aria-haspopup/);
  });

  it("lista as empresas, destaca a ativa e evita troca duplicada", () => {
    const html = renderToStaticMarkup(
      createElement(TenantOptions, {
        ...base,
        mode: "multiple",
        tenants: [home, shop],
        currentName: "Casa",
        open: true,
        pendingId: shop.id,
      }),
    );
    assert.match(html, /Casa/);
    assert.match(html, /Loja/);
    assert.match(html, /Proprietário/);
    assert.match(html, /Trocando…/);
    assert.match(html, /aria-current="true"/);
    assert.match(html, /disabled=""/);
    assert.match(html, /aria-label="Empresas"/);
    assert.match(html, /calc\(100vw-2rem\)/);
  });

  it("mostra carregamento, lista vazia e falha sem trocar a empresa exibida", () => {
    const loading = renderToStaticMarkup(createElement(TenantOptions, { ...base, mode: "loading", tenants: [], currentName: "Casa" }));
    const empty = renderToStaticMarkup(createElement(TenantOptions, { ...base, mode: "empty", tenants: [], currentName: "" }));
    const failed = renderToStaticMarkup(createElement(TenantOptions, { ...base, mode: "error", tenants: [], currentName: "Casa" }));
    assert.match(loading, /Casa/);
    assert.match(empty, /Nenhuma empresa disponível/);
    assert.match(failed, /Casa/);
    assert.match(failed, /Tentar novamente/);
  });
});
