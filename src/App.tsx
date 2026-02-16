import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/Forgotpasswordpage'
import { ResetPasswordPage } from '@/pages/auth/Resetpasswordpage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { BarangListPage } from '@/pages/barang/BarangListPage'
import { BarangMasukPage } from '@/pages/barang/BarangMasukPage'
import { BarangKeluarPage } from '@/pages/barang/BarangKeluarPage'
import { LaporanPage } from '@/pages/laporan/LaporanPage'
import { AdminAreaPage } from '@/pages/admin/AdminAreaPage'
import { ProfilPage } from '@/pages/profil/ProfilPage'
import { useAuthStore } from '@/stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/barang" element={<BarangListPage />} />
          <Route path="/barang-masuk" element={<BarangMasukPage />} />
          <Route path="/barang-keluar" element={<BarangKeluarPage />} />
          <Route path="/laporan" element={<LaporanPage />} />
          <Route path="/admin-area" element={<AdminAreaPage />} />
          <Route path="/profil" element={<ProfilPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          },
          className: 'shadow-lg',
        }}
        richColors
        closeButton
      />
    </BrowserRouter>
  )
}