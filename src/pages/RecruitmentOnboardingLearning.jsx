import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { recruitmentAPI, onboardingAPI, learningAPI } from '../services/api'
import DataTable from '../components/ui/DataTable'
import { Badge, Modal, FormField, LoadingState } from '../components/ui'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

// ── Recruitment ───────────────────────────────────────────────────────────────
export function Recruitment() {
  const { data, loading, refetch } = useFetch(recruitmentAPI.getJobs)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const jobs = Array.isArray(data) ? data : []

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await recruitmentAPI.createJob(form)
      toast.success('Job posting created'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Job Title', accessorKey: 'title', cell: ({ getValue }) => <span className="text-sm font-semibold text-slate-800">{getValue()}</span> },
    { header: 'Department', accessorKey: 'department', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Location', accessorKey: 'location', cell: ({ getValue }) => <span className="text-sm text-slate-500">{getValue() || '—'}</span> },
    { header: 'Type', accessorKey: 'employmentType', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Posted', accessorKey: 'postedDate', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue() || 'open'}>{getValue() || 'Open'}</Badge> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Recruitment</h2><p className="text-sm text-slate-500 mt-0.5">{jobs.length} open positions</p></div>
      </div>
      <DataTable data={jobs} columns={columns} searchPlaceholder="Search jobs..." emptyMessage="No job postings"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Post Job</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Job Posting">
        <JobForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function JobForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ title: '', department: '', location: '', employmentType: 'Full-time', description: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Job Title" required><input className="input-field" value={form.title} onChange={set('title')} required /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Department"><input className="input-field" value={form.department} onChange={set('department')} /></FormField>
        <FormField label="Location"><input className="input-field" value={form.location} onChange={set('location')} placeholder="Remote / City" /></FormField>
      </div>
      <FormField label="Employment Type">
        <select className="input-field" value={form.employmentType} onChange={set('employmentType')}>
          {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => <option key={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label="Description">
        <textarea className="input-field resize-none" rows={3} value={form.description} onChange={set('description')} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Posting...' : 'Post Job'}</button>
      </div>
    </form>
  )
}

// ── Onboarding ────────────────────────────────────────────────────────────────
export function Onboarding() {
  const { data, loading, refetch } = useFetch(onboardingAPI.getPlan)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const plans = Array.isArray(data) ? data : []

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await onboardingAPI.createPlan(form)
      toast.success('Onboarding plan created'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Employee', accessorKey: 'employee', cell: ({ row }) => { const r = row.original; return <span className="text-sm font-medium">{r.employee?.firstName ? `${r.employee.firstName} ${r.employee.lastName}` : (r.employeeName || '—')}</span> } },
    { header: 'Start Date', accessorKey: 'startDate', cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span> },
    { header: 'Duration', accessorKey: 'duration', cell: ({ getValue }) => <span className="text-sm">{getValue() ? `${getValue()} days` : '—'}</span> },
    { header: 'Mentor', accessorKey: 'mentor', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue() || 'pending'}>{getValue() || 'Pending'}</Badge> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Onboarding</h2><p className="text-sm text-slate-500 mt-0.5">{plans.length} active plans</p></div>
      </div>
      <DataTable data={plans} columns={columns} searchPlaceholder="Search plans..." emptyMessage="No onboarding plans"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Create Plan</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Onboarding Plan">
        <OnboardingForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function OnboardingForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ employeeId: '', startDate: '', duration: '', mentor: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, duration: Number(form.duration) }) }} className="space-y-4">
      <FormField label="Employee ID" required><input className="input-field" value={form.employeeId} onChange={set('employeeId')} required /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date"><input type="date" className="input-field" value={form.startDate} onChange={set('startDate')} /></FormField>
        <FormField label="Duration (days)"><input type="number" className="input-field" value={form.duration} onChange={set('duration')} placeholder="30" /></FormField>
      </div>
      <FormField label="Mentor"><input className="input-field" value={form.mentor} onChange={set('mentor')} placeholder="Mentor name or ID" /></FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Plan'}</button>
      </div>
    </form>
  )
}

// ── Learning ──────────────────────────────────────────────────────────────────
export function Learning() {
  const { data, loading, refetch } = useFetch(learningAPI.getCourses)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const courses = Array.isArray(data) ? data : []

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await learningAPI.createCourse(form)
      toast.success('Course created'); refetch(); setModalOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { header: 'Course Name', accessorKey: 'title', cell: ({ getValue }) => <span className="text-sm font-semibold text-slate-800">{getValue()}</span> },
    { header: 'Category', accessorKey: 'category', cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span> },
    { header: 'Duration', accessorKey: 'duration', cell: ({ getValue }) => <span className="text-sm">{getValue() ? `${getValue()} hrs` : '—'}</span> },
    { header: 'Instructor', accessorKey: 'instructor', cell: ({ getValue }) => <span className="text-sm text-slate-500">{getValue() || '—'}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue() || 'active'}>{getValue() || 'Active'}</Badge> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Learning & Development</h2><p className="text-sm text-slate-500 mt-0.5">{courses.length} courses available</p></div>
      </div>
      <DataTable data={courses} columns={columns} searchPlaceholder="Search courses..." emptyMessage="No courses"
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Course</button>} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Course">
        <CourseForm onSave={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  )
}

function CourseForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ title: '', category: '', duration: '', instructor: '', description: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, duration: Number(form.duration) }) }} className="space-y-4">
      <FormField label="Course Title" required><input className="input-field" value={form.title} onChange={set('title')} required /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category"><input className="input-field" value={form.category} onChange={set('category')} placeholder="Technical, Soft Skills..." /></FormField>
        <FormField label="Duration (hours)"><input type="number" className="input-field" value={form.duration} onChange={set('duration')} /></FormField>
      </div>
      <FormField label="Instructor"><input className="input-field" value={form.instructor} onChange={set('instructor')} /></FormField>
      <FormField label="Description"><textarea className="input-field resize-none" rows={2} value={form.description} onChange={set('description')} /></FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</button>
      </div>
    </form>
  )
}
