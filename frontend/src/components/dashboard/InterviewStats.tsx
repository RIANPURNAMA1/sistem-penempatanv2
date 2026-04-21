import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/components'
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
  jenis_kelamin?: string
  interview: number
  lulus: number
}

interface InterviewStatsProps {
  interviewByCabang?: InterviewByGroup[]
  interviewByGender?: InterviewByGroup[]
}

export default function InterviewStats({ interviewByCabang: propInterviewByCabang, interviewByGender: propInterviewByGender }: InterviewStatsProps) {
  const [filterType, setFilterType] = useState<string>('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<InterviewStatsData | null>(null)
  const [interviewByCabang, setInterviewByCabang] = useState<InterviewByGroup[]>([])
  const [interviewByGender, setInterviewByGender] = useState<InterviewByGroup[]>([])

  // Use props if provided, otherwise use state
  const byCabang = propInterviewByCabang || interviewByCabang
  const byGender = propInterviewByGender || interviewByGender

  // Fetch additional data if props not provided
  useEffect(() => {
    if (!propInterviewByCabang || !propInterviewByGender) {
      api.get('/kandidat/stats')
        .then(r => {
          const data = r.data.data
          setInterviewByCabang(data.interviewByCabang || [])
          setInterviewByGender(data.interviewByGender || [])
        })
        .catch(() => {})
    }
  }, [])

  const fetchStats = () => {
    setLoading(true)
    let params = `filter_type=${filterType}`
    if (startDate && endDate) {
      params = `start_date=${startDate}&end_date=${endDate}`
    }
    api.get(`/kandidat/interview-stats?${params}`)
      .then(r => setStats(r.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
  }, [filterType])

  const handleCustomDate = () => {
    if (startDate && endDate) {
      setFilterType('custom')
      fetchStats()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <Button 
            variant={filterType === 'today' && !startDate ? 'default' : 'outline'} 
            size="sm"
            onClick={() => { setFilterType('today'); setStartDate(''); setEndDate(''); }}
          >
            Hari Ini
          </Button>
          <Button 
            variant={filterType === 'yesterday' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => { setFilterType('yesterday'); setStartDate(''); setEndDate(''); }}
          >
            Kemarin
          </Button>
          <Button 
            variant={filterType === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => { setFilterType('week'); setStartDate(''); setEndDate(''); }}
          >
            Minggu
          </Button>
          <Button 
            variant={filterType === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => { setFilterType('month'); setStartDate(''); setEndDate(''); }}
          >
            Bulan
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <span className="text-sm text-muted-foreground">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <Button size="sm" onClick={handleCustomDate}>
            Filter
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interview</p>
                  <p className="text-2xl font-bold">{stats?.interview_count || 0}</p>
                  <p className="text-xs text-muted-foreground">orang</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lulus Interview</p>
                  <p className="text-2xl font-bold">{stats?.lulus_count || 0}</p>
                  <p className="text-xs text-muted-foreground">orang</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tingkat Kelulusan</p>
                  <p className="text-2xl font-bold">{stats?.percentage || 0}%</p>
                  <p className="text-xs text-muted-foreground">dari Interview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grafik Interview & Lulus by Cabin and Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} />
              Interview & Lulus berdasarkan Cabin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byCabang?.length ? (
              <ReactApexChart
                type="bar"
                series={[
                  { name: 'Interview', data: byCabang.map((c: any) => c.interview) },
                  { name: 'Lulus', data: byCabang.map((c: any) => c.lulus) }
                ]}
                options={{
                  chart: { height: 300, toolbar: { show: false } },
                  colors: ['#3b82f6', '#22c55e'],
                  plotOptions: {
                    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 }
                  },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: byCabang.map((c: any) => c.nama_cabang),
                    labels: { style: { fontSize: '10px' } }
                  },
                  yaxis: { labels: { formatter: (val) => val.toFixed(0) } },
                  grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
                  tooltip: { theme: 'light' },
                  legend: { position: 'top', horizontalAlign: 'right' }
                }}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data Interview
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} />
              Interview & Lulus berdasarkan Jenis Kelamin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byGender?.length ? (
              <ReactApexChart
                type="bar"
                series={[
                  { name: 'Interview', data: byGender.map((g: any) => g.interview) },
                  { name: 'Lulus', data: byGender.map((g: any) => g.lulus) }
                ]}
                options={{
                  chart: { height: 300, toolbar: { show: false } },
                  colors: ['#8b5cf6', '#ec4899'],
                  plotOptions: {
                    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 }
                  },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: byGender.map((g: any) => g.jenis_kelamin),
                    labels: { style: { fontSize: '11px' } }
                  },
                  yaxis: { labels: { formatter: (val) => val.toFixed(0) } },
                  grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
                  tooltip: { theme: 'light' },
                  legend: { position: 'top', horizontalAlign: 'right' }
                }}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data Interview
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}