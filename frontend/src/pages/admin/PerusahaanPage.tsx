import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, Search, Building2, X, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

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

const ITEMS_PER_PAGE = 10

export default function PerusahaanPage() {
  const [data, setData] = useState<Perusahaan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<Partial<Perusahaan> | null>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const load = () => { setLoading(true); api.get('/perusahaan').then(r => setData(r.data.data)).finally(() => setLoading(false)) }
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
    c.nama_perusahaan.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (c.bidang_usaha || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (c.kota || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const openCreate = () => { setEditItem(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Perusahaan) => { setEditItem(item); setForm({ ...item, quota_ssw: String(item.quota_ssw) }); setDialogOpen(true) }

  const handleSave = async () => {
    if (!form.nama_perusahaan) { toast({ title: 'Nama perusahaan wajib diisi', variant: 'destructive' }); return }
    setSaving(true)
    try {
      const payload = { ...form, quota_ssw: parseInt(form.quota_ssw) || 0 }
      if (editItem && (editItem as any).id) await api.put(`/perusahaan/${(editItem as any).id}`, payload)
      else await api.post('/perusahaan', payload)
      toast({ title: editItem ? 'Perusahaan diupdate' : 'Perusahaan ditambahkan' })
      setDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/perusahaan/${deleteId}`)
      toast({ title: 'Perusahaan dihapus' })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p: any) => ({ ...p, [k]: e.target.value }))

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Perusahaan</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data perusahaan mitra di Jepang</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
          <Plus size={16} className="mr-2" /> Tambah Perusahaan
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari perusahaan, bidang, atau kota..." 
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
            <Building2 size={18} className="text-gray-500" />
            <span className="font-medium text-gray-700">Perusahaan</span>
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
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">PERUSAHAAN</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">BIDANG</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">LOKASI</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">QUOTA SSW</th>
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
                      <Building2 size={40} className="text-gray-300 mb-2" />
                      <p className="text-gray-500">Tidak ada data</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {debouncedSearch ? 'Coba ubah pencarian' : 'Data belum tersedia'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center shrink-0">
                            <Building2 size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.nama_perusahaan}</p>
                            {item.nama_jepang && <p className="text-xs text-gray-400">{item.nama_jepang}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{item.bidang_usaha || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 text-sm">
                          <p>{item.kota || '-'}</p>
                          <p className="text-xs text-gray-400">{item.negara || 'Jepang'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                          {item.quota_ssw}
                        </span>
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
                  )
                })
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
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a] -m-6 mb-4 px-6 py-4 rounded-t-lg">
            <h2 className="text-white font-semibold text-lg">{editItem ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru'}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Perusahaan *</label>
              <Input value={form.nama_perusahaan} onChange={f('nama_perusahaan')} placeholder="PT. Contoh Jaya" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Jepang</label>
              <Input value={form.nama_jepang} onChange={f('nama_jepang')} placeholder="株式会社..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bidang Usaha</label>
              <Input value={form.bidang_usaha} onChange={f('bidang_usaha')} placeholder="Manufaktur" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Quota SSW</label>
              <Input type="number" value={form.quota_ssw} onChange={f('quota_ssw')} placeholder="10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kota</label>
              <Input value={form.kota} onChange={f('kota')} placeholder="Tokyo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Negara</label>
              <Input value={form.negara} onChange={f('negara')} placeholder="Jepang" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Alamat Jepang</label>
              <textarea value={form.alamat_jepang} onChange={f('alamat_jepang')} placeholder="Alamat di Jepang" rows={2} className="w-full min-h-[60px] px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Alamat Indonesia (Agen/Perwakilan)</label>
              <textarea value={form.alamat_indonesia} onChange={f('alamat_indonesia')} placeholder="Alamat di Indonesia" rows={2} className="w-full min-h-[60px] px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">PIC / Kontak</label>
              <Input value={form.kontak_pic} onChange={f('kontak_pic')} placeholder="Nama PIC" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Telepon</label>
              <Input value={form.telepon} onChange={f('telepon')} placeholder="+81-..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input type="email" value={form.email} onChange={f('email')} placeholder="info@company.jp" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Website</label>
              <Input value={form.website} onChange={f('website')} placeholder="https://..." />
            </div>
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
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Keterangan</label>
              <textarea value={form.keterangan} onChange={f('keterangan')} placeholder="Catatan tambahan..." rows={3} className="w-full min-h-[80px] px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              {editItem ? 'Simpan' : 'Tambah'}
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
            <DialogTitle>Hapus Perusahaan</DialogTitle>
          </div>
          <p className="text-sm text-slate-600">Yakin ingin menghapus perusahaan ini? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
