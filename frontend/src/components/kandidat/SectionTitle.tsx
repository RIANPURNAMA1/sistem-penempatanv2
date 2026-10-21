interface SectionTitleProps {
  icon: React.ElementType;
  title: string;
  description?: string;
}

export default function SectionTitle({
  icon: Icon,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/70">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-bold leading-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
