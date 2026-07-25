'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { saveDrawing, deleteDrawing } from '../actions'
import { formatRelativeTime } from '@/utils/dates'

interface Drawing {
  id: string
  cloudinary_url: string
  note: string | null
  wallpaper_enabled: boolean
  created_at: string
}

interface Props {
  experienceSlug: string
  drawings: Drawing[]
}

const COLORS = [
  '#c4717a', '#b8935a', '#1c1917', '#5a8a6a',
  '#6a7ab8', '#a855f7', '#ef4444', '#f97316',
  '#ffffff', '#94a3b8',
]

const BRUSH_SIZES = [2, 5, 10, 20]

export function LoveCanvas({ experienceSlug, drawings: initial }: Props) {
  const [drawings, setDrawings] = useState<Drawing[]>(initial)
  const [showCanvas, setShowCanvas] = useState(false)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [color, setColor] = useState('#c4717a')
  const [brushSize, setBrushSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!showCanvas) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#faf8f5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [showCanvas])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    isDrawing.current = true
    lastPos.current = getPos(e, canvas)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = isEraser ? '#faf8f5' : color
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() {
    isDrawing.current = false
    lastPos.current = null
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#faf8f5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function handleSaveCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    setCanvasDataUrl(canvas.toDataURL('image/png'))
    setShowSaveForm(true)
  }

  function handleSaveDrawing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    // For now save the data URL as the cloudinary_url
    // In production this would upload to Cloudinary first
    formData.set('cloudinary_url', canvasDataUrl ?? '')

    startTransition(async () => {
      const result = await saveDrawing(experienceSlug, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setShowCanvas(false)
        setShowSaveForm(false)
        setCanvasDataUrl(null)
        window.location.reload()
      }
    })
  }

  function handleDelete(drawingId: string) {
    startTransition(async () => {
      await deleteDrawing(experienceSlug, drawingId)
      setDrawings((prev) => prev.filter((d) => d.id !== drawingId))
    })
  }

  return (
    <div className="space-y-6">
      {!showCanvas && (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-6 text-sm font-medium text-ink-muted transition-all hover:border-rose/40 hover:text-rose"
          onClick={() => setShowCanvas(true)}
          type="button"
        >
          🎨 Open drawing canvas
        </button>
      )}

      {showCanvas && !showSaveForm && (
        <div className="card rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-border p-3 flex flex-wrap items-center gap-3">
            {/* Colors */}
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button
                  className={`h-6 w-6 rounded-full border-2 transition-all ${
                    color === c && !isEraser
                      ? 'border-ink scale-110'
                      : 'border-transparent hover:scale-110'
                  }`}
                  key={c}
                  onClick={() => { setColor(c); setIsEraser(false) }}
                  style={{ backgroundColor: c }}
                  type="button"
                />
              ))}
            </div>

            <div className="h-5 w-px bg-border" />

            {/* Brush sizes */}
            <div className="flex items-center gap-1.5">
              {BRUSH_SIZES.map((s) => (
                <button
                  className={`flex items-center justify-center rounded-full transition-all ${
                    brushSize === s && !isEraser
                      ? 'bg-rose/20 ring-1 ring-rose'
                      : 'hover:bg-surface'
                  }`}
                  key={s}
                  onClick={() => { setBrushSize(s); setIsEraser(false) }}
                  style={{ width: 28, height: 28 }}
                  type="button"
                >
                  <div
                    className="rounded-full bg-ink"
                    style={{ width: s, height: s }}
                  />
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-border" />

            <button
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                isEraser
                  ? 'bg-rose/20 text-rose'
                  : 'text-ink-muted hover:bg-surface'
              }`}
              onClick={() => setIsEraser(!isEraser)}
              type="button"
            >
              Eraser
            </button>

            <button
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-surface transition-all"
              onClick={clearCanvas}
              type="button"
            >
              Clear
            </button>

            <button
              className="ml-auto rounded-lg px-2.5 py-1 text-xs text-muted hover:text-ink"
              onClick={() => setShowCanvas(false)}
              type="button"
            >
              Cancel
            </button>
          </div>

          {/* Canvas */}
          <canvas
            className="w-full touch-none cursor-crosshair bg-parchment"
            height={500}
            onMouseDown={startDraw}
            onMouseLeave={stopDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onTouchEnd={stopDraw}
            onTouchMove={(e) => { e.preventDefault(); draw(e) }}
            onTouchStart={startDraw}
            ref={canvasRef}
            style={{ touchAction: 'none' }}
            width={800}
          />

          {/* Save */}
          <div className="border-t border-border p-3 flex justify-end">
            <button
              className="rounded-full bg-rose px-5 py-2 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5"
              onClick={handleSaveCanvas}
              type="button"
            >
              Save drawing →
            </button>
          </div>
        </div>
      )}

      {showSaveForm && canvasDataUrl && (
        <div className="card rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-lg font-medium text-ink">Save your drawing</h2>

          {error && (
            <div className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Preview */}
          <img
            alt="Your drawing"
            className="w-full rounded-xl border border-border"
            src={canvasDataUrl}
          />

          <form className="space-y-4" onSubmit={handleSaveDrawing}>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="note">
                Add a note <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                className="input-base resize-none"
                id="note"
                maxLength={300}
                name="note"
                placeholder="Write something to go with your drawing…"
                rows={3}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                className="h-4 w-4 rounded border-border accent-rose"
                name="wallpaper_enabled"
                type="checkbox"
                value="true"
              />
              <span className="text-sm text-ink-muted">
                Save as wallpaper for their gift
              </span>
            </label>

            <div className="flex gap-3">
              <button
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm text-ink-muted hover:border-rose/30 hover:text-rose transition-all"
                onClick={() => setShowSaveForm(false)}
                type="button"
              >
                Back to canvas
              </button>
              <button
                className="flex-1 rounded-full bg-rose px-4 py-2.5 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? 'Saving…' : '💌 Deliver drawing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {drawings.length === 0 && !showCanvas && (
        <div className="py-16 text-center">
          <p className="font-display text-xl text-ink-muted">No drawings yet.</p>
          <p className="mt-1 text-sm text-muted">Draw something from the heart.</p>
        </div>
      )}

      <div className="space-y-4">
        {drawings.map((drawing) => (
          <div className="card rounded-2xl overflow-hidden" key={drawing.id}>
            <img
              alt="Drawing"
              className="w-full border-b border-border"
              src={drawing.cloudinary_url}
            />
            <div className="p-4 flex items-start justify-between gap-3">
              <div>
                {drawing.note && (
                  <p className="text-sm text-ink-muted italic">
                    &ldquo;{drawing.note}&rdquo;
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted">
                    {formatRelativeTime(drawing.created_at)}
                  </span>
                  {drawing.wallpaper_enabled && (
                    <>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-rose">Wallpaper ✓</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="shrink-0 text-xs text-muted hover:text-error transition-colors"
                onClick={() => handleDelete(drawing.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
