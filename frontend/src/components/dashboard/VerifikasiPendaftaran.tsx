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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Kandidat</p>
                <p className="text-3xl font-semibold mt-1">{loading ? '—' : stats?.total || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                <Users size={18} className="text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {['submitted', 'reviewed', 'approved'].map(status => {
          const cfg = statusConfig[status]
          const Icon = cfg.icon
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{cfg.label}</p>
                    <p className="text-3xl font-semibold mt-1">{loading ? '—' : getCount(status)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <Icon size={18} className="text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  height: 280,
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
                  style: { fontSize: '12px', fontWeight: 600 }
                },
                xaxis: {
                  categories: Object.values(statusConfig).map(cfg => cfg.label),
                  labels: { style: { fontSize: '11px' } }
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
              height={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/kandidat?status=submitted"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <FileCheck size={14} className="text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Review Formulir Baru</p>
                  <p className="text-xs text-muted-foreground">{getCount('submitted')} menunggu review</p>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform text-lg">→</span>
            </Link>
            <Link to="/kandidat"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Users size={14} className="text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Lihat Semua Kandidat</p>
                  <p className="text-xs text-muted-foreground">Total {stats?.total || 0} kandidat</p>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform text-lg">→</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
