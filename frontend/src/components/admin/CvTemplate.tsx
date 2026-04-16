import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'
import { useRef } from 'react'
import { CvData } from './DataCvTable'

interface CvTemplateProps {
  cv: CvData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mappingAgama: Record<string, string> = {
  'Islam': 'イスラム',
  'Kristen': 'キリスト',
  'Katolik': 'カトリック',
  'Hindu': 'ヒンドゥー',
  'Buddha': '仏教',
  'Konghucu': '儒教',
}

const mappingSertifikat: Record<string, string> = {
  'Pertanian': '農業',
  'Kaigo (perawat)': '介護',
  'Pengolahan Makanan': '飲食料品',
  'Restoran': '外食業',
  'Building Cleaning': 'ビルクリーニング',
  'Driver': '自動車運送業',
  'Hanya JFT': '国際交流基金日本語基礎テスト',
}

export default function CvTemplate({ cv, open, onOpenChange }: CvTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  if (!cv) return null

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}年 ${month}月 ${day}日`
    } catch {
      return dateStr
    }
  }

  const getAge = (usia: string) => {
    return usia ? `${usia} 歳` : '-'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[95vh] overflow-hidden p-0">
        <div className="no-print flex justify-center gap-2 p-3 bg-gray-100 border-b">
          <Button onClick={handlePrint} size="sm" className="bg-green-600 hover:bg-green-700">
            <Printer size={16} className="mr-2" /> 印刷 PDF (Print PDF)
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(95vh-60px)]">
          <div ref={printRef} className="cv-container" style={{ padding: '5px', fontFamily: 'Arial, sans-serif', zoom: 0.85 }}>
            <style>{`
              @media print {
                @page { margin: 2mm; size: A4 portrait; }
                body { margin: 0; padding: 0; }
                * { visibility: hidden; }
                .cv-container, .cv-container * { visibility: visible; }
                .cv-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 2mm; box-sizing: border-box; }
                .no-print, .no-print * { visibility: hidden !important; }
              }
              .cv-container { max-width: 900px; margin: 0 auto; }
              .bg-header { background-color: #a5bfdf; font-size: 8px; }
              .cv-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8px; }
              .cv-table td { border: 1px solid black; padding: 2px; vertical-align: middle; }
              .section-title { font-size: 8px; text-align: center; }
              .small-text { font-size: 7px; }
              .label-text { font-size: 8px; }
              .value-text { font-size: 8px; word-wrap: break-word; }
              .text-center { text-align: center; }
              .print-container { width: 641px; }
            `}</style>

            {/* Header */}
            <div className="text-center mb-1">
              <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px' }}>RIWAYAT HIDUP</div>
              <div style={{ fontSize: '9px', letterSpacing: '1px' }}>実習生経歴書</div>
            </div>

            <div className="flex gap-4">
              {/* Left - Photo */}
              <div style={{ width: '130px', flexShrink: 0 }}>
                {cv.pas_foto_cv && (
                  <img 
                    src={`http://127.0.0.1:8000/${cv.pas_foto_cv}`} 
                    alt="Pas Foto" 
                    style={{ width: '130px', height: '170px', objectFit: 'cover', borderRadius: '2px' }}
                  />
                )}
              </div>

              {/* Right - Info Table */}
              <div style={{ flex: 1 }}>
                <table className="cv-table">
                  <tbody>
                    {/* Row 1 */}
                    <tr>
                      <td className="bg-header text-center" rowSpan={2} style={{ width: '100px' }}>実習生 NOMOR</td>
                      <td rowSpan={2}></td>
                      <td className="bg-header" style={{ width: '130px' }}>身長 TINGGI BADAN</td>
                      <td className="text-center" colSpan={2}>{cv.tinggi_badan || '-'}</td>
                      <td className="text-center" colSpan={2}>CM</td>
                    </tr>
                    <tr>
                      <td className="bg-header">体重 BERAT BADAN</td>
                      <td className="text-center" colSpan={2}>{cv.berat_badan || '-'}</td>
                      <td className="text-center" colSpan={2}>KG</td>
                    </tr>

                    {/* Row 2 */}
                    <tr>
                      <td colSpan={2} className="bg-header text-center">名前 NAMA</td>
                      <td className="bg-header">靴サイズ UKURAN SEPATU</td>
                      <td className="text-center" colSpan={2}>{cv.ukuran_sepatu || '-'}</td>
                      <td className="text-center" colSpan={2}>CM</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-center">{cv.nama_lengkap_katakana || '-'}</td>
                      <td className="bg-header">ウェスト LINGKAR PINGGANG</td>
                      <td className="text-center" colSpan={2}>{cv.ukuran_pinggang || '-'}</td>
                      <td className="text-center" colSpan={2}>CM</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-center">{cv.nama_lengkap_romaji || '-'}</td>
                      <td className="bg-header">血液型 GOLONGAN DARAH</td>
                      <td className="text-center" colSpan={2}>{cv.golongan_darah || '-'}</td>
                      <td className="text-center" colSpan={2}>型</td>
                    </tr>

                    {/* Row 3 - TTL */}
                    <tr>
                      <td colSpan={2} className="bg-header text-center">生年月日 TANGGAL LAHIR</td>
                      <td className="bg-header">視力 PENGLIHATAN</td>
                      <td className="text-center" style={{ width: '30px' }}>右</td>
                      <td className="text-center" style={{ width: '55px' }}>{cv.kemampuan_penglihatan_mata || '-'}</td>
                      <td className="text-center" style={{ width: '30px' }}>左</td>
                      <td className="text-center" style={{ width: '55px' }}>{cv.kemampuan_penglihatan_mata || '-'}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-center">{formatDate(cv.tanggal_lahir || '')}</td>
                      <td className="bg-header">配偶者 STATUS PERNIKAHAN</td>
                      <td className="text-center" colSpan={4}>
                        {cv.status_perkawinan || '-'}
                        {cv.status_perkawinan === 'Sudah Menikah' && '（結婚）'}
                        {cv.status_perkawinan === 'Belum Menikah' && '（未婚）'}
                        {cv.status_perkawinan === 'Bercerai' && '（離婚）'}
                      </td>
                    </tr>

                    {/* Row 4 - Tempat Lahir */}
                    <tr>
                      <td colSpan={2} className="bg-header text-center">出身地 TEMPAT LAHIR</td>
                      <td className="bg-header">宗教 AGAMA</td>
                      <td colSpan={4} className="text-center">
                        {cv.agama || '-'} （{mappingAgama[cv.agama || ''] || '-'}）
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-center">{cv.tempat_lahir || '-'}</td>
                      <td className="bg-header">訪日経験 PERNAH KE JEPANG</td>
                      <td colSpan={4} className="text-center">Tidak （無）</td>
                    </tr>

                    {/* Row 5 - Usia */}
                    <tr>
                      <td className="bg-header text-center">年齢 USIA</td>
                      <td className="text-center">{getAge(cv.usia || '')}</td>
                      <td className="bg-header">旅券の有無 PASPOR</td>
                      <td colSpan={4} className="text-center">TIDAK (無)</td>
                    </tr>

                    {/* Row 6 - Jenis Kelamin */}
                    <tr>
                      <td className="bg-header text-center">性別 JENIS KELAMIN</td>
                      <td className="text-center">
                        {cv.jenis_kelamin || '-'} （{cv.jenis_kelamin === 'Laki-laki' ? '男' : '女'}）
                      </td>
                      <td className="bg-header">利き手 TANGAN DOMINAN</td>
                      <td colSpan={4} className="text-center">
                        {cv.tangan_dominan || '-'} （{cv.tangan_dominan === 'Kanan' ? '右' : '左'}）
                      </td>
                    </tr>

                    {/* Row 7 - HP & Kesehatan */}
                    <tr>
                      <td className="bg-header text-center" rowSpan={3}>携帯電話番号 NO HP</td>
                      <td rowSpan={3} className="text-center">(+62) {cv.no_telepon || '-'}</td>
                      <td className="bg-header">病歴 RIWAYAT PENYAKIT</td>
                      <td colSpan={4} className="text-center">
                        {cv.penyakit_cedera_masa_lalu || 'Tidak Ada'}
                        （{cv.penyakit_cedera_masa_lalu && cv.penyakit_cedera_masa_lalu !== 'Tidak Ada' && cv.penyakit_cedera_masa_lalu !== '-' ? '有' : '無'}）
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-header">タバコ MEROKOK</td>
                      <td colSpan={4} className="text-center">
                        {cv.merokok || '-'} （{cv.merokok === 'Ya' ? '有' : '無'}）
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-header">飲酒 MINUM ALKOHOL</td>
                      <td colSpan={4} className="text-center">
                        {cv.minum_alkohol || '-'} （{cv.minum_alkohol === 'Ya' ? '有' : '無'}）
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alamat */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <tr>
                <td className="bg-header section-title" style={{ border: '1px solid black', padding: '4px' }}>
                  現住所　ALAMAT RUMAH
                </td>
              </tr>
              <tr>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>
                  {cv.alamat_lengkap || '-'}
                </td>
              </tr>
            </table>

            {/* Kontak Darurat */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td className="bg-header label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px', width: '30%' }}>
                  緊急時の連絡先 Informasi Kontak Darurat
                </td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>
                  電話番号　： {cv.no_telepon || '-'}
                </td>
              </tr>
            </table>

            {/* Keluarga */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <tr>
                <td colSpan={5} className="bg-header section-title" style={{ border: '1px solid black', padding: '4px' }}>
                  家族構成 SUSUNAN KELUARGA KANDUNG
                </td>
              </tr>
              <tr className="bg-header">
                <td className="small-text" style={{ width: '15%', border: '1px solid black', borderTop: 'none', padding: '4px' }}>続柄 URUTAN KELUARGA</td>
                <td className="small-text" style={{ width: '30%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>名前 NAMA ANGGOTA KELUARGA</td>
                <td className="small-text" style={{ width: '10%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>年齢 USIA</td>
                <td className="small-text" style={{ width: '25%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>職業 PEKERJAAN</td>
                <td className="small-text" style={{ width: '20%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>月収/円 GAJI</td>
              </tr>
              {/* Ayah */}
              <tr>
                <td className="label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>AYAH （父）</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ayah_nama || 'なし'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ayah_usia ? `${cv.ayah_usia.replace('歳', '').replace(' ', '')} 歳` : 'なし'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ayah_pekerjaan || 'なし'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>なし</td>
              </tr>
              {/* Ibu */}
              <tr>
                <td className="label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>IBU （母）</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ibu_nama || 'なし'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ibu_usia ? `${cv.ibu_usia.replace('歳', '').replace(' ', '')} 歳` : 'なし'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ibu_pekerjaan || 'なし'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>なし</td>
              </tr>
              {/* Kakak */}
              {cv.kakak_nama && cv.kakak_nama !== 'なし' && (
                <tr>
                  <td className="label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>KAKAK（兄）</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.kakak_nama}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.kakak_usia ? `${cv.kakak_usia.replace('歳', '').replace(' ', '')} 歳` : '-'}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.kakak_pekerjaan || '-'}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>-</td>
                </tr>
              )}
              {/* Adik */}
              {cv.adik_nama && cv.adik_nama !== 'なし' && (
                <tr>
                  <td className="label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>ADIK LAKI-LAKI （弟）</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.adik_nama}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.adik_usia ? `${cv.adik_usia.replace('歳', '').replace(' ', '')} 歳` : '-'}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.adik_pekerjaan || '-'}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>-</td>
                </tr>
              )}
              {/* Istri/Suami */}
              {cv.istri_nama && cv.istri_nama !== 'なし' && (
                <tr>
                  <td className="label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>SUAMI / ISTRI（配偶者）</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.istri_nama}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.istri_usia ? `${cv.istri_usia.replace('歳', '').replace(' ', '')} 歳` : '-'}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.istri_pekerjaan || '-'}</td>
                  <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>-</td>
                </tr>
              )}
            </table>

            {/* Informasi Personal */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <tr>
                <td colSpan={2} className="bg-header section-title" style={{ border: '1px solid black', padding: '4px' }}>
                  個人情報　INFORMASI PERSONAL
                </td>
              </tr>
              <tr>
                <td className="bg-header label-text" style={{ width: '20%', border: '1px solid black', borderTop: 'none', padding: '4px' }}>自己ＰＲ　PROMOSI DIRI</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.point_plus_diri || '-'}</td>
              </tr>
              <tr>
                <td className="bg-header label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>日本へ行く目的　TUJUAN KE JEPANG</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ketertarikan_terhadap_jepang || '-'}</td>
              </tr>
              <tr>
                <td className="bg-header label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>長所　KELEBIHAN</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.kelebihan_diri || '-'}</td>
              </tr>
              <tr>
                <td className="bg-header label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>短所　KEKURANGAN</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.kekurangan_diri || '-'}</td>
              </tr>
              <tr>
                <td className="bg-header label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>特技 KEHALIAN KHUSUS</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.keahlian_khusus || '-'}</td>
              </tr>
              <tr>
                <td className="bg-header label-text" style={{ border: '1px solid black', borderTop: 'none', padding: '4px' }}>趣味　HOBI</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.hobi || '-'}</td>
              </tr>
            </table>

            {/* Sertifikat */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <tr>
                <td colSpan={6} className="bg-header section-title" style={{ border: '1px solid black', padding: '4px' }}>
                  面鏡・資格　SERTIFIKAT YANG DIMILIKI
                </td>
              </tr>
              <tr>
                <td className="bg-header label-text" style={{ width: '15%', border: '1px solid black', borderTop: 'none', padding: '4px' }}>日本語能力試験 JLPT</td>
                <td className="value-text" style={{ width: '10%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>ADA (有）</td>
                <td className="value-text" style={{ width: '15%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>JFT {cv.kemampuan_bahasa_jepang || '-'}</td>
                <td className="bg-header label-text" style={{ width: '20%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>運転免許　SURAT IZIN MENGEMUDI</td>
                <td className="value-text" style={{ width: '15%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>
                  {cv.surat_izin_mengemudi || '-'} （{cv.surat_izin_mengemudi === 'Ada' ? '有' : '無'}）
                </td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>
                  {cv.bidang_sertifikasi || '-'} （{mappingSertifikat[cv.bidang_sertifikasi || ''] || '-'}）
                </td>
              </tr>
            </table>

            {/* Keluarga di Jepang */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <tr>
                <td colSpan={5} className="bg-header section-title" style={{ border: '1px solid black', padding: '4px' }}>
                  在日親戚・知人　KERABAT / KENALAN DI JEPANG
                </td>
              </tr>
              <tr className="bg-header">
                <td className="small-text" style={{ width: '20%', border: '1px solid black', borderTop: 'none', padding: '4px' }}>名前 NAMA</td>
                <td className="small-text" style={{ width: '20%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>関係　HUBUNGAN</td>
                <td className="small-text" style={{ width: '20%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>職業 PEKERJAAN</td>
                <td className="small-text" style={{ width: '15%', border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>年齢 USIA</td>
                <td className="small-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>日本の住所 ALAMAT DI JEPANG</td>
              </tr>
              <tr>
                <td className="value-text" style={{ height: '25px', border: '1px solid black', borderTop: 'none', padding: '4px' }}>{cv.ada_keluarga_di_jepang === 'Ya' ? cv.hubungan_keluarga_di_jepang : 'なし'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>{cv.ada_keluarga_di_jepang === 'Ya' ? cv.hubungan_keluarga_di_jepang : '-'}</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>-</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>-</td>
                <td className="value-text" style={{ border: '1px solid black', borderTop: 'none', borderLeft: 'none', padding: '4px' }}>-</td>
              </tr>
            </table>

            {/* Catatan Tambahan */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <tr>
                <td colSpan={5} className="bg-header section-title" style={{ border: '1px solid black', padding: '4px' }}>
                  付記　CATATAN TAMBAHAN
                </td>
              </tr>
              <tr>
                <td style={{ height: '40px', border: '1px solid black', borderTop: 'none', padding: '4px' }}></td>
              </tr>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
