type SectionHeadingProps = {
  index: string;
  title: string;
  description: string;
};

export function SectionHeading({ index, title, description }: SectionHeadingProps) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">{index}</p>
      <h2 className="mt-3 text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{description}</p>
    </header>
  );
}
