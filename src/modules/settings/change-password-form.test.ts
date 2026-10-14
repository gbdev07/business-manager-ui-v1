import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "node:test";
import { ChangePasswordForm } from "./change-password-form";

describe("formulário de troca de senha", () => {
  it("mostra os campos, os requisitos e o botão de alterar", () => {
    const html = renderToStaticMarkup(createElement(ChangePasswordForm, { onChanged: () => undefined }));
    assert.match(html, /Senha atual/);
    assert.match(html, /Nova senha/);
    assert.match(html, /Confirmar nova senha/);
    assert.match(html, /Alterar senha/);
    assert.match(html, /De 8 a 72 caracteres/);
    assert.match(html, /Uma letra maiúscula/);
    assert.match(html, /Mostrar senha/);
    assert.doesNotMatch(html, /type="password" value="[^"]+"/);
  });
});
