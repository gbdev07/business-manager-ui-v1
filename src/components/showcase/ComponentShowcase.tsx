import type { ReactNode } from "react";

type ComponentShowcaseProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ComponentShowcase({ title, description, children }: ComponentShowcaseProps) {
  return (
    <section className="rounded-sm border border-border bg-surface-raised p-5 md:p-6">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
