import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx'

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const generateCVPDF = (data: any) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  const addLine = () => {
    y += 8
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(data.nama_romaji || data.nama || 'CV Kandidat', pageWidth / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.nama_katakana) {
    doc.text(data.nama_katakana, pageWidth / 2, y, { align: 'center' })
    y += 6
  }

  const contactInfo = [
    data.nomor_hp,
    data.email,
    data.alamat_lengkap
  ].filter(Boolean).join(' | ')
  
  if (contactInfo) {
    doc.text(contactInfo, pageWidth / 2, y, { align: 'center' })
    y += 10
  }

  doc.setLineWidth(0.5)
  doc.line(20, y, pageWidth - 20, y)
  y += 10

  const section = (title: string) => {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 51, 153)
    doc.text(title, 20, y)
    doc.setTextColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.line(20, y + 2, pageWidth - 20, y + 2)
    y += 10
  }

  const field = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}: `, 20, y)
    doc.setFont('helvetica', 'normal')
    const val = String(value)
    const splitText = doc.splitTextToSize(val, pageWidth - 60)
    doc.text(splitText, 55, y)
    y += splitText.length * 5 + 2
  }

  section('DATA DIRI')
  field('Nama', data.nama_romaji || data.nama)
  field('Tempat, Tanggal Lahir', data.tempat_lahir && data.tanggal_lahir ? `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}` : data.tempat_lahir)
  field('Umur', data.umur ? `${data.umur} tahun` : null)
  field('Jenis Kelamin', data.jenis_kelamin)
  field('Pendidikan Terakhir', data.pendidikan_terakhir)
  field('Agama', data.agama)
  field('Golongan Darah', data.golongan_darah)
  field('SIM', data.sim_dimiliki)
  field('Ukuran Baju', data.ukuran_baju)

  if (data.pendidikan?.length > 0) {
    addLine()
    section('RIWAYAT PENDIDIKAN')
    data.pendidikan.forEach((p: any) => {
      field('Jenjang', p.jenjang)
      field('Nama Sekolah', p.nama_sekolah)
      field('Jurusan', p.jurusan)
      field('Periode', `${p.bulan_masuk} ${p.tahun_masuk} - ${p.bulan_lulus} ${p.tahun_lulus}`)
      y += 3
    })
  }

  if (data.pengalaman?.length > 0) {
    addLine()
    section('PENGALAMAN KERJA')
    data.pengalaman.forEach((p: any) => {
      field('Perusahaan', p.nama_perusahaan)
      field('Posisi', p.posisi)
      field('Periode', `${p.bulan_masuk} ${p.tahun_masuk} - ${p.masih_bekerja ? 'Sekarang' : `${p.bulan_keluar} ${p.tahun_keluar}`}`)
      field('Deskripsi', p.deskripsi_pekerjaan)
      y += 3
    })
  }

  if (data.keluarga?.length > 0) {
    addLine()
    section('DATA KELUARGA')
    data.keluarga.forEach((k: any) => {
      field('Hubungan', k.hubungan)
      field('Nama', k.nama)
      field('Usia', k.usia ? `${k.usia} tahun` : null)
      field('Pekerjaan', k.pekerjaan)
      y += 3
    })
  }

  addLine()
  section('KEMAMPUAN BAHASA JEPANG')
  field('Level JLPT', data.level_jlpt)
  field('Level JFT', data.level_jft)
  field('Bidang SSW', data.sertifikat_ssw)
  field('Lama Belajar', data.lama_belajar_jepang)
  field('Level Bahasa Jepang', data.level_bahasa_jepang)

  addLine()
  section('INFORMASI LAIN')
  field('Pernah ke Jepang', data.pernah_ke_jepang ? 'Ya' : 'Tidak')
  field('Keluarga di Jepang', data.keluarga_di_jepang ? 'Ya' : 'Tidak')
  field('Tujuan ke Jepang', data.tujuan_ke_jepang)
  field('Alasan ke Jepang', data.alasan_ke_jepang)
  field('Hobi', data.hobi)
  field('Keahlian', data.keahlian)

  const fileName = `${data.nama_romaji || data.nama || 'kandidat'}_CV.pdf`
  doc.save(fileName)
  return fileName
}

export const generateCVExcel = (data: any) => {
  const wb = XLSX.utils.book_new()

  const sheetData: any[][] = []

  sheetData.push(['DATA DIRI'])
  sheetData.push(['Nama', data.nama_romaji || data.nama])
  if (data.nama_katakana) sheetData.push(['Nama (Katakana)', data.nama_katakana])
  sheetData.push(['Tempat Lahir', data.tempat_lahir])
  sheetData.push(['Tanggal Lahir', data.tanggal_lahir ? formatDate(data.tanggal_lahir) : ''])
  sheetData.push(['Umur', data.umur ? `${data.umur} tahun` : ''])
  sheetData.push(['Jenis Kelamin', data.jenis_kelamin])
  sheetData.push(['Pendidikan Terakhir', data.pendidikan_terakhir])
  sheetData.push(['Agama', data.agama])
  sheetData.push(['Golongan Darah', data.golongan_darah])
  sheetData.push(['SIM', data.sim_dimiliki])
  sheetData.push(['Ukuran Baju', data.ukuran_baju])
  sheetData.push(['No. HP', data.nomor_hp])
  sheetData.push(['Email', data.email])
  sheetData.push(['Alamat', data.alamat_lengkap])

  if (data.pendidikan?.length > 0) {
    sheetData.push([])
    sheetData.push(['RIWAYAT PENDIDIKAN'])
    data.pendidikan.forEach((p: any) => {
      sheetData.push(['Jenjang', p.jenjang])
      sheetData.push(['Nama Sekolah', p.nama_sekolah])
      sheetData.push(['Jurusan', p.jurusan])
      sheetData.push(['Periode', `${p.bulan_masuk} ${p.tahun_masuk} - ${p.bulan_lulus} ${p.tahun_lulus}`])
      sheetData.push([])
    })
  }

  if (data.pengalaman?.length > 0) {
    sheetData.push([])
    sheetData.push(['PENGALAMAN KERJA'])
    data.pengalaman.forEach((p: any) => {
      sheetData.push(['Perusahaan', p.nama_perusahaan])
      sheetData.push(['Posisi', p.posisi])
      sheetData.push(['Periode', `${p.bulan_masuk} ${p.tahun_masuk} - ${p.masih_bekerja ? 'Sekarang' : `${p.bulan_keluar} ${p.tahun_keluar}`}`])
      sheetData.push(['Deskripsi', p.deskripsi_pekerjaan])
      sheetData.push([])
    })
  }

  if (data.keluarga?.length > 0) {
    sheetData.push([])
    sheetData.push(['DATA KELUARGA'])
    data.keluarga.forEach((k: any) => {
      sheetData.push(['Hubungan', k.hubungan])
      sheetData.push(['Nama', k.nama])
      sheetData.push(['Usia', k.usia ? `${k.usia} tahun` : ''])
      sheetData.push(['Pekerjaan', k.pekerjaan])
      sheetData.push([])
    })
  }

  sheetData.push([])
  sheetData.push(['KEMAMPUAN BAHASA JEPANG'])
  sheetData.push(['Level JLPT', data.level_jlpt])
  sheetData.push(['Level JFT', data.level_jft])
  sheetData.push(['Bidang SSW', data.sertifikat_ssw])
  sheetData.push(['Lama Belajar', data.lama_belajar_jepang])
  sheetData.push(['Level Bahasa Jepang', data.level_bahasa_jepang])

  sheetData.push([])
  sheetData.push(['INFORMASI LAIN'])
  sheetData.push(['Pernah ke Jepang', data.pernah_ke_jepang ? 'Ya' : 'Tidak'])
  sheetData.push(['Keluarga di Jepang', data.keluarga_di_jepang ? 'Ya' : 'Tidak'])
  sheetData.push(['Tujuan ke Jepang', data.tujuan_ke_jepang])
  sheetData.push(['Alasan ke Jepang', data.alasan_ke_jepang])
  sheetData.push(['Hobi', data.hobi])
  sheetData.push(['Keahlian', data.keahlian])

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  
  const colWidths = [{ wch: 25 }, { wch: 60 }]
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'CV Kandidat')

  const fileName = `${data.nama_romaji || data.nama || 'kandidat'}_CV.xlsx`
  XLSX.writeFile(wb, fileName)
  return fileName
}

export const generateCVWord = async (data: any) => {
  const createTableCell = (text: string, isHeader = false): TableCell => {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: text || '',
              bold: isHeader,
              size: isHeader ? 28 : 24,
            }),
          ],
        }),
      ],
      shading: isHeader ? { fill: 'E6F2FF' } : undefined,
    })
  }

  const children: (Paragraph | Table)[] = []

  children.push(
    new Paragraph({
      text: data.nama_romaji || data.nama || 'CV Kandidat',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  )

  if (data.nama_katakana) {
    children.push(
      new Paragraph({
        text: data.nama_katakana,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  const contactText = [
    data.nomor_hp,
    data.email,
    data.alamat_lengkap
  ].filter(Boolean).join(' | ')

  if (contactText) {
    children.push(
      new Paragraph({
        text: contactText,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  children.push(new Paragraph({ text: '' }))

  const addSection = (title: string, rows: [string, any][]) => {
    if (rows.length === 0) return
    
    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    )

    const tableRows = rows.map(([label, value]) => {
      if (value === undefined || value === null || value === '') return null
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
            shading: { fill: 'F5F5F5' },
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(String(value))],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    }).filter(Boolean)

    if (tableRows.length > 0) {
      children.push(
        new Table({
          rows: tableRows as TableRow[],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      )
    }
  }

  const personalRows: [string, any][] = [
    ['Nama', data.nama_romaji || data.nama],
    ['Tempat Lahir', data.tempat_lahir],
    ['Tanggal Lahir', data.tanggal_lahir ? formatDate(data.tanggal_lahir) : ''],
    ['Umur', data.umur ? `${data.umur} tahun` : ''],
    ['Jenis Kelamin', data.jenis_kelamin],
    ['Pendidikan Terakhir', data.pendidikan_terakhir],
    ['Agama', data.agama],
    ['Golongan Darah', data.golongan_darah],
    ['SIM', data.sim_dimiliki],
    ['Ukuran Baju', data.ukuran_baju],
    ['No. HP', data.nomor_hp],
    ['Email', data.email],
  ]
  addSection('DATA DIRI', personalRows)

  if (data.pendidikan?.length > 0) {
    const eduRows: [string, any][] = []
    data.pendidikan.forEach((p: any, i: number) => {
      eduRows.push([`Pendidikan #${i + 1} - Jenjang`, p.jenjang])
      eduRows.push(['Nama Sekolah', p.nama_sekolah])
      eduRows.push(['Jurusan', p.jurusan])
      eduRows.push(['Periode', `${p.bulan_masuk} ${p.tahun_masuk} - ${p.bulan_lulus} ${p.tahun_lulus}`])
    })
    addSection('RIWAYAT PENDIDIKAN', eduRows)
  }

  if (data.pengalaman?.length > 0) {
    const expRows: [string, any][] = []
    data.pengalaman.forEach((p: any, i: number) => {
      expRows.push([`Pengalaman #${i + 1} - Perusahaan`, p.nama_perusahaan])
      expRows.push(['Posisi', p.posisi])
      expRows.push(['Periode', `${p.bulan_masuk} ${p.tahun_masuk} - ${p.masih_bekerja ? 'Sekarang' : `${p.bulan_keluar} ${p.tahun_keluar}`}`])
      expRows.push(['Deskripsi', p.deskripsi_pekerjaan])
    })
    addSection('PENGALAMAN KERJA', expRows)
  }

  if (data.keluarga?.length > 0) {
    const famRows: [string, any][] = []
    data.keluarga.forEach((k: any, i: number) => {
      famRows.push([`Keluarga #${i + 1} - Hubungan`, k.hubungan])
      famRows.push(['Nama', k.nama])
      famRows.push(['Usia', k.usia ? `${k.usia} tahun` : ''])
      famRows.push(['Pekerjaan', k.pekerjaan])
    })
    addSection('DATA KELUARGA', famRows)
  }

  const jpRows: [string, any][] = [
    ['Level JLPT', data.level_jlpt],
    ['Level JFT', data.level_jft],
    ['Bidang SSW', data.sertifikat_ssw],
    ['Lama Belajar', data.lama_belajar_jepang],
    ['Level Bahasa Jepang', data.level_bahasa_jepang],
    ['Pernah ke Jepang', data.pernah_ke_jepang ? 'Ya' : 'Tidak'],
    ['Keluarga di Jepang', data.keluarga_di_jepang ? 'Ya' : 'Tidak'],
  ]
  addSection('KEMAMPUAN BAHASA JEPANG', jpRows)

  const otherRows: [string, any][] = [
    ['Tujuan ke Jepang', data.tujuan_ke_jepang],
    ['Alasan ke Jepang', data.alasan_ke_jepang],
    ['Hobi', data.hobi],
    ['Keahlian', data.keahlian],
  ]
  addSection('INFORMASI LAIN', otherRows)

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${data.nama_romaji || data.nama || 'kandidat'}_CV.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return `${data.nama_romaji || data.nama || 'kandidat'}_CV.docx`
}
