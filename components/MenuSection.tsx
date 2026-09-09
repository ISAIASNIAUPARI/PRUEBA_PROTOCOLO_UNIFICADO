'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { SealCloche } from './Seal'

type Item = { name?: string; description?: string; price?: string }
type Category = { title?: string; items?: Item[] }

export function MenuSection({
  heading,
  subheading,
  watermark,
  videoUrl,
  categories,
  buttonLabel,
  buttonHref,
}: {
  heading?: string
  subheading?: string
  watermark?: string
  videoUrl: string
  categories: Category[]
  buttonLabel?: string
  buttonHref?: string
}) {
  const vidRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // El vídeo sólo se descarga y reproduce cuando la sección entra en pantalla.
  useEffect(() => {
    const vid = vidRef.current
    const section = sectionRef.current
    if (!vid || !section) return

    let loaded = false
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!loaded) {
              vid.load()
              loaded = true
            }
            vid.play().catch(() => {})
          } else {
            vid.pause()
          }
        })
      },
      { threshold: 0.15 }
    )
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="menu" id="menu" ref={sectionRef}>
      <video
        className="vid-bg"
        id="menuVid"
        ref={vidRef}
        muted
        loop
        playsInline
        preload="none"
        src={videoUrl}
      />
      <div className="vid-scrim" />
      {watermark && <div className="watermark">{watermark}</div>}
      <div className="wrap">
        <div className="sec-head reveal">
          <SealCloche />
          <h2>{heading}</h2>
          {subheading && <div className="sub">{subheading}</div>}
          <div className="rule" />
        </div>

        <div className="menu-cols" id="menuCols">
          {categories.map((cat, i) => (
            <div
              className="menu-col reveal"
              key={i}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <h3 className="menu-cat">{cat.title}</h3>
              {(cat.items ?? []).map((it, j) => (
                <div className="m-item" key={j}>
                  <div className="m-row">
                    <span className="m-name">{it.name}</span>
                    <span className="m-price">{it.price}</span>
                  </div>
                  <div className="m-desc">{it.description}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {buttonLabel && (
          <div className="btn-outline-wrap reveal">
            <Link href={buttonHref || '#'} className="btn-outline">
              {buttonLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
