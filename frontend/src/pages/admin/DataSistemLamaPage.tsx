import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'
import { Search, Eye, Users, Loader2, FileText, ChevronLeft, ChevronRight, History, LayoutDashboard, FileCheck, UserCheck, UserPlus } from 'lucide-react'
import KandidatTable from '@/components/admin/KandidatTable'

interface Pendaftaran {
  id: number
  nama: string
  nik: string
  email: string
  no_wa: string
  jenis_kelamin: string | null
  agama: string | null
  tempat_lahir: string | null
  tempat_tanggal_lahir: string | null
  pendidikan_terakhir: string
  status: string | null
  id_prometric: string | null
  status_jft: string | null
  status_ssw: string | null
  verifikasi: string | null
  ktp: string | null
  kk: string | null
  ijasah: string | null
  created_at: string
  nama_cabang: string | null
}

export default function DataSistemLamaPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pendaftaran' | 'kandidat' | 'terverifikasi'>('dashboard')
  const [data, setData] = useState<Pendaftaran[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedData, setSelectedData] = useState<Pendaftaran | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [kandidatData, setKandidatData] = useState<any[]>([])

  const load = () => {
    setLoading(true)
    fetch('http://127.0.0.1:8000/api/pendaftaran')
      .then(r => r.json())
      .then(r => { if (r.success) setData(r.data) })
      .catch(() => toast({ title: 'Gagal memuat', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/kandidat')
      .then(r => r.json())
      .then(r => { if (r.success) setKandidatData(r.data) })
      .catch(() => {})
  }, [])
  useEffect(() => { setPage(1) }, [search])

  const filteredData = data.filter(item => {
    const s = search.toLowerCase()
    return item.nama?.toLowerCase().includes(s) || item.nik?.toLowerCase().includes(s)
  })

  const totalPages = Math.ceil(filteredData.length / perPage)
  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage)

  const total = data.length
  const diterima = data.filter(d => d.verifikasi === 'diterima').length
  const menunggu = data.filter(d => d.verifikasi === 'menunggu').length
  const ditolak = data.filter(d => d.verifikasi === 'ditolak').length

  const sswStats: Record<string, number> = {}
  kandidatData.forEach(k => { const s = k.bidang_ssw || 'Lainnya'; sswStats[s] = (sswStats[s] || 0) + 1 })

  const progressStats: Record<string, number> = {}
  kandidatData.forEach(k => { const p = k.status_kandidat || 'Unknown'; progressStats[p] = (progressStats[p] || 0) + 1 })

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pendaftaran', label: 'Pendaftaran', icon: UserPlus },
    { id: 'kandidat', label: 'Kandidat', icon: Users },
    { id: 'terverifikasi', label: 'Terverifikasi', icon: UserCheck },
  ]

  return (
    <div className="page-container p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Data Sistem Lama</h1>
        <p className="text-sm text-gray-500">Manajemen data pendaftaran</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} onClick={() => setActiveTab(tab.id as any)}>
            <tab.icon size={16} className="mr-2" /> {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><Users size={24} className="text-blue-600" /></div><div><p className="text-2xl font-bold">{total}</p><p className="text-xs text-gray-500">Total</p></div></div></div>
            <div className="bg-white rounded-lg border p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"><FileCheck size={24} className="text-green-600" /></div><div><p className="text-2xl font-bold">{diterima}</p><p className="text-xs text-gray-500">Diterima</p></div></div></div>
            <div className="bg-white rounded-lg border p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center"><Users size={24} className="text-yellow-600" /></div><div><p className="text-2xl font-bold">{menunggu}</p><p className="text-xs text-gray-500">Menunggu</p></div></div></div>
            <div className="bg-white rounded-lg border p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center"><Users size={24} className="text-red-600" /></div><div><p className="text-2xl font-bold">{ditolak}</p><p className="text-xs text-gray-500">Ditolak</p></div></div></div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Statistik SSW</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.keys(sswStats).length === 0 ? <p className="text-gray-500">Belum ada data</p> : Object.keys(sswStats).map(ssw => (
                <div key={ssw} className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">{ssw}</p><p className="text-xl font-bold">{sswStats[ssw]}</p></div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Statistik Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.keys(progressStats).length === 0 ? <p className="text-gray-500">Belum ada data</p> : Object.keys(progressStats).map(prog => {
                const colors: Record<string, string> = { 'Job Matching': 'bg-blue-100', 'Pending': 'bg-gray-100', 'Interview': 'bg-yellow-100', 'Lulus interview': 'bg-green-100', 'Gagal Interview': 'bg-red-100' }
                return <div key={prog} className={`rounded-lg border p-4 ${colors[prog] || 'bg-white'}`}><p className="text-xs text-gray-600">{prog}</p><p className="text-xl font-bold">{progressStats[prog]}</p></div>
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pendaftaran' && (
        <div>
          <div className="flex justify-between mb-4">
            <div className="relative w-full max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Cari..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
          </div>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr><th className="px-3 py-2 text-left">NO</th><th className="px-3 py-2 text-left">NAMA</th><th className="px-3 py-2 text-left">NIK</th><th className="px-3 py-2 text-left">KONTAK</th><th className="px-3 py-2 text-center">VERIFIKASI</th><th className="px-3 py-2 text-center">AKSI</th></tr>
              </thead>
              <tbody className="divide-y">
                {loading ? <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr> : paginatedData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{(page - 1) * perPage + idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{item.nama}</td>
                    <td className="px-3 py-2 font-mono text-xs">{item.nik}</td>
                    <td className="px-3 py-2 text-xs"><div>{item.email}</div><div className="text-green-600">{item.no_wa}</div></td>
                    <td className="px-3 py-2 text-center"><span className={`px-2 py-1 rounded text-xs ${item.verifikasi === 'diterima' ? 'bg-green-100 text-green-700' : item.verifikasi === 'ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.verifikasi || '-'}</span></td>
                    <td className="px-3 py-2 text-center"><Button variant="ghost" size="sm" onClick={() => { setSelectedData(item); setShowModal(true) }}><Eye size={14} /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredData.length > 0 && (
              <div className="px-4 py-2 border-t flex items-center justify-between bg-gray-50 text-xs">
                <div className="flex items-center gap-2">
                  <span>Baris:</span>
                  <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }} className="border rounded px-1"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
                  <span>{(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredData.length)} dari {filteredData.length}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft size={12} /></Button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                    if (p < 1 || p > totalPages) return null
                    return <Button key={p} variant={page === p ? "default" : "outline"} size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p)}>{p}</Button>
                  })}
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight size={12} /></Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'kandidat' && <KandidatTable />}

      {activeTab === 'terverifikasi' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-3 py-2 text-left">NO</th><th className="px-3 py-2 text-left">NAMA</th><th className="px-3 py-2 text-left">NIK</th><th className="px-3 py-2 text-left">No WA</th><th className="px-3 py-2 text-left">Status JFT</th><th className="px-3 py-2 text-left">Status SSW</th></tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr> : filteredData.filter(d => d.verifikasi === 'diterima').map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium">{item.nama}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.nik}</td>
                  <td className="px-3 py-2 text-green-600">{item.no_wa}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${item.status_jft === 'sudah ujian jft' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status_jft || '-'}</span></td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${item.status_ssw === 'sudah ujian ssw' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status_ssw || '-'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedData && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>Detail: {selectedData.nama}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-3 gap-4">
              <div><h4 className="font-bold text-blue-600 text-sm mb-2">IDENTITAS</h4><DetailItem label="NIK" value={selectedData.nik} /><DetailItem label="Agama" value={selectedData.agama} /><DetailItem label="Pendidikan" value={selectedData.pendidikan_terakhir} /></div>
              <div><h4 className="font-bold text-blue-600 text-sm mb-2">PROGRAM</h4><DetailItem label="ID Prometric" value={selectedData.id_prometric} /><DetailItem label="Status JFT" value={selectedData.status_jft} /><DetailItem label="Status SSW" value={selectedData.status_ssw} /></div>
              <div><h4 className="font-bold text-blue-600 text-sm mb-2">DOKUMEN</h4><LinkFile label="KTP" path={selectedData.ktp} /><LinkFile label="KK" path={selectedData.kk} /><LinkFile label="Ijazah" path={selectedData.ijasah} /></div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return <div className="mb-2"><p className="text-[10px] text-gray-500 uppercase">{label}</p><p className="text-sm font-medium">{value || '-'}</p></div>
}

function LinkFile({ label, path }: { label: string; path?: string | null }) {
  if (!path) return <div className="p-2 border border-dashed rounded text-gray-400 text-xs text-center">{label} (-)</div>
  const fp = String(path).startsWith('http') ? path.substring(path.indexOf('/', 8) + 1) : path
  return <a href={`http://localhost:8000/${fp}`} target="_blank" className="block p-2 border border-blue-200 rounded text-blue-600 text-xs text-center hover:bg-blue-50"><FileText size={12} className="mx-auto mb-1" />{label}</a>
}