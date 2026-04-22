import { Card, CardContent } from "@/components/ui/components";

interface DokumenRingkasanCardProps {
  data: any;
}

export default function DokumenRingkasanCard({ data }: DokumenRingkasanCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
          Ringkasan Dokumen
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total dokumen</span>
            <span className="text-sm font-medium">
              {data.dokumen.length} file
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Sertifikat SSW
            </span>
            <span className="text-sm font-medium">
              {
                data.dokumen.filter((d: any) =>
                  d.jenis_dokumen.startsWith("ssw_"),
                ).length
              }{" "}
              bidang
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Sertifikat JFT
            </span>
            {data.dokumen.find(
              (d: any) => d.jenis_dokumen === "sertifikat_jft",
            ) ? (
              <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
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