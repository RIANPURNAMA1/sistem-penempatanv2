import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/components";
import { SectionTitle } from "@/components/kandidat";
import {
  FileText,
  Upload,
  Download,
  Loader2,
  X,
  ExternalLink,
  ZoomIn,
} from "lucide-react";
import { toast } from "@/hooks/useToast";

interface DokumenCardProps {
  data: any;
  getFileUrl: (p: string) => string;
}

interface PreviewState {
  url: string;
  label: string;
  fileName: string;
  isImg: boolean;
  isPdf: boolean;
}

const handleDownload = async (
  fileUrl: string,
  fileName: string,
  setDownloading: (id: number | null) => void,
  docId: number,
) => {
  setDownloading(docId);
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    toast({ title: "File berhasil didownload", variant: "success" as any });
  } catch {
    toast({ title: "Gagal mendownload file", variant: "destructive" });
  } finally {
    setDownloading(null);
  }
};

function DocumentLightbox({
  preview,
  onClose,
}: {
  preview: PreviewState;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b shrink-0">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{preview.label}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {preview.fileName}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium hover:bg-gray-50"
            >
              <ExternalLink size={13} />
              Tab Baru
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100"
              title="Tutup (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-100 p-3 flex items-center justify-center">
          {preview.isImg ? (
            <img
              src={preview.url}
              alt={preview.label}
              className="max-h-[75vh] mx-auto rounded-lg bg-white shadow"
            />
          ) : (
            <iframe
              src={preview.url}
              title={preview.label}
              className="w-full h-[75vh] bg-white rounded-lg shadow"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DokumenCard({ data, getFileUrl }: DokumenCardProps) {
  const [downloading, setDownloading] = useState<number | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  if (!data.dokumen?.length) {
    return (
      <Card>
        <CardContent className="pt-5">
          <SectionTitle
            icon={Upload}
            title="Dokumen Pendukung"
            description="Belum ada dokumen yang diunggah"
          />
          <div className="flex flex-col items-center gap-2 py-8 text-center border border-dashed rounded-xl">
            <Upload size={28} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Belum ada dokumen yang diunggah
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle
          icon={Upload}
          title="Dokumen Pendukung"
          description={`${data.dokumen.length} file — klik untuk melihat ukuran penuh`}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.dokumen.map((d: any) => {
            const labelMap: Record<string, string> = {
              sertifikat_jft: "Sertifikat JFT",
              pas_foto: "Pas Foto",
              foto_full_body: "Foto Full Body",
              kk: "Kartu Keluarga",
              ktp: "KTP",
              ijazah: "Ijazah",
              ijazah_sd: "Ijazah SD",
              ijazah_smp: "Ijazah SMP",
              ijazah_sma: "Ijazah SMA/SMK",
              ijazah_pt: "Ijazah Perguruan Tinggi",
              akte: "Akte Kelahiran",
              lainnya: "Lainnya",
            };
            let label =
              labelMap[d.jenis_dokumen] || d.jenis_dokumen.replace(/_/g, " ");
            const isSSW = d.jenis_dokumen.startsWith("ssw_");
            if (isSSW) {
              const sswArray = data.sertifikat_ssw
                ? data.sertifikat_ssw.split(",").map((s: string) => s.trim())
                : [];
              const idx = parseInt(d.jenis_dokumen.split("_")[1]) - 1;
              label = `SSW - ${sswArray[idx] || `#${idx + 1}`}`;
            }

            const fileUrl = getFileUrl(d.path_file);
            const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(d.path_file);
            const isPdf = /\.pdf$/i.test(d.path_file);
            const ext = (d.path_file?.split(".").pop() || "file").toUpperCase();
            const isDownloading = downloading === d.id;

            const previewState: PreviewState = {
              url: fileUrl,
              label,
              fileName: d.nama_file || "file",
              isImg,
              isPdf,
            };

            return (
              <div
                key={d.id}
                className={`flex flex-col border rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow ${
                  isSSW ? "border-purple-200" : "border-border"
                }`}
              >
                {/* Preview langsung: gambar tampil, PDF ter-embed */}
                <button
                  onClick={() => setPreview(previewState)}
                  className="relative block w-full aspect-[4/3] bg-slate-100 overflow-hidden group"
                  title={`Lihat ${label}`}
                >
                  {isImg ? (
                    <img
                      src={fileUrl}
                      alt={label}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : isPdf ? (
                    <iframe
                      src={fileUrl}
                      title={label}
                      tabIndex={-1}
                      className="w-full h-full bg-white pointer-events-none border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <FileText size={28} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">
                        {ext}
                      </span>
                    </div>
                  )}

                  <span
                    className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                      isSSW
                        ? "bg-purple-600/90 text-white"
                        : "bg-black/60 text-white"
                    }`}
                  >
                    {isSSW ? "SSW" : ext}
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={12} />
                  </span>
                </button>

                {/* Info file + aksi */}
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-2 border-t">
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate leading-tight ${
                        isSSW ? "text-purple-700" : ""
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {d.nama_file}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleDownload(
                        fileUrl,
                        d.nama_file || "file",
                        setDownloading,
                        d.id,
                      )
                    }
                    disabled={isDownloading}
                    className="p-1.5 rounded-md border bg-white hover:bg-gray-50 text-gray-500 hover:text-foreground transition-colors shrink-0 disabled:opacity-50"
                    title="Download"
                  >
                    {isDownloading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {preview && (
        <DocumentLightbox preview={preview} onClose={() => setPreview(null)} />
      )}
    </Card>
  );
}
