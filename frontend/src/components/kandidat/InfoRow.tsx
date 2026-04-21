interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}

export default function InfoRow({ label, value, multiline }: InfoRowProps) {
  if (multiline) {
    return (
      <div className="py-2 border-b border-border/50 last:border-0">
        <span className="text-xs text-muted-foreground block mb-1">{label}</span>
        <span className="text-sm font-medium">
          {value || <span className="text-muted-foreground font-normal">—</span>}
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">
        {value || <span className="text-muted-foreground font-normal">—</span>}
      </span>
    </div>
  );
}
