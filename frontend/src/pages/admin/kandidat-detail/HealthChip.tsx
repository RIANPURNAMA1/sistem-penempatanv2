interface HealthChipProps {
  label: string;
  value: boolean;
}

export default function HealthChip({ label, value }: HealthChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        value ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {value ? "✓" : "✗"} {label}
    </span>
  );
}