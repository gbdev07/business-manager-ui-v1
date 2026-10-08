/* eslint-disable @next/next/no-img-element -- SVGs oficiais da marca, usados sem rasterizar. */

export type LogoVariant =
  | "primary"
  | "horizontal"
  | "compact"
  | "symbol"
  | "symbol-on-dark"
  | "monochrome"
  | "on-light"
  | "on-dark"
  | "favicon"
  | "gestao"
  | "barbearia"
  | "varejo";

export type LogoConcept = "a-wordmark" | "b-estrutura" | "c-modular";

type LogoProps = {
  variant?: LogoVariant;
  concept?: LogoConcept;
  className?: string;
  alt?: string;
};

export function Logo({ variant = "horizontal", concept, className, alt = "KODA" }: LogoProps) {
  const file = variant === "favicon" ? "favicon.svg" : `logo-${variant}.svg`;
  const src = concept ? `/brand/concepts/${concept}/${file}` : `/brand/${file}`;

  return <img src={src} alt={alt} className={className} />;
}
