import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Card, CardContent, Textarea, Badge, Separator } from '@/components/ui/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { 
  Save, Send, ChevronLeft, ChevronRight, Plus, Trash2, Loader2, Upload, 
  CheckCircle, FileText, User, Heart, GraduationCap, Briefcase, Star, 
  Users, Globe, Target, Paperclip, Phone, Mail, MapPin, Calendar, 
  Droplets, Ruler, Scale, Shield, CreditCard, Home, HeartHandshake, Eye, 
  Glasses, CloudRain, Cigarette, Wine, Plane, Award, Languages, GraduationCap as Cert
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Data Diri', icon: User },
  { id: 2, label: 'Kesehatan', icon: Heart },
  { id: 3, label: 'Pendidikan', icon: GraduationCap },
  { id: 4, label: 'Pengalaman', icon: Briefcase },
  { id: 5, label: 'Kemampuan', icon: Star },
  { id: 6, label: 'Keluarga', icon: Users },
  { id: 7, label: 'Jepang', icon: Globe },
  { id: 8, label: 'Motivasi', icon: Target },
  { id: 9, label: 'Dokumen', icon: Paperclip },
]

const BoolSelect = ({ value, onChange, label, error }: { value: any; onChange: (v: boolean) => void; label?: string; error?: boolean }) => (
  <Select value={value === true || value === 1 ? 'ya' : value === false || value === 0 ? 'tidak' : ''} onValueChange={v => onChange(v === 'ya')}>
    <SelectTrigger error={error}><SelectValue placeholder={label || 'Pilih...'} /></SelectTrigger>
    <SelectContent><SelectItem value="ya">Ya</SelectItem><SelectItem value="tidak">Tidak</SelectItem></SelectContent>
  </Select>
)

const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i))

const YearMonthPicker = ({ monthVal, yearVal, onMonthChange, onYearChange, placeholder = 'Bulan' }: any) => (
  <div className="flex gap-2">
    <Select value={monthVal || ''} onValueChange={onMonthChange}>
      <SelectTrigger className="flex-1"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
    </Select>
    <Select value={yearVal ? String(yearVal) : ''} onValueChange={onYearChange}>
      <SelectTrigger className="w-28"><SelectValue placeholder="Tahun" /></SelectTrigger>
      <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
    </Select>
  </div>
)

const dokumenTypes = [
  { key: 'sertifikat_jft', label: 'Sertifikat JFT', optional: true },
  { key: 'pas_foto', label: 'Pas Foto' },
  { key: 'foto_full_body', label: 'Foto Full Body' },
  { key: 'kk', label: 'Kartu Keluarga (KK)' },
  { key: 'ktp', label: 'KTP' },
  { key: 'ijazah', label: 'Ijazah' },
  { key: 'akte', label: 'Akte Kelahiran' },
  { key: 'lainnya', label: 'Dokumen Lainnya', optional: true },
]

const ssw_options = [
  'Pengolahan Makanan',
  'Pertanian',
  'Kaigo (perawat)',
  'Building Cleaning',
  'Restoran',
  'Driver'
];

const REQUIRED_DOCS = ['pas_foto', 'foto_full_body', 'kk', 'ktp', 'ijazah', 'akte']

