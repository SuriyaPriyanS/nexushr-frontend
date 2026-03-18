import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { employeeAPI } from '../services/api'
import DataTable from '../components/ui/DataTable'
import { Avatar, Badge, Modal, FormField, ConfirmDialog, LoadingState, EmptyState } from '../components/ui'
import { formatDate, formatCurrency, DEPARTMENTS, ROLES } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Employees() {
  const { data, loading, refetch } = useFetch(employeeAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const employees = Array.isArray(data) ? data : []

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (emp) => { setEditTarget(emp); setModalOpen(true) }

  const handleDelete = async () => {
    try {
      await employeeAPI.delete(deleteTarget._id)
      toast.success('Employee deleted')
      refetch()
    } catch { toast.error('Failed to delete') }
    finally { setDeleteTarget(null) }
  }

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (editTarget) {
        await employeeAPI.update(editTarget._id, formData)
        toast.success('Employee updated')
      } else {
        await employeeAPI.create(formData)
        toast.success('Employee created')
      }
      refetch()
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    {
      header: 'Employee',
      accessorKey: 'firstName',
      cell: ({ row }) => {
        const e = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar name={`${e.firstName} ${e.lastName}`} src={e.avatar} size="sm" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{e.firstName} {e.lastName}</p>
              <p className="text-xs text-slate-500">{e.email}</p>
            </div>
          </div>
        )
      }
    },
    { header: 'Department', accessorKey: 'department', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Role', accessorKey: 'role', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Join Date', accessorKey: 'joinDate', cell: ({ getValue }) => <span className="text-sm text-slate-500">{formatDate(getValue())}</span> },
    { header: 'Salary', accessorKey: 'salary', cell: ({ getValue }) => <span className="text-sm font-medium">{formatCurrency(getValue())}</span> },
    {
      header: 'Status', accessorKey: 'status',
      cell: ({ getValue }) => <Badge status={getValue() || 'active'}>{getValue() || 'Active'}</Badge>
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => openEdit(row.original)} className="btn-ghost py-1 px-2 text-xs">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleteTarget(row.original)} className="btn-ghost py-1 px-2 text-xs text-red-500 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Employees</h2>
          <p className="text-sm text-slate-500 mt-0.5">{employees.length} total members</p>
        </div>
      </div>

      <DataTable
        data={employees}
        columns={columns}
        searchPlaceholder="Search employees..."
        emptyMessage="No employees found"
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Employee
          </button>
        }
      />

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editTarget}
        saving={saving}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
      />
    </div>
  )
}

function EmployeeModal({ isOpen, onClose, onSave, initial, saving }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    department: '', role: 'Employee', joinDate: '', salary: '',
    ...(initial || {})
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, salary: form.salary ? Number(form.salary) : undefined })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Employee' : 'Add Employee'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label=" Name" required><input className="input-field" value={form.Name} onChange={set('Name')} required /></FormField>
          {/* <FormField label="Last Name" required><input className="input-field" value={form.lastName} onChange={set('lastName')} required /></FormField> */}
        </div>
        <FormField label="Email" required><input type="email" className="input-field" value={form.email} onChange={set('email')} required /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone"><input className="input-field" value={form.phone} onChange={set('phone')} /></FormField>
          <FormField label="Join Date"><input type="date" className="input-field" value={form.joinDate?.slice(0, 10)} onChange={set('joinDate')} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Department">
            <select className="input-field" value={form.department} onChange={set('department')}>
              <option value="">Select...</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Role">
            <select className="input-field" value={form.role} onChange={set('role')}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Salary (USD)">
          <input type="number" className="input-field" value={form.salary} onChange={set('salary')} placeholder="75000" />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : (initial ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
