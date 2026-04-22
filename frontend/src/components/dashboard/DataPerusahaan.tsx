import { Card, CardContent, Label } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import { Briefcase, RefreshCw, ArrowRight } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface JobOrderStats {
  id: number
  nomor: string
  bidang_ssw: string
  nama_perusahaan: string
  status_kelulusan: string
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

  const totalJobOrder = stats.reduce((sum, item) => sum + item.count, 0)

  // RESPONSIVE CHART HEIGHT
  const chartHeight = window.innerWidth < 400 ? 260 : 320

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: chartHeight,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 4,
        distributed: true,
      }
    },
    dataLabels: { enabled: true },
    colors: ['#1A56DB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
    xaxis: {
      categories: stats.map(item => item.nomor),
      labels: {
        style: { fontSize: window.innerWidth < 400 ? '8px' : '10px' },
        rotate: -45
      }
    },
    yaxis: {
      labels: {
        style: { fontSize: '10px' }
      }
    },
    grid: {
      strokeDashArray: 4
    },
    legend: { show: false }
  }

  const series = [{
    name: 'Kandidat',
    data: stats.map(item => item.count)
  }]

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* FILTER (RESPONSIVE) */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-3 sm:items-end">

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <div className="flex-1">
            <Label className="text-[10px] uppercase text-gray-400 mb-1 block">Mulai</Label>
            <input
              type="date"
              value={tanggalAwal}
              onChange={(e) => setTanggalAwal(e.target.value)}
              className="w-full h-9 px-2 text-xs sm:text-sm border rounded-lg"
            />
          </div>

          <div className="flex-1">
            <Label className="text-[10px] uppercase text-gray-400 mb-1 block">Selesai</Label>
            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="w-full h-9 px-2 text-xs sm:text-sm border rounded-lg"
            />
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button size="sm" className="flex-1 sm:flex-none text-xs" onClick={handleFilter} disabled={loading}>
            <RefreshCw size={12} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Terapkan
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 sm:flex-none text-xs" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* CARD */}
      <Card className="w-full bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="p-4 sm:p-6 pb-0">
          <h5 className="text-xl sm:text-3xl font-bold text-gray-900">
            {totalJobOrder.toLocaleString()}
          </h5>
          <p className="text-xs sm:text-base text-gray-500 flex items-center gap-2 mt-1">
            <Briefcase size={14} />
            Total Job Order
          </p>
        </div>

        <CardContent className="px-0">

          {/* CHART */}
          {loading ? (
            <div className="flex items-center justify-center h-[250px] sm:h-[320px]">
              <RefreshCw className="animate-spin text-blue-600" size={24} />
            </div>
          ) : stats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px] sm:h-[320px] text-gray-400 text-xs">
              <Briefcase size={40} className="mb-2 opacity-20" />
              Tidak ada data
            </div>
          ) : (
            <div className="px-2 sm:px-4">
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="bar"
                height={chartHeight}
              />
            </div>
          )}

          {/* FOOTER */}
          <div className="border-t p-3 sm:p-5 flex flex-col sm:flex-row gap-2 sm:justify-between items-start sm:items-center text-xs sm:text-sm">

            <span className="text-gray-500">
              {stats.length} Job Order
            </span>

            <Link
              to="/joborder"
              className="text-blue-600 font-semibold flex items-center gap-1"
            >
              Detail
              <ArrowRight size={12} />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}