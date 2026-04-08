import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-wrap items-baseline gap-1">
      <span className="text-sm text-gray-500 shrink-0">{label}:</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="break-inside-avoid">
      <h3 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function TemplateClassic({ data }: CVTemplateProps) {
  return (
    <div className="border-2 border-gray-800 p-6">
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
          {data.nama_romaji || data.nama}
        </h1>
        {data.nama_katakana && (
          <p className="text-lg text-gray-600 font-mono mt-1">{data.nama_katakana}</p>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-gray-600 text-xs">
          {data.nomor_hp && <span>{data.nomor_hp}</span>}
          {data.email && <span>{data.email}</span>}
          {data.alamat_lengkap && <span>{data.alamat_lengkap}</span>}
        </div>
      </div>

      <div className="space-y-4">
        <Section title="DATA DIRI">
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="Tempat, Tgl Lahir" value={data.tempat_lahir && data.tanggal_lahir ? `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}` : data.tempat_lahir} />
            <InfoItem label="Umur" value={data.umur ? `${data.umur} tahun` : null} />
            <InfoItem label="Jenis Kelamin" value={data.jenis_kelamin} />
            <InfoItem label="Pendidikan" value={data.pendidikan_terakhir} />
            <InfoItem label="Agama" value={data.agama} />
            <InfoItem label="Golongan Darah" value={data.golongan_darah} />
            <InfoItem label="SIM" value={data.sim_dimiliki} />
            <InfoItem label="Ukuran Baju" value={data.ukuran_baju} />
          </div>
        </Section>

        {data.pendidikan?.length > 0 && (
          <Section title="RIWAYAT PENDIDIKAN">
            {data.pendidikan.map((p: any, i: number) => (
              <div key={i} className="border-l-4 border-blue-600 pl-3 mb-3">
                <p className="font-semibold text-gray-900">{p.nama_sekolah}</p>
                <p className="text-gray-600 text-xs">{p.jenjang} {p.jurusan && `- ${p.jurusan}`}</p>
                <p className="text-gray-500 text-xs">{p.bulan_masuk} {p.tahun_masuk} - {p.bulan_lulus} {p.tahun_lulus}</p>
              </div>
            ))}
          </Section>
        )}

        {data.pengalaman?.length > 0 && (
          <Section title="PENGALAMAN KERJA">
            {data.pengalaman.map((p: any, i: number) => (
              <div key={i} className="border-l-4 border-green-600 pl-3 mb-3">
                <p className="font-semibold text-gray-900">{p.nama_perusahaan}</p>
                <p className="text-gray-600 text-xs">{p.posisi}</p>
                <p className="text-gray-500 text-xs">{p.bulan_masuk} {p.tahun_masuk} - {p.masih_bekerja ? 'Sekarang' : `${p.bulan_keluar} ${p.tahun_keluar}`}</p>
              </div>
            ))}
          </Section>
        )}

        {data.keluarga?.length > 0 && (
          <Section title="DATA KELUARGA">
            <div className="grid grid-cols-2 gap-2">
              {data.keluarga.map((k: any, i: number) => (
                <div key={i} className="bg-gray-100 p-2 rounded">
                  <p className="font-medium text-gray-900 text-xs">{k.hubungan}</p>
                  <p className="text-gray-700 text-xs">{k.nama}</p>
                  <p className="text-gray-500 text-xs">{k.usia ? `${k.usia} tahun` : ''} {k.pekerjaan && `- ${k.pekerjaan}`}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="KEMAMPUAN BAHASA JEPANG">
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="JLPT" value={data.level_jlpt} />
            <InfoItem label="JFT" value={data.level_jft} />
            <InfoItem label="SSW" value={data.sertifikat_ssw} />
            <InfoItem label="Level Bahasa" value={data.level_bahasa_jepang} />
            <InfoItem label="Pernah ke Jepang" value={data.pernah_ke_jepang ? 'Ya' : 'Tidak'} />
            <InfoItem label="Keluarga di Jepang" value={data.keluarga_di_jepang ? 'Ya' : 'Tidak'} />
          </div>
        </Section>

        <Section title="INFORMASI LAIN">
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="Tujuan" value={data.tujuan_ke_jepang} />
            <InfoItem label="Alasan" value={data.alasan_ke_jepang} />
            <InfoItem label="Hobi" value={data.hobi} />
            <InfoItem label="Keahlian" value={data.keahlian} />
          </div>
        </Section>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t">
        Generated on {formatDate(new Date().toISOString())}
      </div>
    </div>
  )
}
