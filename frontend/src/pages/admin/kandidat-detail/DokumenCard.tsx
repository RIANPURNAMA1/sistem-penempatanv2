import { useState } from "react";
import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { FileText, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/useToast";

interface DokumenCardProps {
  data: any;
  getFileUrl: (p: string) => string;
}

const handleDownload = async (fileUrl: string, fileName: string, setDownloading: (id: number | null) => void, docId: number) => {
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

export default function DokumenCard({ data, getFileUrl }: DokumenCardProps) {
  const [downloading, setDownloading] = useState<number | null>(null);

  if (!data.dokumen?.length) return null;

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Upload} title="Dokumen Pendukung" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
          {data.dokumen.map((d: any) => {
            const labelMap: Record<string, string> = {
              sertifikat_jft: "Sertifikat JFT",
              pas_foto: "Pas Foto",
              foto_full_body: "Foto Full Body",
              kk: "Kartu Keluarga",
              ktp: "KTP",
              ijazah: "Ijazah",
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
            const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(d.path_file);
            const fileUrl = getFileUrl(d.path_file);
            const isDownloading = downloading === d.id;
            return (
              <div
                key={d.id}
                className={`flex flex-col items-center gap-2 p-3 border rounded-xl hover:bg-muted/50 transition-colors text-center group relative ${
                  isSSW ? "border-purple-200 bg-purple-50/50" : "border-border"
                }`}
              >
                <button
                  onClick={() => handleDownload(fileUrl, d.nama_file || "file", setDownloading, d.id)}
                  disabled={isDownloading}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 disabled:opacity-50"
                  title="Download"
                >
                  {isDownloading ? (
                    <Loader2 size={14} className="animate-spin text-gray-600" />
                  ) : (
                    <Download size={14} className="text-gray-600" />
                  )}
                </button>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 w-full"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSSW
                        ? "bg-purple-100"
                        : isImg
                          ? "bg-blue-50"
                          : "bg-gray-100"
                    }`}
                  >
                    {isSSW ? (
                      <span className="text-purple-600 text-xs font-bold">
                        SSW
                      </span>
                    ) : isImg ? (
                      <span className="text-blue-500 text-base">🖼</span>
                    ) : (
                      <FileText size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <p
                      className={`text-xs font-medium truncate ${
                        isSSW ? "text-purple-700" : ""
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-muted-foreground text-[10px] truncate mt-0.5">
                      {d.nama_file}
                    </p>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}