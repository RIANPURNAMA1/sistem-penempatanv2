import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Users, TrendingUp, Calendar, Loader2 } from 'lucide-react'

interface InterviewStatsData {
  interview_count: number
  lulus_count: number
  percentage: number
}

export default function InterviewStats() {
  const [filterType, setFilterType] = useState<string>('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<InterviewStatsData | null>(null)

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

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

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
    </div>
  )
}