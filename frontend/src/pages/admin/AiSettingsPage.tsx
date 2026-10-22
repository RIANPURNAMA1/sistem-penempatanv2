import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/components"
import { toast } from "@/hooks/useToast"
import api from "@/lib/api"
import { Bot, CheckCircle2, Eye, EyeOff, Loader2, Save, Zap } from "lucide-react"

export default function AiSettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("qwen/qwen3.8-27b")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [terisi, setTerisi] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [keyRes, modelRes] = await Promise.all([
        api.get("/settings/groq_api_key"),
        api.get("/settings/groq_model"),
      ])
      const value = keyRes.data?.data?.setting_value || ""
      setApiKey(value)
      setTerisi(!!value)
      setModel(modelRes.data?.data?.setting_value || "qwen/qwen3.8-27b")
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Gagal memuat pengaturan AI", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const simpan = async () => {
    setSaving(true)
    try {
      await api.put("/settings/groq_api_key", { setting_value: apiKey.trim(), setting_type: "string" })
      await api.put("/settings/groq_model", { setting_value: model.trim(), setting_type: "string" })
      toast({ title: "Pengaturan AI disimpan", variant: "success" as any })
      load()
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Gagal menyimpan", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const test = async () => {
    setTesting(true)
    try {
      const res = await api.post("/settings/ai/test")
      toast({
        title: res.data?.message || "Koneksi berhasil",
        description: res.data?.data?.contoh,
        variant: "success" as any,
      })
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Koneksi gagal", variant: "destructive" })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="w-full min-w-0 space-y-3 px-2.5 sm:px-4 md:px-6 py-3 sm:py-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-bold text-foreground leading-tight truncate">
            AI (Groq)
          </h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
            Kunci API untuk penerjemahan otomatis isi CV dan AI Assistant
          </p>
        </div>
      </div>

      <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
        <Bot size={16} className="text-[#1e3a5f] shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
          Kunci API ini dipakai untuk <strong>menerjemahkan isi CV ke bahasa Jepang</strong>
          (menu Generate CV &gt; Kelola Terjemahan &gt; Terjemahkan otomatis) dan untuk
          AI Assistant di Dashboard. Kunci disimpan di database (bukan di kode) dan hanya
          bisa dibaca oleh Admin Penempatan.
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="required">Groq API Key</Label>
          <div className="flex gap-2">
            <Input
              type={show ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="h-9 text-xs sm:text-sm font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShow((v) => !v)}
              title={show ? "Sembunyikan" : "Tampilkan"}
              className="h-9 w-9 shrink-0"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Ambil di <span className="font-mono">console.groq.com/keys</span> — paste key
            lengkap (gsk_...). {terisi && "Key saat ini tersimpan (disamarkan demi keamanan)."}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Model</Label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="qwen/qwen3.8-27b"
            className="h-9 text-xs sm:text-sm font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: <span className="font-mono">qwen/qwen3.8-27b</span> (cepat) atau{" "}
            <span className="font-mono">llama-3.3-70b-versatile</span> (lebih akurat).
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            onClick={simpan}
            disabled={saving || loading}
            className="h-9 px-3 text-xs bg-[#1e3a5f] hover:bg-[#2d5a8a]"
          >
            {saving ? <Loader2 size={13} className="mr-1 animate-spin" /> : <Save size={13} className="mr-1" />}
            Simpan
          </Button>
          <Button variant="outline" onClick={test} disabled={testing || loading} className="h-9 px-3 text-xs">
            {testing ? <Loader2 size={13} className="mr-1 animate-spin" /> : <Zap size={13} className="mr-1" />}
            Test Koneksi
          </Button>
          {!terisi && !loading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 self-center">
              <CheckCircle2 size={12} /> Belum ada key — penerjemahan otomatis nonaktif
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">Alternatif: environment</p>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Bila ingin memakai server tanpa menyimpan key di database, isi di file{" "}
          <span className="font-mono">backend/.env</span>:
        </p>
        <pre className="mt-2 text-[11px] font-mono bg-gray-50 border rounded-lg p-2.5 overflow-x-auto">
{`GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GROQ_MODEL=qwen/qwen3.8-27b`}
        </pre>
        <p className="text-[11px] text-gray-500 mt-1.5">
          Urutan pembacaan: database (UI) → environment. Restart backend setelah mengubah .env.
        </p>
      </div>
    </div>
  )
}
