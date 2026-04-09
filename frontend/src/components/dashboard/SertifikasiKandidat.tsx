import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/components'
import { Award, BarChart3, LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import ReactApexChart from 'react-apexcharts'

interface SertifikasiProps {
  jftByGender: { jenis_kelamin: string; has_jft: number; no_jft: number }[] | undefined
  jftByCabang: { nama_cabang: string; has_jft: number; no_jft: number }[] | undefined
  sswByGender: { jenis_kelamin: string; has_ssw: number; no_ssw: number }[] | undefined
  sswByCabang: { nama_cabang: string; has_ssw: number; no_ssw: number }[] | undefined
  loading: boolean
}

export default function SertifikasiKandidat({ jftByGender, jftByCabang, sswByGender, sswByCabang, loading }: SertifikasiProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards')
  const [selectedGender, setSelectedGender] = useState<Set<string>>(new Set(['Laki-laki', 'Perempuan']))

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

  const totalJft = jftByGender?.reduce((acc, item) => {
    if (selectedGender.has(item.jenis_kelamin)) {
      acc.has += item.has_jft
      acc.no += item.no_jft
    }
    return acc
  }, { has: 0, no: 0 }) || { has: 0, no: 0 }

  const totalSsw = sswByGender?.reduce((acc, item) => {
    if (selectedGender.has(item.jenis_kelamin)) {
      acc.has += item.has_ssw
      acc.no += item.no_ssw
    }
    return acc
  }, { has: 0, no: 0 }) || { has: 0, no: 0 }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-[#1e3a5f]" />
          <span className="text-sm font-medium">Statistik Sertifikasi JFT & SSW</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 border border-border rounded-lg px-3 py-1.5 bg-muted/30">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGender.has('Laki-laki')}
                onChange={() => toggleGender('Laki-laki')}
                className="w-3.5 h-3.5 rounded accent-[#1e3a5f] cursor-pointer"
              />
              <span>Laki-laki</span>
            </label>
            <div className="w-px h-4 bg-border" />
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
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'cards' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-muted-foreground hover:bg-muted'
              }`}
            >
              <LayoutGrid size={14} />
              Kartu
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'chart' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-muted-foreground hover:bg-muted'
              }`}
            >
              <BarChart3 size={14} />
              Grafik
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sertifikat JFT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{totalJft.has}</p>
                  <p className="text-xs text-green-600 mt-1">Sudah</p>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-lg">
                  <p className="text-2xl font-bold text-gray-700">{totalJft.no}</p>
                  <p className="text-xs text-gray-600 mt-1">Belum</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{totalJft.has + totalJft.no}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
              </div>

              {jftByGender && jftByGender.length > 0 && (
                <div className="space-y-2 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground">Per Gender</p>
                  {jftByGender.filter(i => selectedGender.has(i.jenis_kelamin)).map(item => (
                    <div key={item.jenis_kelamin} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                      <span className="font-medium">{item.jenis_kelamin}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-600">Sudah: {item.has_jft}</span>
                        <span className="text-gray-600">Belum: {item.no_jft}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sertifikat SSW</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{totalSsw.has}</p>
                  <p className="text-xs text-blue-600 mt-1">Sudah</p>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-lg">
                  <p className="text-2xl font-bold text-gray-700">{totalSsw.no}</p>
                  <p className="text-xs text-gray-600 mt-1">Belum</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{totalSsw.has + totalSsw.no}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
              </div>

              {sswByGender && sswByGender.length > 0 && (
                <div className="space-y-2 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground">Per Gender</p>
                  {sswByGender.filter(i => selectedGender.has(i.jenis_kelamin)).map(item => (
                    <div key={item.jenis_kelamin} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                      <span className="font-medium">{item.jenis_kelamin}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-blue-600">Sudah: {item.has_ssw}</span>
                        <span className="text-gray-600">Belum: {item.no_ssw}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grafik JFT per Cabang</CardTitle>
            </CardHeader>
            <CardContent>
              {jftByCabang && jftByCabang.length > 0 ? (
                <ReactApexChart
                  type="bar"
                  series={[
                    { name: 'Sudah Ujian', data: jftByCabang.map(c => c.has_jft) },
                    { name: 'Belum Ujian', data: jftByCabang.map(c => c.no_jft) }
                  ]}
                  options={{
                    chart: { height: 350, toolbar: { show: false } },
                    colors: ['#1e3a5f', '#94a3b8'],
                    plotOptions: {
                      bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 }
                    },
                    dataLabels: {
                      enabled: true,
                      style: { fontSize: '10px', fontWeight: 500, colors: ['#fff'] },
                      formatter: (val: number) => val > 0 ? val.toString() : ''
                    },
                    xaxis: {
                      categories: jftByCabang.map(c => c.nama_cabang || 'Tanpa'),
                      labels: { style: { fontSize: '10px' }, rotate: -30 }
                    },
                    yaxis: { labels: { style: { fontSize: '10px' } } },
                    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
                    legend: { position: 'bottom', fontSize: '11px', markers: { size: 6 } }
                  }}
                  height={350}
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <p className="text-sm">Belum ada data</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grafik SSW per Cabang</CardTitle>
            </CardHeader>
            <CardContent>
              {sswByCabang && sswByCabang.length > 0 ? (
                <ReactApexChart
                  type="bar"
                  series={[
                    { name: 'Sudah SSW', data: sswByCabang.map(c => c.has_ssw) },
                    { name: 'Belum SSW', data: sswByCabang.map(c => c.no_ssw) }
                  ]}
                  options={{
                    chart: { height: 350, toolbar: { show: false } },
                    colors: ['#1e3a5f', '#94a3b8'],
                    plotOptions: {
                      bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 }
                    },
                    dataLabels: {
                      enabled: true,
                      style: { fontSize: '10px', fontWeight: 500, colors: ['#fff'] },
                      formatter: (val: number) => val > 0 ? val.toString() : ''
                    },
                    xaxis: {
                      categories: sswByCabang.map(c => c.nama_cabang || 'Tanpa'),
                      labels: { style: { fontSize: '10px' }, rotate: -30 }
                    },
                    yaxis: { labels: { style: { fontSize: '10px' } } },
                    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
                    legend: { position: 'bottom', fontSize: '11px', markers: { size: 6 } }
                  }}
                  height={350}
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <p className="text-sm">Belum ada data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
