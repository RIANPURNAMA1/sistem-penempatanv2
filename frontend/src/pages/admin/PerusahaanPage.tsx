import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, Search, Building2, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Perusahaan {
  id: number
  nama_perusahaan: string
  nama_jepang?: string
  bidang_usaha?: string
  alamat_indonesia?: string
  alamat?: string
  kontak?: string
  kontak_pic?: string
  email?: string
  website?: string
  status: string
  keterangan?: string
}

const empty = {
  nama_perusahaan: '',
  nama_jepang: '',
  bidang_usaha: '',
  alamat: '',
  kontak: '',
  email: '',
  website: '',
  status: 'aktif',
  keterangan: ''
}

export default function PerusahaanPage() {
  const [data, setData] = useState<Perusahaan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Perusahaan | null>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/perusahaan')
      .then(r => setData(r.data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setPage(1) }, [search])

  const filteredData = data.filter(item => {
    const s = search.toLowerCase()
    return item.nama_perusahaan?.toLowerCase().includes(s) || item.email?.toLowerCase().includes(s)
  })

  const totalPages = Math.ceil(filteredData.length / perPage)
  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage)

  const handleSave = async () => {
    if (!form.nama_perusahaan?.trim()) {
      toast({ title: 'Nama perusahaan wajib diisi', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload = { 
      nama_perusahaan: form.nama_perusahaan,
      nama_jepang: form.nama_jepang || '',
      bidang_usaha: form.bidang_usaha || '',
      alamat_indonesia: form.alamat,
      kontak_pic: form.kontak,
      email: form.email,
      website: form.website,
      status: form.status,
      keterangan: form.keterangan,
      id: editItem?.id
    }
      if (editItem?.id) {
        await api.put(`/perusahaan/${editItem.id}`, payload)
      } else {
        await api.post('/perusahaan', payload)
      }
      toast({ title: 'Data berhasil disimpan' })
      setDialogOpen(false)
      setEditItem(null)
      setForm(empty)
      load()
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: Perusahaan) => {
    setEditItem(item)
    setForm({
      nama_perusahaan: item.nama_perusahaan,
      nama_jepang: item.nama_jepang || '',
      bidang_usaha: item.bidang_usaha || '',
      alamat: item.alamat_indonesia || item.alamat || '',
      kontak: item.kontak_pic || item.kontak || '',
      email: item.email || '',
      website: item.website || '',
      status: item.status || 'aktif',
      keterangan: item.keterangan || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus data ini?')) return
    try {
      await api.delete(`/perusahaan/${id}`)
      toast({ title: 'Data berhasil dihapus' })
      load()
    } catch {
      toast({ title: 'Gagal hapus', variant: 'destructive' })
    }
  }

  return (
    <div className="page-container p-6">
      <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Perusahaan</h1>
          <p className="text-sm text-muted-foreground">Kelola data perusahaan</p>
        </div>
        <Button onClick={() => { setEditItem(null); setForm(empty); setDialogOpen(true) }}>
          <Plus size={16} className="mr-2" /> Tambah
        </Button>
      </div>

      <div className="flex mb-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium">NO</th>
                <th className="px-4 py-2 text-left text-xs font-medium">PERUSAHAAN</th>
                <th className="px-4 py-2 text-left text-xs font-medium">ALAMAT</th>
                <th className="px-4 py-2 text-left text-xs font-medium">KONTAK</th>
                <th className="px-4 py-2 text-left text-xs font-medium">EMAIL</th>
                <th className="px-4 py-2 text-left text-xs font-medium">WEBSITE</th>
                <th className="px-4 py-2 text-center text-xs font-medium">STATUS</th>
                <th className="px-4 py-2 text-left text-xs font-medium">KETERANGAN</th>
                <th className="px-4 py-2 text-center text-xs font-medium">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-gray-500">Tidak ada data</td></tr>
              ) : paginatedData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400">{(page - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-2 font-medium">{item.nama_perusahaan}</td>
                  <td className="px-4 py-2 text-gray-600">{item.alamat_indonesia || item.alamat || '-'}</td>
                  <td className="px-4 py-2 text-gray-600">{item.kontak_pic || item.kontak || '-'}</td>
                  <td className="px-4 py-2 text-gray-600">{item.email || '-'}</td>
                  <td className="px-4 py-2 text-blue-600">{item.website || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{item.keterangan || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="px-4 py-2 border-t flex items-center justify-between bg-gray-50 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Baris:</span>
              <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }} className="border rounded px-1 py-0.5">
                <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select>
              <span className="text-gray-500 ml-2">{(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredData.length)} dari {filteredData.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft size={12} /></Button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                if (pageNum < 1 || pageNum > totalPages) return null
                return <Button key={pageNum} variant={page === pageNum ? "default" : "outline"} size="sm" className="h-6 w-6 p-0" onClick={() => setPage(pageNum)}>{pageNum}</Button>
              })}
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight size={12} /></Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem?.id ? 'Edit Perusahaan' : 'Tambah Perusahaan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Nama Perusahaan *</label>
              <Input value={form.nama_perusahaan} onChange={e => setForm({...form, nama_perusahaan: e.target.value})} placeholder="Nama perusahaan..." />
            </div>
            <div>
              <label className="text-xs text-gray-500">Alamat</label>
              <Input value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} placeholder="Alamat..." />
            </div>
            <div>
              <label className="text-xs text-gray-500">Kontak</label>
              <Input value={form.kontak} onChange={e => setForm({...form, kontak: e.target.value})} placeholder="Kontak..." />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@..." type="email" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Website</label>
              <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Keterangan</label>
              <Input value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} placeholder="Keterangan..." />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}