import { useEffect, useState } from 'react'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { History, Loader2, AlertCircle, GraduationCap, Star } from 'lucide-react'

const statusConfig: Record<string, string> = {
  'Job Matching': 'Job Matching',
  'Pending': 'Pending',
  'lamar ke perusahaan': 'Melamar',
  'Interview': 'Interview',
  'Jadwalkan Interview Ulang': 'Interview Ulang',
  'Lulus interview': 'Lulus',
  'Gagal Interview': 'Gagal',
  'Pemberkasan': 'Pemberkasan',
  'Berangkat': 'Berangkat',
  'Ditolak': 'Ditolak',
}

interface HistoryItem {
  id: number
  kandidat_id: number
  admin_id: number | null
  admin_nama: string
  action_type: string
  field_name: string
  old_value: string | null
  new_value: string | null
  description: string
  created_at: string
}

interface KandidatProfile {
  id: number
  status_progres: string
  institusi: string
  bidang_ssw: string
}

export default function KandidatHistoryPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [profil, setProfil] = useState<KandidatProfile | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/kandidat/history'),
      api.get('/kandidat/my-profile')
    ])
    .then(([historyRes, profilRes]) => {
      setHistory(historyRes.data.data || [])
      setProfil(profilRes.data.data)
      if (profilRes.data.data?.status_formulir === 'draft') {
        setShowPopup(true)
      }
    })
    .catch(() => {
      setShowPopup(true)
    })
    .finally(() => setLoading(false))
  }, [])

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusChanges = history.filter(h => h.field_name === 'status_progres')
    .map((h, idx) => ({
      no: idx + 1,
      date: h.created_at,
      oldStatus: h.old_value || 'Job Matching',
      newStatus: h.new_value || 'Job Matching',
      admin: h.admin_nama || 'System',
      institusi: profil?.institusi || '-',
      ssw: profil?.bidang_ssw || '-',
    }))
    .reverse()

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#1e3a5f]" />
        </div>
      </div>
    )
  }

  if (showPopup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl border p-6 sm:p-8 max-w-md w-full mx-4 text-center relative">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-amber-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Formulir Belum Disubmit</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Formulir pendaftaran Anda masih berstatus draft. Silakan lengkapi dan submit formulir untuk melanjutkan.
          </p>
          <button
            onClick={() => navigate('/formulir')}
            className="w-full bg-[#1e3a5f] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#2a4a73] transition-colors"
          >
            Lengkapi Formulir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <History size={24} className="text-[#1e3a5f]" />
          Riwayat Aktivitas
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track perjalanan dan progres kamu</p>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border shadow-sm">
          <History size={48} className="text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Belum ada history aktivitas</p>
          <p className="text-xs text-muted-foreground mt-1">Aktivitas akan muncul setelah ada perubahan data</p>
        </div>
      ) : (
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 whitespace-nowrap">NO</th>
                    <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 whitespace-nowrap">TANGGAL</th>
                    <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 whitespace-nowrap">STATUS LAMA</th>
                    <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 whitespace-nowrap">STATUS BARU</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 whitespace-nowrap">INSTITUSI</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 whitespace-nowrap">BIDANG SSW</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {statusChanges.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-gray-400 text-xs">{item.no}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs whitespace-nowrap">{formatDateTime(item.date)}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium border bg-gray-100 text-gray-600">
                          {statusConfig[item.oldStatus] || item.oldStatus || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-[#1e3a5f] text-white">
                          {statusConfig[item.newStatus] || item.newStatus || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        <div className="flex items-center gap-1">
                          <GraduationCap size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{item.institusi}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{item.ssw}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
