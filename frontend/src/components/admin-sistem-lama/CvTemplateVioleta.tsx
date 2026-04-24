import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useRef } from 'react'
import { CvData } from './DataCvTable'

const UPLOADS_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads` : 'https://api.penempatan.mendunia.id/uploads'

interface CvTemplateVioletaProps {
  cv: CvData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CvTemplateVioleta({ cv, open, onOpenChange }: CvTemplateVioletaProps) {
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

  const splitName = (name: string) => {
    if (!name) return { familyName: '', givenName: '' }
    const parts = name.split(' ')
    return {
      familyName: parts[0] || '',
      givenName: parts.slice(1).join(' ') || ''
    }
  }

  const { familyName, givenName } = splitName(cv.nama_lengkap_romaji || '')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[95vh] overflow-hidden p-0">
        <div className="no-print flex justify-center gap-2 p-3 bg-gray-100 border-b">
          <Button onClick={handlePrint} size="sm" className="bg-green-600 hover:bg-green-700">
            <Printer size={16} className="mr-2" /> 印刷 PDF (Print PDF)
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(95vh-60px)] p-4">
          <div ref={printRef} className="cv-violeta-container" style={{ fontFamily: 'Arial, sans-serif' }}>
            <style>{`
              @media print {
                .no-print { display: none !important; }
                @page { margin: 5mm; size: auto; }
              }
              .cv-violeta-container { max-width: 850px; margin: 0 auto; }
              .border-table { border-collapse: collapse; width: 100%; }
              .border-table td, .border-table th { border: 1px solid #000; padding: 2px 4px; vertical-align: top; font-size: 10px; }
              .text-center { text-align: center; }
              .text-left { text-align: left; }
              .w-full { width: 100%; }
              .p-1 { padding: 4px; }
              .mt-1 { margin-top: 4px; }
              .mt-2 { margin-top: 8px; }
            `}</style>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* LEFT COLUMN */}
              <div style={{ flex: '0 0 450px' }}>
                {/* Nama */}
                <table className="border-table" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <td style={{ textAlign: 'center', width: '33%' }}>姓（FAMILY NAME）</td>
                      <td style={{ textAlign: 'center', width: '50%' }}>名（GIVEN NAME）</td>
                      <td style={{ textAlign: 'center', width: '17%' }}>性別</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td rowSpan={2} style={{ height: '50px', textAlign: 'center', verticalAlign: 'middle' }}>{familyName}</td>
                      <td rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>{givenName}</td>
                      <td rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {cv.jenis_kelamin === 'Laki-laki' ? '男' : '女'}
                      </td>
                    </tr>
                    <tr></tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>姓</td>
                      <td style={{ textAlign: 'center' }}>名</td>
                    </tr>
                    <tr>
                      <td style={{ height: '20px', textAlign: 'center' }}>{familyName}</td>
                      <td style={{ textAlign: 'center' }}>{givenName}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Tanggal Lahir */}
                <table className="border-table" style={{ width: '450px', borderCollapse: 'collapse', borderTop: 'none' }}>
                  <tr>
                    <td style={{ width: '120px' }}>生年月日</td>
                    <td>
                      {formatDate(cv.tanggal_lahir || '')} （{cv.tempat_lahir || '-'} ・ 満 {cv.usia || '-'} 歳）
                    </td>
                  </tr>
                </table>

                {/* Alamat */}
                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <td style={{ textAlign: 'center', height: '20px' }}>フリガナ</td>
                    </tr>
                    <tr>
                      <td style={{ height: '60px', paddingLeft: '5px' }}>
                        現住所：{cv.alamat_lengkap || '-'}<br/>
                        {cv.kelurahan || '-'}, {cv.kecamatan || '-'}<br/>
                        {cv.kabupaten || '-'}, {cv.provinsi || '-'}
                      </td>
                    </tr>
                  </thead>
                </table>

                {/* Pendidikan */}
                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', height: '20px' }}>学歴</td>
                    </tr>
                    <tr>
                      <td style={{ width: '120px', textAlign: 'center' }}>年／月 ～ 年／月</td>
                      <td style={{ width: '230px', textAlign: 'center' }}>学校名</td>
                      <td style={{ textAlign: 'center' }}>学部等</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ height: '25px' }}></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style={{ height: '25px' }}></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style={{ height: '25px' }}></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Pengalaman Kerja */}
                <div style={{ height: '8px' }}></div>
                <table className="border-table" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', height: '20px' }}>職歴</td>
                    </tr>
                    <tr>
                      <td style={{ width: '120px', textAlign: 'center' }}>年／月 ～ 年／月</td>
                      <td style={{ width: '230px', textAlign: 'center' }}>会社名</td>
                      <td style={{ textAlign: 'center' }}>職種</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ height: '25px' }}></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style={{ height: '25px' }}></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style={{ height: '25px' }}></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Income */}
                <table className="border-table" style={{ width: '450px', borderCollapse: 'collapse', borderTop: 'none' }}>
                  <tr>
                    <td>現在の収入（無職の場合は最終職歴時の収入）</td>
                    <td style={{ width: '60px', textAlign: 'center' }}>万円</td>
                  </tr>
                </table>

                {/* Keluarga */}
                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center' }}>家族構成(及び年齢)</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ width: '30px' }}>父</td>
                      <td>{cv.ayah_nama || '-'}</td>
                      <td style={{ width: '60px' }}>{cv.ayah_pekerjaan || '-'}</td>
                      <td style={{ width: '30px' }}>{cv.ayah_usia || '-'}</td>
                    </tr>
                    <tr>
                      <td>母</td>
                      <td>{cv.ibu_nama || '-'}</td>
                      <td>{cv.ibu_pekerjaan || '-'}</td>
                      <td>{cv.ibu_usia || '-'}</td>
                    </tr>
                    {cv.istri_nama && (
                      <tr>
                        <td>夫/妻</td>
                        <td>{cv.istri_nama}</td>
                        <td>{cv.istri_pekerjaan || '-'}</td>
                        <td>{cv.istri_usia || '-'}</td>
                      </tr>
                    )}
                    {cv.anak_nama && (
                      <tr>
                        <td>子</td>
                        <td>{cv.anak_nama}</td>
                        <td>{cv.anak_pendidikan || '-'}</td>
                        <td>{cv.anak_usia || '-'}</td>
                      </tr>
                    )}
                    {cv.kakak_nama && (
                      <tr>
                        <td>兄弟(上)</td>
                        <td>{cv.kakak_nama}</td>
                        <td>{cv.kakak_pekerjaan || '-'}</td>
                        <td>{cv.kakak_usia || '-'}</td>
                      </tr>
                    )}
                    {cv.adik_nama && (
                      <tr>
                        <td>兄弟(下)</td>
                        <td>{cv.adik_nama}</td>
                        <td>{cv.adik_pekerjaan || '-'}</td>
                        <td>{cv.adik_usia || '-'}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={2}>家族の収入</td>
                      <td colSpan={2}>{cv.rata_rata_penghasilan_keluarga || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Kelebihan & Kekurangan */}
                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <td style={{ width: '50%', textAlign: 'center' }}>長所</td>
                      <td style={{ textAlign: 'center' }}>先生からのコメント</td>
                    </tr>
                    <tr>
                      <td style={{ height: '30px', textAlign: 'center', verticalAlign: 'top' }}>{cv.kelebihan_diri || '-'}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{cv.komentar_guru_kelebihan_diri || '-'}</td>
                    </tr>
                  </thead>
                </table>

                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <td style={{ width: '50%', textAlign: 'center' }}>短所</td>
                      <td style={{ textAlign: 'center' }}>先生からのコメント</td>
                    </tr>
                    <tr>
                      <td style={{ height: '30px', textAlign: 'center', verticalAlign: 'top' }}>{cv.kekurangan_diri || '-'}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{cv.komentar_guru_kekurangan_diri || '-'}</td>
                    </tr>
                  </thead>
                </table>

                {/* Minat */}
                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center', height: '20px' }}>興味・関心</td>
                  </tr>
                  <tr>
                    <td style={{ height: '40px', verticalAlign: 'top', padding: '4px' }}>{cv.ketertarikan_terhadap_jepang || '-'}</td>
                  </tr>
                </table>

                {/* Orang yang dihormati */}
                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center', height: '20px' }}>尊敬する人(及びその理由)</td>
                  </tr>
                  <tr>
                    <td style={{ height: '40px', verticalAlign: 'top', padding: '4px' }}>{cv.orang_yang_dihormati || '-'}</td>
                  </tr>
                </table>

                {/* Komentar */}
                <table className="border-table mt-1" style={{ width: '450px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center', height: '20px' }}>メモ / コメント</td>
                  </tr>
                  <tr>
                    <td style={{ height: '60px', verticalAlign: 'top', padding: '4px' }}>
                      {cv.komentar_guru_kelebihan_diri || '-'}<br/><br/>
                      {cv.komentar_guru_kekurangan_diri || '-'}
                    </td>
                  </tr>
                </table>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ flex: '0 0 260px' }}>
                {/* Foto */}
                <div style={{ position: 'relative', width: '140px', height: '200px' }}>
                  {cv.pas_foto_cv ? (
                    <img 
                      src={`${UPLOADS_URL}/${cv.pas_foto_cv}`} 
                      alt="Foto" 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '200px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                      Tidak ada foto
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '-8px', right: '-20px', fontSize: '10px' }}>
                    {cv.id}
                  </div>
                </div>

                {/* Asal & Agama */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>出身地</td>
                    <td style={{ textAlign: 'center' }}>宗教</td>
                  </tr>
                  <tr>
                    <td style={{ height: '25px', textAlign: 'center' }}>{cv.tempat_lahir || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {cv.agama || '-'}{cv.agama_lainnya && `(${cv.agama_lainnya})`}
                    </td>
                  </tr>
                </table>

                {/* Status & Anak */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>配偶者の有無</td>
                    <td style={{ textAlign: 'center' }}>子供</td>
                  </tr>
                  <tr>
                    <td style={{ height: '25px', textAlign: 'center' }}>{cv.status_perkawinan || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{cv.anak_nama || '-'}</td>
                  </tr>
                </table>

                {/* SIM */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>免許</td>
                  </tr>
                  <tr>
                    <td style={{ height: '20px' }}>
                      {cv.surat_izin_mengemudi === 'Ada' ? '有' : '無'}
                      {cv.surat_izin_mengemudi === 'Ada' && cv.jenis_sim && ` (${cv.jenis_sim})`}
                    </td>
                  </tr>
                </table>

                {/* Hobi */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>趣味</td>
                  </tr>
                  <tr>
                    <td style={{ height: '25px' }}>{cv.hobi || '-'}</td>
                  </tr>
                </table>

                {/* Keahlian */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>特技</td>
                  </tr>
                  <tr>
                    <td style={{ height: '40px', padding: '4px' }}>{cv.keahlian_khusus || '-'}</td>
                  </tr>
                </table>

                {/* Merokok & Minum */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>タバコ</td>
                    <td style={{ textAlign: 'center' }}>飲酒</td>
                  </tr>
                  <tr>
                    <td style={{ height: '20px' }}>{cv.merokok === 'Ya' ? '有' : '無'}</td>
                    <td>{cv.minum_alkohol === 'Ya' ? '有' : '無'}</td>
                  </tr>
                </table>

                {/* Physical */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td>身長</td>
                    <td style={{ width: '40px', textAlign: 'center' }}>{cv.tinggi_badan || '-'}</td>
                    <td>cm</td>
                    <td>体重</td>
                    <td style={{ width: '40px', textAlign: 'center' }}>{cv.berat_badan || '-'}</td>
                    <td>kg</td>
                  </tr>
                  <tr>
                    <td>腰</td>
                    <td style={{ textAlign: 'center' }}>{cv.ukuran_pinggang || '-'}</td>
                    <td>cm</td>
                    <td>靴</td>
                    <td style={{ textAlign: 'center' }}>{cv.ukuran_sepatu || '-'}</td>
                    <td>cm</td>
                  </tr>
                </table>

                {/* Ukuran */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ width: '33%' }}>{cv.ukuran_atasan_baju || ''}</td>
                    <td>服サイズ</td>
                    <td style={{ width: '33%' }}>{cv.golongan_darah || ''}</td>
                    <td>血液型</td>
                  </tr>
                  <tr>
                    <td rowSpan={2}>視力</td>
                    <td>右：{cv.tangan_dominan || ''}</td>
                    <td rowSpan={2}>視力</td>
                    <td rowSpan={2}>{cv.kemampuan_penglihatan_mata || ''}</td>
                  </tr>
                  <tr>
                    <td>利き手：{cv.tangan_dominan || ''}</td>
                  </tr>
                </table>

                {/* Bahasa Jepang */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center' }}>日本語学習期間</td>
                  </tr>
                  <tr>
                    <td colSpan={2}>{cv.lama_belajar_di_mendunia || '-'}</td>
                  </tr>
                </table>

                {/* Kemampuan */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td>日本語能力</td>
                    <td>{cv.kemampuan_bahasa_jepang || '-'}</td>
                    <td>機敏性</td>
                    <td>{cv.kelincahan_dalam_bekerja || '-'}</td>
                  </tr>
                  <tr>
                    <td>忍耐力</td>
                    <td>A</td>
                    <td>行動力</td>
                    <td>{cv.kekuatan_tindakan || '-'}</td>
                  </tr>
                  <tr>
                    <td>理解力</td>
                    <td>{cv.kemampuan_pemahaman_ssw || '-'}</td>
                    <td>英語力</td>
                    <td>{cv.kemampuan_berbahasa_inggris || '-'}</td>
                  </tr>
                </table>

                {/* Doa, Puasa, Harapan */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td>お祈り</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>断食</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>実習希望期間</td>
                    <td></td>
                  </tr>
                </table>

                {/* Fitness Test */}
                <table className="border-table mt-1" style={{ width: '260px', borderCollapse: 'collapse', borderTop: 'none' }}>
                  <tr>
                    <td rowSpan={5} style={{ writingMode: 'vertical-rl', width: '20px' }}>体力テスト</td>
                  </tr>
                  <tr>
                    <td>腕立</td>
                  </tr>
                  <tr>
                    <td>1回目:___回 2回目:___回 3回目:___回</td>
                  </tr>
                  <tr>
                    <td>スクワット</td>
                  </tr>
                  <tr>
                    <td style={{ height: '40px' }}></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
