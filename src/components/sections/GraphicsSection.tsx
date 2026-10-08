import { SectionHeading } from "@/components/showcase/SectionHeading";
import { radii, spacingScale } from "@/lib/brand";

const glyphs = [
  {
    name: "Estrutura",
    description: "Canto e módulo",
    d: ["M3 3h18v6H9v12H3V3z", "M15 15h6v6h-6z"],
  },
  {
    name: "Módulos",
    description: "Camadas do sistema",
    d: ["M3 5h18v3H3z", "M3 11h11v3H3z", "M16 11h5v3h-5z", "M3 17h18v3H3z"],
  },
  {
    name: "Conexão",
    description: "Dois blocos ligados",
    d: ["M3 8h6v8H3z", "M15 8h6v8h-6z", "M9 11.25h6v1.5H9z"],
  },
  {
    name: "Sistema",
    description: "Grade de quatro",
    d: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  },
  {
    name: "Evolução",
    description: "Degraus crescentes",
    d: ["M3 16h4v5H3z", "M10 11h4v10h-4z", "M17 6h4v15h-4z"],
  },
  {
    name: "Integração",
    description: "Encaixe lateral",
    d: ["M3 6h8v12H3z", "M13 6h8v12h-8z", "M10 10.5h4v3h-4z"],
  },
];

const patterns = [
  { src: "/brand/patterns/grid.svg", light: false, name: "Grade" },
  { src: "/brand/patterns/modules.svg", light: false, name: "Módulos" },
  { src: "/brand/patterns/lines.svg", light: false, name: "Linhas" },
  { src: "/brand/patterns/grid-light.svg", light: true, name: "Grade inversa" },
  { src: "/brand/patterns/modules-light.svg", light: true, name: "Módulos inversos" },
  { src: "/brand/patterns/lines-light.svg", light: true, name: "Linhas inversas" },
];

export function GraphicsSection() {
  return (
    <section id="elementos" className="scroll-mt-20 px-6 py-20 md:px-10 lg:scroll-mt-0 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="06 — Elementos"
          title="Geometria com função."
          description="Grade, módulo, linha e canto. Os elementos repetem a construção do símbolo e não decoram a interface por conta própria."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patterns.map((pattern) => (
            <figure key={pattern.name}>
              <div
                className="h-36 border border-border"
                style={{
                  backgroundColor: pattern.light ? "#171917" : "#F4F1E8",
                  backgroundImage: `url(${pattern.src})`,
                  backgroundSize: "72px",
                }}
              />
              <figcaption className="mt-2 text-sm text-muted">{pattern.name}</figcaption>
            </figure>
          ))}
        </div>

        <h3 className="mt-16 text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Ícones</h3>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {glyphs.map((glyph) => (
            <li key={glyph.name} className="flex items-center gap-4 border border-border p-4">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-foreground" aria-hidden="true">
                {glyph.d.map((path) => (
                  <path key={path} d={path} fill="currentColor" />
                ))}
              </svg>
              <div>
                <p className="font-semibold">{glyph.name}</p>
                <p className="text-sm text-muted">{glyph.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Raios</h3>
            <div className="mt-4 flex flex-wrap gap-4">
              {radii.map((radius) => (
                <div key={radius.name}>
                  <div className="h-16 w-16 border border-foreground" style={{ borderRadius: radius.value }} />
                  <p className="mt-2 text-xs text-muted">
                    {radius.name} · {radius.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Espaçamento</h3>
            <div className="mt-4 grid gap-3">
              {spacingScale.map((space) => (
                <div key={space} className="flex items-center gap-4">
                  <span className="w-8 text-xs text-muted">{space}</span>
                  <span className="h-2 bg-green" style={{ width: space }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <figure className="border border-border p-5">
            <div className="h-px bg-border" />
            <figcaption className="mt-4 text-sm">Borda de 1px para campos e divisórias.</figcaption>
          </figure>
          <figure className="border border-border p-5">
            <div className="h-0.5 bg-green" />
            <figcaption className="mt-4 text-sm">Filete verde para marcar uma seção, não para enfeitar.</figcaption>
          </figure>
          <figure className="border border-border bg-surface-raised p-5 shadow-[var(--koda-shadow-sm)]">
            <figcaption className="text-sm">Sombra curta, só quando a borda não separa a superfície.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
