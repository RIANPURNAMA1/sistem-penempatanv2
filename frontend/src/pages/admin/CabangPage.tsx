import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, Search, GitBranch, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Cabang {
  id: number; nama_cabang: string; kode_cabang: string; alamat: string
  kota: string; provinsi: string; telepon: string; email: string; status: string
}

const empty = { nama_cabang: '', kode_cabang: '', alamat: '', kota: '', provinsi: '', telepon: '', email: '', status: 'aktif' }

const ITEMS_PER_PAGE = 10

export default function CabangPage() {
  const [data, setData] = useState<Cabang[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<Partial<Cabang> | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const load = () => { setLoading(true); api.get('/cabang').then(r => setData(r.data.data)).finally(() => setLoading(false)) }
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

  const filtered = data.filter(c =>
    !debouncedSearch || 
    c.nama_cabang.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    c.kode_cabang.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (c.kota || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const openCreate = () => { setEditItem(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Cabang) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editItem?.id) await api.put(`/cabang/${editItem.id}`, form)
      else await api.post('/cabang', form)
      toast({ title: editItem ? 'Cabang diupdate' : 'Cabang ditambahkan' })
      setDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/cabang/${deleteId}`)
      toast({ title: 'Cabang dihapus' })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal menghapus', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Cabang</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data cabang perusahaan</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
          <Plus size={16} className="mr-2" /> Tambah Cabang
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari cabang, kode, atau kota..." 
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
            <GitBranch size={18} className="text-gray-500" />
            <span className="font-medium text-gray-700">Cabang</span>
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
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">CABANG</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">KODE</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">LOKASI</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">KONTAK</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">STATUS</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-12">
                    <div className="flex flex-col items-center">
                      <GitBranch size={40} className="text-gray-300 mb-2" />
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
                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center shrink-0">
                          <GitBranch size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.nama_cabang}</p>
                          {item.alamat && <p className="text-xs text-gray-400 truncate max-w-[180px]">{item.alamat}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded font-mono">
                        {item.kode_cabang}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600 text-sm">
                        <p>{item.kota || '-'}</p>
                        {item.provinsi && <p className="text-xs text-gray-400">{item.provinsi}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {item.telepon && <p className="text-xs">{item.telepon}</p>}
                      {item.email && <p className="text-xs text-gray-400">{item.email}</p>}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a] -m-6 mb-4 px-6 py-4 rounded-t-lg">
            <h2 className="text-white font-semibold text-lg">{editItem ? 'Edit Cabang' : 'Tambah Cabang Baru'}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Cabang *</label>
              <Input value={form.nama_cabang} onChange={f('nama_cabang')} placeholder="Nama cabang" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kode Cabang *</label>
              <Input value={form.kode_cabang} onChange={f('kode_cabang')} placeholder="BDG" className="font-mono uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kota</label>
              <Input value={form.kota} onChange={f('kota')} placeholder="Bandung" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Provinsi</label>
              <Input value={form.provinsi} onChange={f('provinsi')} placeholder="Jawa Barat" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Alamat</label>
              <Input value={form.alamat} onChange={f('alamat')} placeholder="Alamat lengkap" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Telepon</label>
              <Input value={form.telepon} onChange={f('telepon')} placeholder="022-..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input type="email" value={form.email} onChange={f('email')} placeholder="cabang@email.com" />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              {editItem ? 'Simpan Perubahan' : 'Tambah'}
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
            <DialogTitle>Hapus Cabang</DialogTitle>
          </div>
          <p className="text-sm text-slate-600">Yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
