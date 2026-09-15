'use client'

import { useEffect, useRef } from 'react'

import { CloudinaryVideo } from '@/components/editable/CloudinaryVideo'
import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import type { Dish } from '@/lib/types'

import { SealChef } from './Seal'

type SpecialsData = {
  heading?: string
  subheading?: string
  videoUrl: string
  dishes: Dish[]
}

export function Specials({
  heading,
  subheading,
  videoUrl,
  dishes,
  edit,
  onChange,
}: SpecialsData & {
  edit?: boolean
  onChange?: (next: SpecialsData) => void
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

  function patch(next: Partial<SpecialsData>) {
    onChange?.({ heading, subheading, videoUrl, dishes, ...next })
  }

  return (
    <section className="especiales" id="especiales">
      <div className="esp-header">
        {edit ? (
          <div className="vid-bg">
            <CloudinaryVideo
              edit
              src={videoUrl}
              className="h-full w-full object-cover"
              onChange={(url) => patch({ videoUrl: url })}
            />
          </div>
        ) : (
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
        )}
        <div className="vid-scrim" />
        <div className="wrap">
          <div className="sec-head reveal">
            <SealChef />
            <h2>
              <EditableText as="span" edit={edit} value={heading} onChange={(v) => patch({ heading: v })} />
            </h2>
            {(subheading || edit) && (
              <div className="sub">
                <EditableText as="span" edit={edit} value={subheading} onChange={(v) => patch({ subheading: v })} />
              </div>
            )}
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
                {edit ? (
                  <EditableImage
                    edit
                    src={d.url}
                    alt={d.name}
                    imgClassName="h-full w-full object-cover"
                    onChange={(url) => {
                      const next = dishes.slice()
                      next[i] = { ...d, url }
                      patch({ dishes: next })
                    }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={d.url} alt={d.name || ''} loading="lazy" decoding="async" />
                )}
              </div>
              <div className="label">
                <EditableText
                  as="span"
                  edit={edit}
                  value={d.name}
                  onChange={(v) => {
                    const next = dishes.slice()
                    next[i] = { ...d, name: v }
                    patch({ dishes: next })
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
