import type { ReactNode } from "react";

type BrandApplicationProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function BrandApplication({ title, description, children }: BrandApplicationProps) {
  return (
    <figure className="flex h-full flex-col">
      <div className="koda-light overflow-hidden rounded-sm border border-border bg-ivory">{children}</div>
      <figcaption className="mt-4">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      </figcaption>
    </figure>
  );
}
