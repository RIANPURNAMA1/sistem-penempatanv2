import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/components"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/useToast"
import api from "@/lib/api"
import { Download, FileSpreadsheet, Loader2, Users } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  kandidatIds: number[]
  kandidatNames?: string[]
  onSuccess?: () => void
}

const BAHASA_DEFAULT = [
  { code: "ja", label: "Bahasa Jepang (日本語)" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "auto", label: "Otomatis (sesuai pilihan template)" },
]

/** Ambil nama file dari header Content-Disposition. */
const filenameFromDisposition = (disposition: string, fallback: string) => {
  const match = /filename="?([^";]+)"?/i.exec(disposition || "")
  return match ? match[1] : fallback
}

export default function GenerateBatchCVModal({
  open,
  onOpenChange,
  kandidatIds,
  kandidatNames = [],
  onSuccess,
}: Props) {
  const [templates, setTemplates] = useState<any[]>([])
  const [templateId, setTemplateId] = useState("")
  const [bahasa, setBahasa] = useState("ja")
  const [opsiBahasa, setOpsiBahasa] = useState<{ code: string; label: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      api.get("/cv-template"),
      api.get("/cv-template/bahasa").catch(() => ({ data: { data: [] } })),
    ])
      .then(([tplRes, bahasaRes]) => {
        const tpls = tplRes.data?.data || []
        setTemplates(tpls)
        const active = tpls.find((t: any) => t.is_active) || tpls[0]
        setTemplateId(active ? String(active.id) : "")
        const list = bahasaRes.data?.data || []
        setOpsiBahasa(list.length ? list : BAHASA_DEFAULT)
      })
      .catch(() => toast({ title: "Gagal memuat template CV", variant: "destructive" }))
      .finally(() => setLoading(false))
  }, [open])

  const generate = async () => {
    if (!kandidatIds.length) {
      toast({ title: "Pilih kandidat terlebih dahulu", variant: "destructive" })
      return
    }
    if (!templateId) {
      toast({ title: "Pilih template CV terlebih dahulu", variant: "destructive" })
      return
    }

    setGenerating(true)
    try {
      const res = await api.post(
        "/cv-template/generate/batch",
        {
          cv_template_id: templateId,
          bahasa,
          kandidat_ids: kandidatIds,
        },
        { responseType: "blob" }
      )

      const disposition = res.headers?.["content-disposition"] || ""
      const name = filenameFromDisposition(disposition, "CV_Massal.zip")
      const sukses = Number(res.headers?.["x-cv-batch-success"] || kandidatIds.length)
      const gagal = Number(res.headers?.["x-cv-batch-failed"] || 0)

      const blobUrl = URL.createObjectURL(res.data as Blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = name
      a.rel = "noopener"
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 4000)

      toast({
        title: `${sukses} CV berhasil digenerate`,
        description: gagal
          ? `${gagal} kandidat gagal — periksa _ringkasan.txt di dalam ZIP.`
          : "Semua CV berhasil dibuat dan diunduh sebagai ZIP.",
        variant: gagal ? "destructive" : ("success" as any),
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      let message = e?.response?.data?.message
      const data = e?.response?.data
      if (!message && data instanceof Blob) {
        try {
          message = JSON.parse(await data.text())?.message
        } catch {
          /* bukan JSON */
        }
      }
      toast({ title: message || "Gagal generate CV massal", variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-16px)] sm:max-w-md rounded-xl p-0">
        <div className="px-3 py-3 border-b bg-gray-50/80 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={15} className="text-[#1e3a5f]" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-gray-900">
                Generate CV Massal
              </DialogTitle>
              <p className="text-[10px] text-gray-500">
                Satu template untuk {kandidatIds.length} kandidat sekaligus
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 space-y-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-gray-700">Template CV</Label>
            <Select value={templateId} onValueChange={setTemplateId} disabled={loading || generating}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={loading ? "Memuat..." : "Pilih template"} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nama_template}
                    {t.is_active ? " (aktif)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-gray-700">Bahasa CV</Label>
            <Select value={bahasa} onValueChange={setBahasa} disabled={generating}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opsiBahasa.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50/60 px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users size={12} className="text-gray-500" />
              <span className="text-[11px] font-medium text-gray-700">
                {kandidatIds.length} kandidat dipilih
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-0.5">
              {kandidatNames.length ? (
                kandidatNames.map((nama, i) => (
                  <p key={i} className="text-[11px] text-gray-500 truncate">
                    {i + 1}. {nama || "-"}
                  </p>
                ))
              ) : (
                <p className="text-[11px] text-gray-400">Kandidat terpilih</p>
              )}
            </div>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Semua CV akan dibuat dengan template di atas lalu diunduh sebagai satu file ZIP.
            Kandidat yang gagal dicatat di <span className="font-medium">_ringkasan.txt</span>.
          </p>
        </div>

        <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generating}
            className="h-8 px-3 text-[11px]"
          >
            Batal
          </Button>
          <Button
            onClick={generate}
            disabled={generating || loading || !kandidatIds.length}
            className="h-8 px-3 text-[11px] bg-[#1e3a5f] hover:bg-[#2d5a8a]"
          >
            {generating ? (
              <Loader2 size={13} className="mr-1 animate-spin" />
            ) : (
              <Download size={13} className="mr-1" />
            )}
            {generating ? "Memproses..." : "Generate & Unduh ZIP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
