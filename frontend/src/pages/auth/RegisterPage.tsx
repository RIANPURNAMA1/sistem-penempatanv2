import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const LogoMenduniaJepang = "/images/logo4.png"

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: '', email: '', password: '', cabang_id: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cabangList, setCabangList] = useState<{ id: number; nama_cabang: string }[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/cabang-list').then(r => setCabangList(r.data.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cabang_id) { toast({ title: 'Pilih cabang terlebih dahulu', variant: 'destructive' }); return }
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast({ title: 'Registrasi berhasil!', description: 'Silakan login dengan akun Anda', variant: 'success' as any })
      navigate('/login')
    } catch (err: any) {
      toast({ title: 'Registrasi gagal', description: err.response?.data?.message || 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1">
            <img src={LogoMenduniaJepang} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-lg">Sistem Penempatan</span>
        </div>
        <div>
          <p className="font-display text-5xl text-white leading-tight mb-6">
            Mulai<br />Perjalanan<br />
          </p>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Daftarkan diri Anda dan isi data lengkap untuk mendapat kesempatan kerja terbaik di Jepang.
          </p>
        </div>
        <p className="text-xs text-white/30 font-mono">© 2026 Sistem Penempatan</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                <img src={LogoMenduniaJepang} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-semibold text-sm">Sistem Penempatan</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Buat Akun Baru</h1>
            <p className="text-sm text-muted-foreground mt-1">Isi data berikut untuk mendaftar sebagai kandidat</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input placeholder="Nama lengkap Anda" value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="email@contoh.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Cabang Mendunia</Label>
              <Select onValueChange={v => setForm({ ...form, cabang_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang..." />
                </SelectTrigger>
                <SelectContent>
                  {cabangList.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nama_cabang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder="Min. 6 karakter"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} className="pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />Mendaftar...</> : 'Daftar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-foreground font-medium hover:underline underline-offset-4">Masuk</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
