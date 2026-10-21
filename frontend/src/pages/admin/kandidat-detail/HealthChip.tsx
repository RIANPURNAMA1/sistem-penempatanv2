interface HealthChipProps {
  label: string;
  value: boolean;
}

export default function HealthChip({ label, value }: HealthChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
        value
          ? "bg-emerald-500 text-white"
          : "bg-rose-500 text-white"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/70" />
      {label}: {value ? "Ya" : "Tidak"}
    </span>
  );
}
