import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/components"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/useToast"
import api from "@/lib/api"
import { Languages, Loader2, Save, Sparkles, AlertTriangle } from "lucide-react"

interface FieldTerjemahan {
  key: string
  label: string
  asal: string
  terjemahan: string
  sumber: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  kandidatId: number | string
  kandidatName?: string
  bahasa?: string
}

export default function TerjemahanModal({
  open,
  onOpenChange,
  kandidatId,
  kandidatName,
  bahasa = "ja",
}: Props) {
  const [fields, setFields] = useState<FieldTerjemahan[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiTersedia, setAiTersedia] = useState(false)
  const [lang, setLang] = useState(bahasa)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/cv-template/terjemahan/${kandidatId}`, { params: { bahasa: lang } })
      const list = res.data?.data?.fields || []
      setFields(list)
      setAiTersedia(!!res.data?.data?.ai_tersedia)
      const map: Record<string, string> = {}
      list.forEach((f: FieldTerjemahan) => {
        map[f.key] = f.terjemahan || ""
      })
      setValues(map)
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Gagal memuat data terjemahan", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) load()
  }, [open, kandidatId, lang])

  const simpan = async () => {
    setSaving(true)
    try {
      const translations: Record<string, string> = {}
      Object.keys(values).forEach((k) => {
        if (values[k] && values[k].trim()) translations[k] = values[k].trim()
      })
      if (!Object.keys(translations).length) {
        toast({ title: "Isi dulu kolom bahasa target", variant: "destructive" })
        return
      }
      const res = await api.put(`/cv-template/terjemahan/${kandidatId}`, { bahasa: lang, translations })
      toast({ title: res.data?.message || "Terjemahan disimpan", variant: "success" as any })
      load()
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Gagal menyimpan terjemahan", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const terjemahkanOtomatis = async () => {
    setAiBusy(true)
    try {
      const res = await api.post(`/cv-template/terjemahan/${kandidatId}/auto`, { bahasa: lang })
      toast({ title: res.data?.message || "Terjemahan otomatis selesai", variant: "success" as any })
      load()
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Terjemahan otomatis gagal", variant: "destructive" })
    } finally {
      setAiBusy(false)
    }
  }

  const belum = fields.filter((f) => !values[f.key]?.trim()).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-16px)] sm:max-w-3xl max-h-[90dvh] overflow-y-auto rounded-xl p-0">
        <div className="px-4 py-3 border-b bg-gray-50/80 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Languages size={16} className="text-[#1e3a5f]" />
              <div>
                <DialogTitle className="text-sm font-semibold text-gray-900">
                  Kelola Terjemahan CV
                </DialogTitle>
                <p className="text-[10px] text-gray-500">
                  {kandidatName ? `${kandidatName} · ` : ""}terjemahan teks bebas untuk isi CV
                </p>
              </div>
            </div>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="h-8 w-[190px] bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja">Bahasa Jepang (日本語)</SelectItem>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          <div className="rounded-lg border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 px-3 py-2 text-[11px] text-gray-600 leading-relaxed">
            Isian <strong>teks bebas</strong> (tujuan, alasan, kelebihan, keahlian, promosi diri, dll)
            perlu diterjemahkan agar CV berbahasa Jepang. Nilai terstruktur (agama, jenis kelamin,
            status pernikahan, jenjang) otomatis diterjemahkan oleh sistem.
            {belum > 0 && (
              <span className="block mt-1 font-semibold text-amber-700">
                {belum} isian belum diterjemahkan.
              </span>
            )}
          </div>

          {aiTersedia ? (
            <Button
              variant="outline"
              size="sm"
              onClick={terjemahkanOtomatis}
              disabled={aiBusy}
              className="h-8 text-xs"
            >
              {aiBusy ? <Loader2 size={13} className="mr-1 animate-spin" /> : <Sparkles size={13} className="mr-1" />}
              Terjemahkan otomatis (AI)
            </Button>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <p>
                Terjemahan otomatis (AI) belum aktif. Tambahkan <code>GROQ_API_KEY</code> di{" "}
                <code>backend/.env</code> atau isi manual kolom di bawah.
              </p>
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
              <p className="text-gray-400 text-xs mt-2">Memuat isian...</p>
            </div>
          ) : fields.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8 border border-dashed rounded-xl">
              Tidak ada isian teks bebas pada kandidat ini.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.key} className="border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-700">{f.label}</p>
                    {values[f.key]?.trim() && f.sumber && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 uppercase">
                        {f.sumber}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x">
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                        Bahasa Indonesia (asli)
                      </p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {f.asal || "—"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                        {lang === "ja" ? "Bahasa Jepang (日本語)" : "Bahasa Indonesia"}
                      </p>
                      <Textarea
                        value={values[f.key] || ""}
                        onChange={(e) =>
                          setValues((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        rows={Math.min(6, Math.max(2, (f.asal || "").split("\n").length + 1))}
                        placeholder={lang === "ja" ? "日本語で入力" : "Tulis dalam bahasa Indonesia"}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t bg-gray-50/80 rounded-b-xl flex justify-end gap-2 sticky bottom-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 px-3 text-xs">
            Tutup
          </Button>
          <Button
            onClick={simpan}
            disabled={saving || loading}
            className="h-8 px-3 text-xs bg-[#1e3a5f] hover:bg-[#2d5a8a]"
          >
            {saving ? <Loader2 size={13} className="mr-1 animate-spin" /> : <Save size={13} className="mr-1" />}
            Simpan Terjemahan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
