import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Card, CardContent, CardHeader, Textarea, Badge } from '@/components/ui/components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, Search, Building2 } from 'lucide-react'

interface Perusahaan {
  id: number; nama_perusahaan: string; nama_jepang: string; bidang_usaha: string
  alamat_indonesia: string; alamat_jepang: string; kota: string; negara: string
  kontak_pic: string; telepon: string; email: string; website: string
  quota_ssw: number; status: string; keterangan: string
}

const empty = {
  nama_perusahaan: '', nama_jepang: '', bidang_usaha: '', alamat_indonesia: '', alamat_jepang: '',
  kota: '', negara: 'Jepang', kontak_pic: '', telepon: '', email: '', website: '',
  quota_ssw: '0', status: 'aktif', keterangan: ''
}

export default function PerusahaanPage() {
  const [data, setData] = useState<Perusahaan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<Partial<Perusahaan> | null>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); api.get('/perusahaan').then(r => setData(r.data.data)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const filtered = data.filter(c =>
    c.nama_perusahaan.toLowerCase().includes(search.toLowerCase()) ||
    (c.bidang_usaha || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditItem(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Perusahaan) => { setEditItem(item); setForm({ ...item, quota_ssw: String(item.quota_ssw) }); setDialogOpen(true) }

  const handleSave = async () => {
    if (!form.nama_perusahaan) { toast({ title: 'Nama perusahaan wajib diisi', variant: 'destructive' }); return }
    setSaving(true)
    try {
      const payload = { ...form, quota_ssw: parseInt(form.quota_ssw) || 0 }
      if (editItem && (editItem as any).id) await api.put(`/perusahaan/${(editItem as any).id}`, payload)
      else await api.post('/perusahaan', payload)
      toast({ title: editItem ? 'Perusahaan diupdate' : 'Perusahaan ditambahkan', variant: 'success' as any })
      setDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/perusahaan/${deleteId}`)
      toast({ title: 'Perusahaan dihapus', variant: 'success' as any })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p: any) => ({ ...p, [k]: e.target.value }))

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manajemen Perusahaan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola data perusahaan mitra di Jepang</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} className="mr-2" />Tambah Perusahaan</Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari perusahaan..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Tidak ada perusahaan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Perusahaan</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Bidang</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Kota</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Quota SSW</th>
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
                            <Building2 size={14} className="text-foreground/60" />
                          </div>
                          <div>
                            <p className="font-medium">{item.nama_perusahaan}</p>
                            {item.nama_jepang && <p className="text-xs text-muted-foreground">{item.nama_jepang}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.bidang_usaha || '-'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.kota || '-'}, {item.negara || 'Jepang'}</td>
                      <td className="px-6 py-4"><span className="font-mono text-sm font-medium">{item.quota_ssw}</span></td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === 'aktif' ? 'success' : 'secondary'}>{item.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive hover:bg-destructive/5" onClick={() => setDeleteId(item.id)}><Trash2 size={14} /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5"><Label>Nama Perusahaan *</Label><Input value={form.nama_perusahaan} onChange={f('nama_perusahaan')} placeholder="PT. Contoh Jaya" /></div>
            <div className="col-span-2 space-y-1.5"><Label>Nama Jepang</Label><Input value={form.nama_jepang} onChange={f('nama_jepang')} placeholder="株式会社..." /></div>
            <div className="space-y-1.5"><Label>Bidang Usaha</Label><Input value={form.bidang_usaha} onChange={f('bidang_usaha')} placeholder="Manufaktur" /></div>
            <div className="space-y-1.5"><Label>Quota SSW</Label><Input type="number" value={form.quota_ssw} onChange={f('quota_ssw')} placeholder="10" /></div>
            <div className="space-y-1.5"><Label>Kota</Label><Input value={form.kota} onChange={f('kota')} placeholder="Tokyo" /></div>
            <div className="space-y-1.5"><Label>Negara</Label><Input value={form.negara} onChange={f('negara')} placeholder="Jepang" /></div>
            <div className="col-span-2 space-y-1.5"><Label>Alamat Jepang</Label><Textarea value={form.alamat_jepang} onChange={f('alamat_jepang')} placeholder="Alamat di Jepang" rows={2} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Alamat Indonesia (Agen/Perwakilan)</Label><Textarea value={form.alamat_indonesia} onChange={f('alamat_indonesia')} placeholder="Alamat di Indonesia" rows={2} /></div>
            <div className="space-y-1.5"><Label>PIC / Kontak</Label><Input value={form.kontak_pic} onChange={f('kontak_pic')} placeholder="Nama PIC" /></div>
            <div className="space-y-1.5"><Label>Telepon</Label><Input value={form.telepon} onChange={f('telepon')} placeholder="+81-..." /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={f('email')} placeholder="info@company.jp" /></div>
            <div className="space-y-1.5"><Label>Website</Label><Input value={form.website} onChange={f('website')} placeholder="https://..." /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm((p: any) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="aktif">Aktif</SelectItem><SelectItem value="nonaktif">Nonaktif</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5"><Label>Keterangan</Label><Textarea value={form.keterangan} onChange={f('keterangan')} placeholder="Catatan tambahan..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 size={14} className="mr-2 animate-spin" />}{editItem ? 'Simpan' : 'Tambah'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Hapus Perusahaan</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin ingin menghapus perusahaan ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
