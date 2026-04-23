import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Users, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'

interface InterviewStatsData {
  interview_count: number
  lulus_count: number
  percentage: number
}

interface InterviewByGroup {
  nama_cabang?: string
  interview_laki?: number
  interview_perempuan?: number
  lulus_laki?: number
  lulus_perempuan?: number
}

interface InterviewStatsProps {
  interviewByCabang?: InterviewByGroup[]
  interviewByGender?: InterviewByGroup[]
}

export default function InterviewStats({ 
  interviewByCabang: propInterviewByCabang, 
}: InterviewStatsProps) {
  const [filterType, setFilterType] = useState<string>('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')
  const [loading, setLoading] = useState(true)
  // FIX: pakai null sebagai tanda "belum pernah fetch"
  const [hasFetched, setHasFetched] = useState(false)
  const [stats, setStats] = useState<InterviewStatsData | null>(null)
  const [interviewByCabang, setInterviewByCabang] = useState<InterviewByGroup[]>([])

  // FIX: setelah fetch pertama, HANYA pakai data dari state — tidak fallback ke props
  // Ini mencegah chart tetap tampil dengan data lama saat filter return kosong
  const byCabang = hasFetched
    ? interviewByCabang
    : (propInterviewByCabang || [])

  const buildParams = useCallback(() => {
    if (appliedStart && appliedEnd) {
      return `start_date=${appliedStart}&end_date=${appliedEnd}`
    }
    return `filter_type=${filterType}`
  }, [filterType, appliedStart, appliedEnd])

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = buildParams()
    console.log('Fetching with params:', params)

    Promise.all([
      api.get(`/kandidat/stats?${params}`),
      api.get(`/kandidat/interview-stats?${params}`)
    ])
      .then(([resStats, resInterview]) => {
        console.log('Stats response:', resStats.data)
        console.log('Interview response:', resInterview.data)
        // FIX: selalu set state dari response — jika kosong tetap di-set kosong
        setInterviewByCabang(resStats.data.data.interviewByCabang || [])
        setStats(resInterview.data.data)
        setHasFetched(true)
      })
      .finally(() => setLoading(false))
  }, [buildParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCustomDate = () => {
    if (!startDate || !endDate) return
    setFilterType('custom')
    setAppliedStart(startDate)
    setAppliedEnd(endDate)
  }

  const handlePresetFilter = (type: string) => {
    setFilterType(type)
    setStartDate('')
    setEndDate('')
    setAppliedStart('')
    setAppliedEnd('')
  }

  const chartOptions = useMemo<any>(() => ({
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      animations: { enabled: true, speed: 400 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 6,
      },
    },
    colors: ['#1E429F', '#3F83F8', '#76A9FA', '#A4CAFE'],
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent'],
    },
    grid: {
      show: false,
      padding: { left: 2, right: 2, top: 0 },
    },
    xaxis: {
      categories: byCabang.map((c) => c.nama_cabang ?? ''),
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    fill: { opacity: 1 },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      markers: { radius: 12 },
    },
    tooltip: { theme: 'light' },
  }), [byCabang])

  const series = useMemo(() => [
    { name: 'Interview Laki-laki', data: byCabang.map((c) => c.interview_laki ?? 0) },
    { name: 'Interview Perempuan', data: byCabang.map((c) => c.interview_perempuan ?? 0) },
    { name: 'Lulus Laki-laki', data: byCabang.map((c) => c.lulus_laki ?? 0) },
    { name: 'Lulus Perempuan', data: byCabang.map((c) => c.lulus_perempuan ?? 0) },
  ], [byCabang])

  const chartHeight = typeof window !== 'undefined' && window.innerWidth < 400 ? 280 : 350

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* FILTER HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 sm:p-4 rounded-xl border shadow-sm">

        {/* PRESET BUTTONS */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(['today', 'yesterday', 'week', 'month'] as const).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              className="rounded-lg px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap shrink-0"
              onClick={() => handlePresetFilter(type)}
            >
              {type === 'today' ? 'Hari Ini'
                : type === 'yesterday' ? 'Kemarin'
                : type === 'week' ? 'Minggu'
                : 'Bulan'}
            </Button>
          ))}
        </div>

        {/* DATE RANGE FILTER */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-auto border rounded-lg px-2 py-1 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-auto border rounded-lg px-2 py-1 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            size="sm"
            onClick={handleCustomDate}
            disabled={!startDate || !endDate}
            className="rounded-lg w-full sm:w-auto text-xs sm:text-sm"
          >
            Filter
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      {loading ? (
        <div className="flex items-center justify-center py-10 sm:py-12">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <StatCard title="Total Interview" value={stats?.interview_count} icon={<Users size={18} />} color="blue" />
          <StatCard title="Lulus Interview" value={stats?.lulus_count} icon={<TrendingUp size={18} />} color="green" />
          <StatCard title="Ratio Kelulusan" value={`${stats?.percentage ?? 0}%`} icon={<Calendar size={18} />} color="purple" />
        </div>
      )}

      {/* CHART */}
      <div className="w-full bg-white rounded-xl border shadow-sm p-3 sm:p-6">

        {/* CHART HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
              <Users size={16} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Total interview periode ini
            </p>
          </div>
          <div className="sm:ml-auto flex items-center px-2 py-1 text-xs sm:text-sm font-medium text-green-500 bg-green-50 rounded-lg w-fit">
            {stats?.percentage ?? 0}%
            <TrendingUp size={12} className="ml-1" />
          </div>
        </div>

        {/* CHART BODY */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[320px]">
            {loading ? (
              <div className="h-[250px] sm:h-[350px] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : byCabang.length > 0 ? (
              <ReactApexChart
                key={buildParams()}
                options={chartOptions}
                series={series}
                type="bar"
                height={chartHeight}
              />
            ) : (
              // FIX: tampil placeholder ini saat data memang kosong
              <div className="h-[250px] sm:h-[350px] flex items-center justify-center text-muted-foreground bg-gray-50 rounded-xl border-2 border-dashed">
                <p className="text-xs sm:text-sm">Belum ada data</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <Card className="border-none shadow-sm bg-white rounded-xl">
      <CardContent className="p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase truncate">
            {title}
          </p>
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
            {value ?? 0}
          </h3>
        </div>
      </CardContent>
    </Card>
  )
}