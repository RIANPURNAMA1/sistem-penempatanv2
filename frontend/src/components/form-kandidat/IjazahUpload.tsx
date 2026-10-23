import {
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Label } from "@/components/ui/components";

interface IjazahUploadProps {
  label: string;
  required?: boolean;
  fileName?: string | null;
  uploading?: boolean;
  disabled?: boolean;
  error?: string;
  onUpload: (file: File) => void;
}

const MAX_SIZE = 500 * 1024;

export function IjazahUpload({
  label,
  required,
  fileName,
  uploading,
  disabled,
  error,
  onUpload,
}: IjazahUploadProps) {
  return (
    <div className="col-span-1 md:col-span-2 w-full">
      <div
        className={`rounded-lg border bg-muted/20 p-3 ${
          error ? "border-red-300" : "border-border"
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className={required ? "required" : ""}>{label}</Label>
            <p className="text-[11px] text-muted-foreground">Maks 500KB</p>
          </div>

          <div className="flex items-center gap-2">
            {fileName ? (
              <span className="flex max-w-[180px] items-center gap-1 truncate text-xs font-medium text-emerald-600">
                <CheckCircle size={12} className="shrink-0" />
                <span className="truncate">{fileName}</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Belum ada file
              </span>
            )}

            <label
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-muted"
              }`}
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              Upload
              <input
                type="file"
                className="hidden"
                disabled={uploading || disabled}
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (!/\.(jpe?g|png|pdf)$/i.test(file.name)) {
                    alert("Ijazah hanya boleh berformat JPG, PNG, atau PDF");
                    e.target.value = "";
                    return;
                  }

                  if (file.size > MAX_SIZE) {
                    alert("Ukuran file terlalu besar. Maksimal 500KB");
                    e.target.value = "";
                    return;
                  }

                  onUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
