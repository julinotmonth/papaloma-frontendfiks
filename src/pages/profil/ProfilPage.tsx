import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Clock, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge, LoadingSpinner } from '@/components/common'
import { useAuthStore } from '@/stores/authStore'
import { activityLogsApi, ActivityLog } from '@/lib/api'
import { cn, formatDateTime } from '@/lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password minimal 6 karakter'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfilPage() {
  const { user, isLoading, updateProfile, changePassword } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'activity'>('profile')
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    formState: { errors: profileErrors } 
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { 
      name: user?.name || '', 
      email: user?.email || '' 
    },
  })

  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    reset: resetPassword, 
    formState: { errors: passwordErrors } 
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (activeTab === 'activity') {
      setLoadingLogs(true)
      activityLogsApi.getMyLogs(20)
        .then((res) => setActivityLogs(res.data.data?.logs || []))
        .catch(() => setActivityLogs([]))
        .finally(() => setLoadingLogs(false))
    }
  }, [activeTab])

  const onProfileSubmit = async (data: ProfileFormData) => {
    await updateProfile(data)
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    const success = await changePassword(data)
    if (success) {
      resetPassword()
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Profil Saya
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Kelola informasi profil dan keamanan akun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="card p-6 text-center"
        >
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name ? getInitials(user.name) : 'U'}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            {user?.name || 'User'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {user?.email || ''}
          </p>
          <Badge variant={user?.role === 'super_admin' ? 'info' : 'default'} className="mt-2">
            {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Badge>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="lg:col-span-3 card"
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {[
              { key: 'profile', label: 'Profil', icon: User },
              { key: 'password', label: 'Password', icon: Lock },
              { key: 'activity', label: 'Aktivitas', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input 
                    type="text" 
                    className={cn('input', profileErrors.name && 'input-error')} 
                    {...registerProfile('name')} 
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-xs text-danger-500">{profileErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input 
                    type="email" 
                    className={cn('input', profileErrors.email && 'input-error')} 
                    {...registerProfile('email')} 
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-xs text-danger-500">{profileErrors.email.message}</p>
                  )}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div>
                  <label className="label">Password Saat Ini</label>
                  <input 
                    type="password" 
                    className={cn('input', passwordErrors.currentPassword && 'input-error')} 
                    {...registerPassword('currentPassword')} 
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs text-danger-500">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Password Baru</label>
                  <input 
                    type="password" 
                    className={cn('input', passwordErrors.newPassword && 'input-error')} 
                    {...registerPassword('newPassword')} 
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-danger-500">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    className={cn('input', passwordErrors.confirmPassword && 'input-error')} 
                    {...registerPassword('confirmPassword')} 
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-danger-500">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Ubah Password'
                  )}
                </button>
              </form>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                {loadingLogs ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <p className="text-center py-8 text-slate-500">Belum ada aktivitas</p>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {log.action}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(log.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}