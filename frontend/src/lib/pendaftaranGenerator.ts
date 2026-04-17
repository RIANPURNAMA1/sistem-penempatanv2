import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const BASE_URL = 'https://matchingjob.mendunia.id/dokumen'

const getFullUrl = (path: string | null | undefined): string | null => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE_URL}/${path}`
}

export const generatePendaftaranPDF = async (data: any) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 15

  const addLine = () => {
    y += 8
    if (y > 280) {
      doc.addPage()
      y = 15
    }
  }

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('DATA PENDAFTARAN', pageWidth / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(data.nama || '-', 20, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`NIK: ${data.nik || '-'}`, 20, y)
  y += 6
  doc.text(`Email: ${data.email || '-'}`, 20, y)
  y += 6
  doc.text(`No. WA: ${data.no_wa || '-'}`, 20, y)
  y += 10

  doc.setLineWidth(0.5)
  doc.line(20, y, pageWidth - 20, y)
  y += 8

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
    addLine()
  }

  section('DATA PRIBADI')
  field('Jenis Kelamin', data.jenis_kelamin)
  field('Agama', data.agama)
  field('Tempat Lahir', data.tempat_lahir)
  field('Tanggal Lahir', data.tempat_tanggal_lahir)
  field('Pendidikan Terakhir', data.pendidikan_terakhir)
  field('Status', data.status)

  addLine()
  section('PROGRAM')
  field('ID Prometric', data.id_prometric)
  field('Status JFT', data.status_jft)
  field('Status SSW', data.status_ssw)
  field('Verifikasi', data.verifikasi)
  field('Cabang', data.nama_cabang)
  field('Tanggal Pendaftaran', data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')

  if (data.dokumen) {
    addLine()
    section('DOKUMEN')

    const docs = [
      { label: 'Pas Foto', path: data.dokumen.foto },
      { label: 'KTP', path: data.dokumen.ktp },
      { label: 'KK', path: data.dokumen.kk },
      { label: 'Ijazah', path: data.dokumen.ijasah },
      { label: 'Akte Kelahiran', path: data.dokumen.akte },
      { label: 'Bukti Pelunasan', path: data.dokumen.bukti_pelunasan },
      { label: 'Sertifikat JFT', path: data.dokumen.sertifikat_jft },
    ]

    for (const item of docs) {
      const url = getFullUrl(item.path)
      if (!url) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text(`${item.label}: Tidak ada dokumen`, 20, y)
        doc.setTextColor(0, 0, 0)
        y += 6
      } else {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`${item.label}:`, 20, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 102, 204)
        doc.textWithLink(url, 45, y, { url })
        doc.setTextColor(0, 0, 0)
        y += 6
      }
      addLine()
    }

    if (data.dokumen.sertifikat_ssw && Array.isArray(data.dokumen.sertifikat_ssw)) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Sertifikat SSW:', 20, y)
      y += 6
      data.dokumen.sertifikat_ssw.forEach((path: string, idx: number) => {
        const url = getFullUrl(path)
        if (url) {
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 102, 204)
          doc.textWithLink(`Sertifikat SSW #${idx + 1}: ${url}`, 25, y, { url })
          doc.setTextColor(0, 0, 0)
          y += 6
          addLine()
        }
      })
    }
  }

  const fileName = `${(data.nama || 'pendaftaran').replace(/\s+/g, '_')}_Pendaftaran.pdf`
  doc.save(fileName)
  return fileName
}

export const downloadDokumen = async (path: string | null | undefined, label: string) => {
  const url = getFullUrl(path)
  if (!url) {
    throw new Error('Dokumen tidak ditemukan')
  }

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${label}_${Date.now()}.${blob.type.split('/')[1] || 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
    return true
  } catch (error) {
    throw new Error('Gagal download dokumen')
  }
}

export const generatePendaftaranExcel = (data: any) => {
  const wb = XLSX.utils.book_new()

  const sheetData: any[][] = []

  sheetData.push(['DATA PENDAFTARAN'])
  sheetData.push([])
  sheetData.push(['DATA DIRI'])
  sheetData.push(['Nama', data.nama || '-'])
  sheetData.push(['NIK', data.nik || '-'])
  sheetData.push(['Email', data.email || '-'])
  sheetData.push(['No. WA', data.no_wa || '-'])
  sheetData.push(['Jenis Kelamin', data.jenis_kelamin || '-'])
  sheetData.push(['Agama', data.agama || '-'])
  sheetData.push(['Tempat Lahir', data.tempat_lahir || '-'])
  sheetData.push(['Tanggal Lahir', data.tempat_tanggal_lahir || '-'])
  sheetData.push(['Pendidikan Terakhir', data.pendidikan_terakhir || '-'])
  sheetData.push(['Status', data.status || '-'])

  sheetData.push([])
  sheetData.push(['PROGRAM'])
  sheetData.push(['ID Prometric', data.id_prometric || '-'])
  sheetData.push(['Status JFT', data.status_jft || '-'])
  sheetData.push(['Status SSW', data.status_ssw || '-'])
  sheetData.push(['Verifikasi', data.verifikasi || '-'])
  sheetData.push(['Cabang', data.nama_cabang || '-'])
  sheetData.push(['Tanggal Pendaftaran', data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'])

  if (data.dokumen) {
    sheetData.push([])
    sheetData.push(['DOKUMEN'])
    sheetData.push(['Pas Foto', getFullUrl(data.dokumen.foto) || '-'])
    sheetData.push(['KTP', getFullUrl(data.dokumen.ktp) || '-'])
    sheetData.push(['KK', getFullUrl(data.dokumen.kk) || '-'])
    sheetData.push(['Ijazah', getFullUrl(data.dokumen.ijasah) || '-'])
    sheetData.push(['Akte Kelahiran', getFullUrl(data.dokumen.akte) || '-'])
    sheetData.push(['Bukti Pelunasan', getFullUrl(data.dokumen.bukti_pelunasan) || '-'])
    sheetData.push(['Sertifikat JFT', getFullUrl(data.dokumen.sertifikat_jft) || '-'])
    
    if (data.dokumen.sertifikat_ssw && Array.isArray(data.dokumen.sertifikat_ssw)) {
      sheetData.push(['Sertifikat SSW'])
      data.dokumen.sertifikat_ssw.forEach((path: string, idx: number) => {
        sheetData.push([`Sertifikat SSW #${idx + 1}`, getFullUrl(path) || '-'])
      })
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  
  const colWidths = [{ wch: 25 }, { wch: 80 }]
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Data Pendaftaran')

  const fileName = `${(data.nama || 'pendaftaran').replace(/\s+/g, '_')}_Pendaftaran.xlsx`
  XLSX.writeFile(wb, fileName)
  return fileName
}
