import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

// ── helper map agama → kanji
const agamaMap: Record<string, string> = {
  Islam: 'イスラム',
  Kristen: 'キリスト',
  Katolik: 'カトリック',
  Hindu: 'ヒンドゥー',
  Buddha: '仏教',
  Konghucu: '儒教',
}

// ── helper map SSW → kanji
const sswMap: Record<string, string> = {
  Pertanian: '農業',
  'Kaigo (perawat)': '介護',
  'Pengolahan Makanan': '飲食料品',
  Restoran: '外食業',
  'Building Cleaning': 'ビルクリーニング',
  Driver: '自動車運送業',
  'Hanya JFT': '国際交流基金日本語基礎テスト',
}

export default function TemplateModern({ data }: CVTemplateProps) {
  // Kelompokkan keluarga berdasarkan hubungan
  const keluarga: any[] = data.keluarga || []
  const ayah      = keluarga.find(k => k.hubungan === 'Ayah')
  const ibu       = keluarga.find(k => k.hubungan === 'Ibu')
  const kakaks    = keluarga.filter(k => k.hubungan === 'Kakak')
  const adiks     = keluarga.filter(k => k.hubungan === 'Adik')
  const lainnya   = keluarga.filter(k => !['Ayah','Ibu','Kakak','Adik'].includes(k.hubungan))

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', padding: '10px', background: '#fff', color: '#000' }}>

      {/* ── JUDUL ── */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>RIWAYAT HIDUP</div>
        <div style={{ fontSize: '10px', letterSpacing: '1px' }}>実習生経歴書</div>
      </div>

      {/* ── BARIS ATAS: PAS FOTO + TABEL IDENTITAS ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>

        {/* PAS FOTO */}
        <div style={{ flexShrink: 0 }}>
          {data.pas_foto ? (
            <img
              src={data.pas_foto}
              alt="Pas Foto"
              style={{ width: '120px', height: '160px', objectFit: 'cover', display: 'block', border: '1px solid #000' }}
            />
          ) : (
            <div style={{ width: '120px', height: '160px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '9px', textAlign: 'center' }}>
              Pas Foto
            </div>
          )}
        </div>

        {/* TABEL IDENTITAS */}
        <table style={tbl}>
          <tbody>
            {/* Baris 1 — Nomor + Tinggi */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center', width: '90px' }} rowSpan={2}>実習生 NOMOR</td>
              <td style={{ ...td, width: '100px' }} rowSpan={2}></td>
              <td style={{ ...td, ...bg, width: '130px' }}>身長 TINGGI BADAN</td>
              <td style={{ ...td, textAlign: 'center', width: '50px' }} colSpan={2}>{data.tinggi_badan || '-'}</td>
              <td style={{ ...td, textAlign: 'center', width: '30px' }} colSpan={2}>CM</td>
            </tr>
            {/* Baris 2 — Berat */}
            <tr>
              <td style={{ ...td, ...bg }}>体重 BERAT BADAN</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>{data.berat_badan || '-'}</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>KG</td>
            </tr>

            {/* Baris 3 — Label Nama + Ukuran Sepatu */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>名前 NAMA</td>
              <td style={{ ...td, ...bg }}>靴サイズ UKURAN SEPATU</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>{data.panjang_telapak_kaki || '-'}</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>CM</td>
            </tr>

            {/* Baris 4 — Nama Katakana + Lingkar Pinggang */}
            <tr>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>{data.nama_katakana || '…………………'}</td>
              <td style={{ ...td, ...bg }}>ウェスト LINGKAR PINGGANG</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>{data.lingkar_pinggang || '-'}</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>CM</td>
            </tr>

            {/* Baris 5 — Nama Romaji + Golongan Darah */}
            <tr>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>{data.nama_romaji || '…………………'}</td>
              <td style={{ ...td, ...bg }}>血液型 GOLONGAN DARAH</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>{data.golongan_darah || '-'}</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>型</td>
            </tr>

            {/* Baris 6 — Label TGL Lahir + Penglihatan */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>生年月日 TANGGAL LAHIR</td>
              <td style={{ ...td, ...bg }}>視力 PENGLIHATAN</td>
              <td style={{ ...td, textAlign: 'center', width: '22px' }}>右</td>
              <td style={{ ...td, textAlign: 'center', width: '45px' }}>{data.penglihatan_kanan || '-'}</td>
              <td style={{ ...td, textAlign: 'center', width: '22px' }}>左</td>
              <td style={{ ...td, textAlign: 'center', width: '45px' }}>{data.penglihatan_kiri || '-'}</td>
            </tr>

            {/* Baris 7 — Tanggal Lahir + Status Pernikahan */}
            <tr>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>
                {data.tanggal_lahir ? formatDate(data.tanggal_lahir) : '…………………'}
              </td>
              <td style={{ ...td, ...bg }}>配偶者 STATUS PERNIKAHAN</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                {data.status_pernikahan || '-'}
                {data.status_pernikahan === 'Sudah Menikah' && '（結婚）'}
                {data.status_pernikahan === 'Belum Menikah' && '（未婚）'}
                {data.status_pernikahan === 'Bercerai' && '（離婚）'}
              </td>
            </tr>

            {/* Baris 8 — Label Tempat Lahir + Agama */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>出身地 TEMPAT LAHIR</td>
              <td style={{ ...td, ...bg }}>宗教 AGAMA</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                {data.agama || '-'} （{agamaMap[data.agama] || '-'}）
              </td>
            </tr>

            {/* Baris 9 — Tempat Lahir + Pernah ke Jepang */}
            <tr>
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>{data.tempat_lahir || '-'}</td>
              <td style={{ ...td, ...bg }}>訪日経験 PERNAH KE JEPANG</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                {data.pernah_ke_jepang === 'Ya' ? 'Ya（有）' : 'Tidak（無）'}
              </td>
            </tr>

            {/* Baris 10 — Usia + Paspor */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }}>年齢 USIA</td>
              <td style={{ ...td, textAlign: 'center' }}>{data.umur ? `${data.umur} 歳` : '-'}</td>
              <td style={{ ...td, ...bg }}>旅券の有無 PASPOR</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>TIDAK (無)</td>
            </tr>

            {/* Baris 11 — Jenis Kelamin + Tangan Dominan */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }}>性別 JENIS KELAMIN</td>
              <td style={{ ...td, textAlign: 'center' }}>
                {data.jenis_kelamin || '-'} （{data.jenis_kelamin === 'Laki-laki' ? '男' : '女'}）
              </td>
              <td style={{ ...td, ...bg }}>利き手 TANGAN DOMINAN</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                {data.tangan_dominan || '-'} （{data.tangan_dominan === 'Kanan' ? '右' : '左'}）
              </td>
            </tr>

            {/* Baris 12-14 — No HP + Riwayat Penyakit / Merokok / Alkohol */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} rowSpan={3}>携帯電話番号 NO HP</td>
              <td style={{ ...td, textAlign: 'center' }} rowSpan={3}>(+62) {data.nomor_hp || '-'}</td>
              <td style={{ ...td, ...bg }}>病歴 RIWAYAT PENYAKIT</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                {data.riwayat_penyakit || 'Tidak Ada'}
                （{data.riwayat_penyakit && data.riwayat_penyakit !== 'Tidak Ada' ? '有' : '無'}）
              </td>
            </tr>
            <tr>
              <td style={{ ...td, ...bg }}>タバコ MEROKOK</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                {data.merokok || '-'} （{data.merokok === 'Ya' ? '有' : '無'}）
              </td>
            </tr>
            <tr>
              <td style={{ ...td, ...bg }}>飲酒 MINUM ALKOHOL</td>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                {data.minum_alkohol || '-'} （{data.minum_alkohol === 'Ya' ? '有' : '無'}）
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── ALAMAT ── */}
      <table style={{ ...tbl, marginTop: '0' }}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>現住所　ALAMAT RUMAH</td>
          </tr>
          <tr>
            <td style={{ ...td, textAlign: 'center' }}>{data.alamat_lengkap || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* ── KONTAK DARURAT ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg }}>緊急時の連絡先 Informasi Kontak Darurat</td>
            <td style={td}>電話番号　： {data.nomor_hp || data.kontak_ortu_hp || '-'}</td>
            <td style={{ ...td, ...bg, width: '243px' }}></td>
          </tr>
        </tbody>
      </table>

      {/* ── PENDIDIKAN ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={5}>学歴 PENDIDIKAN</td>
          </tr>
          <tr style={bg}>
            <td style={{ ...td, ...bg, width: '96px', textAlign: 'center' }} colSpan={3}>期間 TAHUN</td>
            <td style={{ ...td, ...bg, width: '383px', textAlign: 'center' }}>学校名 NAMA SEKOLAH</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>専攻 JURUSAN</td>
          </tr>
          {(data.pendidikan || []).map((p: any, i: number) => (
            <tr key={i} style={{ textAlign: 'center' }}>
              <td style={{ ...td, width: '96px' }}>{p.bulan_masuk ? `${p.tahun_masuk}年 ${p.bulan_masuk}月` : (p.tahun_masuk || '-')}</td>
              <td style={{ ...td, width: '20px', textAlign: 'center' }}>-</td>
              <td style={{ ...td, width: '96px' }}>{p.bulan_lulus ? `${p.tahun_lulus}年 ${p.bulan_lulus}月` : (p.tahun_lulus || '-')}</td>
              <td style={{ ...td, width: '383px' }}>{p.nama_sekolah}</td>
              <td style={td}>{p.jurusan || '-'}</td>
            </tr>
          ))}
          {/* baris kosong */}
          <tr>
            <td style={{ ...td, height: '20px' }} colSpan={5}></td>
          </tr>
        </tbody>
      </table>

      {/* ── PENGALAMAN KERJA ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={6}>職歴 PENGALAMAN KERJA</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '96px' }} colSpan={3}>期間 TAHUN</td>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '383px' }}>会社名 NAMA PERUSAHAAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '122px' }}>職種 JENIS KERJA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>月収/円 GAJI</td>
          </tr>
          {(data.pengalaman || []).map((p: any, i: number) => (
            <tr key={i} style={{ textAlign: 'center' }}>
              <td style={{ ...td, width: '95px' }}>{p.bulan_masuk ? `${p.tahun_masuk}年 ${p.bulan_masuk}月` : (p.tahun_masuk || '-')}</td>
              <td style={{ ...td, width: '20px', textAlign: 'center' }}>-</td>
              <td style={{ ...td, width: '94px' }}>
                {p.masih_bekerja ? '現在' : (p.bulan_keluar ? `${p.tahun_keluar}年 ${p.bulan_keluar}月` : (p.tahun_keluar || '-'))}
              </td>
              <td style={{ ...td, width: '383px' }}>{p.nama_perusahaan}</td>
              <td style={{ ...td, width: '122px' }}>{p.posisi || '-'}</td>
              <td style={td}>-</td>
            </tr>
          ))}
          <tr>
            <td style={{ ...td, height: '20px' }} colSpan={6}></td>
          </tr>
        </tbody>
      </table>

      {/* ── DATA KELUARGA ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={5}>家族構成 SUSUNAN KELUARGA KANDUNG</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '160px' }}>続柄 URUTAN KELUARGA</td>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '220px' }}>名前 NAMA ANGGOTA KELUARGA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>年齢 USIA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>職業 PEKERJAAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>月収/円 GAJI</td>
          </tr>

          {/* Ayah */}
          <tr>
            <td style={td}>AYAH （父）</td>
            <td style={td}>{ayah?.nama || 'なし'}</td>
            <td style={{ ...td, textAlign: 'center' }}>{ayah?.usia ? `${ayah.usia} 歳` : 'なし'}</td>
            <td style={td}>{ayah?.pekerjaan || 'なし'}</td>
            <td style={td}>なし</td>
          </tr>

          {/* Ibu */}
          <tr>
            <td style={td}>IBU （母）</td>
            <td style={td}>{ibu?.nama || 'なし'}</td>
            <td style={{ ...td, textAlign: 'center' }}>{ibu?.usia ? `${ibu.usia} 歳` : 'なし'}</td>
            <td style={td}>{ibu?.pekerjaan || 'なし'}</td>
            <td style={td}>なし</td>
          </tr>

          {/* Kakak */}
          {kakaks.map((k, i) => (
            <tr key={`kakak-${i}`}>
              <td style={td}>KAKAK （兄/姉）</td>
              <td style={td}>{k.nama || 'なし'}</td>
              <td style={{ ...td, textAlign: 'center' }}>{k.usia ? `${k.usia} 歳` : 'なし'}</td>
              <td style={td}>{k.pekerjaan || 'なし'}</td>
              <td style={td}>なし</td>
            </tr>
          ))}

          {/* Adik */}
          {adiks.map((k, i) => (
            <tr key={`adik-${i}`}>
              <td style={td}>ADIK （弟/妹）</td>
              <td style={td}>{k.nama || 'なし'}</td>
              <td style={{ ...td, textAlign: 'center' }}>{k.usia ? `${k.usia} 歳` : 'なし'}</td>
              <td style={td}>{k.pekerjaan || 'なし'}</td>
              <td style={td}>なし</td>
            </tr>
          ))}

          {/* Lainnya */}
          {lainnya.map((k, i) => (
            <tr key={`lain-${i}`}>
              <td style={td}>{k.hubungan}</td>
              <td style={td}>{k.nama || 'なし'}</td>
              <td style={{ ...td, textAlign: 'center' }}>{k.usia ? `${k.usia} 歳` : 'なし'}</td>
              <td style={td}>{k.pekerjaan || 'なし'}</td>
              <td style={td}>なし</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── INFORMASI PERSONAL ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>個人情報　INFORMASI PERSONAL</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, width: '209px' }}>自己ＰＲ　PROMOSI DIRI</td>
            <td style={td}>{data.kelebihan_diri || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>日本へ行く目的　TUJUAN KE JEPANG</td>
            <td style={td}>{data.tujuan_ke_jepang || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>回国後の目標　TUJUAN SETELAH PULANG DARI JEPANG</td>
            <td style={td}>{data.cita_cita_setelah_jepang || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>長所　KELEBIHAN</td>
            <td style={td}>{data.kelebihan_diri || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>短所　KEKURANGAN</td>
            <td style={td}>{data.kekurangan_diri || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>特技 KEAHLIAN KHUSUS</td>
            <td style={td}>{data.keahlian || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>趣味　HOBI</td>
            <td style={td}>{data.hobi || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* ── SERTIFIKAT ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={7}>面鏡・資格　SERTIFIKAT YANG DIMILIKI</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, width: '104px' }}>日本語能力試験 JLPT / SETARA</td>
            <td style={{ ...td, width: '105px' }}>
              {data.level_jlpt ? `${data.level_jlpt}（有）` : (data.level_jft ? `JFT ${data.level_jft}（有）` : 'Tidak Ada（無）')}
            </td>
            <td style={td}>{data.level_jft || '-'}</td>
            <td style={{ ...td, ...bg }}>運転免許　SURAT IZIN MENGEMUDI (SIM)</td>
            <td style={td}>{data.sim_dimiliki ? `${data.sim_dimiliki}（有）` : 'Tidak Ada（無）'}</td>
            <td style={{ ...td, ...bg }}>他　LAIN-LAIN</td>
            <td style={td}>
              {data.sertifikat_ssw
                ? `${data.sertifikat_ssw} （${sswMap[data.sertifikat_ssw] || '-'}）`
                : '-'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── KERABAT / KENALAN DI JEPANG ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={5}>在日親戚・知人　KERABAT / KENALAN DI JEPANG</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, width: '209px', textAlign: 'center' }}>名前 NAMA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>関係　HUBUNGAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>職業 PEKERJAAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>年齢 USIA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>日本の住所 ALAMAT DI JEPANG</td>
          </tr>
          <tr>
            <td style={{ ...td, height: '25px' }}>{data.kenalan_jepang_detail || ''}</td>
            <td style={td}>{data.hubungan_keluarga_jepang || ''}</td>
            <td style={td}></td>
            <td style={td}></td>
            <td style={td}></td>
          </tr>
        </tbody>
      </table>

      {/* ── CATATAN TAMBAHAN ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>付記　CATATAN TAMBAHAN</td>
          </tr>
          <tr>
            <td style={{ ...td, height: '40px' }}></td>
          </tr>
        </tbody>
      </table>

    </div>
  )
}

// ── STYLE HELPERS ──
const tbl: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '10px',
  tableLayout: 'fixed',
  fontFamily: 'Arial, sans-serif',
}

const td: React.CSSProperties = {
  border: '1px solid #000',
  padding: '3px 5px',
  verticalAlign: 'middle',
  fontSize: '10px',
}

const bg: React.CSSProperties = {
  backgroundColor: '#a5bfdf',
}