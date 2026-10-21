import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/components'
import api from '@/lib/api'
import { Users, TrendingUp, Loader2, CheckCircle, Clock } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'

interface StatusData {
  status: string
  count: number
  laki: number
  perempuan: number
}

interface ByCabangData {
  nama_cabang: string
  interview: number
  jadwalkan: number
  lulus: number
  gagal: number
}

const STATUS_COLORS: Record<string, string> = {
  'Job Matching': '#1e3a5f',
  'Pending': '#94a3b8',
  'lamar ke perusahaan': '#4a7ab5',
  'Interview': '#0ea5e9',
  'Jadwalkan Interview Ulang': '#a8c5f0',
  'Lulus interview': '#22c55e',
  'Gagal Interview': '#ef4444',
  'Pemberkasan': '#f59e0b',
  'Berangkat': '#10b981',
  'Ditolak': '#dc2626',
}

export default function InterviewStats() {
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [byCabangData, setByCabangData] = useState<ByCabangData[]>([])
  const [totalKandidat, setTotalKandidat] = useState(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/kandidat/stats')
      const data = res.data.data
      const allProfiles = data?.allProfiles || []
      const byCabangProgres = data?.byCabangProgres || []
      
      setTotalKandidat(allProfiles.length)
      
      const statusList = [
        'Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 
        'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview', 
        'Pemberkasan', 'Berangkat', 'Ditolak'
      ]
      
      const counts = statusList.map(status => {
        const filtered = allProfiles.filter((p: any) => p.status_progres === status)
        return {
          status,
          count: filtered.length,
          laki: filtered.filter((p: any) => p.jenis_kelamin === 'Laki-laki').length,
          perempuan: filtered.filter((p: any) => p.jenis_kelamin === 'Perempuan').length
        }
      })
      
      setStatusData(counts)
      
      const cabangMap: Record<string, ByCabangData> = {}
      byCabangProgres.forEach((item: any) => {
        const namaCabang = item.nama_cabang || 'Tanpa Cabang'
        if (!cabangMap[namaCabang]) {
          cabangMap[namaCabang] = {
            nama_cabang: namaCabang,
            interview: 0,
            jadwalkan: 0,
            lulus: 0,
            gagal: 0
          }
        }
        if (item.status_progres === 'Interview') {
          cabangMap[namaCabang].interview += item.count
        } else if (item.status_progres === 'Jadwalkan Interview Ulang') {
          cabangMap[namaCabang].jadwalkan += item.count
        } else if (item.status_progres === 'Lulus interview') {
          cabangMap[namaCabang].lulus += item.count
        } else if (item.status_progres === 'Gagal Interview') {
          cabangMap[namaCabang].gagal += item.count
        }
      })
      
      setByCabangData(Object.values(cabangMap))
    } catch (err) {
      console.error('Gagal mengambil data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const interviewCount = useMemo(() => {
    const interview = statusData.find(s => s.status === 'Interview')?.count || 0
    const jadwalkan = statusData.find(s => s.status === 'Jadwalkan Interview Ulang')?.count || 0
    return interview + jadwalkan
  }, [statusData])

  const lulusCount = useMemo(() => {
    return statusData.find(s => s.status === 'Lulus interview')?.count || 0
  }, [statusData])

  const percentage = useMemo(() => {
    if (interviewCount === 0) return 0
    return Math.round((lulusCount / interviewCount) * 100)
  }, [interviewCount, lulusCount])

  const chartOptionsBar = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    colors: ['#475569', '#64748B'],
    dataLabels: { enabled: false },
    grid: { show: false },
    xaxis: {
      categories: statusData.map(s => s.status),
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          colors: '#64748B',
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: { show: true },
    fill: { opacity: 1 },
    legend: {
      show: true,
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
    },
    tooltip: { theme: 'light' },
  }), [statusData])

  const chartOptionsPie = useMemo(() => ({
    chart: {
      type: 'donut' as const,
      fontFamily: 'Inter, sans-serif',
    },
    labels: statusData.filter(s => s.count > 0).map(s => s.status),
    colors: ['#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#1E293B', '#0F172A', '#1C1917', '#292524', '#44403C'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
    legend: {
      show: true,
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0),
            },
          },
        },
      },
    },
    tooltip: { theme: 'light' },
  }), [statusData])

  const seriesBar = useMemo(() => [
    { name: 'Laki-laki', data: statusData.map(s => s.laki) },
    { name: 'Perempuan', data: statusData.map(s => s.perempuan) },
  ], [statusData])

  const seriesPie = useMemo(() => statusData.filter(s => s.count > 0).map(s => s.count), [statusData])

  const interviewSeries = useMemo(() => {
    const interview = statusData.find(s => s.status === 'Interview')?.count || 0
    const jadwalkan = statusData.find(s => s.status === 'Jadwalkan Interview Ulang')?.count || 0
    const lulus = statusData.find(s => s.status === 'Lulus interview')?.count || 0
    return [interview, jadwalkan, lulus]
  }, [statusData])

  const interviewOptions = useMemo(() => ({
    chart: {
      type: 'pie' as const,
      fontFamily: 'Inter, sans-serif',
    },
    labels: ['Interview', 'Jadwal Ulang', 'Lulus'],
    colors: ['#64748B', '#475569', '#334155'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
    },
    legend: {
      show: true,
      position: 'bottom' as const,
    },
    tooltip: { theme: 'light' },
  }), [])

  const chartOptionsByCabang = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      height: 380,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '40%',
        borderRadiusApplication: 'end' as const,
      },
    },
    colors: ['#475569', '#1E293B'],
    dataLabels: { enabled: true },
    grid: { 
      show: true,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: byCabangData.map(c => c.nama_cabang),
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          colors: '#64748B',
        },
      },
    },
    yaxis: { 
      show: true,
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
        },
      },
    },
    fill: { opacity: 1 },
    legend: {
      show: true,
      position: 'top' as const,
      horizontalAlign: 'center' as const,
    },
    tooltip: { theme: 'light' },
  }), [byCabangData])

  const seriesByCabang = useMemo(() => [
    { 
      name: 'Interview', 
      data: byCabangData.map(c => c.interview + c.jadwalkan) 
    },
    { 
      name: 'Lulus Interview', 
      data: byCabangData.map(c => c.lulus) 
    },
  ], [byCabangData])

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-slate-600" size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
              title="Total Kandidat" 
              value={totalKandidat} 
              icon={<Users size={18} />} 
              color="slate" 
            />
            <StatCard 
              title="Interview" 
              value={interviewCount} 
              icon={<Clock size={18} />} 
              color="slate" 
            />
            <StatCard 
              title="Lulus Interview" 
              value={lulusCount} 
              icon={<CheckCircle size={18} />} 
              color="slate" 
            />
            <StatCard 
              title="Persentase" 
              value={`${percentage}%`} 
              icon={<TrendingUp size={18} />} 
              color="slate" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-4">Status Progress Chart</h3>
              <ReactApexChart
                options={chartOptionsBar}
                series={seriesBar}
                type="bar"
                height={300}
              />
            </div>

            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-4">Distribusi Status</h3>
              <ReactApexChart
                options={chartOptionsPie}
                series={seriesPie}
                type="donut"
                height={300}
              />
            </div>
          </div>

          <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Interview & Lulus Interview per Cabang</h3>
            <ReactApexChart
              options={chartOptionsByCabang}
              series={seriesByCabang}
              type="bar"
              height={380}
            />
          </div>

          <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Interview vs Lulus</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ReactApexChart
                options={interviewOptions}
                series={interviewSeries}
                type="pie"
                height={250}
              />
              <div className="flex flex-col justify-center space-y-3">
                <div className="p-4 bg-slate-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                    <span className="text-sm text-slate-700">Interview</span>
                  </div>
                  <span className="text-lg font-bold text-slate-700">
                    {statusData.find(s => s.status === 'Interview')?.count || 0}
                  </span>
                </div>
                <div className="p-4 bg-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                    <span className="text-sm text-slate-700">Jadwal Ulang</span>
                  </div>
                  <span className="text-lg font-bold text-slate-700">
                    {statusData.find(s => s.status === 'Jadwalkan Interview Ulang')?.count || 0}
                  </span>
                </div>
                <div className="p-4 bg-slate-300 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                    <span className="text-sm text-slate-700">Lulus Interview</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{lulusCount}</span>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Interview</span>
                  <span className="text-lg font-bold text-slate-600">{interviewCount}</span>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                  <p className="text-xs text-slate-300">Persentase Kelulusan</p>
                  <p className="text-2xl font-bold text-white">{percentage}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Detail Semua Status Progres Kandidat
              </h3>
              <span className="text-xs text-slate-500">
                Total {totalKandidat} kandidat
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left">
                    <th className="px-3 py-2.5 font-medium w-10">No</th>
                    <th className="px-3 py-2.5 font-medium">Status Progres</th>
                    <th className="px-3 py-2.5 font-medium w-20 text-center">Jumlah</th>
                    <th className="px-3 py-2.5 font-medium w-20 text-center">Laki-laki</th>
                    <th className="px-3 py-2.5 font-medium w-20 text-center">Perempuan</th>
                    <th className="px-3 py-2.5 font-medium w-40">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {statusData
                    .map((s, idx) => {
                      const percent =
                        totalKandidat > 0
                          ? Math.round((s.count / totalKandidat) * 100)
                          : 0
                      const color = STATUS_COLORS[s.status] || '#64748b'
                      return (
                        <tr
                          key={s.status}
                          className="border-t hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-3 py-2.5 tabular-nums text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-medium text-slate-700">
                                {s.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {s.count}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              {s.laki}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-pink-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                              {s.perempuan}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor: color,
                                  }}
                                />
                              </div>
                              <span className="w-10 text-right text-xs tabular-nums text-slate-600 font-medium">
                                {percent}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-700">
                    <td className="px-3 py-2.5" />
                    <td className="px-3 py-2.5">Total</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">
                      {statusData.reduce((sum, s) => sum + s.count, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-sky-700">
                      {statusData.reduce((sum, s) => sum + s.laki, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-pink-700">
                      {statusData.reduce((sum, s) => sum + s.perempuan, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {totalKandidat > 0
                        ? Math.round(
                            (statusData.reduce((sum, s) => sum + s.count, 0) /
                              totalKandidat) *
                              100,
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-xl">
      <CardContent className="p-3 sm:p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase">{title}</p>
          <h3 className="text-xl font-bold text-slate-800">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}