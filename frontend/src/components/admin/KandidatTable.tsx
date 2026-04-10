import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, X, Eye, Users, Loader2, ChevronLeft, ChevronRight, History, Clock } from 'lucide-react'
import { toast } from '@/hooks/useToast'

interface KandidatData {
  id: number
  no_kandidat: string | null
  nama: string | null
  status_kandidat: string
  status_kandidat_di_mendunia: string
  jumlah_interview: number
  nama_perusahaan: string | null
  pendaftaran: {
    id: number
    no_pendaftaran: string | null
    nama: string
    nik: string
    email: string
    no_wa: string
  }
  cabang: {
    id: number
    nama_cabang: string
  }
  created_at: string
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  'Job Matching': { label: 'Job Matching', bg: 'bg-blue-100', text: 'text-blue-700' },
  'Pending': { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-700' },
  'lamar ke perusahaan': { label: 'Melamar', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Interview': { label: 'Interview', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Jadwalkan Interview Ulang': { label: 'Interview Ulang', bg: 'bg-purple-100', text: 'text-purple-700' },
  'Lulus interview': { label: 'Lulus', bg: 'bg-green-100', text: 'text-green-700' },
  'Gagal Interview': { label: 'Gagal', bg: 'bg-red-100', text: 'text-red-700' },
  'Pemberkasan': { label: 'Pemberkasan', bg: 'bg-pink-100', text: 'text-pink-700' },
  'Berangkat': { label: 'Berangkat', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Ditolak': { label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700' },
}

interface HistoryItem {
  id: number
  kandidat_id: number
  status_kandidat: string
  status_interview: string
  catatan_interview: string
  jadwal_interview: string
  bidang_ssw: string
  nama_perusahaan: string
  detail_pekerjaan: string
  created_at: string
  updated_at: string
  kandidat: {
    id: number
    no_kandidat: string
  }
  institusi: {
    id: number
    nama: string
  }
}

interface KandidatTableProps {
  onSelect?: (kandidat: KandidatData) => void
}

export default function KandidatTable({ onSelect }: KandidatTableProps) {
  const [data, setData] = useState<KandidatData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedKandidatId, setSelectedKandidatId] = useState<number | null>(null)
  const [selectedKandidatName, setSelectedKandidatName] = useState<string>('')
  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState<HistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const load = () => {
    setLoading(true)
    fetch('http://127.0.0.1:8000/api/kandidat')
      .then(r => r.json())
      .then(r => {
        if (r.success) setData(r.data)
        else toast({ title: 'Gagal memuat data', variant: 'destructive' })
      })
      .catch(() => toast({ title: 'Gagal menyabung ke server', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setPage(1) }, [search])

  const loadHistory = (kandidatId: number, nama: string) => {
    setSelectedKandidatId(kandidatId)
    setSelectedKandidatName(nama)
    setShowHistory(true)
    setLoadingHistory(true)
    fetch(`http://127.0.0.1:8000/api/history?kandidat_id=${kandidatId}`)
      .then(r => r.json())
      .then(r => {
        if (r.success) setHistoryData(r.data)
        else setHistoryData([])
      })
      .catch(() => setHistoryData([]))
      .finally(() => setLoadingHistory(false))
  }

  const filteredData = data.filter(item => {
    const s = search.toLowerCase()
    return (
      item.pendaftaran?.nama?.toLowerCase().includes(s) ||
      item.pendaftaran?.nik?.toLowerCase().includes(s) ||
      item.pendaftaran?.email?.toLowerCase().includes(s) ||
      item.nama_perusahaan?.toLowerCase().includes(s)
    )
  })

  const totalPages = Math.ceil(filteredData.length / perPage)
  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="mt-8">
      <div className="flex flex-col lg:flex-row justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Data Kandidat Terverifikasi</h2>
          <p className="text-sm text-muted-foreground">Data kandidat dari sistem baru</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari NAMA, NIK, atau Perusahaan..." 
            className="pl-9 bg-white" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NO</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">KANDIDAT</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NIK</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">KONTAK</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PERUSAHAAN</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">CABANG</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">STATUS</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">INTERVIEW</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-gray-500">Tidak ada data</td></tr>
              ) : paginatedData.map((item, index) => {
                const stCfg = statusConfig[item.status_kandidat] || { label: item.status_kandidat, bg: 'bg-gray-100', text: 'text-gray-700' }
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400 text-xs">{(page - 1) * perPage + index + 1}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{item.pendaftaran?.nama || '-'}</div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600">{item.pendaftaran?.nik || '-'}</td>
                    <td className="px-3 py-2 text-xs">
                      <div className="text-gray-600">{item.pendaftaran?.email || '-'}</div>
                      <div className="text-green-600">{item.pendaftaran?.no_wa || '-'}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{item.nama_perusahaan || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{item.cabang?.nama_cabang || '-'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stCfg.bg} ${stCfg.text}`}>
                        {stCfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600 text-xs">{item.jumlah_interview}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => loadHistory(item.id, item.pendaftaran?.nama || '-')}>
                          <History size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onSelect?.(item)}>
                          <Eye size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="px-4 py-2 border-t flex items-center justify-between bg-gray-50 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Baris:</span>
              <select 
                value={perPage} 
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
                className="border rounded px-1 py-0.5"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500 ml-2">
                {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredData.length)} dari {filteredData.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                <ChevronLeft size={12} />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                if (pageNum < 1 || pageNum > totalPages) return null
                return (
                  <Button 
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"} 
                    size="sm" 
                    className="h-6 w-6 p-0 text-xs"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                <ChevronRight size={12} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={18} />
              Riwayat Aktivitas - {selectedKandidatName}
            </DialogTitle>
          </DialogHeader>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada riwayat</div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <div className="space-y-2">
                {historyData.map((item, idx) => (
                  <div key={item.id} className={`p-3 rounded-lg border ${idx === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-blue-600 uppercase">{item.status_kandidat}</span>
                          {item.status_interview && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.status_interview === 'Lulus' ? 'bg-green-100 text-green-700' :
                                item.status_interview === 'Gagal' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>{item.status_interview}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm mt-1 font-medium">{item.nama_perusahaan || '-'}</div>
                        <div className="text-xs text-gray-600">{item.bidang_ssw || '-'}</div>
                        {item.jadwal_interview && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            Jadwal: {item.jadwal_interview}
                          </div>
                        )}
                        {item.detail_pekerjaan && <div className="text-xs text-gray-500 mt-1">{item.detail_pekerjaan}</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                        <div className="text-xs text-gray-400">#{item.kandidat?.id}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}