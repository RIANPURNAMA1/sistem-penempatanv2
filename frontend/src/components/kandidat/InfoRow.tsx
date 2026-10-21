interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}

export default function InfoRow({ label, value, multiline }: InfoRowProps) {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    (typeof value === "string" && value.trim() === "");

  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground mb-0.5 leading-tight">
        {label}
      </p>
      {isEmpty ? (
        <p className="text-sm text-muted-foreground/60">—</p>
      ) : (
        <p
          className={`text-sm font-semibold text-foreground break-words ${
            multiline
              ? "whitespace-pre-wrap font-medium leading-relaxed"
              : "leading-snug"
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
