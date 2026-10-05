export function CardText({
  label,
  title,
  children,
  className = '',
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="label">{label}</p>
      <h3 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-tight sm:text-[32px]">{title}</h3>
      <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-ink/65">{children}</p>
    </div>
  );
}
