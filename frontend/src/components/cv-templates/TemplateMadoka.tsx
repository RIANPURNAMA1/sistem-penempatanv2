import { formatDate } from '@/lib/utils'

interface CVTemplateProps {
  data: any
}

export default function TemplateMadoka({ data }: CVTemplateProps) {
  const cell = {
    border: '1px solid #000',
    padding: '8px 10px',
    fontSize: '12px',
    verticalAlign: 'top' as const,
  }

  const labelCol = {
    ...cell,
    width: '45%',
    backgroundColor: '#fff',
  }

  const valueCol = {
    ...cell,
    width: '55%',
    backgroundColor: '#f9f9f9',
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    border: '2px solid #000',
    marginBottom: '0',
  }

  const sectionHeaderBlue = {
    ...cell,
    backgroundColor: '#4a90e2',
    color: 'white',
    fontWeight: 'bold' as const,
    fontSize: '12px',
  }

  const sectionHeaderOrange = {
    ...cell,
    backgroundColor: '#f0ad4e',
    color: 'white',
    fontWeight: 'bold' as const,
    fontSize: '12px',
  }

  const sectionHeaderPurple = {
    ...cell,
    backgroundColor: '#5a5a7d',
    color: 'white',
    fontWeight: 'bold' as const,
    fontSize: '12px',
  }

  const sectionHeaderLightPurple = {
    ...cell,
    backgroundColor: '#8989c2',
    color: 'white',
    fontWeight: 'bold' as const,
    fontSize: '11px',
  }

  const sectionHeaderRed = {
    ...cell,
    backgroundColor: '#e8a5a5',
    fontWeight: 'bold' as const,
    fontSize: '11px',
  }

  const sectionHeaderNavy = {
    ...cell,
    backgroundColor: '#4a6fa5',
    color: 'white',
    fontWeight: 'bold' as const,
    fontSize: '11px',
  }

  const sectionHeaderExcel = {
    ...cell,
    backgroundColor: '#9BC2E6',
    fontWeight: 'bold' as const,
    fontSize: '11px',
  }

  const subsectionGray = {
    ...cell,
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold' as const,
    fontSize: '11px',
  }

  const infoSection = {
    ...cell,
    backgroundColor: '#fff',
    lineHeight: '1.6',
    fontSize: '11px',
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        background: '#ffffff',
        color: '#000',
        maxWidth: '900px',
        margin: '0 auto',
        fontSize: '12px',
      }}
    >
      {/* ===== SECTION 1: DATA DIRI ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={sectionHeaderBlue}>DATA DIRI</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama Katakana</td>
            <td style={valueCol}>: {data.nama_katakana || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama</td>
            <td style={valueCol}>: {data.nama_romaji || data.nama || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama Panggilan</td>
            <td style={valueCol}>: {data.nama_panggilan || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Tempat Tanggal Lahir</td>
            <td style={valueCol}>: {data.tempat_lahir || '-'} {data.tanggal_lahir ? formatDate(data.tanggal_lahir) : '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Usia</td>
            <td style={valueCol}>: {data.umur || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Jenis Kelamin</td>
            <td style={valueCol}>: {data.jenis_kelamin || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Status</td>
            <td style={valueCol}>: {data.status_perkawinan || data.status_pernikahan || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah Bersedia Kerja Shift?</td>
            <td style={valueCol}>: {data.bersedia_kerja_shift || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah Bersedia Kerja Lembur?</td>
            <td style={valueCol}>: {data.bersedia_lembur || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah Bersedia Kerja di Hari Libur</td>
            <td style={valueCol}>: {data.bersedia_hari_libur || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah Menggunakan Kacamata?</td>
            <td style={valueCol}>: {data.menggunakan_kacamata || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Ketajaman Mata</td>
            <td style={valueCol}>: {data.kemampuan_penglihatan_mata || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Tinggi Badan</td>
            <td style={valueCol}>: {data.tinggi_badan || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Berat Badan</td>
            <td style={valueCol}>: {data.berat_badan || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Golongan Darah</td>
            <td style={valueCol}>: {data.golongan_darah || data.golang_darah || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Tangan Dominan</td>
            <td style={valueCol}>: {data.tangan_dominan || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, fontWeight: 'bold' }}>Ukuran Baju</td>
          </tr>
          <tr>
            <td style={labelCol}>Atasan</td>
            <td style={valueCol}>: {data.ukuran_atasan_baju || data.ukuran_atasan || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Celana</td>
            <td style={valueCol}>: {data.ukuran_celana || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Ukuran Pinggang</td>
            <td style={valueCol}>: {data.ukuran_pinggang || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Ukuran Sepatu</td>
            <td style={valueCol}>: {data.ukuran_sepatu || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Sudah Vaksin?</td>
            <td style={valueCol}>: {data.sudah_vaksin ? 'Ya' : 'Tidak'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Berapa Kali?</td>
            <td style={valueCol}>: {data.sudah_vaksin_berapa_kali || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah Merokok</td>
            <td style={valueCol}>: {data.merokok || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah Minum Alkohol</td>
            <td style={valueCol}>: {data.minum_alkohol || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Jika Ya, Intensitas Minum</td>
            <td style={valueCol}>: </td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah Bertato</td>
            <td style={valueCol}>: {data.bertato || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Kesehatan Badan</td>
            <td style={valueCol}>: {data.kesehatan_badan || data.riwayat_penyakit || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Penyakit/Cedera Masa Lalu</td>
            <td style={valueCol}>: {data.penyakit_cedera_masa_lalu || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Agama</td>
            <td style={valueCol}>: {data.agama || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Email</td>
            <td style={valueCol}>: {data.email || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2} style={infoSection}>
              <strong>** KETAJAMAN MATA :</strong><br />
              UKURAN MINUS DI INDO:<br />
              0.1 = 5.00 - 6.00<br />
              0.2 = 2.50 - 3<br />
              0.5 = 0.75<br />
              0.6 = 0.25-50 - 0.5<br />
              1.0 = MENUNJUKAN NORMAL<br />
              1.2-2.0 2 = NORMAL
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== SECTION 2: ISILAH DATA ===== */}
      <div style={{ color: '#d9534f', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '12px' }}>
        ISILAH DATA BERIKUT DENGAN BAIK DAN BENAR SERTA JELAS DAN LENGKAP
      </div>

      {/* ===== RIWAYAT PENDIDIKAN ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={{ ...cell, backgroundColor: '#5bc0de', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
              RIWAYAT PENDIDIKAN TERAKHIR
            </td>
          </tr>
          {data.pendidikan?.length > 0 ? (
            data.pendidikan.map((p: any, i: number) => (
              <>
                <tr key={`pend-nama-${i}`}>
                  <td style={labelCol}>Nama Sekolah</td>
                  <td style={valueCol}>: {p.nama_sekolah || p.nama || '-'}</td>
                </tr>
                <tr key={`pend-tahun-${i}`}>
                  <td style={labelCol}>Tahun Bulan</td>
                  <td style={valueCol}>: {p.tahun_masuk || '-'} - {p.tahun_lulus || '-'}</td>
                </tr>
                <tr key={`pend-jurusan-${i}`}>
                  <td style={labelCol}>Jurusan</td>
                  <td style={valueCol}>: {p.jurusan || '-'}</td>
                </tr>
              </>
            ))
          ) : (
            <>
              <tr>
                <td style={labelCol}>Nama Sekolah</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Tahun Bulan</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Jurusan</td>
                <td style={valueCol}>: -</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {/* ===== RIWAYAT PEKERJAAN ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={sectionHeaderOrange}>RIWAYAT PEKERJAAN</td>
          </tr>
          <tr>
            <td colSpan={2} style={subsectionGray}>Indonesia</td>
          </tr>
          {data.pengalaman?.length > 0 ? (
            data.pengalaman.map((p: any, i: number) => (
              <>
                <tr key={`exp-nama-${i}`}>
                  <td style={labelCol}>Nama Perusahaan</td>
                  <td style={valueCol}>: {p.nama_perusahaan || p.perusahaan || '-'}</td>
                </tr>
                <tr key={`exp-kota-${i}`}>
                  <td style={labelCol}>Nama Kota</td>
                  <td style={valueCol}>: {p.kota || '-'}</td>
                </tr>
                <tr key={`exp-bidang-${i}`}>
                  <td style={labelCol}>Bidang Pekerjaan</td>
                  <td style={valueCol}>: {p.posisi || p.jabatan || '-'}</td>
                </tr>
                <tr key={`exp-tahun-${i}`}>
                  <td style={labelCol}>Tahun Bulan</td>
                  <td style={valueCol}>: {p.tahun_masuk || p.tanggal_masuk || '-'} - {p.masih_bekerja ? 'Sekarang' : (p.tahun_keluar || p.tanggal_keluar || '-')}</td>
                </tr>
              </>
            ))
          ) : (
            <>
              <tr>
                <td style={labelCol}>Nama Perusahaan</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Nama Kota</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Bidang Pekerjaan</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Tahun Bulan</td>
                <td style={valueCol}>: -</td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={2} style={subsectionGray}>Magang ( Eks Jisshu )</td>
          </tr>
          {data.magang_jisshu?.length > 0 ? (
            data.magang_jisshu.map((p: any, i: number) => (
              <>
                <tr key={`magang-nama-${i}`}>
                  <td style={labelCol}>Nama Perusahaan</td>
                  <td style={valueCol}>: {p.perusahaan || '-'}</td>
                </tr>
                <tr key={`magang-kota-${i}`}>
                  <td style={labelCol}>Nama Kota/Prefektur</td>
                  <td style={valueCol}>: {p.kota_prefektur || '-'}</td>
                </tr>
                <tr key={`magang-bidang-${i}`}>
                  <td style={labelCol}>Bidang Pekerjaan</td>
                  <td style={valueCol}>: {p.bidang || '-'}</td>
                </tr>
                <tr key={`magang-tahun-${i}`}>
                  <td style={labelCol}>Tahun Bulan</td>
                  <td style={valueCol}>: {p.tahun_mulai || '-'} - {p.tahun_selesai || '-'}</td>
                </tr>
              </>
            ))
          ) : (
            <>
              <tr>
                <td style={labelCol}>Nama Perusahaan</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Nama Kota/Prefektur</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Bidang Pekerjaan</td>
                <td style={valueCol}>: -</td>
              </tr>
              <tr>
                <td style={labelCol}>Tahun Bulan</td>
                <td style={valueCol}>: -</td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={2} style={subsectionGray}>Pekerjaan Saat Ini</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama Perusahaan</td>
            <td style={valueCol}>:</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama Kota</td>
            <td style={valueCol}>:</td>
          </tr>
          <tr>
            <td style={labelCol}>Bidang Pekerjaan</td>
            <td style={valueCol}>:</td>
          </tr>
          <tr>
            <td style={labelCol}>Tahun Bulan Mulai s/d saat ini</td>
            <td style={{ ...valueCol, textAlign: 'center' }}>: 年 月 〜 年 月</td>
          </tr>
        </tbody>
      </table>

      {/* ===== DATA KELUARGA ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={sectionHeaderPurple}>DATA KELUARGA</td>
          </tr>
          {/* Ayah */}
          <tr>
            <td colSpan={2} style={sectionHeaderLightPurple}>Ayah</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama lengkap</td>
            <td style={valueCol}>: {data.ayah_nama || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Usia</td>
            <td style={valueCol}>: {data.ayah_usia || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Profesi/Pekerjaan</td>
            <td style={valueCol}>: {data.ayah_pekerjaan || '-'}</td>
          </tr>
          {/* Ibu */}
          <tr>
            <td colSpan={2} style={sectionHeaderLightPurple}>Ibu</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama lengkap</td>
            <td style={valueCol}>: {data.ibu_nama || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Usia</td>
            <td style={valueCol}>: {data.ibu_usia || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Profesi/Pekerjaan</td>
            <td style={valueCol}>: {data.ibu_pekerjaan || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Kontak orang tua (Ibu/Ayah)</td>
            <td style={valueCol}>:</td>
          </tr>
          {/* Suami/Istri */}
          <tr>
            <td colSpan={2} style={sectionHeaderLightPurple}>Suami/Istri</td>
          </tr>
          <tr>
            <td style={labelCol}>Nama lengkap</td>
            <td style={valueCol}>: {data.istri_nama || data.pasangan_nama || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Usia</td>
            <td style={valueCol}>: {data.istri_usia || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Profesi/Pekerjaan</td>
            <td style={valueCol}>: {data.istri_pekerjaan || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Kontak Suami/Istri</td>
            <td style={valueCol}>:</td>
          </tr>
        </tbody>
      </table>

      {/* ===== DATA ANAK & SAUDARA ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={sectionHeaderLightPurple}>Anak</td>
          </tr>
          <tr>
            <td style={{ ...cell, width: '33%' }}>Jenis Kelamin : {data.anak_jenis_kelamin || '-'}</td>
            <td style={{ ...cell, width: '33%' }}>Jenis Kelamin :</td>
            <td style={{ ...cell, width: '34%' }}>Jenis Kelamin :</td>
          </tr>
          <tr>
            <td style={cell}>Usia : {data.anak_usia || '-'}</td>
            <td style={cell}>Usia :</td>
            <td style={cell}>Usia :</td>
          </tr>
          <tr>
            <td style={cell}>Pendidikan : {data.anak_pendidikan || '-'}</td>
            <td style={cell}>Pendidikan :</td>
            <td style={cell}>Pendidikan :</td>
          </tr>
          {/* Kakak */}
          <tr>
            <td colSpan={3} style={subsectionGray}>Saudara kandung (kakak)</td>
          </tr>
          <tr>
            <td style={cell}>Jenis Kelamin : {data.kakak_jenis_kelamin || '-'}</td>
            <td style={cell}>Jenis Kelamin :</td>
            <td style={cell}>Jenis Kelamin :</td>
          </tr>
          <tr>
            <td style={cell}>Usia : {data.kakak_usia || '-'}</td>
            <td style={cell}>Usia :</td>
            <td style={cell}>Usia :</td>
          </tr>
          <tr>
            <td style={cell}>Profesi/Pekerjaan : {data.kakak_pekerjaan || '-'}</td>
            <td style={cell}>Profesi/Pekerjaan</td>
            <td style={cell}>Profesi/Pekerjaan</td>
          </tr>
          <tr>
            <td style={cell}>Status saudara : {data.kakak_status || '-'}</td>
            <td style={cell}>Status saudara : Kandung/Tiri</td>
            <td style={cell}>Status saudara : Kandung/Tiri</td>
          </tr>
          <tr>
            <td style={cell}>Nama lengkap: {data.kakak_nama || data.anggota_keluarga_kakak || '-'}</td>
            <td style={cell}>Nama lengkap:</td>
            <td style={cell}>Nama lengkap:</td>
          </tr>
          {/* Adik */}
          <tr>
            <td colSpan={3} style={subsectionGray}>Saudara kandung (Adik)</td>
          </tr>
          <tr>
            <td style={cell}>Jenis Kelamin : {data.adik_jenis_kelamin || '-'}</td>
            <td style={cell}>Jenis Kelamin :</td>
            <td style={cell}>Jenis Kelamin :</td>
          </tr>
          <tr>
            <td style={cell}>Usia : {data.adik_usia || '-'}</td>
            <td style={cell}>Usia :</td>
            <td style={cell}>Usia :</td>
          </tr>
          <tr>
            <td style={cell}>Profesi/Pekerjaan: {data.adik_pekerjaan || '-'}</td>
            <td style={cell}>Profesi/Pekerjaan</td>
            <td style={cell}>Profesi/Pekerjaan</td>
          </tr>
          <tr>
            <td style={cell}>Status saudara : {data.adik_status || '-'}</td>
            <td style={cell}>Status saudara : Kandung/Tiri</td>
            <td style={cell}>Status saudara : Kandung/Tiri</td>
          </tr>
          <tr>
            <td style={cell}>Nama lengkap: {data.adik_nama || '-'}</td>
            <td style={cell}>Nama lengkap:</td>
            <td style={cell}>Nama lengkap:</td>
          </tr>
          <tr>
            <td style={cell}>Jumlah saudara (adik &amp; kakak)</td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={subsectionGray}>Persetujuan Keluarga</td>
            <td colSpan={2} style={cell}>:</td>
          </tr>
          <tr>
            <td style={cell}>Apakah memiliki kenalan di Jepang?</td>
            <td colSpan={2} style={cell}>:</td>
          </tr>
          <tr>
            <td style={cell}>Tinggal Di Prefektur?</td>
            <td colSpan={2} style={cell}>:</td>
          </tr>
          <tr>
            <td style={cell}>Kontak kenalan di Jepang</td>
            <td colSpan={2} style={cell}>:</td>
          </tr>
          <tr>
            <td style={cell}>Penghasilan orang tua</td>
            <td colSpan={2} style={cell}>:</td>
          </tr>
          <tr>
            <td style={cell}>Sumber biaya keberangkatan</td>
            <td colSpan={2} style={cell}>:</td>
          </tr>
          <tr>
            <td style={cell}>Perkiraan Biaya yang disiapkan untuk bekerja ke Jepang</td>
            <td colSpan={2} style={cell}>: Choose an item.</td>
          </tr>
          <tr>
            <td style={cell}>Biaya keberangkatan sebelumnya (bagi eks jisshu)</td>
            <td colSpan={2} style={cell}>:</td>
          </tr>
        </tbody>
      </table>

      {/* ===== KUALIFIKASI ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={sectionHeaderRed}>Kualifikasi</td>
          </tr>
          <tr>
            <td style={labelCol}>Level Bahasa</td>
            <td style={valueCol}>: {data.kemampuan_bahasa_jepang || data.level_jlpt || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Sertifikat Yang Dimiliki</td>
            <td style={valueCol}>: {data.sertifikat_ssw || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Bidang</td>
            <td style={valueCol}>: {data.bidang_sertifikasi || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Lama ingin tinggal di Jepang</td>
            <td style={valueCol}>: {data.ingin_bekerja_berapa_tahun || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Lama ingin bekerja di perusahaan ini</td>
            <td style={valueCol}>: {data.ingin_bekerja_berapa_tahun || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Ingin pulang ke Indonesia berapa kali dalam 5th</td>
            <td style={valueCol}>: {data.ingin_pulang_berapa_kali || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Apakah ada keluarga di Jepang</td>
            <td style={valueCol}>: {data.ada_keluarga_di_jepang || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Hubungan dengan keluarga di Jepang</td>
            <td style={valueCol}>: {data.hubungan_keluarga_di_jepang || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Status kerabat di Jepang</td>
            <td style={valueCol}>: {data.status_kerabat_di_jepang || '-'}</td>
          </tr>
          <tr>
            <td style={labelCol}>Kontak keluarga di Jepang</td>
            <td style={valueCol}>: </td>
          </tr>
          <tr>
            <td style={labelCol}>Wawancara di tempat lain</td>
            <td style={valueCol}>: Choose an item.</td>
          </tr>
          <tr>
            <td style={labelCol}>Lokasi Perusahaan lain</td>
            <td style={valueCol}>:</td>
          </tr>
          <tr>
            <td style={labelCol}>Gaji perjam ditempat lain</td>
            <td style={valueCol}>¥ /jam</td>
          </tr>
        </tbody>
      </table>

      {/* ===== ALERT EKS JISSHU ===== */}
      <div style={{ backgroundColor: '#ff4444', color: 'white', padding: '8px 15px', marginBottom: '15px', fontWeight: 'bold', borderRadius: '3px', fontSize: '12px' }}>
        bagi Eks Jisshu Silahkan Di isi untuk New Comer hanya sampai Kualifikasi
      </div>

      {/* ===== RIWAYAT PEKERJAAN TERAKHIR (EKS JISSHU) ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={sectionHeaderNavy}>Riwayat Pekerjaan Terakhir (X Jisshu/TG/Katsudo)</td>
          </tr>
          {[
            ['Nama Perusahaan', ''],
            ['Nama Kumiai', ''],
            ['Total Karyawan', ''],
            ['Total Karyawan Asing', ''],
            ['Bidang Pekerjaan', ''],
            ['Klasifikasi Pekerjaan', ''],
            ['Masa Pelatihan Kerja', '年 月 〜 年 月'],
            ['Penanggung Jawab Saat Bekerja', ''],
            ['Kerja Shift/Normal?', 'Choose an item.'],
          ].map(([label, val], i) => (
            <tr key={i}>
              <td style={labelCol}>{label}</td>
              <td style={valueCol}>: {val}</td>
            </tr>
          ))}
          <tr>
            <td style={{ ...labelCol }} rowSpan={3}>Jam Kerja</td>
            <td style={valueCol}>: start 〜 selesai</td>
          </tr>
          <tr>
            <td style={valueCol}>: start 〜 selesai</td>
          </tr>
          <tr>
            <td style={valueCol}>: start 〜 selesai</td>
          </tr>
          <tr>
            <td style={labelCol}>Hari Libur</td>
            <td style={valueCol}>:</td>
          </tr>
          <tr>
            <td style={labelCol}>Detail Pekerjaan</td>
            <td style={valueCol}>:</td>
          </tr>
          <tr>
            <td style={labelCol}>Apabila Barang Cacat</td>
            <td style={valueCol}>:</td>
          </tr>
        </tbody>
      </table>

      {/* ===== DETAIL JISSHU ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          {[
            ['atau salah apa yang dilakukan?', ''],
            ['Tempat tinggal sewaktu jisshu di Prefektur mana', '-ken'],
            ['Nama kota tempat tingga waktu jisshu', '-shi'],
            ['Status visa sebelumnya', 'Choose an item.'],
            ['Masa tinggal waktu di Jepang sebelumnya', '年 月 sampai 年 月'],
            ['Gaji perjam sebelumnya', '¥#/jam'],
            ['Gaji bersih sebelumnya', ''],
            ['Lembur rata-rata sebelumnya', 'Choose an item. /bulan'],
            ['Asrama sebelumnya', 'kamar'],
            ['Jumlah orang yang di asrama', 'orang'],
            ['Transportasi yang di gunakan sebelumnya', 'Choose an item.'],
            ['Jarak tempuh', 'menit'],
            ['Apakah sudah memiliki hanko/cap', 'Choose an item.'],
            ['Apakah nama di hanko jisshu sama dengan nama di CV', 'Choose an item.'],
            ['Tulis nama katakana yang tertera di hanko', ''],
          ].map(([label, val], i) => (
            <tr key={i}>
              <td style={labelCol}>{label}</td>
              <td style={valueCol}>: {val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== EVALUASI INDIVIDU LPK ===== */}
      <table style={{ ...tableStyle, marginBottom: '0' }}>
        <tbody>
          <tr>
            <td colSpan={5} style={{ ...sectionHeaderExcel, textAlign: 'center', fontSize: '11px' }}>
              EVALUASI INDIVIDU DIISI OLEH PIHAK LPK
            </td>
          </tr>
          <tr>
            <td style={{ ...sectionHeaderExcel, width: '20%', textAlign: 'center' }}>NAMA</td>
            <td style={{ ...cell, width: '20%' }}></td>
            <td style={{ ...sectionHeaderExcel, width: '20%', textAlign: 'center' }}>UMUR</td>
            <td style={{ ...cell, width: '20%' }}></td>
            <td style={{ ...sectionHeaderExcel, width: '20%', textAlign: 'center' }}>P/L</td>
          </tr>
          <tr>
            <td colSpan={5} style={{ ...sectionHeaderExcel, textAlign: 'center' }}>MENGENAI KEGIATAN SISWA DI LPK</td>
          </tr>
          <tr>
            <td colSpan={2} style={sectionHeaderExcel}>Nama LPK</td>
            <td colSpan={2} style={sectionHeaderExcel}>Sudah berapa lama belajar di LPK</td>
            <td style={sectionHeaderExcel}>CATATAN</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, height: '40px' }}></td>
            <td colSpan={2} style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td colSpan={2} style={sectionHeaderExcel}>Sertifikat bahasa yang dimiliki</td>
            <td colSpan={2} style={sectionHeaderExcel}>Tanggal ujian</td>
            <td style={sectionHeaderExcel}>Sertifikat SSW</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, height: '40px' }}>
              {data.level_jlpt ? `JLPT ${data.level_jlpt}` : ''}
              {data.level_jft ? ` / JFT ${data.level_jft}` : ''}
            </td>
            <td colSpan={2} style={cell}></td>
            <td style={cell}>{data.sertifikat_ssw || ''}</td>
          </tr>
          <tr>
            <td colSpan={2} style={sectionHeaderExcel}>Skor level bahasa</td>
            <td colSpan={2} style={cell}></td>
            <td style={sectionHeaderExcel}>Skor SSW</td>
          </tr>
          <tr>
            <td colSpan={5} style={cell}></td>
          </tr>

          {/* INFO PENILAIAN */}
          <tr>
            <td colSpan={5} style={{ ...sectionHeaderExcel, textAlign: 'center' }}>INFO PENILAIAN DARI LPK TERHADAP KANDIDAT</td>
          </tr>
          <tr>
            <td colSpan={2} style={sectionHeaderExcel}>Bidang</td>
            <td colSpan={2} style={sectionHeaderExcel}>Evaluasi</td>
            <td style={sectionHeaderExcel}>Catatan</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...sectionHeaderExcel, height: '40px' }}>Absensi kehadiran</td>
            <td colSpan={2} style={sectionHeaderExcel}>F1/PERBULAN</td>
            <td style={cell}></td>
          </tr>
        </tbody>
      </table>

      {/* ===== CHECKLIST KEHIDUPAN DASAR ===== */}
      <table style={{ ...tableStyle, marginBottom: '0' }}>
        <thead>
          <tr>
            <th colSpan={5} style={{ ...sectionHeaderExcel, textAlign: 'center' }}>
              基本的な生活習慣（※）
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            ['1. Mampu menyapa Guru, Teman, dan Masyarakat Sekitar dengan ramah', '11. Mampu menerapkan dan melakukan seiri, seiton, dan seikatasu (3S)'],
            ['2. Tulus dan dapat segera meminta maaf dan berterimakasih', '12. Mampu menerapkan dan melakukan hourenshou (melaporkan, berkomunikasi, dan berkonsultasi)'],
            ['3. Apakah patuh terhadap peraturan LPK/ lainnya', '13. Mampu mematuhi dan memahami instruksi dari sensei LPK'],
            ['4. Mampu mengerjakan segala sesuatu tanpa mengelu', '14. Tidak bertindak egois dalam bersikap'],
            ['5. Mampu bertindak secara bertanggung jawab atas perkataannya sendiri', '15. Mampu mempersiapkan diri dalam persiapan setiap pembelajaran'],
            ['6. Apabila Gagal, mampu untuk merenungkan diri tanpa harus menyalahkan orang lain', '16. Mampu mendengarkan dan memahami secara baik pada materi yang diajarkan'],
            ['7. Mampu membantu orang yang membutuhkan', '17. Mampu bekerja sama dengan baik dalam kelompok'],
            ['8. Mampu bergaul dengan teman, kerabat, dll', '17. mengikuti aturan dan tata krama merokok (terbatas pada perokok)'],
          ].map(([left, right], i) => (
            <tr key={i}>
              <td style={{ ...sectionHeaderExcel, width: '40%', fontSize: '10px', padding: '6px 8px' }}>{left}</td>
              <td style={{ ...cell, width: '10%', textAlign: 'center' }}></td>
              {i === 0 && <td rowSpan={8} style={{ ...cell, width: '5%', textAlign: 'center' }}></td>}
              <td style={{ ...sectionHeaderExcel, width: '40%', fontSize: '10px', padding: '6px 8px' }}>{right}</td>
              <td style={{ ...cell, width: '10%', textAlign: 'center' }}></td>
            </tr>
          ))}
          <tr>
            <td style={{ ...sectionHeaderExcel, fontSize: '10px', padding: '6px 8px' }}>9. Mampu mendengarkan pendapat orang lain dengan baik</td>
            <td style={{ ...cell, textAlign: 'center' }}></td>
            <td rowSpan={2} style={{ ...sectionHeaderExcel, textAlign: 'center' }}>Evaluasi Keseluruhan</td>
            <td rowSpan={2} style={cell}></td>
          </tr>
          <tr>
            <td style={{ ...sectionHeaderExcel, fontSize: '10px', padding: '6px 8px' }}>10. Mampu bekerja sama dalam tim</td>
            <td style={{ ...cell, textAlign: 'center' }}></td>
          </tr>
        </tbody>
      </table>

      {/* ===== TABUNGAN ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...sectionHeaderExcel, width: '40%', verticalAlign: 'top', padding: '5px' }}>
              1. Jumlah Tabungan yang diinginkan
            </td>
            <td style={{ ...sectionHeaderExcel, width: '20%', padding: '5px' }}>Jumlah pengiriman uang per bulan</td>
            <td style={{ ...sectionHeaderExcel, width: '20%', padding: '5px' }}>Jumlah pengiriman uang per 1 tahun</td>
            <td style={{ ...sectionHeaderExcel, width: '20%', padding: '5px' }}>Jumlah pengiriman uang selama 5 tahun</td>
          </tr>
          <tr>
            <td style={{ ...cell, height: '30px' }}></td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={{ ...sectionHeaderExcel, padding: '5px' }}>2. Tujuan Penggunaan Tabungan Yang dihasilkan</td>
            <td style={cell}></td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={{ ...sectionHeaderExcel, padding: '5px' }}>3. Tujuan penggunaan tabungan untuk diri sendiri</td>
            <td style={cell}></td>
            <td style={cell}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td colSpan={4} style={{ ...cell, backgroundColor: 'rgb(154, 194, 113)', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', padding: '10px' }}>
              <strong>(※)</strong>
              &nbsp;&nbsp;<strong>A: SANGAT BAIK (SEKITAR 90%)</strong>
              &nbsp;&nbsp;<strong>B: BAIK (SEKITAR 75%)</strong>
              &nbsp;&nbsp;<strong>C: BELUM CUKUP BAIK (SEKITAR 50%)</strong><br />
              <strong>D: TIDAK MAMPU (SEKITAR 49%)</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== INFO TAMBAHAN ===== */}
      <table style={{ ...tableStyle, marginBottom: '20px' }}>
        <tbody>
          {[
            ['Alamat lengkap', data.alamat_lengkap || '-'],
            ['Hobi', data.hobi || '-'],
            ['Kelebihan pribadi', data.kelebihan_diri || '-'],
            ['Kekurangan pribadi', data.kekurangan_diri || '-'],
            ['Alasan pribadi kenapa ingin bekerja ke Jepang', data.tujuan_ke_jepang || data.alasan_ke_jepang || '-'],
            ['Setelah kembali dari Jepang, ingin bekerja apa', data.cita_cita_setelah_jepang || '-'],
            ['SIM (Motor & Mobil)', data.sim_dimiliki || data.jenis_sim || '-'],
          ].map(([label, val], i) => (
            <tr key={i}>
              <td style={{ ...cell, width: '40%', backgroundColor: '#9BC2E6', fontWeight: 'bold' }}>{label}</td>
              <td style={valueCol}>: {val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}