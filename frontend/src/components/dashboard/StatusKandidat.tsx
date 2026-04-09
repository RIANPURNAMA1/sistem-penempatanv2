import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/components'
import { Award, TrendingUp, Filter } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import { useState, useMemo } from 'react'

interface SSWGender {
  ssw: string
  laki: number
  perempuan: number
  total: number
}

interface SSWProgres {
  ssw: string
  progres: { status: string; count: number }[]
}

interface StatusKandidatProps {
  stats: SSWGender[] | undefined
  bySSWProgres: SSWProgres[] | undefined
  byCabangProgres: { nama_cabang: string; status_progres: string; count: number }[] | undefined
  loading: boolean
}

const progresColors: Record<string, string> = {
  'Job Matching': '#1e3a5f',
  'Pending': '#94a3b8',
  'lamar ke perusahaan': '#4a7ab5',
  'Interview': '#8cbbff',
  'Jadwalkan Interview Ulang': '#a8c5f0',
  'Lulus interview': '#22c55e',
  'Gagal Interview': '#ef4444',
  'Pemberkasan': '#f59e0b',
  'Berangkat': '#10b981',
  'Ditolak': '#dc2626'
}

const progresList = ['Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview', 'Pemberkasan', 'Berangkat', 'Ditolak']

export default function StatusKandidat({ stats, bySSWProgres, byCabangProgres, loading }: StatusKandidatProps) {
  const [activeSSW, setActiveSSW] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProgress, setSelectedProgress] = useState<Set<string>>(new Set(progresList))
  const [selectedGender, setSelectedGender] = useState<Set<string>>(new Set(['Laki-laki', 'Perempuan']))

  const toggleProgress = (progress: string) => {
    setSelectedProgress(prev => {
      const next = new Set(prev)
      if (next.has(progress)) {
        if (next.size > 1) next.delete(progress)
      } else {
        next.add(progress)
      }
      return next
    })
  }

  const toggleGender = (gender: string) => {
    setSelectedGender(prev => {
      const next = new Set(prev)
      if (next.has(gender)) {
        if (next.size > 1) next.delete(gender)
      } else {
        next.add(gender)
      }
      return next
    })
  }

  const filteredStats = useMemo(() => {
    if (!stats) return []
    return stats.map(item => ({
      ...item,
      laki: selectedGender.has('Laki-laki') ? item.laki : 0,
      perempuan: selectedGender.has('Perempuan') ? item.perempuan : 0,
      total: (selectedGender.has('Laki-laki') ? item.laki : 0) + (selectedGender.has('Perempuan') ? item.perempuan : 0)
    }))
  }, [stats, selectedGender])

  const filteredBySSWProgres = useMemo(() => {
    if (!bySSWProgres) return []
    return bySSWProgres.map(item => ({
      ...item,
      progres: item.progres.filter(p => selectedProgress.has(p.status))
    }))
  }, [bySSWProgres, selectedProgress])

  const filteredByCabangProgres = useMemo(() => {
    if (!byCabangProgres) return []
    return byCabangProgres.filter(d => selectedProgress.has(d.status_progres))
  }, [byCabangProgres, selectedProgress])

  const selectedSSWData = activeSSW ? filteredBySSWProgres.find(d => d.ssw === activeSSW) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-[#1e3a5f]" />
          <span className="text-sm font-medium">Statistik Kandidat per Bidang SSW</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
              showFilters ? 'bg-[#1e3a5f] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Filter size={12} />
            Filter
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              viewMode === 'cards' ? 'bg-[#1e3a5f] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Kartu
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              viewMode === 'chart' ? 'bg-[#1e3a5f] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Grafik
          </button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">Filter Progress</p>
                <div className="flex flex-wrap gap-2">
                  {progresList.map(progres => (
                    <label key={progres} className="flex items-center gap-1.5 text-xs cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedProgress.has(progres)}
                        onChange={() => toggleProgress(progres)}
                        className="w-3.5 h-3.5 rounded accent-[#1e3a5f] cursor-pointer"
                      />
                      <span 
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ backgroundColor: progresColors[progres] + '20', color: progresColors[progres] }}
                      >
                        {progres}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">Filter Gender</p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGender.has('Laki-laki')}
                      onChange={() => toggleGender('Laki-laki')}
                      className="w-3.5 h-3.5 rounded accent-[#1e3a5f] cursor-pointer"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGender.has('Perempuan')}
                      onChange={() => toggleGender('Perempuan')}
                      className="w-3.5 h-3.5 rounded accent-[#1e3a5f] cursor-pointer"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
      </div>

      {viewMode === 'cards' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p className="text-sm text-muted-foreground col-span-full">Memuat...</p>
            ) : (stats?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">Belum ada data</p>
            ) : (
              filteredStats?.map(item => (
                <Card 
                  key={item.ssw} 
                  className={`cursor-pointer transition-all hover:shadow-md ${activeSSW === item.ssw ? 'ring-2 ring-[#1e3a5f]' : ''}`}
                  onClick={() => setActiveSSW(activeSSW === item.ssw ? null : item.ssw)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-[#1e3a5f]" />
                        {item.ssw}
                      </div>
                      <Badge className="bg-[#1e3a5f]">{item.total}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Laki-laki</span>
                      <Badge variant="secondary">{item.laki}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Perempuan</span>
                      <Badge variant="secondary">{item.perempuan}</Badge>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Klik untuk lihat detail progress</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {selectedSSWData && (
            <Card className="border-[#1e3a5f]">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-[#1e3a5f]" />
                    Detail Progress - {selectedSSWData.ssw}
                  </div>
                  <button 
                    onClick={() => setActiveSSW(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Tutup
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progresList.map(progres => {
                    const data = selectedSSWData.progres.find(p => p.status === progres)
                    const count = data?.count || 0
                    const pct = selectedSSWData.progres.reduce((sum, p) => sum + p.count, 0)
                    const percentage = pct > 0 ? Math.round((count / pct) * 100) : 0

                    return (
                      <div key={progres} className="flex items-center gap-3">
                        <div className="w-32 text-sm text-muted-foreground truncate" title={progres}>
                          {progres}
                        </div>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                            style={{ 
                              width: `${Math.max(percentage, 5)}%`,
                              backgroundColor: progresColors[progres] || '#1e3a5f'
                            }}
                          >
                            {count > 0 && (
                              <span className="text-xs text-white font-medium">{count}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-12 text-right text-xs text-muted-foreground">
                          {percentage}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grafik Progress Kandidat per SSW</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBySSWProgres && filteredBySSWProgres.length > 0 ? (
              <ReactApexChart
                type="bar"
                series={progresList.map(progres => ({
                  name: progres,
                  data: filteredBySSWProgres.map(item => {
                    const data = item.progres.find(p => p.status === progres)
                    return data?.count || 0
                  })
                }))}
                options={{
                  chart: {
                    height: 450,
                    toolbar: { show: false },
                    stacked: true
                  },
                  colors: progresList.map(p => progresColors[p] || '#1e3a5f'),
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: '60%',
                      borderRadius: 4
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    style: { 
                      fontSize: '9px', 
                      fontWeight: 500,
                      colors: ['#fff']
                    },
                    formatter: (val: number) => val > 0 ? val.toString() : ''
                  },
                  xaxis: {
                    categories: filteredBySSWProgres.map(item => item.ssw),
                    labels: { 
                      style: { fontSize: '11px' },
                      rotate: -30
                    }
                  },
                  yaxis: {
                    labels: { formatter: (val: number) => val.toFixed(0) }
                  },
                  grid: {
                    borderColor: '#f1f1f1',
                    strokeDashArray: 4
                  },
                  tooltip: {
                    theme: 'light',
                    y: { formatter: (val: number) => `${val} Kandidat` }
                  },
                  legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '10px',
                    markers: { size: 8 }
                  }
                }}
                height={450}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {filteredByCabangProgres && filteredByCabangProgres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress Kandidat per Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactApexChart
              type="bar"
              series={progresList.map(progres => ({
                name: progres,
                data: [...new Set(filteredByCabangProgres.map(d => d.nama_cabang || 'Tanpa Cabang'))].map(cabang => {
                  const items = filteredByCabangProgres.filter(d => (d.nama_cabang || 'Tanpa Cabang') === cabang && d.status_progres === progres)
                  return items.reduce((sum, item) => sum + item.count, 0)
                })
              }))}
              options={{
                chart: {
                  height: 400,
                  toolbar: { show: false },
                  stacked: true
                },
                colors: progresList.map(p => progresColors[p] || '#1e3a5f'),
                plotOptions: {
                  bar: {
                    horizontal: true,
                    borderRadius: 4,
                    barHeight: '70%'
                  }
                },
                dataLabels: {
                  enabled: true,
                  style: { 
                    fontSize: '9px', 
                    fontWeight: 500,
                    colors: ['#fff']
                  },
                  formatter: (val: number) => val > 0 ? val.toString() : ''
                },
                xaxis: {
                  categories: [...new Set(filteredByCabangProgres.map(d => d.nama_cabang || 'Tanpa Cabang'))],
                  labels: { 
                    style: { fontSize: '11px' },
                    formatter: (val: number) => val.toFixed(0)
                  }
                },
                yaxis: {
                  labels: { style: { fontSize: '11px' } }
                },
                grid: {
                  borderColor: '#f1f1f1',
                  strokeDashArray: 4
                },
                tooltip: {
                  theme: 'light',
                  y: { formatter: (val: number) => `${val} Kandidat` }
                },
                legend: {
                  position: 'bottom',
                  horizontalAlign: 'center',
                  fontSize: '10px',
                  markers: { size: 8 }
                }
              }}
              height={400}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
