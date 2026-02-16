import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UtensilsCrossed, ArrowLeft, Lock, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false)
        setIsTokenValid(false)
        return
      }

      try {
        const response = await authApi.verifyResetToken(token)
        setIsTokenValid(response.data.data?.valid || false)
        setEmail(response.data.data?.email || '')
      } catch (error) {
        setIsTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return

    setIsLoading(true)
    try {
      await authApi.resetPassword(token, data.newPassword)
      setIsSuccess(true)
      toast.success('Password berhasil direset')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mereset password'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Papaloma
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-0.5">
              Restaurant Inventory
            </p>
          </div>
        </div>

        <div className="card p-8">
          {!isTokenValid ? (
            // Invalid token
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-100 dark:bg-danger-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-danger-600 dark:text-danger-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                Link Tidak Valid
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Link reset password tidak valid atau sudah kadaluarsa. Silakan request ulang.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center gap-2 mt-6 btn-primary"
              >
                Request Link Baru
              </Link>
            </div>
          ) : isSuccess ? (
            // Success
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                Password Direset!
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Password Anda berhasil direset. Silakan login dengan password baru.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 mt-6 btn-primary"
              >
                Login Sekarang
              </Link>
            </div>
          ) : (
            // Reset form
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Masukkan password baru untuk akun <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="newPassword" className="label">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      placeholder="Minimal 6 karakter"
                      className={cn('input pr-12', errors.newPassword && 'input-error')}
                      {...register('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1.5 text-xs text-danger-500">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder="Ulangi password baru"
                      className={cn('input pr-12', errors.confirmPassword && 'input-error')}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-danger-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary h-12 text-base"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}