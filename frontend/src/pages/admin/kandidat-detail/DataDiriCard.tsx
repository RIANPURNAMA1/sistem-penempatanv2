import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { labelStatusPernikahan } from "@/components/form-kandidat/constants";
import { User } from "lucide-react";
import SubHeading from "./SubHeading";

interface DataDiriCardProps {
  data: any;
  formatDate: (d: string) => string;
  getFileUrl: (p: string) => string;
}

export default function DataDiriCard({
  data,
  formatDate,
  getFileUrl,
}: DataDiriCardProps) {
  const fotoUrl = data.pas_foto ? getFileUrl(data.pas_foto) : "";

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle
          icon={User}
          title="Data Diri"
          description="Identitas, kontak, dan fisik kandidat"
        />

        {/* Foto + ringkasan singkat */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto"
              className="w-28 h-28 rounded-2xl object-cover border-2 border-border shadow-sm shrink-0"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shrink-0">
              {(data.nama_romaji || data.nama || "U")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}

          <div className="text-center sm:text-left min-w-0">
            <p className="text-lg font-bold leading-tight">
              {data.nama_romaji || data.nama || "-"}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {data.nama_katakana || "-"}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
              {data.jenis_kelamin && (
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-xs font-semibold">
                  {data.jenis_kelamin}
                </span>
              )}
              {data.umur && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-600 text-white text-xs font-semibold">
                  {data.umur} tahun
                </span>
              )}
              {data.golongan_darah && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-semibold">
                  Gol. Darah {data.golongan_darah}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Identitas */}
        <SubHeading>Identitas</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
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
          <InfoRow label="Jenis Kelamin" value={data.jenis_kelamin || "-"} />
          <InfoRow label="Agama" value={data.agama || "-"} />
          <InfoRow
            label="Status Pernikahan"
            value={labelStatusPernikahan(data.status_pernikahan)}
          />
          {(data.status_pernikahan === "Menikah" || data.status_pernikahan === "Cerai") && (
            <InfoRow label="Jumlah Anak" value={data.jumlah_anak || "-"} />
          )}
          <InfoRow
            label="Pendidikan Terakhir"
            value={data.pendidikan_terakhir || "-"}
          />
        </div>

        {/* Kontak & Alamat */}
        <SubHeading>Kontak & Alamat</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
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

        {/* Ukuran Badan & Fisik */}
        <SubHeading>Ukuran Badan & Fisik</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          <InfoRow
            label="Tinggi / Berat Badan"
            value={
              data.tinggi_badan
                ? `${data.tinggi_badan} cm / ${data.berat_badan} kg`
                : "-"
            }
          />
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
          <InfoRow label="Ukuran Baju" value={data.ukuran_baju || "-"} />
          <InfoRow label="SIM" value={data.sim_dimiliki || "-"} />
        </div>
      </CardContent>
    </Card>
  );
}
