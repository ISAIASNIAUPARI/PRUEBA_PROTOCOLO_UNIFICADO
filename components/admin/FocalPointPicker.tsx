'use client'

import { useRef, useState } from 'react'

type Props = {
  src: string
  aspectRatio: number
  focalX?: number
  focalY?: number
  onApply: (x: number, y: number) => void
  onCancel: () => void
}

export default function FocalPointPicker({ src, aspectRatio, focalX = 50, focalY = 50, onApply, onCancel }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(focalX)
  const [y, setY] = useState(focalY)
  const dragging = useRef(false)

  function updateFromPoint(clientX: number, clientY: number) {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    setX(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
    setY(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)))
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div className="w-full max-w-lg rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-sm font-semibold text-admin-ink">Punto focal de la imagen</h3>
        <p className="mb-3 text-xs text-admin-ink/60">Arrastra el círculo sobre el sujeto principal de la foto.</p>

        <div
          ref={frameRef}
          className="relative w-full cursor-crosshair touch-none overflow-hidden rounded border border-admin-line select-none"
          style={{ aspectRatio: String(aspectRatio) }}
          onPointerDown={(e) => {
            dragging.current = true
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
            updateFromPoint(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => {
            if (dragging.current) updateFromPoint(e.clientX, e.clientY)
          }}
          onPointerUp={() => {
            dragging.current = false
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} draggable={false} />
          <div
            className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{ left: `${x}%`, top: `${y}%`, background: 'rgba(255,255,255,0.35)', boxShadow: '0 0 0 2px rgba(0,0,0,0.5)' }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-xs text-admin-ink/60">Antes (centro)</div>
            <div className="overflow-hidden rounded border border-admin-line" style={{ aspectRatio: String(aspectRatio) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: '50% 50%' }} />
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-admin-ink/60">Después (tu punto)</div>
            <div className="overflow-hidden rounded border border-admin-line" style={{ aspectRatio: String(aspectRatio) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-admin-line px-4 py-2 text-sm text-admin-ink hover:bg-admin-bg">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onApply(Math.round(x), Math.round(y))}
            className="rounded-md bg-admin-primary px-4 py-2 text-sm font-medium text-white hover:bg-admin-primary-dark"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
