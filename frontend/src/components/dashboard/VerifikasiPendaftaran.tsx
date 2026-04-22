import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/components'
import { Users, FileCheck, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'

interface Stats {
  total: number
  byStatus: { status_formulir: string; count: number }[]
  byCabang: { nama_cabang: string; count: number }[]
}

interface VerifikasiPendaftaranProps {
  stats: Stats | null
  loading: boolean
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'secondary', icon: Clock },
  submitted: { label: 'Terkirim', color: 'info', icon: FileCheck },
  reviewed: { label: 'Direview', color: 'warning', icon: Clock },
  approved: { label: 'Disetujui', color: 'success', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'destructive', icon: Clock },
}

export default function VerifikasiPendaftaran({ stats, loading }: VerifikasiPendaftaranProps) {
  const getCount = (status: string) => stats?.byStatus.find(s => s.status_formulir === status)?.count || 0

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards - responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4 md:pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Kandidat</p>
                <p className="text-2xl md:text-3xl font-semibold mt-1">{loading ? '—' : stats?.total || 0}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                <Users size={14} className="text-foreground md:text-base" />
              </div>
            </div>
          </CardContent>
        </Card>

        {['submitted', 'reviewed', 'approved'].map(status => {
          const cfg = statusConfig[status]
          const Icon = cfg.icon
          return (
            <Card key={status}>
              <CardContent className="p-4 md:pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">{cfg.label}</p>
                    <p className="text-2xl md:text-3xl font-semibold mt-1">{loading ? '—' : getCount(status)}</p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <Icon size={14} className="text-foreground md:text-base" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Chart & Actions - responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Formulir</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactApexChart
              type="bar"
              series={[{
                name: 'Jumlah',
                data: Object.keys(statusConfig).map(status => getCount(status))
              }]}
              options={{
                chart: {
                  height: 220,
                  toolbar: { show: false }
                },
                colors: ['#1e3a5f', '#4a7ab5', '#6b9ae0', '#8cbbff', '#a8c5f0'],
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '50%',
                    borderRadius: 6,
                    distributed: true
                  }
                },
                dataLabels: {
                  enabled: true,
                  style: { fontSize: '11px', fontWeight: 600 }
                },
                xaxis: {
                  categories: Object.values(statusConfig).map(cfg => cfg.label),
                  labels: { style: { fontSize: '10px' } }
                },
                yaxis: {
                  labels: { formatter: (val) => val.toFixed(0) }
                },
                grid: {
                  borderColor: '#f1f1f1',
                  strokeDashArray: 4
                },
                tooltip: {
                  theme: 'light',
                  y: { formatter: (val) => `${val} Kandidat` }
                }
              }}
              height={220}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/kandidat?status=draft"
              className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Clock size={12} className="text-gray-600 md:text-base" />
                </div>
                <div>
                  <p className="text-sm font-medium">Formulir Draft</p>
                  <p className="text-xs text-muted-foreground">{getCount('draft')} belum di submit</p>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/kandidat?status=submitted"
              className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <FileCheck size={12} className="text-sky-600 md:text-base" />
                </div>
                <div>
                  <p className="text-sm font-medium">Review Formulir Baru</p>
                  <p className="text-xs text-muted-foreground">{getCount('submitted')} menunggu review</p>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/kandidat"
              className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Users size={12} className="text-foreground md:text-base" />
                </div>
                <div>
                  <p className="text-sm font-medium">Lihat Semua Kandidat</p>
                  <p className="text-xs text-muted-foreground">Total {stats?.total || 0} kandidat</p>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
