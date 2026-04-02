import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, Search, GitBranch } from 'lucide-react'

interface Cabang {
  id: number; nama_cabang: string; kode_cabang: string; alamat: string
  kota: string; provinsi: string; telepon: string; email: string; status: string
}

const empty = { nama_cabang: '', kode_cabang: '', alamat: '', kota: '', provinsi: '', telepon: '', email: '', status: 'aktif' }

export default function CabangPage() {
  const [data, setData] = useState<Cabang[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<Partial<Cabang> | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); api.get('/cabang').then(r => setData(r.data.data)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const filtered = data.filter(c =>
    c.nama_cabang.toLowerCase().includes(search.toLowerCase()) ||
    c.kode_cabang.toLowerCase().includes(search.toLowerCase()) ||
    (c.kota || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditItem(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Cabang) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editItem?.id) await api.put(`/cabang/${editItem.id}`, form)
      else await api.post('/cabang', form)
      toast({ title: editItem ? 'Cabang diupdate' : 'Cabang ditambahkan', variant: 'success' as any })
      setDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/cabang/${deleteId}`)
      toast({ title: 'Cabang dihapus', variant: 'success' as any })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal menghapus', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manajemen Cabang</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola data cabang perusahaan</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} className="mr-2" />Tambah Cabang</Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari cabang..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <GitBranch size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Tidak ada cabang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cabang</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Kode</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Kota</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Kontak</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                            <GitBranch size={14} className="text-foreground/60" />
                          </div>
                          <div>
                            <p className="font-medium">{item.nama_cabang}</p>
                            {item.alamat && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.alamat}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{item.kode_cabang}</span></td>
                      <td className="px-6 py-4 text-muted-foreground">{item.kota}{item.provinsi ? `, ${item.provinsi}` : ''}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {item.telepon && <p className="text-xs">{item.telepon}</p>}
                        {item.email && <p className="text-xs">{item.email}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === 'aktif' ? 'success' : 'secondary'}>{item.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Pencil size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive hover:bg-destructive/5" onClick={() => setDeleteId(item.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Cabang' : 'Tambah Cabang Baru'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Nama Cabang *</Label>
              <Input value={form.nama_cabang} onChange={f('nama_cabang')} placeholder="Nama cabang" />
            </div>
            <div className="space-y-1.5">
              <Label>Kode Cabang *</Label>
              <Input value={form.kode_cabang} onChange={f('kode_cabang')} placeholder="BDG" className="font-mono uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kota</Label>
              <Input value={form.kota} onChange={f('kota')} placeholder="Bandung" />
            </div>
            <div className="space-y-1.5">
              <Label>Provinsi</Label>
              <Input value={form.provinsi} onChange={f('provinsi')} placeholder="Jawa Barat" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Alamat</Label>
              <Input value={form.alamat} onChange={f('alamat')} placeholder="Alamat lengkap" />
            </div>
            <div className="space-y-1.5">
              <Label>Telepon</Label>
              <Input value={form.telepon} onChange={f('telepon')} placeholder="022-..." />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={f('email')} placeholder="cabang@email.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
              {editItem ? 'Simpan Perubahan' : 'Tambah Cabang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Cabang</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
