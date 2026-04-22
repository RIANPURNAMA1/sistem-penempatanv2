import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

export default function TemplateNawasena({ data }: CVTemplateProps) {
  const cellStyle = {
    border: '1px solid #000',
    padding: '6px',
    fontSize: '12px',
    verticalAlign: 'top' as const,
  }

  const headerGreen = {
    ...cellStyle,
    backgroundColor: 'rgb(213, 228, 197)',
    fontWeight: 'bold' as const,
  }

  const headerGreenCenter = {
    ...headerGreen,
    textAlign: 'center' as const,
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '0',
  }

  return (
    <div
      style={{
        fontFamily: '"MS Gothic", "Yu Gothic", "Meiryo", sans-serif',
        padding: '20px',
        background: '#ffffff',
        color: '#000',
        maxWidth: '900px',
        margin: '0 auto',
        fontSize: '12px',
      }}
    >
      {/* ===== TOP: Nama + Foto ===== */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '0' }}>
        <div style={{ flex: 1 }}>
          {/* Nama & Furigana */}
          <table style={{ ...tableStyle, width: '520px' }}>
            <tbody>
              <tr>
                <td colSpan={2} style={cellStyle}>
                  フリガナ : {data.nama_katakana || '-'}
                </td>
              </tr>
              <tr>
                <td rowSpan={2} style={cellStyle}>
                  名前 : {data.nama_romaji || data.nama || '-'}
                </td>
                <td style={{ ...cellStyle, width: '20%' }}>性別</td>
              </tr>
              <tr>
                <td style={{ ...cellStyle, width: '20%' }}>{data.jenis_kelamin || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Tanggal Lahir */}
          <table style={{ ...tableStyle, width: '520px', height: '60px' }}>
            <tbody>
              <tr>
                <td style={cellStyle}>生年月日</td>
                <td style={{ ...cellStyle, width: '340px' }}>
                  {data.tanggal_lahir ? formatDate(data.tanggal_lahir) : '-'}
                </td>
              </tr>
              <tr>
                <td style={cellStyle}>ふりがな</td>
                <td style={cellStyle}>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Foto */}
        <div style={{ flexShrink: 0 }}>
          {data.pas_foto ? (
            <img
              src={data.pas_foto}
              alt="Pas Foto"
              style={{ width: '120px', height: '150px', objectFit: 'cover', border: '1px solid #000', display: 'block' }}
            />
          ) : (
            <div style={{ width: '120px', height: '150px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', flexDirection: 'column', textAlign: 'center' }}>
              写真<br />3×4cm
            </div>
          )}
        </div>
      </div>

      {/* ===== ALAMAT & TELEPON ===== */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...cellStyle, width: '20%' }}>現住所</td>
            <td rowSpan={2} style={cellStyle}>
              {data.alamat_lengkap || '-'}<br />
              {[data.kelurahan, data.kecamatan, data.kabupaten, data.provinsi].filter(Boolean).join(', ') || '-'}
            </td>
            <td style={{ ...cellStyle, width: '30%', textAlign: 'center' }}>携帯電話番号</td>
          </tr>
          <tr>
            <td style={cellStyle}>{data.nomor_hp || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== KELUARGA / PASANGAN ===== */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...cellStyle, width: '20%' }}>家族</td>
            <td style={cellStyle}>配偶者</td>
            <td style={cellStyle}>子供</td>
            <td style={{ ...cellStyle, width: '30%' }}>メールアドレス</td>
          </tr>
          <tr>
            <td style={cellStyle}>{data.istri_nama || data.pasangan_nama || '-'}</td>
            <td style={cellStyle}>{data.anak_nama || '-'}</td>
            <td style={cellStyle}>{data.email || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== PENDIDIKAN ===== */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...headerGreenCenter, width: '20%' }}>入学年</td>
            <td style={{ ...headerGreenCenter, width: '20%' }}>卒業年</td>
            <td style={{ ...headerGreenCenter }}>学歴（高校卒業以降）</td>
          </tr>
          {data.pendidikan?.length > 0 ? (
            data.pendidikan.map((p: any, i: number) => (
              <tr key={i}>
                <td style={{ ...cellStyle, textAlign: 'center' }}>{p.tahun_masuk || '-'}</td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>{p.tahun_lulus || '-'}</td>
                <td style={cellStyle}>{p.nama_sekolah || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ ...cellStyle, height: '28px' }}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== PENGALAMAN KERJA ===== */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...headerGreenCenter, width: '20%' }}>入社日</td>
            <td style={{ ...headerGreenCenter, width: '20%' }}>退社日</td>
            <td style={{ ...headerGreenCenter }}>職歴(なければアルバイト歴)</td>
          </tr>
          {data.pengalaman?.length > 0 ? (
            data.pengalaman.map((p: any, i: number) => (
              <tr key={i}>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  {p.tahun_masuk || p.tanggal_masuk || '-'}
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  {p.masih_bekerja ? '現在' : (p.tahun_keluar || p.tanggal_keluar || '-')}
                </td>
                <td style={cellStyle}>{p.nama_perusahaan || p.perusahaan || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ ...cellStyle, height: '28px' }}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}>-----</td>
            </tr>
          )}
          {/* Empty rows */}
          <tr>
            <td style={{ ...cellStyle, height: '28px' }}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}>-----</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, height: '28px' }}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}>-----</td>
          </tr>
        </tbody>
      </table>

      {/* ===== BAHASA & HOBI ===== */}
      <table style={{ ...tableStyle, marginTop: '16px' }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, textAlign: 'center', width: '50%' }}>
              語学力・資格など<br />
              <span style={{ fontSize: '10px' }}>(Kemampuan Bahasa & Sertifikat)</span>
            </td>
            <td style={{ ...cellStyle, textAlign: 'center' }}>
              趣味・得意な運動など<br />
              <span style={{ fontSize: '10px' }}>(Hobi & Olahraga yang dikuasai)</span>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              {data.kemampuan_bahasa_jepang && (
                <div>kemampuan bahasa jepang : {data.kemampuan_bahasa_jepang}</div>
              )}
              {data.level_jlpt && <div>JLPT : {data.level_jlpt}</div>}
              {data.level_jft && <div>JFT : {data.level_jft}</div>}
              {data.kemampuan_bahasa_inggris && (
                <div>kemampuan bahasa inggris : {data.kemampuan_bahasa_inggris}</div>
              )}
              {data.bidang_sertifikasi && <div>{data.bidang_sertifikasi}</div>}
              {data.sim_dimiliki && <div>SIM : {data.sim_dimiliki}</div>}
              {!data.kemampuan_bahasa_jepang && !data.level_jlpt && !data.bidang_sertifikasi && '—'}
            </td>
            <td style={cellStyle}>{data.hobi || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== TUJUAN KE JEPANG ===== */}
      <table style={{ ...tableStyle, marginTop: '16px' }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, textAlign: 'center' }}>
              志望動機　　TUJUAN KE JEPANG
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              {data.tujuan_ke_jepang || data.alasan_ke_jepang || data.ketertarikan_terhadap_jepang || '-'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== STATUS PERNAH TINGGAL DI JEPANG ===== */}
      <table style={{ ...tableStyle, marginTop: '16px' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={{ ...headerGreenCenter, fontWeight: 'bold' }}>
              日本に住んだ事がある方 STATUS PERNAH TINGGAL DI JEPANG
            </td>
          </tr>
          <tr>
            <td style={{ ...headerGreen, width: '20%' }}>在留資格</td>
            <td style={cellStyle}>-----------------</td>
          </tr>
        </tbody>
      </table>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...headerGreen, width: '20%' }}>雇用期間</td>
            <td style={cellStyle}></td>
            <td style={{ ...headerGreen, width: '20%' }}>専門級試験</td>
            <td style={{ ...headerGreen, width: '40%' }}>合格した・合格していない・未受験</td>
          </tr>
        </tbody>
      </table>

      {/* ===== KELUARGA ===== */}
      <table style={{ ...tableStyle, marginTop: '16px' }}>
        <tbody>
          <tr>
            <td colSpan={6} style={{ ...headerGreenCenter, fontWeight: 'bold' }}>
              家族構成 KELUARGA
            </td>
          </tr>
          <tr style={{ textAlign: 'center' as const, backgroundColor: 'rgb(213, 228, 197)' }}>
            <td style={headerGreenCenter}>順番</td>
            <td style={headerGreenCenter}>続柄</td>
            <td style={headerGreenCenter}>氏名</td>
            <td style={headerGreenCenter}>年齢</td>
            <td style={headerGreenCenter}>住所</td>
            <td style={headerGreenCenter}>職業</td>
          </tr>
          {/* Ayah */}
          <tr style={{ textAlign: 'center' as const }}>
            <td style={cellStyle}>1</td>
            <td style={cellStyle}>父</td>
            <td style={cellStyle}>{data.ayah_nama || '-'}</td>
            <td style={cellStyle}>{data.ayah_usia || '-'}</td>
            <td style={cellStyle}>{data.ayah_pekerjaan || '-'}</td>
            <td style={cellStyle}>-</td>
          </tr>
          {/* Ibu */}
          <tr style={{ textAlign: 'center' as const }}>
            <td style={cellStyle}>2</td>
            <td style={cellStyle}>母</td>
            <td style={cellStyle}>{data.ibu_nama || '-'}</td>
            <td style={cellStyle}>{data.ibu_usia || '-'}</td>
            <td style={cellStyle}>{data.ibu_pekerjaan || '-'}</td>
            <td style={cellStyle}>-</td>
          </tr>
          {/* Kakak */}
          <tr style={{ textAlign: 'center' as const }}>
            <td style={cellStyle}>3</td>
            <td style={cellStyle}>兄 / 姉</td>
            <td style={cellStyle}>{data.kakak_nama || '-'}</td>
            <td style={cellStyle}>{data.kakak_usia || '-'}</td>
            <td style={cellStyle}>{data.kakak_pekerjaan || '-'}</td>
            <td style={cellStyle}>-</td>
          </tr>
          {/* Adik */}
          <tr style={{ textAlign: 'center' as const }}>
            <td style={cellStyle}>4</td>
            <td style={cellStyle}>弟 / 妹</td>
            <td style={cellStyle}>{data.adik_nama || '-'}</td>
            <td style={cellStyle}>{data.adik_usia || '-'}</td>
            <td style={cellStyle}>{data.adik_pekerjaan || '-'}</td>
            <td style={cellStyle}>-</td>
          </tr>
          {/* Keluarga tambahan dari array */}
          {data.keluarga?.slice(0, 2).map((k: any, i: number) => (
            <tr key={i} style={{ textAlign: 'center' as const }}>
              <td style={cellStyle}>{i + 5}</td>
              <td style={cellStyle}>{k.hubungan || '-'}</td>
              <td style={cellStyle}>{k.nama || '-'}</td>
              <td style={cellStyle}>{k.usia || '-'}</td>
              <td style={cellStyle}>{k.alamat || '-'}</td>
              <td style={cellStyle}>{k.pekerjaan || '-'}</td>
            </tr>
          ))}
          {/* Empty rows */}
          <tr>
            <td style={{ ...cellStyle, height: '28px' }}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
        </tbody>
      </table>

      {/* ===== その他 (Lainnya) ===== */}
      <table style={{ ...tableStyle, marginTop: '16px' }}>
        <tbody>
          <tr>
            <td colSpan={4} style={{ ...headerGreenCenter, fontWeight: 'bold' }}>
              その他
            </td>
          </tr>
        </tbody>
      </table>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...headerGreen, width: '20%' }}>民族</td>
            <td style={{ ...cellStyle, width: '50%' }}>
              民族：{data.suku || '-'}
            </td>
            <td style={{ ...headerGreen, width: '20%' }}>身長</td>
            <td style={cellStyle}>{data.tinggi_badan || '-'} cm</td>
          </tr>
          <tr>
            <td style={{ ...headerGreen }}>宗教</td>
            <td style={cellStyle}>{data.agama || '-'}</td>
            <td style={{ ...headerGreen }}>体重</td>
            <td style={cellStyle}>{data.berat_badan || '-'} kg</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}