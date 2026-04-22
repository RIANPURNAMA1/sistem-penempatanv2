import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/hooks/useToast'
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function ProfilPage() {
  const { user, setAuth } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    setFormData({
      nama: user?.nama || '',
      email: user?.email || ''
    })
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nama || !formData.email) {
      toast({ title: 'Error', description: 'Nama dan email wajib diisi', variant: 'destructive' as any })
      return
    }
    
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', formData)
      if (res.data.success) {
        const updatedUser = { ...user!, nama: formData.nama, email: formData.email }
        setAuth(updatedUser, localStorage.getItem('token')!)
        toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal memperbarui profil', variant: 'destructive' as any })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Password baru dan konfirmasi wajib diisi', variant: 'destructive' as any })
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Password baru tidak cocok', variant: 'destructive' as any })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password minimal 6 karakter', variant: 'destructive' as any })
      return
    }
    
    setLoading(true)
    try {
      const res = await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword || null,
        newPassword: passwordData.newPassword
      })
      if (res.data.success) {
        toast({ title: 'Berhasil', description: 'Password berhasil diperbarui' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal memperbarui password', variant: 'destructive' as any })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Pengaturan Profil</h1>

      <div className="space-y-6">
        {/* Edit Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User size={20} />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ubah Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock size={20} />
              Ubah Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Lama</label>
                <p><i className='text-red-500 text-[12px]'>kosongkan jika lupa</i></p>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Masukkan password lama"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Baru</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Masukkan password baru (min 6 karakter)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Konfirmasi Password Baru</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Konfirmasi password baru"
                />
              </div>
              <Button type="submit" disabled={loading} variant="outline" className="w-full">
                {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
                Ubah Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}