import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/components'
import api from '@/lib/api'
import { Users, FileCheck, Clock, XCircle, CheckCircle, GitBranch, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats {
  total: number
  byStatus: { status_formulir: string; count: number }[]
  byCabang: { nama_cabang: string; count: number }[]
  bySSWGender?: { ssw: string; laki: number; perempuan: number }[]
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'secondary', icon: Clock },
  submitted: { label: 'Terkirim', color: 'info', icon: FileCheck },
  reviewed: { label: 'Direview', color: 'warning', icon: Clock },
  approved: { label: 'Disetujui', color: 'success', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'destructive', icon: XCircle },
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'verifikasi' | 'status' | 'perusahaan'>('verifikasi')

  useEffect(() => {
    api.get('/kandidat/stats').then(r => setStats(r.data.data)).finally(() => setLoading(false))
  }, [])

  const getCount = (status: string) => stats?.byStatus.find(s => s.status_formulir === status)?.count || 0

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selamat datang, {user?.nama} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('verifikasi')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'verifikasi'
              ? 'bg-[#1e3a5f] text-white shadow-sm'
              : 'bg-white text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          Verifikasi Pendaftaran
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'status'
              ? 'bg-[#1e3a5f] text-white shadow-sm'
              : 'bg-white text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          Status Kandidat
        </button>
        <button
          onClick={() => setActiveTab('perusahaan')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'perusahaan'
              ? 'bg-[#1e3a5f] text-white shadow-sm'
              : 'bg-white text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          Data Perusahaan
        </button>
      </div>

      {activeTab === 'verifikasi' ? (
        <>
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        {/* Status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Formulir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusConfig).map(([status, cfg]) => {
              const count = getCount(status)
              const total = stats?.total || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{cfg.label}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* By cabang */}
        {user?.role === 'admin_penempatan' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kandidat per Cabang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.byCabang.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data</p>}
              {stats?.byCabang.map(item => (
                <div key={item.nama_cabang} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-muted-foreground" />
                    <span className="text-sm">{item.nama_cabang || 'Tidak ada cabang'}</span>
                  </div>
                  <Badge variant="secondary">{item.count} kandidat</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
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
        </>
      ) : activeTab === 'status' ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-sm text-muted-foreground col-span-full">Memuat...</p>
          ) : (stats?.bySSWGender?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full">Belum ada data</p>
          ) : (
            stats?.bySSWGender?.map(item => (
              <Card key={item.ssw}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award size={14} className="text-[#1e3a5f]" />
                    {item.ssw}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Laki-laki</span>
                    <Badge variant="secondary">{item.laki}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Perempuan</span>
                    <Badge variant="secondary">{item.perempuan}</Badge>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <Badge className="bg-[#1e3a5f]">{item.laki + item.perempuan}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </>
      ) : (
        <>
        </>
      )}
    </div>
  )
}
