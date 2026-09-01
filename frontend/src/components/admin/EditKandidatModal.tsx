import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Textarea, Separator } from '@/components/ui/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import {
  Loader2, Save, User, Heart, GraduationCap, Briefcase,
  Star, Users, Globe, Target, Paperclip, Plus, Trash2, FileText, CheckCircle, Upload, KeyRound
} from 'lucide-react'

interface EditKandidatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kandidatId: number
  onSuccess: () => void
}

// ─── helpers ────────────────────────────────────────────────────────────────

const convertBool = (v: any) =>
  v === true || v === 1 || v === '1' ? true
  : v === false || v === 0 || v === '0' ? false
  : null

const BoolSelect = ({
  value, onChange, label, placeholder
}: {
  value: any
  onChange: (v: boolean) => void
  label?: string
  placeholder?: string
}) => (
  <Select
    value={value === true ? 'ya' : value === false ? 'tidak' : ''}
    onValueChange={v => onChange(v === 'ya')}
  >
    <SelectTrigger>
      <SelectValue placeholder={placeholder || label || 'Pilih...'} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="ya">Ya</SelectItem>
      <SelectItem value="tidak">Tidak</SelectItem>
    </SelectContent>
  </Select>
)

const months = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i))

const YearMonthPicker = ({ monthVal, yearVal, onMonthChange, onYearChange, placeholder = 'Bulan' }: any) => (
  <div className="flex gap-2">
    <Select value={monthVal || ''} onValueChange={onMonthChange}>
      <SelectTrigger className="flex-1"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
      </SelectContent>
    </Select>
    <Select value={yearVal ? String(yearVal) : ''} onValueChange={onYearChange}>
      <SelectTrigger className="w-28"><SelectValue placeholder="Tahun" /></SelectTrigger>
      <SelectContent>
        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
)

const SECTIONS = [
  { id: 1,  label: 'Data Diri',  icon: User },
  { id: 2,  label: 'Kesehatan', icon: Heart },
  { id: 3,  label: 'Pendidikan',icon: GraduationCap },
  { id: 4,  label: 'Pengalaman',icon: Briefcase },
  { id: 5,  label: 'Kemampuan', icon: Star },
  { id: 6,  label: 'Keluarga',  icon: Users },
  { id: 7,  label: 'Jepang',    icon: Globe },
  { id: 8,  label: 'Motivasi',  icon: Target },
  { id: 9,  label: 'Dokumen',   icon: Paperclip },
  { id: 10, label: 'Akses Akun', icon: KeyRound },
]

const DOKUMEN_TYPES = [
  { key: 'sertifikat_jft',  label: 'Sertifikat JFT',      optional: true },
  { key: 'pas_foto',        label: 'Pas Foto' },
  { key: 'foto_full_body',  label: 'Foto Full Body' },
  { key: 'kk',              label: 'Kartu Keluarga (KK)' },
  { key: 'ktp',             label: 'KTP' },
  { key: 'ijazah',          label: 'Ijazah' },
  { key: 'akte',            label: 'Akte Kelahiran' },
  { key: 'lainnya',         label: 'Dokumen Lainnya',      optional: true },
]

const SSW_OPTIONS = [
  'Pengolahan Makanan','Pertanian','Gaishoku','Kaigo (perawat)',
  'Building Cleaning','Restoran','Driver','Perhotelah',
  'Perikanan','Perbaikan dan perawatan mobil','Konstruksi',
]

// ─── component ──────────────────────────────────────────────────────────────

