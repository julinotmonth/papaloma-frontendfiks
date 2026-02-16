import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, PackageMinus, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge, EmptyState, LoadingSpinner } from '@/components/common'
import { useInventoryStore } from '@/stores/inventoryStore'
import { cn, formatDate } from '@/lib/utils'

const transaksiSchema = z.object({
  barangId: z.string().min(1, 'Barang harus dipilih'),
  jumlah: z.number().min(1, 'Jumlah minimal 1'),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  alasan: z.string().min(1, 'Alasan harus diisi'),
  catatan: z.string().optional(),
})

type TransaksiFormData = z.infer<typeof transaksiSchema>

export function BarangKeluarPage() {
  const { 
    transaksiKeluar, 
    barang, 
    transaksiKeluarPagination,
    isLoadingTransaksiKeluar,
    isLoading,
    fetchTransaksiKeluar, 
    fetchBarang,
    addTransaksiKeluar 
  } = useInventoryStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBarang, setSelectedBarang] = useState<typeof barang[0] | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransaksiFormData>({
    resolver: zodResolver(transaksiSchema),
    defaultValues: {
      tanggal: new Date().toISOString().split('T')[0],
      jumlah: 1,
    },
  })

  const watchBarangId = watch('barangId')

  useEffect(() => {
    fetchBarang({ limit: 100 })
  }, [fetchBarang])

  useEffect(() => {
    if (watchBarangId) {
      const found = barang.find(b => b.id === parseInt(watchBarangId))
      setSelectedBarang(found || null)
    } else {
      setSelectedBarang(null)
    }
  }, [watchBarangId, barang])

  useEffect(() => {
    const params: Record<string, unknown> = { page: currentPage, limit: 10 }
    if (searchQuery) params.search = searchQuery
    
    const debounce = setTimeout(() => {
      fetchTransaksiKeluar(params)
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchTransaksiKeluar, currentPage, searchQuery])

  const totalPages = transaksiKeluarPagination?.totalPages || 1

  const onSubmit = async (data: TransaksiFormData) => {
    const success = await addTransaksiKeluar({
      barangId: parseInt(data.barangId),
      jumlah: data.jumlah,
      tanggal: data.tanggal,
      alasan: data.alasan,
      catatan: data.catatan,
    })
    if (success) {
      setShowForm(false)
      reset()
    }
  }

  const alasanOptions = [
    'Pemakaian harian',
    'Rusak',
    'Kadaluarsa',
    'Hilang',
    'Retur supplier',
    'Lainnya',
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Barang Keluar</h1>
          <p className="text-slate-500 dark:text-slate-400">Catat barang yang keluar dari inventaris</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true); }} className="btn-danger">
          <Plus className="w-4 h-4" />
          Tambah Barang Keluar
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoadingTransaksiKeluar ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : transaksiKeluar.length === 0 ? (
          <EmptyState icon={PackageMinus} title="Belum ada data barang keluar" description="Mulai dengan mencatat barang keluar pertama" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="table-header">Tanggal</th>
                    <th className="table-header">Barang</th>
                    <th className="table-header">Jumlah</th>
                    <th className="table-header">Alasan</th>
                    <th className="table-header">Dicatat oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksiKeluar.map((item) => (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell">{formatDate(item.tanggal)}</td>
                      <td className="table-cell">
                        <div className="font-medium text-slate-900 dark:text-white">{item.barang?.name || '[Barang Terhapus]'}</div>
                        <div className="text-xs text-slate-500">{item.barang?.kategori?.name || '-'}</div>
                      </td>
                      <td className="table-cell">
                        <Badge variant="danger">-{item.jumlah} {item.barang?.satuan || 'unit'}</Badge>
                      </td>
                      <td className="table-cell">{item.alasan}</td>
                      <td className="table-cell text-slate-500">{item.createdBy?.name || '[User Terhapus]'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn-secondary h-9 w-9 p-0 disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="btn-secondary h-9 w-9 p-0 disabled:opacity-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tambah Barang Keluar</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Barang</label>
                  <select className={cn('input', errors.barangId && 'input-error')} {...register('barangId')}>
                    <option value="">Pilih Barang</option>
                    {barang.map((b) => (<option key={b.id} value={b.id}>{b.name} ({b.stok} {b.satuan})</option>))}
                  </select>
                  {errors.barangId && <p className="mt-1 text-xs text-danger-500">{errors.barangId.message}</p>}
                  {selectedBarang && (
                    <p className="mt-1 text-xs text-slate-500">Stok tersedia: {selectedBarang.stok} {selectedBarang.satuan}</p>
                  )}
                </div>

                <div>
                  <label className="label">Jumlah</label>
                  <input type="number" className={cn('input', errors.jumlah && 'input-error')} max={selectedBarang?.stok || undefined} {...register('jumlah', { valueAsNumber: true })} />
                  {errors.jumlah && <p className="mt-1 text-xs text-danger-500">{errors.jumlah.message}</p>}
                </div>

                <div>
                  <label className="label">Tanggal</label>
                  <input type="date" className={cn('input', errors.tanggal && 'input-error')} {...register('tanggal')} />
                  {errors.tanggal && <p className="mt-1 text-xs text-danger-500">{errors.tanggal.message}</p>}
                </div>

                <div>
                  <label className="label">Alasan</label>
                  <select className={cn('input', errors.alasan && 'input-error')} {...register('alasan')}>
                    <option value="">Pilih Alasan</option>
                    {alasanOptions.map((a) => (<option key={a} value={a}>{a}</option>))}
                  </select>
                  {errors.alasan && <p className="mt-1 text-xs text-danger-500">{errors.alasan.message}</p>}
                </div>

                <div>
                  <label className="label">Catatan (opsional)</label>
                  <textarea rows={3} className="input resize-none" placeholder="Catatan tambahan" {...register('catatan')} />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Batal</button>
                  <button type="submit" disabled={isLoading} className="flex-1 btn-danger">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
