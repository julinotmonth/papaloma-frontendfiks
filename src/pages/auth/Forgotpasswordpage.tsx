import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UtensilsCrossed, ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resetData, setResetData] = useState<{ resetToken?: string; resetUrl?: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.forgotPassword(data.email)
      setIsSuccess(true)
      setResetData(response.data.data || null)
      toast.success('Instruksi reset password telah dikirim')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengirim email reset'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
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
          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  Lupa Password?
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="nama@papaloma.id"
                    className={cn('input', errors.email && 'input-error')}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-danger-500">
                      {errors.email.message}
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
                    'Kirim Link Reset'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                Email Terkirim!
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Silakan cek email Anda untuk instruksi reset password
              </p>

              {/* Demo only - show reset link */}
              {resetData?.resetUrl && (
                <div className="mt-6 p-4 rounded-xl bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/20">
                  <p className="text-xs font-semibold text-warning-700 dark:text-warning-400 uppercase tracking-wider mb-2">
                    Demo Mode - Link Reset Password:
                  </p>
                  <Link
                    to={`/reset-password?token=${resetData.resetToken}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline break-all"
                  >
                    Klik di sini untuk reset password
                  </Link>
                </div>
              )}
            </div>
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