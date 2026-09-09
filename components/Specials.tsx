'use client'

import { useEffect, useRef } from 'react'

import { SealChef } from './Seal'

type Dish = { name?: string; url: string }

export function Specials({
  heading,
  subheading,
  videoUrl,
  dishes,
}: {
  heading?: string
  subheading?: string
  videoUrl: string
  dishes: Dish[]
}) {
  const vidRef = useRef<HTMLVideoElement>(null)

  // El vídeo de la cabecera va a cámara lenta (0.55x), como en el original.
  useEffect(() => {
    const vid = vidRef.current
    if (!vid) return
    vid.playbackRate = 0.55
    const onCanPlay = () => {
      vid.play().catch(() => {})
    }
    const onPlay = () => {
      vid.playbackRate = 0.55
    }
    vid.addEventListener('canplay', onCanPlay)
    vid.addEventListener('play', onPlay)
    return () => {
      vid.removeEventListener('canplay', onCanPlay)
      vid.removeEventListener('play', onPlay)
    }
  }, [])

  return (
    <section className="especiales" id="especiales">
      <div className="esp-header">
        <video
          className="vid-bg"
          id="especVid"
          ref={vidRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ filter: 'brightness(.92)' }}
          src={videoUrl}
        />
        <div className="vid-scrim" />
        <div className="wrap">
          <div className="sec-head reveal">
            <SealChef />
            <h2>{heading}</h2>
            {subheading && <div className="sub">{subheading}</div>}
            <div className="rule" />
          </div>
        </div>
      </div>

      {/* grid de platos sobre fondo blanco */}
      <div className="wrap" style={{ paddingTop: 54 }}>
        <div className="dish-grid" id="dishGrid">
          {dishes.map((d, i) => (
            <div className="dish reveal" key={i}>
              <div className="ph">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.url}
                  alt={d.name || ''}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="label">{d.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
