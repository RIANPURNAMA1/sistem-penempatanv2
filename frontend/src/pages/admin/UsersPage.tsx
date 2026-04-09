import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, Search, Users, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface User { id: number; nama: string; email: string; role: string; cabang_id: number; status: string; nama_cabang: string; created_at: string }

const roles = [
  { value: 'kandidat', label: 'Kandidat' },
  { value: 'admin_cabang', label: 'Admin Cabang' },
  { value: 'admin_penempatan', label: 'Admin Penempatan' },
]

const empty = { nama: '', email: '', password: '', role: 'kandidat', cabang_id: '', status: 'aktif' }

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [cabangList, setCabangList] = useState<{ id: number; nama_cabang: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/users'), api.get('/cabang')]).then(([u, c]) => {
      setData(u.data.data); setCabangList(c.data.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
  }

  const clearSearch = () => {
    setSearch('')
    setDebouncedSearch('')
  }

  const filtered = data.filter(u =>
    !debouncedSearch || 
    u.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
      toast({ title: editItem ? 'User diupdate' : 'User dibuat' })
      setDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/users/${deleteId}`)
      toast({ title: 'User dihapus' })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const roleLabel: Record<string, string> = { kandidat: 'Kandidat', admin_cabang: 'Admin Cabang', admin_penempatan: 'Admin Penempatan' }
  const roleBg: Record<string, string> = { kandidat: 'bg-gray-100 text-gray-700', admin_cabang: 'bg-gray-100 text-gray-700', admin_penempatan: 'bg-gray-800 text-white' }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola akun pengguna sistem</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
          <Plus size={16} className="mr-2" /> Tambah User
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau email..." 
            className="pl-9 pr-10 bg-white" 
            value={search} 
            onChange={e => handleSearchChange(e.target.value)} 
          />
          {isSearching && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
          )}
          {search && !isSearching && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gray-500" />
            <span className="font-medium text-gray-700">User</span>
            {!loading && (
              <span className="text-sm text-gray-500">
                {filtered.length} item
              </span>
            )}
          </div>
          {loading && (
            <span className="text-sm text-gray-500">Memuat...</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">USER</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">ROLE</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">CABANG</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">STATUS</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-12">
                    <div className="flex flex-col items-center">
                      <Users size={40} className="text-gray-300 mb-2" />
                      <p className="text-gray-500">Tidak ada data</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {debouncedSearch ? 'Coba ubah pencarian' : 'Data belum tersedia'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium shrink-0">
                          {item.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.nama}</p>
                          <p className="text-xs text-gray-400">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${roleBg[item.role] || 'bg-gray-100 text-gray-700'}`}>
                        {roleLabel[item.role] || item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {item.nama_cabang || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-gray-700" onClick={() => openEdit(item)}>
                          <Pencil size={15} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => setDeleteId(item.id)}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
            <p className="text-xs text-gray-500">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) pageNum = i + 1
                else if (currentPage <= 3) pageNum = i + 1
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                else pageNum = currentPage - 2 + i
                return (
                  <Button key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm" className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-gray-900 text-white' : 'text-gray-600'}`} onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </Button>
                )
              })}
              
              <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <div className="bg-[#1e3a5f]  -m-6 mb-4 px-6 py-4 rounded-t-lg">
            <h2 className="text-white font-semibold text-lg">{editItem ? 'Edit User' : 'Tambah User Baru'}</h2>
          </div>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama *</label>
              <Input value={form.nama} onChange={e => setForm((p: any) => ({ ...p, nama: e.target.value }))} placeholder="Nama lengkap" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} placeholder="email@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password {editItem ? '(kosongkan jika tidak diubah)' : '*'}</label>
              <Input type="password" value={form.password} onChange={e => setForm((p: any) => ({ ...p, password: e.target.value }))} placeholder={editItem ? '••••••••' : 'Min. 6 karakter'} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role *</label>
              <Select value={form.role} onValueChange={v => setForm((p: any) => ({ ...p, role: v }))}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(form.role === 'admin_cabang' || form.role === 'kandidat') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cabang</label>
                <Select value={form.cabang_id ? String(form.cabang_id) : ''} onValueChange={v => setForm((p: any) => ({ ...p, cabang_id: v }))}>
                  <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Pilih cabang..." /></SelectTrigger>
                  <SelectContent>{cabangList.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nama_cabang}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={form.status} onValueChange={v => setForm((p: any) => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              {editItem ? 'Simpan' : 'Buat User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <DialogTitle>Hapus User</DialogTitle>
          </div>
          <p className="text-sm text-slate-600">Yakin ingin menghapus user ini? Semua data terkait akan ikut terhapus.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
