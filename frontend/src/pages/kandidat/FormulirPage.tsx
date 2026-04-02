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

const BoolSelect = ({ value, onChange, label }: { value: any; onChange: (v: boolean) => void; label?: string }) => (
  <Select value={value === true || value === 1 ? 'ya' : value === false || value === 0 ? 'tidak' : ''} onValueChange={v => onChange(v === 'ya')}>
    <SelectTrigger><SelectValue placeholder={label || 'Pilih...'} /></SelectTrigger>
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
  { key: 'sertifikat_jft', label: 'Sertifikat JFT' },
  { key: 'sertifikat_ssw', label: 'Sertifikat SSW' },
  { key: 'pas_foto', label: 'Pas Foto' },
  { key: 'foto_full_body', label: 'Foto Full Body' },
  { key: 'video_perkenalan', label: 'Video Perkenalan' },
  { key: 'kk', label: 'Kartu Keluarga (KK)' },
  { key: 'ktp', label: 'KTP' },
  { key: 'ijazah', label: 'Ijazah' },
  { key: 'akte', label: 'Akta Kelahiran' },
]

const ssw_options = [
  'Pengolahan Makanan',
  'Pertanian',
  'Kaigo (perawat)',
  'Building Cleaning',
  'Restoran',
  'Driver'
];

