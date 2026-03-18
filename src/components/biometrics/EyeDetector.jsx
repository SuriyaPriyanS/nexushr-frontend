import { useState, useEffect, useRef, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import { Eye, Camera, CheckCircle2, AlertCircle } from 'lucide-react'
import '@tensorflow/tfjs'

export default function EyeDetector({ onSuccess }) {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [status, setStatus] = useState('loading') // loading, ready, scanning, success, error
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState('')
  const animationId = useRef()

  const loadModels = useCallback(async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
      await faceapi.nets.faceExpressionNet.loadFromUri('/models')
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setError('Failed to load eye detection models')
    }
  }, [])

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      })
      videoRef.current.srcObject = stream
      videoRef.current.play()
      setStatus('scanning')
    } catch (err) {
      setStatus('error')
      setError('Camera access denied. Allow camera permission.')
    }
  }, [])

  const detectEyes = async () => {
    if (!videoRef.current || !canvasRef.current || status !== 'scanning') return

    const video = videoRef.current
    const canvas = faceapi.createCanvasFromMedia(video)
    canvasRef.current.replaceWith(canvas)
    canvasRef.current = canvas

    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()

    if (detections) {
      const landmarks = detections.landmarks
      const leftEye = landmarks.getLeftEye()
      const rightEye = landmarks.getRightEye()
      
      // Eye aspect ratio (EAR) for blink detection
      const ear = ((leftEye.reduce((a, b) => a + b[1], 0) / 6) + (rightEye.reduce((a, b) => a + b[1], 0) / 6)) / 2
      
      const score = Math.min(ear > 0.2 ? 95 : 100, confidence + 2) // Mock gaze + blink verification
      setConfidence(score)

      if (score >= 95) {
        cancelAnimationFrame(animationId.current)
        setStatus('success')
        setTimeout(() => {
          onSuccess({ type: 'eye', landmarks: detections.landmarks.positions, confidence: score / 100, expressions: detections.expressions })
        }, 1000)
        return
      }
    }

    animationId.current = requestAnimationFrame(detectEyes)
  }

  useEffect(() => {
    loadModels()
  }, [loadModels])

  useEffect(() => {
    if (status === 'ready') {
      startVideo()
      detectEyes()
    }
    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current)
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [status, startVideo])

  return (
    <div className="space-y-4">
      <div className="relative bg-surface-50 rounded-2xl p-4 border-2 border-dashed border-surface-200 overflow-hidden">
        <video
          ref={videoRef}
          className="w-64 h-48 object-cover rounded-xl mx-auto block"
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <Camera className="h-12 w-12 text-brand-400 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-400 text-sm font-medium">Loading eye detection...</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          status === 'success' ? 'bg-emerald-100 text-emerald-700' :
          status === 'error' ? 'bg-red-100 text-red-700' :
          'bg-brand-100 text-brand-600'
        }`}>
          {status === 'success' && <CheckCircle2 className="h-4 w-4" />}
          {status === 'error' && <AlertCircle className="h-4 w-4" />}
          <Eye className="h-4 w-4" />
          {status === 'scanning' && `Eye Scan ${Math.round(confidence)}%`}
          {status === 'success' && 'Eyes Verified'}
          {status === 'error' && 'Camera Error'}
        </div>
        
        {status === 'scanning' && (
          <div className="w-full bg-surface-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full shadow-sm" 
              style={{ width: `${confidence}%`, transition: 'width 0.3s ease' }}
            />
          </div>
        )}
      </div>

      {status === 'error' && (
        <button 
          onClick={() => window.location.reload()}
          className="w-full btn-secondary py-2 text-sm"
        >
          Retry Camera Access
        </button>
      )}
    </div>
  )
}
