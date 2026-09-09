'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Slide = { url: string; alt?: string }
type Cta = { label?: string; href?: string }

export function Hero({
  title,
  slides,
  ctas,
}: {
  title?: string
  slides: Slide[]
  ctas?: Cta[]
}) {
  const [current, setCurrent] = useState(0)

  // Fundido entre fotos cada 5 segundos, como en el original.
  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      5000
    )
    return () => clearInterval(id)
  }, [slides.length])

  // El titular admite un salto de línea escrito desde Sanity.
  const lines = (title || '').split('\n')

  return (
    <section className="hero" id="inicio">
      <div className="hero-slides" id="heroSlides">
        {slides.map((s, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={s.url}
            src={s.url}
            alt={s.alt || ''}
            className={i === current ? 'active' : undefined}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'auto'}
          />
        ))}
      </div>
      <div className="scrim" />
      <div className="inner">
        <h1>
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        {!!ctas?.length && (
          <div className="cta">
            {ctas.map((c, i) => (
              <Link key={i} href={c.href || '#'} className="btn-ghost">
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
