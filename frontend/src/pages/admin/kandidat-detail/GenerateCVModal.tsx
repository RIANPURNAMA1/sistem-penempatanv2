import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label, Textarea } from "@/components/ui/components"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/useToast"
import api, { fileUrl } from "@/lib/api"
import TerjemahanModal from "@/components/admin/TerjemahanModal"
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Languages,
  RotateCcw,
  Save,
  Search,
  Pencil,
} from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  kandidatId: number | string
  kandidatName?: string
}

interface PreviewValue {
  key: string
  label: string
  value: string
  raw: string
  hasValue: boolean
  known: boolean
  mismatch: boolean
  dropdown: string[] | null
}

/** Tahapan proses generate CV (untuk animasi progress). */
const PROGRESS_STEPS: { at: number; label: string }[] = [
  { at: 0, label: "Mengambil data kandidat..." },
  { at: 22, label: "Membaca template Excel..." },
  { at: 45, label: "Mengisi placeholder dari data kandidat..." },
  { at: 70, label: "Menyusun sel & menempel foto..." },
  { at: 88, label: "Menyimpan file CV..." },
  { at: 96, label: "Menyiapkan unduhan..." },
]

const labelForProgress = (value: number) => {
  let label = PROGRESS_STEPS[0].label
  PROGRESS_STEPS.forEach((s) => {
    if (value >= s.at) label = s.label
  })
  return label
}

const BAHASA_DEFAULT = [
  { code: "ja", label: "Bahasa Jepang (日本語)" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "auto", label: "Otomatis (sesuai pilihan template)" },
]

