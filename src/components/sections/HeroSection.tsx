import { Logo } from "@/components/brand/Logo";
import { palette, tagline } from "@/lib/brand";

export function HeroSection() {
  return (
    <section id="hero" className="bg-graphite text-ivory">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:px-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-end lg:px-16 lg:py-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-green uppercase">Identidade visual</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,6vw,5.15rem)] font-medium leading-[1.02] tracking-[-0.035em] text-balance">
            {tagline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/80">
            A KODA transforma problemas operacionais e ideias de negócio em sistemas digitais claros, confiáveis e
            prontos para crescer.
          </p>
          <ul className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {palette.primary.map((color) => (
              <li key={color.hex} className="border border-white/15">
                <div className="h-12 border-b border-white/15" style={{ backgroundColor: color.hex }} />
                <div className="px-2.5 py-2.5">
                  <p className="text-xs leading-tight">{color.name}</p>
                  <p className="mt-1 text-[11px] tracking-wide text-ivory/60">{color.hex}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-ivory px-8 py-10 text-graphite sm:px-10">
          <Logo variant="primary" alt="Logotipo principal da KODA" className="mx-auto h-auto w-full max-w-64" />
          <div className="mt-8 h-1.5 bg-green" />
          <p className="mt-4 text-xs tracking-[0.16em] text-[#5C5952] uppercase">Estrutura e módulo</p>
        </div>
      </div>
    </section>
  );
}
