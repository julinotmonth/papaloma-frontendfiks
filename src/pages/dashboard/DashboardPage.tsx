import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Wallet,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Calendar,
  Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard, Badge, LoadingSpinner } from '@/components/common'
import { TrendChart, StockBarChart, CategoryPieChart } from '@/components/charts'
import { useInventoryStore } from '@/stores/inventoryStore'
import { formatCurrency, formatDate, getStockStatus } from '@/lib/utils'

export function DashboardPage() {
  const {
    dashboardStats,
    chartData,
    kategoriDistribution,
    topUsedItems,
    recentActivities,
    lowStockItems,
    isLoadingDashboard,
    fetchAllDashboardData,
  } = useInventoryStore()

  useEffect(() => {
    fetchAllDashboardData()
  }, [fetchAllDashboardData])

  if (isLoadingDashboard && !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = dashboardStats || {
    totalBarang: 0,
    totalNilaiInventaris: 0,
    totalBarangMasuk: 0,
    totalBarangKeluar: 0,
    barangStokRendah: 0,
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Ringkasan inventaris Restoran Papaloma
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(new Date())}</span>
          {isLoadingDashboard && (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Jenis Barang"
          value={stats.totalBarang}
          icon={Package}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Nilai Inventaris"
          value={formatCurrency(stats.totalNilaiInventaris)}
          icon={Wallet}
          color="accent"
          delay={0.1}
        />
        <StatCard
          title="Barang Masuk"
          value={stats.totalBarangMasuk}
          subtitle="Bulan ini"
          icon={PackagePlus}
          color="success"
          delay={0.2}
        />
        <StatCard
          title="Barang Keluar"
          value={stats.totalBarangKeluar}
          subtitle="Bulan ini"
          icon={PackageMinus}
          color="danger"
          delay={0.3}
        />
        <StatCard
          title="Stok Rendah"
          value={stats.barangStokRendah}
          subtitle="Perlu restock"
          icon={AlertTriangle}
          color="warning"
          delay={0.4}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Tren Barang Masuk & Keluar
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                12 bulan terakhir
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-slate-600 dark:text-slate-400">Masuk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger-500" />
                <span className="text-slate-600 dark:text-slate-400">Keluar</span>
              </div>
            </div>
          </div>
          <TrendChart data={chartData} />
        </motion.div>

        {/* Category pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6">
            Distribusi Kategori
          </h3>
          <CategoryPieChart data={kategoriDistribution} />
        </motion.div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top used items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Top Pemakaian Barang
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                8 barang dengan pemakaian tertinggi
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <StockBarChart data={topUsedItems} />
        </motion.div>

        {/* Low stock alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Stok Menipis
            </h3>
            <Badge variant="warning">{lowStockItems.length} item</Badge>
          </div>
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                Semua stok dalam kondisi aman
              </p>
            ) : (
              lowStockItems.slice(0, 5).map((item) => {
                const status = getStockStatus(item.stok, item.stokMinimum)
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Min: {item.stokMinimum} {item.satuan}
                      </p>
                    </div>
                    <Badge
                      variant={status === 'low' ? 'danger' : 'warning'}
                    >
                      {item.stok} {item.satuan}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
          {lowStockItems.length > 0 && (
            <Link
              to="/barang"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-colors"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Aktivitas Terbaru
          </h3>
          <Link
            to="/barang"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="table-header">Jenis</th>
                <th className="table-header">Barang</th>
                <th className="table-header">Jumlah</th>
                <th className="table-header">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Belum ada aktivitas terbaru
                  </td>
                </tr>
              ) : (
                recentActivities.slice(0, 5).map((activity) => (
                  <tr key={`${activity.type}-${activity.id}`} className="table-row">
                    <td className="table-cell">
                      <Badge variant={activity.type === 'masuk' ? 'success' : 'danger'}>
                        {activity.type === 'masuk' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </td>
                    <td className="table-cell font-medium">{activity.barang}</td>
                    <td className="table-cell">
                      {activity.jumlah} {activity.satuan}
                    </td>
                    <td className="table-cell text-slate-500">
                      {formatDate(activity.tanggal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
