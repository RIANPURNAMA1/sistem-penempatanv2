import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/components'
import { Download, FileSpreadsheet, File as FileWord, X } from 'lucide-react'
import { TemplateClassic, TemplateModern, TemplateSimple, TemplateMadoka, TemplateNawasena, TemplateKaigo } from './cv-templates'
import { generateCVExcel, generateCVWord } from '@/lib/cvGenerator'
import { toast } from '@/hooks/useToast'

type CVTemplate = 'violeta' | 'mendunia' | 'yambo' | 'madoka' | 'nawasena' | 'kaigo'

interface KandidatCVPreviewProps {
  data: any
  onClose?: () => void
}

export default function KandidatCVPreview({ data, onClose }: KandidatCVPreviewProps) {
  const [template, setTemplate] = useState<CVTemplate>('violeta')
  const [downloading, setDownloading] = useState(false)

  const handlePrint = () => {
    const content = document.getElementById('cv-preview-content')
    if (!content) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({ title: 'Gagal membuka print window', variant: 'destructive' })
      return
    }

    const styles = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CV - ${data.nama_romaji || data.nama}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-after: always; }
          }
          @page { margin: 15mm; size: A4; }
        </style>
      </head>
      <body class="bg-white p-8">
        ${content.innerHTML}
      </body>
      </html>
    `

    printWindow.document.write(styles)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  const handleDownload = async (format: 'excel' | 'word') => {
    setDownloading(true)
    try {
      if (format === 'excel') {
        await generateCVExcel(data)
      } else if (format === 'word') {
        await generateCVWord(data)
      }
      toast({ title: 'CV berhasil didownload', variant: 'success' })
    } catch {
      toast({ title: 'Gagal download CV', variant: 'destructive' })
    } finally {
      setDownloading(false)
    }
  }

  const renderTemplate = () => {
    switch (template) {
      case 'violeta':
        return <TemplateClassic data={data} />
      case 'mendunia':
        return <TemplateModern data={data} />
      case 'yambo':
        return <TemplateSimple data={data} />
      case 'madoka':
        return <TemplateMadoka data={data} />
      case 'nawasena':
        return <TemplateNawasena data={data} />
      case 'kaigo':
        return <TemplateKaigo data={data} />
      default:
        return <TemplateClassic data={data} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Preview CV</h2>
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border flex-wrap">
              <Button
                variant={template === 'violeta' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('violeta')}
                className="text-xs px-2"
              >
                Violeta
              </Button>
              <Button
                variant={template === 'mendunia' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('mendunia')}
                className="text-xs px-2"
              >
                Mendunia
              </Button>
              <Button
                variant={template === 'yambo' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('yambo')}
                className="text-xs px-2"
              >
                Yambo
              </Button>
              <Button
                variant={template === 'madoka' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('madoka')}
                className="text-xs px-2"
              >
                Madoka
              </Button>
              <Button
                variant={template === 'nawasena' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('nawasena')}
                className="text-xs px-2"
              >
                Nawasena
              </Button>
              <Button
                variant={template === 'kaigo' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('kaigo')}
                className="text-xs px-2"
              >
                Kaigo
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={downloading}>
              <Download size={14} className="mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('excel')} disabled={downloading}>
              <FileSpreadsheet size={14} className="mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('word')} disabled={downloading}>
              <FileWord size={14} className="mr-1" /> Word
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="overflow-y-auto p-0">
          <div id="cv-preview-content" className="bg-white p-8 text-sm">
            {renderTemplate()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
