import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value)
}

export const formatDate = (date: Date | string, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return '-'
  return format(dateObj, formatStr, { locale: idLocale })
}

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd MMM yyyy, HH:mm')
}

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return '-'
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: idLocale })
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const formatStockStatus = (stok: number, stokMinimum: number): 'Normal' | 'Rendah' | 'Habis' => {
  if (stok === 0) return 'Habis'
  if (stok <= stokMinimum) return 'Rendah'
  return 'Normal'
}

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'normal':
    case 'baik':
    case 'active':
      return 'success'
    case 'rendah':
    case 'warning':
      return 'warning'
    case 'habis':
    case 'rusak':
    case 'kadaluarsa':
    case 'inactive':
      return 'danger'
    default:
      return 'info'
  }
}
