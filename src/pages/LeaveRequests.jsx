import { useState, useMemo } from 'react'
import { Plus, CheckCircle, XCircle, CalendarOff } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { leaveAPI } from '../services/api'
import DataTable from '../components/ui/DataTable'
import { Badge, Modal, FormField, LoadingState, EmptyState, Card } from '../components/ui'
import { formatDate, LEAVE_TYPES } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function LeaveRequests() {
  const { data, loading, refetch } = useFetch(leaveAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const leaves = Array.isArray(data) ? data : []

  const pending = leaves.filter(l => l.status?.toLowerCase() === 'pending').length
  const approved = leaves.filter(l => l.status?.toLowerCase() === 'approved').length

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await leaveAPI.request(form)
      toast.success('Leave request submitted')
      refetch()
      setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit') }
    finally { setSaving(false) }
  }

  const handleStatus = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, { status })
      toast.success(`Leave ${status.toLowerCase()}`)
      refetch()
    } catch { toast.error('Failed to update status') }
  }

  const columns = useMemo(() => [
    {
      header: 'Employee', accessorKey: 'employee',
      cell: ({ row }) => {
        const r = row.original
        const name = r.employee?.firstName ? `${r.employee.firstName} ${r.employee.lastName}` : (r.employeeName || 'Employee')
        return <span className="text-sm font-medium text-slate-800">{name}</span>
      }
    },
    { header: 'Type', accessorKey: 'leaveType', cell: ({ getValue }) => <span className="text-sm">{getValue()}</span> },
    { header: 'From', accessorKey: 'startDate', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'To', accessorKey: 'endDate', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'Reason', accessorKey: 'reason', cell: ({ getValue }) => <span className="text-sm text-slate-500 truncate max-w-[180px] block">{getValue() || '—'}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue()}>{getValue()}</Badge> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => {
        const r = row.original
        if (r.status?.toLowerCase() !== 'pending') return null
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => handleStatus(r._id, 'Approved')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
              <CheckCircle className="h-3 w-3" /> Approve
            </button>
            <button onClick={() => handleStatus(r._id, 'Rejected')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
              <XCircle className="h-3 w-3" /> Reject
            </button>
          </div>
        )
      }
    },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leave Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">{pending} pending · {approved} approved</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pending, color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Approved', count: approved, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Total', count: leaves.length, color: 'bg-brand-50 text-brand-700 border-brand-200' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        data={leaves}
        columns={columns}
        searchPlaceholder="Search leave requests..."
        emptyMessage="No leave requests"
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Request Leave
          </button>
        }
      />

      <LeaveModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} saving={saving} />
    </div>
  )
}

function LeaveModal({ isOpen, onClose, onSave, saving }) {
  const [form, setForm] = useState({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Leave">
      <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
        <FormField label="Leave Type" required>
          <select className="input-field" value={form.leaveType} onChange={set('leaveType')}>
            {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" required><input type="date" className="input-field" value={form.startDate} onChange={set('startDate')} required /></FormField>
          <FormField label="End Date" required><input type="date" className="input-field" value={form.endDate} onChange={set('endDate')} required /></FormField>
        </div>
        <FormField label="Reason">
          <textarea className="input-field resize-none" rows={3} value={form.reason} onChange={set('reason')} placeholder="Reason for leave..." />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</button>
        </div>
      </form>
    </Modal>
  )
}
