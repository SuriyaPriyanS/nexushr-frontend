import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../store/authSlice'
import { FaBolt } from 'react-icons/fa'
import { ErrorMessage, FormField, Spinner } from '../components/ui'
import toast from 'react-hot-toast'
import { DEPARTMENTS, ROLES } from '../utils/helpers'

export function RegisterPage() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '', role: 'Employee' })
  const [newUser, setNewUser] = useState(null)

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())

    const action = await dispatch(register(form))

    if (register.fulfilled.match(action)) {
      setNewUser(action.payload)
      toast.success('Account created! User object received.')
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join your team on NexusHR"
      footer={<>Already registered? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} />
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <FormField label="Name" required>
              <input
                className="input-field w-full"
                placeholder="John"
                value={form.name}
                onChange={set('name')}
                required
              />
            </FormField>
          </div>
        </div>
        <FormField label="Email" required>
          <input type="email" className="input-field" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
        </FormField>
        <FormField label="Phone">
          <input className="input-field" placeholder="+1234567890" value={form.phone} onChange={set('phone')} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
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
        <FormField label="Password" required>
          <input type="password" className="input-field" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
        </FormField>
        <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Create Account'}
        </button>

        {newUser && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <p className="font-semibold mb-2">Created user object (base response):</p>
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(newUser, null, 2)}</pre>
          </div>
        )}
      </form>
    </AuthLayout>
  )
}

function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-48 w-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-10 w-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
            <FaBolt className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-xl leading-tight">NexusHR</p>
            <p className="text-[10px] text-brand-300 uppercase tracking-widest">Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          {children}
          {footer && <p className="mt-5 text-center text-sm text-slate-500">{footer}</p>}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

