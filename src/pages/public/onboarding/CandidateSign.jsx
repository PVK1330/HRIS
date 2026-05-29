import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signOffer } from '../../../services/candidateOnboardingService.js'
import { candidateOnboardingPath } from '../../../utils/candidateOnboardingTenant.js'

export default function CandidateSign() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const canvasRef = useRef(null)
  const [mode, setMode] = useState('draw')
  const [typedName, setTypedName] = useState('')
  const [drawing, setDrawing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const startDraw = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y)
    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDraw = () => setDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSubmit = async () => {
    if (!token) return
    setSubmitting(true)
    try {
      let signatureData
      let signatureMode = mode
      if (mode === 'draw') {
        const canvas = canvasRef.current
        signatureData = canvas?.toDataURL('image/png')
        if (!signatureData) throw new Error('Draw your signature')
      } else {
        if (!typedName.trim()) {
          toast.error('Enter your name')
          setSubmitting(false)
          return
        }
        signatureMode = 'type'
      }
      const res = await signOffer(token, {
        signatureMode,
        signatureData,
        typedName: typedName.trim(),
      })
      toast.success(res.message || 'Offer signed')
      navigate(candidateOnboardingPath('/onboarding/documents', token))
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Signing failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600">Missing onboarding link.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-lg rounded-lg p-6">
        <h1 className="text-lg font-black uppercase tracking-wide text-slate-900">Sign offer letter</h1>
        <p className="text-sm text-slate-500 mt-1">Draw or type your signature below.</p>

        <div className="flex gap-2 mt-6">
          {['draw', 'type'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-xs font-bold uppercase ${
                mode === m ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {m === 'draw' ? 'Draw' : 'Type name'}
            </button>
          ))}
        </div>

        {mode === 'draw' ? (
          <div className="mt-4">
            <canvas
              ref={canvasRef}
              width={560}
              height={160}
              className="w-full border border-dashed border-slate-300 bg-slate-50 touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            <button type="button" onClick={clearCanvas} className="mt-2 text-xs text-slate-500 underline">
              Clear
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Full legal name"
            className="mt-4 w-full border border-slate-200 rounded-lg px-4 py-3 text-2xl font-serif"
          />
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="mt-8 w-full h-12 bg-[#0F766E] text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit signature'}
        </button>
      </div>
    </div>
  )
}
