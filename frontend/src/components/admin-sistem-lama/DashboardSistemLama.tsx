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
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((item) => (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                  <item.icon size={20} className={item.iconColor} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

     

      {viewMode === 'cards' ? (
        <>
        {selectedSSWData && (
            <Card className="border-[#1e3a5f]">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-[#1e3a5f]" />
                    Detail - {selectedSSWData.ssw}
                  </div>
                  <button onClick={() => setSelectedSSW(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    Tutup
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Laki-laki</span>
                    <span className="font-bold">{selectedSSWData.laki} orang</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-pink-50 rounded">
                    <span className="text-sm">Perempuan</span>
                    <span className="font-bold">{selectedSSWData.perempuan} orang</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grafik SSW</CardTitle>
          </CardHeader>
          <CardContent>
            {hasSSWData ? (
              <ReactApexChart
                type="bar"
                series={[{ name: 'Total', data: sswStats.map(s => s.total) }]}
                options={{
                  chart: { height: 350, toolbar: { show: false } },
                  colors: ['#1e3a5f'],
                  plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
                  dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600 } },
                  xaxis: {
                    categories: sswStats.map(s => s.ssw),
                    labels: { style: { fontSize: '11px' }, rotate: -30 },
                  },
                  yaxis: { labels: { formatter: (val: number) => val.toFixed(0) } },
                  grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
                }}
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-[#1e3a5f]" />
            Statistik Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasProgressData ? (
            <p className="text-sm text-muted-foreground">Belum ada data</p>
          ) : (
            <ReactApexChart type="donut" series={progressValues} options={pieChartOptions} height={300} />
          )}
        </CardContent>
      </Card>

      {cabangStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress Kandidat per Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactApexChart type="bar" series={branchChartSeries} options={branchChartOptions} height={400} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
