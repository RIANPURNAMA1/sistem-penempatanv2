import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Users, TrendingUp, Calendar, Loader2, ChevronDown, ArrowRight } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<InterviewStatsData | null>(null)
  const [interviewByCabang, setInterviewByCabang] = useState<InterviewByGroup[]>([])

  const byCabang = interviewByCabang.length ? interviewByCabang : (propInterviewByCabang || [])

  const fetchData = () => {
    setLoading(true)
    let params = `filter_type=${filterType}`
    if (startDate && endDate) {
      params = `start_date=${startDate}&end_date=${endDate}`
    }

    // Fetch Stats & Chart data paralel
    Promise.all([
      api.get(`/kandidat/stats?${params}`),
      api.get(`/kandidat/interview-stats?${params}`)
    ]).then(([resStats, resInterview]) => {
      setInterviewByCabang(resStats.data.data.interviewByCabang || [])
      setStats(resInterview.data.data)
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [filterType, startDate, endDate])

  const handleCustomDate = () => {
    if (startDate && endDate) setFilterType('custom')
  }

  // KONFIGURASI CHART KOLOM (SESUAI SCREENSHOT FLOWBITE)
  const chartOptions: any = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true, // Membuat bar menumpuk seperti di gambar
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 6, // Sudut bar tumpul (rounded)
      },
    },
    // Menggunakan palet biru monokromatik (Biru Tua ke Muda)
    colors: ['#1E429F', '#3F83F8', '#76A9FA', '#A4CAFE'],
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent']
    },
    grid: {
      show: false, // Menghilangkan garis background sesuai screenshot
      padding: { left: 2, right: 2, top: 0 }
    },
    xaxis: {
      categories: byCabang.map((c: any) => c.nama_cabang),
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          colors: '#6B7280',
          fontSize: '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false, // Menghilangkan label Y sesuai gambar minimalis
    },
    fill: { opacity: 1 },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      markers: { radius: 12 }
    },
    tooltip: { theme: 'light' },
  }

  const series = [
    { name: 'Interview Laki-laki', data: byCabang.map((c: any) => c.interview_laki || 0) },
    { name: 'Interview Perempuan', data: byCabang.map((c: any) => c.interview_perempuan || 0) },
    { name: 'Lulus Laki-laki', data: byCabang.map((c: any) => c.lulus_laki || 0) },
    { name: 'Lulus Perempuan', data: byCabang.map((c: any) => c.lulus_perempuan || 0) }
  ]

  return (
  <div className="space-y-4 sm:space-y-6">

    {/* FILTER HEADER */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 sm:p-4 rounded-xl border shadow-sm">
      
      {/* FILTER BUTTON */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['today', 'yesterday', 'week', 'month'].map((type) => (
          <Button 
            key={type}
            variant={filterType === type ? 'default' : 'outline'} 
            size="sm"
            className="rounded-lg px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap shrink-0"
            onClick={() => { setFilterType(type); setStartDate(''); setEndDate(''); }}
          >
            {type === 'today' ? 'Hari Ini' : type === 'yesterday' ? 'Kemarin' : type === 'week' ? 'Minggu' : 'Bulan'}
          </Button>
        ))}
      </div>

      {/* DATE FILTER */}
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
          className="rounded-lg w-full sm:w-auto text-xs sm:text-sm"
        >
          Filter
        </Button>
      </div>
    </div>

    {/* STATS */}
    {loading ? (
      <div className="flex items-center justify-center py-10 sm:py-12">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Total Interview" value={stats?.interview_count} icon={<Users size={18}/>} color="blue" />
        <StatCard title="Lulus Interview" value={stats?.lulus_count} icon={<TrendingUp size={18}/>} color="green" />
        <StatCard title="Ratio Kelulusan" value={`${stats?.percentage}%`} icon={<Calendar size={18}/>} color="purple" />
      </div>
    )}

    {/* CHART */}
    <div className="w-full bg-white rounded-xl border shadow-sm p-3 sm:p-6">

      {/* HEADER */}
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
          {stats?.percentage}%
          <TrendingUp size={12} className="ml-1" />
        </div>
      </div>

      {/* CHART */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[320px]">
          {byCabang.length ? (
            <ReactApexChart
              options={{
                ...chartOptions,
                chart: {
                  ...chartOptions.chart,
                  height: window.innerWidth < 400 ? 280 : 350
                }
              }}
              series={series}
              type="bar"
              height={window.innerWidth < 400 ? 280 : 350}
            />
          ) : (
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
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
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
            {value || 0}
          </h3>
        </div>

      </CardContent>
    </Card>
  )
}