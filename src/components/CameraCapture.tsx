import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, RefreshCw, Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'

interface CameraCaptureProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CameraCapture({ onClose, onSuccess }: CameraCaptureProps) {
  const { state, submitPhotoChallenge } = useApp()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      setError('Camera access required. Live capture only — no gallery uploads.')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [startCamera])

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    setCaptured(canvas.toDataURL('image/jpeg', 0.85))
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  function retake() {
    setCaptured(null)
    setError(null)
    startCamera()
  }

  async function verify() {
    if (!captured) return
    setVerifying(true)
    setError(null)
    const result = await submitPhotoChallenge(captured)
    setVerifying(false)
    if (result.verified) {
      onSuccess()
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-ink flex flex-col">
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center tap-scale" aria-label="Close">
          <X size={20} className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-xs font-bold text-white/60">Daily challenge</p>
          <p className="text-sm font-bold text-white">{state.dailyPhotoChallenge.prompt}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative mx-5 rounded-3xl overflow-hidden bg-black">
        {!captured ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {!cameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/70 text-sm">Starting camera…</p>
              </div>
            )}
          </>
        ) : (
          <img src={captured} alt="Captured" className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2">
          <Shield size={14} className="text-lime shrink-0" />
          <p className="text-[10px] text-white/80 font-medium">Live capture only · CV verification enabled</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-red-300 px-5 mt-3"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="px-5 py-8 safe-bottom">
        {!captured ? (
          <button
            type="button"
            onClick={capture}
            disabled={!cameraReady}
            className="w-full btn-lime py-4 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Camera size={20} />
            Capture live photo
          </button>
        ) : (
          <div className="flex gap-3">
            <button type="button" onClick={retake} className="flex-1 py-4 rounded-full bg-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 tap-scale">
              <RefreshCw size={16} />
              Retake
            </button>
            <button
              type="button"
              onClick={verify}
              disabled={verifying}
              className="flex-[2] btn-lime py-4 text-sm disabled:opacity-60"
            >
              {verifying ? 'Verifying with CV…' : 'Submit & unlock feed'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
