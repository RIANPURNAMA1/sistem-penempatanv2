import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-wrap items-baseline gap-1">
      <span className="text-xs text-white/70 shrink-0">{label}:</span>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="break-inside-avoid">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b-2 border-blue-500 pb-1 mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function TemplateModern({ data }: CVTemplateProps) {
  return (
    <div className="grid grid-cols-12 gap-0">
      <div className="col-span-4 bg-gradient-to-b from-blue-600 to-blue-800 p-6 text-white">
        <div className="text-center">
          <h1 className="text-xl font-bold uppercase tracking-wide">
            {data.nama_romaji || data.nama}
          </h1>
          {data.nama_katakana && (
            <p className="text-sm font-mono mt-1 opacity-80">{data.nama_katakana}</p>
          )}
        </div>

        <div className="mt-6 space-y-3 text-xs">
          {data.nomor_hp && (
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>{data.nomor_hp}</span>
            </div>
          )}
          {data.email && (
            <div className="flex items-center gap-2">
              <span>✉️</span>
              <span className="break-all">{data.email}</span>
            </div>
          )}
          {data.alamat_lengkap && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{data.alamat_lengkap}</span>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <h3 className="font-bold text-sm border-b border-white/30 pb-1 mb-2">DATA DIRI</h3>
            <div className="space-y-1 text-xs">
              <InfoItem label="TTL" value={data.tempat_lahir && data.tanggal_lahir ? `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}` : data.tempat_lahir} />
              <InfoItem label="Umur" value={data.umur ? `${data.umur} tahun` : null} />
              <InfoItem label="JK" value={data.jenis_kelamin} />
              <InfoItem label="Pendidikan" value={data.pendidikan_terakhir} />
              <InfoItem label="Agama" value={data.agama} />
              <InfoItem label="Gol. Darah" value={data.golongan_darah} />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm border-b border-white/30 pb-1 mb-2">BAHASA JEPANG</h3>
            <div className="space-y-1 text-xs">
              <InfoItem label="JLPT" value={data.level_jlpt} />
              <InfoItem label="JFT" value={data.level_jft} />
              <InfoItem label="SSW" value={data.sertifikat_ssw} />
              <InfoItem label="Level" value={data.level_bahasa_jepang} />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm border-b border-white/30 pb-1 mb-2">LAINNYA</h3>
            <div className="space-y-1 text-xs">
              <InfoItem label="Hobi" value={data.hobi} />
              <InfoItem label="Keahlian" value={data.keahlian} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-8 bg-white p-6">
        <div className="space-y-6">
          {data.pendidikan?.length > 0 && (
            <Section title="RIWAYAT PENDIDIKAN">
              {data.pendidikan.map((p: any, i: number) => (
                <div key={i} className="mb-3">
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
                <div key={i} className="mb-3">
                  <p className="font-semibold text-gray-900">{p.nama_perusahaan}</p>
                  <p className="text-gray-600 text-xs">{p.posisi}</p>
                  <p className="text-gray-500 text-xs">{p.bulan_masuk} {p.tahun_masuk} - {p.masih_bekerja ? 'Sekarang' : `${p.bulan_keluar} ${p.tahun_keluar}`}</p>
                  {p.deskripsi_pekerjaan && <p className="text-gray-500 text-xs mt-1">{p.deskripsi_pekerjaan}</p>}
                </div>
              ))}
            </Section>
          )}

          {data.keluarga?.length > 0 && (
            <Section title="DATA KELUARGA">
              <div className="grid grid-cols-2 gap-2">
                {data.keluarga.map((k: any, i: number) => (
                  <div key={i} className="bg-blue-50 p-2 rounded">
                    <p className="font-medium text-blue-900 text-xs">{k.hubungan}</p>
                    <p className="text-blue-800 text-xs">{k.nama}</p>
                    <p className="text-blue-600 text-xs">{k.usia ? `${k.usia} tahun` : ''} {k.pekerjaan && `- ${k.pekerjaan}`}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="MOTIVASI">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Tujuan: </span>
                <span className="font-medium">{data.tujuan_ke_jepang || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Alasan: </span>
                <span className="font-medium">{data.alasan_ke_jepang || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Kelebihan: </span>
                <span className="font-medium">{data.kelebihan_diri || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Kekurangan: </span>
                <span className="font-medium">{data.kekurangan_diri || '-'}</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
