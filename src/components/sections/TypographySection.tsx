import { SectionHeading } from "@/components/showcase/SectionHeading";
import { TypographySample } from "@/components/showcase/TypographySample";
import { Button } from "@/components/ui/Button";
import { typeScale } from "@/lib/brand";

export function TypographySection() {
  return (
    <section id="tipografia" className="scroll-mt-20 px-6 py-20 md:px-10 lg:scroll-mt-0 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="05 — Tipografia"
          title="Uma família para marca e produto."
          description="Plus Jakarta Sans cobre títulos, texto corrido e interface. É geométrica, contemporânea e cobre bem o português. Não há segunda família."
        />

        <div className="mt-12">
          {typeScale.map((item) => (
            <TypographySample
              key={item.role}
              role={item.role}
              sample={item.sample}
              meta={item.meta}
              className={item.className}
            />
          ))}
          <div className="grid gap-3 border-t border-border py-6 md:grid-cols-[220px_1fr] md:items-center md:gap-10">
            <div>
              <p className="text-sm font-semibold">Botão</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">Medium · 0.875rem · raio 4px</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Falar com a KODA</Button>
              <Button variant="secondary">Ver o método</Button>
            </div>
          </div>
        </div>

        <dl className="mt-10 grid gap-6 border border-border p-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold tracking-[0.16em] text-primary-text uppercase">Pesos</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">400 texto, 500 ênfase, 600 títulos, 700 raro.</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-[0.16em] text-primary-text uppercase">Entrelinha</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">1.02 no display, 1.12 nos títulos, 1.65 no texto.</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-[0.16em] text-primary-text uppercase">Logotipo</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">
              O wordmark é Plus Jakarta Sans SemiBold, convertido em caminhos.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
