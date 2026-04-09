import { Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import { Briefcase, Calendar, RefreshCw } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import { useState } from 'react'

interface JobOrderStats {
  bidang: string
  count: number
}

interface DataPerusahaanProps {
  stats: JobOrderStats[]
  loading: boolean
  filterTanggalAwal?: string
  filterTanggalAkhir?: string
  onFilterChange?: (awal: string, akhir: string) => void
}

export default function DataPerusahaan({ 
  stats, 
  loading, 
  filterTanggalAwal = '', 
  filterTanggalAkhir = '',
  onFilterChange 
}: DataPerusahaanProps) {
  const [tanggalAwal, setTanggalAwal] = useState(filterTanggalAwal)
  const [tanggalAkhir, setTanggalAkhir] = useState(filterTanggalAkhir)

  const handleFilter = () => {
    onFilterChange?.(tanggalAwal, tanggalAkhir)
  }

  const handleReset = () => {
    setTanggalAwal('')
    setTanggalAkhir('')
    onFilterChange?.('', '')
  }

  const handleChange = (type: 'awal' | 'akhir', value: string) => {
    if (type === 'awal') {
      setTanggalAwal(value)
    } else {
      setTanggalAkhir(value)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase size={16} className="text-[#1e3a5f]" />
              Grafik Job Order Berdasarkan Bidang SSW
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Filter Tanggal:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Tanggal Awal</Label>
                  <input
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => handleChange('awal', e.target.value)}
                    className="h-8 px-2 text-xs border rounded-md"
                  />
                </div>
                
                <span className="text-muted-foreground mt-4">-</span>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Tanggal Akhir</Label>
                  <input
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => handleChange('akhir', e.target.value)}
                    className="h-8 px-2 text-xs border rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Button size="sm" variant="outline" onClick={handleFilter} disabled={loading}>
                  <RefreshCw size={14} className="mr-1" /> Terapkan
                </Button>
                <Button size="sm" variant="ghost" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          ) : stats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80">
              <Briefcase size={48} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada data job order</p>
            </div>
          ) : (
            <>
              <ReactApexChart
                type="line"
                series={[{
                  name: 'Job Order',
                  data: stats.map(item => item.count)
                }]}
                options={{
                  chart: {
                    height: 350,
                    toolbar: { show: false },
                    zoom: { enabled: false }
                  },
                  colors: ['#1e3a5f'],
                  stroke: {
                    curve: 'smooth',
                    width: 3
                  },
                  fill: {
                    type: 'gradient',
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.4,
                      opacityTo: 0.1,
                      stops: [0, 90, 100]
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    style: {
                      fontSize: '12px',
                      fontWeight: 600
                    }
                  },
                  xaxis: {
                    categories: stats.map(item => item.bidang),
                    labels: {
                      rotate: -45,
                      style: { fontSize: '11px' }
                    }
                  },
                  yaxis: {
                    title: { text: 'Jumlah' },
                    labels: { formatter: (val) => val.toFixed(0) }
                  },
                  grid: {
                    borderColor: '#f1f1f1',
                    strokeDashArray: 4
                  },
                  markers: {
                    size: 6
                  },
                  tooltip: {
                    theme: 'light',
                    y: { formatter: (val) => `${val} Job Order` }
                  }
                }}
                height={350}
              />

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Total Keseluruhan</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.length} bidang SSW
                      {(tanggalAwal || tanggalAkhir) && (
                        <span className="ml-2">
                          ({tanggalAwal && `dari ${tanggalAwal}`} {tanggalAwal && tanggalAkhir && '-'} {tanggalAkhir && `s/d ${tanggalAkhir}`})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#1e3a5f]">
                      {stats.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Job Order</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
