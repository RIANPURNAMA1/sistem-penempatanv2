import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/components";
import {
  FileText,
  CheckCircle,
  Upload,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { dokumenTypes, REQUIRED_DOCS } from "../constants";

interface FormStep9Props {
  form: any;
  uploadingKey: string | null;
  isSubmitted: boolean;
  handleUpload: (jenis: string, file: File, sswIndex?: number) => void;
  addSertifikatSsw: () => void;
  removeSertifikatSsw: (i: number) => void;
  errors: Record<string, string>;
}

export function FormStep9_Dokumen({
  form,
  uploadingKey,
  isSubmitted,
  handleUpload,
  addSertifikatSsw,
  removeSertifikatSsw,
  errors,
}: FormStep9Props) {
  return (
    <div className="space-y-4">
      <p className="form-section-title text-sm sm:text-base">
        <FileText className="inline mr-1 sm:mr-2 h-4 w-4" />
        UPLOAD DOKUMEN PENDUKUNG <span className="text-red-500">*</span>
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-amber-800 mb-3 sm:mb-4">
        <p className="font-medium mb-1 text-xs">Batas ukuran file:</p>
        <ul className="text-[10px] sm:text-xs space-y-0.5 ml-2">
          <li>• Semua dokumen: Maks 500KB</li>
          <li>• Foto Full Body: Maks 500KB</li>
          <li>• Video Perkenalan: Maks 500KB</li>
        </ul>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground -mt-2">
        Format: JPG, PNG, PDF, MP4. Semua dokumen wajib diupload.
      </p>

      {errors.dokumen && (
        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-600 mb-3 sm:mb-4">
          {errors.dokumen}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {dokumenTypes.map((dt) => {
          const uploaded = form.dokumen?.find(
            (d: any) => d.jenis_dokumen === dt.key,
          );
          const isUploading = uploadingKey === dt.key;
          const isOptional = dt.optional;

          return (
            <div
              key={dt.key}
              className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                uploaded
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  {uploaded ? (
                    <CheckCircle
                      size={14}
                      className="text-emerald-500 shrink-0"
                    />
                  ) : (
                    <FileText
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                  )}
                  <span className="text-xs sm:text-sm font-medium leading-tight">
                    {dt.label} {isOptional ? "" : "*"}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                  Maks 500KB
                </span>
              </div>

              {uploaded && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 truncate">
                  {uploaded.nama_file}
                </p>
              )}

              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  disabled={isUploading || isSubmitted}
                  accept="image/jpeg,image/png,application/pdf,video/mp4"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const MAX_SIZE = 500 * 1024;
                    if (file.size > MAX_SIZE) {
                      alert("Ukuran file terlalu besar. Maksimal 500KB");
                      return;
                    }

                    handleUpload(dt.key, file);
                  }}
                />

                <div
                  className={`flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 border rounded-md w-fit transition-colors ${
                    isSubmitted
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-muted cursor-pointer"
                  } ${
                    !uploaded && !isOptional
                      ? "border-red-300 bg-red-50"
                      : "border-border"
                  }`}
                >
                  {isUploading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  {uploaded ? "Ganti" : "Upload"}
                </div>
              </label>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-xs sm:text-sm">
            Sertifikat SSW (Opsional)
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={addSertifikatSsw}
            disabled={isSubmitted}
          >
            <Plus size={14} className="mr-1" />
            <span className="hidden sm:inline">Tambah</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>

        {form.sertifikatSsw?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-muted-foreground border border-dashed border-border rounded-lg">
            <p className="text-xs sm:text-sm">Belum ada sertifikat SSW</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 sm:mt-3"
              onClick={addSertifikatSsw}
            >
              <Plus size={14} className="mr-1" />
              Tambah Sertifikat
            </Button>
          </div>
        )}

        {form.sertifikatSsw?.map((s: any, i: number) => {
          const sswKey = `ssw_${i + 1}`;
          const uploaded = form.dokumen?.find(
            (d: any) => d.jenis_dokumen === sswKey,
          );
          const isUploading = uploadingKey === sswKey;

          return (
            <div
              key={i}
              className={`border rounded-lg p-3 sm:p-4 mb-3 last:mb-0 ${
                uploaded
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="font-semibold text-xs sm:text-sm">
                  Sertifikat SSW #{i + 1}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-destructive"
                  onClick={() => removeSertifikatSsw(i)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 border rounded-lg shrink-0 ${
                    uploaded
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-border"
                  }`}
                >
                  {uploaded ? (
                    <CheckCircle size={16} sm:size={20} className="text-emerald-500" />
                  ) : (
                    <FileText size={16} sm:size={20} className="text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {uploaded ? (
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {uploaded.nama_file}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Belum ada file
                    </p>
                  )}

                  <label className="cursor-pointer mt-2 inline-block">
                    <input
                      type="file"
                      className="hidden"
                      disabled={isUploading || isSubmitted}
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const MAX_SIZE = 500 * 1024;
                        if (file.size > MAX_SIZE) {
                          alert("Ukuran file terlalu besar. Maksimal 500KB");
                          return;
                        }

                        handleUpload(sswKey, file, i);
                      }}
                    />

                    <div
                      className={`flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 border rounded-md transition-colors ${
                        isSubmitted
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted cursor-pointer"
                      } ${
                        !uploaded
                          ? "border-red-300 bg-red-50"
                          : "border-border"
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      {uploaded ? "Ganti" : "Pilih File"}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}