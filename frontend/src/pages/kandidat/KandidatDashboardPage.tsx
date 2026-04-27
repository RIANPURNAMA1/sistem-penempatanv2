import { useEffect, useState } from 'react'
import { Card, CardContent, Badge } from '@/components/ui/components'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import TimelineProgres from '@/components/kandidat/TimelineProgres'
import { FileText, Mail, MapPin, Calendar, User, Phone, GraduationCap, AlertCircle } from 'lucide-react'

export default function KandidatDashboardPage() {
  const navigate = useNavigate()
  const [profil, setProfil] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    api.get('/kandidat/my-profile')
      .then(r => {
        if (r.data.success && r.data.data) {
          setProfil(r.data.data)
          const p = r.data.data
          if (p.status_formulir === 'draft') {
            setShowPopup(true)
          }
        } else {
          setShowPopup(true)
        }
      })
      .catch(() => {
        setShowPopup(true)
      })
  }, [])

  const statusBadge: Record<string, { label: string; variant: string }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Menunggu review', variant: 'info' },
    reviewed: { label: 'Sedang direview', variant: 'warning' },
    approved: { label: 'Disetujui', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
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

  if (!profil) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  const curStatus = statusBadge[profil.status_formulir] || statusBadge.draft

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Dashboard Kandidat</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Selamat datang, {profil.nama_romaji || profil.nama}</p>
      </div>

      <div className="mb-4 sm:mb-6 -mx-2 sm:mx-0">
        <TimelineProgres currentStatus={profil.status_progres} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">Status Formulir</h3>
                <Badge variant={curStatus.variant as any} className="mt-1 text-xs">{curStatus.label}</Badge>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <FileText size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Nama:</span>
                  <p className="font-medium">{profil.nama_romaji || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <Mail size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium truncate">{profil.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <Phone size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">No. HP:</span>
                  <p className="font-medium">{profil.nomor_hp || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Alamat:</span>
                  <p className="font-medium">{profil.alamat_lengkap || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <GraduationCap size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Pendidikan:</span>
                  <p className="font-medium">{profil.pendidikan_terakhir || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <Calendar size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Bergabung:</span>
                  <p className="font-medium">{new Date(profil.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Informasi Proses</h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Status Progres</span>
                <span className="font-medium text-xs sm:text-sm text-right max-w-[50%]">{profil.status_progres || 'Belum ada'}</span>
              </div>
              {profil.nama_perusahaan && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Perusahaan</span>
                  <span className="font-medium text-xs sm:text-sm text-right max-w-[50%]">{profil.nama_perusahaan}</span>
                </div>
              )}
              {profil.bidang_ssw && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Bidang SSW</span>
                  <span className="font-medium text-xs sm:text-sm text-right max-w-[50%]">{profil.bidang_ssw}</span>
                </div>
              )}
              {profil.catatan_progres && (
                <div className="py-2">
                  <span className="text-muted-foreground block mb-1 text-xs">Catatan Progres:</span>
                  <p className="bg-muted p-2 sm:p-3 rounded-lg text-xs sm:text-sm">{profil.catatan_progres}</p>
                </div>
              )}
              {profil.catatan_admin && (
                <div className="py-2">
                  <span className="text-muted-foreground block mb-1 text-xs">Catatan Admin:</span>
                  <p className="bg-amber-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-amber-800">{profil.catatan_admin}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}