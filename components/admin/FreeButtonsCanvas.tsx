'use client'

import { DndContext, PointerSensor, useDraggable, useSensor, useSensors, type Modifier } from '@dnd-kit/core'
import { useCallback, useMemo, useRef, useState } from 'react'

import { resolveButtonHref, themeColorVar } from '@/lib/buttons'
import type { ButtonRef } from '@/lib/types'

type XKey = 'desktopX' | 'mobileX'
type YKey = 'desktopY' | 'mobileY'

const SNAP_PX = 8
const GUIDE_MARGIN = 16
const GUIDE_COLOR = '#00e676'

type Rect = { left: number; top: number; width: number; height: number; right: number; bottom: number; centerX: number; centerY: number }

type Guide = { pos: number; from: number; to: number }
/** Chip verde con la separación en px entre el botón arrastrado y su vecino alineado. */
type GapBadge = { x: number; y: number; value: number }
type Overlay = {
  v: Guide | null
  h: Guide | null
  gapV: GapBadge | null
  gapH: GapBadge | null
  size: { x: number; y: number; w: number; h: number } | null
}

const EMPTY_OVERLAY: Overlay = { v: null, h: null, gapV: null, gapH: null, size: null }

function defaultPos(i: number) {
  return { x: 10 + i * 25, y: 80 }
}

function colorStyle(button: ButtonRef, index: number): React.CSSProperties | undefined {
  const v = themeColorVar(button.color)
  if (!v) return undefined
  return index === 0 ? { background: v, borderColor: v, color: '#fff' } : { borderColor: v, color: v }
}

function guideEq(a: Guide | null, b: Guide | null) {
  return a === b || (a !== null && b !== null && a.pos === b.pos && a.from === b.from && a.to === b.to)
}
function gapEq(a: GapBadge | null, b: GapBadge | null) {
  return a === b || (a !== null && b !== null && a.x === b.x && a.y === b.y && a.value === b.value)
}
function overlayEqual(a: Overlay, b: Overlay) {
  const sizeEq =
    a.size === b.size ||
    (a.size !== null && b.size !== null && a.size.x === b.size.x && a.size.y === b.size.y && a.size.w === b.size.w && a.size.h === b.size.h)
  return guideEq(a.v, b.v) && guideEq(a.h, b.h) && gapEq(a.gapV, b.gapV) && gapEq(a.gapH, b.gapH) && sizeEq
}

/**
 * Convierte un rect de viewport a coordenadas RELATIVAS AL CANVAS.
 *
 * Todas las medidas se toman UNA sola vez al empezar el arrastre y de ahí en
 * adelante solo se le suma el `transform` de dnd-kit. Eso evita dos problemas
 * que tenía la versión anterior:
 *
 * 1. Medir con offsetLeft/offsetTop/offsetWidth/offsetHeight devuelve enteros
 *    REDONDEADOS. Con anchos reales fraccionarios (105.29px, 54.12px…) el
 *    punto de alineación calculado quedaba hasta ~1-2px corrido del real: el
 *    botón "se pegaba" pero visiblemente desalineado. getBoundingClientRect
 *    da el valor fraccionario exacto.
 * 2. Recalcular contra el DOM en cada frame desincronizaba todo si la página
 *    scrolleaba durante el arrastre (el rect del botón activo se congela en
 *    coordenadas de viewport viejas mientras el del contenedor sí se mueve).
 *    Como ningún elemento cambia de posición RELATIVA dentro del canvas
 *    mientras se arrastra, medir una vez es además lo correcto.
 */
function toRect(r: { left: number; top: number; width: number; height: number }, container: DOMRect): Rect {
  const left = r.left - container.left
  const top = r.top - container.top
  return { left, top, width: r.width, height: r.height, right: left + r.width, bottom: top + r.height, centerX: left + r.width / 2, centerY: top + r.height / 2 }
}

type SnapResult = { delta: number; target: number; other: Rect | null }

/**
 * Busca el mejor candidato de alineación en un eje: compara los 3 puntos del
 * botón arrastrado (inicio / centro / fin) contra los 3 de cada vecino y contra
 * el centro del contenedor, y se queda con el MÁS CERCANO dentro del umbral.
 *
 * La versión anterior se quedaba con el PRIMER candidato dentro del umbral
 * recorriendo los vecinos en orden de array — con más de un botón cerca, cuál
 * ganaba dependía del orden en el JSON y no de la distancia real, así que el
 * botón se pegaba a una guía distinta de la que el usuario veía más cerca.
 */
