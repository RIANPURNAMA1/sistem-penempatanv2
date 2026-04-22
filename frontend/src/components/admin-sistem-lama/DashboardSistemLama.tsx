import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/components'
import { Users, TrendingUp, FileCheck, Award } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import { useState } from 'react'

interface SSWStat {
  ssw: string
  laki: number
  perempuan: number
  total: number
}

interface cabangProgressData {
  nama_cabang: string
  progress: { status: string; count: number }[]
}

interface DashboardSistemLamaProps {
  total: number
  diterima: number
  menunggu: number
  ditolak: number
  sswStats: SSWStat[]
  progressStats: Record<string, number>
  cabangStats: cabangProgressData[]
}

const progressColors: Record<string, string> = {
  'Job Matching': '#1e3a5f',
  'Pending': '#94a3b8',
  'Interview': '#8cbbff',
  'Lulus interview': '#22c55e',
  'Gagal Interview': '#ef4444',
  'Unknown': '#666666'
}

const progresList = ['Job Matching', 'Pending', 'Interview', 'Lulus interview', 'Gagal Interview']

export default function DashboardSistemLama({ total, diterima, menunggu, ditolak, sswStats, progressStats, cabangStats }: DashboardSistemLamaProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards')
  const [selectedSSW, setSelectedSSW] = useState<string | null>(null)

  const statsData = [
    { label: 'Total', value: total, icon: Users, color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Diterima', value: diterima, icon: FileCheck, color: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Menunggu', value: menunggu, icon: Users, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    { label: 'Ditolak', value: ditolak, icon: Users, color: 'bg-red-100', iconColor: 'text-red-600' },
  ]

  const hasSSWData = sswStats.length > 0
  const hasProgressData = Object.keys(progressStats).length > 0

  const progressLabels = Object.keys(progressStats)
  const progressValues = Object.values(progressStats)
  const totalProgress = progressValues.reduce((a, b) => a + b, 0)

  const selectedSSWData = selectedSSW ? sswStats.find(s => s.ssw === selectedSSW) : null

  const pieChartOptions = {
    chart: { type: 'donut' as const, toolbar: { show: false } },
    labels: progressLabels,
    colors: progressLabels.map((_, i) => {
      const colorKeys = Object.keys(progressColors)
      return progressColors[colorKeys[i % colorKeys.length]] || '#666666'
    }),
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', fontWeight: 500 },
            value: { show: true, fontSize: '14px', fontWeight: 600, formatter: (val: string) => val },
            total: {
              show: true,
              label: 'Total',
              fontSize: '12px',
              fontWeight: 500,
              value: { fontSize: '16px', fontWeight: 700, formatter: () => totalProgress.toString() },
            },
          },
        },
      },
    },
    dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: 500 }, formatter: (val: number) => `${val.toFixed(0)}%` },
    legend: { position: 'bottom' as const, horizontalAlign: 'center' as const, fontSize: '11px', markers: { size: 8 } },
    stroke: { width: 2, colors: ['#fff'] },
  }

  const branchChartOptions = {
    chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: '70%',
        distributed: true,
      },
    },
    colors: progresList.map((_, i) => {
      const colorKeys = Object.keys(progressColors)
      return progressColors[colorKeys[i % colorKeys.length]] || '#666666'
    }),
    dataLabels: {
      enabled: true,
      style: { fontSize: '10px', fontWeight: 600, colors: ['#fff'] },
      formatter: (val: number) => val > 0 ? val.toString() : '',
    },
    xaxis: {
      categories: [...new Set(cabangStats.map(d => d.nama_cabang || 'Tanpa Cabang'))],
      labels: { style: { fontSize: '11px' }, formatter: (val: number) => val.toFixed(0) },
    },
    yaxis: { labels: { style: { fontSize: '11px' } } },
    grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
    tooltip: { theme: 'light', y: { formatter: (val: number) => `${val} Kandidat` } },
    legend: { position: 'bottom' as const, horizontalAlign: 'center' as const, fontSize: '10px', markers: { size: 8 } },
  }

  const branchChartSeries = progresList.map(progres => ({
    name: progres,
    data: [...new Set(cabangStats.map(d => d.nama_cabang || 'Tanpa Cabang'))].map(cabang => {
      const item = cabangStats.find(d => (d.nama_cabang || 'Tanpa Cabang') === cabang)
      const progressItem = item?.progress.find(p => p.status === progres)
      return progressItem?.count || 0
    })
  }))

 return (
  <div className="space-y-4 sm:space-y-6">

    {/* STATS */}
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {statsData.map((item) => (
        <Card key={item.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                <item.icon size={16} className={item.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{item.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* DETAIL SSW */}
    {viewMode === 'cards' && selectedSSWData && (
      <Card className="border-[#1e3a5f]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Award size={14} className="text-[#1e3a5f]" />
              <span className="truncate">Detail - {selectedSSWData.ssw}</span>
            </div>
            <button 
              onClick={() => setSelectedSSW(null)} 
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Tutup
            </button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded text-xs">
              <span>Laki-laki</span>
              <span className="font-bold">{selectedSSWData.laki}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-pink-50 rounded text-xs">
              <span>Perempuan</span>
              <span className="font-bold">{selectedSSWData.perempuan}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )}

    {/* CHART SSW */}
    {viewMode === 'chart' && (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Grafik SSW</CardTitle>
        </CardHeader>
        <CardContent className="px-1 sm:px-4">
          {hasSSWData ? (
            <div className="overflow-x-auto">
              <div className="min-w-[300px]">
                <ReactApexChart
                  type="bar"
                  series={[{ name: 'Total', data: sswStats.map(s => s.total) }]}
                  options={{
                    chart: { height: 260, toolbar: { show: false } },
                    colors: ['#1e3a5f'],
                    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
                    dataLabels: { enabled: false },
                    xaxis: {
                      categories: sswStats.map(s => s.ssw),
                      labels: { style: { fontSize: '9px' }, rotate: -30 },
                    },
                    yaxis: { labels: { show: false } },
                    grid: { show: false },
                  }}
                  height={260}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-xs text-muted-foreground">Belum ada data</p>
            </div>
          )}
        </CardContent>
      </Card>
    )}

    {/* PIE CHART */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
          <TrendingUp size={14} className="text-[#1e3a5f]" />
          Statistik Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="px-1 sm:px-4">
        {!hasProgressData ? (
          <p className="text-xs text-muted-foreground">Belum ada data</p>
        ) : (
          <ReactApexChart
            type="donut"
            series={progressValues}
            options={{
              ...pieChartOptions,
              legend: {
                position: 'bottom',
                fontSize: '10px'
              }
            }}
            height={260}
          />
        )}
      </CardContent>
    </Card>

    {/* BAR CABANG */}
    {cabangStats.length > 0 && (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Progress per Cabang</CardTitle>
        </CardHeader>

        <CardContent className="px-1 sm:px-4">
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              <ReactApexChart
                type="bar"
                series={branchChartSeries}
                options={{
                  ...branchChartOptions,
                  chart: { ...branchChartOptions.chart, height: 300 },
                  xaxis: {
                    ...branchChartOptions.xaxis,
                    labels: { style: { fontSize: '9px' } }
                  },
                  legend: {
                    position: 'bottom',
                    fontSize: '10px'
                  }
                }}
                height={300}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
)
}
