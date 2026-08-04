import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import {
  Plus, Trash2, Loader2, KeyRound, Copy, Check, RotateCcw, Pencil, Eye, EyeOff, ShieldCheck
} from 'lucide-react'

interface ApiClient {
  id: number
  nama_sistem: string
  api_key: string
  active: number
  last_used_at: string | null
  created_at: string
}

export default function ApiKeyPage() {
  const [data, setData] = useState<ApiClient[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [saving, setSaving] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({})
  const [editItem, setEditItem] = useState<ApiClient | null>(null)
  const [editName, setEditName] = useState('')
  const [editActive, setEditActive] = useState('1')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [regenerateId, setRegenerateId] = useState<number | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/integrasi/api-clients')
      .then(r => setData(r.data.data))
      .catch(() => toast({ title: 'Gagal memuat data', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const copyKey = async (key: string, id: number) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      toast({ title: 'Gagal menyalin', variant: 'destructive' })
    }
  }

  const handleCreate = async () => {
    if (!createName.trim()) {
      toast({ title: 'Nama sistem wajib diisi', variant: 'destructive' }); return
    }
    setSaving(true)
    try {
      const r = await api.post('/integrasi/api-clients', { nama_sistem: createName.trim() })
      setNewKey(r.data.data.api_key)
      setCreateName('')
      load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const openEdit = (item: ApiClient) => {
    setEditItem(item)
    setEditName(item.nama_sistem)
    setEditActive(String(item.active))
    setDialogOpen(false)
    setEditDialogOpen(true)
  }

  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleEditSave = async () => {
    if (!editItem) return
    if (!editName.trim()) {
      toast({ title: 'Nama sistem wajib diisi', variant: 'destructive' }); return
    }
    setSaving(true)
    try {
      await api.put(`/integrasi/api-clients/${editItem.id}`, {
        nama_sistem: editName.trim(),
        active: editActive === '1' ? 1 : 0,
      })
      toast({ title: 'API key diupdate' })
      setEditDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/integrasi/api-clients/${deleteId}`)
      toast({ title: 'API key dihapus' })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const handleRegenerate = async () => {
    if (!regenerateId) return
    setRegenerating(true)
    try {
      const r = await api.post(`/integrasi/api-clients/${regenerateId}/regenerate`)
      setNewKey(r.data.api_key)
      setRegenerateId(null)
      load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setRegenerating(false) }
  }

  const maskKey = (key: string) => {
    if (key.length <= 20) return key
    return `${key.slice(0, 14)}••••••••••${key.slice(-6)}`
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="w-full min-w-0 space-y-3 px-2.5 sm:px-4 md:px-6 py-3 sm:py-5 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-bold text-foreground leading-tight truncate">
            API Key Integrasi
          </h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
            Kelola kunci akses untuk sistem lain
          </p>
        </div>
        <Button
          onClick={() => { setNewKey(null); setDialogOpen(true) }}
          className="bg-[#1e3a5f] hover:bg-[#2d5a8a] h-8 sm:h-9 shrink-0 px-2 sm:px-3 text-xs"
        >
          <Plus size={14} className="shrink-0" />
          <span className="hidden min-[400px]:inline ml-1 whitespace-nowrap">Buat API Key</span>
        </Button>
      </div>

      {/* ── Info card ── */}
      <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-[#1e3a5f] shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
          API key digunakan oleh sistem lain untuk membaca data kandidat via{' '}
          <code className="bg-white border rounded px-1 py-0.5 text-[10px]">GET /api/integrasi/kandidat</code>{' '}
          dengan header <code className="bg-white border rounded px-1 py-0.5 text-[10px]">x-api-key: &lt;key&gt;</code>.
          Nonaktifkan atau hapus key untuk mencabut akses.
        </p>
      </div>

      {/* ── Card Container ── */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-1.5">
            <KeyRound size={14} className="text-gray-500" />
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Daftar API Key</span>
            {!loading && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {data.length}
              </span>
            )}
          </div>
          {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
        </div>

        {/* ── Mobile list ── */}
        <div className="sm:hidden">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
              <p className="text-gray-400 text-xs mt-2">Memuat data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center px-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <KeyRound size={18} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-xs">Belum ada API key</p>
              <p className="text-gray-400 text-[10px] mt-1">Buat key pertama untuk integrasi sistem lain</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.map(item => (
                <div key={item.id} className="px-3 py-2.5 active:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                      item.active ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <KeyRound size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{item.nama_sistem}</p>
                      <p className="text-[10px] text-gray-400 truncate font-mono">
                        {visibleKeys[item.id] ? item.api_key : maskKey(item.api_key)}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border leading-tight ${
                      item.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {item.active ? 'Aktif' : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 pl-9 flex-wrap">
                    <button onClick={() => copyKey(item.api_key, item.id)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100 transition-colors">
                      {copiedId === item.id ? <Check size={10} className="text-green-600" /> : <Copy size={10} />}
                      {copiedId === item.id ? 'Tersalin' : 'Salin'}
                    </button>
                    <button onClick={() => setVisibleKeys(p => ({ ...p, [item.id]: !p[item.id] }))}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100 transition-colors">
                      {visibleKeys[item.id] ? <EyeOff size={10} /> : <Eye size={10} />}
                      {visibleKeys[item.id] ? 'Sembunyi' : 'Lihat'}
                    </button>
                    <button onClick={() => setRegenerateId(item.id)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100 transition-colors">
                      <RotateCcw size={10} />
                      Regenerate
                    </button>
                    <button onClick={() => openEdit(item)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100 transition-colors">
                      <Pencil size={10} />
                      Edit
                    </button>
                    <button onClick={() => setDeleteId(item.id)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-red-100 bg-red-50 text-red-600 text-[10px] font-medium active:bg-red-100 transition-colors">
                      <Trash2 size={10} />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Sistem</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">API Key</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Terakhir Dipakai</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-16">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <KeyRound size={24} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Belum ada API key</p>
                      <p className="text-gray-400 text-xs mt-1">Buat key pertama untuk integrasi sistem lain</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.active ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <KeyRound size={14} />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{item.nama_sistem}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-600">
                          {visibleKeys[item.id] ? item.api_key : maskKey(item.api_key)}
                        </span>
                        <button onClick={() => setVisibleKeys(p => ({ ...p, [item.id]: !p[item.id] }))}
                          className="text-gray-400 hover:text-gray-700" title={visibleKeys[item.id] ? 'Sembunyikan' : 'Tampilkan'}>
                          {visibleKeys[item.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={() => copyKey(item.api_key, item.id)}
                          className="text-gray-400 hover:text-gray-700" title="Salin">
                          {copiedId === item.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(item.last_used_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                        item.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {item.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setRegenerateId(item.id)} title="Regenerate key">
                          <RotateCcw size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => openEdit(item)} title="Edit">
                          <Pencil size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => setDeleteId(item.id)} title="Hapus">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DIALOG BUAT ── */}
      <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setNewKey(null) }}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-xl p-0">
          <div className="px-3 py-3 border-b bg-gray-50/80 rounded-t-xl">
            <h2 className="font-semibold text-sm text-gray-900">Buat API Key</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Berikan akses ke sistem lain</p>
          </div>

          <div className="px-3 py-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Nama Sistem <span className="text-red-500">*</span>
              </label>
              <Input value={createName} onChange={e => setCreateName(e.target.value)}
                placeholder="Contoh: Aplikasi Monitoring" className="h-8 text-xs sm:text-sm"
                onKeyDown={e => { if (e.key === 'Enter' && !newKey) handleCreate() }} />
            </div>

            {newKey ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">API Key — simpan baik-baik, hanya tampil sekali</label>
                <div className="flex items-center gap-1.5 bg-gray-50 border rounded-lg p-2">
                  <code className="flex-1 text-[11px] font-mono text-gray-700 break-all">{newKey}</code>
                  <button onClick={() => copyKey(newKey, -1)}
                    className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-800 active:bg-gray-100">
                    {copiedId === -1 ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">Setelah dibuat, key hanya ditampilkan satu kali.</p>
            )}
          </div>

          <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
            {newKey ? (
              <Button onClick={() => { setDialogOpen(false); setNewKey(null) }} className="h-7 px-3 text-[11px] bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                Selesai
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-7 px-3 text-[11px]">
                  Batal
                </Button>
                <Button onClick={handleCreate} disabled={saving} className="h-7 px-3 text-[11px] bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                  {saving && <Loader2 size={11} className="mr-1 animate-spin" />}
                  Buat Key
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG EDIT ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-sm rounded-xl p-0">
          <div className="px-3 py-3 border-b bg-gray-50/80 rounded-t-xl">
            <h2 className="font-semibold text-sm text-gray-900">Edit API Key</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">{editItem?.nama_sistem}</p>
          </div>

          <div className="px-3 py-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Nama Sistem <span className="text-red-500">*</span></label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-xs sm:text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Status</label>
              <Select value={editActive} onValueChange={setEditActive}>
                <SelectTrigger className="h-8 bg-white text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="h-7 px-3 text-[11px]">
              Batal
            </Button>
            <Button onClick={handleEditSave} disabled={saving} className="h-7 px-3 text-[11px] bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {saving && <Loader2 size={11} className="mr-1 animate-spin" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG REGENERATE ── */}
      <Dialog open={!!regenerateId} onOpenChange={() => setRegenerateId(null)}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-sm rounded-xl p-0">
          <div className="px-3 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <RotateCcw size={15} className="text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-xs sm:text-sm font-semibold text-gray-900">Regenerate API Key</DialogTitle>
                <p className="text-[10px] text-gray-400">Key lama langsung tidak berlaku</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yakin ingin membuat API key baru? Sistem yang memakai key lama harus diperbarui. Key baru hanya ditampilkan satu kali.
            </p>
          </div>
          <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRegenerateId(null)} className="h-7 px-3 text-[11px]">
              Batal
            </Button>
            <Button onClick={handleRegenerate} disabled={regenerating} className="h-7 px-3 text-[11px] bg-amber-600 hover:bg-amber-700">
              {regenerating && <Loader2 size={11} className="mr-1 animate-spin" />}
              Regenerate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG HAPUS ── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-sm rounded-xl p-0">
          <div className="px-3 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={15} className="text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xs sm:text-sm font-semibold text-gray-900">Hapus API Key</DialogTitle>
                <p className="text-[10px] text-gray-400">Tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yakin ingin menghapus API key ini? Sistem yang memakainya tidak akan bisa mengakses data lagi.
            </p>
          </div>
          <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="h-7 px-3 text-[11px]">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="h-7 px-3 text-[11px]">
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
