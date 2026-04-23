import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BoolSelectProps {
  value: any;
  onChange: (v: boolean) => void;
  label?: string;
  error?: boolean;
}

export function BoolSelect({ value, onChange, label, error }: BoolSelectProps) {
  return (
    <Select
      value={
        value === true || value === 1
          ? "ya"
          : value === false || value === 0
            ? "tidak"
            : ""
      }
      onValueChange={(v) => onChange(v === "ya")}
    >
      <SelectTrigger error={error}>
        <SelectValue placeholder={label || "Pilih..."} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ya">Ya</SelectItem>
        <SelectItem value="tidak">Tidak</SelectItem>
      </SelectContent>
    </Select>
  );
}