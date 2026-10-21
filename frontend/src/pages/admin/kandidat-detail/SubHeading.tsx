export default function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
      <span className="w-1 h-3 rounded-full bg-primary/40 shrink-0" />
      {children}
    </p>
  );
}
