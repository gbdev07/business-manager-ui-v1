import type { ReactNode } from "react";
import { Logo, type LogoConcept, type LogoVariant } from "@/components/brand/Logo";
import { SectionHeading } from "@/components/showcase/SectionHeading";
import { logoVariants } from "@/lib/brand";
import { cx } from "@/lib/cx";

function Frame({
  label,
  note,
  tone = "light",
  children,
}: {
  label: string;
  note?: string;
  tone?: "light" | "dark";
  children: ReactNode;
}) {
  return (
    <figure>
      <div
        className={cx(
          "flex min-h-40 items-center justify-center overflow-hidden border border-border p-6",
          tone === "dark" ? "bg-graphite" : "bg-ivory",
        )}
      >
        {children}
      </div>
      <figcaption className="mt-2">
        <p className="text-sm font-medium">{label}</p>
        {note ? <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p> : null}
      </figcaption>
    </figure>
  );
}

function DirectionBoard({
  concept,
  symbolClassName,
}: {
  concept: LogoConcept;
  symbolClassName: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {logoVariants.map((item) => {
        const dark = item.file === "on-dark";
        const variant: LogoVariant = item.file === "symbol" ? "symbol" : item.file;
        return (
          <Frame key={item.file} label={item.label} note={item.note} tone={dark ? "dark" : "light"}>
            <Logo
              concept={concept}
              variant={dark && item.file === "on-dark" ? "on-dark" : variant}
              alt=""
              className={item.file === "symbol" || item.file === "primary" ? symbolClassName : "h-12 w-auto max-w-full"}
            />
          </Frame>
        );
      })}
      <Frame label="Símbolo em fundo escuro" note="A estrutura troca para off-white. O módulo permanece verde." tone="dark">
        <Logo concept={concept} variant="symbol-on-dark" alt="" className="h-16 w-16" />
      </Frame>
      <Frame label="Favicon" note="Placa grafite de 32px, para aba e atalho.">
        <Logo concept={concept} variant="favicon" alt="" className="h-12 w-12" />
      </Frame>
    </div>
  );
}

export function LogosSection() {
  return (
    <section id="logotipos" className="scroll-mt-20 px-6 py-20 md:px-10 lg:scroll-mt-0 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="03 — Logotipos"
          title="Três direções, uma recomendação."
          description="As propostas permanecem separadas. A apresentação aplica a direção Estrutura. As outras duas continuam no projeto para comparação."
        />

        <article className="mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Direção A</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Wordmark</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                O nome sozinho, em Plus Jakarta Sans. A versão de destaque usa peso médio e espaçamento aberto. A
                horizontal e a compacta usam semibold, para cabeçalhos. O monograma K cobre favicon e avatares. Funciona
                muito bem em documentos e perde presença quando o nome não pode aparecer.
              </p>
            </div>
            <DirectionBoard concept="a-wordmark" symbolClassName="h-16 w-auto max-w-full" />
          </div>
        </article>

        <article className="mt-20 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-green uppercase">Direção B · recomendada</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Estrutura</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                Um canto em L e um módulo no quadrante aberto, sobre uma grade de três por três. O L é o que já foi
                construído. O módulo verde é a próxima peça. O desenho permanece legível em uma cor, em fundo claro,
                em fundo escuro e em 16 pixels. É a marca aplicada nesta apresentação.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Área de proteção: a altura do módulo em volta do conjunto. Tamanho mínimo: símbolo com 16px e versão
                horizontal com 20px de altura.
              </p>
            </div>
            <DirectionBoard concept="b-estrutura" symbolClassName="h-28 w-auto max-w-full" />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="border border-border p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary-text uppercase">Área de proteção</p>
              <div className="mt-4 border border-dashed border-[#5C5952] p-6">
                <Logo variant="horizontal" alt="Logotipo horizontal com área de proteção" className="h-14 w-auto" />
              </div>
            </div>
            <div className="border border-border p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary-text uppercase">Tamanho mínimo</p>
              <div className="mt-6 flex items-end gap-6">
                <Logo variant="symbol" alt="" className="h-4 w-4" />
                <Logo variant="horizontal" alt="Logotipo horizontal no tamanho mínimo" className="h-5 w-auto" />
              </div>
              <p className="mt-4 text-xs text-muted">16px no símbolo · 20px na versão horizontal</p>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold">Família de produtos com o símbolo Estrutura</h4>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              O símbolo não muda. O descritor entra na segunda linha. Gestão, Barbearia e Varejo são exemplos de
              aplicação, não marcas independentes.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(
                [
                  ["gestao", "KODA Gestão"],
                  ["barbearia", "KODA Barbearia"],
                  ["varejo", "KODA Varejo"],
                ] as const
              ).map(([variant, label]) => (
                <Frame key={variant} label={label}>
                  <Logo variant={variant} alt={label} className="h-16 w-auto max-w-full" />
                </Frame>
              ))}
            </div>
          </div>
        </article>

        <article className="mt-20 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Direção C</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Modular</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                Três barras e um módulo que completa a do meio. A leitura é de camadas de um sistema. O mesmo símbolo
                acompanha qualquer produto; só o descritor muda. A direção é coerente, mas as barras se aproximam de
                um menu ou de uma lista. Por isso fica como alternativa, não como marca principal.
              </p>
            </div>
            <div>
              <DirectionBoard concept="c-modular" symbolClassName="h-24 w-auto max-w-full" />
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["gestao", "KODA Gestão"],
                    ["barbearia", "KODA Barbearia"],
                    ["varejo", "KODA Varejo"],
                  ] as const
                ).map(([variant, label]) => (
                  <Frame key={variant} label={label}>
                    <Logo concept="c-modular" variant={variant} alt={label} className="h-14 w-auto max-w-full" />
                  </Frame>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="mt-20">
          <h3 className="text-xl font-semibold tracking-tight">Não aplicar</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Frame label="Esticar">
              <span className="inline-flex" style={{ transform: "scaleX(1.65)" }}>
                <Logo variant="horizontal" alt="" className="h-10 w-auto" />
              </span>
            </Frame>
            <Frame label="Sombra pesada">
              <Logo
                variant="horizontal"
                alt=""
                className="h-10 w-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.55)]"
              />
            </Frame>
            <Frame label="Girar">
              <Logo variant="symbol" alt="" className="h-14 w-14 rotate-12" />
            </Frame>
            <Frame label="Baixo contraste" tone="dark">
              <Logo variant="symbol" alt="" className="h-14 w-14 opacity-25" />
            </Frame>
          </div>
        </div>
      </div>
    </section>
  );
}