export default function EditKandidatModal({
  open, onOpenChange, kandidatId, onSuccess,
}: EditKandidatModalProps) {
  const [form, setForm]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [section, setSection] = useState(1)

  // ── load data ──
  useEffect(() => {
    if (!open || !kandidatId) return
    setLoading(true)
    api.get(`/kandidat/${kandidatId}`)
      .then(res => {
        const d = res.data.data
        setForm({
          ...d,
          pendidikan: d.pendidikan?.length ? d.pendidikan : [
            { jenjang: 'SD',              nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '' },
            { jenjang: 'SMP',             nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '' },
            { jenjang: 'SMA/SMK',         nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '', jurusan: '' },
            { jenjang: 'Perguruan Tinggi', nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '', jurusan: '' },
          ],
          pengalaman: d.pengalaman || [],
          keluarga: d.keluarga?.length ? d.keluarga : [
            { hubungan: 'Ayah', nama: '', usia: '', pekerjaan: '', penghasilan: '' },
            { hubungan: 'Ibu',  nama: '', usia: '', pekerjaan: '', penghasilan: '' },
            { hubungan: 'Suami',nama: '', usia: '', pekerjaan: '', penghasilan: '' },
            { hubungan: 'Istri',nama: '', usia: '', pekerjaan: '', penghasilan: '' },
          ],
          dokumen: d.dokumen || [],
          sertifikat_ssw: d.sertifikat_ssw
            ? typeof d.sertifikat_ssw === 'string'
              ? d.sertifikat_ssw.split(',').map((s: string) => s.trim()).filter(Boolean)
              : d.sertifikat_ssw
            : [],
          pernah_ke_jepang:    convertBool(d.pernah_ke_jepang),
          keluarga_di_jepang:  convertBool(d.keluarga_di_jepang),
          kenalan_di_jepang:   convertBool(d.kenalan_di_jepang),
          sudah_vaksin:        convertBool(d.sudah_vaksin),
          berkacamata:         convertBool(d.berkacamata),
          lensa_kontak:        convertBool(d.lensa_kontak),
          buta_warna:          convertBool(d.buta_warna),
          bertato:             convertBool(d.bertato),
          merokok:             convertBool(d.merokok),
          minum_alkohol:       convertBool(d.minum_alkohol),
          bersedia_shift:      convertBool(d.bersedia_shift),
          bersedia_lembur:     convertBool(d.bersedia_lembur),
          bersedia_hari_libur: convertBool(d.bersedia_hari_libur),
        })
      })
      .finally(() => setLoading(false))
  }, [open, kandidatId])

  // ── field updaters ──
  const updateField = (field: string, value: any) =>
    setForm((p: any) => ({ ...p, [field]: value }))

  const updatePendidikan = (i: number, field: string, value: any) =>
    setForm((p: any) => {
      const arr = [...p.pendidikan]; arr[i] = { ...arr[i], [field]: value }
      return { ...p, pendidikan: arr }
    })

  const updatePengalaman = (i: number, field: string, value: any) =>
    setForm((p: any) => {
      const arr = [...p.pengalaman]; arr[i] = { ...arr[i], [field]: value }
      return { ...p, pengalaman: arr }
    })

  const addPengalaman = () =>
    setForm((p: any) => ({
      ...p,
      pengalaman: [...p.pengalaman, {
        nama_perusahaan: '', alamat_perusahaan: '', posisi: '',
        bulan_masuk: '', tahun_masuk: '', bulan_keluar: '', tahun_keluar: '',
        masih_bekerja: false, deskripsi_pekerjaan: '',
      }],
    }))

  const removePengalaman = (i: number) =>
    setForm((p: any) => ({ ...p, pengalaman: p.pengalaman.filter((_: any, idx: number) => idx !== i) }))

  const updateKeluarga = (i: number, field: string, value: any) =>
    setForm((p: any) => {
      const arr = [...p.keluarga]; arr[i] = { ...arr[i], [field]: value }
      return { ...p, keluarga: arr }
    })

  const addKeluarga = (hubungan: string) =>
    setForm((p: any) => ({
      ...p,
      keluarga: [...p.keluarga, { hubungan, nama: '', usia: '', pekerjaan: '', penghasilan: '' }],
    }))

  const removeKeluarga = (i: number) =>
    setForm((p: any) => ({ ...p, keluarga: p.keluarga.filter((_: any, idx: number) => idx !== i) }))

  const toggleSSW = (val: string) =>
    setForm((p: any) => ({
      ...p,
      sertifikat_ssw: p.sertifikat_ssw.includes(val)
        ? p.sertifikat_ssw.filter((s: string) => s !== val)
        : [...p.sertifikat_ssw, val],
    }))

  // ── dokumen upload ──
  const [uploading, setUploading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const getFileUrl = (path_file: string) => {
    if (!path_file) return '#'

    const normalized = path_file.replace(/\\/g, '/').replace(/^\.\//, '')

    if (normalized.match(/^https?:\/\//)) return normalized
    if (normalized.startsWith('/')) return normalized
    if (normalized.startsWith('uploads/')) return `/${normalized}`

    const segments = normalized.split('/')
    if (segments[0] && segments[0].includes('.')) return `https://${normalized}`

    return `/uploads/${normalized}`
  }

  const handleUploadDokumen = async (jenis_dokumen: string, file: File) => {
    setUploading(jenis_dokumen)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jenis_dokumen', jenis_dokumen)

      const res = await api.post(`/kandidat/${kandidatId}/upload-dokumen?jenis_dokumen=${jenis_dokumen}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data.success) {
        toast({ title: 'Dokumen berhasil diupload', variant: 'success' as any })
        const updated = await api.get(`/kandidat/${kandidatId}`)
        setForm((p: any) => ({ ...p, dokumen: updated.data.data.dokumen }))
      }
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || 'Gagal upload dokumen',
        variant: 'destructive'
      })
    } finally {
      setUploading(null)
    }
  }

  const handleDeleteDokumen = async (jenis_dokumen: string) => {
    setDeleting(jenis_dokumen)
    try {
      const res = await api.delete(`/kandidat/${kandidatId}/dokumen?jenis_dokumen=${jenis_dokumen}`)

      if (res.data.success) {
        toast({ title: 'Dokumen berhasil dihapus', variant: 'success' as any })
        const updated = await api.get(`/kandidat/${kandidatId}`)
        setForm((p: any) => ({ ...p, dokumen: updated.data.data.dokumen }))
      }
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || 'Gagal hapus dokumen',
        variant: 'destructive'
      })
    } finally {
      setDeleting(null)
    }
  }

  // ── save ──
  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        sertifikat_ssw: Array.isArray(form.sertifikat_ssw)
          ? form.sertifikat_ssw.join(', ')
          : form.sertifikat_ssw || '',
      }
      await api.put(`/kandidat/${kandidatId}/update-profile`, payload)
      toast({ title: 'Data berhasil disimpan', variant: 'success' as any })
      onOpenChange(false)
      onSuccess()
    } catch {
      toast({ title: 'Gagal menyimpan data', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (!form && !loading) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Data Kandidat</DialogTitle>
        </DialogHeader>

        {/* ── section tabs ── */}
        <div className="flex gap-1.5 flex-wrap">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  section === s.id
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={13} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* ── scrollable content ── */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* ══════════════════════════════════════════════
                  SECTION 1 – DATA DIRI
              ══════════════════════════════════════════════ */}
              {section === 1 && (
                <div className="space-y-5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    📋 Data Diri
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nama Katakana</Label>
                      <Input value={form.nama_katakana || ''} onChange={e => updateField('nama_katakana', e.target.value)} placeholder="カタカナ" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nama Romaji</Label>
                      <Input value={form.nama_romaji || ''} onChange={e => updateField('nama_romaji', e.target.value)} placeholder="ROMAJI" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tempat Lahir</Label>
                      <Input value={form.tempat_lahir || ''} onChange={e => updateField('tempat_lahir', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tanggal Lahir</Label>
                      <Input type="date" value={form.tanggal_lahir?.split('T')[0] || ''} onChange={e => updateField('tanggal_lahir', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Umur</Label>
                      <Input type="number" value={form.umur || ''} onChange={e => updateField('umur', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Jenis Kelamin</Label>
                      <Select value={form.jenis_kelamin || ''} onValueChange={v => updateField('jenis_kelamin', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Status Pernikahan</Label>
                      <Select value={form.status_pernikahan || ''} onValueChange={v => updateField('status_pernikahan', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Menikah">Menikah</SelectItem>
                          <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.status_pernikahan === 'Menikah' && (
                      <div className="space-y-1.5">
                        <Label>Jumlah Anak</Label>
                        <Input type="number" value={form.jumlah_anak || 0} onChange={e => updateField('jumlah_anak', e.target.value)} />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label>Agama</Label>
                      <Select value={form.agama || ''} onValueChange={v => updateField('agama', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          {['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu','Lainnya'].map(a => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tinggi Badan (cm)</Label>
                      <Input type="number" value={form.tinggi_badan || ''} onChange={e => updateField('tinggi_badan', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Berat Badan (kg)</Label>
                      <Input type="number" value={form.berat_badan || ''} onChange={e => updateField('berat_badan', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Golongan Darah</Label>
                      <Select value={form.golongan_darah || ''} onValueChange={v => updateField('golongan_darah', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          {['A','B','AB','O','Tidak Tahu'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tangan Dominan</Label>
                      <Select value={form.tangan_dominan || ''} onValueChange={v => updateField('tangan_dominan', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kanan">Kanan</SelectItem>
                          <SelectItem value="Kiri">Kiri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ukuran Baju</Label>
                      <Select value={form.ukuran_baju || ''} onValueChange={v => updateField('ukuran_baju', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          {['S','M','L','XL','XXL','Lainnya'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Lingkar Pinggang (cm)</Label>
                      <Input type="number" value={form.lingkar_pinggang || ''} onChange={e => updateField('lingkar_pinggang', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Panjang Telapak Kaki (cm)</Label>
                      <Input type="number" step="0.5" value={form.panjang_telapak_kaki || ''} onChange={e => updateField('panjang_telapak_kaki', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>SIM yang Dimiliki</Label>
                      <Input value={form.sim_dimiliki || ''} onChange={e => updateField('sim_dimiliki', e.target.value)} placeholder="A, C" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pendidikan Terakhir</Label>
                      <Select value={form.pendidikan_terakhir || ''} onValueChange={v => updateField('pendidikan_terakhir', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          {['SD','SMP','SMA/SMK','Perguruan Tinggi'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">📍 Kontak & Alamat</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nomor HP</Label>
                      <Input value={form.nomor_hp || ''} onChange={e => updateField('nomor_hp', e.target.value)} placeholder="08xx-xxxx-xxxx" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email Kontak</Label>
                      <Input type="email" value={form.email_kontak || ''} onChange={e => updateField('email_kontak', e.target.value)} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Alamat Lengkap</Label>
                      <Textarea value={form.alamat_lengkap || ''} onChange={e => updateField('alamat_lengkap', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nama Orang Tua / Wali</Label>
                      <Input value={form.kontak_ortu_nama || ''} onChange={e => updateField('kontak_ortu_nama', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>No. HP Orang Tua</Label>
                      <Input value={form.kontak_ortu_hp || ''} onChange={e => updateField('kontak_ortu_hp', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 2 – KESEHATAN
              ══════════════════════════════════════════════ */}
              {section === 2 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">❤️ Kondisi Fisik & Kesehatan</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Sudah Vaksin?</Label>
                      <BoolSelect value={form.sudah_vaksin} onChange={v => updateField('sudah_vaksin', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kondisi Kesehatan</Label>
                      <Select value={form.kondisi_kesehatan || ''} onValueChange={v => updateField('kondisi_kesehatan', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sehat">Sehat</SelectItem>
                          <SelectItem value="Tidak Sehat">Tidak Sehat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Penglihatan Kanan</Label>
                      <Input value={form.penglihatan_kanan || ''} onChange={e => updateField('penglihatan_kanan', e.target.value)} placeholder="Normal / Minus -2.5" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Penglihatan Kiri</Label>
                      <Input value={form.penglihatan_kiri || ''} onChange={e => updateField('penglihatan_kiri', e.target.value)} placeholder="Normal / Minus -1.5" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Berkacamata?</Label>
                      <BoolSelect value={form.berkacamata} onChange={v => updateField('berkacamata', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Lensa Kontak?</Label>
                      <BoolSelect value={form.lensa_kontak} onChange={v => updateField('lensa_kontak', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Buta Warna?</Label>
                      <BoolSelect value={form.buta_warna} onChange={v => updateField('buta_warna', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bertato?</Label>
                      <BoolSelect value={form.bertato} onChange={v => updateField('bertato', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Merokok?</Label>
                      <BoolSelect value={form.merokok} onChange={v => updateField('merokok', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Minum Alkohol?</Label>
                      <BoolSelect value={form.minum_alkohol} onChange={v => updateField('minum_alkohol', v)} />
                    </div>
                    {form.minum_alkohol && (
                      <div className="space-y-1.5">
                        <Label>Intensitas Minum Alkohol</Label>
                        <Input value={form.intensitas_alkohol || ''} onChange={e => updateField('intensitas_alkohol', e.target.value)} placeholder="1-2x seminggu" />
                      </div>
                    )}
                    <div className="col-span-2 md:col-span-3 space-y-1.5">
                      <Label>Riwayat Penyakit / Cedera</Label>
                      <Textarea value={form.riwayat_penyakit || ''} onChange={e => updateField('riwayat_penyakit', e.target.value)} rows={3} placeholder="Isi 'Tidak ada' jika tidak ada" />
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 3 – PENDIDIKAN
              ══════════════════════════════════════════════ */}
              {section === 3 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">🎓 Pendidikan</p>
                  {form.pendidikan?.map((p: any, i: number) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <p className="font-semibold text-sm">{p.jenjang}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1.5">
                          <Label>Nama Sekolah / Universitas</Label>
                          <Input value={p.nama_sekolah || ''} onChange={e => updatePendidikan(i, 'nama_sekolah', e.target.value)} placeholder={`Nama ${p.jenjang}`} />
                        </div>
                        {(p.jenjang === 'SMA/SMK' || p.jenjang === 'Perguruan Tinggi') && (
                          <div className="col-span-2 space-y-1.5">
                            <Label>Jurusan</Label>
                            <Input value={p.jurusan || ''} onChange={e => updatePendidikan(i, 'jurusan', e.target.value)} placeholder="Jurusan / Prodi" />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label>Bulan & Tahun Masuk</Label>
                          <YearMonthPicker
                            monthVal={p.bulan_masuk} yearVal={p.tahun_masuk}
                            onMonthChange={(v: string) => updatePendidikan(i, 'bulan_masuk', v)}
                            onYearChange={(v: string)  => updatePendidikan(i, 'tahun_masuk', v)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Bulan & Tahun Lulus</Label>
                          <YearMonthPicker
                            monthVal={p.bulan_lulus} yearVal={p.tahun_lulus}
                            onMonthChange={(v: string) => updatePendidikan(i, 'bulan_lulus', v)}
                            onYearChange={(v: string)  => updatePendidikan(i, 'tahun_lulus', v)}
                            placeholder="Bulan Lulus"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 4 – PENGALAMAN KERJA
              ══════════════════════════════════════════════ */}
              {section === 4 && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">💼 Pengalaman Kerja</p>
                    <Button variant="outline" size="sm" onClick={addPengalaman}>
                      <Plus size={13} className="mr-1" />Tambah
                    </Button>
                  </div>
                  {form.pengalaman?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg text-gray-400">
                      <p className="text-sm">Belum ada pengalaman kerja</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={addPengalaman}>
                        <Plus size={13} className="mr-1" />Tambah Pengalaman
                      </Button>
                    </div>
                  )}
                  {form.pengalaman?.map((p: any, i: number) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">Pengalaman #{i + 1}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => removePengalaman(i)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Nama Perusahaan</Label>
                          <Input value={p.nama_perusahaan || ''} onChange={e => updatePengalaman(i, 'nama_perusahaan', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Posisi / Bidang</Label>
                          <Input value={p.posisi || ''} onChange={e => updatePengalaman(i, 'posisi', e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label>Alamat Perusahaan</Label>
                          <Input value={p.alamat_perusahaan || ''} onChange={e => updatePengalaman(i, 'alamat_perusahaan', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Bulan & Tahun Masuk</Label>
                          <YearMonthPicker
                            monthVal={p.bulan_masuk} yearVal={p.tahun_masuk}
                            onMonthChange={(v: string) => updatePengalaman(i, 'bulan_masuk', v)}
                            onYearChange={(v: string)  => updatePengalaman(i, 'tahun_masuk', v)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label>Bulan & Tahun Keluar</Label>
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!p.masih_bekerja}
                                onChange={e => updatePengalaman(i, 'masih_bekerja', e.target.checked)}
                              />
                              Masih bekerja
                            </label>
                          </div>
                          {!p.masih_bekerja && (
                            <YearMonthPicker
                              monthVal={p.bulan_keluar} yearVal={p.tahun_keluar}
                              onMonthChange={(v: string) => updatePengalaman(i, 'bulan_keluar', v)}
                              onYearChange={(v: string)  => updatePengalaman(i, 'tahun_keluar', v)}
                              placeholder="Bulan Keluar"
                            />
                          )}
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label>Deskripsi Pekerjaan</Label>
                          <Textarea value={p.deskripsi_pekerjaan || ''} onChange={e => updatePengalaman(i, 'deskripsi_pekerjaan', e.target.value)} rows={2} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 5 – KEMAMPUAN
              ══════════════════════════════════════════════ */}
              {section === 5 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">⭐ Kemampuan & Sertifikat</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Level JLPT</Label>
                      <Select value={form.level_jlpt || ''} onValueChange={v => updateField('level_jlpt', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih level..." /></SelectTrigger>
                        <SelectContent>
                          {['N1','N2','N3','N4','N5','Belum ada'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Level JFT</Label>
                      <Select value={form.level_jft || ''} onValueChange={v => updateField('level_jft', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih level..." /></SelectTrigger>
                        <SelectContent>
                          {['A1','A2','B1','B2','Belum ada'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Lama Belajar Bahasa Jepang</Label>
                      <Input value={form.lama_belajar_jepang || ''} onChange={e => updateField('lama_belajar_jepang', e.target.value)} placeholder="6 bulan, 1 tahun, dll." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Level Bahasa Jepang (Umum)</Label>
                      <Select value={form.level_bahasa_jepang || ''} onValueChange={v => updateField('level_bahasa_jepang', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dasar">Dasar</SelectItem>
                          <SelectItem value="Menengah">Menengah</SelectItem>
                          <SelectItem value="Lancar">Lancar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>ID Prometric</Label>
                      <Input value={form.id_prometric || ''} onChange={e => updateField('id_prometric', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Password Prometric</Label>
                      <Input value={form.password_prometric || ''} onChange={e => updateField('password_prometric', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sertifikat SSW yang Dimiliki</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {SSW_OPTIONS.map(s => (
                        <label key={s} className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={form.sertifikat_ssw?.includes(s) || false}
                            onChange={() => toggleSSW(s)}
                          />
                          <span className="text-sm">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 6 – KELUARGA
              ══════════════════════════════════════════════ */}
              {section === 6 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">👨‍👩‍👧 Data Keluarga</p>
                  <div className="space-y-1.5 max-w-xs">
                    <Label>Penghasilan Keluarga / Bulan (Rp)</Label>
                    <Input type="number" value={form.penghasilan_keluarga || ''} onChange={e => updateField('penghasilan_keluarga', e.target.value)} placeholder="5000000" />
                  </div>
                  <Separator />
                  {['Ayah','Ibu','Suami','Istri','Kakak','Adik'].map(hubungan => {
                    const members = form.keluarga.filter((k: any) => k.hubungan === hubungan)
                    const canAdd  = ['Kakak','Adik','Suami','Istri'].includes(hubungan)
                    return (
                      <div key={hubungan} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{hubungan}</p>
                          {canAdd && (
                            <Button variant="outline" size="sm" onClick={() => addKeluarga(hubungan)}>
                              <Plus size={13} className="mr-1" />Tambah {hubungan}
                            </Button>
                          )}
                        </div>
                        {members.map((m: any, mi: number) => {
                          const globalIdx = form.keluarga.findIndex(
                            (k: any, idx: number) =>
                              k.hubungan === hubungan &&
                              form.keluarga.slice(0, idx + 1).filter((kk: any) => kk.hubungan === hubungan).length === mi + 1
                          )
                          return (
                            <div key={mi} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-gray-400 font-mono">{hubungan} {mi > 0 ? mi + 1 : ''}</span>
                                {canAdd && (
                                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => removeKeluarga(globalIdx)}>
                                    <Trash2 size={12} />
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                  <Label>Nama</Label>
                                  <Input value={m.nama || ''} onChange={e => updateKeluarga(globalIdx, 'nama', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Usia</Label>
                                  <Input type="number" value={m.usia || ''} onChange={e => updateKeluarga(globalIdx, 'usia', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Pekerjaan</Label>
                                  <Input value={m.pekerjaan || ''} onChange={e => updateKeluarga(globalIdx, 'pekerjaan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Penghasilan/Bulan</Label>
                                  <Input type="number" value={m.penghasilan || ''} onChange={e => updateKeluarga(globalIdx, 'penghasilan', e.target.value)} placeholder="Rp" />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {members.length === 0 && !canAdd && (
                          <p className="text-sm text-gray-400 italic">Belum ada data {hubungan}</p>
                        )}
                        {members.length === 0 && canAdd && (
                          <p className="text-sm text-gray-400 italic">Belum ada. Klik tombol untuk menambah.</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 7 – INFORMASI JEPANG
              ══════════════════════════════════════════════ */}
              {section === 7 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">🇯🇵 Informasi Jepang</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Pernah ke Jepang?</Label>
                      <BoolSelect value={form.pernah_ke_jepang} onChange={v => updateField('pernah_ke_jepang', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Punya Keluarga di Jepang?</Label>
                      <BoolSelect value={form.keluarga_di_jepang} onChange={v => updateField('keluarga_di_jepang', v)} />
                    </div>
                    {form.keluarga_di_jepang && (
                      <>
                        <div className="space-y-1.5">
                          <Label>Hubungan Keluarga di Jepang</Label>
                          <Input value={form.hubungan_keluarga_jepang || ''} onChange={e => updateField('hubungan_keluarga_jepang', e.target.value)} placeholder="Kakak, Ayah, dll." />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Status Kerabat di Jepang</Label>
                          <Input value={form.status_kerabat_jepang || ''} onChange={e => updateField('status_kerabat_jepang', e.target.value)} placeholder="TG, Magang, dll." />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label>Kontak Keluarga di Jepang</Label>
                          <Input value={form.kontak_keluarga_jepang || ''} onChange={e => updateField('kontak_keluarga_jepang', e.target.value)} />
                        </div>
                      </>
                    )}
                    <div className="space-y-1.5">
                      <Label>Punya Kenalan di Jepang?</Label>
                      <BoolSelect value={form.kenalan_di_jepang} onChange={v => updateField('kenalan_di_jepang', v)} />
                    </div>
                    {form.kenalan_di_jepang && (
                      <div className="col-span-2 space-y-1.5">
                        <Label>Detail Kenalan (Nama, Alamat, Kontak)</Label>
                        <Textarea value={form.kenalan_jepang_detail || ''} onChange={e => updateField('kenalan_jepang_detail', e.target.value)} rows={3} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 8 – MOTIVASI
              ══════════════════════════════════════════════ */}
              {section === 8 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">🎯 Motivasi & Tujuan</p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label>Tujuan ke Jepang</Label>
                      <Textarea value={form.tujuan_ke_jepang || ''} onChange={e => updateField('tujuan_ke_jepang', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Alasan Ingin ke Jepang</Label>
                      <Textarea value={form.alasan_ke_jepang || ''} onChange={e => updateField('alasan_ke_jepang', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cita-cita Setelah Pulang dari Jepang</Label>
                      <Textarea value={form.cita_cita_setelah_jepang || ''} onChange={e => updateField('cita_cita_setelah_jepang', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Rencana Pengiriman Uang/Bulan ke Indonesia (Rp)</Label>
                      <Input type="number" value={form.rencana_pengiriman_uang || ''} onChange={e => updateField('rencana_pengiriman_uang', e.target.value)} placeholder="3000000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kelebihan Diri</Label>
                      <Textarea value={form.kelebihan_diri || ''} onChange={e => updateField('kelebihan_diri', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kekurangan Diri</Label>
                      <Textarea value={form.kekurangan_diri || ''} onChange={e => updateField('kekurangan_diri', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hobi</Label>
                      <Textarea value={form.hobi || ''} onChange={e => updateField('hobi', e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Keahlian</Label>
                      <Textarea value={form.keahlian || ''} onChange={e => updateField('keahlian', e.target.value)} rows={2} />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">🔧 Kesediaan Kerja & Rencana</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Bersedia Kerja Shift?</Label>
                      <BoolSelect value={form.bersedia_shift} onChange={v => updateField('bersedia_shift', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bersedia Lembur?</Label>
                      <BoolSelect value={form.bersedia_lembur} onChange={v => updateField('bersedia_lembur', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bersedia Kerja Hari Libur?</Label>
                      <BoolSelect value={form.bersedia_hari_libur} onChange={v => updateField('bersedia_hari_libur', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Lama Ingin Tinggal di Jepang</Label>
                      <Select value={form.lama_tinggal_jepang || ''} onValueChange={v => updateField('lama_tinggal_jepang', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2-3 tahun">2-3 tahun</SelectItem>
                          <SelectItem value="3-5 tahun">3-5 tahun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Lama Ingin Bekerja di Perusahaan</Label>
                      <Select value={form.lama_kerja_perusahaan || ''} onValueChange={v => updateField('lama_kerja_perusahaan', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2 tahun">1-2 tahun</SelectItem>
                          <SelectItem value="2-3 tahun">2-3 tahun</SelectItem>
                          <SelectItem value="3-5 tahun">3-5 tahun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Rencana Pulang ke Indonesia (5 tahun)</Label>
                      <Select value={form.rencana_pulang || ''} onValueChange={v => updateField('rencana_pulang', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2 kali">1-2 kali</SelectItem>
                          <SelectItem value="3-4 kali">3-4 kali</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sumber Biaya Keberangkatan</Label>
                      <Select value={form.sumber_biaya || ''} onValueChange={v => updateField('sumber_biaya', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dana Pribadi">Dana Pribadi</SelectItem>
                          <SelectItem value="Dana Talang LPK">Dana Talang LPK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Biaya yang Disiapkan</Label>
                      <Select value={form.biaya_disiapkan || ''} onValueChange={v => updateField('biaya_disiapkan', v)}>
                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10-20 Juta">10-20 Juta</SelectItem>
                          <SelectItem value="20-30 Juta">20-30 Juta</SelectItem>
                          <SelectItem value="40-50 Juta">40-50 Juta</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 9 – DOKUMEN (with upload)
              ══════════════════════════════════════════════ */}
              {section === 9 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">📎 Dokumen Kandidat</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {DOKUMEN_TYPES.map(dt => {
                      const doc = form.dokumen?.find((d: any) => d.jenis_dokumen === dt.key)
                      const isUploading = uploading === dt.key
                      const isDeleting = deleting === dt.key
                      return (
                        <div
                          key={dt.key}
                          className={`border rounded-lg p-4 ${doc ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {doc
                                ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                : <FileText size={14} className="text-gray-400 shrink-0" />
                              }
                              <p className="font-medium text-sm">{dt.label}{!dt.optional && ' *'}</p>
                            </div>
                          </div>
                          {doc ? (
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 truncate">{doc.nama_file}</p>
                                {doc.path_file && (
                                  <a
                                    href={getFileUrl(doc.path_file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 underline mt-1 inline-block"
                                  >
                                    Lihat File
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-1 ml-2 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:text-destructive"
                                  onClick={() => handleDeleteDokumen(dt.key)}
                                  disabled={isDeleting || isUploading}
                                  title="Hapus dokumen"
                                >
                                  {isDeleting
                                    ? <Loader2 size={13} className="animate-spin" />
                                    : <Trash2 size={13} />
                                  }
                                </Button>
                                <input
                                  type="file"
                                  id={`file-${dt.key}`}
                                  className="hidden"
                                  accept="image/jpeg,image/png,application/pdf,video/mp4"
                                  onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUploadDokumen(dt.key, file)
                                    e.target.value = ''
                                  }}
                                  disabled={isUploading}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => document.getElementById(`file-${dt.key}`)?.click()}
                                  disabled={isUploading || isDeleting}
                                >
                                  {isUploading
                                    ? <Loader2 size={12} className="animate-spin mr-1" />
                                    : <Upload size={12} className="mr-1" />
                                  }
                                  {isUploading ? 'Uploading...' : 'Ganti'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-400">Belum diupload</p>
                              <input
                                type="file"
                                id={`file-${dt.key}`}
                                className="hidden"
                                accept="image/jpeg,image/png,application/pdf,video/mp4"
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file) handleUploadDokumen(dt.key, file)
                                  e.target.value = ''
                                }}
                                disabled={isUploading}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => document.getElementById(`file-${dt.key}`)?.click()}
                                disabled={isUploading}
                              >
                                {isUploading
                                  ? <Loader2 size={12} className="animate-spin mr-1" />
                                  : <Upload size={12} className="mr-1" />
                                }
                                {isUploading ? 'Uploading...' : 'Upload'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  SECTION 10 – AKSES AKUN
              ══════════════════════════════════════════════ */}
              {section === 10 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">🔑 Akses Akun</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nama (untuk login)</Label>
                      <Input value={form.nama || form.nama_romaji || ''} readOnly />
                      <p className="text-xs text-gray-400">Login dapat memakai nama atau email</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={form.email || ''} readOnly />
                      <p className="text-xs text-gray-400">Email login kandidat (tidak dapat diubah di sini)</p>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Password (Default)</Label>
                      <Input value={form.password_akun || ''} onChange={e => updateField('password_akun', e.target.value)} placeholder="12345678" />
                      <p className="text-xs text-gray-400">Jika kosong, password default = 12345678. Jika password salah, berarti sudah diganti oleh pemilik akun.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
            <Save size={14} className="mr-2" />
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}