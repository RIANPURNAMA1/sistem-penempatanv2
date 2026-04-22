import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { User } from "lucide-react";

interface DataDiriCardProps {
  data: any;
  formatDate: (d: string) => string;
  getFileUrl: (p: string) => string;
}

export default function DataDiriCard({ data, formatDate }: DataDiriCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={User} title="Data Diri" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-3 mb-4">
          {data.pas_foto ? (
            <img
              src={data.pas_foto}
              alt="Foto"
              className="w-32 h-32 rounded-xl object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-blue-500 text-white flex items-center justify-center text-3xl font-bold">
              {(data.nama_romaji || data.nama || "U")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}

          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold">
              {data.nama_romaji || data.nama || "-"}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.nama_katakana || "-"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <InfoRow label="Nama (Romaji)" value={data.nama_romaji || "-"} />
          <InfoRow label="Nama (Katakana)" value={data.nama_katakana || "-"} />

          <InfoRow
            label="Tempat, Tanggal Lahir"
            value={
              data.tempat_lahir && data.tanggal_lahir
                ? `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}`
                : data.tempat_lahir || "-"
            }
          />

          <InfoRow
            label="Umur"
            value={data.umur ? `${data.umur} tahun` : "-"}
          />

          <InfoRow label="Jenis Kelamin" value={data.jenis_kelamin || "-"} />
          <InfoRow label="Pendidikan" value={data.pendidikan_terakhir || "-"} />
          <InfoRow
            label="Status Pernikahan"
            value={data.status_pernikahan || "-"}
          />

          {data.status_pernikahan === "Menikah" && (
            <InfoRow label="Jumlah Anak" value={data.jumlah_anak || "-"} />
          )}

          <InfoRow label="Agama" value={data.agama || "-"} />

          <InfoRow
            label="Tinggi / Berat"
            value={
              data.tinggi_badan
                ? `${data.tinggi_badan} cm / ${data.berat_badan} kg`
                : "-"
            }
          />

          <InfoRow label="Golongan Darah" value={data.golongan_darah || "-"} />
          <InfoRow label="Ukuran Baju" value={data.ukuran_baju || "-"} />

          <InfoRow
            label="Lingkar Pinggang"
            value={data.lingkar_pinggang ? `${data.lingkar_pinggang} cm` : "-"}
          />

          <InfoRow
            label="Panjang Telapak Kaki"
            value={
              data.panjang_telapak_kaki
                ? `${data.panjang_telapak_kaki} cm`
                : "-"
            }
          />

          <InfoRow label="SIM" value={data.sim_dimiliki || "-"} />
          <InfoRow label="No. HP" value={data.nomor_hp || "-"} />

          <InfoRow
            label="Kontak Orang Tua"
            value={
              data.kontak_ortu_nama
                ? `${data.kontak_ortu_nama} (${data.kontak_ortu_hp})`
                : "-"
            }
          />

          <InfoRow
            label="Alamat"
            value={data.alamat_lengkap || "-"}
            multiline
          />
        </div>
      </CardContent>
    </Card>
  );
}
