import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, File as FileWord, X, Loader2, Pencil, Eye } from 'lucide-react'
import { TemplateClassic, TemplateModern, TemplateSimple, TemplateMadoka, TemplateNawasena, TemplateKaigo } from './cv-templates'
import { generateCVExcel, generateCVWord, generateCVExcelFromElement } from '@/lib/cvGenerator'
import { toast } from '@/hooks/useToast'

type CVTemplate = 'violeta' | 'mendunia' | 'yambo' | 'madoka' | 'nawasena' | 'kaigo'

interface KandidatCVPreviewProps {
  data: any
  onClose?: () => void
}

const TEMPLATES: { id: CVTemplate; label: string; desc: string }[] = [
  { id: 'violeta', label: 'Violeta', desc: 'Rirekisho Jepang' },
  { id: 'mendunia', label: 'Mendunia', desc: 'Modern berwarna' },
  { id: 'yambo', label: 'Yambo', desc: 'Ringkas' },
  { id: 'madoka', label: 'Madoka', desc: 'Detail lengkap' },
  { id: 'nawasena', label: 'Nawasena', desc: 'Klasik formal' },
  { id: 'kaigo', label: 'Kaigo', desc: '面談シート' },
]

function setByPath(obj: any, path: string, value: string) {
  const keys = path.split('.')
  const clone = Array.isArray(obj) ? [...obj] : { ...obj }
  let cur: any = clone
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    const nextKey = keys[i + 1]
    const isArrIndex = /^\d+$/.test(nextKey)
    if (Array.isArray(cur[k])) {
      cur[k] = [...cur[k]]
    } else if (cur[k] && typeof cur[k] === 'object') {
      cur[k] = { ...cur[k] }
    } else {
      cur[k] = isArrIndex ? [] : {}
    }
    cur = cur[k]
  }
  cur[keys[keys.length - 1]] = value
  return clone
}

export default function KandidatCVPreview({ data, onClose }: KandidatCVPreviewProps) {
  const [template, setTemplate] = useState<CVTemplate>('violeta')
  const [downloading, setDownloading] = useState<'pdf' | 'excel' | 'word' | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState<any>(data)

  // sinkronkan bila data sumber berubah (mis. ganti kandidat)
  const sourceKey = data?.id ?? data?.nomor_peserta ?? null
  const [lastSourceKey, setLastSourceKey] = useState(sourceKey)
  if (sourceKey !== lastSourceKey) {
    setLastSourceKey(sourceKey)
    setEditedData(data)
  }

  const cvData = editedData

  const handleEdit = (path: string, value: string) => {
    setEditedData((prev: any) => setByPath(prev, path, value))
  }

  const namaFile = cvData.nama_romaji || cvData.nama || 'kandidat'

  const renderTemplate = () => {
    switch (template) {
      case 'violeta':
        return <TemplateClassic data={cvData} />
      case 'mendunia':
        return (
          <TemplateModern
            data={cvData}
            editable={editMode}
            onEdit={handleEdit}
          />
        )
      case 'yambo':
        return <TemplateSimple data={cvData} />
      case 'madoka':
        return <TemplateMadoka data={cvData} />
      case 'nawasena':
        return <TemplateNawasena data={cvData} />
      case 'kaigo':
        return <TemplateKaigo data={cvData} />
      default:
        return <TemplateClassic data={cvData} />
    }
  }

  const handlePrint = async () => {
    const content = document.getElementById('cv-preview-content')
    if (!content) return

    setDownloading('pdf')
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width

      let heightLeft = imgH
      let position = 0

      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgW, imgH)
      heightLeft -= pageH

      while (heightLeft > 0) {
        position = heightLeft - imgH
        pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgW, imgH)
        heightLeft -= pageH
      }

      pdf.save(`${namaFile}_CV.pdf`)
      toast({ title: 'CV berhasil didownload', variant: 'success' as any })
    } catch {
      toast({ title: 'Gagal download CV', variant: 'destructive' })
    } finally {
      setDownloading(null)
    }
  }

  const handleDownload = async (format: 'excel' | 'word') => {
    setDownloading(format)
    try {
      if (format === 'excel') {
        const content = document.getElementById('cv-preview-content')
        if (content) {
          await generateCVExcelFromElement(content, namaFile)
        } else {
          await generateCVExcel(cvData)
        }
      } else {
        await generateCVWord(cvData)
      }
      toast({ title: 'CV berhasil didownload', variant: 'success' as any })
    } catch {
      toast({ title: 'Gagal download CV', variant: 'destructive' })
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[95vh] bg-slate-100 rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {/* ── TOOLBAR ── */}
        <div className="bg-white border-b shrink-0">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e3a5f] text-white shrink-0">
                <FileWord size={16} />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold leading-tight truncate">
                  Preview CV
                </h2>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">
                  {data.nama_romaji || data.nama} • {data.nama_cabang || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {template === 'mendunia' && (
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditMode((v) => !v)}
                  title={
                    editMode
                      ? 'Selesai mengedit — klik cell untuk mengubah isi CV'
                      : 'Edit isi CV langsung di kertas'
                  }
                >
                  {editMode ? <Eye size={14} className="mr-1" /> : <Pencil size={14} className="mr-1" />}
                  {editMode ? 'Selesai' : 'Edit'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={downloading !== null}
                className="hidden sm:inline-flex"
              >
                {downloading === 'pdf' ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Download size={14} className="mr-1" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('excel')}
                disabled={downloading !== null}
                className="hidden sm:inline-flex"
              >
                {downloading === 'excel' ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <FileSpreadsheet size={14} className="mr-1" />
                )}
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('word')}
                disabled={downloading !== null}
                className="hidden sm:inline-flex"
              >
                {downloading === 'word' ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <FileWord size={14} className="mr-1" />
                )}
                Word
              </Button>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={18} />
                </Button>
              )}
            </div>
          </div>

          {/* ── TEMPLATE PICKER ── */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {TEMPLATES.map((t) => {
              const active = template === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-lg border text-left transition-colors shrink-0 ${
                    active
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">
                    {t.label}
                  </span>
                  <span
                    className={`text-[10px] leading-tight ${
                      active ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {t.desc}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Mobile download row */}
          <div className="flex gap-2 px-4 pb-3 sm:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={downloading !== null} className="flex-1">
              <Download size={14} className="mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('excel')} disabled={downloading !== null} className="flex-1">
              <FileSpreadsheet size={14} className="mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('word')} disabled={downloading !== null} className="flex-1">
              <FileWord size={14} className="mr-1" /> Word
            </Button>
          </div>
        </div>

        {/* ── PREVIEW KERTAS A4 ── */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {editMode && (
            <div className="max-w-[210mm] mx-auto mb-3 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-800">
              <Pencil size={13} className="mt-0.5 shrink-0" />
              <span>
                <b>Mode Edit</b> — klik teks di kertas untuk mengubah. <b>Bold</b> / <i>Italic</i> /
                perataan lewat toolbar melayang. <b>Garis</b>: pilih cell lalu atur border per sisi
                (atas/bawah/kiri/kanan) di toolbar. <b>Ukuran</b>: tarik garis di antara kolom/baris
                untuk melebarkan atau menyempitkan. Klik di luar cell untuk menyimpan.
              </span>
            </div>
          )}
          <div
            id="cv-preview-content"
            className={`bg-white mx-auto shadow-lg transition-shadow ${
              editMode ? 'ring-1 ring-sky-300' : 'ring-1 ring-black/5'
            }`}
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '12mm',
              boxSizing: 'border-box',
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  )
}
