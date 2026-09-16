'use client'

import { useEffect, useRef } from 'react'

import { useIsMobileView } from '@/components/admin/useIsMobileView'
import { CloudinaryVideo } from '@/components/editable/CloudinaryVideo'
import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
import type { Dish, TextColors, TextSizes, TextWeights } from '@/lib/types'

import { SealChef } from './Seal'

type SpecialsData = {
  heading?: string
  subheading?: string
  videoUrl: string
  dishes: Dish[]
  /** Overrides de color por texto (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export function Specials({
  heading,
  subheading,
  videoUrl,
  dishes,
  textColors,
  textSizes,
  textWeights,
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

  const isMobile = useIsMobileView()

  function patch(next: Partial<SpecialsData>) {
    onChange?.({ heading, subheading, videoUrl, dishes, textColors, textSizes, textWeights, ...next })
  }

  const color = textColorProps(textColors, (tc) => patch({ textColors: tc }))

  const sizeWeight = textSizeProps(textSizes, textWeights, (next) => patch(next))

  return (
    <section className="especiales" id="especiales">
      <div className="esp-header">
        {edit ? (
          <div className="vid-bg" style={{ pointerEvents: 'auto' }}>
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
            <h2 style={isMobile ? { fontSize: '26px' } : undefined}>
              <EditableText as="span" edit={edit} value={heading} onChange={(v) => patch({ heading: v })} {...color('heading')} {...sizeWeight('heading')} />
            </h2>
            {(subheading || edit) && (
              <div className="sub" style={isMobile ? { fontSize: '12px' } : undefined}>
                <EditableText as="span" edit={edit} value={subheading} onChange={(v) => patch({ subheading: v })} {...color('subheading')} {...sizeWeight('subheading')} />
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
                    className="h-full w-full"
                    src={d.url}
                    alt={d.name}
                    imgClassName="h-full w-full object-cover"
                    aspectRatio={4 / 5}
                    focalX={d.focalX}
                    focalY={d.focalY}
                    onChange={(url) => {
                      const next = dishes.slice()
                      next[i] = { ...d, url }
                      patch({ dishes: next })
                    }}
                    onFocalChange={(x, y) => {
                      const next = dishes.slice()
                      next[i] = { ...d, focalX: x, focalY: y }
                      patch({ dishes: next })
                    }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={d.url}
                    alt={d.name || ''}
                    loading="lazy"
                    decoding="async"
                    style={d.focalX != null && d.focalY != null ? { objectPosition: `${d.focalX}% ${d.focalY}%` } : undefined}
                  />
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
                  {...color(`dishes.${i}.name`)} {...sizeWeight(`dishes.${i}.name`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
