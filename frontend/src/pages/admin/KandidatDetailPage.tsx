import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, Badge, Textarea, Label } from '@/components/ui/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { ArrowLeft, FileText, User, GraduationCap, Briefcase, Users, Globe, Target, Upload, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const statusFormulirConfig: Record<string, { label: string; variant: string }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Terkirim', variant: 'info' },
  reviewed: { label: 'Direview', variant: 'warning' },
  approved: { label: 'Disetujui', variant: 'success' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

const progresConfig: Record<string, { label: string; variant: string }> = {
  'Job Matching': { label: 'Job Matching', variant: 'warning' },
  'Pending': { label: 'Pending', variant: 'secondary' },
  'lamar ke perusahaan': { label: 'Lamar ke Perusahaan', variant: 'info' },
  'Interview': { label: 'Interview', variant: 'warning' },
  'Jadwalkan Interview Ulang': { label: 'Jadwalkan Interview Ulang', variant: 'outline' },
  'Lulus interview': { label: 'Lulus Interview', variant: 'success' },
  'Gagal Interview': { label: 'Gagal Interview', variant: 'destructive' },
  'Pemberkasan': { label: 'Pemberkasan', variant: 'info' },
  'Berangkat': { label: 'Berangkat', variant: 'success' },
  'Ditolak': { label: 'Ditolak', variant: 'destructive' },
}

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-2 border-b border-border/50 last:border-0">
    <span className="text-xs text-muted-foreground w-48 shrink-0">{label}</span>
    <span className="text-sm font-medium">{value || <span className="text-muted-foreground font-normal">—</span>}</span>
  </div>
)

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 font-semibold text-base mb-4 pb-2 border-b border-border">
    <Icon size={16} className="text-muted-foreground" />{title}
  </div>
)

