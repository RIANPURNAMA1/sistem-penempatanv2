import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

export default function TemplateSimple({ data }: CVTemplateProps) {
  return (
    <div
      style={{
        fontFamily: '"Times New Roman", serif',
        padding: '20px',
        background: '#fff',
        color: '#000',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* ===== JUDUL ===== */}
      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', paddingTop: '10px' }}>
        特 定 技 能 外 国 人 の 履 歴 書
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Curriculum Vitae Pekerja Asing Berketerampilan Khusus
      </div>

      {/* ===== TABEL 1 — IDENTITAS ===== */}
      <table style={tbl}>
        <tbody>
          {/* Baris 1 — Nama (Katakana) + Jenis Kelamin */}
          <tr>
            <td style={{ ...td, width: '13%' }} rowSpan={2}>
              ①氏名<br />Nama
            </td>
            <td style={{ ...td, width: '10%' }}>
              アルファベット<br />Alfabet<br /><br />
            </td>
            <td style={{ ...td, width: '40%' }}>
              {data.nama_katakana || '…………………………………'}
            </td>
            <td style={td}>②性別<br />Jenis kelamin</td>
            <td style={td} colSpan={3}>
              {data.jenis_kelamin || '………………………………………'}
            </td>
          </tr>

          {/* Baris 2 — Nama (Romaji) + Tanggal Lahir */}
          <tr>
            <td style={{ ...td, width: '10%' }}>
              漢字<br />Kanji<br /><br />
            </td>
            <td style={td}>
              {data.nama_romaji || '…………………………………'}
            </td>
            <td style={td}>③生年月日<br />Tanggal lahir</td>
            <td style={td} colSpan={3}>
              {data.tanggal_lahir ? formatDate(data.tanggal_lahir) : '………………………………………'}
            </td>
          </tr>

          {/* Baris 3 — Kewarganegaraan + Bahasa */}
          <tr>
            <td style={td} colSpan={2}>
              ④国籍・地域<br />Kewarganegaraan, wilayah
            </td>
            <td style={td}>インドネシア</td>
            <td style={td}>
              ⑤ 十分に理解できる言語<br />Bahasa yang mahir dikuasai
            </td>
            <td style={td} colSpan={3}>
              インドネシア語<br />Bahasa Indonesia<br />
              日本語<br />Bahasa Jepang
            </td>
          </tr>

          {/* Baris 4 — Alamat baris 1 */}
          <tr>
            <td style={td} colSpan={2}>⑥本国又は居住国</td>
            <td style={td} colSpan={3}>インドネシア</td>
          </tr>

          {/* Baris 5 — Alamat baris 2 */}
          <tr>
            <td style={td} colSpan={2}>における住所</td>
            <td style={td} colSpan={3}>
              {data.alamat_lengkap || '-'}
            </td>
          </tr>

          {/* Baris 6 — Alamat baris 3 */}
          <tr>
            <td style={td} colSpan={2}>
              Alamat di negara asal atau negara
            </td>
            <td style={{ ...td, textAlign: 'right' }} colSpan={3}>
              （電話）{data.nomor_hp || data.email_kontak || ''}
            </td>
          </tr>

          {/* Baris 7 — Tempat lahir */}
          <tr>
            <td style={td} colSpan={2}>tempat tinggal</td>
            <td style={td} colSpan={3}>{data.tempat_lahir || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== TABEL 2 — PENDIDIKAN & PENGALAMAN ===== */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, width: '204px' }}>⑦学歴・職歴</td>
            <td style={{ ...td, textAlign: 'center' }}>年<br />Tahun masuk</td>
            <td style={{ ...td, textAlign: 'center' }}>月<br />lulus</td>
            <td style={{ ...td, textAlign: 'center' }}>
              最終学歴・主たる職歴<br />
              Latar belakang pendidikan terbaru/riwayat pekerjaan utama
            </td>
          </tr>

          {/* Pendidikan */}
          {(data.pendidikan || []).map((p: any, i: number) => (
            <tr key={`pend-${i}`}>
              <td style={{ ...td, width: '204px' }}>Latar belakang pendidikan</td>
              <td style={{ ...td, width: '80px', textAlign: 'center' }}>
                {p.tahun_masuk || '-'}
              </td>
              <td style={{ ...td, width: '80px', textAlign: 'center' }}>
                {p.tahun_lulus || '-'}
              </td>
              <td style={{ ...td, textAlign: 'center' }}>
                {p.nama_sekolah}{p.jurusan ? ` — ${p.jurusan}` : ''}
              </td>
            </tr>
          ))}

          {/* Pengalaman kerja */}
          {(data.pengalaman || []).map((p: any, i: number) => (
            <tr key={`exp-${i}`}>
              <td style={{ ...td, width: '204px' }}>Riwayat pekerjaan</td>
              <td style={{ ...td, textAlign: 'center' }}>
                {p.tahun_masuk || '-'}
              </td>
              <td style={{ ...td, textAlign: 'center' }}>
                {p.masih_bekerja ? 'Sekarang' : (p.tahun_keluar || '-')}
              </td>
              <td style={{ ...td, textAlign: 'center' }}>
                {p.nama_perusahaan}{p.posisi ? ` — ${p.posisi}` : ''}
              </td>
            </tr>
          ))}

          {/* Baris kosong jika tidak ada data */}
          {(!data.pendidikan?.length && !data.pengalaman?.length) && (
            <tr>
              <td style={{ ...td, height: '60px' }} colSpan={4}></td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== TABEL 3 — KUALIFIKASI / SIM ===== */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, width: '204px', height: '70px' }}>
              ⑧資格・免許<br />Kualifikasi, lisensi
            </td>
            <td style={td}>
              {data.sim_dimiliki
                ? `SIM ${data.sim_dimiliki}`
                : (data.level_jlpt ? `JLPT ${data.level_jlpt}` : '-')}
              {data.sertifikat_ssw ? ` — SSW: ${data.sertifikat_ssw}` : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== TABEL 4 — RIWAYAT MAGANG JEPANG ===== */}
      <table style={tbl}>
        <tbody>
          {/* Header */}
          <tr>
            <td style={{ ...td, width: '204px' }} rowSpan={4}>
              ⑨過去に技能実習生として本邦に在留していた場合は，その在留歴<br /><br />
              Jika pernah tinggal di Jepang sebagai pekerja magang sebelumnya,
              tuliskan riwayat tersebut.
            </td>
            <td style={{ ...td, textAlign: 'center' }}>年<br />Tahun</td>
            <td style={{ ...td, textAlign: 'center' }}>月<br />Bulan</td>
            <td style={{ ...td, textAlign: 'center' }}>在留資格<br />Izin tinggal</td>
            <td style={{ ...td, textAlign: 'center' }}>所属機関等<br />Organisasi terkait, dll.</td>
            <td style={{ ...td, textAlign: 'center' }}>監理団体<br />Organisasi pengawas</td>
          </tr>
          {/* 3 baris kosong untuk isian */}
          {[0, 1, 2].map(i => (
            <tr key={i}>
              <td style={{ ...td, height: '50px' }}></td>
              <td style={td}></td>
              <td style={td}></td>
              <td style={td}></td>
              <td style={td}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== CATATAN ===== */}
      <div style={{ marginTop: '16px', fontSize: '14px', fontFamily: '"Times New Roman", serif' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>（注意）/ (Catatan)</p>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              ①の「英字」及び「漢字」氏名は，旅券上の表記を記載すること。
            </span>
            <br />
            <span style={{ color: '#666', fontStyle: 'italic' }}>
              Untuk bagian ①, tulis nama sesuai paspor dalam alfabet dan karakter kanji bila ada.
            </span>
          </li>
          <li style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              ⑤は，特定技能外国人が十分に理解できる言語（母国語に限らない。）について記載すること。
            </span>
            <br />
            <span style={{ color: '#666', fontStyle: 'italic' }}>
              Untuk bagian ⑤, tulis bahasa yang dapat dipahami dengan mencukupi oleh pekerja asing berketerampilan khusus (tidak terbatas bahasa ibu).
            </span>
          </li>
          <li style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              ⑨は，在留資格「技能実習」をもって本邦に在留していた期間，実習実施者（機関）及び監理団体（団体監理型技能実習の場合のみ）について詳細に記載すること。
            </span>
            <br />
            <span style={{ color: '#666', fontStyle: 'italic' }}>
              Untuk bagian ⑨, tulis dengan detail periode tinggal di Jepang dengan izin tinggal "Pekerja Magang",
              pelaksana (organisasi) pelatihan magang, dan organisasi pengawas (hanya untuk pekerja magang dengan organisasi pengawas).
            </span>
          </li>
          <li style={{ fontSize: '12px', marginBottom: '4px' }}>
            {new Date().getFullYear()} 年{' '}
            {String(new Date().getMonth() + 1).padStart(2, '0')} 月{' '}
            {String(new Date().getDate()).padStart(2, '0')} 日 作成<br />
            Disusun tanggal:
          </li>
          <li style={{ fontSize: '12px' }}>
            特定技能外国人の署名<br />
            Tanda tangan pekerja asing berketerampilan khusus
          </li>
        </ol>
      </div>
    </div>
  )
}

// ===== STYLE HELPERS =====
const tbl: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
  marginBottom: '0px',
}

const td: React.CSSProperties = {
  border: '1px solid #000',
  padding: '6px',
  verticalAlign: 'top',
}