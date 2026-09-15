'use client'

import { DndContext, PointerSensor, useDraggable, useSensor, useSensors, type Modifier } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { useCallback, useMemo, useRef, useState } from 'react'

import { resolveButtonHref, themeColorVar } from '@/lib/buttons'
import type { ButtonRef } from '@/lib/types'

type XKey = 'desktopX' | 'mobileX'
type YKey = 'desktopY' | 'mobileY'

const SNAP_PX = 6
const GUIDE_MARGIN = 12
const GUIDE_COLOR = '#00e676'

type Rect = { left: number; right: number; top: number; bottom: number; centerX: number; centerY: number }
type OtherRect = { id: string; rect: Rect }
type Guides = { v: { x: number; y1: number; y2: number } | null; h: { y: number; x1: number; x2: number } | null }

function defaultPos(i: number) {
  return { x: 10 + i * 25, y: 80 }
}

function colorStyle(button: ButtonRef, index: number): React.CSSProperties | undefined {
  const v = themeColorVar(button.color)
  if (!v) return undefined
  return index === 0 ? { background: v, borderColor: v, color: '#fff' } : { borderColor: v, color: v }
}

function guidesEqual(a: Guides, b: Guides): boolean {
  const veq = a.v === b.v || (a.v !== null && b.v !== null && a.v.x === b.v.x && a.v.y1 === b.v.y1 && a.v.y2 === b.v.y2)
  const heq = a.h === b.h || (a.h !== null && b.h !== null && a.h.y === b.h.y && a.h.x1 === b.h.x1 && a.h.x2 === b.h.x2)
  return veq && heq
}

function rectFromDom(domRect: { left: number; top: number; width: number; height: number }, container: DOMRect): Rect {
  const left = domRect.left - container.left
  const top = domRect.top - container.top
  const right = left + domRect.width
  const bottom = top + domRect.height
  return { left, right, top, bottom, centerX: (left + right) / 2, centerY: (top + bottom) / 2 }
}

/**
 * Modifier de dnd-kit que ajusta el transform en vivo para que el botón
 * arrastrado quede exacto (snap) cuando su borde/centro se acerca a ≤6px del
 * mismo punto de otro botón — y expone qué línea guía dibujar como
 * side-effect (setGuides), tal como en la Parte 8 del cerebro.
 */