export default function KandidatDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [newStatus, setNewStatus] = useState('')
  const [catatanAdmin, setCatatanAdmin] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  const [newProgres, setNewProgres] = useState('')
  const [catatanProgres, setCatatanProgres] = useState('')
  const [updatingProgres, setUpdatingProgres] = useState(false)

  useEffect(() => {
    api.get(`/kandidat/${id}`).then(r => {
      setData(r.data.data)
      setNewStatus(r.data.data.status_formulir)
      setCatatanAdmin(r.data.data.catatan_admin || '')
      setNewProgres(r.data.data.status_progres || 'Job Matching')
      setCatatanProgres(r.data.data.catatan_progres || '')
    }).finally(() => setLoading(false))
  }, [id])

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true)
    try {
      await api.patch(`/kandidat/${id}/status`, { status_formulir: newStatus, catatan_admin: catatanAdmin })
      toast({ title: 'Status berhasil diupdate', variant: 'success' as any })
      setData((p: any) => ({ ...p, status_formulir: newStatus, catatan_admin: catatanAdmin }))
    } catch {
      toast({ title: 'Gagal update status', variant: 'destructive' })
    } finally { setUpdatingStatus(false) }
  }

  const handleUpdateProgres = async () => {
    setUpdatingProgres(true)
    try {
      await api.patch(`/kandidat/${id}/progres`, { status_progres: newProgres, catatan_progres: catatanProgres })
      toast({ title: 'Progres berhasil diupdate', variant: 'success' as any })
      setData((p: any) => ({ ...p, status_progres: newProgres, catatan_progres: catatanProgres }))
    } catch {
      toast({ title: 'Gagal update progres', variant: 'destructive' })
    } finally { setUpdatingProgres(false) }
  }

  const bool = (v: any) => v ? 'Ya' : 'Tidak'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-muted-foreground" size={28} />
    </div>
  )
  if (!data) return <div className="page-container"><p>Data tidak ditemukan</p></div>

  const stCfg = statusFormulirConfig[data.status_formulir] || { label: data.status_formulir, variant: 'secondary' }
  const progresCfgItem = progresConfig[data.status_progres] || { label: data.status_progres || 'Job Matching', variant: 'secondary' }

  return (
    <div className="page-container max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">{data.nama_romaji || data.nama}</h1>
            {data.nama_katakana && <span className="text-muted-foreground font-mono text-sm">{data.nama_katakana}</span>}
            <Badge variant={stCfg.variant as any}>{stCfg.label}</Badge>
            {data.status_progres && <Badge variant={progresCfgItem.variant as any}>{progresCfgItem.label}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{data.email} • {data.nama_cabang}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Data Diri */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle icon={User} title="Data Diri" />
              <InfoRow label="Nama (Romaji)" value={data.nama_romaji} />
              <InfoRow label="Nama (Katakana)" value={data.nama_katakana} />
              <InfoRow label="Tempat, Tanggal Lahir" value={data.tempat_lahir && data.tanggal_lahir ? `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}` : data.tempat_lahir} />
              <InfoRow label="Umur" value={data.umur ? `${data.umur} tahun` : null} />
              <InfoRow label="Jenis Kelamin" value={data.jenis_kelamin} />
              <InfoRow label="Pendidikan Terakhir" value={data.pendidikan_terakhir} />
              <InfoRow label="Status Pernikahan" value={data.status_pernikahan} />
              {data.status_pernikahan === 'Menikah' && <InfoRow label="Jumlah Anak" value={data.jumlah_anak} />}
              <InfoRow label="Agama" value={data.agama} />
              <InfoRow label="Tinggi / Berat" value={data.tinggi_badan ? `${data.tinggi_badan} cm / ${data.berat_badan} kg` : null} />
              <InfoRow label="Golongan Darah" value={data.golongan_darah} />
              <InfoRow label="Tangan Dominan" value={data.tangan_dominan} />
              <InfoRow label="Ukuran Baju" value={data.ukuran_baju} />
              <InfoRow label="Lingkar Pinggang" value={data.lingkar_pinggang ? `${data.lingkar_pinggang} cm` : null} />
              <InfoRow label="Panjang Telapak Kaki" value={data.panjang_telapak_kaki ? `${data.panjang_telapak_kaki} cm` : null} />
              <InfoRow label="SIM" value={data.sim_dimiliki} />
              <InfoRow label="No. HP" value={data.nomor_hp} />
              <InfoRow label="Alamat" value={data.alamat_lengkap} />
              <InfoRow label="Kontak Orang Tua" value={data.kontak_ortu_nama ? `${data.kontak_ortu_nama} (${data.kontak_ortu_hp})` : null} />
            </CardContent>
          </Card>

          {/* Kesehatan */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle icon={User} title="Kondisi Fisik & Kesehatan" />
              <InfoRow label="Vaksin" value={bool(data.sudah_vaksin)} />
              <InfoRow label="Penglihatan" value={data.penglihatan_kanan ? `Kanan: ${data.penglihatan_kanan}, Kiri: ${data.penglihatan_kiri}` : null} />
              <InfoRow label="Berkacamata" value={bool(data.berkacamata)} />
              <InfoRow label="Lensa Kontak" value={bool(data.lensa_kontak)} />
              <InfoRow label="Buta Warna" value={bool(data.buta_warna)} />
              <InfoRow label="Kondisi Kesehatan" value={data.kondisi_kesehatan} />
              <InfoRow label="Riwayat Penyakit" value={data.riwayat_penyakit} />
              <InfoRow label="Bertato" value={bool(data.bertato)} />
              <InfoRow label="Merokok" value={bool(data.merokok)} />
              <InfoRow label="Minum Alkohol" value={bool(data.minum_alkohol)} />
              {data.minum_alkohol && <InfoRow label="Intensitas Alkohol" value={data.intensitas_alkohol} />}
            </CardContent>
          </Card>

          {/* Pendidikan */}
          {data.pendidikan?.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <SectionTitle icon={GraduationCap} title="Riwayat Pendidikan" />
                <div className="space-y-4">
                  {data.pendidikan.map((p: any, i: number) => (
                    <div key={i} className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{p.jenjang}</Badge>
                        {p.jurusan && <span className="text-sm text-muted-foreground">{p.jurusan}</span>}
                      </div>
                      <p className="font-medium text-sm">{p.nama_sekolah}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.bulan_masuk} {p.tahun_masuk} — {p.bulan_lulus} {p.tahun_lulus}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pengalaman Kerja */}
          {data.pengalaman?.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <SectionTitle icon={Briefcase} title="Pengalaman Kerja" />
                <div className="space-y-4">
                  {data.pengalaman.map((p: any, i: number) => (
                    <div key={i} className="border border-border rounded-lg p-4">
                      <p className="font-medium">{p.nama_perusahaan}</p>
                      <p className="text-sm text-muted-foreground">{p.posisi}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.bulan_masuk} {p.tahun_masuk} — {p.masih_bekerja ? 'Sekarang' : `${p.bulan_keluar} ${p.tahun_keluar}`}
                      </p>
                      {p.deskripsi_pekerjaan && <p className="text-sm mt-2 text-muted-foreground">{p.deskripsi_pekerjaan}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keluarga */}
          {data.keluarga?.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <SectionTitle icon={Users} title="Data Keluarga" />
                <InfoRow label="Penghasilan Keluarga/Bulan" value={data.penghasilan_keluarga ? `Rp ${Number(data.penghasilan_keluarga).toLocaleString('id-ID')}` : null} />
                <div className="mt-4 space-y-3">
                  {data.keluarga.map((k: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <Badge variant="outline" className="w-16 justify-center text-xs shrink-0">{k.hubungan}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{k.nama}</p>
                        <p className="text-xs text-muted-foreground">{k.usia ? `${k.usia} tahun` : ''}{k.usia && k.pekerjaan ? ' • ' : ''}{k.pekerjaan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jepang & Kemampuan */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle icon={Globe} title="Informasi Jepang & Kemampuan" />
              <InfoRow label="Pernah ke Jepang" value={bool(data.pernah_ke_jepang)} />
              <InfoRow label="Keluarga di Jepang" value={bool(data.keluarga_di_jepang)} />
              <InfoRow label="Level JLPT" value={data.level_jlpt} />
              <InfoRow label="Level JFT" value={data.level_jft} />
              <InfoRow label="Bidang SSW" value={data.sertifikat_ssw} />
              <InfoRow label="Lama Belajar Jepang" value={data.lama_belajar_jepang} />
              <InfoRow label="Level Bahasa Jepang" value={data.level_bahasa_jepang} />
            </CardContent>
          </Card>

          {/* Motivasi */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle icon={Target} title="Motivasi & Tujuan" />
              <InfoRow label="Tujuan ke Jepang" value={data.tujuan_ke_jepang} />
              <InfoRow label="Alasan ke Jepang" value={data.alasan_ke_jepang} />
              <InfoRow label="Citacita Setelah Jepang" value={data.cita_cita_setelah_jepang} />
              <InfoRow label="Rencana Kirim Uang/Bulan" value={data.rencana_pengiriman_uang ? `Rp ${Number(data.rencana_pengiriman_uang).toLocaleString('id-ID')}` : null} />
              <InfoRow label="Kelebihan Diri" value={data.kelebihan_diri} />
              <InfoRow label="Kekurangan Diri" value={data.kekurangan_diri} />
              <InfoRow label="Hobi" value={data.hobi} />
              <InfoRow label="Keahlian" value={data.keahlian} />
              <InfoRow label="Bersedia Shift" value={bool(data.bersedia_shift)} />
              <InfoRow label="Bersedia Lembur" value={bool(data.bersedia_lembur)} />
              <InfoRow label="Bersedia Hari Libur" value={bool(data.bersedia_hari_libur)} />
              <InfoRow label="Lama Tinggal di Jepang" value={data.lama_tinggal_jepang} />
              <InfoRow label="Lama Kerja di Perusahaan" value={data.lama_kerja_perusahaan} />
              <InfoRow label="Rencana Pulang" value={data.rencana_pulang} />
              <InfoRow label="Sumber Biaya" value={data.sumber_biaya} />
              <InfoRow label="Biaya Disiapkan" value={data.biaya_disiapkan} />
            </CardContent>
          </Card>

          {/* Dokumen */}
          {data.dokumen?.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <SectionTitle icon={Upload} title="Dokumen Pendukung" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.dokumen.map((d: any) => {
                    const labelMap: Record<string, string> = {
                      'sertifikat_jft': 'Sertifikat JFT',
                      'pas_foto': 'Pas Foto',
                      'foto_full_body': 'Foto Full Body',
                      'video_perkenalan': 'Video Perkenalan',
                      'kk': 'Kartu Keluarga (KK)',
                      'ktp': 'KTP',
                      'ijazah': 'Ijazah',
                      'akte': 'Akte Kelahiran',
                      'lainnya': 'Dokumen Lainnya',
                    }
                    let label = labelMap[d.jenis_dokumen] || d.jenis_dokumen.replace(/_/g, ' ')
                    let isSSW = d.jenis_dokumen.startsWith('ssw_')
                    if (isSSW) {
                      const sswArray = data.sertifikat_ssw ? data.sertifikat_ssw.split(',').map((s: string) => s.trim()) : []
                      const idx = parseInt(d.jenis_dokumen.split('_')[1]) - 1
                      const bidangSSW = sswArray[idx] || `SSW #${idx + 1}`
                      label = `SSW - ${bidangSSW}`
                    }
                    return (
                      <a key={d.id} href={`/${d.path_file}`} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group text-xs ${isSSW ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-border hover:border-primary/50'}`}>
                        {isSSW ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white shrink-0">
                            <span className="text-xs font-bold">SSW</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                            <FileText size={16} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium text-sm ${isSSW ? 'text-blue-700' : ''}`}>{label}</p>
                          <p className="text-muted-foreground text-xs truncate mt-0.5">{d.nama_file}</p>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Verifikasi & Progres Form - Sticky */}
          <div className="sticky top-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Verifikasi</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Status Formulir</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusFormulirConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Catatan Admin</Label>
                  <Textarea value={catatanAdmin} onChange={e => setCatatanAdmin(e.target.value)} placeholder="Tambahkan catatan..." rows={3} />
                </div>
                <Button className="w-full" onClick={handleUpdateStatus} disabled={updatingStatus}>
                  {updatingStatus && <Loader2 size={14} className="mr-2 animate-spin" />}
                  Simpan Status
                </Button>
              </CardContent>
            </Card>

            {/* Progres Kandidat Form */}
            <Card>
              <CardHeader><CardTitle className="text-base">Progres Kandidat</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Status Progres</Label>
                  <Select value={newProgres} onValueChange={setNewProgres}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(progresConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Catatan Progres</Label>
                  <Textarea value={catatanProgres} onChange={e => setCatatanProgres(e.target.value)} placeholder="Tambahkan catatan progres..." rows={3} />
                </div>
                <Button className="w-full" variant="outline" onClick={handleUpdateProgres} disabled={updatingProgres}>
                  {updatingProgres && <Loader2 size={14} className="mr-2 animate-spin" />}
                  Simpan Progres
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="text-xs text-muted-foreground">Update terakhir</div>
              <div className="text-sm font-medium">{formatDate(data.updated_at)}</div>
              {data.catatan_admin && (
                <>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">Catatan admin</div>
                  <div className="text-sm">{data.catatan_admin}</div>
                </>
              )}
              {data.catatan_progres && (
                <>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">Catatan progres</div>
                  <div className="text-sm">{data.catatan_progres}</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
