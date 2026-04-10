import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import VerifikasiPendaftaran from '@/components/dashboard/VerifikasiPendaftaran'
import StatusKandidat from '@/components/dashboard/StatusKandidat'
import DataPerusahaan from '@/components/dashboard/DataPerusahaan'
import SertifikasiKandidat from '@/components/dashboard/SertifikasiKandidat'
import InterviewStats from '@/components/dashboard/InterviewStats'

interface Stats {
  total: number
  byStatus: { status_formulir: string; count: number }[]
  byCabang: { nama_cabang: string; count: number }[]
  bySSWGender?: { ssw: string; laki: number; perempuan: number; total: number }[]
  bySSWProgres?: { ssw: string; progres: { status: string; count: number }[] }[]
  byCabangProgres?: { nama_cabang: string; status_progres: string; count: number }[]
  jftByGender?: { jenis_kelamin: string; has_jft: number; no_jft: number }[]
  jftByCabang?: { nama_cabang: string; has_jft: number; no_jft: number }[]
  sswByGender?: { jenis_kelamin: string; has_ssw: number; no_ssw: number }[]
  sswByCabang?: { nama_cabang: string; has_ssw: number; no_ssw: number }[]
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'verifikasi' | 'status' | 'sertifikasi' | 'job order' | 'interview'>('verifikasi')
  const [jobOrderStats, setJobOrderStats] = useState<{ bidang: string; count: number }[]>([])
  const [loadingJobOrder, setLoadingJobOrder] = useState(false)
  const [filterTanggalAwal, setFilterTanggalAwal] = useState('')
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState('')

  useEffect(() => {
    api.get('/kandidat/stats').then(r => setStats(r.data.data)).finally(() => setLoading(false))
  }, [])

  const fetchJobOrderData = (tanggalAwal: string = '', tanggalAkhir: string = '') => {
    setLoadingJobOrder(true)
    let url = '/joborder'
    const params: string[] = []
    
    if (tanggalAwal) params.push(`tanggal_awal=${tanggalAwal}`)
    if (tanggalAkhir) params.push(`tanggal_akhir=${tanggalAkhir}`)
    
    if (params.length > 0) {
      url += '?' + params.join('&')
    }

    api.get(url).then(r => {
      const data = r.data.data || []
      const grouped: Record<string, number> = data.reduce((acc: Record<string, number>, item: any) => {
        const bidang = item.bidang_ssw || 'Lainnya'
        acc[bidang] = (acc[bidang] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      const result = Object.entries(grouped)
        .map(([bidang, count]) => ({ bidang, count }))
        .sort((a, b) => b.count - a.count)
      setJobOrderStats(result)
    }).finally(() => setLoadingJobOrder(false))
  }

  useEffect(() => {
    if (activeTab === 'job order') {
      fetchJobOrderData(filterTanggalAwal, filterTanggalAkhir)
    }
  }, [activeTab])

  const handleFilterChange = (tanggalAwal: string, tanggalAkhir: string) => {
    setFilterTanggalAwal(tanggalAwal)
    setFilterTanggalAkhir(tanggalAkhir)
    fetchJobOrderData(tanggalAwal, tanggalAkhir)
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selamat datang, {user?.nama} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

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
          onClick={() => setActiveTab('sertifikasi')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'sertifikasi'
              ? 'bg-[#1e3a5f] text-white shadow-sm'
              : 'bg-white text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          Sertifikasi
        </button>
        {user?.role === 'admin_penempatan' && (
          <button
            onClick={() => setActiveTab('job order')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'job order'
                ? 'bg-[#1e3a5f] text-white shadow-sm'
                : 'bg-white text-muted-foreground hover:bg-muted border border-border'
            }`}
          >
            Job Order
          </button>
        )}
        <button
          onClick={() => setActiveTab('interview')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'interview'
              ? 'bg-[#1e3a5f] text-white shadow-sm'
              : 'bg-white text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          Interview & Lulus
        </button>
      </div>

      {activeTab === 'verifikasi' && (
        <VerifikasiPendaftaran stats={stats} loading={loading} />
      )}

      {activeTab === 'status' && (
        <StatusKandidat stats={stats?.bySSWGender} bySSWProgres={stats?.bySSWProgres} byCabangProgres={stats?.byCabangProgres} loading={loading} />
      )}

      {activeTab === 'sertifikasi' && (
        <SertifikasiKandidat 
          jftByGender={stats?.jftByGender} 
          jftByCabang={stats?.jftByCabang}
          sswByGender={stats?.sswByGender}
          sswByCabang={stats?.sswByCabang}
          loading={loading} 
        />
      )}

      {activeTab === 'job order' && (
        <DataPerusahaan 
          stats={jobOrderStats} 
          loading={loadingJobOrder}
          filterTanggalAwal={filterTanggalAwal}
          filterTanggalAkhir={filterTanggalAkhir}
          onFilterChange={handleFilterChange}
        />
      )}

      {activeTab === 'interview' && (
        <InterviewStats />
      )}
    </div>
  )
}
