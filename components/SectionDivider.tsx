export default function SectionDivider({ variant = "ornament" }: { variant?: "ornament" | "line" }) {
  if (variant === "line")
    return <div className="mx-auto max-w-5xl px-6"><div className="h-px bg-border" /></div>;

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-6 py-2">
      <div className="h-px flex-1 origin-right bg-gradient-to-l from-primary/30 to-transparent" />
      <div className="flex items-center gap-3">
        <span className="h-1 w-1 rounded-full bg-primary/40" />
        <span className="h-1.5 w-1.5 rotate-45 bg-primary/70" />
        <span className="h-1 w-1 rounded-full bg-primary/40" />
      </div>
      <div className="h-px flex-1 origin-left bg-gradient-to-r from-primary/30 to-transparent" />
    </div>
  );
}
