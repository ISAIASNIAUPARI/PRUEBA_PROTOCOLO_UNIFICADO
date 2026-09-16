'use client'

import { useEffect, useRef } from 'react'

import { usePreviewReadOnly } from '@/components/admin/Selection'
import { useIsMobileView } from '@/components/admin/useIsMobileView'
import { EditableText } from '@/components/editable/EditableText'
import { textColorProps } from '@/lib/text-colors'
import type { TextColors } from '@/lib/types'

import { SealStar } from './Seal'

const TOTAL = 239
const BASE = 'https://res.cloudinary.com/foewxv45/image/upload'

function frameUrl(index: number, mobile: boolean) {
  const id = `lgrframe${String(index + 1).padStart(4, '0')}`
  const w = mobile ? 660 : 1288
  return `${BASE}/f_auto,q_auto,w_${w}/${id}.jpg`
}

type FrameScrollData = { heading?: string; subheading?: string; textColors?: TextColors }

export function FrameScroll({
  heading,
  subheading,
  textColors,
  edit,
  onChange,
}: FrameScrollData & {
  edit?: boolean
  onChange?: (next: FrameScrollData) => void
}) {
  const isMobile = useIsMobileView()
  const readOnly = usePreviewReadOnly()
  const color = textColorProps(textColors, (tc) => onChange?.({ heading, subheading, textColors: tc }))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    const progress = progressRef.current
    if (!canvas || !section || !progress) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mobile = window.innerWidth < 768
    const step = mobile ? 2 : 1
    const workers = mobile ? 6 : 12

    const frames: (HTMLImageElement | null)[] = new Array(TOTAL).fill(null)
    let ready = false
    let cur = 0
    let target = 0
    let rafId = 0
    let visible = false

    function draw(idx: number) {
      const snapped = mobile ? Math.round(idx / step) * step : idx
      const i = Math.min(TOTAL - 1, Math.max(0, snapped))
      const img = frames[i]
      if (!img || !img.complete || !img.naturalWidth) return
      const cw = canvas!.width
      const ch = canvas!.height
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx!.clearRect(0, 0, cw, ch)
      ctx!.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = canvas!.clientWidth * dpr
      canvas!.height = canvas!.clientHeight * dpr
      draw(Math.round(cur))
    }

    function preload() {
      if (ready) return
      ready = true
      const indices: number[] = []
      for (let i = 0; i < TOTAL; i += step) indices.push(i)

      let qi = 0
      let active = 0

      function pump() {
        while (active < workers && qi < indices.length) {
          const i = indices[qi++]
          active++
          const im = new Image()
          im.onload = im.onerror = () => {
            active--
            if (i === 0 && im.complete) draw(0)
            pump()
          }
          im.src = frameUrl(i, mobile)
          frames[i] = im
        }
      }
      pump()
    }

    function onScroll() {
      const rect = section!.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      let p = total > 0 ? -rect.top / total : 0
      p = Math.min(1, Math.max(0, p))
      target = p * (TOTAL - 1)
      progress!.style.width = `${p * 100}%`
    }

    function loop() {
      cur += (target - cur) * 0.22
      draw(Math.round(cur))
      if (visible) {
        rafId = requestAnimationFrame(loop)
      } else {
        rafId = 0
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            visible = true
            if (!ready) preload()
            if (!rafId) rafId = requestAnimationFrame(loop)
          } else {
            visible = false
          }
        })
      },
      { rootMargin: '600px 0px', threshold: 0 }
    )
    io.observe(section)

    window.addEventListener('resize', resize)
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    resize()
    onScroll()

    return () => {
      io.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('scroll', onScroll, { capture: true })
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // En el preview del admin esta sección se pinta COMPACTA.
  //
  // El original mide 240-300vh de alto con un <canvas> sticky de 100vh: es una
  // pista de scroll para que los fotogramas avancen con la rueda. Dentro del
  // marco de móvil simulado esas unidades siguen midiendo contra la VENTANA
  // real, no contra el marco, así que quedaba un hueco blanco enorme entre el
  // título y el primer fotograma — que es lo que se veía "vacío". Además la
  // animación por scroll no tiene sentido en un preview: acá solo hace falta
  // poder editar el título y el subtítulo y ver un fotograma de muestra.
  if (readOnly) {
    return (
      <section className="frame-scroll" id="experiencia" style={{ height: 'auto' }}>
        <div className="sec-head reveal">
          <SealStar />
          <h2 style={isMobile ? { fontSize: '26px' } : undefined}>
            <EditableText as="span" edit={edit} value={heading} onChange={(v) => onChange?.({ heading: v, subheading, textColors })} {...color('heading')} />
          </h2>
          {(subheading || edit) && (
            <div className="sub" style={isMobile ? { fontSize: '12px' } : undefined}>
              <EditableText as="span" edit={edit} value={subheading} onChange={(v) => onChange?.({ heading, subheading: v, textColors })} {...color('subheading')} />
            </div>
          )}
          <div className="rule" />
        </div>
        <div className="fs-frame" style={{ margin: '0 auto 48px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frameUrl(0, isMobile)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <p className="relative z-10 mx-auto max-w-lg px-4 pb-8 text-center text-xs" style={{ color: 'var(--ink-soft)' }}>
          La animación por scroll solo se ve en el sitio publicado. Los fotogramas no se cambian desde aquí — se generan aparte a partir de un video.
        </p>
      </section>
    )
  }

  return (
    <section className="frame-scroll" id="experiencia" ref={sectionRef}>
      <div className="sec-head reveal">
        <SealStar />
        <h2 style={isMobile ? { fontSize: '26px' } : undefined}>
          <EditableText as="span" edit={edit} value={heading} onChange={(v) => onChange?.({ heading: v, subheading, textColors })} {...color('heading')} />
        </h2>
        {(subheading || edit) && (
          <div className="sub" style={isMobile ? { fontSize: '12px' } : undefined}>
            <EditableText as="span" edit={edit} value={subheading} onChange={(v) => onChange?.({ heading, subheading: v, textColors })} {...color('subheading')} />
          </div>
        )}
        <div className="rule" />
      </div>
      {edit && (
        <p className="relative z-10 mx-auto max-w-lg px-4 text-center text-xs" style={{ color: 'var(--ink-soft)' }}>
          Los fotogramas de esta animación no se cambian desde aquí — se generan aparte a partir de un video.
        </p>
      )}

      <div className="fs-pin" id="fsPin">
        <div className="fs-frame">
          <canvas id="fsCanvas" ref={canvasRef} />
          <div className="fs-progress-wrap">
            <div className="fs-progress" id="fsProgress" ref={progressRef} />
          </div>
        </div>
      </div>
    </section>
  )
}
