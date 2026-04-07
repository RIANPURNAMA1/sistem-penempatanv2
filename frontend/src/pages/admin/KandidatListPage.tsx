import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'
import { Search, Eye, Filter, X } from 'lucide-react'

interface Kandidat {
  id: number; user_id: number; nama: string; email: string; nama_romaji: string
  nama_katakana: string; jenis_kelamin: string; umur: number; nama_cabang: string
  status_formulir: string; status_progres: string; updated_at: string; level_bahasa_jepang: string
  sertifikat_ssw: string; pendidikan_terakhir: string
}

const statusFormulirConfig: Record<string, { label: string; variant: string }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Terkirim', variant: 'info' },
  reviewed: { label: 'Direview', variant: 'warning' },
  approved: { label: 'Disetujui', variant: 'success' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

const progresConfig: Record<string, { label: string; variant: string }> = {
  'Job Matching': { label: 'Job Matching', variant: 'warning' },
  'Pending': { label: 'Pending', variant: 'secondary' },
  'lamar ke perusahaan': { label: 'Lamar ke Perusahaan', variant: 'info' },
  'Interview': { label: 'Interview', variant: 'warning' },
  'Jadwalkan Interview Ulang': { label: 'Jadwalkan Interview Ulang', variant: 'outline' },
  'Lulus interview': { label: 'Lulus Interview', variant: 'success' },
  'Gagal Interview': { label: 'Gagal Interview', variant: 'destructive' },
  'Pemberkasan': { label: 'Pemberkasan', variant: 'info' },
  'Berangkat': { label: 'Berangkat', variant: 'success' },
  'Ditolak': { label: 'Ditolak', variant: 'destructive' },
}

const sswOptions = ['Pengolahan Makanan', 'Pertanian', 'Kaigo (perawat)', 'Building Cleaning', 'Restoran', 'Driver']
const jenjangOptions = ['SD', 'SMP', 'SMA/SMK', 'Perguruan Tinggi']

export default function KandidatListPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState<Kandidat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [cabangList, setCabangList] = useState<{ id: number; nama_cabang: string }[]>([])
  const [cabangFilter, setCabangFilter] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('')
  const [umurMin, setUmurMin] = useState('')
  const [umurMax, setUmurMax] = useState('')
  const [bidangSSW, setBidangSSW] = useState('')
  const [progres, setProgres] = useState('')
  const [jenjang, setJenjang] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const load = () => {
    setLoading(true)
    const params: any = {}
    if (search) params.search = search
    if (status) params.status = status
    if (cabangFilter) params.cabang_id = cabangFilter
    if (jenisKelamin) params.jenis_kelamin = jenisKelamin
    if (umurMin) params.umur_min = umurMin
    if (umurMax) params.umur_max = umurMax
    if (bidangSSW) params.bidang_ssw = bidangSSW
    if (progres) params.status_progres = progres
    if (jenjang) params.jenjang = jenjang
    api.get('/kandidat', { params }).then(r => setData(r.data.data)).finally(() => setLoading(false))
  }

  const clearFilters = () => {
    setStatus('')
    setCabangFilter('')
    setJenisKelamin('')
    setUmurMin('')
    setUmurMax('')
    setBidangSSW('')
    setProgres('')
    setJenjang('')
  }

  const hasActiveFilters = status || cabangFilter || jenisKelamin || umurMin || umurMax || bidangSSW || progres || jenjang

  useEffect(() => { load() }, [status, cabangFilter, jenisKelamin, umurMin, umurMax, bidangSSW, progres, jenjang])
  useEffect(() => {
    if (user?.role === 'admin_penempatan') {
      api.get('/cabang').then(r => setCabangList(r.data.data))
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load() }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Data Kandidat</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.role === 'admin_cabang' ? `Kandidat cabang ${user.nama_cabang}` : 'Semua kandidat'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-mono text-muted-foreground">{data.length} kandidat</div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} className="mr-1" /> Filter {hasActiveFilters && <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">{[status, cabangFilter, jenisKelamin, umurMin, umurMax, bidangSSW, progres].filter(Boolean).length}</span>}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Cari nama..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Button type="submit" variant="outline" size="icon"><Search size={15} /></Button>
              </form>
              <div className="flex gap-2">
                <Select value={status || 'all'} onValueChange={v => setStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Status formulir" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {Object.entries(statusFormulirConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {user?.role === 'admin_penempatan' && (
                  <Select value={cabangFilter || 'all'} onValueChange={v => setCabangFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Cabang" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Cabang</SelectItem>
                      {cabangList.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nama_cabang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2 border-t border-border">
                <Select value={jenisKelamin || 'all'} onValueChange={v => setJenisKelamin(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Jenis Kelamin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua JK</SelectItem>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={jenjang || 'all'} onValueChange={v => setJenjang(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Pendidikan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Pendidikan</SelectItem>
                    {jenjangOptions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  <Input type="number" placeholder="Umur min" value={umurMin} onChange={e => setUmurMin(e.target.value)} className="w-full" />
                </div>

                <div className="flex gap-1">
                  <Input type="number" placeholder="Umur max" value={umurMax} onChange={e => setUmurMax(e.target.value)} className="w-full" />
                </div>

                <Select value={bidangSSW || 'all'} onValueChange={v => setBidangSSW(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Bidang SSW" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua SSW</SelectItem>
                    {sswOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={progres || 'all'} onValueChange={v => setProgres(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Progres" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Progres</SelectItem>
                    {Object.entries(progresConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X size={14} className="mr-1" /> Reset
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">No</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cabang</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">JK</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Umur</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Pend. Terakhir</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bidang SSW</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status Formulir</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Progres</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center px-4 py-12 text-muted-foreground">Memuat...</td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center px-4 py-12 text-muted-foreground">Tidak ada data kandidat</td>
                  </tr>
                ) : (
                  data.map((item, i) => {
                    const stCfg = statusFormulirConfig[item.status_formulir] || { label: item.status_formulir, variant: 'secondary' }
                    const progCfg = progresConfig[item.status_progres] || { label: item.status_progres || '-', variant: 'secondary' }
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{item.nama_romaji || item.nama}</p>
                            {item.nama_katakana && <p className="text-xs text-muted-foreground">{item.nama_katakana}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{item.nama_cabang || '-'}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.jenis_kelamin || '-'}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.umur || '-'}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.pendidikan_terakhir || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sertifikat_ssw ? item.sertifikat_ssw.split(',').map((s: string) => s.trim()).join(', ') : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={stCfg.variant as any}>{stCfg.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={progCfg.variant as any}>{progCfg.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link to={`/kandidat/${item.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye size={15} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
