import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UtensilsCrossed, ArrowRight, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  remember: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginForm) => {
    const success = await login(data.email, data.password)
    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
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

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Selamat Datang! 👋
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Masuk ke akun Anda untuk mengelola inventaris restoran
            </p>
          </div>

          {/* Login form */}
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

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  className={cn('input pr-12', errors.password && 'input-error')}
                  {...register('password')}
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
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  {...register('remember')}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Ingat saya
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-accent h-12 text-base"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Demo Akun
            </p>
            <div className="space-y-1.5 text-sm">
              <p className="text-slate-600 dark:text-slate-300">
                <span className="text-slate-500">Super Admin:</span>{' '}
                superadmin@papaloma.id
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="text-slate-500">Admin:</span>{' '}
                admin@papaloma.id
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="text-slate-500">Password:</span> password123
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex flex-1 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500 via-accent-600 to-primary-700" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-8 shadow-2xl"
          >
            <UtensilsCrossed className="w-16 h-16 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-4xl font-display font-bold text-white mb-4"
          >
            Restoran Papaloma
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-white/80 max-w-md"
          >
            Kelola inventaris bahan baku restoran Anda dengan mudah dan efisien
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            {[
              { label: 'Real-time', value: 'Tracking' },
              { label: 'Smart', value: 'Alerts' },
              { label: 'Detailed', value: 'Reports' },
            ].map((feature, index) => (
              <div
                key={feature.label}
                className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm"
              >
                <p className="text-2xl font-bold text-white">{feature.value}</p>
                <p className="text-sm text-white/70">{feature.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -left-24 w-48 h-48 rounded-full bg-white/5" />
      </motion.div>
    </div>
  )
}