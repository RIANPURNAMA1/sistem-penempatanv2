import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

export default function TemplateRirekisho({ data }: CVTemplateProps) {
  const keluarga: any[] = data.keluarga || []
  const ayah   = keluarga.find(k => k.hubungan === 'Ayah')
  const ibu    = keluarga.find(k => k.hubungan === 'Ibu')
  const kakaks = keluarga.filter(k => k.hubungan === 'Kakak')
  const adiks  = keluarga.filter(k => k.hubungan === 'Adik')
  const lainnya = keluarga.filter(k => !['Ayah','Ibu','Kakak','Adik'].includes(k.hubungan))

  // Pecah nama romaji → family name + given name
  const namaArr    = (data.nama_romaji || data.nama || '').split(' ')
  const namaBelakang = namaArr[0] || ''
  const namaDepan    = namaArr.slice(1).join(' ') || ''

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', padding: '16px', background: '#fff', color: '#000' }}>

      {/* ── LAYOUT 2 KOLOM: kiri = form utama, kanan = foto + tabel kecil ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

        {/* ══════════════ KOLOM KIRI ══════════════ */}
        <div style={{ flex: 1 }}>

          {/* ── Nama: Family / Given / Gender ── */}
          <table style={{ ...tbl, width: '450px' }}>
            <thead>
              <tr>
                <td style={{ ...td, textAlign: 'center' }}>姓（FAMILY NAME）</td>
                <td style={{ ...td, textAlign: 'center' }}>名（GIVEN NAME）</td>
                <td style={{ ...td, textAlign: 'center', width: '20px' }}>性別</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...td, height: '50px', textAlign: 'center' }}>{namaBelakang}</td>
                <td style={{ ...td, textAlign: 'center' }}>{namaDepan}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  {data.jenis_kelamin === 'Laki-laki' ? '男' : '女'}
                </td>
              </tr>
              <tr>
                <td style={{ ...td, textAlign: 'center' }}>姓</td>
                <td style={{ ...td, textAlign: 'center' }}>名</td>
                <td style={td}></td>
              </tr>
              <tr>
                <td style={{ ...td, height: '20px', textAlign: 'center' }}>{namaBelakang}</td>
                <td style={{ ...td, textAlign: 'center' }}>{namaDepan}</td>
                <td style={td}></td>
              </tr>
            </tbody>
          </table>

          {/* ── Tanggal Lahir ── */}
          <table style={{ ...tbl, width: '450px', borderTop: 'none' }}>
            <tbody>
              <tr>
                <td style={{ ...td, width: '120px', padding: '6px' }}>生年月日</td>
                <td style={{ ...td, padding: '6px' }}>
                  {data.tanggal_lahir
                    ? (() => {
                        const d = new Date(data.tanggal_lahir)
                        return `${d.getFullYear()} 年 ${String(d.getMonth()+1).padStart(2,'0')} 月 ${String(d.getDate()).padStart(2,'0')} 日`
                      })()
                    : '-'}
                  {data.tempat_lahir && data.umur ? `（${data.tempat_lahir} ・ 満 ${data.umur} 歳）` : ''}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Alamat ── */}
          <table style={{ ...tbl, width: '450px', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={{ ...td, textAlign: 'center', height: '25px' }}>フリガナ</td>
              </tr>
              <tr>
                <td style={{ ...td, height: '60px', padding: '5px' }}>
                  現住所：{data.alamat_lengkap || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Pendidikan ── */}
          <table style={{ ...tbl, width: '450px', marginTop: '12px' }}>
            <thead>
              <tr>
                <td style={{ ...td, textAlign: 'center', height: '25px' }} colSpan={3}>学歴</td>
              </tr>
              <tr>
                <td style={{ ...td, width: '150px', textAlign: 'center' }}>年／月 ～ 年／月</td>
                <td style={{ ...td, width: '200px', textAlign: 'center' }}>学校名</td>
                <td style={{ ...td, width: '100px', textAlign: 'center' }}>学部等</td>
              </tr>
            </thead>
            <tbody>
              {(data.pendidikan?.length > 0 ? data.pendidikan : Array(3).fill(null)).map((p: any, i: number) => (
                <tr key={i}>
                  <td style={{ ...td, height: '30px', textAlign: 'center' }}>
                    {p ? `${p.tahun_masuk || ''} - ${p.tahun_lulus || ''}` : ''}
                  </td>
                  <td style={{ ...td, paddingLeft: '5px' }}>{p?.nama_sekolah || ''}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{p?.jurusan || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ height: '15px' }} />

          {/* ── Pengalaman Kerja ── */}
          <table style={{ ...tbl, width: '450px' }}>
            <thead>
              <tr>
                <td style={{ ...td, textAlign: 'center', height: '25px' }} colSpan={3}>職歴</td>
              </tr>
              <tr>
                <td style={{ ...td, width: '150px', textAlign: 'center' }}>年／月 ～ 年／月</td>
                <td style={{ ...td, width: '200px', textAlign: 'center' }}>会社名</td>
                <td style={{ ...td, width: '100px', textAlign: 'center' }}>職種</td>
              </tr>
            </thead>
            <tbody>
              {(data.pengalaman?.length > 0 ? data.pengalaman : Array(3).fill(null)).map((p: any, i: number) => (
                <tr key={i}>
                  <td style={{ ...td, height: '30px', textAlign: 'center' }}>
                    {p
                      ? `${p.bulan_masuk ? `${p.tahun_masuk}/${p.bulan_masuk}` : (p.tahun_masuk || '')} - ${p.masih_bekerja ? '現在' : (p.bulan_keluar ? `${p.tahun_keluar}/${p.bulan_keluar}` : (p.tahun_keluar || ''))}`
                      : ''}
                  </td>
                  <td style={{ ...td, paddingLeft: '5px' }}>{p?.nama_perusahaan || ''}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{p?.posisi || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Pendapatan Saat Ini ── */}
          <table style={{ ...tbl, width: '450px', borderTop: 'none' }}>
            <tbody>
              <tr>
                <td style={{ ...td, padding: '5px' }}>現在の収入（無職の場合は最終職歴時の収入）</td>
                <td style={{ ...td, width: '60px', textAlign: 'center' }}>万円</td>
              </tr>
            </tbody>
          </table>

          {/* ── Keluarga ── */}
          <table style={{ ...tbl, width: '450px', marginTop: '12px' }}>
            <thead>
              <tr>
                <td style={{ ...td, textAlign: 'center' }} colSpan={4}>家族構成(及び年齢)</td>
              </tr>
            </thead>
            <tbody>
              {/* Ayah */}
              <tr>
                <td style={{ ...td, width: '30px' }}>父</td>
                <td style={{ ...td, width: '180px', height: '20px' }}>{ayah?.nama || ''}</td>
                <td style={{ ...td }}>{ayah?.pekerjaan || ''}</td>
                <td style={{ ...td, width: '30px' }}>{ayah?.usia || ''}</td>
              </tr>
              {/* Ibu */}
              <tr>
                <td style={{ ...td }}>母</td>
                <td style={{ ...td, height: '20px' }}>{ibu?.nama || ''}</td>
                <td style={{ ...td }}>{ibu?.pekerjaan || ''}</td>
                <td style={{ ...td }}>{ibu?.usia || ''}</td>
              </tr>
              {/* Kakak */}
              {kakaks.map((k, i) => (
                <tr key={`kakak-${i}`}>
                  <td style={td}>兄弟(上)</td>
                  <td style={{ ...td, height: '20px' }}>{k.nama || ''}</td>
                  <td style={td}>{k.pekerjaan || ''}</td>
                  <td style={td}>{k.usia || ''}</td>
                </tr>
              ))}
              {/* Adik */}
              {adiks.map((k, i) => (
                <tr key={`adik-${i}`}>
                  <td style={td}>兄弟(下)</td>
                  <td style={{ ...td, height: '20px' }}>{k.nama || ''}</td>
                  <td style={td}>{k.pekerjaan || ''}</td>
                  <td style={td}>{k.usia || ''}</td>
                </tr>
              ))}
              {/* Lainnya (pasangan, anak, dll) */}
              {lainnya.map((k, i) => (
                <tr key={`lain-${i}`}>
                  <td style={td}>{k.hubungan === 'Pasangan' ? '夫/妻' : k.hubungan}</td>
                  <td style={{ ...td, height: '20px' }}>{k.nama || ''}</td>
                  <td style={td}>{k.pekerjaan || ''}</td>
                  <td style={td}>{k.usia || ''}</td>
                </tr>
              ))}
              {/* Pendapatan Keluarga */}
              <tr>
                <td style={{ ...td, textAlign: 'center' }} colSpan={2}>家族の収入</td>
                <td style={td} colSpan={2}>{data.penghasilan_keluarga || ''}</td>
              </tr>
            </tbody>
          </table>

          {/* ── Kelebihan ── */}
          <table style={{ ...tbl, width: '450px', marginTop: '12px' }}>
            <thead>
              <tr>
                <td style={{ ...td, width: '225px', textAlign: 'center' }}>長所</td>
                <td style={{ ...td, width: '225px', textAlign: 'center' }}>先生からのコメント</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...td, height: '20px', textAlign: 'center' }}>{data.kelebihan_diri || '-'}</td>
                <td style={{ ...td, textAlign: 'center' }}></td>
              </tr>
            </tbody>
          </table>

          {/* ── Kekurangan ── */}
          <table style={{ ...tbl, width: '450px', marginTop: '12px' }}>
            <thead>
              <tr>
                <td style={{ ...td, width: '225px', textAlign: 'center' }}>短所</td>
                <td style={{ ...td, width: '225px', textAlign: 'center' }}>先生からのコメント</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...td, height: '20px', textAlign: 'center' }}>{data.kekurangan_diri || '-'}</td>
                <td style={{ ...td, textAlign: 'center' }}></td>
              </tr>
            </tbody>
          </table>

          {/* ── Ketertarikan Jepang ── */}
          <table style={{ ...tbl, width: '450px', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={{ ...td, height: '20px', textAlign: 'center' }}>興味・関心</td>
              </tr>
              <tr>
                <td style={{ ...td, height: '20px', verticalAlign: 'top', padding: '6px' }}>
                  {data.alasan_ke_jepang || data.tujuan_ke_jepang || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Memo / Komentar ── */}
          <table style={{ ...tbl, width: '450px', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={{ ...td, height: '20px', textAlign: 'center' }}>メモ / コメント</td>
              </tr>
              <tr>
                <td style={{ ...td, height: '40px', verticalAlign: 'top', padding: '6px' }}></td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* ══════════════ KOLOM KANAN ══════════════ */}
        <div style={{ flexShrink: 0, width: '260px' }}>

          {/* Foto */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            {data.pas_foto ? (
              <img
                src={data.pas_foto}
                alt="Pas Foto"
                style={{ width: '140px', height: '200px', objectFit: 'cover', display: 'block', border: '1px solid #000' }}
              />
            ) : (
              <div style={{ width: '140px', height: '200px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999', textAlign: 'center' }}>
                写真<br />3×4cm
              </div>
            )}
          </div>

          {/* Tempat Lahir & Agama */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center' }}>
            <tbody>
              <tr>
                <td style={td}>出身地</td>
                <td style={td}>宗教</td>
              </tr>
              <tr>
                <td style={{ ...td, height: '30px' }}>{data.tempat_lahir || '-'}</td>
                <td style={td}>{data.agama || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Status Pernikahan & Anak */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={td}>配偶者の有無</td>
                <td style={td}>子供</td>
              </tr>
              <tr>
                <td style={{ ...td, height: '30px' }}>{data.status_pernikahan || '-'}</td>
                <td style={td}>{data.jumlah_anak ? `${data.jumlah_anak} 人` : '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* SIM */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={td} colSpan={2}>免許</td>
              </tr>
              <tr>
                <td style={{ ...td, height: '20px', width: '40px' }}>{data.sim_dimiliki || '無'}</td>
                <td style={td}>{data.sim_dimiliki ? `(SIM ${data.sim_dimiliki})` : ''}</td>
              </tr>
            </tbody>
          </table>

          {/* Hobi */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '12px' }}>
            <tbody>
              <tr><td style={td}>趣味</td></tr>
              <tr><td style={{ ...td, height: '20px' }}>{data.hobi || '-'}</td></tr>
            </tbody>
          </table>

          {/* Keahlian */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '12px' }}>
            <tbody>
              <tr><td style={td}>特技</td></tr>
              <tr><td style={{ ...td, height: '20px' }}>{data.keahlian || '-'}</td></tr>
            </tbody>
          </table>

          {/* Merokok & Alkohol */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={{ ...td, width: '130px' }}>タバコ</td>
                <td style={{ ...td, width: '130px' }}>飲酒</td>
              </tr>
              <tr>
                <td style={{ ...td, height: '20px' }}>{data.merokok || '-'}</td>
                <td style={td}>{data.minum_alkohol || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Tinggi / Berat / Pinggang / Sepatu */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={td}>身長</td>
                <td style={{ ...td, width: '40px' }}>{data.tinggi_badan || '-'}</td>
                <td style={td}>cm</td>
                <td style={td}>体重</td>
                <td style={{ ...td, width: '40px' }}>{data.berat_badan || '-'}</td>
                <td style={td}>kg</td>
              </tr>
              <tr>
                <td style={td}>腰</td>
                <td style={td}>{data.lingkar_pinggang || '-'}</td>
                <td style={td}>cm</td>
                <td style={td}>靴</td>
                <td style={td}>{data.panjang_telapak_kaki || '-'}</td>
                <td style={td}>cm</td>
              </tr>
            </tbody>
          </table>

          {/* Ukuran Baju / Gol. Darah / Penglihatan / Tangan */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '16px' }}>
            <tbody>
              <tr>
                <td style={td}>{data.ukuran_baju || '-'}</td>
                <td style={td}>服サイズ</td>
                <td style={td}>血液型</td>
                <td style={td}>{data.golongan_darah || '-'}</td>
              </tr>
              <tr>
                <td style={td} rowSpan={2}>視力</td>
                <td style={td}>右：{data.penglihatan_kanan || '-'}</td>
                <td style={td} rowSpan={2}>視力</td>
                <td style={td} rowSpan={2}>{data.penglihatan_kiri || '-'}</td>
              </tr>
              <tr>
                <td style={td}>利き手：{data.tangan_dominan || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Lama Belajar Jepang */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '16px' }}>
            <tbody>
              <tr><td style={td}>日本語学習期間</td></tr>
              <tr><td style={td}>{data.lama_belajar_jepang || '-'}</td></tr>
            </tbody>
          </table>

          {/* Penilaian Kemampuan */}
          <table style={{ ...tbl, width: '260px', textAlign: 'center', marginTop: '16px' }}>
            <tbody>
              <tr>
                <td style={td}>日本語能力</td>
                <td style={td}>{data.level_bahasa_jepang || data.level_jlpt || data.level_jft || '-'}</td>
                <td style={td}>機敏性</td>
                <td style={td}>-</td>
              </tr>
              <tr>
                <td style={td}>忍耐力</td>
                <td style={td}>-</td>
                <td style={td}>行動力</td>
                <td style={td}>-</td>
              </tr>
              <tr>
                <td style={td}>理解力</td>
                <td style={td}>-</td>
                <td style={td}>英語力</td>
                <td style={td}>-</td>
              </tr>
            </tbody>
          </table>

          {/* Ibadah & Tes Fisik */}
          <table style={{ ...tbl, width: '260px', marginTop: '16px', textAlign: 'center' }}>
            <tbody>
              <tr>
                <td style={td}>お祈り</td>
                <td style={{ ...td, width: '140px' }}></td>
              </tr>
              <tr>
                <td style={td}>断食</td>
                <td style={td}></td>
              </tr>
              <tr>
                <td style={td}>実習希望期間</td>
                <td style={td}>{data.lama_tinggal_jepang || ''}</td>
              </tr>
            </tbody>
          </table>

          <table style={{ ...tbl, width: '260px', borderTop: 'none', textAlign: 'center' }}>
            <tbody>
              <tr>
                <td style={{ ...td, writingMode: 'vertical-rl' as any, padding: '5px', width: '20px' }} rowSpan={5}>体力テスト</td>
              </tr>
              <tr><td style={td}>腕立</td></tr>
              <tr><td style={td}>1回目：　回 2回目：　回 3回目：　回</td></tr>
              <tr><td style={td}>スクワット</td></tr>
              <tr><td style={{ ...td, padding: '12px' }}></td></tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  )
}

// ── STYLE HELPERS ──
const tbl: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '10px',
  fontFamily: 'Arial, sans-serif',
}

const td: React.CSSProperties = {
  border: '1px solid #000',
  padding: '2px 4px',
  verticalAlign: 'middle',
  fontSize: '10px',
}