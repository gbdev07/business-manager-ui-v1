import { SectionHeading } from "@/components/showcase/SectionHeading";
import { personality, values } from "@/lib/brand";

export function ConceptSection() {
  return (
    <section id="conceito" className="scroll-mt-20 px-6 py-20 md:px-10 lg:scroll-mt-0 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="02 — Conceito"
          title="Uma estrutura e a próxima peça."
          description="A identidade parte da forma como a KODA trabalha: entender o que já existe, organizar a estrutura e encaixar o módulo que falta. Tecnologia aparece como construção, não como espetáculo."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
          <div className="max-w-xl space-y-5 text-base leading-relaxed md:text-lg">
            <p>
              O símbolo é um canto construído e um bloco separado. O canto é o que já está de pé: arquitetura,
              operação, sistema. O bloco é a próxima entrega. Juntos, descrevem evolução sem recorrer a circuitos,
              foguetes ou gradientes.
            </p>
            <p>
              A personalidade fica no equilíbrio. Moderna, mas não futurista. Técnica, mas legível para quem conduz o
              negócio. Próxima do cliente sem parecer uma agência. Sólida o bastante para um contrato, simples o
              bastante para um favicon.
            </p>
            <blockquote className="border-l-2 border-green pl-5 text-xl leading-snug font-medium tracking-[-0.02em]">
              O símbolo não ilustra tecnologia. Ele mostra uma estrutura e a próxima peça.
            </blockquote>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">Personalidade</h3>
            <ul className="mt-4 divide-y divide-border">
              {personality.map((item) => (
                <li key={item.name} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-sm leading-relaxed text-muted">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <article key={value.name} className="bg-background p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary-text">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{value.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
