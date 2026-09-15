'use client'

import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { useRef } from 'react'

import { resolveButtonHref, themeColorVar } from '@/lib/buttons'
import type { ButtonRef } from '@/lib/types'

type XKey = 'desktopX' | 'mobileX'
type YKey = 'desktopY' | 'mobileY'

function defaultPos(i: number) {
  return { x: 10 + i * 25, y: 80 }
}

function colorStyle(button: ButtonRef, index: number): React.CSSProperties | undefined {
  const v = themeColorVar(button.color)
  if (!v) return undefined
  return index === 0 ? { background: v, borderColor: v, color: '#fff' } : { borderColor: v, color: v }
}

function DraggableButton({
  button,
  index,
  edit,
  xKey,
  yKey,
  buttonClassName,
}: {
  button: ButtonRef
  index: number
  edit: boolean
  xKey: XKey
  yKey: YKey
  buttonClassName: (index: number) => string
}) {
  const pos = defaultPos(index)
  const x = button[xKey] ?? pos.x
  const y = button[yKey] ?? pos.y
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: button.id, disabled: !edit })

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) translate(-50%, -50%)`
      : 'translate(-50%, -50%)',
    pointerEvents: 'auto',
    zIndex: isDragging ? 50 : 1,
  }

  if (edit) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        role="button"
        tabIndex={0}
        className={`cursor-grab touch-none whitespace-nowrap active:cursor-grabbing ${buttonClassName(index)}`}
      >
        <span style={colorStyle(button, index)}>{button.text || 'Botón'}</span>
      </div>
    )
  }

  const href = resolveButtonHref(button)
  return (
    <a
      href={href}
      style={style}
      target={button.hrefType === 'url' ? '_blank' : undefined}
      rel={button.hrefType === 'url' ? 'noopener noreferrer' : undefined}
      className={`whitespace-nowrap ${buttonClassName(index)}`}
    >
      <span style={colorStyle(button, index)}>{button.text}</span>
    </a>
  )
}

/**
 * Canvas de posición libre (estilo Wix) para los botones de una sección.
 * Cubre el área completa de la sección (position:absolute;inset:0) sin
 * ocupar espacio en el flujo normal — la sección debe tener position:relative.
 * Activo siempre en edición; en el sitio público solo si ya hay coordenadas
 * guardadas para la vista actual (ver el criterio en el componente que llama
 * a este canvas).
 */
export default function FreeButtonsCanvas({
  buttons,
  edit,
  xKey,
  yKey,
  onChange,
  buttonClassName,
}: {
  buttons: ButtonRef[]
  edit: boolean
  xKey: XKey
  yKey: YKey
  onChange: (next: ButtonRef[]) => void
  buttonClassName: (index: number) => string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToParentElement]}
      onDragEnd={(e) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const idx = buttons.findIndex((b) => b.id === e.active.id)
        if (idx === -1) return
        const btn = buttons[idx]
        const pos = defaultPos(idx)
        const curX = btn[xKey] ?? pos.x
        const curY = btn[yKey] ?? pos.y
        const nx = Math.min(100, Math.max(0, curX + (e.delta.x / rect.width) * 100))
        const ny = Math.min(100, Math.max(0, curY + (e.delta.y / rect.height) * 100))
        const next = buttons.slice()
        next[idx] = { ...btn, [xKey]: nx, [yKey]: ny }
        onChange(next)
      }}
    >
      <div ref={containerRef} className="pointer-events-none absolute inset-0">
        {buttons.map((b, i) => (
          <DraggableButton key={b.id} button={b} index={i} edit={edit} xKey={xKey} yKey={yKey} buttonClassName={buttonClassName} />
        ))}
      </div>
    </DndContext>
  )
}
