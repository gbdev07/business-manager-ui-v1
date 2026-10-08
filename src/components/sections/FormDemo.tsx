"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

export function FormDemo() {
  const [nameError, setNameError] = useState("Informe o nome do projeto.");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("project") ?? "").trim();
    setNameError(name ? "" : "Informe o nome do projeto.");
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-4" noValidate>
      <TextField id="project-name" name="project" label="Projeto" hint="Como o cliente chama a iniciativa." error={nameError || undefined} />
      <TextField id="project-mail" name="mail" label="E-mail" type="email" placeholder="contato@koda.example" />
      <div className="flex flex-wrap gap-3">
        <Button type="submit">Salvar</Button>
        <Button variant="secondary" type="reset" onClick={() => setNameError("Informe o nome do projeto.")}>
          Limpar
        </Button>
      </div>
    </form>
  );
}
