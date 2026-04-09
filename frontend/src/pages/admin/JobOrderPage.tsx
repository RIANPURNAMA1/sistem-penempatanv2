import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Search, Edit, Trash2, Loader2, FileText, X, Eye, Filter, Briefcase, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  'Menunggu': { label: 'Menunggu', bg: 'bg-slate-100', text: 'text-slate-700' },
  'Lulus': { label: 'Lulus', bg: 'bg-green-100', text: 'text-green-700' },
  'Tidak Lulus': { label: 'Tidak Lulus', bg: 'bg-red-100', text: 'text-red-700' },
  'Tidak Hadir': { label: 'Tidak Hadir', bg: 'bg-amber-100', text: 'text-amber-700' },
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const ITEMS_PER_PAGE = 10

export default function JobOrderPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [filterPerusahaan, setFilterPerusahaan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBidangSsw, setFilterBidangSsw] = useState('all')
  const [filterTanggalAwal, setFilterTanggalAwal] = useState('')
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailItem, setDetailItem] = useState<any>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [kandidatSearch, setKandidatSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perusahaans, setPerusahaans] = useState<any[]>([])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const [kandidats, setKandidats] = useState<any[]>([])

  const [form, setForm] = useState({
    kandidat_ids: [] as number[],
    perusahaan_id: '',
    nomor: '',
    tanggal_terbit: '',
    detail_job_order: '',
    bidang_ssw: '',
    nama_grup: '',
    link_grup: '',
    biaya_awal: '',
    biaya_akhir: '',
    tanggal_cv: '',
    pic_cv: '',
    tanggal_mensetsu_1: '',
    tanggal_mensetsu_2: '',
    tanggal_mensetsu_3: '',
    status_kelulusan: 'Menunggu',
  })

  useEffect(() => {
    fetchData()
    fetchKandidats()
    fetchPerusahaans()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const r = await api.get('/joborder')
      setData(r.data.data || [])
    } catch (error) {
      console.error("Error fetch Job Order:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKandidats = async () => {
    try {
      const r = await api.get('/kandidat?status=approved')
      const kandidatsData = r.data.data || []
      const approvedKandidats = kandidatsData.filter((k: any) => k.status_formulir === 'approved')
      setKandidats(approvedKandidats)
    } catch (error) {
      console.error("Error fetch Kandidat:", error)
    }
  }

  const fetchPerusahaans = async () => {
    try {
      const r = await api.get('/perusahaan')
      setPerusahaans(r.data.data || [])
    } catch (error) {
      console.error("Error fetch Perusahaan:", error)
    }
  }

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

  const filteredData = data.filter(item => {
    const searchLower = debouncedSearch.toLowerCase()
    const matchSearch = !debouncedSearch || 
      item.nama_kandidat?.toLowerCase().includes(searchLower) ||
      item.nama_perusahaan?.toLowerCase().includes(searchLower) ||
      item.nomor?.toLowerCase().includes(searchLower) ||
      item.bidang_ssw?.toLowerCase().includes(searchLower)
    
    const matchPerusahaan = !filterPerusahaan || filterPerusahaan === 'all' || item.perusahaan_id?.toString() === filterPerusahaan
    const matchStatus = !filterStatus || filterStatus === 'all' || item.status_kelulusan === filterStatus
    const matchBidangSsw = !filterBidangSsw || filterBidangSsw === 'all' || item.bidang_ssw?.toLowerCase().includes(filterBidangSsw.toLowerCase())
    
    let matchTanggal = true
    if (filterTanggalAwal && item.tanggal_terbit) {
      matchTanggal = matchTanggal && new Date(item.tanggal_terbit) >= new Date(filterTanggalAwal)
    }
    if (filterTanggalAkhir && item.tanggal_terbit) {
      matchTanggal = matchTanggal && new Date(item.tanggal_terbit) <= new Date(filterTanggalAkhir)
    }
    
    return matchSearch && matchPerusahaan && matchStatus && matchBidangSsw && matchTanggal
  })

  const uniqueBidangSsw = [...new Set(data.map(d => d.bidang_ssw).filter(Boolean))].sort()

  const clearAllFilters = () => {
    setFilterPerusahaan('all')
    setFilterStatus('all')
    setFilterBidangSsw('all')
    setFilterTanggalAwal('')
    setFilterTanggalAkhir('')
    setCurrentPage(1)
  }

  const hasActiveFilters = (filterPerusahaan && filterPerusahaan !== 'all') || (filterStatus && filterStatus !== 'all') || (filterBidangSsw && filterBidangSsw !== 'all') || filterTanggalAwal || filterTanggalAkhir

  const activeFilterCount = [filterPerusahaan !== 'all' && filterPerusahaan, filterStatus !== 'all' && filterStatus, filterBidangSsw !== 'all' && filterBidangSsw, filterTanggalAwal, filterTanggalAkhir].filter(Boolean).length

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, filterPerusahaan, filterStatus, filterBidangSsw, filterTanggalAwal, filterTanggalAkhir])

  const filteredKandidats = kandidats.filter(k => {
    const searchLower = kandidatSearch.toLowerCase()
    return !kandidatSearch || 
      (k.nama_romaji || k.nama)?.toLowerCase().includes(searchLower) ||
      k.nama_katakana?.toLowerCase().includes(searchLower)
  })

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSave = async () => {
    if (form.kandidat_ids.length === 0) {
      toast({ title: 'Pilih minimal satu kandidat', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        kandidat_ids: form.kandidat_ids,
        perusahaan_id: form.perusahaan_id ? parseInt(form.perusahaan_id) : null,
        nomor: form.nomor,
        tanggal_terbit: form.tanggal_terbit,
        detail_job_order: form.detail_job_order,
        bidang_ssw: form.bidang_ssw,
        nama_grup: form.nama_grup,
        link_grup: form.link_grup,
        biaya_awal: form.biaya_awal ? parseFloat(form.biaya_awal) : 0,
        biaya_akhir: form.biaya_akhir ? parseFloat(form.biaya_akhir) : 0,
        tanggal_cv: form.tanggal_cv,
        pic_cv: form.pic_cv,
        tanggal_mensetsu_1: form.tanggal_mensetsu_1,
        tanggal_mensetsu_2: form.tanggal_mensetsu_2,
        tanggal_mensetsu_3: form.tanggal_mensetsu_3,
        status_kelulusan: form.status_kelulusan,
      }
      
      if (editingId) {
        await api.put(`/joborder/${editingId}`, payload)
        toast({ title: 'Berhasil!', description: 'Data berhasil diupdate.' })
      } else {
        await api.post('/joborder', payload)
        toast({ title: 'Berhasil!', description: `Data berhasil ditambahkan untuk ${form.kandidat_ids.length} kandidat.` })
      }
      
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error('Save error:', error)
      toast({ title: 'Gagal!', description: error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setForm({
      kandidat_ids: item.kandidat_ids || [],
      perusahaan_id: item.perusahaan_id ? String(item.perusahaan_id) : '',
      nomor: item.nomor || '',
      tanggal_terbit: item.tanggal_terbit || '',
      detail_job_order: item.detail_job_order || '',
      bidang_ssw: item.bidang_ssw || '',
      nama_grup: item.nama_grup || '',
      link_grup: item.link_grup || '',
      biaya_awal: item.biaya_awal || '',
      biaya_akhir: item.biaya_akhir || '',
      tanggal_cv: item.tanggal_cv || '',
      pic_cv: item.pic_cv || '',
      tanggal_mensetsu_1: item.tanggal_mensetsu_1 || '',
      tanggal_mensetsu_2: item.tanggal_mensetsu_2 || '',
      tanggal_mensetsu_3: item.tanggal_mensetsu_3 || '',
      status_kelulusan: item.status_kelulusan || 'Menunggu',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return
    try {
      await api.delete(`/joborder/${id}`)
      toast({ title: 'Berhasil!', description: 'Data telah dihapus.' })
      fetchData()
    } catch (error) {
      toast({ title: 'Gagal!', description: 'Tidak bisa menghapus data.', variant: 'destructive' })
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({
      kandidat_ids: [], perusahaan_id: '', nomor: '', tanggal_terbit: '',
      detail_job_order: '', bidang_ssw: '', nama_grup: '', link_grup: '',
      biaya_awal: '', biaya_akhir: '', tanggal_cv: '', pic_cv: '',
      tanggal_mensetsu_1: '', tanggal_mensetsu_2: '', tanggal_mensetsu_3: '',
      status_kelulusan: 'Menunggu',
    })
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Order / Mensetsu</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data job order dan proses seleksi</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
          <Plus size={16} className="mr-2" /> Tambah Data
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari nomor, perusahaan, kandidat..." 
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
        
        <div className="flex gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Menunggu">Menunggu</SelectItem>
              <SelectItem value="Lulus">Lulus</SelectItem>
              <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
              <SelectItem value="Tidak Hadir">Tidak Hadir</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} className="mr-1" /> Filter
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-muted text-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Filter Lanjutan</span>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-slate-500 hover:text-slate-700 h-8 px-3">
                <X size={14} className="mr-1" /> Reset
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Perusahaan</label>
                <Select value={filterPerusahaan} onValueChange={setFilterPerusahaan}>
                  <SelectTrigger className="h-10 bg-white border-border">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {perusahaans.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.nama_perusahaan}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Bidang SSW</label>
                <Select value={filterBidangSsw} onValueChange={setFilterBidangSsw}>
                  <SelectTrigger className="h-10 bg-white border-border">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {uniqueBidangSsw.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Tgl Awal</label>
                <Input 
                  type="date" 
                  value={filterTanggalAwal} 
                  onChange={e => setFilterTanggalAwal(e.target.value)}
                  className="h-10 bg-white border-border" 
                />
              </div>

              <div className="flex-shrink-0 flex items-center text-slate-400 h-10 self-end pb-2">
                <span>—</span>
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Tgl Akhir</label>
                <Input 
                  type="date" 
                  value={filterTanggalAkhir} 
                  onChange={e => setFilterTanggalAkhir(e.target.value)}
                  className="h-10 bg-white border-border" 
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">Filter aktif:</span>
              {filterPerusahaan !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {perusahaans.find(p => String(p.id) === filterPerusahaan)?.nama_perusahaan || 'Perusahaan'}
                  <button onClick={() => setFilterPerusahaan('all')} className="hover:text-blue-900"><X size={12} /></button>
                </span>
              )}
              {filterBidangSsw !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                  {filterBidangSsw}
                  <button onClick={() => setFilterBidangSsw('all')} className="hover:text-purple-900"><X size={12} /></button>
                </span>
              )}
              {(filterTanggalAwal || filterTanggalAkhir) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                  Tgl: {filterTanggalAwal || '-'} - {filterTanggalAkhir || '-'}
                  <button onClick={() => { setFilterTanggalAwal(''); setFilterTanggalAkhir('') }} className="hover:text-slate-900"><X size={12} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase size={18} className="text-gray-500" />
            <span className="font-medium text-gray-700">Job Order</span>
            {!loading && (
              <span className="text-sm text-gray-500">
                {filteredData.length} item
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
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">NO</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">NO. JOB ORDER</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">PERUSAHAAN</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">KANDIDAT</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">BIDANG SSW</th>
                <th className="text-right px-4 py-3 font-medium text-xs text-gray-500">BIAYA</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">STATUS</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center px-4 py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center px-4 py-12">
                    <div className="flex flex-col items-center">
                      <FileText size={40} className="text-gray-300 mb-2" />
                      <p className="text-gray-500">Tidak ada data</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {hasActiveFilters || debouncedSearch ? 'Coba ubah filter' : 'Data belum tersedia'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const stCfg = statusConfig[item.status_kelulusan] || { label: item.status_kelulusan, bg: 'bg-gray-100', text: 'text-gray-700' }
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{globalIndex}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-gray-700 text-sm">{item.nomor || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-sm">{item.nama_perusahaan || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {item.nama_kandidat ? item.nama_kandidat.split(', ').slice(0, 2).map((nama: string, idx: number) => (
                            <span key={idx} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {nama.trim()}
                            </span>
                          )) : <span className="text-gray-400 text-xs">-</span>}
                          {item.nama_kandidat && item.nama_kandidat.split(', ').length > 2 && (
                            <span className="text-xs text-gray-400">+{item.nama_kandidat.split(', ').length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-sm">{item.bidang_ssw || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-700 text-sm">
                          {item.biaya_awal ? `Rp ${Number(item.biaya_awal).toLocaleString('id-ID')}` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${stCfg.bg} ${stCfg.text}`}>
                          {stCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setDetailItem(item); setShowDetailModal(true) }} className="h-8 w-8 text-gray-500 hover:text-gray-700">
                            <Eye size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-gray-500 hover:text-gray-700">
                            <Edit size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
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

        {!loading && filteredData.length > 0 && (
          <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
            <p className="text-xs text-gray-500">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} dari {filteredData.length}
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

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-xl">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a] px-4 py-3 flex items-center justify-between sticky top-0 z-10 rounded-t-lg">
              <h2 className="text-white font-semibold">{editingId ? 'Update' : 'Tambah'} Job Order</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="text-white hover:bg-white/20">
                <X size={20} />
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">No. Job Order</label>
                  <Input value={form.nomor} onChange={e => setForm(p => ({ ...p, nomor: e.target.value }))} placeholder="Contoh: JO-2024-001" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tanggal Terbit</label>
                  <Input type="date" value={form.tanggal_terbit} onChange={e => setForm(p => ({ ...p, tanggal_terbit: e.target.value }))} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Perusahaan</label>
                  <Select value={form.perusahaan_id} onValueChange={v => setForm(p => ({ ...p, perusahaan_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih Perusahaan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak Ada</SelectItem>
                      {perusahaans.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.nama_perusahaan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Bidang SSW</label>
                  <Input value={form.bidang_ssw} onChange={e => setForm(p => ({ ...p, bidang_ssw: e.target.value }))} placeholder="Misal: Food Service" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama Grup</label>
                  <Input value={form.nama_grup} onChange={e => setForm(p => ({ ...p, nama_grup: e.target.value }))} placeholder="Nama grup WhatsApp" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Link Grup</label>
                  <Input value={form.link_grup} onChange={e => setForm(p => ({ ...p, link_grup: e.target.value }))} placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Biaya Awal</label>
                  <Input type="number" value={form.biaya_awal} onChange={e => setForm(p => ({ ...p, biaya_awal: e.target.value }))} placeholder="0" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Biaya Akhir (Akumulasi)</label>
                  <Input type="number" value={form.biaya_akhir} onChange={e => setForm(p => ({ ...p, biaya_akhir: e.target.value }))} placeholder="0" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tanggal CV</label>
                  <Input type="date" value={form.tanggal_cv} onChange={e => setForm(p => ({ ...p, tanggal_cv: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">PIC CV</label>
                  <Input value={form.pic_cv} onChange={e => setForm(p => ({ ...p, pic_cv: e.target.value }))} placeholder="Nama admin" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tanggal Mensetsu 1</label>
                  <Input type="date" value={form.tanggal_mensetsu_1} onChange={e => setForm(p => ({ ...p, tanggal_mensetsu_1: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tanggal Mensetsu 2</label>
                  <Input type="date" value={form.tanggal_mensetsu_2} onChange={e => setForm(p => ({ ...p, tanggal_mensetsu_2: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tanggal Mensetsu 3</label>
                  <Input type="date" value={form.tanggal_mensetsu_3} onChange={e => setForm(p => ({ ...p, tanggal_mensetsu_3: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status Kelulusan</label>
                  <Select value={form.status_kelulusan} onValueChange={v => setForm(p => ({ ...p, status_kelulusan: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Menunggu">Menunggu</SelectItem>
                      <SelectItem value="Lulus">Lulus</SelectItem>
                      <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
                      <SelectItem value="Tidak Hadir">Tidak Hadir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Pilih Kandidat * ({form.kandidat_ids.length} dipilih)</label>
                    {filteredKandidats.length > 0 && (
                      <button type="button" className="text-xs text-[#1e3a5f] hover:underline" onClick={() => {
                        if (form.kandidat_ids.length === filteredKandidats.length) {
                          setForm(p => ({ ...p, kandidat_ids: [] }))
                        } else {
                          setForm(p => ({ ...p, kandidat_ids: filteredKandidats.map(k => k.id) }))
                        }
                      }}>
                        {form.kandidat_ids.length === filteredKandidats.length ? 'Unselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                  <Input placeholder="Cari kandidat..." value={kandidatSearch} onChange={e => setKandidatSearch(e.target.value)} className="mb-2" />
                  <div className="border rounded-md max-h-56 overflow-y-auto p-2 space-y-1">
                    {kandidats.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">Tidak ada kandidat</p>
                    ) : (
                      filteredKandidats.map(k => (
                        <label key={k.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                          <input type="checkbox" checked={form.kandidat_ids.includes(k.id)} onChange={e => {
                            if (e.target.checked) {
                              setForm(p => ({ ...p, kandidat_ids: [...p.kandidat_ids, k.id] }))
                            } else {
                              setForm(p => ({ ...p, kandidat_ids: p.kandidat_ids.filter(id => id !== k.id) }))
                            }
                          }} className="rounded border-slate-300" />
                          <span className="text-sm">{k.nama_romaji || k.nama}</span>
                          {k.nama_katakana && <span className="text-xs text-muted-foreground">({k.nama_katakana})</span>}
                        </label>
                      ))
                    )}
                  </div>
                  {form.kandidat_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.kandidat_ids.slice(0, 5).map(id => {
                        const k = kandidats.find(k => k.id === id)
                        return k ? (
                          <span key={id} className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            {k.nama_romaji || k.nama}
                            <button type="button" onClick={() => setForm(p => ({ ...p, kandidat_ids: p.kandidat_ids.filter(i => i !== id) }))} className="hover:text-red-500">×</button>
                          </span>
                        ) : null
                      })}
                      {form.kandidat_ids.length > 5 && (
                        <span className="text-xs text-muted-foreground self-center">+{form.kandidat_ids.length - 5} lagi</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-3">
                  <label className="text-sm font-medium text-slate-700">Detail Job Order</label>
                  <textarea value={form.detail_job_order} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(p => ({ ...p, detail_job_order: e.target.value }))} placeholder="Deskripsi pekerjaan..." className="w-full min-h-[80px] px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-[#1e3a5f] hover:bg-[#2d5a8a] min-w-[100px]">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-xl">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a] px-4 py-3 flex items-center justify-between sticky top-0 z-10 rounded-t-lg">
              <h2 className="text-white font-semibold">Detail Job Order</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)} className="text-white hover:bg-white/20">
                <X size={20} />
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-500 text-xs">No. Job Order:</span>
                  <p className="font-semibold">{detailItem.nomor || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Tanggal Terbit:</span>
                  <p>{formatDate(detailItem.tanggal_terbit)}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Perusahaan:</span>
                  <p>{detailItem.nama_perusahaan || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Bidang SSW:</span>
                  <p>{detailItem.bidang_ssw || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Status Kelulusan:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${statusConfig[detailItem.status_kelulusan]?.bg} ${statusConfig[detailItem.status_kelulusan]?.text}`}>
                    {detailItem.status_kelulusan}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Nama Grup:</span>
                  <p>{detailItem.nama_grup || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Link Grup:</span>
                  <p>{detailItem.link_grup ? <a href={detailItem.link_grup} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{detailItem.link_grup}</a> : '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Biaya Awal:</span>
                  <p>{detailItem.biaya_awal ? `Rp ${Number(detailItem.biaya_awal).toLocaleString('id-ID')}` : '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Biaya Akhir:</span>
                  <p>{detailItem.biaya_akhir ? `Rp ${Number(detailItem.biaya_akhir).toLocaleString('id-ID')}` : '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Tanggal CV:</span>
                  <p>{formatDate(detailItem.tanggal_cv)}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">PIC CV:</span>
                  <p>{detailItem.pic_cv || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Tanggal Mensetsu 1:</span>
                  <p>{formatDate(detailItem.tanggal_mensetsu_1)}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Tanggal Mensetsu 2:</span>
                  <p>{formatDate(detailItem.tanggal_mensetsu_2)}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-500 text-xs">Tanggal Mensetsu 3:</span>
                  <p>{formatDate(detailItem.tanggal_mensetsu_3)}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-500 text-xs">Kandidat ({detailItem.kandidat_ids?.length || 0}):</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailItem.nama_kandidat ? detailItem.nama_kandidat.split(', ').map((nama: string, idx: number) => (
                    <span key={idx} className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs px-3 py-1 rounded-full font-medium">
                      {nama.trim()}
                    </span>
                  )) : '-'}
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-500 text-xs">Detail Job Order:</span>
                <p className="mt-1 text-sm whitespace-pre-wrap">{detailItem.detail_job_order || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
