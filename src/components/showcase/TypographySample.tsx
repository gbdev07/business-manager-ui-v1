type TypographySampleProps = {
  role: string;
  sample: string;
  meta: string;
  className?: string;
};

export function TypographySample({ role, sample, meta, className }: TypographySampleProps) {
  return (
    <div className="grid gap-3 border-t border-border py-6 md:grid-cols-[220px_1fr] md:items-baseline md:gap-10">
      <div>
        <p className="text-sm font-semibold">{role}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{meta}</p>
      </div>
      <p className={className}>{sample}</p>
    </div>
  );
}
