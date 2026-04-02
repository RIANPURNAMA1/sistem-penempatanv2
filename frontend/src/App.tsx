import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import CabangPage from '@/pages/admin/CabangPage'
import PerusahaanPage from '@/pages/admin/PerusahaanPage'
import KandidatListPage from '@/pages/admin/KandidatListPage'
import KandidatDetailPage from '@/pages/admin/KandidatDetailPage'
import UsersPage from '@/pages/admin/UsersPage'
import FormulirPage from '@/pages/kandidat/FormulirPage'
import KandidatDashboardPage from '@/pages/kandidat/KandidatDashboardPage'
import { useAuthStore } from '@/store/authStore'

function HomeRedirect() {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'kandidat') return <Navigate to="/kandidat-dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['admin_penempatan', 'admin_cabang']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/kandidat" element={
          <ProtectedRoute roles={['admin_penempatan', 'admin_cabang']}>
            <KandidatListPage />
          </ProtectedRoute>
        } />
        <Route path="/kandidat/:id" element={
          <ProtectedRoute roles={['admin_penempatan', 'admin_cabang']}>
            <KandidatDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/cabang" element={
          <ProtectedRoute roles={['admin_penempatan']}>
            <CabangPage />
          </ProtectedRoute>
        } />
        <Route path="/perusahaan" element={
          <ProtectedRoute roles={['admin_penempatan']}>
            <PerusahaanPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute roles={['admin_penempatan']}>
            <UsersPage />
          </ProtectedRoute>
        } />

        {/* Kandidat routes */}
        <Route path="/kandidat-dashboard" element={
          <ProtectedRoute roles={['kandidat']}>
            <KandidatDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/formulir" element={
          <ProtectedRoute roles={['kandidat']}>
            <FormulirPage />
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Akses Ditolak</h1>
              <p className="text-muted-foreground mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
              <a href="/" className="mt-4 inline-block text-sm underline">Kembali ke beranda</a>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
