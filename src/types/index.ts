// User types
export type UserRole = 'super_admin' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  status: 'active' | 'inactive'
  lastLogin?: Date
  createdAt: Date
}

// Barang types
export type KondisiBarang = 'baik' | 'rusak' | 'kadaluarsa'
export type StatusStok = 'tersedia' | 'menipis' | 'habis'

export interface Kategori {
  id: string
  name: string
  description?: string
}

export interface Barang {
  id: string
  name: string
  kategori: Kategori
  satuan: string
  stok: number
  stokMinimum: number
  hargaPerUnit: number
  lokasi: string
  kondisi: KondisiBarang
  tanggalKadaluarsa?: Date
  catatan?: string
  createdAt: Date
  updatedAt: Date
}

// Transaksi types
export type TransaksiType = 'masuk' | 'keluar'

export interface TransaksiMasuk {
  id: string
  barang: Barang
  jumlah: number
  tanggal: Date
  supplier: string
  catatan?: string
  createdBy: User
  createdAt: Date
}

export interface TransaksiKeluar {
  id: string
  barang: Barang
  jumlah: number
  tanggal: Date
  alasan: string
  catatan?: string
  createdBy: User
  createdAt: Date
}

// Notification types
export type NotificationType = 'warning' | 'info' | 'success' | 'danger'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
}

// Dashboard types
export interface DashboardStats {
  totalBarang: number
  totalNilaiInventaris: number
  totalBarangMasuk: number
  totalBarangKeluar: number
  barangStokRendah: number
}

export interface ChartData {
  name: string
  masuk: number
  keluar: number
}

export interface KategoriDistribution {
  name: string
  value: number
  color: string
}