function makeSnapModifier(
  containerRef: React.RefObject<HTMLDivElement | null>,
  othersRef: React.MutableRefObject<OtherRect[]>,
  setGuides: (g: Guides) => void
): Modifier {
  return ({ transform, activeNodeRect }) => {
    const container = containerRef.current?.getBoundingClientRect()
    if (!activeNodeRect || !container || othersRef.current.length === 0) {
      return transform
    }

    const width = activeNodeRect.width
    const height = activeNodeRect.height
    const left0 = activeNodeRect.left - container.left
    const top0 = activeNodeRect.top - container.top

    let dx = transform.x
    let dy = transform.y
    let snappedX = false
    let snappedY = false
    let guideV: Guides['v'] = null
    let guideH: Guides['h'] = null

    const curLeft = left0 + dx
    const curTop = top0 + dy

    for (const other of othersRef.current) {
      if (!snappedX) {
        const curRight = curLeft + width
        const curCenterX = curLeft + width / 2
        const xPairs: [number, number][] = [
          [curLeft, other.rect.left],
          [curCenterX, other.rect.centerX],
          [curRight, other.rect.right],
        ]
        for (const [cur, target] of xPairs) {
          if (Math.abs(cur - target) <= SNAP_PX) {
            dx += target - cur
            snappedX = true
            const y1 = Math.min(curTop, other.rect.top) - GUIDE_MARGIN
            const y2 = Math.max(curTop + height, other.rect.bottom) + GUIDE_MARGIN
            guideV = { x: target, y1, y2 }
            break
          }
        }
      }
      if (!snappedY) {
        const curBottom = curTop + height
        const curCenterY = curTop + height / 2
        const yPairs: [number, number][] = [
          [curTop, other.rect.top],
          [curCenterY, other.rect.centerY],
          [curBottom, other.rect.bottom],
        ]
        for (const [cur, target] of yPairs) {
          if (Math.abs(cur - target) <= SNAP_PX) {
            dy += target - cur
            snappedY = true
            const x1 = Math.min(curLeft, other.rect.left) - GUIDE_MARGIN
            const x2 = Math.max(curLeft + width, other.rect.right) + GUIDE_MARGIN
            guideH = { y: target, x1, x2 }
            break
          }
        }
      }
      if (snappedX && snappedY) break
    }

    setGuides({ v: guideV, h: guideH })
    return { ...transform, x: dx, y: dy }
  }
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
        data-btn-id={button.id}
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
 * Canvas de posición libre (estilo Wix) para los botones de una sección, con
 * líneas guía de alineación (estilo Figma) al arrastrar. Cubre el área
 * completa de la sección (position:absolute;inset:0) sin ocupar espacio en
 * el flujo normal — la sección debe tener position:relative. Activo siempre
 * en edición; en el sitio público solo si ya hay coordenadas guardadas para
 * la vista actual (ver el criterio en el componente que llama a este canvas).
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
  const othersRef = useRef<OtherRect[]>([])
  const guidesRef = useRef<Guides>({ v: null, h: null })
  const [guides, setGuides] = useState<Guides>({ v: null, h: null })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // El modifier de dnd-kit corre en cada frame del arrastre — sin este
  // guard, llamar setGuides con un objeto nuevo (aunque tenga los mismos
  // valores) dispara un re-render en bucle ("Maximum update depth
  // exceeded"). Solo se actualiza el estado si las líneas realmente
  // cambiaron.
  const commitGuides = useCallback((next: Guides) => {
    if (!guidesEqual(guidesRef.current, next)) {
      guidesRef.current = next
      setGuides(next)
    }
  }, [])

  // Identidad estable entre renders (containerRef/othersRef/commitGuides no
  // cambian) — si el array de `modifiers` recibiera una función nueva en
  // cada render, dnd-kit la reevalúa de más y puede realimentar el mismo bucle.
  const snapModifier = useMemo(() => makeSnapModifier(containerRef, othersRef, commitGuides), [commitGuides])

  return (
    <DndContext
      sensors={sensors}
      modifiers={[snapModifier, restrictToParentElement]}
      onDragStart={(e) => {
        const container = containerRef.current
        if (!container) return
        const containerRect = container.getBoundingClientRect()
        othersRef.current = buttons
          .filter((b) => b.id !== e.active.id)
          .map((b) => {
            const node = container.querySelector<HTMLElement>(`[data-btn-id="${b.id}"]`)
            if (!node) return null
            const rect = rectFromDom(node.getBoundingClientRect(), containerRect)
            return { id: b.id, rect }
          })
          .filter((v): v is OtherRect => v !== null)
      }}
      onDragEnd={(e) => {
        commitGuides({ v: null, h: null })
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
      onDragCancel={() => commitGuides({ v: null, h: null })}
    >
      <div ref={containerRef} className="pointer-events-none absolute inset-0" style={{ zIndex: 5 }}>
        {buttons.map((b, i) => (
          <DraggableButton key={b.id} button={b} index={i} edit={edit} xKey={xKey} yKey={yKey} buttonClassName={buttonClassName} />
        ))}

        {guides.v && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: guides.v.x,
              top: guides.v.y1,
              width: 1,
              height: guides.v.y2 - guides.v.y1,
              background: GUIDE_COLOR,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
              zIndex: 60,
            }}
          />
        )}
        {guides.h && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: guides.h.x1,
              top: guides.h.y,
              width: guides.h.x2 - guides.h.x1,
              height: 1,
              background: GUIDE_COLOR,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
              zIndex: 60,
            }}
          />
        )}
      </div>
    </DndContext>
  )
}
