import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { tagline } from "@/lib/brand";

const orders = [
  { client: "Oficina Norte", status: "Em dia", tone: "success" as const, value: "R$ 4.280", when: "Hoje" },
  { client: "Padaria Central", status: "Atenção", tone: "warning" as const, value: "R$ 960", when: "Ontem" },
  { client: "Ateliê Sete", status: "Atraso", tone: "danger" as const, value: "R$ 1.540", when: "2 dias" },
  { client: "Mercado da Praça", status: "Em dia", tone: "success" as const, value: "R$ 2.110", when: "Hoje" },
];

export function BusinessCardMock() {
  return (
    <div className="grid gap-3 bg-surface p-4 sm:grid-cols-2">
      <div className="flex aspect-[1.75/1] flex-col justify-between bg-graphite p-5 text-ivory">
        <Logo variant="on-dark" alt="" className="h-7 w-auto" />
        <p className="text-[11px] tracking-[0.16em] text-ivory/70 uppercase">Tecnologia</p>
      </div>
      <div className="flex aspect-[1.75/1] flex-col justify-between bg-ivory p-5 text-graphite">
        <Logo variant="symbol" alt="" className="h-8 w-8" />
        <div>
          <p className="text-sm font-semibold">Novos projetos</p>
          <p className="mt-1 text-xs text-[#5C5952]">contato@koda.example</p>
        </div>
      </div>
    </div>
  );
}

export function LetterheadMock() {
  return (
    <div className="bg-ivory px-6 py-7 text-graphite sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <Logo variant="horizontal" alt="" className="h-7 w-auto" />
        <p className="text-right text-[11px] leading-relaxed text-[#5C5952]">
          contato@koda.example
          <br />
          koda.example
        </p>
      </div>
      <div className="mt-4 h-px bg-green" />
      <p className="mt-8 text-xs tracking-[0.14em] text-[#5C5952] uppercase">Proposta</p>
      <h3 className="mt-2 max-w-sm text-xl font-semibold tracking-tight">Modernização do sistema de pedidos</h3>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[#5C5952]">
        Escopo, integrações e a primeira entrega organizados em uma página. Os dados de contato neste mock são
        ilustrativos.
      </p>
      <div className="mt-10 flex items-end justify-between border-t border-[#D2CDBF] pt-3 text-[11px] text-[#5C5952]">
        <span>KODA</span>
        <span>01</span>
      </div>
    </div>
  );
}

export function EmailSignatureMock() {
  return (
    <div className="bg-ivory p-6 text-graphite">
      <div className="border-t-2 border-green pt-4">
        <Logo variant="horizontal" alt="" className="h-7 w-auto" />
        <p className="mt-3 text-sm font-semibold">KODA</p>
        <p className="mt-1 max-w-xs text-sm text-[#5C5952]">{tagline}</p>
        <p className="mt-3 text-sm">contato@koda.example</p>
      </div>
    </div>
  );
}

export function SocialProfileMock() {
  return (
    <div className="bg-ivory text-graphite">
      <div
        className="flex h-28 items-end bg-graphite px-5 pb-4"
        style={{ backgroundImage: "url(/brand/patterns/modules-light.svg)", backgroundSize: "64px" }}
      >
        <Logo variant="on-dark" alt="" className="h-7 w-auto" />
      </div>
      <div className="px-5 pb-5">
        <div className="-mt-6 flex h-14 w-14 items-center justify-center border border-[#D2CDBF] bg-ivory">
          <Logo variant="symbol" alt="" className="h-8 w-8" />
        </div>
        <h3 className="mt-3 text-lg font-semibold">KODA</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#5C5952]">
          Sistemas, plataformas SaaS e integrações para quem precisa modernizar a operação.
        </p>
      </div>
    </div>
  );
}

export function PitchSlideMock() {
  return (
    <div className="flex aspect-video flex-col justify-between bg-graphite p-6 text-ivory sm:p-8">
      <p className="text-xs tracking-[0.16em] text-green uppercase">Apresentação</p>
      <h3 className="max-w-md text-2xl font-medium leading-tight tracking-[-0.03em] sm:text-3xl">
        Da operação ao sistema, sem recomeçar a marca a cada produto.
      </h3>
      <div className="flex items-end justify-between">
        <Logo variant="on-dark" alt="" className="h-6 w-auto" />
        <span className="text-xs text-ivory/60">01</span>
      </div>
    </div>
  );
}

export function SiteHeaderMock() {
  const links = ["Trabalho", "Método", "Empresa"];
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-ivory px-4 py-3 text-graphite sm:px-6">
      <Logo variant="horizontal" alt="" className="h-7 w-auto" />
      <nav aria-label="Exemplo de cabeçalho institucional" className="flex flex-wrap items-center gap-1">
        {links.map((link) => (
          <a key={link} href="#aplicacoes" className="rounded-sm px-3 py-2 text-sm hover:bg-[#E9E6DC]">
            {link}
          </a>
        ))}
        <a href="#aplicacoes" className={buttonClass("primary", "sm")}>
          Conversar
        </a>
      </nav>
    </div>
  );
}

export function DashboardMock() {
  return (
    <div className="grid min-h-[420px] bg-ivory text-graphite md:grid-cols-[68px_minmax(0,1fr)]">
      <aside className="hidden flex-col items-center gap-4 bg-graphite py-4 md:flex" aria-hidden="true">
        <Logo variant="favicon" alt="" className="h-8 w-8" />
        <span className="h-px w-5 bg-ivory/50" />
        <span className="h-2 w-5 bg-green" />
        <span className="h-px w-5 bg-ivory/35" />
        <span className="h-px w-5 bg-ivory/35" />
      </aside>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.14em] text-[#5C5952] uppercase">Produto</p>
            <h3 className="text-lg font-semibold">KODA Gestão</h3>
          </div>
          <Button size="sm">Novo registro</Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Em dia", "18"],
            ["Atenção", "4"],
            ["Atraso", "2"],
          ].map(([label, value]) => (
            <Card key={label}>
              <p className="text-xs text-[#5C5952]">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            </Card>
          ))}
        </div>
        <div className="mt-4 border border-[#D2CDBF] bg-white">
          <DataTable
            caption="Registros de exemplo do KODA Gestão"
            columns={[
              { key: "client", header: "Cliente", render: (row) => row.client },
              {
                key: "status",
                header: "Status",
                render: (row) => <Badge tone={row.tone}>{row.status}</Badge>,
              },
              { key: "value", header: "Valor", render: (row) => row.value },
              { key: "when", header: "Atualização", render: (row) => row.when },
            ]}
            rows={orders}
          />
        </div>
      </div>
    </div>
  );
}
