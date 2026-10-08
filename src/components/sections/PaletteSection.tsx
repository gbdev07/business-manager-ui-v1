import { ColorSwatch } from "@/components/showcase/ColorSwatch";
import { SectionHeading } from "@/components/showcase/SectionHeading";
import { palette } from "@/lib/brand";

export function PaletteSection() {
  return (
    <section id="paleta" className="scroll-mt-20 px-6 py-20 md:px-10 lg:scroll-mt-0 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="04 — Paleta"
          title="Três cores, com função."
          description="Grafite sustenta, off-white respira, verde marca o ponto de ação. A proporção 60/30/10 é um ponto de partida, não uma grade rígida. Clique em uma amostra para copiar o hexadecimal."
        />

        <div className="mt-10 flex h-14 overflow-hidden rounded-sm border border-border" aria-hidden="true">
          <div className="w-[60%] bg-graphite" />
          <div className="w-[30%] bg-ivory" />
          <div className="w-[10%] bg-green" />
        </div>
        <p className="mt-3 text-sm text-muted">60% grafite · 30% off-white · 10% verde natural</p>

        <h3 className="mt-14 text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Paleta principal</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {palette.primary.map((swatch) => (
            <ColorSwatch key={swatch.hex} {...swatch} />
          ))}
        </div>

        <h3 className="mt-14 text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Escala auxiliar</h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Derivada da paleta principal. Serve a interface e não compete com as três cores oficiais.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {palette.auxiliary.map((swatch) => (
            <ColorSwatch key={swatch.hex} {...swatch} />
          ))}
        </div>

        <h3 className="mt-14 text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">
          Uso exclusivo em produto
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Sucesso, alerta e erro existem só em sistemas. Não entram em papelaria, site institucional ou no logotipo.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {palette.semantic.map((swatch) => (
            <ColorSwatch key={swatch.hex} {...swatch} />
          ))}
        </div>
      </div>
    </section>
  );
}
