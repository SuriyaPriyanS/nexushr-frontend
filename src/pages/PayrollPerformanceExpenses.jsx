import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { payrollAPI, performanceAPI, expenseAPI } from '../services/api'
import DataTable from '../components/ui/DataTable'
import { Badge, Modal, FormField, LoadingState } from '../components/ui'
import { formatDate, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'

// ── Payroll ───────────────────────────────────────────────────────────────────
export function Payroll() {
  const { data, loading, refetch } = useFetch(payrollAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const records = Array.isArray(data) ? data : []

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await payrollAPI.create({ ...form, basicSalary: Number(form.basicSalary), bonus: Number(form.bonus || 0), deductions: Number(form.deductions || 0) })
      toast.success('Payroll record created')
      refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Employee', accessorKey: 'employee', cell: ({ row }) => { const r = row.original; return <span className="text-sm font-medium">{r.employee?.firstName ? `${r.employee.firstName} ${r.employee.lastName}` : (r.employeeName || '—')}</span> } },
    { header: 'Period', accessorKey: 'period', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Basic Salary', accessorKey: 'basicSalary', cell: ({ getValue }) => <span className="text-sm font-medium">{formatCurrency(getValue())}</span> },
    { header: 'Bonus', accessorKey: 'bonus', cell: ({ getValue }) => <span className="text-sm text-emerald-600">{formatCurrency(getValue())}</span> },
    { header: 'Deductions', accessorKey: 'deductions', cell: ({ getValue }) => <span className="text-sm text-red-500">{formatCurrency(getValue())}</span> },
    { header: 'Net Pay', id: 'net', cell: ({ row }) => { const r = row.original; const net = (r.basicSalary || 0) + (r.bonus || 0) - (r.deductions || 0); return <span className="text-sm font-bold text-slate-900">{formatCurrency(net)}</span> } },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue() || 'pending'}>{getValue() || 'Pending'}</Badge> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Payroll</h2><p className="text-sm text-slate-500 mt-0.5">{records.length} records</p></div>
      </div>
      <DataTable data={records} columns={columns} searchPlaceholder="Search payroll..." emptyMessage="No payroll records"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Record</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Payroll Record">
        <PayrollForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function PayrollForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ employeeId: '', period: '', basicSalary: '', bonus: '', deductions: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Employee ID" required><input className="input-field" value={form.employeeId} onChange={set('employeeId')} required /></FormField>
      <FormField label="Period (e.g. March 2024)"><input className="input-field" value={form.period} onChange={set('period')} placeholder="March 2024" /></FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Basic Salary"><input type="number" className="input-field" value={form.basicSalary} onChange={set('basicSalary')} /></FormField>
        <FormField label="Bonus"><input type="number" className="input-field" value={form.bonus} onChange={set('bonus')} /></FormField>
        <FormField label="Deductions"><input type="number" className="input-field" value={form.deductions} onChange={set('deductions')} /></FormField>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
      </div>
    </form>
  )
}

// ── Performance ───────────────────────────────────────────────────────────────
export function Performance() {
  const { data, loading, refetch } = useFetch(performanceAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const reviews = Array.isArray(data) ? data : []

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await performanceAPI.create({ ...form, rating: Number(form.rating) })
      toast.success('Review created'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Employee', accessorKey: 'employee', cell: ({ row }) => { const r = row.original; return <span className="text-sm font-medium">{r.employee?.firstName ? `${r.employee.firstName} ${r.employee.lastName}` : (r.employeeName || '—')}</span> } },
    { header: 'Review Period', accessorKey: 'reviewPeriod', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Rating', accessorKey: 'rating', cell: ({ getValue }) => {
      const v = getValue(); if (!v) return '—'
      return <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < v ? 'text-amber-400' : 'text-slate-200'}>★</span>)}<span className="text-sm ml-1 font-medium">{v}/5</span></div>
    }},
    { header: 'Comments', accessorKey: 'comments', cell: ({ getValue }) => <span className="text-sm text-slate-500 truncate max-w-[200px] block">{getValue() || '—'}</span> },
    { header: 'Date', accessorKey: 'reviewDate', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Performance Reviews</h2><p className="text-sm text-slate-500 mt-0.5">{reviews.length} reviews</p></div>
      </div>
      <DataTable data={reviews} columns={columns} searchPlaceholder="Search reviews..." emptyMessage="No reviews yet"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Review</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Performance Review">
        <PerformanceForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function PerformanceForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ employeeId: '', reviewPeriod: '', rating: '3', comments: '', reviewDate: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Employee ID" required><input className="input-field" value={form.employeeId} onChange={set('employeeId')} required /></FormField>
      <FormField label="Review Period"><input className="input-field" value={form.reviewPeriod} onChange={set('reviewPeriod')} placeholder="Q1 2024" /></FormField>
      <FormField label="Rating (1-5)">
        <select className="input-field" value={form.rating} onChange={set('rating')}>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {'★'.repeat(n)}</option>)}
        </select>
      </FormField>
      <FormField label="Comments">
        <textarea className="input-field resize-none" rows={3} value={form.comments} onChange={set('comments')} />
      </FormField>
      <FormField label="Review Date"><input type="date" className="input-field" value={form.reviewDate} onChange={set('reviewDate')} /></FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Submit Review'}</button>
      </div>
    </form>
  )
}

// ── Expenses ──────────────────────────────────────────────────────────────────
export function Expenses() {
  const { data, loading, refetch } = useFetch(expenseAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const expenses = Array.isArray(data) ? data : []

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const pending = expenses.filter(e => e.status?.toLowerCase() === 'pending').length

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await expenseAPI.create({ ...form, amount: Number(form.amount) })
      toast.success('Expense submitted'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Employee', accessorKey: 'employee', cell: ({ row }) => { const r = row.original; return <span className="text-sm font-medium">{r.employee?.firstName ? `${r.employee.firstName} ${r.employee.lastName}` : (r.employeeName || '—')}</span> } },
    { header: 'Category', accessorKey: 'category', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Description', accessorKey: 'description', cell: ({ getValue }) => <span className="text-sm text-slate-500 truncate max-w-[160px] block">{getValue() || '—'}</span> },
    { header: 'Amount', accessorKey: 'amount', cell: ({ getValue }) => <span className="text-sm font-semibold">{formatCurrency(getValue())}</span> },
    { header: 'Date', accessorKey: 'date', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue() || 'pending'}>{getValue() || 'Pending'}</Badge> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Expenses</h2><p className="text-sm text-slate-500 mt-0.5">{pending} pending · {formatCurrency(total)} total</p></div>
      </div>
      <DataTable data={expenses} columns={columns} searchPlaceholder="Search expenses..." emptyMessage="No expenses"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Expense</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Expense">
        <ExpenseForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function ExpenseForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ category: '', description: '', amount: '', date: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Category"><input className="input-field" value={form.category} onChange={set('category')} placeholder="Travel, Meals, Software..." /></FormField>
      <FormField label="Description"><textarea className="input-field resize-none" rows={2} value={form.description} onChange={set('description')} /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Amount (USD)" required><input type="number" step="0.01" className="input-field" value={form.amount} onChange={set('amount')} required /></FormField>
        <FormField label="Date"><input type="date" className="input-field" value={form.date} onChange={set('date')} /></FormField>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit'}</button>
      </div>
    </form>
  )
}
