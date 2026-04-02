import { useEffect, useState } from 'react'
import { Card, CardContent, Badge } from '@/components/ui/components'
import api from '@/lib/api'
import TimelineProgres from '@/components/kandidat/TimelineProgres'
import { FileText, Mail, MapPin, Calendar, User } from 'lucide-react'

export default function KandidatDashboardPage() {
  const [profil, setProfil] = useState<any>(null)

  useEffect(() => {
    api.get('/kandidat/my-profile').then(r => setProfil(r.data.data))
  }, [])

  const statusBadge: Record<string, { label: string; variant: string }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Menunggu review', variant: 'info' },
    reviewed: { label: 'Sedang direview', variant: 'warning' },
    approved: { label: 'Disetujui', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard Kandidat</h1>
        <p className="text-sm text-muted-foreground mt-1">Selamat datang, {profil.nama_romaji || profil.nama}</p>
      </div>

      <TimelineProgres currentStatus={profil.status_progres} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium">Status Formulir</h3>
                <Badge variant={curStatus.variant as any} className="mt-1">{curStatus.label}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium">{profil.nama_romaji || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{profil.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Alamat:</span>
                <span className="font-medium">{profil.alamat_lengkap || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Bergabung:</span>
                <span className="font-medium">{new Date(profil.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Informasi Proses</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Status Progres</span>
                <span className="font-medium">{profil.status_progres || 'Belum ada'}</span>
              </div>
              {profil.catatan_progres && (
                <div className="py-2">
                  <span className="text-muted-foreground block mb-1">Catatan Progres:</span>
                  <p className="bg-muted p-3 rounded-lg text-sm">{profil.catatan_progres}</p>
                </div>
              )}
              {profil.catatan_admin && (
                <div className="py-2">
                  <span className="text-muted-foreground block mb-1">Catatan Admin:</span>
                  <p className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">{profil.catatan_admin}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
