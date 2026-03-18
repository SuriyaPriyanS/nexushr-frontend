import { useState } from 'react'
import { Plus, Heart, Users, TrendingUp, Video } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { wellnessAPI } from '../services/api'
import { Modal, FormField, LoadingState, Card, StatCard } from '../components/ui'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Wellness() {
  const { data: logs, loading: logsLoad, refetch: refetchLogs } = useFetch(wellnessAPI.getLogs)
  const { data: events, loading: eventsLoad, refetch: refetchEvents } = useFetch(wellnessAPI.getSocialEvents)
  const [activeTab, setActiveTab] = useState('logs')
  const [logModal, setLogModal] = useState(false)
  const [eventModal, setEventModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const wellnessLogs = Array.isArray(logs) ? logs : []
  const socialEvents = Array.isArray(events) ? events : []

  const totalCalories = wellnessLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0)
  const totalMins = wellnessLogs.reduce((sum, l) => sum + (l.duration || 0), 0)

  const handleCreateLog = async (form) => {
    setSaving(true)
    try {
      await wellnessAPI.createLog({ ...form, duration: Number(form.duration), caloriesBurned: Number(form.caloriesBurned || 0) })
      toast.success('Wellness log added! 💪'); refetchLogs(); setLogModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleCreateEvent = async (form) => {
    setSaving(true)
    try {
      await wellnessAPI.createSocialEvent({ ...form, attendees: Number(form.attendees || 0) })
      toast.success('Event created!'); refetchEvents(); setEventModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const tabs = [
    { id: 'logs', label: 'Wellness Logs', icon: Heart },
    { id: 'events', label: 'Social Events', icon: Users },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div><h2 className="page-title">Wellness</h2><p className="text-sm text-slate-500 mt-0.5">Track health, wellness, and team events</p></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Wellness Logs" value={wellnessLogs.length} icon={Heart} color="red" />
        <StatCard title="Total Minutes" value={totalMins} icon={TrendingUp} color="emerald" subtitle="Activity logged" />
        <StatCard title="Calories Burned" value={totalCalories.toLocaleString()} icon={TrendingUp} color="amber" />
        <StatCard title="Social Events" value={socialEvents.length} icon={Users} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-200 pb-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setLogModal(true)} className="btn-primary"><Plus className="h-4 w-4" /> Log Activity</button>
          </div>
          {logsLoad ? <LoadingState /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wellnessLogs.length === 0 ? (
                <p className="col-span-full text-center text-slate-500 text-sm py-12">No wellness logs yet. Start tracking your health!</p>
              ) : wellnessLogs.map((log, i) => (
                <Card key={log._id || i} className="p-4 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{log.activity}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(log.date)}</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg"><Heart className="h-4 w-4 text-red-500" /></div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{log.duration}</p>
                      <p className="text-xs text-slate-500">minutes</p>
                    </div>
                    {log.caloriesBurned > 0 && (
                      <div>
                        <p className="text-lg font-bold text-amber-600">{log.caloriesBurned}</p>
                        <p className="text-xs text-slate-500">calories</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setEventModal(true)} className="btn-primary"><Plus className="h-4 w-4" /> Create Event</button>
          </div>
          {eventsLoad ? <LoadingState /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialEvents.length === 0 ? (
                <p className="col-span-full text-center text-slate-500 text-sm py-12">No social events yet.</p>
              ) : socialEvents.map((ev, i) => (
                <Card key={ev._id || i} className="p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-xl"><Users className="h-4 w-4 text-purple-500" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(ev.date)}</p>
                      {ev.location && <p className="text-xs text-slate-400 mt-0.5">📍 {ev.location}</p>}
                      {ev.description && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{ev.description}</p>}
                      {ev.attendees > 0 && <p className="text-xs font-medium text-purple-600 mt-2">👥 {ev.attendees} attendees</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={logModal} onClose={() => setLogModal(false)} title="Log Wellness Activity">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); handleCreateLog(Object.fromEntries(fd)) }} className="space-y-4">
          <FormField label="Activity" required><input name="activity" className="input-field" placeholder="Running, Yoga, Gym..." required /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration (minutes)" required><input name="duration" type="number" className="input-field" required /></FormField>
            <FormField label="Calories Burned"><input name="caloriesBurned" type="number" className="input-field" /></FormField>
          </div>
          <FormField label="Date"><input name="date" type="date" className="input-field" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setLogModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Log Activity'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={eventModal} onClose={() => setEventModal(false)} title="Create Social Event">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); handleCreateEvent(Object.fromEntries(fd)) }} className="space-y-4">
          <FormField label="Event Title" required><input name="title" className="input-field" required /></FormField>
          <FormField label="Description"><textarea name="description" className="input-field resize-none" rows={2} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date"><input name="date" type="date" className="input-field" /></FormField>
            <FormField label="Attendees"><input name="attendees" type="number" className="input-field" /></FormField>
          </div>
          <FormField label="Location"><input name="location" className="input-field" placeholder="Office / Restaurant / Online" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setEventModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Event'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
