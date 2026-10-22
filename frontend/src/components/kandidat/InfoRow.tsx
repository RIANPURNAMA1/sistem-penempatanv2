interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
  /** Tampilkan contoh (contoh bahasa Jepang) bila nilai kosong. */
  hint?: string;
}

export default function InfoRow({ label, value, multiline, hint }: InfoRowProps) {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    (typeof value === "string" && value.trim() === "");

  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-muted/25 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 leading-tight">
        {label}
      </p>
      {isEmpty ? (
        hint ? (
          <p className="text-[11px] italic text-muted-foreground/70 leading-relaxed">
            例：{hint}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/60">—</p>
        )
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
