import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronRight,
  Check,
  Trash2,
} from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUIStore } from '@/stores/uiStore'

const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  barang: 'Data Barang',
  'barang-masuk': 'Barang Masuk',
  'barang-keluar': 'Barang Keluar',
  laporan: 'Laporan',
  'admin-area': 'Kelola Admin',
  profil: 'Profil Saya',
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore()
  const { toggleSidebar, toggleDarkMode, darkMode } = useUIStore()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications({ limit: 10 })
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const pathSegments = location.pathname.split('/').filter(Boolean)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getNotificationIcon = (type: string) => {
    const colors = {
      warning: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400',
      danger: 'bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-400',
      success: 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400',
      info: 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',
    }
    return colors[type as keyof typeof colors] || colors.info
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {pathSegments.map((segment, index) => (
              <div key={segment} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <span
                  className={cn(
                    index === pathSegments.length - 1
                      ? 'text-slate-900 dark:text-white font-medium'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {breadcrumbLabels[segment] || segment}
                </span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        Tidak ada notifikasi
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors',
                            !notification.read && 'bg-primary-50/50 dark:bg-primary-500/5'
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', getNotificationIcon(notification.type))}>
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{notification.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDateTime(notification.created_at)}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {!notification.read && (
                                <button onClick={() => markAsRead(notification.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Tandai dibaca">
                                  <Check className="w-3 h-3 text-slate-400" />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(notification.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Hapus">
                                <Trash2 className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium text-sm">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
              </div>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || ''}</p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => { navigate('/profil'); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      Profil Saya
                    </button>
                    <button
                      onClick={() => { navigate('/profil'); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4" />
                      Pengaturan
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