function bestSnap(cur: [number, number, number], others: Rect[], pick: (r: Rect) => [number, number, number], containerCenter: number): SnapResult | null {
  // Objetivos candidatos: los 3 puntos de cada vecino + el centro del
  // contenedor (centrar un botón en su sección es la alineación más pedida y
  // antes no existía como candidato).
  const targets: { value: number; other: Rect | null }[] = [{ value: containerCenter, other: null }]
  for (const o of others) {
    for (const t of pick(o)) targets.push({ value: t, other: o })
  }

  let best: (SnapResult & { dist: number }) | null = null
  for (const { value, other } of targets) {
    for (const c of cur) {
      const dist = Math.abs(c - value)
      if (dist <= SNAP_PX && (!best || dist < best.dist)) {
        best = { delta: value - c, target: value, other, dist }
      }
    }
  }

  return best && { delta: best.delta, target: best.target, other: best.other }
}

function makeSnapModifier(
  containerRectRef: React.MutableRefObject<DOMRect | null>,
  activeAnchorRef: React.MutableRefObject<{ x: number; y: number } | null>,
  othersRef: React.MutableRefObject<Rect[]>,
  activeBaseRef: React.MutableRefObject<Rect | null>,
  lastDeltaRef: React.MutableRefObject<{ x: number; y: number }>,
  setOverlay: (o: Overlay) => void
): Modifier {
  return ({ transform, activeNodeRect }) => {
    const containerRect = containerRectRef.current
    const anchor = activeAnchorRef.current
    if (!containerRect || !activeNodeRect || !anchor) return transform

    // De `activeNodeRect` solo se usa el TAMAÑO. Su posición no sirve acá:
    // dnd-kit la mide sin aplicar el `translate(-50%,-50%)` del botón, así que
    // su `left/top` es el punto ancla, mientras que los otros botones se miden
    // con getBoundingClientRect (caja visual ya desplazada). Mezclar las dos
    // convenciones desfasaba al botón activo medio ancho y medio alto respecto
    // de sus vecinos: el snap comparaba contra puntos que no eran los que el
    // usuario veía, y al soltar el botón "saltaba".
    //
    // El ancla se deriva del porcentaje guardado (la fuente de verdad de la
    // posición), que no depende de ningún detalle interno de dnd-kit.
    const width = activeNodeRect.width
    const height = activeNodeRect.height
    const left = anchor.x - width / 2
    const top = anchor.y - height / 2
    const base: Rect = {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      centerX: anchor.x,
      centerY: anchor.y,
    }
    activeBaseRef.current = base

    const cw = containerRect.width
    const ch = containerRect.height
    const others = othersRef.current

    let dx = transform.x
    let dy = transform.y

    const snapX = bestSnap(
      [base.left + dx, base.centerX + dx, base.right + dx],
      others,
      (r) => [r.left, r.centerX, r.right],
      cw / 2
    )
    if (snapX) dx += snapX.delta

    const snapY = bestSnap(
      [base.top + dy, base.centerY + dy, base.bottom + dy],
      others,
      (r) => [r.top, r.centerY, r.bottom],
      ch / 2
    )
    if (snapY) dy += snapY.delta

    // Contención dentro de la sección, hecha acá en vez de con
    // restrictToParentElement: ese modifier corría DESPUÉS del snap y podía
    // recortar el ajuste ya aplicado, dejando la línea guía dibujada en un
    // sitio donde el botón finalmente no quedaba.
    const minDx = -base.left
    const maxDx = cw - base.right
    const minDy = -base.top
    const maxDy = ch - base.bottom
    const clampedDx = Math.min(maxDx, Math.max(minDx, dx))
    const clampedDy = Math.min(maxDy, Math.max(minDy, dy))
    // Si el borde recortó el movimiento, la guía de ese eje ya no es cierta.
    const keepX = clampedDx === dx
    const keepY = clampedDy === dy
    dx = clampedDx
    dy = clampedDy

    const cur: Rect = {
      left: base.left + dx,
      top: base.top + dy,
      width: base.width,
      height: base.height,
      right: base.right + dx,
      bottom: base.bottom + dy,
      centerX: base.centerX + dx,
      centerY: base.centerY + dy,
    }

    let v: Guide | null = null
    let gapV: GapBadge | null = null
    if (snapX && keepX) {
      const o = snapX.other
      v = o
        ? { pos: snapX.target, from: Math.min(cur.top, o.top) - GUIDE_MARGIN, to: Math.max(cur.bottom, o.bottom) + GUIDE_MARGIN }
        : { pos: snapX.target, from: 0, to: ch }
      if (o) {
        // Separación vertical libre entre los dos (0 si se tocan o solapan).
        const gap = cur.top >= o.bottom ? cur.top - o.bottom : o.top >= cur.bottom ? o.top - cur.bottom : 0
        if (gap > 0) {
          const midY = cur.top >= o.bottom ? (o.bottom + cur.top) / 2 : (cur.bottom + o.top) / 2
          gapV = { x: snapX.target, y: midY, value: Math.round(gap) }
        }
      }
    }

    let h: Guide | null = null
    let gapH: GapBadge | null = null
    if (snapY && keepY) {
      const o = snapY.other
      h = o
        ? { pos: snapY.target, from: Math.min(cur.left, o.left) - GUIDE_MARGIN, to: Math.max(cur.right, o.right) + GUIDE_MARGIN }
        : { pos: snapY.target, from: 0, to: cw }
      if (o) {
        const gap = cur.left >= o.right ? cur.left - o.right : o.left >= cur.right ? o.left - cur.right : 0
        if (gap > 0) {
          const midX = cur.left >= o.right ? (o.right + cur.left) / 2 : (cur.right + o.left) / 2
          gapH = { x: midX, y: snapY.target, value: Math.round(gap) }
        }
      }
    }

    lastDeltaRef.current = { x: dx, y: dy }
    setOverlay({
      v,
      h,
      gapV,
      gapH,
      size: { x: cur.centerX, y: cur.bottom, w: Math.round(cur.width), h: Math.round(cur.height) },
    })

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
 * líneas guía de alineación, chip de separación y medida del botón mientras se
 * arrastra. Cubre el área completa de la sección (position:absolute;inset:0)
 * sin ocupar espacio en el flujo normal — la sección debe tener
 * position:relative.
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
  const othersRef = useRef<Rect[]>([])
  const activeBaseRef = useRef<Rect | null>(null)
  const activeAnchorRef = useRef<{ x: number; y: number } | null>(null)
  const containerRectRef = useRef<DOMRect | null>(null)
  const lastDeltaRef = useRef({ x: 0, y: 0 })
  const overlayRef = useRef<Overlay>(EMPTY_OVERLAY)
  const [overlay, setOverlay] = useState<Overlay>(EMPTY_OVERLAY)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // El modifier corre en cada frame del arrastre — sin este guard, llamar
  // setState con un objeto nuevo (aunque tenga los mismos valores) dispara un
  // re-render en bucle ("Maximum update depth exceeded"). Ver error #22.
  const commitOverlay = useCallback((next: Overlay) => {
    if (!overlayEqual(overlayRef.current, next)) {
      overlayRef.current = next
      setOverlay(next)
    }
  }, [])

  const snapModifier = useMemo(
    () => makeSnapModifier(containerRectRef, activeAnchorRef, othersRef, activeBaseRef, lastDeltaRef, commitOverlay),
    [commitOverlay]
  )

  return (
    <DndContext
      sensors={sensors}
      modifiers={[snapModifier]}
      // El auto-scroll movía la página al acercarse al borde mientras se
      // arrastraba, y eso descuadraba las referencias de alineación. Para
      // mover un botón dentro de su propia sección no aporta nada.
      autoScroll={false}
      onDragStart={(e) => {
        const container = containerRef.current
        if (!container) return
        lastDeltaRef.current = { x: 0, y: 0 }
        // El rect del contenedor se congela acá y se reutiliza todo el
        // arrastre, en el mismo "snapshot" de coordenadas que el
        // `activeNodeRect` que dnd-kit ya midió: así, aunque la página se
        // mueva después, las distancias relativas siguen siendo correctas.
        const containerRect = container.getBoundingClientRect()
        containerRectRef.current = containerRect
        activeBaseRef.current = null

        // Ancla del botón activo en px, derivada del % guardado (o de su
        // posición por defecto si aún no tiene uno para esta vista).
        const activeIdx = buttons.findIndex((b) => b.id === e.active.id)
        if (activeIdx === -1) return
        const activeBtn = buttons[activeIdx]
        const dflt = defaultPos(activeIdx)
        activeAnchorRef.current = {
          x: ((activeBtn[xKey] ?? dflt.x) / 100) * containerRect.width,
          y: ((activeBtn[yKey] ?? dflt.y) / 100) * containerRect.height,
        }

        othersRef.current = buttons
          .filter((b) => b.id !== e.active.id)
          .map((b) => container.querySelector<HTMLElement>(`[data-btn-id="${b.id}"]`))
          .filter((n): n is HTMLElement => n !== null)
          .map((n) => toRect(n.getBoundingClientRect(), containerRect))
      }}
      onDragEnd={(e) => {
        commitOverlay(EMPTY_OVERLAY)
        const anchor = activeAnchorRef.current
        const containerRect = containerRectRef.current
        activeBaseRef.current = null
        activeAnchorRef.current = null
        containerRectRef.current = null
        if (!anchor || !containerRect) return
        const cw = containerRect.width
        const ch = containerRect.height
        if (!cw || !ch) return

        const idx = buttons.findIndex((b) => b.id === e.active.id)
        if (idx === -1) return

        // Se usa el delta que dejó el modifier (el que de verdad se pintó,
        // con snap y contención ya aplicados) en vez de e.delta: así la
        // posición guardada es exactamente la que el usuario vio al soltar.
        const { x: dx, y: dy } = lastDeltaRef.current
        const nx = Math.min(100, Math.max(0, ((anchor.x + dx) / cw) * 100))
        const ny = Math.min(100, Math.max(0, ((anchor.y + dy) / ch) * 100))

        const next = buttons.slice()
        next[idx] = { ...next[idx], [xKey]: nx, [yKey]: ny }
        onChange(next)
      }}
      onDragCancel={() => {
        activeBaseRef.current = null
        activeAnchorRef.current = null
        containerRectRef.current = null
        commitOverlay(EMPTY_OVERLAY)
      }}
    >
      <div ref={containerRef} className="pointer-events-none absolute inset-0" style={{ zIndex: 5 }}>
        {buttons.map((b, i) => (
          <DraggableButton key={b.id} button={b} index={i} edit={edit} xKey={xKey} yKey={yKey} buttonClassName={buttonClassName} />
        ))}

        {overlay.v && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: overlay.v.pos,
              top: overlay.v.from,
              width: 1,
              height: overlay.v.to - overlay.v.from,
              background: GUIDE_COLOR,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
              zIndex: 60,
            }}
          />
        )}
        {overlay.h && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: overlay.h.from,
              top: overlay.h.pos,
              width: overlay.h.to - overlay.h.from,
              height: 1,
              background: GUIDE_COLOR,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
              zIndex: 60,
            }}
          />
        )}

        {overlay.gapV && <GapChip x={overlay.gapV.x} y={overlay.gapV.y} value={overlay.gapV.value} />}
        {overlay.gapH && <GapChip x={overlay.gapH.x} y={overlay.gapH.y} value={overlay.gapH.value} />}

        {overlay.size && (
          <div
            className="pointer-events-none absolute whitespace-nowrap"
            style={{
              left: overlay.size.x,
              top: overlay.size.y + 6,
              transform: 'translateX(-50%)',
              fontSize: 11,
              lineHeight: '14px',
              color: 'rgba(255,255,255,0.75)',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              zIndex: 61,
            }}
          >
            {overlay.size.w} x {overlay.size.h}
          </div>
        )}
      </div>
    </DndContext>
  )
}

function GapChip({ x, y, value }: { x: number; y: number; value: number }) {
  return (
    <div
      className="pointer-events-none absolute whitespace-nowrap rounded"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        background: GUIDE_COLOR,
        color: '#0b1f12',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '14px',
        padding: '1px 5px',
        zIndex: 62,
      }}
    >
      {value}
    </div>
  )
}