export default function FormulirPage() {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [profil, setProfil] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [sertifikatSsw, setSertifikatSsw] = useState<any[]>([{ id: null, nama_file: '', file: null }])
  const [form, setForm] = useState<any>({
    pendidikan_terakhir: '',
    pendidikan: [
      { jenjang: 'SD', nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '' },
      { jenjang: 'SMP', nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '' },
      { jenjang: 'SMA/SMK', nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '', jurusan: '' },
      { jenjang: 'Perguruan Tinggi', nama_sekolah: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '', jurusan: '' },
    ],
    pengalaman: [],
    keluarga: [
      { hubungan: 'Ayah', nama: '', usia: '', pekerjaan: '', urutan: 1 },
      { hubungan: 'Ibu', nama: '', usia: '', pekerjaan: '', urutan: 1 },
    ],
    sertifikat_ssw: [],
  })

  useEffect(() => {
    api.get('/kandidat/my-profile').then(r => {
      const d = r.data.data
      setProfil(d)
      const convertBool = (v: any) => v === true || v === 1 || v === '1' ? true : v === false || v === 0 || v === '0' ? false : null
      setForm((p: any) => ({
        ...p, ...d,
        pernah_ke_jepang: convertBool(d.pernah_ke_jepang),
        keluarga_di_jepang: convertBool(d.keluarga_di_jepang),
        kenalan_di_jepang: convertBool(d.kenalan_di_jepang),
        sudah_vaksin: convertBool(d.sudah_vaksin),
        berkacamata: convertBool(d.berkacamata),
        lensa_kontak: convertBool(d.lensa_kontak),
        buta_warna: convertBool(d.buta_warna),
        bertato: convertBool(d.bertato),
        merokok: convertBool(d.merokok),
        minum_alkohol: convertBool(d.minum_alkohol),
        bersedia_shift: convertBool(d.bersedia_shift),
        bersedia_lembur: convertBool(d.bersedia_lembur),
        bersedia_hari_libur: convertBool(d.bersedia_hari_libur),
        pendidikan: d.pendidikan?.length ? d.pendidikan : p.pendidikan,
        pengalaman: d.pengalaman?.length ? d.pengalaman : p.pengalaman,
        keluarga: d.keluarga?.length ? d.keluarga : p.keluarga,
        sertifikat_ssw: d.sertifikat_ssw ? (typeof d.sertifikat_ssw === 'string' ? d.sertifikat_ssw.split(',').map((s: string) => s.trim()).filter(Boolean) : d.sertifikat_ssw) : [],
        dokumen: d.dokumen || [],
      }))
    })
  }, [])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p: any) => ({ ...p, [key]: e.target.value }))
    setTouched((t: any) => ({ ...t, [key]: true }))
    if (errors[key]) setErrors((er: any) => { const n = {...er}; delete n[key]; return n })
  }
  const setBool = (key: string) => (v: boolean) => {
    setForm((p: any) => ({ ...p, [key]: v }))
    setTouched((t: any) => ({ ...t, [key]: true }))
    if (errors[key]) setErrors((er: any) => { const n = {...er}; delete n[key]; return n })
  }
  const setSel = (key: string) => (v: string) => {
    setForm((p: any) => ({ ...p, [key]: v }))
    setTouched((t: any) => ({ ...t, [key]: true }))
    if (errors[key]) setErrors((er: any) => { const n = {...er}; delete n[key]; return n })
  }

  const setPendidikan = (i: number, key: string, v: string) => {
    setForm((p: any) => { const arr = [...p.pendidikan]; arr[i] = { ...arr[i], [key]: v }; return { ...p, pendidikan: arr } })
    setTouched((t: any) => ({ ...t, [`pendidikan_${i}_${key}`]: true }))
    if (errors[`pendidikan_${i}_${key}`]) setErrors((er: any) => { const n = {...er}; delete n[`pendidikan_${i}_${key}`]; return n })
  }
  const setPengalaman = (i: number, key: string, v: any) => {
    setForm((p: any) => { const arr = [...p.pengalaman]; arr[i] = { ...arr[i], [key]: v }; return { ...p, pengalaman: arr } })
  }
  const setKeluarga = (i: number, key: string, v: string) => {
    setForm((p: any) => { const arr = [...p.keluarga]; arr[i] = { ...arr[i], [key]: v }; return { ...p, keluarga: arr } })
  }

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}
    const isEmpty = (val: any) => val === undefined || val === null || val === ''
    
    if (stepNum === 1) {
      if (isEmpty(form.nama_katakana)) newErrors.nama_katakana = 'Nama Katakana wajib diisi'
      if (isEmpty(form.nama_romaji)) newErrors.nama_romaji = 'Nama Romaji wajib diisi'
      if (isEmpty(form.tempat_lahir)) newErrors.tempat_lahir = 'Tempat lahir wajib diisi'
      if (isEmpty(form.tanggal_lahir)) newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi'
      if (isEmpty(form.umur)) newErrors.umur = 'Umur wajib diisi'
      if (isEmpty(form.jenis_kelamin)) newErrors.jenis_kelamin = 'Jenis kelamin wajib dipilih'
      if (isEmpty(form.status_pernikahan)) newErrors.status_pernikahan = 'Status pernikahan wajib dipilih'
      if (isEmpty(form.agama)) newErrors.agama = 'Agama wajib dipilih'
      if (isEmpty(form.tinggi_badan)) newErrors.tinggi_badan = 'Tinggi badan wajib diisi'
      if (isEmpty(form.berat_badan)) newErrors.berat_badan = 'Berat badan wajib diisi'
      if (isEmpty(form.golongan_darah)) newErrors.golongan_darah = 'Golongan darah wajib dipilih'
      if (isEmpty(form.tangan_dominan)) newErrors.tangan_dominan = 'Tangan dominan wajib dipilih'
      if (isEmpty(form.ukuran_baju)) newErrors.ukuran_baju = 'Ukuran baju wajib dipilih'
      if (isEmpty(form.nomor_hp)) newErrors.nomor_hp = 'Nomor HP wajib diisi'
      if (isEmpty(form.email_kontak)) newErrors.email_kontak = 'Email wajib diisi'
      if (isEmpty(form.alamat_lengkap)) newErrors.alamat_lengkap = 'Alamat lengkap wajib diisi'
      if (isEmpty(form.kontak_ortu_nama)) newErrors.kontak_ortu_nama = 'Nama orang tua/wali wajib diisi'
      if (isEmpty(form.kontak_ortu_hp)) newErrors.kontak_ortu_hp = 'No. HP orang tua wajib diisi'
    }
    
    if (stepNum === 2) {
      if (form.sudah_vaksin === undefined || form.sudah_vaksin === null || form.sudah_vaksin === '') newErrors.sudah_vaksin = 'Pilih sudah/tidak vaksin'
      if (isEmpty(form.kondisi_kesehatan)) newErrors.kondisi_kesehatan = 'Kondisi kesehatan wajib dipilih'
      if (form.berkacamata === undefined || form.berkacamata === null || form.berkacamata === '' || form.berkacamata === 0) newErrors.berkacamata = 'Pilih ya/tidak'
      if (form.lensa_kontak === undefined || form.lensa_kontak === null || form.lensa_kontak === '' || form.lensa_kontak === 0) newErrors.lensa_kontak = 'Pilih ya/tidak'
      if (form.buta_warna === undefined || form.buta_warna === null || form.buta_warna === '' || form.buta_warna === 0) newErrors.buta_warna = 'Pilih ya/tidak'
      if (form.bertato === undefined || form.bertato === null || form.bertato === '' || form.bertato === 0) newErrors.bertato = 'Pilih ya/tidak'
      if (form.merokok === undefined || form.merokok === null || form.merokok === '' || form.merokok === 0) newErrors.merokok = 'Pilih ya/tidak'
      if (form.minum_alkohol === undefined || form.minum_alkohol === null || form.minum_alkohol === '' || form.minum_alkohol === 0) newErrors.minum_alkohol = 'Pilih ya/tidak'
      if (isEmpty(form.riwayat_penyakit)) newErrors.riwayat_penyakit = 'Riwayat penyakit wajib diisi (isi "Tidak ada" jika tidak ada)'
    }
    
    if (stepNum === 3) {
      const jenjangWajib = ['SD', 'SMP']
      form.pendidikan.forEach((p: any, i: number) => {
        if (jenjangWajib.includes(p.jenjang)) {
          if (isEmpty(p.nama_sekolah)) newErrors[`pendidikan_${i}_nama_sekolah`] = `Nama ${p.jenjang} wajib diisi`
          if (isEmpty(p.bulan_masuk)) newErrors[`pendidikan_${i}_bulan_masuk`] = 'Bulan masuk wajib dipilih'
          if (isEmpty(p.tahun_masuk)) newErrors[`pendidikan_${i}_tahun_masuk`] = 'Tahun masuk wajib dipilih'
          if (isEmpty(p.bulan_lulus)) newErrors[`pendidikan_${i}_bulan_lulus`] = 'Bulan lulus wajib dipilih'
          if (isEmpty(p.tahun_lulus)) newErrors[`pendidikan_${i}_tahun_lulus`] = 'Tahun lulus wajib dipilih'
        }
      })
    }
    
    if (stepNum === 5) {
      if (isEmpty(form.level_jlpt)) newErrors.level_jlpt = 'Level JLPT wajib dipilih'
      if (isEmpty(form.lama_belajar_jepang)) newErrors.lama_belajar_jepang = 'Lama belajar Jepang wajib diisi'
      if (isEmpty(form.level_bahasa_jepang)) newErrors.level_bahasa_jepang = 'Level bahasa Jepang wajib dipilih'
    }
    
    if (stepNum === 6) {
      if (isEmpty(form.penghasilan_keluarga)) newErrors.penghasilan_keluarga = 'Penghasilan keluarga wajib diisi'
      const ayah = form.keluarga.find((k: any) => k.hubungan === 'Ayah')
      const ibu = form.keluarga.find((k: any) => k.hubungan === 'Ibu')
      if (!ayah || isEmpty(ayah.nama)) newErrors.keluarga_ayah_nama = 'Nama Ayah wajib diisi'
      if (ayah && isEmpty(ayah.usia)) newErrors.keluarga_ayah_usia = 'Usia Ayah wajib diisi'
      if (ayah && isEmpty(ayah.pekerjaan)) newErrors.keluarga_ayah_pekerjaan = 'Pekerjaan Ayah wajib diisi'
      if (!ibu || isEmpty(ibu.nama)) newErrors.keluarga_ibu_nama = 'Nama Ibu wajib diisi'
      if (ibu && isEmpty(ibu.usia)) newErrors.keluarga_ibu_usia = 'Usia Ibu wajib diisi'
      if (ibu && isEmpty(ibu.pekerjaan)) newErrors.keluarga_ibu_pekerjaan = 'Pekerjaan Ibu wajib diisi'
    }
    
    if (stepNum === 7) {
    }
    
    if (stepNum === 8) {
      if (isEmpty(form.tujuan_ke_jepang)) newErrors.tujuan_ke_jepang = 'Tujuan ke Jepang wajib diisi'
      if (isEmpty(form.alasan_ke_jepang)) newErrors.alasan_ke_jepang = 'Alasan ingin ke Jepang wajib diisi'
      if (isEmpty(form.cita_cita_setelah_jepang)) newErrors.cita_cita_setelah_jepang = 'Cita-cita setelah pulang wajib diisi'
      if (isEmpty(form.rencana_pengiriman_uang)) newErrors.rencana_pengiriman_uang = 'Rencana pengiriman uang wajib diisi'
      if (isEmpty(form.kelebihan_diri)) newErrors.kelebihan_diri = 'Kelebihan diri wajib diisi'
      if (isEmpty(form.kekurangan_diri)) newErrors.kekurangan_diri = 'Kekurangan diri wajib diisi'
      if (isEmpty(form.hobi)) newErrors.hobi = 'Hobi wajib diisi'
      if (isEmpty(form.keahlian)) newErrors.keahlian = 'Keahlian wajib diisi'
    }
    
    if (stepNum === 9) {
      const missing = REQUIRED_DOCS.filter(d => !form.dokumen?.find((doc: any) => doc.jenis_dokumen === d))
      if (missing.length > 0) newErrors.dokumen = `${missing.length} dokumen belum diupload`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addPengalaman = () => setForm((p: any) => ({ ...p, pengalaman: [...p.pengalaman, { nama_perusahaan: '', alamat_perusahaan: '', posisi: '', bulan_masuk: '', tahun_masuk: '', bulan_keluar: '', tahun_keluar: '', masih_bekerja: false, deskripsi_pekerjaan: '' }] }))
  const removePengalaman = (i: number) => setForm((p: any) => ({ ...p, pengalaman: p.pengalaman.filter((_: any, idx: number) => idx !== i) }))

  const addKeluarga = (hubungan: string) => {
    const existing = form.keluarga.filter((k: any) => k.hubungan === hubungan).length
    setForm((p: any) => ({ ...p, keluarga: [...p.keluarga, { hubungan, nama: '', usia: '', pekerjaan: '', urutan: existing + 1 }] }))
  }
  const removeKeluarga = (i: number) => setForm((p: any) => ({ ...p, keluarga: p.keluarga.filter((_: any, idx: number) => idx !== i) }))

  const toggleSSW = (val: string) => setForm((p: any) => ({
    ...p,
    sertifikat_ssw: p.sertifikat_ssw.includes(val) ? p.sertifikat_ssw.filter((s: string) => s !== val) : [...p.sertifikat_ssw, val]
  }))

  const addSertifikatSsw = () => setSertifikatSsw(p => [...p, { id: null, nama_file: '', file: null }])
  const removeSertifikatSsw = (i: number) => setSertifikatSsw(p => p.filter((_: any, idx: number) => idx !== i))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, sertifikat_ssw: form.sertifikat_ssw?.join(', ') || '' }
      await api.put('/kandidat/my-profile', payload)
      toast({ title: 'Data berhasil disimpan', variant: 'success' as any })
    } catch {
      toast({ title: 'Gagal menyimpan', variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.put('/kandidat/my-profile', { ...form, sertifikat_ssw: form.sertifikat_ssw?.join(', ') || '' })
      await api.post('/kandidat/submit')
      toast({ title: 'Formulir berhasil dikirim! ✨', description: 'Admin akan segera memproses data Anda', variant: 'success' as any })
      setProfil((p: any) => ({ ...p, status_formulir: 'submitted' }))
      setForm((p: any) => ({ ...p, status_formulir: 'submitted' }))
    } catch {
      toast({ title: 'Gagal mengirim formulir', variant: 'destructive' })
    } finally { setSubmitting(false) }
  }

  const handleUpload = async (jenis: string, file: File, sswIndex?: number) => {
    setUploadingKey(jenis)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('jenis_dokumen', jenis)
    try {
      await api.post('/kandidat/upload-dokumen', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 })
      toast({ title: 'Dokumen berhasil diupload', variant: 'success' as any })
      if (sswIndex !== undefined) {
        setSertifikatSsw((p: any) => {
          const arr = [...p]
          arr[sswIndex] = { ...arr[sswIndex], nama_file: file.name, file }
          return arr
        })
      } else {
        setForm((p: any) => {
          const docs = p.dokumen ? p.dokumen.filter((d: any) => d.jenis_dokumen !== jenis) : []
          return { ...p, dokumen: [...docs, { jenis_dokumen: jenis, nama_file: file.name }] }
        })
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      toast({ title: `Upload gagal: ${err.response?.data?.message || err.message}`, variant: 'destructive' })
    }
    finally { setUploadingKey(null) }
  }

  const isSubmitted = form.status_formulir === 'submitted' || form.status_formulir === 'reviewed' || form.status_formulir === 'approved'

  const statusBadge: Record<string, { label: string; variant: string }> = {
    draft: { label: 'Belum dikirim', variant: 'secondary' },
    submitted: { label: 'Menunggu review', variant: 'info' },
    reviewed: { label: 'Sedang direview', variant: 'warning' },
    approved: { label: 'Disetujui ✓', variant: 'success' },
    rejected: { label: 'Perlu perbaikan', variant: 'destructive' },
  }
  const curStatus = statusBadge[form.status_formulir] || statusBadge.draft

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Formulir Pendaftaran</h1>
            <p className="text-sm text-muted-foreground mt-1">Isi data lengkap untuk matching pekerjaan terbaik di Jepang ✨</p>
          </div>
          <Badge variant={curStatus.variant as any} className="text-sm px-3 py-1">{curStatus.label}</Badge>
        </div>
        {form.catatan_admin && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <p className="font-medium mb-1">Catatan Admin:</p>
            <p>{form.catatan_admin}</p>
          </div>
        )}
      </div>

      {/* Step nav */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {STEPS.map(s => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${step === s.id ? 'bg-[#1e3a5f] text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <Icon size={14} /><span className="hidden sm:inline">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-muted rounded-full mb-6">
        <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${(step / STEPS.length) * 100}%` }} />
      </div>

      <Card>
        <CardContent className="pt-6 pb-8">
          {/* Step 1: Data Diri */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="form-section-title flex items-center gap-2"><User size={18} /> DATA DIRI（個人情報）</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="required">Nama (Katakana) *</Label><Input value={form.nama_katakana || ''} onChange={set('nama_katakana')} placeholder="カタカナ" error={!!errors.nama_katakana} />{errors.nama_katakana && <p className="text-xs text-red-500">{errors.nama_katakana}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Nama (Romaji) *</Label><Input value={form.nama_romaji || ''} onChange={set('nama_romaji')} placeholder="NAMA ROMAJI" error={!!errors.nama_romaji} />{errors.nama_romaji && <p className="text-xs text-red-500">{errors.nama_romaji}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Tempat Lahir *</Label><Input value={form.tempat_lahir || ''} onChange={set('tempat_lahir')} placeholder="Bandung" error={!!errors.tempat_lahir} />{errors.tempat_lahir && <p className="text-xs text-red-500">{errors.tempat_lahir}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Tanggal Lahir *</Label><Input type="date" value={form.tanggal_lahir?.split('T')[0] || ''} onChange={set('tanggal_lahir')} error={!!errors.tanggal_lahir} />{errors.tanggal_lahir && <p className="text-xs text-red-500">{errors.tanggal_lahir}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Umur *</Label><Input type="number" value={form.umur || ''} onChange={set('umur')} placeholder="25" error={!!errors.umur} />{errors.umur && <p className="text-xs text-red-500">{errors.umur}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Jenis Kelamin *</Label>
                  <Select value={form.jenis_kelamin || ''} onValueChange={setSel('jenis_kelamin')}>
                    <SelectTrigger error={!!errors.jenis_kelamin}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent>
                  </Select>
                  {errors.jenis_kelamin && <p className="text-xs text-red-500">{errors.jenis_kelamin}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Status Pernikahan *</Label>
                  <Select value={form.status_pernikahan || ''} onValueChange={setSel('status_pernikahan')}>
                    <SelectTrigger error={!!errors.status_pernikahan}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Menikah">Menikah</SelectItem><SelectItem value="Belum Menikah">Belum Menikah</SelectItem></SelectContent>
                  </Select>
                  {errors.status_pernikahan && <p className="text-xs text-red-500">{errors.status_pernikahan}</p>}
                </div>
                {form.status_pernikahan === 'Menikah' && <div className="space-y-1.5"><Label>Jumlah Anak</Label><Input type="number" value={form.jumlah_anak || 0} onChange={set('jumlah_anak')} /></div>}
                <div className="space-y-1.5"><Label className="required">Agama *</Label>
                  <Select value={form.agama || ''} onValueChange={setSel('agama')}>
                    <SelectTrigger error={!!errors.agama}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>
                      {['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu','Lainnya'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.agama && <p className="text-xs text-red-500">{errors.agama}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Tinggi Badan (cm) *</Label><Input type="number" value={form.tinggi_badan || ''} onChange={set('tinggi_badan')} placeholder="165" error={!!errors.tinggi_badan} />{errors.tinggi_badan && <p className="text-xs text-red-500">{errors.tinggi_badan}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Berat Badan (kg) *</Label><Input type="number" value={form.berat_badan || ''} onChange={set('berat_badan')} placeholder="60" error={!!errors.berat_badan} />{errors.berat_badan && <p className="text-xs text-red-500">{errors.berat_badan}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Golongan Darah *</Label>
                  <Select value={form.golongan_darah || ''} onValueChange={setSel('golongan_darah')}>
                    <SelectTrigger error={!!errors.golongan_darah}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>{['A','B','AB','O','Tidak Tahu'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.golongan_darah && <p className="text-xs text-red-500">{errors.golongan_darah}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Tangan Dominan *</Label>
                  <Select value={form.tangan_dominan || ''} onValueChange={setSel('tangan_dominan')}>
                    <SelectTrigger error={!!errors.tangan_dominan}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Kanan">Kanan</SelectItem><SelectItem value="Kiri">Kiri</SelectItem></SelectContent>
                  </Select>
                  {errors.tangan_dominan && <p className="text-xs text-red-500">{errors.tangan_dominan}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Ukuran Baju *</Label>
                  <Select value={form.ukuran_baju || ''} onValueChange={setSel('ukuran_baju')}>
                    <SelectTrigger error={!!errors.ukuran_baju}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>{['S','M','L','XL','XXL','Lainnya'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.ukuran_baju && <p className="text-xs text-red-500">{errors.ukuran_baju}</p>}
                </div>
                <div className="space-y-1.5"><Label>Lingkar Pinggang (cm)</Label><Input type="number" value={form.lingkar_pinggang || ''} onChange={set('lingkar_pinggang')} placeholder="80" /></div>
                <div className="space-y-1.5"><Label>Panjang Telapak Kaki (cm)</Label><Input type="number" step="0.5" value={form.panjang_telapak_kaki || ''} onChange={set('panjang_telapak_kaki')} placeholder="25.5" /></div>
                <div className="space-y-1.5"><Label>SIM yang Dimiliki</Label><Input value={form.sim_dimiliki || ''} onChange={set('sim_dimiliki')} placeholder="A, C" /></div>
              </div>
              <Separator className="my-2" />
              <p className="font-semibold text-sm">📍 KONTAK & ALAMAT</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="required">Nomor HP *</Label><Input value={form.nomor_hp || ''} onChange={set('nomor_hp')} placeholder="08xx-xxxx-xxxx" error={!!errors.nomor_hp} />{errors.nomor_hp && <p className="text-xs text-red-500">{errors.nomor_hp}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Email Kontak *</Label><Input type="email" value={form.email_kontak || ''} onChange={set('email_kontak')} placeholder="email@..." error={!!errors.email_kontak} />{errors.email_kontak && <p className="text-xs text-red-500">{errors.email_kontak}</p>}</div>
                <div className="col-span-2 space-y-1.5"><Label className="required">Alamat Lengkap *</Label><Textarea value={form.alamat_lengkap || ''} onChange={set('alamat_lengkap')} placeholder="Jl. ..." rows={3} className={errors.alamat_lengkap ? 'border-red-500' : ''} />{errors.alamat_lengkap && <p className="text-xs text-red-500">{errors.alamat_lengkap}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Nama Orang Tua / Wali *</Label><Input value={form.kontak_ortu_nama || ''} onChange={set('kontak_ortu_nama')} placeholder="Nama" error={!!errors.kontak_ortu_nama} />{errors.kontak_ortu_nama && <p className="text-xs text-red-500">{errors.kontak_ortu_nama}</p>}</div>
                <div className="space-y-1.5"><Label className="required">No. HP Orang Tua *</Label><Input value={form.kontak_ortu_hp || ''} onChange={set('kontak_ortu_hp')} placeholder="08xx-xxxx-xxxx" error={!!errors.kontak_ortu_hp} />{errors.kontak_ortu_hp && <p className="text-xs text-red-500">{errors.kontak_ortu_hp}</p>}</div>
              </div>
            </div>
          )}

          {/* Step 2: Kesehatan */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="form-section-title flex items-center gap-2"><Heart size={18} /> KONDISI FISIK & KESEHATAN</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="required">Sudah Vaksin? *</Label><BoolSelect value={form.sudah_vaksin} onChange={setBool('sudah_vaksin')} error={!!errors.sudah_vaksin} />{errors.sudah_vaksin && <p className="text-xs text-red-500">{errors.sudah_vaksin}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Kondisi Kesehatan Saat Ini *</Label>
                  <Select value={form.kondisi_kesehatan || ''} onValueChange={setSel('kondisi_kesehatan')}>
                    <SelectTrigger error={!!errors.kondisi_kesehatan}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Sehat">Sehat</SelectItem><SelectItem value="Tidak Sehat">Tidak Sehat</SelectItem></SelectContent>
                  </Select>
                  {errors.kondisi_kesehatan && <p className="text-xs text-red-500">{errors.kondisi_kesehatan}</p>}
                </div>
                <div className="space-y-1.5"><Label>Penglihatan Kanan</Label><Input value={form.penglihatan_kanan || ''} onChange={set('penglihatan_kanan')} placeholder="Normal / Minus -2.5" /></div>
                <div className="space-y-1.5"><Label>Penglihatan Kiri</Label><Input value={form.penglihatan_kiri || ''} onChange={set('penglihatan_kiri')} placeholder="Normal / Minus -1.5" /></div>
                <div className="space-y-1.5"><Label className="required">Berkacamata? *</Label><BoolSelect value={form.berkacamata} onChange={setBool('berkacamata')} error={!!errors.berkacamata} />{errors.berkacamata && <p className="text-xs text-red-500">{errors.berkacamata}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Menggunakan Lensa Kontak? *</Label><BoolSelect value={form.lensa_kontak} onChange={setBool('lensa_kontak')} error={!!errors.lensa_kontak} />{errors.lensa_kontak && <p className="text-xs text-red-500">{errors.lensa_kontak}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Buta Warna? *</Label><BoolSelect value={form.buta_warna} onChange={setBool('buta_warna')} error={!!errors.buta_warna} />{errors.buta_warna && <p className="text-xs text-red-500">{errors.buta_warna}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Bertato? *</Label><BoolSelect value={form.bertato} onChange={setBool('bertato')} error={!!errors.bertato} />{errors.bertato && <p className="text-xs text-red-500">{errors.bertato}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Merokok? *</Label><BoolSelect value={form.merokok} onChange={setBool('merokok')} error={!!errors.merokok} />{errors.merokok && <p className="text-xs text-red-500">{errors.merokok}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Minum Alkohol? *</Label><BoolSelect value={form.minum_alkohol} onChange={setBool('minum_alkohol')} error={!!errors.minum_alkohol} />{errors.minum_alkohol && <p className="text-xs text-red-500">{errors.minum_alkohol}</p>}</div>
                {form.minum_alkohol && <div className="col-span-2 space-y-1.5"><Label>Intensitas Minum Alkohol</Label><Input value={form.intensitas_alkohol || ''} onChange={set('intensitas_alkohol')} placeholder="Misal: 1-2x seminggu" /></div>}
                <div className="col-span-2 space-y-1.5"><Label className="required">Riwayat Penyakit / Cedera *</Label><Textarea value={form.riwayat_penyakit || ''} onChange={set('riwayat_penyakit')} placeholder="Cedera, patah tulang, penyakit kronis, dll. Isi 'Tidak ada' jika tidak ada." rows={3} className={errors.riwayat_penyakit ? 'border-red-500' : ''} />{errors.riwayat_penyakit && <p className="text-xs text-red-500">{errors.riwayat_penyakit}</p>}</div>
              </div>
            </div>
          )}

          {/* Step 3: Pendidikan */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="form-section-title"><GraduationCap className="inline mr-2 h-4 w-4" />PENDIDIKAN（学歴）</p>
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                <p className="font-semibold text-sm text-muted-foreground">Pendidikan Terakhir</p>
                <Select value={form.pendidikan_terakhir || ''} onValueChange={v => setForm((p: any) => ({ ...p, pendidikan_terakhir: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih pendidikan terakhir..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SD">SD</SelectItem>
                    <SelectItem value="SMP">SMP</SelectItem>
                    <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                    <SelectItem value="Perguruan Tinggi">Perguruan Tinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.pendidikan.map((p: any, i: number) => {
                const wajib = ['SD', 'SMP'].includes(p.jenjang)
                return (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-sm text-muted-foreground">{p.jenjang} {wajib && <span className="text-red-500">*</span>}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5"><Label className={wajib ? 'required' : ''}>Nama Sekolah / Universitas {wajib && '*'}</Label><Input value={p.nama_sekolah || ''} onChange={e => setPendidikan(i, 'nama_sekolah', e.target.value)} placeholder={`Nama ${p.jenjang}`} error={!!errors[`pendidikan_${i}_nama_sekolah`]} />{errors[`pendidikan_${i}_nama_sekolah`] && <p className="text-xs text-red-500">{errors[`pendidikan_${i}_nama_sekolah`]}</p>}</div>
                    {(p.jenjang === 'SMA/SMK' || p.jenjang === 'Perguruan Tinggi') && (
                      <div className="col-span-2 space-y-1.5"><Label>Jurusan</Label><Input value={p.jurusan || ''} onChange={e => setPendidikan(i, 'jurusan', e.target.value)} placeholder="Jurusan / Prodi" /></div>
                    )}
                    <div className="space-y-1.5"><Label className={wajib ? 'required' : ''}>Bulan & Tahun Masuk {wajib && '*'}</Label>
                      <YearMonthPicker monthVal={p.bulan_masuk} yearVal={p.tahun_masuk} onMonthChange={(v: string) => setPendidikan(i, 'bulan_masuk', v)} onYearChange={(v: string) => setPendidikan(i, 'tahun_masuk', v)} />
                      {errors[`pendidikan_${i}_bulan_masuk`] && <p className="text-xs text-red-500">{errors[`pendidikan_${i}_bulan_masuk`]}</p>}
                      {errors[`pendidikan_${i}_tahun_masuk`] && <p className="text-xs text-red-500">{errors[`pendidikan_${i}_tahun_masuk`]}</p>}
                    </div>
                    <div className="space-y-1.5"><Label className={wajib ? 'required' : ''}>Bulan & Tahun Lulus {wajib && '*'}</Label>
                      <YearMonthPicker monthVal={p.bulan_lulus} yearVal={p.tahun_lulus} onMonthChange={(v: string) => setPendidikan(i, 'bulan_lulus', v)} onYearChange={(v: string) => setPendidikan(i, 'tahun_lulus', v)} placeholder="Bulan Lulus" />
                      {errors[`pendidikan_${i}_bulan_lulus`] && <p className="text-xs text-red-500">{errors[`pendidikan_${i}_bulan_lulus`]}</p>}
                      {errors[`pendidikan_${i}_tahun_lulus`] && <p className="text-xs text-red-500">{errors[`pendidikan_${i}_tahun_lulus`]}</p>}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}

          {/* Step 4: Pengalaman Kerja */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="form-section-title mb-0 border-0 pb-0"><Briefcase className="inline mr-2 h-4 w-4" />PENGALAMAN KERJA（職歴）</p>
                <Button variant="outline" size="sm" onClick={addPengalaman}><Plus size={14} className="mr-1" />Tambah</Button>
              </div>
              {form.pengalaman.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                  <p className="text-sm">Belum ada pengalaman kerja</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={addPengalaman}><Plus size={14} className="mr-1" />Tambah Pengalaman</Button>
                </div>
              )}
              {form.pengalaman.map((p: any, i: number) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">Pengalaman #{i + 1}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => removePengalaman(i)}><Trash2 size={13} /></Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Nama Perusahaan</Label><Input value={p.nama_perusahaan || ''} onChange={e => setPengalaman(i, 'nama_perusahaan', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Posisi / Bidang</Label><Input value={p.posisi || ''} onChange={e => setPengalaman(i, 'posisi', e.target.value)} /></div>
                    <div className="col-span-2 space-y-1.5"><Label>Alamat Perusahaan</Label><Input value={p.alamat_perusahaan || ''} onChange={e => setPengalaman(i, 'alamat_perusahaan', e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Bulan & Tahun Masuk</Label>
                      <YearMonthPicker monthVal={p.bulan_masuk} yearVal={p.tahun_masuk} onMonthChange={(v: string) => setPengalaman(i, 'bulan_masuk', v)} onYearChange={(v: string) => setPengalaman(i, 'tahun_masuk', v)} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Bulan & Tahun Keluar</Label>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input type="checkbox" checked={!!p.masih_bekerja} onChange={e => setPengalaman(i, 'masih_bekerja', e.target.checked)} />
                          Masih bekerja
                        </label>
                      </div>
                      {!p.masih_bekerja && <YearMonthPicker monthVal={p.bulan_keluar} yearVal={p.tahun_keluar} onMonthChange={(v: string) => setPengalaman(i, 'bulan_keluar', v)} onYearChange={(v: string) => setPengalaman(i, 'tahun_keluar', v)} placeholder="Bulan Keluar" />}
                    </div>
                    <div className="col-span-2 space-y-1.5"><Label>Deskripsi Pekerjaan</Label><Textarea value={p.deskripsi_pekerjaan || ''} onChange={e => setPengalaman(i, 'deskripsi_pekerjaan', e.target.value)} placeholder="Deskripsikan tugas dan tanggung jawab Anda..." rows={3} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Kemampuan */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="form-section-title"><Star size={18} /> KEMAMPUAN & SERTIFIKAT</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="required">Level JLPT *</Label>
                  <Select value={form.level_jlpt || ''} onValueChange={setSel('level_jlpt')}>
                    <SelectTrigger error={!!errors.level_jlpt}><SelectValue placeholder="Pilih level..." /></SelectTrigger>
                    <SelectContent>{['N1','N2','N3','N4','N5','Belum ada'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.level_jlpt && <p className="text-xs text-red-500">{errors.level_jlpt}</p>}
                </div>
                <div className="space-y-1.5"><Label>Level JFT (opsional)</Label>
                  <Select value={form.level_jft || ''} onValueChange={setSel('level_jft')}>
                    <SelectTrigger><SelectValue placeholder="Pilih level..." /></SelectTrigger>
                    <SelectContent>{['A1','A2','B1','B2','Belum ada'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label className="required">Lama Belajar Bahasa Jepang *</Label><Input value={form.lama_belajar_jepang || ''} onChange={set('lama_belajar_jepang')} placeholder="6 bulan, 1 tahun, dll." error={!!errors.lama_belajar_jepang} />{errors.lama_belajar_jepang && <p className="text-xs text-red-500">{errors.lama_belajar_jepang}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Level Bahasa Jepang *</Label>
                  <Select value={form.level_bahasa_jepang || ''} onValueChange={setSel('level_bahasa_jepang')}>
                    <SelectTrigger error={!!errors.level_bahasa_jepang}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Dasar">Dasar</SelectItem><SelectItem value="Menengah">Menengah</SelectItem><SelectItem value="Lancar">Lancar</SelectItem></SelectContent>
                  </Select>
                  {errors.level_bahasa_jepang && <p className="text-xs text-red-500">{errors.level_bahasa_jepang}</p>}
                </div>
                <div className="space-y-1.5"><Label>ID Prometric (opsional)</Label><Input value={form.id_prometric || ''} onChange={set('id_prometric')} /></div>
                <div className="space-y-1.5"><Label>Password Prometric (opsional)</Label><Input value={form.password_prometric || ''} onChange={set('password_prometric')} /></div>
              </div>
              <div className="space-y-2">
                <Label>Sertifikat SSW yang Dimiliki (opsional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ssw_options.map(s => (
                    <label key={s} className="flex items-center gap-2 p-2.5 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input type="checkbox" className="rounded" checked={form.sertifikat_ssw?.includes(s) || false} onChange={() => toggleSSW(s)} />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Keluarga */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="form-section-title"><Users className="inline mr-2 h-4 w-4" />DATA KELUARGA（家族構成）</p>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="required">Penghasilan Keluarga / Bulan (Rp) *</Label>
                <Input type="number" value={form.penghasilan_keluarga || ''} onChange={set('penghasilan_keluarga')} placeholder="5000000" error={!!errors.penghasilan_keluarga} />
                {errors.penghasilan_keluarga && <p className="text-xs text-red-500">{errors.penghasilan_keluarga}</p>}
              </div>
              <Separator />
              {['Ayah', 'Ibu', 'Kakak', 'Adik'].map(hubungan => {
                const members = form.keluarga.filter((k: any) => k.hubungan === hubungan)
                const canAdd = hubungan === 'Kakak' || hubungan === 'Adik'
                const isRequired = hubungan === 'Ayah' || hubungan === 'Ibu'
                return (
                  <div key={hubungan} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{hubungan} {isRequired && '*'}</p>
                      {canAdd && <Button variant="outline" size="sm" onClick={() => addKeluarga(hubungan)}><Plus size={13} className="mr-1" />Tambah {hubungan}</Button>}
                    </div>
                    {members.map((m: any, mi: number) => {
                      const globalIdx = form.keluarga.findIndex((k: any, idx: number) => k.hubungan === hubungan && form.keluarga.slice(0, idx + 1).filter((kk: any) => kk.hubungan === hubungan).length === mi + 1)
                      return (
                        <div key={mi} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground font-mono">{hubungan} {mi > 0 ? mi + 1 : ''}</span>
                            {canAdd && members.length > 0 && <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => removeKeluarga(globalIdx)}><Trash2 size={12} /></Button>}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-3 sm:col-span-1 space-y-1.5"><Label className={isRequired ? 'required' : ''}>{isRequired ? 'Nama *' : 'Nama'}</Label><Input value={m.nama || ''} onChange={e => setKeluarga(globalIdx, 'nama', e.target.value)} error={isRequired && !!errors[`keluarga_${hubungan.toLowerCase()}_nama`]} />{isRequired && errors[`keluarga_${hubungan.toLowerCase()}_nama`] && <p className="text-xs text-red-500">{errors[`keluarga_${hubungan.toLowerCase()}_nama`]}</p>}</div>
                            <div className="space-y-1.5"><Label className={isRequired ? 'required' : ''}>{isRequired ? 'Usia *' : 'Usia'}</Label><Input type="number" value={m.usia || ''} onChange={e => setKeluarga(globalIdx, 'usia', e.target.value)} error={isRequired && !!errors[`keluarga_${hubungan.toLowerCase()}_usia`]} />{isRequired && errors[`keluarga_${hubungan.toLowerCase()}_usia`] && <p className="text-xs text-red-500">{errors[`keluarga_${hubungan.toLowerCase()}_usia`]}</p>}</div>
                            <div className="space-y-1.5"><Label className={isRequired ? 'required' : ''}>{isRequired ? 'Pekerjaan *' : 'Pekerjaan'}</Label><Input value={m.pekerjaan || ''} onChange={e => setKeluarga(globalIdx, 'pekerjaan', e.target.value)} error={isRequired && !!errors[`keluarga_${hubungan.toLowerCase()}_pekerjaan`]} />{isRequired && errors[`keluarga_${hubungan.toLowerCase()}_pekerjaan`] && <p className="text-xs text-red-500">{errors[`keluarga_${hubungan.toLowerCase()}_pekerjaan`]}</p>}</div>
                          </div>
                        </div>
                      )
                    })}
                    {members.length === 0 && hubungan !== 'Kakak' && hubungan !== 'Adik' && (
                      <p className="text-sm text-red-500 italic">Data {hubungan} wajib diisi</p>
                    )}
                    {members.length === 0 && canAdd && (
                      <p className="text-sm text-muted-foreground italic">Belum ada. Klik tombol untuk menambah.</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Step 7: Informasi Jepang */}
          {step === 7 && (
            <div className="space-y-4">
              <p className="form-section-title"><Globe className="inline mr-2 h-4 w-4" />INFORMASI JEPANG</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="required">Pernah ke Jepang? *</Label><BoolSelect value={form.pernah_ke_jepang} onChange={setBool('pernah_ke_jepang')} error={!!errors.pernah_ke_jepang} />{errors.pernah_ke_jepang && <p className="text-xs text-red-500">{errors.pernah_ke_jepang}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Punya Keluarga di Jepang? *</Label><BoolSelect value={form.keluarga_di_jepang} onChange={setBool('keluarga_di_jepang')} error={!!errors.keluarga_di_jepang} />{errors.keluarga_di_jepang && <p className="text-xs text-red-500">{errors.keluarga_di_jepang}</p>}</div>
                {form.keluarga_di_jepang && <>
                  <div className="space-y-1.5"><Label>Hubungan (opsional)</Label><Input value={form.hubungan_keluarga_jepang || ''} onChange={set('hubungan_keluarga_jepang')} placeholder="Kakak, Ayah, dll." /></div>
                  <div className="space-y-1.5"><Label>Status Kerabat di Jepang (opsional)</Label><Input value={form.status_kerabat_jepang || ''} onChange={set('status_kerabat_jepang')} placeholder="TG, Magang, dll." /></div>
                  <div className="col-span-2 space-y-1.5"><Label>Kontak Keluarga di Jepang (opsional)</Label><Input value={form.kontak_keluarga_jepang || ''} onChange={set('kontak_keluarga_jepang')} /></div>
                </>}
                <div className="space-y-1.5"><Label className="required">Punya Kenalan di Jepang? *</Label><BoolSelect value={form.kenalan_di_jepang} onChange={setBool('kenalan_di_jepang')} error={!!errors.kenalan_di_jepang} />{errors.kenalan_di_jepang && <p className="text-xs text-red-500">{errors.kenalan_di_jepang}</p>}</div>
                {form.kenalan_di_jepang && <div className="col-span-2 space-y-1.5"><Label>Detail Kenalan (Nama, Alamat, Kontak)</Label><Textarea value={form.kenalan_jepang_detail || ''} onChange={set('kenalan_jepang_detail')} rows={3} /></div>}
              </div>
            </div>
          )}

          {/* Step 8: Motivasi */}
          {step === 8 && (
            <div className="space-y-4">
              <p className="form-section-title"><Target className="inline mr-2 h-4 w-4" />MOTIVASI, TUJUAN & POIN PENDUKUNG</p>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5"><Label className="required">Tujuan ke Jepang *</Label><Textarea value={form.tujuan_ke_jepang || ''} onChange={set('tujuan_ke_jepang')} rows={3} placeholder="Tuliskan tujuan Anda pergi ke Jepang..." className={errors.tujuan_ke_jepang ? 'border-red-500' : ''} />{errors.tujuan_ke_jepang && <p className="text-xs text-red-500">{errors.tujuan_ke_jepang}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Alasan Ingin ke Jepang *</Label><Textarea value={form.alasan_ke_jepang || ''} onChange={set('alasan_ke_jepang')} rows={3} className={errors.alasan_ke_jepang ? 'border-red-500' : ''} />{errors.alasan_ke_jepang && <p className="text-xs text-red-500">{errors.alasan_ke_jepang}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Cita-cita Setelah Pulang dari Jepang *</Label><Textarea value={form.cita_cita_setelah_jepang || ''} onChange={set('cita_cita_setelah_jepang')} rows={3} className={errors.cita_cita_setelah_jepang ? 'border-red-500' : ''} />{errors.cita_cita_setelah_jepang && <p className="text-xs text-red-500">{errors.cita_cita_setelah_jepang}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Rencana Pengiriman Uang/Bulan ke Indonesia (Rp) *</Label><Input type="number" value={form.rencana_pengiriman_uang || ''} onChange={set('rencana_pengiriman_uang')} placeholder="3000000" error={!!errors.rencana_pengiriman_uang} />{errors.rencana_pengiriman_uang && <p className="text-xs text-red-500">{errors.rencana_pengiriman_uang}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Kelebihan Diri *</Label><Textarea value={form.kelebihan_diri || ''} onChange={set('kelebihan_diri')} rows={3} className={errors.kelebihan_diri ? 'border-red-500' : ''} />{errors.kelebihan_diri && <p className="text-xs text-red-500">{errors.kelebihan_diri}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Kekurangan Diri *</Label><Textarea value={form.kekurangan_diri || ''} onChange={set('kekurangan_diri')} rows={3} className={errors.kekurangan_diri ? 'border-red-500' : ''} />{errors.kekurangan_diri && <p className="text-xs text-red-500">{errors.kekurangan_diri}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Hobi *</Label><Textarea value={form.hobi || ''} onChange={set('hobi')} rows={2} className={errors.hobi ? 'border-red-500' : ''} />{errors.hobi && <p className="text-xs text-red-500">{errors.hobi}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Keahlian *</Label><Textarea value={form.keahlian || ''} onChange={set('keahlian')} rows={2} className={errors.keahlian ? 'border-red-500' : ''} />{errors.keahlian && <p className="text-xs text-red-500">{errors.keahlian}</p>}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5"><Label className="required">Bersedia Kerja Shift? *</Label><BoolSelect value={form.bersedia_shift} onChange={setBool('bersedia_shift')} error={!!errors.bersedia_shift} />{errors.bersedia_shift && <p className="text-xs text-red-500">{errors.bersedia_shift}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Bersedia Lembur? *</Label><BoolSelect value={form.bersedia_lembur} onChange={setBool('bersedia_lembur')} error={!!errors.bersedia_lembur} />{errors.bersedia_lembur && <p className="text-xs text-red-500">{errors.bersedia_lembur}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Bersedia Kerja Hari Libur? *</Label><BoolSelect value={form.bersedia_hari_libur} onChange={setBool('bersedia_hari_libur')} error={!!errors.bersedia_hari_libur} />{errors.bersedia_hari_libur && <p className="text-xs text-red-500">{errors.bersedia_hari_libur}</p>}</div>
                <div className="space-y-1.5"><Label className="required">Lama Ingin Tinggal di Jepang *</Label>
                  <Select value={form.lama_tinggal_jepang || ''} onValueChange={setSel('lama_tinggal_jepang')}>
                    <SelectTrigger error={!!errors.lama_tinggal_jepang}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="2-3 tahun">2-3 tahun</SelectItem><SelectItem value="3-5 tahun">3-5 tahun</SelectItem></SelectContent>
                  </Select>
                  {errors.lama_tinggal_jepang && <p className="text-xs text-red-500">{errors.lama_tinggal_jepang}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Lama Ingin Bekerja di Perusahaan *</Label>
                  <Select value={form.lama_kerja_perusahaan || ''} onValueChange={setSel('lama_kerja_perusahaan')}>
                    <SelectTrigger error={!!errors.lama_kerja_perusahaan}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="1-2 tahun">1-2 tahun</SelectItem><SelectItem value="2-3 tahun">2-3 tahun</SelectItem><SelectItem value="3-5 tahun">3-5 tahun</SelectItem></SelectContent>
                  </Select>
                  {errors.lama_kerja_perusahaan && <p className="text-xs text-red-500">{errors.lama_kerja_perusahaan}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Rencana Pulang ke Indonesia (5 tahun) *</Label>
                  <Select value={form.rencana_pulang || ''} onValueChange={setSel('rencana_pulang')}>
                    <SelectTrigger error={!!errors.rencana_pulang}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="1-2 kali">1-2 kali</SelectItem><SelectItem value="3-4 kali">3-4 kali</SelectItem><SelectItem value="Lainnya">Lainnya</SelectItem></SelectContent>
                  </Select>
                  {errors.rencana_pulang && <p className="text-xs text-red-500">{errors.rencana_pulang}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Sumber Biaya Keberangkatan *</Label>
                  <Select value={form.sumber_biaya || ''} onValueChange={setSel('sumber_biaya')}>
                    <SelectTrigger error={!!errors.sumber_biaya}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Dana Pribadi">Dana Pribadi</SelectItem><SelectItem value="Dana Talang LPK">Dana Talang LPK</SelectItem></SelectContent>
                  </Select>
                  {errors.sumber_biaya && <p className="text-xs text-red-500">{errors.sumber_biaya}</p>}
                </div>
                <div className="space-y-1.5"><Label className="required">Biaya yang Disiapkan *</Label>
                  <Select value={form.biaya_disiapkan || ''} onValueChange={setSel('biaya_disiapkan')}>
                    <SelectTrigger error={!!errors.biaya_disiapkan}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="10-20 Juta">10-20 Juta</SelectItem><SelectItem value="20-30 Juta">20-30 Juta</SelectItem><SelectItem value="40-50 Juta">40-50 Juta</SelectItem><SelectItem value="Lainnya">Lainnya</SelectItem></SelectContent>
                  </Select>
                  {errors.biaya_disiapkan && <p className="text-xs text-red-500">{errors.biaya_disiapkan}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 9: Dokumen */}
          {step === 9 && (
            <div className="space-y-4">
              <p className="form-section-title"><FileText className="inline mr-2 h-4 w-4" />UPLOAD DOKUMEN PENDUKUNG <span className="text-red-500">*</span></p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-4">
                <p className="font-medium mb-1">Batas ukuran file:</p>
                <ul className="text-xs space-y-0.5 ml-2">
                  <li>• Dokumen (Sertifikat, KK, KTP, Ijazah, Akte): Maks 2MB</li>
                  <li>• Foto Full Body: Maks 3MB</li>
                  <li>• Video Perkenalan: Maks 20MB</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">Format: JPG, PNG, PDF, MP4. Semua dokumen wajib diupload.</p>
              {errors.dokumen && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">{errors.dokumen}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dokumenTypes.map(dt => {
                  const uploaded = form.dokumen?.find((d: any) => d.jenis_dokumen === dt.key)
                  const isUploading = uploadingKey === dt.key
                  const maxSize = dt.key === 'foto_full_body' ? '3MB' : '2MB'
                  const isOptional = dt.optional
                  return (
                    <div key={dt.key} className={`border rounded-lg p-4 transition-colors ${uploaded ? 'border-emerald-200 bg-emerald-50/50' : 'border-border'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {uploaded ? <CheckCircle size={14} className="text-emerald-500 shrink-0" /> : <FileText size={14} className="text-muted-foreground shrink-0" />}
                          <span className="text-sm font-medium">{dt.label} {isOptional ? '' : '*'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Maks {maxSize}</span>
                      </div>
                      {uploaded && <p className="text-xs text-muted-foreground mb-2 truncate">{uploaded.nama_file}</p>}
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" disabled={isUploading || isSubmitted}
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={e => e.target.files?.[0] && handleUpload(dt.key, e.target.files[0])} />
                        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 border rounded-md w-fit transition-colors ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'} ${!uploaded && !isOptional ? 'border-red-300 bg-red-50' : 'border-border'}`}>
                          {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          {uploaded ? 'Ganti' : 'Upload'}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>

              {/* Dynamic SSW Certificate Uploads */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-sm">Sertifikat SSW (Opsional)</p>
                  <Button variant="outline" size="sm" onClick={addSertifikatSsw} disabled={isSubmitted}>
                    <Plus size={14} className="mr-1" />Tambah
                  </Button>
                </div>
                {sertifikatSsw.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    <p className="text-sm">Belum ada sertifikat SSW</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={addSertifikatSsw}><Plus size={14} className="mr-1" />Tambah Sertifikat</Button>
                  </div>
                )}
                {sertifikatSsw.map((s: any, i: number) => {
                  const sswKey = `ssw_${i + 1}`
                  const uploaded = form.dokumen?.find((d: any) => d.jenis_dokumen === sswKey)
                  const isUploading = uploadingKey === sswKey
                  return (
                    <div key={i} className="border border-border rounded-lg p-4 mb-3 last:mb-0">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm">Sertifikat SSW #{i + 1}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => removeSertifikatSsw(i)}><Trash2 size={13} /></Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-16 h-16 border rounded-lg ${uploaded ? 'border-emerald-200 bg-emerald-50' : 'border-border'}`}>
                          {uploaded ? (
                            <CheckCircle size={20} className="text-emerald-500" />
                          ) : (
                            <FileText size={20} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          {uploaded ? (
                            <p className="text-sm font-medium truncate">{uploaded.nama_file}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Belum ada file</p>
                          )}
                          <label className="cursor-pointer mt-2 inline-block">
                            <input type="file" className="hidden" disabled={isUploading || isSubmitted}
                              accept="image/jpeg,image/png,application/pdf"
                              onChange={e => e.target.files?.[0] && handleUpload(sswKey, e.target.files[0], i)} />
                            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 border rounded-md transition-colors ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'} ${!uploaded ? 'border-red-300 bg-red-50' : 'border-border'}`}>
                              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                              {uploaded ? 'Ganti File' : 'Pilih File'}
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer nav */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
          <ChevronLeft size={16} className="mr-1" />Sebelumnya
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saving || isSubmitted}>
            {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
            Simpan
          </Button>
          {step < STEPS.length ? (
            <Button onClick={() => {
              if (validateStep(step)) {
                setStep(s => Math.min(STEPS.length, s + 1))
                setErrors({})
              } else {
                toast({ title: 'Lengkapi semua field yang wajib diisi', description: 'Field dengan tanda * wajib diisi', variant: 'destructive' as any })
              }
            }}>
              Lanjut<ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={async () => {
              const allStepsValid = [1,2,3,5,6,7,8,9].every(s => validateStep(s))
              if (!allStepsValid) {
                toast({ title: 'Lengkapi semua field yang wajib diisi', description: 'Semua field wajib diisi sebelum mengirim', variant: 'destructive' as any })
                return
              }
              handleSubmit()
            }} disabled={submitting || isSubmitted} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Send size={14} className="mr-2" />}
              {isSubmitted ? 'Sudah Terkirim' : 'Kirim Formulir'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
