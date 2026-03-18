import { useState } from 'react'
import { X, Fingerprint, Eye, Clock, CheckCircle, AlertCircle, Camera } from 'lucide-react'
import FingerprintReader from './FingerprintReader'
import EyeDetector from './EyeDetector'

export default function BiometricScanner({ isOpen, onClose, onSuccess, clockType = 'in' }) {
  const [tab, setTab] = useState('fingerprint')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSuccess = async (verificationData) => {
    setLoading(true)
    try {
      await onSuccess({ ...verificationData, method: tab, clockType, timestamp: new Date().toISOString() })
      onClose()
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleManual = () => handleSuccess({ method: 'manual', confidence: 1 })

  if (!isOpen) return null

return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in md:p-8">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md h-[95vh] md:max-h-[90vh] md:rounded-3xl overflow-hidden border border-white/50 md:shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-surface-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Verify Attendance</h2>
                <p className="text-sm text-slate-500">{clockType === 'in' ? 'Clock In' : 'Clock Out'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-xl transition-all group">
              <X className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 border-b border-amber-100 bg-amber-50">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pb-2">
          <div className="flex bg-surface-100 rounded-2xl p-1">
            {[
              { id: 'fingerprint', icon: Fingerprint, label: 'Fingerprint' },
              { id: 'eye', icon: Eye, label: 'Eye Scan' },
              { id: 'manual', icon: Clock, label: 'Manual' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 ${
                  tab === id
                    ? 'bg-white shadow-sm text-brand-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Processing verification...</p>
              <p className="text-sm text-slate-400 mt-1">Please wait</p>
            </div>
          ) : tab === 'fingerprint' ? (
            <FingerprintReader onSuccess={handleSuccess} />
          ) : tab === 'eye' ? (
            <EyeDetector onSuccess={handleSuccess} />
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900 mb-2">Manual Clock</p>
              <p className="text-sm text-slate-500 mb-6">Use this for devices without biometric support</p>
<button
                onClick={handleManual}
                className="btn-primary w-full h-14 text-sm font-semibold min-h-[44px] touch-manipulation active:scale-[0.98]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm {clockType === 'in' ? 'Clock In' : 'Clock Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
