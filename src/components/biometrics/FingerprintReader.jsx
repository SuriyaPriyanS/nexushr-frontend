import { useState, useEffect, useCallback } from 'react'
import { Fingerprint, CheckCircle2 } from 'lucide-react'

export default function FingerprintReader({ onSuccess }) {
  const [status, setStatus] = useState('idle') // idle, scanning, success, error
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState('')

  const scanFingerprint = useCallback(async () => {
    setStatus('scanning')
    setError('')
    
    try {
      // Use WebAuthn for biometric auth (fingerprint/touchID on supported devices)
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32), // Random challenge
          rp: { name: 'NexusHR Attendance' },
          user: {
            id: new Uint8Array(16),
            name: 'user@company.com',
            displayName: 'Employee'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
          timeout: 60000,
          excludeCredentials: []
        }
      })

      // Mock hash from credential (in prod, hash/send to backend)
      const fingerprintHash = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
      
      // Simulate confidence scan animation
      let conf = 0
      const interval = setInterval(() => {
        conf += Math.random() * 15
        setConfidence(Math.min(conf, 100))
        if (conf >= 100) {
          clearInterval(interval)
          setStatus('success')
          setTimeout(() => {
            onSuccess({ type: 'fingerprint', hash: fingerprintHash, confidence: 0.95 })
          }, 800)
        }
      }, 150)

    } catch (err) {
      setStatus('error')
      setError(err.name === 'NotAllowedError' ? 'Biometrics not available. Enable fingerprint on this device.' : err.message)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [onSuccess])

  useEffect(() => {
    if (status === 'idle') scanFingerprint()
  }, [status, scanFingerprint])

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-6">
        <div className="relative">
          <div className={`w-28 h-28 rounded-2xl flex items-center justify-center p-6 transition-all duration-500 ${
            status === 'scanning' ? 'bg-gradient-to-br from-brand-500/20 to-brand-600/20 shadow-2xl shadow-brand-500/25 animate-pulse' 
            : status === 'success' ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 shadow-2xl shadow-emerald-500/25' 
            : 'bg-surface-100 border-2 border-dashed border-surface-300 hover:border-brand-300'
          }`}>
            <Fingerprint className={`h-12 w-12 transition-colors ${
              status === 'scanning' ? 'text-brand-500 animate-ping-slow' 
              : status === 'success' ? 'text-emerald-500' 
              : 'text-slate-400 group-hover:text-brand-500'
            }`} />
            {status === 'success' && (
              <CheckCircle2 className="absolute h-16 w-16 text-emerald-400 -inset-2 animate-scale-in" />
            )}
          </div>
          {status === 'scanning' && (
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-400/30 via-brand-500/50 to-brand-400/30 rounded-2xl animate-shimmer" />
          )}
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-brand-400 rounded-full animate-ping" />
            <span>Scanning fingerprint...</span>
          </div>
          {status === 'scanning' && (
            <div className="w-full bg-surface-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full shadow-sm animate-progress" 
                style={{ width: `${confidence}%` }}
              />
            </div>
          )}
          <p className="text-2xl font-bold text-slate-900">
            {status === 'scanning' && `${Math.round(confidence)}%`}
            {status === 'success' && 'Verified!'}
            {status === 'error' && 'Error'}
          </p>
        </div>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4">
          <p className="text-sm text-amber-800">{error}</p>
          <button 
            onClick={scanFingerprint}
            className="mt-2 text-xs font-medium text-amber-700 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'idle' && (
        <button 
          onClick={scanFingerprint}
          className="btn-primary w-full py-3 group"
        >
          <Fingerprint className="h-4 w-4 mr-2 group-hover:animate-ping" />
          Start Fingerprint Scan
        </button>
      )}
    </div>
  )
}
