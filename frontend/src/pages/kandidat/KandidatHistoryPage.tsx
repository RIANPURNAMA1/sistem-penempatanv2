import { useEffect, useState } from 'react'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { History, FileText, Calendar, Star, Loader2, AlertCircle, GraduationCap } from 'lucide-react'

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

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

  // Get current Institusi from kandidat profile
  const currentInstitusi = profil?.institusi || ''

  // Get current SSW field from kandidat profile
  const currentSSW = profil?.bidang_ssw || ''

  // Get current status from kandidat profile
  const latestStatus = profil?.status_progres || 'Job Matching'
  const latestStatusLabel = statusConfig[latestStatus] || latestStatus

  // Get SSW at specific date
  const getSSWAtDate = (targetDate: string) => {
    const targetTime = new Date(targetDate).getTime()
    const sswHistory = history
      .filter(h => h.field_name === 'bidang_ssw' && h.new_value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    const relevant = sswHistory.find(h => new Date(h.created_at).getTime() <= targetTime)
    return relevant?.new_value || currentSSW || '-'
  }

  // Get Institusi at specific date
  const getInstitusiAtDate = (targetDate: string) => {
    const targetTime = new Date(targetDate).getTime()
    const institusiHistory = history
      .filter(h => h.field_name === 'institusi' && h.new_value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    const relevant = institusiHistory.find(h => new Date(h.created_at).getTime() <= targetTime)
    return relevant?.new_value || currentInstitusi || '-'
  }

  const statusChanges = history.filter(h => h.field_name === 'status_progres')
    .map(h => ({
      date: h.created_at,
      oldStatus: h.old_value || '',
      newStatus: h.new_value || 'Job Matching',
      admin: h.admin_nama || 'System',
      institusi: getInstitusiAtDate(h.created_at),
      ssw: getSSWAtDate(h.created_at)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Get unique institusis from history
  const institusis = [...new Set(
    history.filter(h => h.field_name === 'institusi' && h.new_value)
      .map(h => h.new_value)
  )]
  if (currentInstitusi && !institusis.includes(currentInstitusi)) {
    institusis.unshift(currentInstitusi)
  }

  // Get SSW fields from history
  const sswFields = [...new Set(
    history.filter(h => h.field_name === 'bidang_ssw' && h.new_value)
      .map(h => h.new_value)
  )]
  if (currentSSW && !sswFields.includes(currentSSW)) {
    sswFields.unshift(currentSSW)
  }

  // Interview dates based on status change to "Interview"
  const interviewHistory = history
    .filter(h => h.field_name === 'status_progres' && h.new_value === 'Interview')
    .map(h => ({
      date: h.created_at,
      type: 'Interview',
      institusi: getInstitusiAtDate(h.created_at),
      ssw: getSSWAtDate(h.created_at)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            {/* Status Saat Ini */}
            <Card className="border shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">Status Saat Ini</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {latestStatusLabel}
                </Badge>
              </CardContent>
            </Card>

            {/* Total Interview */}
            <Card className="border shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">Total Interview</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{interviewHistory.length}</p>
                <p className="text-xs text-gray-500">kali</p>
              </CardContent>
            </Card>

            {/* Institusi */}
            <Card className="border shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={14} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">Institusi</span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{institusis[0] || '-'}</p>
                {institusis.length > 1 && <p className="text-xs text-gray-500">+{institusis.length - 1} lainnya</p>}
              </CardContent>
            </Card>

            {/* Bidang SSW */}
            <Card className="border shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">Bidang SSW</span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{sswFields[0] || '-'}</p>
                {sswFields.length > 1 && <p className="text-xs text-gray-500">+{sswFields.length - 1} lainnya</p>}
              </CardContent>
            </Card>
          </div>

          {/* Interview History */}
          {interviewHistory.length > 0 && (
            <Card className="border shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  Riwayat Interview ({interviewHistory.length} kali)
                </h3>
                <div className="space-y-2">
                  {interviewHistory.map((int, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{int.type}</Badge>
                          <span className="text-xs sm:text-sm font-medium text-gray-800">{formatDateTime(int.date)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <GraduationCap size={12} className="inline mr-1" />
                          {int.institusi}
                          {int.ssw && int.ssw !== '-' && (
                            <> • <Star size={12} className="inline mr-1" />{int.ssw}</>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          {statusChanges.length > 0 && (
            <Card className="border shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <History size={16} className="text-gray-500" />
                  Timeline Status
                </h3>
                <div className="space-y-2">
                  {statusChanges.map((status, idx) => {
                    const newLabel = statusConfig[status.newStatus] || status.newStatus || 'Unknown'

                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded font-medium border bg-white">
                              {newLabel}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(status.date)}
                            </span>
                          </div>
                          {status.institusi && status.institusi !== '-' && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <GraduationCap size={12} />
                              {status.institusi}
                              {status.ssw && status.ssw !== '-' && (
                                <> • <Star size={12} className="inline mr-1" />{status.ssw}</>
                              )}
                            </p>
                          )}
                          {(!status.institusi || status.institusi === '-') && status.ssw && status.ssw !== '-' && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Star size={12} />
                              {status.ssw}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detail History List */}
          <Card className="border shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                Detail Riwayat Aktivitas
              </h3>
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 border rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-800">
                            {item.description || `${item.action_type} - ${item.field_name}`}
                          </p>
                          {item.field_name === 'status_progres' && item.new_value && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {statusConfig[item.new_value] || item.new_value}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      {getInstitusiAtDate(item.created_at) !== '-' && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <GraduationCap size={12} />
                          {getInstitusiAtDate(item.created_at)}
                        </p>
                      )}
                      {item.admin_nama && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          oleh: {item.admin_nama}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}