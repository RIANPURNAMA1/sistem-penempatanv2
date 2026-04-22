import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'
import { Search, Eye, Users, Loader2, FileText, ChevronLeft, ChevronRight, History, LayoutDashboard, UserCheck, UserPlus, FileStack, Download } from 'lucide-react'
import KandidatTable from '@/components/admin-sistem-lama/KandidatTable'
import DataCvTable from '@/components/admin-sistem-lama/DataCvTable'
import DashboardSistemLama from '@/components/admin-sistem-lama/DashboardSistemLama'
import { generatePendaftaranPDF, generatePendaftaranExcel, downloadDokumen } from '@/lib/pendaftaranGenerator'

interface Dokumen {
  foto?: string
  ktp?: string
  kk?: string
  ijasah?: string
  sertifikat_jft?: string | null
  sertifikat_ssw?: string[] | null
  bukti_pelunasan?: string
  akte?: string
}

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
  foto: string | null
  created_at: string
  nama_cabang: string | null
  dokumen: Dokumen | null
}

export default function DataSistemLamaPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pendaftaran' | 'kandidat' | 'terverifikasi' | 'datacv'>('dashboard')
  const [data, setData] = useState<Pendaftaran[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedData, setSelectedData] = useState<Pendaftaran | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [kandidatData, setKandidatData] = useState<any[]>([])
  const [selectedKandidat, setSelectedKandidat] = useState<any>(null)
  const [showKandidatModal, setShowKandidatModal] = useState(false)

  const handleSelectKandidat = (kandidat: any) => {
    setSelectedKandidat(kandidat)
    setShowKandidatModal(true)
  }

  const load = () => {
    setLoading(true)
    fetch('https://matchingjob.mendunia.id/api/pendaftaran')
      .then(r => r.json())
      .then(r => {
        if (r.success) {
          const mappedData = r.data.map((item: any) => ({
            ...item,
            dokumen: item.dokumen || {}
          }))
          setData(mappedData)
        }
      })
      .catch(() => toast({ title: 'Gagal memuat', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    fetch('https://matchingjob.mendunia.id/api/kandidat')
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

  const sswStatsMap: Record<string, { laki: number; perempuan: number }> = {}
  kandidatData.forEach(k => {
    const s = k.bidang_ssw || 'Lainnya'
    const gender = k.pendaftaran?.jenis_kelamin || k.jenis_kelamin || '-'
    if (!sswStatsMap[s]) {
      sswStatsMap[s] = { laki: 0, perempuan: 0 }
    }
    if (gender === 'Laki-laki') {
      sswStatsMap[s].laki++
    } else if (gender === 'Perempuan') {
      sswStatsMap[s].perempuan++
    }
  })

  const sswStats = Object.keys(sswStatsMap).map(ssw => ({
    ssw,
    laki: sswStatsMap[ssw].laki,
    perempuan: sswStatsMap[ssw].perempuan,
    total: sswStatsMap[ssw].laki + sswStatsMap[ssw].perempuan
  })).sort((a, b) => b.total - a.total)

  const progressStats: Record<string, number> = {}
  kandidatData.forEach(k => { const p = k.status_kandidat || 'Unknown'; progressStats[p] = (progressStats[p] || 0) + 1 })

  const cabangStatsMap: Record<string, Record<string, number>> = {}
  kandidatData.forEach(k => {
    const cabang = k.cabang?.nama_cabang || k.nama_cabang || 'Tanpa Cabang'
    const status = k.status_kandidat || 'Unknown'
    if (!cabangStatsMap[cabang]) {
      cabangStatsMap[cabang] = {}
    }
    cabangStatsMap[cabang][status] = (cabangStatsMap[cabang][status] || 0) + 1
  })

  const cabangStats = Object.keys(cabangStatsMap).map(cabang => ({
    nama_cabang: cabang,
    progress: Object.keys(cabangStatsMap[cabang]).map(status => ({
      status,
      count: cabangStatsMap[cabang][status]
    }))
  }))

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pendaftaran', label: 'Pendaftaran', icon: UserPlus },
    { id: 'kandidat', label: 'Kandidat', icon: Users },
    { id: 'datacv', label: 'Data CV', icon: FileStack },
    { id: 'terverifikasi', label: 'Terverifikasi', icon: UserCheck },
  ]

  return (
    <div className="page-container p-6 overflow-visible">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Data Sistem Lama</h1>
        <p className="text-sm text-gray-500">Manajemen data pendaftaran</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto">
        {tabs.map(tab => (
          <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(tab.id as any)}>
            <tab.icon size={14} className="mr-1 md:mr-2" /> <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <DashboardSistemLama
          total={total}
          diterima={diterima}
          menunggu={menunggu}
          ditolak={ditolak}
          sswStats={sswStats}
          progressStats={progressStats}
          cabangStats={cabangStats}
        />
      )}

{activeTab === 'pendaftaran' && (
        <div className="overflow-visible">
          <div className="flex justify-between mb-4">
            <div className="relative w-full max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Cari..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
          </div>
          
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-3 px-4 pb-4">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin mx-auto" />
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="py-12 text-center text-gray-500">Tidak ada data</div>
            ) : (
              paginatedData.map((item, index) => {
                const fotoFromTable = item.foto;
                const fotoFromDokumen = item.dokumen?.foto;
                const fotoPath = fotoFromTable || fotoFromDokumen;
                let fotoUrl = '/images/default-avatar.png';
                if (fotoPath) {
                  if (fotoPath.startsWith('http')) {
                    fotoUrl = fotoPath;
                  } else {
                    fotoUrl = `https://matchingjob.mendunia.id/dokumen/${fotoPath}`;
                  }
                }
                return (
                  <div key={item.id} className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img src={fotoUrl} alt={item.nama} className="w-12 h-12 rounded-full object-cover border" onError={(e) => (e.target as HTMLImageElement).src = '/images/default-avatar.png'} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.nama}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.nik}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${item.verifikasi === 'diterima' ? 'bg-green-100 text-green-700' : item.verifikasi === 'ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.verifikasi || '-'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-400">Email</span><p className="text-gray-600">{item.email || '-'}</p></div>
                      <div><span className="text-gray-400">No. WA</span><p className="text-green-600">{item.no_wa || '-'}</p></div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => { setSelectedData(item); setShowModal(true) }}>
                      <Eye size={14} className="mr-1" /> Lihat Detail
                    </Button>
                  </div>
                )
              })
            )}
            
            {/* Mobile Pagination */}
            {!loading && filteredData.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-gray-500">{(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredData.length)} dari {filteredData.length}</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft size={14} /></Button>
                  <span className="text-xs px-2">{page}/{totalPages}</span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight size={14} /></Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="px-3 py-2 text-left">NO</th><th className="px-3 py-2 text-left">FOTO</th><th className="px-3 py-2 text-left">NAMA</th><th className="px-3 py-2 text-left">NIK</th><th className="px-3 py-2 text-left">KONTAK</th><th className="px-3 py-2 text-center">VERIFIKASI</th><th className="px-3 py-2 text-center">AKSI</th></tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr> : paginatedData.map((item, idx) => {
                      const fotoFromTable = item.foto;
                      const fotoFromDokumen = item.dokumen?.foto;
                      const fotoPath = fotoFromTable || fotoFromDokumen;
                      
                      let fotoUrl = '/images/default-avatar.png';
                      if (fotoPath) {
                        if (fotoPath.startsWith('http')) {
                          fotoUrl = fotoPath;
                        } else {
                          fotoUrl = `https://matchingjob.mendunia.id/dokumen/${fotoPath}`;
                        }
                      }
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-400">{((page - 1) * perPage) + idx + 1}</td>
                          <td className="px-3 py-2 text-center">
                            <img src={fotoUrl} alt={`${item.nama}'s photo`} className="w-10 h-10 rounded-full object-cover border border-gray-200" onError={(e) => (e.target as HTMLImageElement).src = '/images/default-avatar.png'} />
                          </td>
                          <td className="px-3 py-2 font-medium">{item.nama}</td>
                          <td className="px-3 py-2 font-mono text-xs">{item.nik}</td>
                          <td className="px-3 py-2 text-xs"><div>{item.email}</div><div className="text-green-600">{item.no_wa}</div></td>
                          <td className="px-3 py-2 text-center"><span className={`px-2 py-1 rounded text-xs ${item.verifikasi === 'diterima' ? 'bg-green-100 text-green-700' : item.verifikasi === 'ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.verifikasi || '-'}</span></td>
                          <td className="px-3 py-2 text-center"><Button variant="ghost" size="sm" onClick={() => { setSelectedData(item); setShowModal(true) }}><Eye size={14} /></Button></td>
                        </tr>
                      );
                  })}
                </tbody>
              </table>
              {!loading && filteredData.length > 0 && (
                <div className="hidden md:flex px-4 py-2 border-t items-center justify-between bg-gray-50 text-xs">
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

      {activeTab === 'kandidat' && <KandidatTable onSelect={handleSelectKandidat} />}

      {activeTab === 'datacv' && <DataCvTable />}

      {activeTab === 'terverifikasi' && (
        <div className="overflow-visible">
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-3 px-4 pb-4">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin mx-auto" />
              </div>
            ) : filteredData.filter(d => d.verifikasi === 'diterima').length === 0 ? (
              <div className="py-12 text-center text-gray-500">Tidak ada data</div>
            ) : (
              filteredData.filter(d => d.verifikasi === 'diterima').map((item, idx) => (
                <div key={item.id} className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.nama}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.nik}</p>
                    </div>
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-400">No. WA</span><p className="text-green-600">{item.no_wa || '-'}</p></div>
                    <div><span className="text-gray-400">Pendidikan</span><p className="text-gray-600">{item.pendidikan_terakhir || '-'}</p></div>
                    <div><span className="text-gray-400">Status JFT</span><span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${item.status_jft === 'sudah ujian jft' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status_jft || '-'}</span></div>
                    <div><span className="text-gray-400">Status SSW</span><span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${item.status_ssw === 'sudah ujian ssw' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status_ssw || '-'}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden md:block overflow-x-auto">
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
        </div>
      )}

      {showModal && selectedData && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Detail: {selectedData.nama}</DialogTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => generatePendaftaranExcel(selectedData)}>
                    <Download size={14} className="mr-2" /> Download Excel
                  </Button>
                  <Button size="sm" onClick={() => generatePendaftaranPDF(selectedData)}>
                    <Download size={14} className="mr-2" /> Download PDF
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4">
              <div><h4 className="font-bold text-blue-600 text-sm mb-2">IDENTITAS</h4><DetailItem label="NIK" value={selectedData.nik} /><DetailItem label="Agama" value={selectedData.agama} /><DetailItem label="Pendidikan" value={selectedData.pendidikan_terakhir} /></div>
              <div><h4 className="font-bold text-blue-600 text-sm mb-2">PROGRAM</h4><DetailItem label="ID Prometric" value={selectedData.id_prometric} /><DetailItem label="Status JFT" value={selectedData.status_jft} /><DetailItem label="Status SSW" value={selectedData.status_ssw} /></div>
              <div><h4 className="font-bold text-blue-600 text-sm mb-2">DOKUMEN</h4>
                <div className="grid grid-cols-2 gap-2">
                  <LinkFileWithDownload label="Pas Foto" path={selectedData.dokumen?.foto} />
                  <LinkFileWithDownload label="KTP" path={selectedData.dokumen?.ktp} />
                  <LinkFileWithDownload label="KK" path={selectedData.dokumen?.kk} />
                  <LinkFileWithDownload label="Ijazah" path={selectedData.dokumen?.ijasah} />
                  <LinkFileWithDownload label="Akte Kelahiran" path={selectedData.dokumen?.akte} />
                  <LinkFileWithDownload label="Bukti Pelunasan" path={selectedData.dokumen?.bukti_pelunasan} />
                  <LinkFileWithDownload label="Sertifikat JFT" path={selectedData.dokumen?.sertifikat_jft} />
                  <LinkFileWithDownload label="Sertifikat SSW" path={selectedData.dokumen?.sertifikat_ssw} />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showKandidatModal && selectedKandidat && (
        <Dialog open={showKandidatModal} onOpenChange={setShowKandidatModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Kandidat: {selectedKandidat?.pendaftaran?.nama}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-blue-600 text-sm mb-2">DATA PRIBADI</h4>
                <DetailItem label="NIK" value={selectedKandidat.pendaftaran?.nik} />
                <DetailItem label="No WA" value={selectedKandidat.pendaftaran?.no_wa} />
                <DetailItem label="Email" value={selectedKandidat.pendaftaran?.email} />
              </div>
              <div>
                <h4 className="font-bold text-blue-600 text-sm mb-2">STATUS</h4>
                <DetailItem label="Status Kandidat" value={selectedKandidat.status_kandidat} />
                <DetailItem label="Perusahaan" value={selectedKandidat.nama_perusahaan} />
                <DetailItem label="Cabang" value={selectedKandidat.cabang?.nama_cabang} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

const cleanPath = (p: string): string => {
  if (!p) return ''
  let cleaned = String(p)
  
  try { cleaned = decodeURIComponent(cleaned) } catch {}
  
  cleaned = cleaned.replace(/\\[\\"\[\]]/g, '')
  
  if (cleaned.includes('127.0.0.1:8000/') || cleaned.includes('localhost:8000/')) {
    const parts = cleaned.split(/127\.0\.0\.1:8000\//).pop()?.split(/localhost:8000\//).pop()
    if (parts) cleaned = parts
  }
  
  cleaned = cleaned.replace(/[\[\]"]+/g, '')
  cleaned = cleaned.replace(/^["']+|["']+$/g, '')
  cleaned = cleaned.replace(/\/+/g, '/')
  cleaned = cleaned.replace(/dokumen\//gi, '')
  cleaned = cleaned.replace(/\/$/, '')
  
  return cleaned
}

const parseDokumenPath = (path: any): string[] => {
  if (!path || (Array.isArray(path) && path.length === 0)) return []
  let result: string[] = []
  const seen = new Set<string>()
  
  const addPath = (val: any) => {
    if (!val) return
    let s = val
    if (typeof s !== 'string') s = String(s)
    
    s = s.replace(/\\/g, '')
    try { s = decodeURIComponent(s) } catch {}
    
    if (s.includes('127.0.0.1:8000/') || s.includes('localhost:8000/')) {
      const parts = s.split(/127\.0\.0\.1:8000\//).pop()?.split(/localhost:8000\//).pop()
      if (parts) s = parts
    }
    
    s = s.replace(/[\[\]"]+/g, '')
    s = s.replace(/^["']+|["']+$/g, '')
    s = s.replace(/\/+/g, '/')
    
    s = s.replace(/\/$/, '')
    s = s.trim()
    
    if (s && !seen.has(s)) {
      seen.add(s)
      result.push(s)
    }
  }
  
  if (Array.isArray(path)) {
    path.forEach((p: any) => {
      if (Array.isArray(p)) {
        p.forEach((inner: any) => addPath(inner))
      } else {
        addPath(p)
      }
    })
  } else {
    addPath(path)
  }
  
  return result
}

function LinkFile({ label, path }: { label: string, path?: string | string[] | null }) {
  const pathArray = parseDokumenPath(path)
  
  if (pathArray.length === 0) return <div className="p-2 border border-dashed rounded text-gray-400 text-xs text-center">{label} (-)</div>
  
  return (
    <div className="flex flex-col gap-1">
      {pathArray.map((p, i) => {
        let fullUrl = p
        if (p.startsWith('http')) {
          fullUrl = p
        } else {
          fullUrl = `https://matchingjob.mendunia.id/dokumen/${p}`
        }
        return (
          <a key={i} href={fullUrl} target="_blank" rel="noopener noreferrer" className="block p-2 border border-blue-200 rounded text-blue-600 text-xs text-center hover:bg-blue-50">
            <FileText size={12} className="mx-auto mb-1" />{label} {pathArray.length > 1 ? `#${i + 1}` : ''}
          </a>
        )
      })}
    </div>
  )
}