export default function FormulirPage() {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [profil, setProfil] = useState<any>(null)
  const [form, setForm] = useState<any>({
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
      setForm((p: any) => ({
        ...p, ...d,
        pendidikan: d.pendidikan?.length ? d.pendidikan : p.pendidikan,
        pengalaman: d.pengalaman?.length ? d.pengalaman : p.pengalaman,
        keluarga: d.keluarga?.length ? d.keluarga : p.keluarga,
        sertifikat_ssw: d.sertifikat_ssw ? (typeof d.sertifikat_ssw === 'string' ? d.sertifikat_ssw.split(',').map((s: string) => s.trim()).filter(Boolean) : d.sertifikat_ssw) : [],
        dokumen: d.dokumen || [],
      }))
    })
  }, [])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [key]: e.target.value }))
  const setBool = (key: string) => (v: boolean) => setForm((p: any) => ({ ...p, [key]: v }))
  const setSel = (key: string) => (v: string) => setForm((p: any) => ({ ...p, [key]: v }))

  const setPendidikan = (i: number, key: string, v: string) =>
    setForm((p: any) => { const arr = [...p.pendidikan]; arr[i] = { ...arr[i], [key]: v }; return { ...p, pendidikan: arr } })

  const setPengalaman = (i: number, key: string, v: any) =>
    setForm((p: any) => { const arr = [...p.pengalaman]; arr[i] = { ...arr[i], [key]: v }; return { ...p, pengalaman: arr } })

  const addPengalaman = () => setForm((p: any) => ({ ...p, pengalaman: [...p.pengalaman, { nama_perusahaan: '', alamat_perusahaan: '', posisi: '', bulan_masuk: '', tahun_masuk: '', bulan_keluar: '', tahun_keluar: '', masih_bekerja: false, deskripsi_pekerjaan: '' }] }))
  const removePengalaman = (i: number) => setForm((p: any) => ({ ...p, pengalaman: p.pengalaman.filter((_: any, idx: number) => idx !== i) }))

  const setKeluarga = (i: number, key: string, v: string) =>
    setForm((p: any) => { const arr = [...p.keluarga]; arr[i] = { ...arr[i], [key]: v }; return { ...p, keluarga: arr } })

  const addKeluarga = (hubungan: string) => {
    const existing = form.keluarga.filter((k: any) => k.hubungan === hubungan).length
    setForm((p: any) => ({ ...p, keluarga: [...p.keluarga, { hubungan, nama: '', usia: '', pekerjaan: '', urutan: existing + 1 }] }))
  }
  const removeKeluarga = (i: number) => setForm((p: any) => ({ ...p, keluarga: p.keluarga.filter((_: any, idx: number) => idx !== i) }))

  const toggleSSW = (val: string) => setForm((p: any) => ({
    ...p,
    sertifikat_ssw: p.sertifikat_ssw.includes(val) ? p.sertifikat_ssw.filter((s: string) => s !== val) : [...p.sertifikat_ssw, val]
  }))

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

  const handleUpload = async (jenis: string, file: File) => {
    setUploadingKey(jenis)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('jenis_dokumen', jenis)
    try {
      await api.post('/kandidat/upload-dokumen', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast({ title: 'Dokumen berhasil diupload', variant: 'success' as any })
      setForm((p: any) => {
        const docs = p.dokumen ? p.dokumen.filter((d: any) => d.jenis_dokumen !== jenis) : []
        return { ...p, dokumen: [...docs, { jenis_dokumen: jenis, nama_file: file.name }] }
      })
    } catch { toast({ title: 'Upload gagal', variant: 'destructive' }) }
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
                <div className="space-y-1.5"><Label>Nama (Katakana)</Label><Input value={form.nama_katakana || ''} onChange={set('nama_katakana')} placeholder="カタカナ" /></div>
                <div className="space-y-1.5"><Label>Nama (Romaji)</Label><Input value={form.nama_romaji || ''} onChange={set('nama_romaji')} placeholder="NAMA ROMAJI" /></div>
                <div className="space-y-1.5"><Label>Tempat Lahir</Label><Input value={form.tempat_lahir || ''} onChange={set('tempat_lahir')} placeholder="Bandung" /></div>
                <div className="space-y-1.5"><Label>Tanggal Lahir</Label><Input type="date" value={form.tanggal_lahir?.split('T')[0] || ''} onChange={set('tanggal_lahir')} /></div>
                <div className="space-y-1.5"><Label>Umur</Label><Input type="number" value={form.umur || ''} onChange={set('umur')} placeholder="25" /></div>
                <div className="space-y-1.5"><Label>Jenis Kelamin</Label>
                  <Select value={form.jenis_kelamin || ''} onValueChange={setSel('jenis_kelamin')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Status Pernikahan</Label>
                  <Select value={form.status_pernikahan || ''} onValueChange={setSel('status_pernikahan')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Menikah">Menikah</SelectItem><SelectItem value="Belum Menikah">Belum Menikah</SelectItem></SelectContent>
                  </Select>
                </div>
                {form.status_pernikahan === 'Menikah' && <div className="space-y-1.5"><Label>Jumlah Anak</Label><Input type="number" value={form.jumlah_anak || 0} onChange={set('jumlah_anak')} /></div>}
                <div className="space-y-1.5"><Label>Agama</Label>
                  <Select value={form.agama || ''} onValueChange={setSel('agama')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>
                      {['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu','Lainnya'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Tinggi Badan (cm)</Label><Input type="number" value={form.tinggi_badan || ''} onChange={set('tinggi_badan')} placeholder="165" /></div>
                <div className="space-y-1.5"><Label>Berat Badan (kg)</Label><Input type="number" value={form.berat_badan || ''} onChange={set('berat_badan')} placeholder="60" /></div>
                <div className="space-y-1.5"><Label>Golongan Darah</Label>
                  <Select value={form.golongan_darah || ''} onValueChange={setSel('golongan_darah')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>{['A','B','AB','O','Tidak Tahu'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Tangan Dominan</Label>
                  <Select value={form.tangan_dominan || ''} onValueChange={setSel('tangan_dominan')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Kanan">Kanan</SelectItem><SelectItem value="Kiri">Kiri</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Ukuran Baju</Label>
                  <Select value={form.ukuran_baju || ''} onValueChange={setSel('ukuran_baju')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>{['S','M','L','XL','XXL','Lainnya'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Lingkar Pinggang (cm)</Label><Input type="number" value={form.lingkar_pinggang || ''} onChange={set('lingkar_pinggang')} placeholder="80" /></div>
                <div className="space-y-1.5"><Label>Panjang Telapak Kaki (cm)</Label><Input type="number" step="0.5" value={form.panjang_telapak_kaki || ''} onChange={set('panjang_telapak_kaki')} placeholder="25.5" /></div>
                <div className="space-y-1.5"><Label>SIM yang Dimiliki</Label><Input value={form.sim_dimiliki || ''} onChange={set('sim_dimiliki')} placeholder="A, C" /></div>
              </div>
              <Separator className="my-2" />
              <p className="font-semibold text-sm">📍 KONTAK & ALAMAT</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Nomor HP</Label><Input value={form.nomor_hp || ''} onChange={set('nomor_hp')} placeholder="08xx-xxxx-xxxx" /></div>
                <div className="space-y-1.5"><Label>Email Kontak</Label><Input type="email" value={form.email_kontak || ''} onChange={set('email_kontak')} placeholder="email@..." /></div>
                <div className="col-span-2 space-y-1.5"><Label>Alamat Lengkap</Label><Textarea value={form.alamat_lengkap || ''} onChange={set('alamat_lengkap')} placeholder="Jl. ..." rows={3} /></div>
                <div className="space-y-1.5"><Label>Nama Orang Tua / Wali</Label><Input value={form.kontak_ortu_nama || ''} onChange={set('kontak_ortu_nama')} placeholder="Nama" /></div>
                <div className="space-y-1.5"><Label>No. HP Orang Tua</Label><Input value={form.kontak_ortu_hp || ''} onChange={set('kontak_ortu_hp')} placeholder="08xx-xxxx-xxxx" /></div>
              </div>
            </div>
          )}

          {/* Step 2: Kesehatan */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="form-section-title flex items-center gap-2"><Heart size={18} /> KONDISI FISIK & KESEHATAN</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Sudah Vaksin?</Label><BoolSelect value={form.sudah_vaksin} onChange={setBool('sudah_vaksin')} /></div>
                <div className="space-y-1.5"><Label>Kondisi Kesehatan Saat Ini</Label>
                  <Select value={form.kondisi_kesehatan || ''} onValueChange={setSel('kondisi_kesehatan')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Sehat">Sehat</SelectItem><SelectItem value="Tidak Sehat">Tidak Sehat</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Penglihatan Kanan</Label><Input value={form.penglihatan_kanan || ''} onChange={set('penglihatan_kanan')} placeholder="Normal / Minus -2.5" /></div>
                <div className="space-y-1.5"><Label>Penglihatan Kiri</Label><Input value={form.penglihatan_kiri || ''} onChange={set('penglihatan_kiri')} placeholder="Normal / Minus -1.5" /></div>
                <div className="space-y-1.5"><Label>Berkacamata?</Label><BoolSelect value={form.berkacamata} onChange={setBool('berkacamata')} /></div>
                <div className="space-y-1.5"><Label>Menggunakan Lensa Kontak?</Label><BoolSelect value={form.lensa_kontak} onChange={setBool('lensa_kontak')} /></div>
                <div className="space-y-1.5"><Label>Buta Warna?</Label><BoolSelect value={form.buta_warna} onChange={setBool('buta_warna')} /></div>
                <div className="space-y-1.5"><Label>Bertato?</Label><BoolSelect value={form.bertato} onChange={setBool('bertato')} /></div>
                <div className="space-y-1.5"><Label>Merokok?</Label><BoolSelect value={form.merokok} onChange={setBool('merokok')} /></div>
                <div className="space-y-1.5"><Label>Minum Alkohol?</Label><BoolSelect value={form.minum_alkohol} onChange={setBool('minum_alkohol')} /></div>
                {form.minum_alkohol && <div className="col-span-2 space-y-1.5"><Label>Intensitas Minum Alkohol</Label><Input value={form.intensitas_alkohol || ''} onChange={set('intensitas_alkohol')} placeholder="Misal: 1-2x seminggu" /></div>}
                <div className="col-span-2 space-y-1.5"><Label>Riwayat Penyakit / Cedera</Label><Textarea value={form.riwayat_penyakit || ''} onChange={set('riwayat_penyakit')} placeholder="Cedera, patah tulang, penyakit kronis, dll. Isi 'Tidak ada' jika tidak ada." rows={3} /></div>
              </div>
            </div>
          )}

          {/* Step 3: Pendidikan */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="form-section-title">🎓 PENDIDIKAN（学歴）</p>
              {form.pendidikan.map((p: any, i: number) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-sm text-muted-foreground">{p.jenjang}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5"><Label>Nama Sekolah / Universitas</Label><Input value={p.nama_sekolah || ''} onChange={e => setPendidikan(i, 'nama_sekolah', e.target.value)} placeholder={`Nama ${p.jenjang}`} /></div>
                    {(p.jenjang === 'SMA/SMK' || p.jenjang === 'Perguruan Tinggi') && (
                      <div className="col-span-2 space-y-1.5"><Label>Jurusan</Label><Input value={p.jurusan || ''} onChange={e => setPendidikan(i, 'jurusan', e.target.value)} placeholder="Jurusan / Prodi" /></div>
                    )}
                    <div className="space-y-1.5"><Label>Bulan & Tahun Masuk</Label>
                      <YearMonthPicker monthVal={p.bulan_masuk} yearVal={p.tahun_masuk} onMonthChange={(v: string) => setPendidikan(i, 'bulan_masuk', v)} onYearChange={(v: string) => setPendidikan(i, 'tahun_masuk', v)} />
                    </div>
                    <div className="space-y-1.5"><Label>Bulan & Tahun Lulus</Label>
                      <YearMonthPicker monthVal={p.bulan_lulus} yearVal={p.tahun_lulus} onMonthChange={(v: string) => setPendidikan(i, 'bulan_lulus', v)} onYearChange={(v: string) => setPendidikan(i, 'tahun_lulus', v)} placeholder="Bulan Lulus" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Pengalaman Kerja */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="form-section-title mb-0 border-0 pb-0">💼 PENGALAMAN KERJA（職歴）</p>
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
                <div className="space-y-1.5"><Label>Level JLPT</Label>
                  <Select value={form.level_jlpt || ''} onValueChange={setSel('level_jlpt')}>
                    <SelectTrigger><SelectValue placeholder="Pilih level..." /></SelectTrigger>
                    <SelectContent>{['N1','N2','N3','N4','N5','Belum ada'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Level JFT</Label>
                  <Select value={form.level_jft || ''} onValueChange={setSel('level_jft')}>
                    <SelectTrigger><SelectValue placeholder="Pilih level..." /></SelectTrigger>
                    <SelectContent>{['A1','A2','B1','B2','Belum ada'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Lama Belajar Bahasa Jepang</Label><Input value={form.lama_belajar_jepang || ''} onChange={set('lama_belajar_jepang')} placeholder="6 bulan, 1 tahun, dll." /></div>
                <div className="space-y-1.5"><Label>Level Bahasa Jepang</Label>
                  <Select value={form.level_bahasa_jepang || ''} onValueChange={setSel('level_bahasa_jepang')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Dasar">Dasar</SelectItem><SelectItem value="Menengah">Menengah</SelectItem><SelectItem value="Lancar">Lancar</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>ID Prometric (opsional)</Label><Input value={form.id_prometric || ''} onChange={set('id_prometric')} /></div>
                <div className="space-y-1.5"><Label>Password Prometric (opsional)</Label><Input value={form.password_prometric || ''} onChange={set('password_prometric')} /></div>
              </div>
              <div className="space-y-2">
                <Label>Sertifikat SSW yang Dimiliki</Label>
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
              <p className="form-section-title">👨‍👩‍👧 DATA KELUARGA（家族構成）</p>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Penghasilan Keluarga / Bulan (Rp)</Label>
                <Input type="number" value={form.penghasilan_keluarga || ''} onChange={set('penghasilan_keluarga')} placeholder="5000000" />
              </div>
              <Separator />
              {['Ayah', 'Ibu', 'Kakak', 'Adik'].map(hubungan => {
                const members = form.keluarga.filter((k: any) => k.hubungan === hubungan)
                const canAdd = hubungan === 'Kakak' || hubungan === 'Adik'
                return (
                  <div key={hubungan} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{hubungan}</p>
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
                            <div className="col-span-3 sm:col-span-1 space-y-1.5"><Label>Nama</Label><Input value={m.nama || ''} onChange={e => setKeluarga(globalIdx, 'nama', e.target.value)} /></div>
                            <div className="space-y-1.5"><Label>Usia</Label><Input type="number" value={m.usia || ''} onChange={e => setKeluarga(globalIdx, 'usia', e.target.value)} /></div>
                            <div className="space-y-1.5"><Label>Pekerjaan</Label><Input value={m.pekerjaan || ''} onChange={e => setKeluarga(globalIdx, 'pekerjaan', e.target.value)} /></div>
                          </div>
                        </div>
                      )
                    })}
                    {members.length === 0 && hubungan !== 'Kakak' && hubungan !== 'Adik' && (
                      <p className="text-sm text-muted-foreground italic">Data tidak diisi</p>
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
              <p className="form-section-title">🇯🇵 INFORMASI JEPANG</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Pernah ke Jepang?</Label><BoolSelect value={form.pernah_ke_jepang} onChange={setBool('pernah_ke_jepang')} /></div>
                <div className="space-y-1.5"><Label>Punya Keluarga di Jepang?</Label><BoolSelect value={form.keluarga_di_jepang} onChange={setBool('keluarga_di_jepang')} /></div>
                {form.keluarga_di_jepang && <>
                  <div className="space-y-1.5"><Label>Hubungan (opsional)</Label><Input value={form.hubungan_keluarga_jepang || ''} onChange={set('hubungan_keluarga_jepang')} placeholder="Kakak, Ayah, dll." /></div>
                  <div className="space-y-1.5"><Label>Status Kerabat di Jepang (opsional)</Label><Input value={form.status_kerabat_jepang || ''} onChange={set('status_kerabat_jepang')} placeholder="TG, Magang, dll." /></div>
                  <div className="col-span-2 space-y-1.5"><Label>Kontak Keluarga di Jepang (opsional)</Label><Input value={form.kontak_keluarga_jepang || ''} onChange={set('kontak_keluarga_jepang')} /></div>
                </>}
                <div className="space-y-1.5"><Label>Punya Kenalan di Jepang?</Label><BoolSelect value={form.kenalan_di_jepang} onChange={setBool('kenalan_di_jepang')} /></div>
                {form.kenalan_di_jepang && <div className="col-span-2 space-y-1.5"><Label>Detail Kenalan (Nama, Alamat, Kontak)</Label><Textarea value={form.kenalan_jepang_detail || ''} onChange={set('kenalan_jepang_detail')} rows={3} /></div>}
              </div>
            </div>
          )}

          {/* Step 8: Motivasi */}
          {step === 8 && (
            <div className="space-y-4">
              <p className="form-section-title">🎯 MOTIVASI, TUJUAN & POIN PENDUKUNG</p>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5"><Label>Tujuan ke Jepang</Label><Textarea value={form.tujuan_ke_jepang || ''} onChange={set('tujuan_ke_jepang')} rows={3} placeholder="Tuliskan tujuan Anda pergi ke Jepang..." /></div>
                <div className="space-y-1.5"><Label>Alasan Ingin ke Jepang</Label><Textarea value={form.alasan_ke_jepang || ''} onChange={set('alasan_ke_jepang')} rows={3} /></div>
                <div className="space-y-1.5"><Label>Cita-cita Setelah Pulang dari Jepang</Label><Textarea value={form.cita_cita_setelah_jepang || ''} onChange={set('cita_cita_setelah_jepang')} rows={3} /></div>
                <div className="space-y-1.5"><Label>Rencana Pengiriman Uang/Bulan ke Indonesia (Rp)</Label><Input type="number" value={form.rencana_pengiriman_uang || ''} onChange={set('rencana_pengiriman_uang')} placeholder="3000000" /></div>
                <div className="space-y-1.5"><Label>Kelebihan Diri</Label><Textarea value={form.kelebihan_diri || ''} onChange={set('kelebihan_diri')} rows={3} /></div>
                <div className="space-y-1.5"><Label>Kekurangan Diri</Label><Textarea value={form.kekurangan_diri || ''} onChange={set('kekurangan_diri')} rows={3} /></div>
                <div className="space-y-1.5"><Label>Hobi</Label><Textarea value={form.hobi || ''} onChange={set('hobi')} rows={2} /></div>
                <div className="space-y-1.5"><Label>Keahlian</Label><Textarea value={form.keahlian || ''} onChange={set('keahlian')} rows={2} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5"><Label>Bersedia Kerja Shift?</Label><BoolSelect value={form.bersedia_shift} onChange={setBool('bersedia_shift')} /></div>
                <div className="space-y-1.5"><Label>Bersedia Lembur?</Label><BoolSelect value={form.bersedia_lembur} onChange={setBool('bersedia_lembur')} /></div>
                <div className="space-y-1.5"><Label>Bersedia Kerja Hari Libur?</Label><BoolSelect value={form.bersedia_hari_libur} onChange={setBool('bersedia_hari_libur')} /></div>
                <div className="space-y-1.5"><Label>Lama Ingin Tinggal di Jepang</Label>
                  <Select value={form.lama_tinggal_jepang || ''} onValueChange={setSel('lama_tinggal_jepang')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="2-3 tahun">2-3 tahun</SelectItem><SelectItem value="3-5 tahun">3-5 tahun</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Lama Ingin Bekerja di Perusahaan</Label>
                  <Select value={form.lama_kerja_perusahaan || ''} onValueChange={setSel('lama_kerja_perusahaan')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="1-2 tahun">1-2 tahun</SelectItem><SelectItem value="2-3 tahun">2-3 tahun</SelectItem><SelectItem value="3-5 tahun">3-5 tahun</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Rencana Pulang ke Indonesia (5 tahun)</Label>
                  <Select value={form.rencana_pulang || ''} onValueChange={setSel('rencana_pulang')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="1-2 kali">1-2 kali</SelectItem><SelectItem value="3-4 kali">3-4 kali</SelectItem><SelectItem value="Lainnya">Lainnya</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Sumber Biaya Keberangkatan</Label>
                  <Select value={form.sumber_biaya || ''} onValueChange={setSel('sumber_biaya')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Dana Pribadi">Dana Pribadi</SelectItem><SelectItem value="Dana Talang LPK">Dana Talang LPK</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Biaya yang Disiapkan</Label>
                  <Select value={form.biaya_disiapkan || ''} onValueChange={setSel('biaya_disiapkan')}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent><SelectItem value="10-20 Juta">10-20 Juta</SelectItem><SelectItem value="20-30 Juta">20-30 Juta</SelectItem><SelectItem value="40-50 Juta">40-50 Juta</SelectItem><SelectItem value="Lainnya">Lainnya</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 9: Dokumen */}
          {step === 9 && (
            <div className="space-y-4">
              <p className="form-section-title">📎 UPLOAD DOKUMEN PENDUKUNG</p>
              <p className="text-sm text-muted-foreground -mt-2 mb-4">Format: JPG, PNG, PDF, MP4. Maks 50MB per file.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dokumenTypes.map(dt => {
                  const uploaded = form.dokumen?.find((d: any) => d.jenis_dokumen === dt.key)
                  const isUploading = uploadingKey === dt.key
                  return (
                    <div key={dt.key} className={`border rounded-lg p-4 transition-colors ${uploaded ? 'border-emerald-200 bg-emerald-50/50' : 'border-border'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {uploaded ? <CheckCircle size={14} className="text-emerald-500 shrink-0" /> : <FileText size={14} className="text-muted-foreground shrink-0" />}
                          <span className="text-sm font-medium">{dt.label}</span>
                        </div>
                      </div>
                      {uploaded && <p className="text-xs text-muted-foreground mb-2 truncate">{uploaded.nama_file}</p>}
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" disabled={isUploading || isSubmitted}
                          onChange={e => e.target.files?.[0] && handleUpload(dt.key, e.target.files[0])} />
                        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 border border-border rounded-md w-fit transition-colors ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'}`}>
                          {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          {uploaded ? 'Ganti' : 'Upload'}
                        </div>
                      </label>
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
            <Button onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}>
              Lanjut<ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || isSubmitted} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Send size={14} className="mr-2" />}
              {isSubmitted ? 'Sudah Terkirim' : 'Kirim Formulir'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
