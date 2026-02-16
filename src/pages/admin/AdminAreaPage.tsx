import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, MoreHorizontal, UserCheck, UserX, Key, Trash2, X, Loader2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge, ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/common'
import { useUserStore } from '@/stores/userStore'
import { cn, formatDate } from '@/lib/utils'
import { User } from '@/lib/api'

const userSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  role: z.enum(['admin', 'super_admin']),
  status: z.enum(['active', 'inactive']),
})

type UserFormData = z.infer<typeof userSchema>

export function AdminAreaPage() {
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser, resetPassword, toggleStatus } = useUserStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'admin', status: 'active' },
  })

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers({ search: searchQuery || undefined })
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchUsers, searchQuery])

  const openEditForm = (user: User) => {
    setEditingUser(user)
    setValue('name', user.name)
    setValue('email', user.email)
    setValue('role', user.role)
    setValue('status', user.status)
    setValue('password', '')
    setShowForm(true)
    setOpenDropdown(null)
  }

  const onSubmit = async (data: UserFormData) => {
    let success = false
    if (editingUser) {
      success = await updateUser(editingUser.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
      })
    } else {
      if (!data.password) return
      success = await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
      })
    }
    if (success) {
      setShowForm(false)
      setEditingUser(null)
      reset()
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteUser(deleteId)
      setDeleteId(null)
    }
  }

  const handleResetPassword = async () => {
    if (resetPasswordId && newPassword.length >= 6) {
      await resetPassword(resetPasswordId, newPassword)
      setResetPasswordId(null)
      setNewPassword('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Kelola Admin</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola pengguna sistem</p>
        </div>
        <button onClick={() => { reset(); setEditingUser(null); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          Tambah Admin
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada admin" description="Mulai dengan menambahkan admin pertama" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="table-header">Nama</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Login Terakhir</th>
                  <th className="table-header text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell font-medium text-slate-900 dark:text-white">{user.name}</td>
                    <td className="table-cell text-slate-500">{user.email}</td>
                    <td className="table-cell">
                      <Badge variant={user.role === 'super_admin' ? 'info' : 'default'}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="table-cell text-slate-500">{user.last_login ? formatDate(user.last_login) : '-'}</td>
                    <td className="table-cell text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openDropdown === user.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                              <button onClick={() => openEditForm(user)} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                <UserCheck className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => { toggleStatus(user.id); setOpenDropdown(null); }} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                              <button onClick={() => { setResetPasswordId(user.id); setOpenDropdown(null); }} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Key className="w-4 h-4" /> Reset Password
                              </button>
                              <button onClick={() => { setDeleteId(user.id); setOpenDropdown(null); }} className="w-full px-3 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Hapus
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editingUser ? 'Edit Admin' : 'Tambah Admin Baru'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Nama</label>
                  <input type="text" className={cn('input', errors.name && 'input-error')} {...register('name')} />
                  {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="label">Email</label>
                  <input type="email" className={cn('input', errors.email && 'input-error')} {...register('email')} />
                  {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>}
                </div>

                {!editingUser && (
                  <div>
                    <label className="label">Password</label>
                    <input type="password" className={cn('input', errors.password && 'input-error')} {...register('password')} />
                    {errors.password && <p className="mt-1 text-xs text-danger-500">{errors.password.message}</p>}
                  </div>
                )}

                <div>
                  <label className="label">Role</label>
                  <select className="input" {...register('role')}>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select className="input" {...register('status')}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Batal</button>
                  <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingUser ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetPasswordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setResetPasswordId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Reset Password</h2>
              <div>
                <label className="label">Password Baru</label>
                <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setResetPasswordId(null); setNewPassword(''); }} className="flex-1 btn-secondary">Batal</button>
                <button onClick={handleResetPassword} disabled={newPassword.length < 6 || isLoading} className="flex-1 btn-primary disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Admin" description="Apakah Anda yakin ingin menghapus admin ini?" confirmText="Hapus" variant="danger" />
    </div>
  )
}
