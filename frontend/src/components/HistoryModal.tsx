import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { Loader2, History, FileText, Calendar, Building, Star } from 'lucide-react'
import api from '@/lib/api'

interface HistoryItem {
  id: number
  kandidat_id: number
  admin_id: number
  admin_nama: string
  admin_user_nama: string
  action_type: string
  field_name: string
  old_value: string
  new_value: string
  description: string
  created_at: string
}

interface KandidatProfile {
  id: number
  status_progres: string
  nama_perusahaan: string
  bidang_ssw: string
}

interface HistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kandidatId: number
  kandidatName: string
}

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

export default function HistoryModal({ open, onOpenChange, kandidatId, kandidatName }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [kandidat, setKandidat] = useState<KandidatProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && kandidatId) {
      setLoading(true)
      Promise.all([
        api.get(`/kandidat/${kandidatId}/history`),
        api.get(`/kandidat/${kandidatId}`)
      ])
        .then(([historyRes, kandidatRes]) => {
          setHistory(historyRes.data.data || [])
          setKandidat(kandidatRes.data.data)
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [open, kandidatId])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Get current company from kandidat profile
  const currentCompany = kandidat?.nama_perusahaan || ''

  // Get current SSW field from kandidat profile
  const currentSSW = kandidat?.bidang_ssw || ''

  // Get current status from kandidat profile
  const latestStatus = kandidat?.status_progres || 'Job Matching'
  const latestStatusLabel = statusConfig[latestStatus] || latestStatus

  // Get company at specific date
  const getCompanyAtDate = (targetDate: string) => {
    const targetTime = new Date(targetDate).getTime()
    const companyHistory = history
      .filter(h => h.field_name === 'nama_perusahaan' && h.new_value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    const relevant = companyHistory.find(h => new Date(h.created_at).getTime() <= targetTime)
    return relevant?.new_value || currentCompany || companies[0] || '-'
  }

  const statusChanges = history.filter(h => h.field_name === 'status_progres')
    .map(h => ({
      date: h.created_at,
      oldStatus: h.old_value,
      newStatus: h.new_value,
      admin: h.admin_nama || h.admin_user_nama || 'System',
      company: getCompanyAtDate(h.created_at)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Get unique companies applied from history
  const companies = [...new Set(
    history.filter(h => h.field_name === 'nama_perusahaan' && h.new_value)
      .map(h => h.new_value)
  )]
  // Add current company if exists and not in list
  if (currentCompany && !companies.includes(currentCompany)) {
    companies.unshift(currentCompany)
  }

  // Get SSW fields from history
  const sswFields = [...new Set(
    history.filter(h => h.field_name === 'bidang_ssw' && h.new_value)
      .map(h => h.new_value)
  )]
  // Add current SSW if exists and not in list
  if (currentSSW && !sswFields.includes(currentSSW)) {
    sswFields.unshift(currentSSW)
  }

  // Interview dates based on status change to "Interview"
  const interviewHistory = history
    .filter(h => h.field_name === 'status_progres' && h.new_value === 'Interview')
    .map(h => ({
      date: h.created_at,
      type: 'Interview',
      company: getCompanyAtDate(h.created_at)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={20} className="text-gray-600" />
            Riwayat Kandidat - {kandidatName}
          </DialogTitle>
          <p className="text-sm text-gray-500">Track perjalanan dan progres kandidat</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada history perubahan</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Status Saat Ini */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Status Saat Ini</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {latestStatusLabel}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Total Interview */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Total Interview</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{interviewHistory.length}</p>
                    <p className="text-xs text-gray-500">kali interview</p>
                  </CardContent>
                </Card>

                {/* Perusahaan */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building size={16} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Perusahaan</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{companies[0] || '-'}</p>
                    {companies.length > 1 && <p className="text-xs text-gray-500">+{companies.length - 1} lainnya</p>}
                  </CardContent>
                </Card>

                {/* Bidang SSW */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={16} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Bidang SSW</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{sswFields[0] || '-'}</p>
                    {sswFields.length > 1 && <p className="text-xs text-gray-500">+{sswFields.length - 1} lainnya</p>}
                  </CardContent>
                </Card>
              </div>

              {/* Interview History */}
              {interviewHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    Riwayat Interview ({interviewHistory.length} kali)
                  </h3>
                  <div className="space-y-2">
                    {interviewHistory.map((int, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{int.type}</Badge>
                            <span className="text-sm font-medium text-gray-800">{formatDate(int.date)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <Building size={12} className="inline mr-1" />
                            {int.company}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              {statusChanges.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <History size={16} className="text-gray-500" />
                    Timeline Status
                  </h3>
                  <div className="space-y-2">
                    {statusChanges.map((status, idx) => {
                      const newLabel = statusConfig[status.newStatus] || status.newStatus

                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded font-medium border">
                                {newLabel}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">
                                {formatDate(status.date)}
                              </span>
                            </div>
                            {status.company && status.company !== '-' && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Building size={12} />
                                {status.company}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
