import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

export default function TemplateSimple({ data }: CVTemplateProps) {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{data.nama_romaji || data.nama}</h1>
        {data.nama_katakana && <p className="text-sm text-gray-500 font-mono">{data.nama_katakana}</p>}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
          {data.nomor_hp && <span>{data.nomor_hp}</span>}
          {data.email && <span>{data.email}</span>}
          {data.alamat_lengkap && <span>{data.alamat_lengkap}</span>}
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-4 gap-2 border-b pb-2">
          <span className="text-gray-500 text-xs">TTL:</span>
          <span className="col-span-3 text-xs">{data.tempat_lahir && data.tanggal_lahir ? `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}` : data.tempat_lahir}</span>
          
          <span className="text-gray-500 text-xs">Umur:</span>
          <span className="col-span-3 text-xs">{data.umur ? `${data.umur} tahun` : '-'}</span>
          
          <span className="text-gray-500 text-xs">JK:</span>
          <span className="col-span-3 text-xs">{data.jenis_kelamin || '-'}</span>
          
          <span className="text-gray-500 text-xs">Pendidikan:</span>
          <span className="col-span-3 text-xs">{data.pendidikan_terakhir || '-'}</span>
          
          <span className="text-gray-500 text-xs">Agama:</span>
          <span className="col-span-3 text-xs">{data.agama || '-'}</span>
          
          <span className="text-gray-500 text-xs">Gol. Darah:</span>
          <span className="col-span-3 text-xs">{data.golongan_darah || '-'}</span>
        </div>

        {data.pendidikan?.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="font-semibold text-xs mb-2">PENDIDIKAN</h3>
            {data.pendidikan.map((p: any, i: number) => (
              <div key={i} className="mb-2 text-xs">
                <p className="font-medium">{p.nama_sekolah}</p>
                <p className="text-gray-500">{p.jenjang} {p.jurusan && `- ${p.jurusan}`} | {p.bulan_masuk} {p.tahun_masuk} - {p.bulan_lulus} {p.tahun_lulus}</p>
              </div>
            ))}
          </div>
        )}

        {data.pengalaman?.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="font-semibold text-xs mb-2">PENGALAMAN KERJA</h3>
            {data.pengalaman.map((p: any, i: number) => (
              <div key={i} className="mb-2 text-xs">
                <p className="font-medium">{p.nama_perusahaan}</p>
                <p className="text-gray-500">{p.posisi} | {p.bulan_masuk} {p.tahun_masuk} - {p.masih_bekerja ? 'Sekarang' : `${p.bulan_keluar} ${p.tahun_keluar}`}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 border-b pb-2">
          <div>
            <h3 className="font-semibold text-xs mb-2">BAHASA JEPANG</h3>
            <div className="text-xs space-y-1">
              <p>JLPT: {data.level_jlpt || '-'}</p>
              <p>JFT: {data.level_jft || '-'}</p>
              <p>SSW: {data.sertifikat_ssw || '-'}</p>
              <p>Level: {data.level_bahasa_jepang || '-'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-2">LAINNYA</h3>
            <div className="text-xs space-y-1">
              <p>Hobi: {data.hobi || '-'}</p>
              <p>Keahlian: {data.keahlian || '-'}</p>
            </div>
          </div>
        </div>

        {data.keluarga?.length > 0 && (
          <div>
            <h3 className="font-semibold text-xs mb-2">DATA KELUARGA</h3>
            <div className="grid grid-cols-3 gap-2">
              {data.keluarga.map((k: any, i: number) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                  <p className="font-medium">{k.hubungan}</p>
                  <p>{k.nama}</p>
                  <p className="text-gray-500">{k.usia ? `${k.usia} th` : ''} {k.pekerjaan}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
