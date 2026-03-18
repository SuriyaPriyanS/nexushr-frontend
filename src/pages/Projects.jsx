import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { projectAPI } from '../services/api'
import DataTable from '../components/ui/DataTable'
import { Badge, Modal, FormField, ConfirmDialog, LoadingState } from '../components/ui'
import { formatDate, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'

const STATUSES = ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled']

export default function Projects() {
  const { data, loading, refetch } = useFetch(projectAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const projects = Array.isArray(data) ? data : []

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editTarget) {
        await projectAPI.update(editTarget._id, form)
        toast.success('Project updated')
      } else {
        await projectAPI.create(form)
        toast.success('Project created')
      }
      refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await projectAPI.delete(deleteTarget._id)
      toast.success('Project deleted')
      refetch()
    } catch { toast.error('Failed to delete') }
    finally { setDeleteTarget(null) }
  }

  const columns = useMemo(() => [
    { header: 'Project Name', accessorKey: 'name', cell: ({ getValue }) => <span className="text-sm font-semibold text-slate-800">{getValue()}</span> },
    { header: 'Description', accessorKey: 'description', cell: ({ getValue }) => <span className="text-sm text-slate-500 truncate max-w-[200px] block">{getValue() || '—'}</span> },
    { header: 'Start', accessorKey: 'startDate', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'End', accessorKey: 'endDate', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'Budget', accessorKey: 'budget', cell: ({ getValue }) => <span className="text-sm font-medium">{formatCurrency(getValue())}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue()}>{getValue()}</Badge> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => { setEditTarget(row.original); setModalOpen(true) }} className="btn-ghost py-1 px-2">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleteTarget(row.original)} className="btn-ghost py-1 px-2 text-red-500 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">{projects.length} total projects</p>
        </div>
      </div>

      <DataTable
        data={projects} columns={columns} searchPlaceholder="Search projects..." emptyMessage="No projects found"
        actions={
          <button onClick={() => { setEditTarget(null); setModalOpen(true) }} className="btn-primary">
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />

      <ProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editTarget} saving={saving} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Project" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} />
    </div>
  )
}

function ProjectModal({ isOpen, onClose, onSave, initial, saving }) {
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', budget: '', manager: '', status: 'Planning', ...(initial || {}) })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Project' : 'New Project'} size="lg">
      <form onSubmit={e => { e.preventDefault(); onSave({ ...form, budget: form.budget ? Number(form.budget) : undefined }) }} className="space-y-4">
        <FormField label="Project Name" required><input className="input-field" value={form.name} onChange={set('name')} required /></FormField>
        <FormField label="Description">
          <textarea className="input-field resize-none" rows={2} value={form.description} onChange={set('description')} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date"><input type="date" className="input-field" value={form.startDate?.slice(0, 10)} onChange={set('startDate')} /></FormField>
          <FormField label="End Date"><input type="date" className="input-field" value={form.endDate?.slice(0, 10)} onChange={set('endDate')} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Budget (USD)"><input type="number" className="input-field" value={form.budget} onChange={set('budget')} placeholder="50000" /></FormField>
          <FormField label="Status">
            <select className="input-field" value={form.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Manager"><input className="input-field" value={form.manager} onChange={set('manager')} placeholder="Manager name or ID" /></FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (initial ? 'Update' : 'Create')}</button>
        </div>
      </form>
    </Modal>
  )
}
