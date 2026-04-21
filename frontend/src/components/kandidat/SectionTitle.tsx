interface SectionTitleProps {
  icon: React.ElementType;
  title: string;
}

export default function SectionTitle({ icon: Icon, title }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2 font-semibold text-base mb-4 pb-2 border-b border-border">
      <Icon size={16} className="text-muted-foreground" />
      {title}
    </div>
  );
}
