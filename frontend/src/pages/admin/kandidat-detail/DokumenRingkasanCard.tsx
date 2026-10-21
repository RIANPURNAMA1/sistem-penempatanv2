import { Card, CardContent } from "@/components/ui/components";
import { FileCheck } from "lucide-react";

interface DokumenRingkasanCardProps {
  data: any;
}

export default function DokumenRingkasanCard({
  data,
}: DokumenRingkasanCardProps) {
  const hasJft = data.dokumen.find(
    (d: any) => d.jenis_dokumen === "sertifikat_jft",
  );
  const sswCount = data.dokumen.filter((d: any) =>
    d.jenis_dokumen.startsWith("ssw_"),
  ).length;

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <FileCheck size={13} />
          Ringkasan Dokumen
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total dokumen</span>
            <span className="text-sm font-bold">
              {data.dokumen.length} file
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Sertifikat SSW
            </span>
            <span className="text-sm font-bold">{sswCount} bidang</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Sertifikat JFT
            </span>
            {hasJft ? (
              <span className="inline-flex px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-semibold">
                Ada
              </span>
            ) : (
              <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                Belum
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
