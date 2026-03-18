import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

export function getStatusColor(status) {
  const map = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-600',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    'in progress': 'bg-purple-100 text-purple-700',
    planning: 'bg-sky-100 text-sky-700',
    cancelled: 'bg-red-100 text-red-600',
    open: 'bg-teal-100 text-teal-700',
    closed: 'bg-slate-100 text-slate-600',
  }
  return map[status?.toLowerCase()] || 'bg-slate-100 text-slate-600'
}

export function truncate(str, n = 40) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

export const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Design', 'Product', 'Legal', 'Support']
export const ROLES = ['Employee', 'Manager', 'HR Manager', 'Admin', 'Director']
export const LEAVE_TYPES = ['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid']

// ── Biometric Helpers ──────────────────────────────────────────────────────────
export { isWebAuthnSupported, generateBiometricChallenge, hashVerificationData, getBiometricMethodIcon, formatConfidence } from './biometricHelpers.js'
