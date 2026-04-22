import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

export default function TemplateKaigo({ data }: CVTemplateProps) {
  const today = new Date()
  const dateStr = `${today.getFullYear()}年 ${today.getMonth() + 1}月 ${today.getDate()}日現在`

  const cellStyle = {
    border: '1px solid #333',
    padding: '6px',
    fontSize: '10px',
    textAlign: 'left' as const,
  }

  const headerCell = {
    ...cellStyle,
    backgroundColor: '#DBEEF3',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  }

  const labelCell = {
    ...cellStyle,
    backgroundColor: '#DBEEF3',
    fontWeight: 'bold' as const,
    width: '100px',
  }

  return (
    <div
      style={{
        fontFamily: '"MS Gothic", "Yu Gothic", "Meiryo", sans-serif',
        padding: '20px',
        background: '#ffffff',
        color: '#333',
        maxWidth: '900px',
        margin: '0 auto',
        fontSize: '10px',
      }}
    >
      {/* ===== HEADER ===== */}
      <div style={{ marginBottom: '4px' }}>
        <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>面談シート</h1>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '12px' }}>
        {dateStr}
      </div>

      {/* ===== MAIN LAYOUT: LEFT + RIGHT ===== */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

        {/* ===== LEFT COLUMN ===== */}
        <div style={{ flex: 1 }}>

          {/* Personal Information Table */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            {/* Photo top-right */}
            <div style={{ position: 'absolute', right: '-120px', top: 0 }}>
              {data.pas_foto ? (
                <img
                  src={data.pas_foto}
                  alt="Pas Foto"
                  style={{ width: '100px', height: '150px', objectFit: 'cover', border: '1px solid #000' }}
                />
              ) : (
                <div style={{ width: '100px', height: '150px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', flexDirection: 'column', textAlign: 'center' }}>
                  写真<br />3×4cm
                </div>
              )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
              <tbody>
                <tr>
                  <td style={labelCell}>ふりがな</td>
                  <td colSpan={5} style={cellStyle}>{data.nama_katakana || '-'}</td>
                </tr>
                <tr>
                  <td style={labelCell}>氏　名</td>
                  <td colSpan={5} style={{ ...cellStyle, height: '60px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
                    {data.nama_romaji || data.nama || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>国籍</td>
                  <td style={cellStyle}>Indonesia</td>
                  <td style={headerCell}>生年月日</td>
                  <td style={cellStyle}>{data.tanggal_lahir ? formatDate(data.tanggal_lahir) : '-'}</td>
                  <td style={headerCell}>年齢</td>
                  <td style={cellStyle}>{data.umur || '-'}歳</td>
                </tr>
                <tr>
                  <td style={labelCell}>性別</td>
                  <td colSpan={5} style={cellStyle}>{data.jenis_kelamin || '-'}</td>
                </tr>
                <tr>
                  <td style={labelCell}>ふりがな</td>
                  <td colSpan={3} style={cellStyle}>{data.nama_katakana || '-'}</td>
                  <td style={headerCell} colSpan={2}>国外・国内</td>
                </tr>
                <tr>
                  <td style={labelCell} rowSpan={2}>現住所</td>
                  <td colSpan={3} rowSpan={2} style={cellStyle}>{data.alamat_lengkap || '-'}</td>
                  <td style={headerCell}>在留資格</td>
                  <td style={cellStyle}>―</td>
                </tr>
                <tr>
                  <td style={headerCell}>在留期限</td>
                  <td style={cellStyle}>―</td>
                </tr>
                <tr>
                  <td style={labelCell}>血液型</td>
                  <td style={cellStyle}>{data.golang_darah || '-'}</td>
                  <td style={headerCell}>服サイズ</td>
                  <td style={cellStyle}>{data.ukuran_atasan || '-'}</td>
                  <td style={headerCell} colSpan={1}>結婚</td>
                  <td style={cellStyle}>{data.status_perkawinan || '-'}</td>
                </tr>
                <tr>
                  <td style={labelCell}>身長</td>
                  <td style={cellStyle}>{data.tinggi_badan || '-'}cm</td>
                  <td style={headerCell}>ズボンサイズ</td>
                  <td style={cellStyle}>{data.ukuran_celana || '-'}</td>
                  <td style={headerCell} rowSpan={2} colSpan={1}>家族構成</td>
                  <td style={{ ...cellStyle, verticalAlign: 'top' }} rowSpan={2}>
                    {data.keluarga?.length > 0
                      ? data.keluarga.map((k: any) => `${k.hubungan}(${k.nama})`).join('・')
                      : '自分・母・父'}
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>体重</td>
                  <td style={cellStyle}>{data.berat_badan || '-'}kg</td>
                  <td style={headerCell}>靴サイズ</td>
                  <td style={cellStyle}>{data.ukuran_sepatu || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Education History */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th colSpan={2} style={headerCell}>年・月</th>
                <th colSpan={3} style={headerCell}>学　歴</th>
                <th colSpan={2} style={headerCell}>学部・学科</th>
              </tr>
            </thead>
            <tbody>
              {data.pendidikan?.length > 0 ? (
                data.pendidikan.map((p: any, i: number) => (
                  <tr key={i}>
                    <td colSpan={2} style={{ ...cellStyle, textAlign: 'center' }}>
                      {p.tahun_masuk || '-'} - {p.tahun_lulus || '-'}
                    </td>
                    <td colSpan={3} style={cellStyle}>{p.nama_sekolah || '-'}　卒業</td>
                    <td colSpan={2} style={cellStyle}>{p.jurusan || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ ...cellStyle, height: '28px' }}></td>
                  <td colSpan={3} style={cellStyle}></td>
                  <td colSpan={2} style={cellStyle}></td>
                </tr>
              )}
              {/* Empty rows */}
              {[...Array(2)].map((_, i) => (
                <tr key={`edu-empty-${i}`}>
                  <td colSpan={2} style={{ ...cellStyle, height: '28px' }}></td>
                  <td colSpan={3} style={cellStyle}></td>
                  <td colSpan={2} style={cellStyle}></td>
                </tr>
              ))}

              {/* Work History Header */}
              <tr>
                <th colSpan={2} style={headerCell}>年・月</th>
                <th colSpan={3} style={headerCell}>職　歴</th>
                <th colSpan={2} style={headerCell}>職種</th>
              </tr>

              {data.pengalaman?.length > 0 ? (
                data.pengalaman.map((p: any, i: number) => (
                  <tr key={i}>
                    <td colSpan={2} style={{ ...cellStyle, textAlign: 'center' }}>
                      {p.tahun_masuk || '-'} - {p.masih_bekerja ? '現在' : (p.tahun_keluar || '-')}
                    </td>
                    <td colSpan={3} style={cellStyle}>{p.nama_perusahaan || '-'}　退職</td>
                    <td colSpan={2} style={cellStyle}>{p.posisi || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ ...cellStyle, height: '28px' }}></td>
                  <td colSpan={3} style={cellStyle}></td>
                  <td colSpan={2} style={cellStyle}></td>
                </tr>
              )}
              {/* Empty rows */}
              {[...Array(6)].map((_, i) => (
                <tr key={`exp-empty-${i}`}>
                  <td colSpan={2} style={{ ...cellStyle, height: '28px' }}></td>
                  <td colSpan={3} style={cellStyle}></td>
                  <td colSpan={2} style={cellStyle}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div style={{ width: '340px', flexShrink: 0, marginTop: '60px' }}>

          {/* License & Qualifications Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th colSpan={2} style={headerCell}>年・月</th>
                <th style={headerCell}>免許・資格</th>
              </tr>
            </thead>
            <tbody>
              {/* JLPT */}
              {data.level_jlpt && (
                <tr>
                  <td style={{ ...cellStyle, width: '20%', textAlign: 'center' }}>{today.getFullYear()}</td>
                  <td style={{ ...cellStyle, width: '15%', textAlign: 'center' }}>{today.getMonth() + 1}</td>
                  <td style={cellStyle}>JLPT {data.level_jlpt}　取得</td>
                </tr>
              )}
              {/* SIM */}
              <tr>
                <td style={{ ...cellStyle, width: '20%', textAlign: 'center' }}>{today.getFullYear()}</td>
                <td style={{ ...cellStyle, width: '15%', textAlign: 'center' }}>{today.getMonth() + 1}</td>
                <td style={cellStyle}>
                  {data.sim_dimiliki ? `${data.sim_dimiliki}　取得` : 'Tidak memiliki SIM'}
                </td>
              </tr>
              {/* Empty rows */}
              {[...Array(7)].map((_, i) => (
                <tr key={`lic-empty-${i}`}>
                  <td style={{ ...cellStyle, height: '26px', width: '20%' }}></td>
                  <td style={{ ...cellStyle, width: '15%' }}></td>
                  <td style={cellStyle}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Skills & Specialties Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th style={{ ...headerCell, width: '50%' }}>特技・経験</th>
                <th style={{ ...headerCell, width: '25%' }}>応募職種</th>
                <th style={{ ...headerCell, width: '25%' }}>利き手</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={7} style={{ ...cellStyle, verticalAlign: 'top', padding: '10px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>【やってきた作業】</div>
                    <div>{data.pekerjaan_dilakukan || ''}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>【扱ってきた材料】</div>
                    <div>{data.material_digunakan || ''}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>【やってきた現場】</div>
                    <div>{data.tempat_kerja || ''}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>【操作できる重機】</div>
                    <div>{data.alat_berat || ''}</div>
                  </div>
                </td>
                <td colSpan={2} style={{ ...cellStyle, textAlign: 'center' }}>
                  {data.bidang_sertifikasi || '左・右'}
                </td>
              </tr>
              <tr>
                <td style={headerCell}>矯正視力</td>
                <td style={headerCell}>聴力異常</td>
              </tr>
              <tr>
                <td style={{ ...cellStyle, textAlign: 'center' }}>{data.penglihatan_kanan || '有・無'}</td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>{data.kemampuan_pendengaran || '有・無'}</td>
              </tr>
              <tr>
                <td colSpan={2} style={headerCell}>宗教</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...cellStyle, padding: '10px', textAlign: 'center' }}>
                  {data.agama || '—'}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={headerCell}>趣味</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...cellStyle, padding: '10px', textAlign: 'center' }}>
                  {data.hobi || '—'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Comment Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={headerCell}>コメント</td>
              </tr>
              <tr>
                <td style={{ ...cellStyle, height: '120px', verticalAlign: 'top', padding: '8px' }}>
                  {data.komentar_guru_kelebihan_diri || data.kelebihan_diri || '—'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Motivation Section (mapped from original motivasi section) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <tbody>
              <tr>
                <td colSpan={2} style={headerCell}>日本に行く目的・動機</td>
              </tr>
              <tr>
                <td style={labelCell}>目的</td>
                <td style={cellStyle}>{data.tujuan_ke_jepang || '-'}</td>
              </tr>
              <tr>
                <td style={labelCell}>理由</td>
                <td style={cellStyle}>{data.alasan_ke_jepang || '-'}</td>
              </tr>
              <tr>
                <td style={labelCell}>長所</td>
                <td style={cellStyle}>{data.kelebihan_diri || '-'}</td>
              </tr>
              <tr>
                <td style={labelCell}>短所</td>
                <td style={cellStyle}>{data.kekurangan_diri || '-'}</td>
              </tr>
              <tr>
                <td style={labelCell}>目標</td>
                <td style={cellStyle}>{data.cita_cita_setelah_jepang || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* JLPT / JFT */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <tbody>
              <tr>
                <td colSpan={4} style={headerCell}>日本語能力</td>
              </tr>
              <tr>
                <td style={headerCell}>JLPT</td>
                <td style={cellStyle}>{data.level_jlpt || '-'}</td>
                <td style={headerCell}>JFT</td>
                <td style={cellStyle}>{data.level_jft || '-'}</td>
              </tr>
              <tr>
                <td style={headerCell}>学習期間</td>
                <td style={cellStyle}>{data.lama_belajar_jepang || '-'}</td>
                <td style={headerCell}>特技</td>
                <td style={cellStyle}>{data.keahlian || '-'}</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  )
}