function LinkFileWithDownload({ label, path }: { label: string, path?: string | string[] | null }) {
  const pathArray = parseDokumenPath(path)
  const [downloading, setDownloading] = useState<string | null>(null)
  
  const handleDownload = async (p: string, idx: number) => {
    const key = `${idx}`
    setDownloading(key)
    try {
      await downloadDokumen(p, `${label}_${idx + 1}`)
    } catch {
      toast({ title: 'Gagal download dokumen', variant: 'destructive' })
    } finally {
      setDownloading(null)
    }
  }
  
  if (pathArray.length === 0) return <div className="p-2 border border-dashed rounded text-gray-400 text-xs text-center">{label} (-)</div>
  
  return (
    <div className="flex flex-col gap-1">
      {pathArray.map((p, i) => {
        let fullUrl = p
        if (p.startsWith('http')) {
          fullUrl = p
        } else {
          fullUrl = `https://matchingjob.mendunia.id/dokumen/${p}`
        }
        return (
          <div key={i} className="flex gap-1">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex-1 block p-2 border border-blue-200 rounded text-blue-600 text-xs text-center hover:bg-blue-50">
              <FileText size={12} className="mx-auto mb-1" />{label} {pathArray.length > 1 ? `#${i + 1}` : ''}
            </a>
            <button
              onClick={() => handleDownload(p, i)}
              disabled={downloading === `${i}`}
              className="p-2 border border-green-200 rounded text-green-600 text-xs hover:bg-green-50 disabled:opacity-50"
              title="Download"
            >
              {downloading === `${i}` ? <Loader2 size={12} className="animate-spin mx-auto" /> : <Download size={12} className="mx-auto" />}
            </button>
          </div>
        )
      })}
    </div>
  )
}



function DetailItem({ label, value }: { label: string, value: any }) {
  return <div className="mb-2"><p className="text-[10px] text-gray-500 uppercase">{label}</p><p className="text-sm font-medium">{value || '-'}</p></div>
}