import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/components'
import { Calendar, DollarSign, FileText } from 'lucide-react'

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
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatRupiah = (value: string) => {
  if (!value) return null
  const n = Number(value)
  if (isNaN(n)) return null
  return `Rp ${n.toLocaleString('id-ID')}`
}

const Field = ({ label, value }: { label: string; value: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    {value ? (
      <p className="font-semibold text-sm mt-0.5">{value}</p>
    ) : (
      <p className="text-sm mt-0.5 text-muted-foreground/60">—</p>
    )}
  </div>
)

export default function ProgresDetailCard({ data }: ProgresDetailCardProps) {
  return (
    <div className="space-y-4">
      {/* DATA INTERVIEW & MENSETSU */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600">
              <Calendar size={14} />
            </span>
            Data Interview & Mensetsu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Field label="TGL Setsumeikai" value={formatDate(data.tgl_setsumeikai || '')} />
            <Field label="TGL Mensetsu 1" value={formatDate(data.tgl_mensetsu_1 || '')} />
            <Field label="TGL Mensetsu 2" value={formatDate(data.tgl_mensetsu_2 || '')} />
            <div className="col-span-2 md:col-span-3">
              <p className="text-xs text-muted-foreground">Catatan Mensetsu</p>
              {data.catatan_mensetsu ? (
                <p className="font-medium text-sm mt-0.5 leading-relaxed bg-muted/40 rounded-lg px-3 py-2">
                  {data.catatan_mensetsu}
                </p>
              ) : (
                <p className="text-sm mt-0.5 text-muted-foreground/60">—</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BIAYA & ADMINISTRASI */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600">
              <DollarSign size={14} />
            </span>
            Biaya & Administrasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Field label="Biaya Pemberkasan" value={formatRupiah(data.biaya_pemberkasan || '')} />
            <Field label="ADM Tahap 1" value={formatRupiah(data.adm_tahap_1 || '')} />
            <Field label="ADM Tahap 2" value={formatRupiah(data.adm_tahap_2 || '')} />
          </div>
        </CardContent>
      </Card>

      {/* TRACKING DOKUMEN & PROSES */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 text-purple-600">
              <FileText size={14} />
            </span>
            Tracking Dokumen & Proses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm">
            <Field label="Dok. Dikirim" value={formatDate(data.dokumen_dikirim || '')} />
            <Field label="Terbit Kontrak" value={formatDate(data.terbit_kontrak || '')} />
            <Field label="Kontrak ke TSK" value={formatDate(data.kontrak_dikirim_tsk || '')} />
            <Field label="Terbit Paspor" value={formatDate(data.terbit_paspor || '')} />
            <Field label="Masuk Imigrasi" value={formatDate(data.masuk_imigrasi || '')} />
            <Field label="COE Terbit" value={formatDate(data.coe_terbit || '')} />
            <Field label="E-KTKLN" value={formatDate(data.ektkln_pembuatan || '')} />
            <Field label="Dok. Dikirim 2" value={formatDate(data.dokumen_dikirim_2 || '')} />
            <Field label="Visa" value={formatDate(data.visa || '')} />
            <Field label="Jadwal Penerbangan" value={formatDate(data.jadwal_penerbitan || '')} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
