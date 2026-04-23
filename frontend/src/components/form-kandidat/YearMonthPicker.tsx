import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { months, years } from "./constants";

interface YearMonthPickerProps {
  monthVal: string;
  yearVal: string;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  placeholder?: string;
}

export function YearMonthPicker({
  monthVal,
  yearVal,
  onMonthChange,
  onYearChange,
  placeholder = "Bulan",
}: YearMonthPickerProps) {
  return (
    <div className="flex gap-2">
      <Select value={monthVal || ""} onValueChange={onMonthChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={yearVal ? String(yearVal) : ""} onValueChange={onYearChange}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}