import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Card, CardContent, CardHeader, Badge } from '@/components/ui/components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, Search, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface User { id: number; nama: string; email: string; role: string; cabang_id: number; status: string; nama_cabang: string; created_at: string }

const roles = [
  { value: 'kandidat', label: 'Kandidat' },
  { value: 'admin_cabang', label: 'Admin Cabang' },
  { value: 'admin_penempatan', label: 'Admin Penempatan' },
]

const empty = { nama: '', email: '', password: '', role: 'kandidat', cabang_id: '', status: 'aktif' }

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [cabangList, setCabangList] = useState<{ id: number; nama_cabang: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/users'), api.get('/cabang')]).then(([u, c]) => {
      setData(u.data.data); setCabangList(c.data.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = data.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditItem(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: User) => { setEditItem(item); setForm({ ...item, password: '' }); setDialogOpen(true) }

  const handleSave = async () => {
    if (!form.nama || !form.email || !form.role) { toast({ title: 'Isi semua field wajib', variant: 'destructive' }); return }
    if (!editItem && !form.password) { toast({ title: 'Password wajib diisi untuk user baru', variant: 'destructive' }); return }
    setSaving(true)
    try {
      const payload = { ...form, cabang_id: form.cabang_id || null }
      if (!payload.password) delete payload.password
      if (editItem) await api.put(`/users/${editItem.id}`, payload)
      else await api.post('/users', payload)
      toast({ title: editItem ? 'User diupdate' : 'User dibuat', variant: 'success' as any })
      setDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/users/${deleteId}`)
      toast({ title: 'User dihapus', variant: 'success' as any })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const roleLabel: Record<string, string> = { kandidat: 'Kandidat', admin_cabang: 'Admin Cabang', admin_penempatan: 'Admin Penempatan' }
  const roleVariant: Record<string, string> = { kandidat: 'secondary', admin_cabang: 'info', admin_penempatan: 'default' }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manajemen User</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola akun pengguna sistem</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} className="mr-2" />Tambah User</Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari user..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cabang</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Terdaftar</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-sm font-semibold shrink-0">
                            {item.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{item.nama}</p>
                            <p className="text-xs text-muted-foreground">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge variant={roleVariant[item.role] as any}>{roleLabel[item.role]}</Badge></td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{item.nama_cabang || '—'}</td>
                      <td className="px-6 py-4"><Badge variant={item.status === 'aktif' ? 'success' : 'secondary'}>{item.status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(item.created_at)}</td>
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
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Tidak ada user</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? 'Edit User' : 'Tambah User Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Nama *</Label><Input value={form.nama} onChange={e => setForm((p: any) => ({ ...p, nama: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Password {editItem ? '(kosongkan jika tidak diubah)' : '*'}</Label>
              <Input type="password" value={form.password} onChange={e => setForm((p: any) => ({ ...p, password: e.target.value }))} placeholder={editItem ? '••••••••' : 'Min. 6 karakter'} />
            </div>
            <div className="space-y-1.5"><Label>Role *</Label>
              <Select value={form.role} onValueChange={v => setForm((p: any) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(form.role === 'admin_cabang' || form.role === 'kandidat') && (
              <div className="space-y-1.5"><Label>Cabang</Label>
                <Select value={form.cabang_id ? String(form.cabang_id) : ''} onValueChange={v => setForm((p: any) => ({ ...p, cabang_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih cabang..." /></SelectTrigger>
                  <SelectContent>{cabangList.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nama_cabang}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm((p: any) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="aktif">Aktif</SelectItem><SelectItem value="nonaktif">Nonaktif</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 size={14} className="mr-2 animate-spin" />}{editItem ? 'Simpan' : 'Buat User'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Hapus User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin ingin menghapus user ini? Semua data terkait akan ikut terhapus.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
