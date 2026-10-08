import { ComponentShowcase } from "@/components/showcase/ComponentShowcase";
import { SectionHeading } from "@/components/showcase/SectionHeading";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { FormDemo } from "./FormDemo";

const links = [
  { label: "Painel", current: true },
  { label: "Clientes", current: false },
  { label: "Integrações", current: false },
];

export function ComponentsSection() {
  return (
    <section id="componentes" className="scroll-mt-20 px-6 py-20 md:px-10 lg:scroll-mt-0 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="08 — Componentes"
          title="A base dos próximos produtos."
          description="Botões, campos, cartões, tabelas e mensagens já nascem com os tokens da marca. O tema claro e o escuro trocam as cores sem reescrever o componente."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <ComponentShowcase title="Botões" description="Primário para a ação principal. Secundário e fantasma para o resto.">
            <div className="flex flex-wrap gap-3">
              <Button>Criar sistema</Button>
              <Button variant="secondary">Cancelar</Button>
              <Button variant="ghost">Detalhes</Button>
              <Button disabled>Indisponível</Button>
            </div>
          </ComponentShowcase>

          <ComponentShowcase title="Navegação" description="Item atual com aria-current. O foco visível segue o anel verde.">
            <nav aria-label="Exemplo de navegação de produto" className="flex flex-wrap gap-1">
              {links.map((link) => (
                <a
                  key={link.label}
                  href="#componentes"
                  aria-current={link.current ? "page" : undefined}
                  className={
                    link.current
                      ? "rounded-sm bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                      : "rounded-sm px-3 py-2 text-sm hover:bg-surface"
                  }
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </ComponentShowcase>

          <ComponentShowcase title="Campos" description="O exemplo já mostra erro. Preencha o projeto e salve para limpar a mensagem.">
            <FormDemo />
          </ComponentShowcase>

          <ComponentShowcase title="Cartão, selos e indicadores" description="Selos de produto usam a escala semântica, não o verde da marca.">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Integrações ativas</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">12</p>
                </div>
                <Badge tone="green">KODA</Badge>
              </div>
              <div className="mt-4 h-1.5 bg-surface">
                <div className="h-full w-2/3 bg-primary" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>Rascunho</Badge>
                <Badge tone="success">Publicado</Badge>
                <Badge tone="warning">Revisão</Badge>
                <Badge tone="danger">Falha</Badge>
              </div>
            </Card>
          </ComponentShowcase>

          <div className="lg:col-span-2">
            <ComponentShowcase title="Tabela" description="Cabeçalho em rótulo, divisórias finas e status em selo.">
              <DataTable
                caption="Exemplo de tabela de integrações"
                columns={[
                  { key: "name", header: "Integração", render: (row) => row.name },
                  { key: "origin", header: "Origem", render: (row) => row.origin },
                  {
                    key: "state",
                    header: "Estado",
                    render: (row) => <Badge tone={row.tone}>{row.state}</Badge>,
                  },
                ]}
                rows={[
                  { name: "Pedidos", origin: "ERP", state: "Ativa", tone: "success" as const },
                  { name: "Notas", origin: "Fiscal", state: "Fila", tone: "warning" as const },
                  { name: "Estoque", origin: "Loja", state: "Erro", tone: "danger" as const },
                ]}
              />
            </ComponentShowcase>
          </div>

          <ComponentShowcase title="Sucesso" description="Confirmação de uma ação concluída no produto.">
            <Alert tone="success" title="Sistema publicado">
              A primeira versão já está disponível para o cliente revisar.
            </Alert>
          </ComponentShowcase>

          <ComponentShowcase title="Erro" description="O tom de erro não entra na paleta institucional.">
            <Alert tone="danger" title="Não foi possível sincronizar">
              A integração de estoque respondeu com falha. Nada foi alterado.
            </Alert>
          </ComponentShowcase>
        </div>

        <footer className="mt-20 border-t border-border pt-8">
          <p className="text-sm text-muted">
            KODA · Identidade visual. A direção aplicada é Estrutura. Wordmark e Modular permanecem documentados como
            alternativas.
          </p>
        </footer>
      </div>
    </section>
  );
}
