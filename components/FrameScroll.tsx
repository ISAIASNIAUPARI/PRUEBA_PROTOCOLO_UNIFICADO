'use client'

import { useEffect, useRef } from 'react'

import { SealStar } from './Seal'

const TOTAL = 126

/**
 * La animación que avanza con el scroll: 126 fotogramas dibujados en un
 * <canvas>. Es la misma lógica del HTML original — precarga diferida con
 * IntersectionObserver, dibujo en requestAnimationFrame y DPR limitado a 2
 * para no crear un canvas gigantesco en móviles de alta densidad.
 */
export function FrameScroll({
  heading,
  subheading,
}: {
  heading?: string
  subheading?: string
}) {
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

    const frames: HTMLImageElement[] = new Array(TOTAL)
    let current = -1
    let ready = false

    const pad = (n: number) => String(n).padStart(3, '0')

    function draw(i: number) {
      const img = frames[i]
      if (!img || !img.complete || !img.naturalWidth) return
      const cw = canvas!.width
      const ch = canvas!.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      const scale = Math.max(cw / iw, ch / ih)
      const dw = iw * scale
      const dh = ih * scale
      ctx!.clearRect(0, 0, cw, ch)
      ctx!.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = canvas!.clientWidth * dpr
      canvas!.height = canvas!.clientHeight * dpr
      draw(Math.max(current, 0))
    }

    function preload() {
      for (let i = 0; i < TOTAL; i++) {
        const im = new Image()
        im.onload = () => {
          if (i === 0) draw(0)
        }
        im.src = `/frames/ezgif-frame-${pad(i + 1)}.jpg`
        frames[i] = im
      }
      ready = true
    }

    function onScroll() {
      const rect = section!.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      let p = total > 0 ? -rect.top / total : 0
      p = Math.min(1, Math.max(0, p))
      progress!.style.width = `${p * 100}%`
      const idx = Math.min(TOTAL - 1, Math.floor(p * TOTAL))
      if (idx !== current) {
        current = idx
        draw(idx)
      }
    }

    let ticking = false
    function onScrollThrottled() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          onScroll()
          ticking = false
        })
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !ready) {
            preload()
            io.disconnect()
          }
        })
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(section)

    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScrollThrottled, { passive: true })
    resize()
    onScroll()

    return () => {
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScrollThrottled)
    }
  }, [])

  return (
    <section className="frame-scroll" id="experiencia" ref={sectionRef}>
      <div className="sec-head reveal">
        <SealStar />
        <h2>{heading}</h2>
        {subheading && <div className="sub">{subheading}</div>}
        <div className="rule" />
      </div>

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
