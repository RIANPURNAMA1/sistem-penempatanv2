import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/components'
import { Calendar, DollarSign, FileText, Plane, Briefcase } from 'lucide-react'

interface ProgresDetailCardProps {
  data: {
    tgl_setsumeikai?: string
    tgl_mensetsu_1?: string
    tgl_mensetsu_2?: string
    catatan_mensetsu?: string
    biaya_pemberkasan?: string
    adm_tahap_1?: string
    adm_tahap_2?: string
    dokumen_dikirim?: string
    terbit_kontrak?: string
    kontrak_dikirim_tsk?: string
    terbit_paspor?: string
    masuk_imigrasi?: string
    coe_terbit?: string
    ektkln_pembuatan?: string
    dokumen_dikirim_2?: string
    visa?: string
    jadwal_penerbitan?: string
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatRupiah = (value: string) => {
  if (!value) return '-'
  return `Rp ${Number(value).toLocaleString('id-ID')}`
}

export default function ProgresDetailCard({ data }: ProgresDetailCardProps) {
  return (
    <div className="space-y-4">
      {/* DATA INTERVIEW & MENSETSU */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            Data Interview & Mensetsu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">TGL Setsumeikai</p>
              <p className="font-medium">{formatDate(data.tgl_setsumeikai || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">TGL Mensetsu 1</p>
              <p className="font-medium">{formatDate(data.tgl_mensetsu_1 || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">TGL Mensetsu 2</p>
              <p className="font-medium">{formatDate(data.tgl_mensetsu_2 || '')}</p>
            </div>
            <div className="col-span-2 md:col-span-3">
              <p className="text-xs text-muted-foreground">Catatan Mensetsu</p>
              <p className="font-medium">{data.catatan_mensetsu || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BIAYA & ADMINISTRASI */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign size={16} className="text-green-600" />
            Biaya & Administrasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Biaya Pemberkasan</p>
              <p className="font-medium">{formatRupiah(data.biaya_pemberkasan || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ADM Tahap 1</p>
              <p className="font-medium">{formatRupiah(data.adm_tahap_1 || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ADM Tahap 2</p>
              <p className="font-medium">{formatRupiah(data.adm_tahap_2 || '')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TRACKING DOKUMEN & PROSES */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText size={16} className="text-purple-600" />
            Tracking Dokumen & Proses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Dok. Dikirim</p>
              <p className="font-medium">{formatDate(data.dokumen_dikirim || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terbit Kontrak</p>
              <p className="font-medium">{formatDate(data.terbit_kontrak || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kontrak ke TSK</p>
              <p className="font-medium">{formatDate(data.kontrak_dikirim_tsk || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terbit Paspor</p>
              <p className="font-medium">{formatDate(data.terbit_paspor || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Masuk Imigrasi</p>
              <p className="font-medium">{formatDate(data.masuk_imigrasi || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">COE Terbit</p>
              <p className="font-medium">{formatDate(data.coe_terbit || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">E-KTKLN</p>
              <p className="font-medium">{formatDate(data.ektkln_pembuatan || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dok. Dikirim 2</p>
              <p className="font-medium">{formatDate(data.dokumen_dikirim_2 || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Visa</p>
              <p className="font-medium">{formatDate(data.visa || '')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jadwal Penerbangan</p>
              <p className="font-medium">{formatDate(data.jadwal_penerbitan || '')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}