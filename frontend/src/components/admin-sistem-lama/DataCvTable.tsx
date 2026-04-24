import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, X, Eye, Loader2, ChevronLeft, ChevronRight, FileText, Download, Image, File, FileDown } from 'lucide-react'
import { toast } from '@/hooks/useToast'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.penempatan.mendunia.id'
const UPLOADS_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads` : 'https://api.penempatan.mendunia.id/uploads'

export interface CvData {
  id: number
  user_id: number
  email: string
  cabang_id: number
  batch: string
  no_telepon: string
  no_orang_tua: string
  bidang_sertifikasi: string
  bidang_sertifikasi_lainnya: string | null
  program_pertanian_kawakami: string
  sertifikat_files: string
  pas_foto: string
  pas_foto_cv: string
  nama_lengkap_romaji: string
  nama_lengkap_katakana: string
  nama_panggilan_romaji: string
  nama_panggilan_katakana: string
  jenis_kelamin: string
  agama: string
  agama_lainnya: string | null
  tanggal_lahir: string
  tempat_lahir: string
  usia: string
  alamat_lengkap: string
  provinsi: string
  kabupaten: string
  kecamatan: string
  kelurahan: string
  email_aktif: string
  status_perkawinan: string
  status_perkawinan_lainnya: string | null
  golongan_darah: string
  surat_izin_mengemudi: string
  jenis_sim: string | null
  merokok: string
  minum_alkohol: string
  bertato: string
  tinggi_badan: string
  berat_badan: string
  ukuran_pinggang: string
  ukuran_sepatu: string
  ukuran_atasan_baju: string
  ukuran_atasan_baju_lainnya: string | null
  ukuran_celana: string
  tangan_dominan: string
  kemampuan_penglihatan_mata: string
  kemampuan_pendengaran: string
  kemampuan_penglihatan_mata_lainnya: string | null
  sudah_vaksin_berapa_kali: string
  sudah_vaksin_berapa_kali_lainnya: string | null
  kesehatan_badan: string
  penyakit_cedera_masa_lalu: string
  hobi: string
  rencana_sumber_biaya_keberangkatan: string
  perkiraan_biaya: string
  Biaya_keberangkatan_sebelumnya_jisshu: string | null
  lama_belajar_di_mendunia: string
  kemampuan_bahasa_jepang: string
  kemampuan_pemahaman_ssw: string
  kelincahan_dalam_bekerja: string
  kekuatan_tindakan: string
  kemampuan_berbahasa_inggris: string
  kemampuan_berbahasa_inggris_lainnya: string | null
  kebugaran_jasmani_seminggu: string
  kebugaran_jasmani_seminggu_lainnya: string | null
  bersedia_kerja_shift: string
  bersedia_lembur: string
  bersedia_hari_libur: string
  menggunakan_kacamata: string
  ada_keluarga_di_jepang: string
  hubungan_keluarga_di_jepang: string
  status_kerabat_di_jepang: string
  status_kerabat_di_jepang_lainnya: string | null
  ingin_bekerja_berapa_tahun: string
  ingin_bekerja_berapa_tahun_lainnya: string | null
  ingin_pulang_berapa_kali: string
  kelebihan_diri: string
  komentar_guru_kelebihan_diri: string
  kekurangan_diri: string
  komentar_guru_kekurangan_diri: string
  ketertarikan_terhadap_jepang: string
  orang_yang_dihormati: string
  point_plus_diri: string
  keahlian_khusus: string
  istri_nama: string
  istri_usia: string | null
  istri_pekerjaan: string | null
  anak_nama: string
  anak_jenis_kelamin: string | null
  anak_usia: string | null
  anak_pendidikan: string | null
  ibu_nama: string
  ibu_usia: string
  ibu_pekerjaan: string
  ayah_nama: string
  ayah_usia: string
  ayah_pekerjaan: string
  kakak_nama: string
  kakak_usia: string | null
  kakak_jenis_kelamin: string | null
  kakak_pekerjaan: string | null
  kakak_status: string | null
  adik_nama: string
  adik_usia: string
  adik_jenis_kelamin: string
  adik_pekerjaan: string
  adik_status: string
  rata_rata_penghasilan_keluarga: string
  gaji_keluarga: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface DataCvTableProps {
  onSelect?: (cv: CvData) => void
}

const parseFiles = (filesStr: string): string[] => {
  if (!filesStr || filesStr === '[]' || filesStr === '') return []
  try {
    const parsed = JSON.parse(filesStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function DataCvTable({ onSelect }: DataCvTableProps) {
  const navigate = useNavigate()
  const [data, setData] = useState<CvData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedCv, setSelectedCv] = useState<CvData | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const load = () => {
    setLoading(true)
    fetch(`${API_URL}/api/cv/all`)
      .then(r => r.json())
      .then(r => {
        if (r.data) setData(r.data)
        else if (r.success) setData(r.data || [])
        else toast({ title: 'Gagal memuat data', variant: 'destructive' })
      })
      .catch(() => toast({ title: 'Gagal menghubungkan ke server', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setPage(1) }, [search])

  const handleDetail = (cv: CvData) => {
    setSelectedCv(cv)
    setShowDetail(true)
  }

  const handleDownloadCv = (cv: CvData) => {
    navigate(`/cv/${cv.id}`)
  }

  const filteredData = data.filter(item => {
    const s = search.toLowerCase()
    return (
      item.nama_lengkap_romaji?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.no_telepon?.includes(s) ||
      item.bidang_sertifikasi?.toLowerCase().includes(s)
    )
  })

  const totalPages = Math.ceil(filteredData.length / perPage)
  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="mt-8">
      <div className="flex flex-col lg:flex-row justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Data CV</h2>
          <p className="text-sm text-muted-foreground">Data CV dari sistem baru</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari Nama, Email, atau Bidang..." 
            className="pl-9 bg-white" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className=" overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NO</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">FOTO</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NAMA</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">BIDANG SERTIFIKASI</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">EMAIL</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NO TELEPON</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada data</td></tr>
              ) : paginatedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400 text-xs">{(page - 1) * perPage + index + 1}</td>
                  <td className="px-3 py-2">
                    {item.pas_foto_cv ? (
                      <img 
                        src={`https://matchingjob.mendunia.id/${item.pas_foto_cv}`} 
                        alt="Foto" 
                        className="w-10 h-10 rounded-full object-cover border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ''
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Image size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{item.nama_lengkap_romaji || '-'}</div>
                    <div className="text-xs text-gray-500">{item.nama_lengkap_katakana || ''}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{item.bidang_sertifikasi || '-'}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{item.email || '-'}</td>
                  <td className="px-3 py-2 text-green-600 text-xs">{item.no_telepon || '-'}</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDetail(item)} title="Detail">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDownloadCv(item)} title="Lihat CV">
                          <FileDown size={14} />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="px-4 py-2 border-t flex items-center justify-between bg-gray-50 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Baris:</span>
              <select 
                value={perPage} 
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
                className="border rounded px-1 py-0.5"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500 ml-2">
                {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredData.length)} dari {filteredData.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                <ChevronLeft size={12} />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                if (pageNum < 1 || pageNum > totalPages) return null
                return (
                  <Button 
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"} 
                    size="sm" 
                    className="h-6 w-6 p-0 text-xs"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                <ChevronRight size={12} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail CV: {selectedCv?.nama_lengkap_romaji}</DialogTitle>
          </DialogHeader>
          {selectedCv && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-bold text-blue-600 text-sm mb-2 border-b pb-1">FOTO</h4>
                {selectedCv.pas_foto_cv && (
                  <img 
                    src={`${UPLOADS_URL}/${selectedCv.pas_foto_cv}`} 
                    alt="Foto CV" 
                    className="w-full max-w-[180px] rounded-lg border mb-3"
                  />
                )}

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">DATA DIRI</h4>
                <DetailItem label="Nama (Romaji)" value={selectedCv.nama_lengkap_romaji} />
                <DetailItem label="Nama (Katakana)" value={selectedCv.nama_lengkap_katakana} />
                <DetailItem label="Nama Panggilan (Romaji)" value={selectedCv.nama_panggilan_romaji} />
                <DetailItem label="Nama Panggilan (Katakana)" value={selectedCv.nama_panggilan_katakana} />
                <DetailItem label="Jenis Kelamin" value={selectedCv.jenis_kelamin} />
                <DetailItem label="Tempat Lahir" value={selectedCv.tempat_lahir} />
                <DetailItem label="Tanggal Lahir" value={selectedCv.tanggal_lahir} />
                <DetailItem label="Usia" value={`${selectedCv.usia} tahun`} />
                <DetailItem label="Agama" value={selectedCv.agama} />
                <DetailItem label="Golongan Darah" value={selectedCv.golongan_darah} />
                <DetailItem label="Status Perkawinan" value={selectedCv.status_perkawinan} />

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">ALAMAT</h4>
                <DetailItem label="Alamat Lengkap" value={selectedCv.alamat_lengkap} />
                <DetailItem label="Provinsi" value={selectedCv.provinsi} />
                <DetailItem label="Kabupaten" value={selectedCv.kabupaten} />
                <DetailItem label="Kecamatan" value={selectedCv.kecamatan} />
                <DetailItem label="Kelurahan" value={selectedCv.kelurahan} />

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">KONTAK</h4>
                <DetailItem label="No Telepon" value={selectedCv.no_telepon} />
                <DetailItem label="No Orang Tua" value={selectedCv.no_orang_tua} />
                <DetailItem label="Email" value={selectedCv.email_aktif} />
              </div>

              <div>
                <h4 className="font-bold text-blue-600 text-sm mb-2 border-b pb-1">PROGRAM</h4>
                <DetailItem label="Bidang Sertifikasi" value={selectedCv.bidang_sertifikasi} />
                <DetailItem label="Bidang Lainnya" value={selectedCv.bidang_sertifikasi_lainnya} />
                <DetailItem label="Batch" value={selectedCv.batch} />
                <DetailItem label="Program Pertanian Kawakami" value={selectedCv.program_pertanian_kawakami} />

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">DATA KELUARGA</h4>
                <DetailItem label="Ayah" value={selectedCv.ayah_nama} />
                <DetailItem label="Usia Ayah" value={selectedCv.ayah_usia} />
                <DetailItem label="Pekerjaan Ayah" value={selectedCv.ayah_pekerjaan} />
                <DetailItem label="Ibu" value={selectedCv.ibu_nama} />
                <DetailItem label="Usia Ibu" value={selectedCv.ibu_usia} />
                <DetailItem label="Pekerjaan Ibu" value={selectedCv.ibu_pekerjaan} />
                <DetailItem label="Kakak" value={selectedCv.kakak_nama} />
                <DetailItem label="Adik" value={selectedCv.adik_nama} />
                <DetailItem label="Istri/Suami" value={selectedCv.istri_nama} />
                <DetailItem label="Anak" value={selectedCv.anak_nama} />
                <DetailItem label="Penghasilan Keluarga" value={selectedCv.rata_rata_penghasilan_keluarga} />

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">PHYSICAL</h4>
                <DetailItem label="Tinggi Badan" value={`${selectedCv.tinggi_badan} cm`} />
                <DetailItem label="Berat Badan" value={`${selectedCv.berat_badan} kg`} />
                <DetailItem label="Ukuran Pinggang" value={`${selectedCv.ukuran_pinggang} cm`} />
                <DetailItem label="Ukuran Sepatu" value={selectedCv.ukuran_sepatu} />
                <DetailItem label="Ukuran Baju" value={selectedCv.ukuran_atasan_baju} />
                <DetailItem label="Ukuran Celana" value={selectedCv.ukuran_celana} />
                <DetailItem label="Tangan Dominan" value={selectedCv.tangan_dominan} />
                <DetailItem label="Penglihatan Mata" value={selectedCv.kemampuan_penglihatan_mata} />
                <DetailItem label="Pendengaran" value={selectedCv.kemampuan_pendengaran} />
              </div>

              <div>
                <h4 className="font-bold text-blue-600 text-sm mb-2 border-b pb-1">KESEHATAN</h4>
                <DetailItem label="Vaksin" value={selectedCv.sudah_vaksin_berapa_kali} />
                <DetailItem label="Kesehatan" value={selectedCv.kesehatan_badan} />
                <DetailItem label="Riwayat Penyakit" value={selectedCv.penyakit_cedera_masa_lalu} />
                <DetailItem label="Merokok" value={selectedCv.merokok} />
                <DetailItem label="Minum Alkohol" value={selectedCv.minum_alkohol} />
                <DetailItem label="Bertato" value={selectedCv.bertato} />
                <DetailItem label="SIM" value={selectedCv.surat_izin_mengemudi} />
                <DetailItem label="Jenis SIM" value={selectedCv.jenis_sim} />
                <DetailItem label="Kacamata" value={selectedCv.menggunakan_kacamata} />
                <DetailItem label="Hobi" value={selectedCv.hobi} />

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">BELAJAR DI MENDUNIA</h4>
                <DetailItem label="Lama Belajar" value={selectedCv.lama_belajar_di_mendunia} />
                <DetailItem label="Bahasa Jepang" value={selectedCv.kemampuan_bahasa_jepang} />
                <DetailItem label="Pemahaman SSW" value={selectedCv.kemampuan_pemahaman_ssw} />
                <DetailItem label="Kelincahan" value={selectedCv.kelincahan_dalam_bekerja} />
                <DetailItem label="Kekuatan Tindakan" value={selectedCv.kekuatan_tindakan} />
                <DetailItem label="Bahasa Inggris" value={selectedCv.kemampuan_berbahasa_inggris} />
                <DetailItem label="Kebugaran/Minggu" value={selectedCv.kebugaran_jasmani_seminggu} />

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">KESEDIAAN</h4>
                <DetailItem label="Kerja Shift" value={selectedCv.bersedia_kerja_shift} />
                <DetailItem label="Lembur" value={selectedCv.bersedia_lembur} />
                <DetailItem label="Hari Libur" value={selectedCv.bersedia_hari_libur} />

                <h4 className="font-bold text-blue-600 text-sm mb-2 mt-4 border-b pb-1">RENCANA</h4>
                <DetailItem label="Keluarga di Jepang" value={selectedCv.ada_keluarga_di_jepang} />
                <DetailItem label="Hubungan Keluarga" value={selectedCv.hubungan_keluarga_di_jepang} />
                <DetailItem label="Status Kerabat" value={selectedCv.status_kerabat_di_jepang} />
                <DetailItem label="Ingin Bekerja" value={selectedCv.ingin_bekerja_berapa_tahun} />
                <DetailItem label="Rencana Pulang" value={selectedCv.ingin_pulang_berapa_kali} />
                <DetailItem label="Sumber Biaya" value={selectedCv.rencana_sumber_biaya_keberangkatan} />
                <DetailItem label="Perkiraan Biaya" value={selectedCv.perkiraan_biaya} />
              </div>

              <div className="col-span-full">
                <h4 className="font-bold text-blue-600 text-sm mb-2 border-b pb-1">MOTIVASI</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Kelebihan Diri" value={selectedCv.kelebihan_diri} />
                  <DetailItem label="Komentar Guru (Kelebihan)" value={selectedCv.komentar_guru_kelebihan_diri} />
                  <DetailItem label="Kekurangan Diri" value={selectedCv.kekurangan_diri} />
                  <DetailItem label="Komentar Guru (Kekurangan)" value={selectedCv.komentar_guru_kekurangan_diri} />
                  <DetailItem label="Ketertarikan Jepang" value={selectedCv.ketertarikan_terhadap_jepang} />
                  <DetailItem label="Orang yang Dihormati" value={selectedCv.orang_yang_dihormati} />
                  <DetailItem label="Point Plus" value={selectedCv.point_plus_diri} />
                  <DetailItem label="Keahlian Khusus" value={selectedCv.keahlian_khusus} />
                </div>
              </div>

              <div className="col-span-full">
                <h4 className="font-bold text-blue-600 text-sm mb-2 border-b pb-1">SERTIFIKAT / DOKUMEN</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const files = parseFiles(selectedCv.sertifikat_files)
                    if (files.length === 0) return <span className="text-gray-400 text-sm">Tidak ada file</span>
                    return files.map((file, i) => {
                      const fileName = file.split('/').pop() || `File ${i + 1}`
                      return (
                        <a 
                          key={i} 
                          href={`${UPLOADS_URL}/${file}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          <File size={12} />
                          {fileName.substring(0, 30)}{fileName.length > 30 ? '...' : ''}
                        </a>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="mb-2">
      <p className="text-[10px] text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-medium whitespace-pre-wrap break-words">{value || '-'}</p>
    </div>
  )
}
