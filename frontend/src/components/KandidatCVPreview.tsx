import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/components'
import { Download, FileSpreadsheet, File as FileWord, X } from 'lucide-react'
import { TemplateClassic, TemplateModern, TemplateSimple } from './cv-templates'
import { generateCVExcel, generateCVWord } from '@/lib/cvGenerator'
import { toast } from '@/hooks/useToast'

type CVTemplate = 'classic' | 'modern' | 'simple'

interface KandidatCVPreviewProps {
  data: any
  onClose?: () => void
}

export default function KandidatCVPreview({ data, onClose }: KandidatCVPreviewProps) {
  const [template, setTemplate] = useState<CVTemplate>('modern')
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
      case 'classic':
        return <TemplateClassic data={data} />
      case 'modern':
        return <TemplateModern data={data} />
      case 'simple':
        return <TemplateSimple data={data} />
      default:
        return <TemplateModern data={data} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Preview CV</h2>
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border">
              <Button
                variant={template === 'classic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('classic')}
                className="text-xs px-2"
              >
                Classic
              </Button>
              <Button
                variant={template === 'modern' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('modern')}
                className="text-xs px-2"
              >
                Modern
              </Button>
              <Button
                variant={template === 'simple' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTemplate('simple')}
                className="text-xs px-2"
              >
                Simple
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