export default function GenerateCVModal({ open, onOpenChange, kandidatId, kandidatName }: Props) {
  const [templates, setTemplates] = useState<any[]>([])
  const [selected, setSelected] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [preview, setPreview] = useState<PreviewValue[] | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState("")
  const [done, setDone] = useState(false)
  const [bahasa, setBahasa] = useState("ja")
  const [opsiBahasa, setOpsiBahasa] = useState<{ code: string; label: string }[]>([])
  const [showTerjemahan, setShowTerjemahan] = useState(false)
  const [edit, setEdit] = useState<Record<string, string>>({})
  const [cari, setCari] = useState("")
  const [saving, setSaving] = useState(false)
  const progressRef = useRef(0)

  // Animasi progress: naik pelan sampai 92% selagi request berjalan,
  // lalu 100% ketika server selesai.
  useEffect(() => {
    if (!generating) return
    const timer = setInterval(() => {
      const current = progressRef.current
      if (current >= 92) return
      const next = Math.min(current + Math.max(1, Math.round((92 - current) / 12)), 92)
      progressRef.current = next
      setProgress(next)
      setProgressLabel(labelForProgress(next))
    }, 130)
    return () => clearInterval(timer)
  }, [generating])

  const load = async () => {
    setLoading(true)
    try {
      const [tplRes, histRes] = await Promise.all([
        api.get("/cv-template"),
        api.get(`/cv-template/generate/history/${kandidatId}`),
      ])
      const tpls = tplRes.data?.data || []
      setTemplates(tpls)
      const active = tpls.find((t: any) => t.is_active)
      if (active) setSelected(String(active.id))
      else if (tpls[0]) setSelected(String(tpls[0].id))
      setHistory(histRes.data?.data || [])
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Gagal memuat template CV", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  /** Ambil daftar bahasa isian CV dari server (fallback ke daftar bawaan). */
  const loadBahasa = async () => {
    try {
      const res = await api.get("/cv-template/bahasa")
      const list = res.data?.data || []
      if (list.length) setOpsiBahasa(list)
    } catch {
      /* pakai daftar bawaan */
    }
  }

  useEffect(() => {
    if (open) {
      setPreview(null)
      setWarnings([])
      setEdit({})
      setCari("")
      load()
      loadBahasa()
    }
  }, [open, kandidatId])

  /** Nilai yang dikoreksi admin (hanya yang berubah). */
  const overrides = useMemo(() => {
    const out: Record<string, string> = {}
    if (!preview) return out
    preview.forEach((p) => {
      const val = edit[p.key]
      if (val !== undefined && val !== p.value) out[p.key] = val
    })
    return out
  }, [preview, edit])

  const jumlahOverride = Object.keys(overrides).length

  const loadPreview = async () => {
    if (!selected) {
      toast({ title: "Pilih template terlebih dahulu", variant: "destructive" })
      return
    }
    setPreviewLoading(true)
    try {
      const res = await api.post(`/cv-template/generate/preview/${kandidatId}`, {
        cv_template_id: selected,
        bahasa,
        overrides,
      })
      const values = res.data?.data?.values || []
      setPreview(values)
      const map: Record<string, string> = {}
      values.forEach((v: PreviewValue) => {
        map[v.key] = v.value
      })
      setEdit(map)
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Gagal memuat pratinjau", variant: "destructive" })
    } finally {
      setPreviewLoading(false)
    }
  }

  /** Simpan koreksi admin ke data kandidat (dipakai lagi di generate berikutnya). */
  const simpanKeKandidat = async () => {
    if (!jumlahOverride) {
      toast({ title: "Belum ada nilai yang dikoreksi", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const translations: Record<string, string> = {}
      Object.keys(overrides).forEach((k) => {
        const v = overrides[k]
        if (v !== undefined && String(v).trim() !== "") translations[k] = v
      })
      const res = await api.put(`/cv-template/terjemahan/${kandidatId}`, {
        bahasa,
        translations,
      })
      toast({
        title: res.data?.message || "Nilai tersimpan ke kandidat",
        description: "Nilai koreksi akan dipakai pada generate CV berikutnya.",
        variant: "success" as any,
      })
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Gagal menyimpan", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const generate = async () => {
    setGenerating(true)
    setDone(false)
    setWarnings([])
    setProgress(3)
    progressRef.current = 3
    setProgressLabel(labelForProgress(3))
    try {
      const res = await api.post(
        `/cv-template/generate/${kandidatId}`,
        selected
          ? { cv_template_id: selected, bahasa, overrides }
          : { bahasa, overrides }
      )
      if (res.data?.success) {
        const w = res.data.data?.warnings || []
        setWarnings(w)
        setProgress(100)
        progressRef.current = 100
        setProgressLabel("Selesai — file CV siap diunduh")
        setDone(true)
        toast({
          title: "CV berhasil digenerate",
          description: w.length ? `${w.length} catatan perlu diperiksa.` : undefined,
          variant: "success" as any,
        })
        const url = fileUrl(res.data.data?.download_url || "")
        if (url) {
          try {
            // Unduh lewat endpoint berautentikasi: tidak memuat halaman baru.
            await triggerDownload(
              `/cv-template/generated/download/${res.data.data.id}`,
              res.data.data.file_name || "cv.xlsx"
            )
          } catch {
            if (url) window.open(url, "_blank")
          }
        }
        load()
      } else {
        setProgress(0)
        progressRef.current = 0
        setProgressLabel("")
        toast({ title: res.data?.message || "Gagal generate CV", variant: "destructive" })
      }
    } catch (e: any) {
      setProgress(0)
      progressRef.current = 0
      setProgressLabel("")
      toast({ title: e.response?.data?.message || "Gagal generate CV", variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Unduh file lewat fetch + blob lalu klik anchor.
   * Tidak memakai window.open supaya halaman tidak ter-navigasi/refresh.
   */
  const triggerDownload = async (url: string, fallbackName: string) => {
    const res = await api.get(url, { responseType: "blob" })
    const disposition = res.headers?.["content-disposition"] || ""
    const match = /filename="?([^";]+)"?/i.exec(disposition)
    const name = match ? match[1] : fallbackName
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
  }

  const download = async (item: any) => {
    try {
      await triggerDownload(`/cv-template/generated/download/${item.id}`, item.file_name || "cv.xlsx")
    } catch {
      const url = fileUrl(String(item.path_file || "").replace(/^uploads\//, "/uploads/"))
      if (url) window.open(url, "_blank")
    }
  }

  const daftarPratinjau = useMemo(() => {
    if (!preview) return []
    const q = cari.trim().toLowerCase()
    if (!q) return preview
    return preview.filter(
      (p) =>
        p.key.toLowerCase().includes(q) ||
        (p.label || "").toLowerCase().includes(q) ||
        (p.value || "").toLowerCase().includes(q)
    )
  }, [preview, cari])

  const terisi = preview ? preview.filter((p) => p.hasValue).length : 0
  const kosong = preview ? preview.length - terisi : 0
  const tidakCocok = preview ? preview.filter((p) => p.mismatch).length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-16px)] sm:max-w-5xl max-h-[94dvh] overflow-y-auto rounded-xl p-0">
        <div className="px-4 sm:px-5 py-3 border-b bg-gray-50/80 rounded-t-xl sticky top-0 z-20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet size={18} /> Generate CV
            </DialogTitle>
          </DialogHeader>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Kandidat: <span className="font-medium text-gray-800">{kandidatName || `#${kandidatId}`}</span>
          </p>
        </div>

        <div className="px-4 sm:px-5 py-4 space-y-4">
          {/* ── Template & bahasa ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Pilih Template</Label>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                  <Loader2 size={16} className="animate-spin" /> Memuat template...
                </div>
              ) : templates.length === 0 ? (
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  Belum ada template CV. Silakan upload template di menu <strong>Template CV</strong>.
                </div>
              ) : (
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nama_template} {t.is_active ? "(Aktif)" : ""} — {t.jumlah_placeholder || 0} placeholder
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Languages size={13} /> Bahasa Isi CV
              </Label>
              <Select value={bahasa} onValueChange={setBahasa}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih bahasa isian CV..." />
                </SelectTrigger>
                <SelectContent>
                  {(opsiBahasa.length ? opsiBahasa : BAHASA_DEFAULT).map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Nilai profil (agama, jenis kelamin, status pernikahan, jenjang, bidang SSW) otomatis
                diterjemahkan. Teks bebas memakai terjemahan di <strong>Kelola Terjemahan</strong>.
              </p>
              {bahasa !== "auto" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTerjemahan(true)}
                  className="h-8 text-xs"
                >
                  <Languages size={13} className="mr-1" />
                  Kelola Terjemahan
                </Button>
              )}
            </div>
          </div>

          {/* ── Progress ── */}
          {(generating || done) && (
            <div className="rounded-lg border bg-[#1e3a5f]/[0.03] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-700 min-w-0">
                  {done ? (
                    <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                  ) : (
                    <Loader2 size={14} className="animate-spin text-[#1e3a5f] shrink-0" />
                  )}
                  <span className="truncate">{progressLabel || "Memproses..."}</span>
                </div>
                <span className="text-xs font-semibold text-[#1e3a5f] tabular-nums shrink-0">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-200 ease-out ${
                    done
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-[#1e3a5f] to-[#4a7fb5] bg-[length:200%_100%] animate-[shimmer_1.2s_linear_infinite]"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Pratinjau (form yang bisa diedit) ── */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="flex items-center gap-1.5">
                <Pencil size={13} /> Isian CV (bisa dikoreksi sebelum generate)
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari field..."
                    className="h-8 w-[150px] pl-7 text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPreview}
                  disabled={previewLoading || templates.length === 0}
                  className="h-8 text-xs"
                >
                  {previewLoading ? <Loader2 size={13} className="mr-1 animate-spin" /> : <Eye size={13} className="mr-1" />}
                  Muat Pratinjau
                </Button>
              </div>
            </div>

            {preview && (
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {terisi} terisi
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                  {kosong} kosong
                </span>
                {tidakCocok > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {tidakCocok} tidak cocok dengan pilihan template
                  </span>
                )}
                {jumlahOverride > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    {jumlahOverride} dikoreksi admin
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const map: Record<string, string> = {}
                    preview.forEach((p) => (map[p.key] = p.value))
                    setEdit(map)
                  }}
                  className="h-7 px-2 text-[11px] text-gray-500"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Reset koreksi
                </Button>
              </div>
            )}

            {previewLoading ? (
              <div className="py-10 text-center border rounded-xl">
                <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
                <p className="text-gray-400 text-xs mt-2">Menyusun isian...</p>
              </div>
            ) : preview && preview.length > 0 ? (
              <div className="border rounded-xl divide-y max-h-[46vh] overflow-y-auto">
                {daftarPratinjau.map((p) => {
                  const nilai = edit[p.key] ?? p.value
                  const berubah = edit[p.key] !== undefined && edit[p.key] !== p.value
                  const panjang = String(nilai || "").length > 60
                  return (
                    <div
                      key={p.key}
                      className={`px-3 py-2.5 grid grid-cols-1 md:grid-cols-[190px_1fr] gap-2 md:gap-3 items-start ${
                        berubah ? "bg-sky-50/50" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <code className="text-[10px] font-mono text-[#1e3a5f] bg-[#1e3a5f]/5 px-1.5 py-0.5 rounded">
                            {p.key}
                          </code>
                          {berubah && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                              diubah
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.label}</p>
                      </div>
                      <div className="min-w-0">
                        {panjang ? (
                          <Textarea
                            value={nilai || ""}
                            onChange={(e) => setEdit((s) => ({ ...s, [p.key]: e.target.value }))}
                            rows={2}
                            className="text-xs"
                          />
                        ) : (
                          <Input
                            value={nilai || ""}
                            onChange={(e) => setEdit((s) => ({ ...s, [p.key]: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        )}
                        {p.mismatch && p.dropdown && (
                          <p className="text-[10px] text-amber-700 mt-0.5">
                            “{p.raw}” tidak ada di pilihan template ({p.dropdown.join(" / ")}) — sel akan
                            dikosongkan
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {daftarPratinjau.length === 0 && (
                  <p className="px-3 py-6 text-center text-xs text-gray-400">
                    Tidak ada field yang cocok dengan pencarian.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Klik <strong>Muat Pratinjau</strong> untuk melihat (dan mengoreksi) isian CV sebelum
                digenerate.
              </div>
            )}
          </div>

          {/* ── Catatan ── */}
          {warnings.length > 0 && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle size={13} /> Catatan Generate
              </Label>
              <ul className="max-h-32 overflow-auto space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900 list-disc pl-5">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Riwayat ── */}
          {history.length > 0 && (
            <div className="space-y-2">
              <Label>Riwayat Generate</Label>
              <div className="max-h-40 overflow-auto border rounded-lg divide-y">
                {history.slice(0, 8).map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2 text-sm">
                    <div className="min-w-0">
                      <div className="truncate">{h.file_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.nama_template || "-"}
                        {h.bahasa && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#1e3a5f]/10 text-[#1e3a5f] text-[9px] font-semibold uppercase">
                            {h.bahasa}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => download(h)}>
                      <Download size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 sm:px-5 py-3 border-t bg-gray-50/80 rounded-b-xl sticky bottom-0 z-20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          {jumlahOverride > 0 && (
            <Button variant="outline" onClick={simpanKeKandidat} disabled={saving}>
              {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
              Simpan ke kandidat
            </Button>
          )}
          <Button onClick={generate} disabled={generating || templates.length === 0}>
            {generating ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <Sparkles size={14} className="mr-2" />
            )}
            Generate & Download
          </Button>
        </DialogFooter>
      </DialogContent>

      <TerjemahanModal
        open={showTerjemahan}
        onOpenChange={setShowTerjemahan}
        kandidatId={kandidatId}
        kandidatName={kandidatName}
        bahasa={bahasa}
      />
    </Dialog>
  )
}
