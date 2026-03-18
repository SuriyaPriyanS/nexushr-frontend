import { useState, useMemo } from 'react'
import { Plus, Award, Upload } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { kudosAPI, standupAPI, documentAPI } from '../services/api'
import DataTable from '../components/ui/DataTable'
import { Modal, FormField, LoadingState, Avatar, Card } from '../components/ui'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

// ── Kudos ─────────────────────────────────────────────────────────────────────
export function Kudos() {
  const { data, loading, refetch } = useFetch(kudosAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const kudos = Array.isArray(data) ? data : []

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await kudosAPI.create(form)
      toast.success('Kudos sent! 🎉'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Kudos & Recognition</h2><p className="text-sm text-slate-500 mt-0.5">Celebrate your teammates</p></div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Award className="h-4 w-4" /> Give Kudos</button>
      </div>

      {loading ? <LoadingState /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kudos.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-sm">No kudos yet — be the first to celebrate someone!</div>
          ) : kudos.map((k, i) => (
            <Card key={k._id || i} className="p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {k.recipient?.firstName || k.recipientName || 'Colleague'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">from {k.sender?.firstName || k.senderName || 'Teammate'}</p>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">{k.message || k.comment}</p>
                  {k.badge && <span className="mt-2 inline-block text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">{k.badge}</span>}
                  <p className="text-xs text-slate-400 mt-2">{formatDate(k.createdAt || k.date)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Give Kudos">
        <KudosForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function KudosForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ recipientId: '', message: '', badge: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Recipient (Employee ID)" required><input className="input-field" value={form.recipientId} onChange={set('recipientId')} required /></FormField>
      <FormField label="Badge / Category">
        <select className="input-field" value={form.badge} onChange={set('badge')}>
          <option value="">Select a badge...</option>
          {['Team Player', 'Above & Beyond', 'Innovator', 'Problem Solver', 'Mentor', 'Star Performer'].map(b => <option key={b}>{b}</option>)}
        </select>
      </FormField>
      <FormField label="Message" required>
        <textarea className="input-field resize-none" rows={3} value={form.message} onChange={set('message')} placeholder="Write a recognition message..." required />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Sending...' : '🏆 Send Kudos'}</button>
      </div>
    </form>
  )
}

// ── Standups ──────────────────────────────────────────────────────────────────
export function Standup() {
  const { data, loading, refetch } = useFetch(standupAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const standups = Array.isArray(data) ? data : []

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await standupAPI.create(form)
      toast.success('Standup submitted'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Employee', accessorKey: 'employee', cell: ({ row }) => { const r = row.original; return <span className="text-sm font-medium">{r.employee?.firstName ? `${r.employee.firstName} ${r.employee.lastName}` : '—'}</span> } },
    { header: 'Date', accessorKey: 'date', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'Yesterday', accessorKey: 'yesterday', cell: ({ getValue }) => <span className="text-sm text-slate-500 truncate block max-w-[160px]">{getValue() || '—'}</span> },
    { header: 'Today', accessorKey: 'today', cell: ({ getValue }) => <span className="text-sm text-slate-700 truncate block max-w-[160px]">{getValue() || '—'}</span> },
    { header: 'Blockers', accessorKey: 'blockers', cell: ({ getValue }) => getValue() ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{getValue()}</span> : <span className="text-xs text-slate-400">None</span> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Daily Standups</h2><p className="text-sm text-slate-500 mt-0.5">{standups.length} updates</p></div>
      </div>
      <DataTable data={standups} columns={columns} searchPlaceholder="Search standups..." emptyMessage="No standup updates"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Post Update</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Post Standup Update">
        <StandupForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function StandupForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ yesterday: '', today: '', blockers: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="What did you do yesterday?" required>
        <textarea className="input-field resize-none" rows={2} value={form.yesterday} onChange={set('yesterday')} required />
      </FormField>
      <FormField label="What are you doing today?" required>
        <textarea className="input-field resize-none" rows={2} value={form.today} onChange={set('today')} required />
      </FormField>
      <FormField label="Any blockers?">
        <textarea className="input-field resize-none" rows={2} value={form.blockers} onChange={set('blockers')} placeholder="Leave empty if none..." />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Posting...' : 'Post Update'}</button>
      </div>
    </form>
  )
}

// ── Documents ─────────────────────────────────────────────────────────────────
export function Documents() {
  const { data, loading, refetch } = useFetch(documentAPI.getAll)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const documents = Array.isArray(data) ? data : []

  const handleUpload = async (form) => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await documentAPI.upload(fd)
      toast.success('Document uploaded'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Name', accessorKey: 'name', cell: ({ getValue }) => <span className="text-sm font-medium text-slate-800">{getValue() || '—'}</span> },
    { header: 'Type', accessorKey: 'type', cell: ({ getValue }) => <span className="text-sm text-slate-500">{getValue() || '—'}</span> },
    { header: 'Uploaded By', accessorKey: 'uploadedBy', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Date', accessorKey: 'createdAt', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'Actions', id: 'dl', cell: ({ row }) => row.original.url ? <a href={row.original.url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline font-medium">Download</a> : null },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Documents</h2><p className="text-sm text-slate-500 mt-0.5">{documents.length} files</p></div>
      </div>
      <DataTable data={documents} columns={columns} searchPlaceholder="Search documents..." emptyMessage="No documents uploaded"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Upload className="h-4 w-4" /> Upload</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <DocumentForm onSave={handleUpload} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function DocumentForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ name: '', type: '', file: null })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Document Name"><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormField>
      <FormField label="Type">
        <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="">Select type...</option>
          {['Contract', 'Policy', 'Report', 'Certificate', 'ID', 'Other'].map(t => <option key={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label="File" required>
        <input type="file" className="input-field py-1.5" required onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Uploading...' : 'Upload'}</button>
      </div>
    </form>
  )
}
