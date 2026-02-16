import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  Loader2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge, ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/common'
import { useInventoryStore } from '@/stores/inventoryStore'
import { cn, formatCurrency, formatDate, getStockStatus } from '@/lib/utils'
import { Barang } from '@/lib/api'

const barangSchema = z.object({
  name: z.string().min(1, 'Nama barang harus diisi'),
  kategoriId: z.string().min(1, 'Kategori harus dipilih'),
  satuan: z.string().min(1, 'Satuan harus diisi'),
  stok: z.number().min(0, 'Stok tidak boleh negatif'),
  stokMinimum: z.number().min(0, 'Stok minimum tidak boleh negatif'),
  hargaPerUnit: z.number().min(0, 'Harga tidak boleh negatif'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  kondisi: z.enum(['baik', 'rusak', 'kadaluarsa']),
  tanggalKadaluarsa: z.string().optional(),
  catatan: z.string().optional(),
})

type BarangFormData = z.infer<typeof barangSchema>
type KondisiBarang = 'baik' | 'rusak' | 'kadaluarsa'

// Mapping kategori ke satuan yang umum digunakan
const kategoriToSatuan: Record<string, string[]> = {
  'Bumbu Dapur': ['gram', 'kg', 'ons', 'sachet', 'botol'],
  'Daging & Unggas': ['kg', 'gram', 'ekor', 'potong'],
  'Dairy & Telur': ['liter', 'ml', 'gram', 'kg', 'butir', 'pack'],
  'Kering & Tepung': ['kg', 'gram', 'ons', 'pack', 'karung'],
  'Minuman': ['liter', 'ml', 'botol', 'kaleng', 'gelas', 'pack'],
  'Minyak & Saus': ['liter', 'ml', 'botol', 'kg', 'gram'],
  'Sayuran': ['kg', 'gram', 'ikat', 'buah', 'potong'],
  'Buah-buahan': ['kg', 'gram', 'buah', 'ikat', 'pack'],
  'Seafood': ['kg', 'gram', 'ekor', 'pack'],
  'Kue & Roti': ['buah', 'pack', 'box', 'loyang'],
  'default': ['kg', 'gram', 'liter', 'ml', 'buah', 'pack', 'botol', 'kaleng']
}

export function BarangListPage() {
  const { 
    barang, 
    kategori, 
    barangPagination,
    isLoadingBarang,
    isLoading,
    fetchBarang, 
    fetchKategori,
    addBarang, 
    updateBarang, 
    deleteBarang 
  } = useInventoryStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterKondisi, setFilterKondisi] = useState('')
  const [filterStok, setFilterStok] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Barang | null>(null)
  const [viewingItem, setViewingItem] = useState<Barang | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [showKategoriForm, setShowKategoriForm] = useState(false)
  const [newKategoriName, setNewKategoriName] = useState('')
  const [newKategoriDesc, setNewKategoriDesc] = useState('')
  const [suggestedSatuan, setSuggestedSatuan] = useState<string[]>([])
  const [customSatuan, setCustomSatuan] = useState('')
  const [showCustomSatuan, setShowCustomSatuan] = useState(false)

  const itemsPerPage = 10

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BarangFormData>({
    resolver: zodResolver(barangSchema),
    defaultValues: {
      kondisi: 'baik',
      stok: 0,
      stokMinimum: 0,
      hargaPerUnit: 0,
    },
  })

  const selectedKategoriId = watch('kategoriId')
  const selectedSatuan = watch('satuan') || 'unit'

  useEffect(() => {
    fetchKategori()
  }, [fetchKategori])

  // Auto-suggest satuan berdasarkan kategori
  useEffect(() => {
    if (selectedKategoriId && Array.isArray(kategori)) {
      const selectedKat = kategori.find(k => k.id === parseInt(selectedKategoriId))
      if (selectedKat) {
        const satuanList = kategoriToSatuan[selectedKat.name] || kategoriToSatuan['default']
        setSuggestedSatuan(satuanList)
        
        // Auto-set satuan pertama jika form baru (bukan edit)
        if (!editingItem) {
          setValue('satuan', satuanList[0])
          setShowCustomSatuan(false)
          setCustomSatuan('')
        }
      }
    } else {
      setSuggestedSatuan(kategoriToSatuan['default'])
    }
  }, [selectedKategoriId, kategori, setValue, editingItem])


  useEffect(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: itemsPerPage,
    }
    if (searchQuery) params.search = searchQuery
    if (filterKategori) params.kategoriId = parseInt(filterKategori)
    if (filterKondisi) params.kondisi = filterKondisi
    if (filterStok) params.stokStatus = filterStok

    const debounce = setTimeout(() => {
      fetchBarang(params)
    }, 300)

    return () => clearTimeout(debounce)
  }, [fetchBarang, currentPage, searchQuery, filterKategori, filterKondisi, filterStok])

  const totalPages = barangPagination?.totalPages || 1

  const openEditForm = (item: Barang) => {
    setEditingItem(item)
    setValue('name', item.name)
    setValue('kategoriId', String(item.kategori.id))
    
    // Check if satuan is in suggested list
    const satuanList = kategoriToSatuan[item.kategori.name] || kategoriToSatuan['default']
    setSuggestedSatuan(satuanList)
    
    if (satuanList.includes(item.satuan)) {
      setValue('satuan', item.satuan)
      setShowCustomSatuan(false)
    } else {
      setValue('satuan', item.satuan)
      setShowCustomSatuan(true)
    }
    
    setValue('stok', item.stok)
    setValue('stokMinimum', item.stokMinimum)
    setValue('hargaPerUnit', item.hargaPerUnit)
    setValue('lokasi', item.lokasi)
    setValue('kondisi', item.kondisi)
    setValue('tanggalKadaluarsa', item.tanggalKadaluarsa ? item.tanggalKadaluarsa.split('T')[0] : '')
    setValue('catatan', item.catatan || '')
    setShowForm(true)
    setOpenDropdown(null)
  }

  const onSubmit = async (data: BarangFormData) => {
    const barangData = {
      name: data.name,
      kategoriId: parseInt(data.kategoriId),
      satuan: data.satuan,
      stok: data.stok,
      stokMinimum: data.stokMinimum,
      hargaPerUnit: data.hargaPerUnit,
      lokasi: data.lokasi,
      kondisi: data.kondisi,
      tanggalKadaluarsa: data.tanggalKadaluarsa || undefined,
      catatan: data.catatan,
    }

    let success = false
    if (editingItem) {
      success = await updateBarang(editingItem.id, barangData)
    } else {
      success = await addBarang(barangData)
    }

    if (success) {
      closeForm()
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setShowCustomSatuan(false)
    setCustomSatuan('')
    setSuggestedSatuan(kategoriToSatuan['default'])
    reset()
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteBarang(deleteId)
      setDeleteId(null)
    }
  }

  const handleAddKategori = async () => {
    if (!newKategoriName.trim()) {
      return
    }

    const success = await useInventoryStore.getState().addKategori({
      name: newKategoriName,
      description: newKategoriDesc || undefined,
    })

    if (success) {
      setShowKategoriForm(false)
      setNewKategoriName('')
      setNewKategoriDesc('')
    }
  }

  const getKondisiBadge = (kondisi: KondisiBarang) => {
    const variants = {
      baik: 'success',
      rusak: 'danger',
      kadaluarsa: 'warning',
    } as const
    const labels = {
      baik: 'Baik',
      rusak: 'Rusak',
      kadaluarsa: 'Kadaluarsa',
    }
    return <Badge variant={variants[kondisi]}>{labels[kondisi]}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Data Barang</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola semua data barang inventaris</p>
        </div>
        <button onClick={() => { reset(); setEditingItem(null); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          Tambah Barang
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={cn('btn-secondary', showFilters && 'bg-primary-50 border-primary-200 text-primary-600')}>
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="label">Kategori</label>
                  <select value={filterKategori} onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }} className="input">
                    <option value="">Semua Kategori</option>
                    {Array.isArray(kategori) && kategori.map((k) => (<option key={k.id} value={k.id}>{k.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="label">Kondisi</label>
                  <select value={filterKondisi} onChange={(e) => { setFilterKondisi(e.target.value); setCurrentPage(1); }} className="input">
                    <option value="">Semua Kondisi</option>
                    <option value="baik">Baik</option>
                    <option value="rusak">Rusak</option>
                    <option value="kadaluarsa">Kadaluarsa</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status Stok</label>
                  <select value={filterStok} onChange={(e) => { setFilterStok(e.target.value); setCurrentPage(1); }} className="input">
                    <option value="">Semua Stok</option>
                    <option value="low">Stok Rendah</option>
                    <option value="normal">Stok Normal</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="card overflow-hidden">
        {isLoadingBarang ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : barang.length === 0 ? (
          <EmptyState icon={Package} title="Belum ada data barang" description="Mulai dengan menambahkan barang pertama Anda" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="table-header">Nama Barang</th>
                    <th className="table-header">Kategori</th>
                    <th className="table-header">Stok</th>
                    <th className="table-header">Harga/Unit</th>
                    <th className="table-header">Lokasi</th>
                    <th className="table-header">Kondisi</th>
                    <th className="table-header text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {barang.map((item) => {
                    const stockStatus = getStockStatus(item.stok, item.stokMinimum)
                    return (
                      <tr key={item.id} className="table-row">
                        <td className="table-cell">
                          <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.satuan}</div>
                        </td>
                        <td className="table-cell">{item.kategori.name}</td>
                        <td className="table-cell">
                          <Badge variant={stockStatus === 'low' ? 'danger' : stockStatus === 'warning' ? 'warning' : 'success'}>
                            {item.stok} {item.satuan}
                          </Badge>
                        </td>
                        <td className="table-cell">{formatCurrency(item.hargaPerUnit)}</td>
                        <td className="table-cell">{item.lokasi}</td>
                        <td className="table-cell">{getKondisiBadge(item.kondisi)}</td>
                        <td className="table-cell text-right">
                          <div className="relative inline-block">
                            <button onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openDropdown === item.id && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                                  <button onClick={() => { setViewingItem(item); setOpenDropdown(null); }} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Lihat Detail
                                  </button>
                                  <button onClick={() => openEditForm(item)} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                    <Pencil className="w-4 h-4" /> Edit
                                  </button>
                                  <button onClick={() => { setDeleteId(item.id); setOpenDropdown(null); }} className="w-full px-3 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Hapus
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeForm} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}</h2>
                <button onClick={closeForm} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Nama Barang</label>
                    <input type="text" className={cn('input', errors.name && 'input-error')} placeholder="Masukkan nama barang" {...register('name')} />
                    {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="label">Kategori</label>
                    <div className="relative">
                      <select className={cn('input', errors.kategoriId && 'input-error')} {...register('kategoriId')}>
                        <option value="">Pilih Kategori</option>
                        {Array.isArray(kategori) && kategori.map((k) => (<option key={k.id} value={k.id}>{k.name}</option>))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowKategoriForm(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                      >
                        + Baru
                      </button>
                    </div>
                    {errors.kategoriId && <p className="mt-1 text-xs text-danger-500">{errors.kategoriId.message}</p>}
                  </div>

                  <div>
                    <label className="label">Satuan</label>
                    {!showCustomSatuan ? (
                      <div className="space-y-2">
                        <select 
                          className={cn('input', errors.satuan && 'input-error')} 
                          {...register('satuan')}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setShowCustomSatuan(true)
                              setValue('satuan', '')
                            }
                          }}
                        >
                          {suggestedSatuan.map((satuan) => (
                            <option key={satuan} value={satuan}>{satuan}</option>
                          ))}
                          <option value="__custom__">+ Satuan Lainnya</option>
                        </select>
                        <p className="text-xs text-slate-500">
                          💡 Satuan disesuaikan dengan kategori yang dipilih
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className={cn('input flex-1', errors.satuan && 'input-error')} 
                            placeholder="Masukkan satuan custom" 
                            {...register('satuan')}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomSatuan(false)
                              setValue('satuan', suggestedSatuan[0])
                            }}
                            className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                    {errors.satuan && <p className="mt-1 text-xs text-danger-500">{errors.satuan.message}</p>}
                  </div>

                  <div>
                    <label className="label">Stok</label>
                    <input type="number" className={cn('input', errors.stok && 'input-error')} placeholder="0" {...register('stok', { valueAsNumber: true })} />
                    {errors.stok && <p className="mt-1 text-xs text-danger-500">{errors.stok.message}</p>}
                  </div>

                  <div>
                    <label className="label">Stok Minimum</label>
                    <input type="number" className={cn('input', errors.stokMinimum && 'input-error')} placeholder="0" {...register('stokMinimum', { valueAsNumber: true })} />
                  </div>

                  <div>
                    <label className="label">Harga per {selectedSatuan || 'Unit'}</label>
                    <input type="number" className={cn('input', errors.hargaPerUnit && 'input-error')} placeholder="0" {...register('hargaPerUnit', { valueAsNumber: true })} />
                  </div>

                  <div>
                    <label className="label">Lokasi Penyimpanan</label>
                    <input type="text" className={cn('input', errors.lokasi && 'input-error')} placeholder="Contoh: Freezer A1" {...register('lokasi')} />
                    {errors.lokasi && <p className="mt-1 text-xs text-danger-500">{errors.lokasi.message}</p>}
                  </div>

                  <div>
                    <label className="label">Kondisi</label>
                    <select className="input" {...register('kondisi')}>
                      <option value="baik">Baik</option>
                      <option value="rusak">Rusak</option>
                      <option value="kadaluarsa">Kadaluarsa</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Tanggal Kadaluarsa</label>
                    <input type="date" className="input" {...register('tanggalKadaluarsa')} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label">Catatan</label>
                    <textarea rows={3} className="input resize-none" placeholder="Catatan tambahan (opsional)" {...register('catatan')} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeForm} className="flex-1 btn-secondary">Batal</button>
                  <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingItem(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detail Barang</h2>
                <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{viewingItem.name}</h3>
                    <p className="text-slate-500">{viewingItem.kategori.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div><p className="text-sm text-slate-500">Stok</p><p className="font-semibold text-slate-900 dark:text-white">{viewingItem.stok} {viewingItem.satuan}</p></div>
                  <div><p className="text-sm text-slate-500">Stok Minimum</p><p className="font-semibold text-slate-900 dark:text-white">{viewingItem.stokMinimum} {viewingItem.satuan}</p></div>
                  <div><p className="text-sm text-slate-500">Harga/Unit</p><p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(viewingItem.hargaPerUnit)}</p></div>
                  <div><p className="text-sm text-slate-500">Total Nilai</p><p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(viewingItem.stok * viewingItem.hargaPerUnit)}</p></div>
                  <div><p className="text-sm text-slate-500">Lokasi</p><p className="font-semibold text-slate-900 dark:text-white">{viewingItem.lokasi}</p></div>
                  <div><p className="text-sm text-slate-500">Kondisi</p>{getKondisiBadge(viewingItem.kondisi)}</div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => { setViewingItem(null); openEditForm(viewingItem); }} className="flex-1 btn-secondary"><Pencil className="w-4 h-4" /> Edit</button>
                  <button onClick={() => setViewingItem(null)} className="flex-1 btn-primary">Tutup</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kategori Form Modal */}
      <AnimatePresence>
        {showKategoriForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => {
                setShowKategoriForm(false)
                setNewKategoriName('')
                setNewKategoriDesc('')
              }} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tambah Kategori Baru</h2>
                <button 
                  onClick={() => {
                    setShowKategoriForm(false)
                    setNewKategoriName('')
                    setNewKategoriDesc('')
                  }} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Nama Kategori <span className="text-danger-500">*</span></label>
                  <input
                    type="text"
                    value={newKategoriName}
                    onChange={(e) => setNewKategoriName(e.target.value)}
                    className="input"
                    placeholder="Contoh: Bumbu Dapur, Sayuran, dll"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="label">Deskripsi (Opsional)</label>
                  <textarea
                    value={newKategoriDesc}
                    onChange={(e) => setNewKategoriDesc(e.target.value)}
                    rows={3}
                    className="input resize-none"
                    placeholder="Deskripsi kategori..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowKategoriForm(false)
                      setNewKategoriName('')
                      setNewKategoriDesc('')
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddKategori}
                    disabled={!newKategoriName.trim() || isLoading}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Kategori'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Barang" description="Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan." confirmText="Hapus" variant="danger" />
    </div>
  )
}