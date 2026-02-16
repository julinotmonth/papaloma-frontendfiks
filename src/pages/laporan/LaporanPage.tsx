import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Package, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react'
import { Badge, LoadingSpinner } from '@/components/common'
import { laporanApi, StokReport, MasukReport, KeluarReport, PenyusutanReport } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type ReportType = 'stok' | 'masuk' | 'keluar' | 'penyusutan'

export function LaporanPage() {
  const [reportType, setReportType] = useState<ReportType>('stok')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [stokReport, setStokReport] = useState<StokReport | null>(null)
  const [masukReport, setMasukReport] = useState<MasukReport | null>(null)
  const [keluarReport, setKeluarReport] = useState<KeluarReport | null>(null)
  const [penyusutanReport, setPenyusutanReport] = useState<PenyusutanReport | null>(null)

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      switch (reportType) {
        case 'stok':
          const stokRes = await laporanApi.getStokReport()
          setStokReport(stokRes.data.data?.report || null)
          break
        case 'masuk':
          const masukRes = await laporanApi.getMasukReport(dateFrom || undefined, dateTo || undefined)
          setMasukReport(masukRes.data.data?.report || null)
          break
        case 'keluar':
          const keluarRes = await laporanApi.getKeluarReport(dateFrom || undefined, dateTo || undefined)
          setKeluarReport(keluarRes.data.data?.report || null)
          break
        case 'penyusutan':
          const penyusutanRes = await laporanApi.getPenyusutanReport()
          setPenyusutanReport(penyusutanRes.data.data?.report || null)
          break
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportType])

  const reportOptions = [
    { key: 'stok', label: 'Laporan Stok', icon: Package, color: 'primary' },
    { key: 'masuk', label: 'Barang Masuk', icon: TrendingUp, color: 'success' },
    { key: 'keluar', label: 'Barang Keluar', icon: TrendingDown, color: 'danger' },
    { key: 'penyusutan', label: 'Penyusutan', icon: AlertTriangle, color: 'warning' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Laporan</h1>
          <p className="text-slate-500 dark:text-slate-400">Generate dan download laporan inventaris</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportOptions.map((option) => (
          <motion.button
            key={option.key}
            onClick={() => setReportType(option.key as ReportType)}
            className={`card p-4 text-left transition-all ${
              reportType === option.key
                ? `ring-2 ring-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-500/10`
                : 'hover:shadow-md'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <option.icon className={`w-6 h-6 mb-2 text-${option.color}-500`} />
            <p className="font-medium text-slate-900 dark:text-white">{option.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Date Filter for masuk/keluar */}
      {(reportType === 'masuk' || reportType === 'keluar') && (
        <div className="card p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label">Dari Tanggal</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Sampai Tanggal</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />
            </div>
            <button onClick={fetchReport} disabled={isLoading} className="btn-primary">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Filter'}
            </button>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* Stok Report */}
            {reportType === 'stok' && stokReport && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-3 gap-4">
                  <div><p className="text-sm text-slate-500">Total Item</p><p className="text-xl font-bold">{stokReport.summary.totalItems}</p></div>
                  <div><p className="text-sm text-slate-500">Total Nilai</p><p className="text-xl font-bold text-success-600">{formatCurrency(stokReport.summary.totalNilai)}</p></div>
                  <div><p className="text-sm text-slate-500">Stok Rendah</p><p className="text-xl font-bold text-danger-600">{stokReport.summary.lowStockCount}</p></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="table-header">Nama Barang</th>
                        <th className="table-header">Kategori</th>
                        <th className="table-header">Stok</th>
                        <th className="table-header">Harga/Unit</th>
                        <th className="table-header">Total Nilai</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stokReport.items.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell font-medium">{item.name}</td>
                          <td className="table-cell">{item.kategori.name}</td>
                          <td className="table-cell">{item.stok} {item.satuan}</td>
                          <td className="table-cell">{formatCurrency(item.hargaPerUnit)}</td>
                          <td className="table-cell">{formatCurrency(item.totalNilai)}</td>
                          <td className="table-cell">
                            <Badge variant={item.status === 'habis' ? 'danger' : item.status === 'menipis' ? 'warning' : 'success'}>
                              {item.status === 'habis' ? 'Habis' : item.status === 'menipis' ? 'Menipis' : 'Aman'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Masuk Report */}
            {reportType === 'masuk' && masukReport && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-500">Total Transaksi</p><p className="text-xl font-bold">{masukReport.summary.totalTransaksi}</p></div>
                  <div><p className="text-sm text-slate-500">Total Jumlah</p><p className="text-xl font-bold text-success-600">{masukReport.summary.totalJumlah}</p></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="table-header">Tanggal</th>
                        <th className="table-header">Barang</th>
                        <th className="table-header">Jumlah</th>
                        <th className="table-header">Supplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masukReport.items.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell">{formatDate(item.tanggal)}</td>
                          <td className="table-cell font-medium">{item.barang?.name || '[Barang Terhapus]'}</td>
                          <td className="table-cell"><Badge variant="success">+{item.jumlah} {item.barang?.satuan || 'unit'}</Badge></td>
                          <td className="table-cell">{item.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Keluar Report */}
            {reportType === 'keluar' && keluarReport && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-500">Total Transaksi</p><p className="text-xl font-bold">{keluarReport.summary.totalTransaksi}</p></div>
                  <div><p className="text-sm text-slate-500">Total Jumlah</p><p className="text-xl font-bold text-danger-600">{keluarReport.summary.totalJumlah}</p></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="table-header">Tanggal</th>
                        <th className="table-header">Barang</th>
                        <th className="table-header">Jumlah</th>
                        <th className="table-header">Alasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keluarReport.items.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell">{formatDate(item.tanggal)}</td>
                          <td className="table-cell font-medium">{item.barang?.name || '[Barang Terhapus]'}</td>
                          <td className="table-cell"><Badge variant="danger">-{item.jumlah} {item.barang?.satuan || 'unit'}</Badge></td>
                          <td className="table-cell">{item.alasan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Penyusutan Report */}
            {reportType === 'penyusutan' && penyusutanReport && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-3 gap-4">
                  <div><p className="text-sm text-slate-500">Total Item</p><p className="text-xl font-bold">{penyusutanReport.summary.totalItems}</p></div>
                  <div><p className="text-sm text-slate-500">Estimasi Kerugian</p><p className="text-xl font-bold text-danger-600">{formatCurrency(penyusutanReport.summary.totalKerugian)}</p></div>
                  <div><p className="text-sm text-slate-500">Rusak / Kadaluarsa</p><p className="text-xl font-bold">{penyusutanReport.summary.byKondisi.rusak} / {penyusutanReport.summary.byKondisi.kadaluarsa}</p></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="table-header">Nama Barang</th>
                        <th className="table-header">Kondisi</th>
                        <th className="table-header">Stok</th>
                        <th className="table-header">Estimasi Kerugian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {penyusutanReport.items.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell font-medium">{item.name}</td>
                          <td className="table-cell"><Badge variant={item.kondisi === 'rusak' ? 'danger' : 'warning'}>{item.kondisi}</Badge></td>
                          <td className="table-cell">{item.stok} {item.satuan}</td>
                          <td className="table-cell text-danger-600">{formatCurrency(item.estimasiKerugian)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
