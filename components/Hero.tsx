'use client'

import { useEffect, useRef, useState } from 'react'

import { useIsMobileView } from '@/components/admin/useIsMobileView'
import { ButtonsArea } from '@/components/editable/ButtonsArea'
import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { resolveButtonHref } from '@/lib/buttons'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
import type { ButtonRef, ImageRef, TextColors, TextSizes, TextWeights } from '@/lib/types'

type HeroData = {
  title?: string
  slides: ImageRef[]
  buttons?: ButtonRef[]
  /** Overrides de color por texto (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

function heroButtonClass() {
  return 'btn-ghost'
}

export function Hero({
  title,
  slides,
  buttons,
  textColors,
  textSizes,
  textWeights,
  edit,
  onChange,
}: HeroData & {
  edit?: boolean
  onChange?: (next: HeroData) => void
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [current, setCurrent] = useState(0)
  // clamp(30px,4.6vw,62px) del CSS original se calcula contra el viewport
  // real — dentro del frame simulado de 390px del admin eso da un tamaño
  // enorme. Con tamaño fijo en vez de vw se evita (ver Parte 8, bug #1 de
  // 13 - Panel Admin, Fase D, funciones avanzadas (parte 2)).
  const isMobile = useIsMobileView()

  // Fundido entre fotos cada 5 segundos, como en el original.
  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      5000
    )
    return () => clearInterval(id)
  }, [slides.length])

  // El titular admite un salto de línea escrito desde el admin.
  const lines = (title || '').split('\n')
  const list = buttons ?? []

  function patch(next: Partial<HeroData>) {
    onChange?.({ title, slides, buttons, textColors, textSizes, textWeights, ...next })
  }

  const color = textColorProps(textColors, (tc) => patch({ textColors: tc }))

  const sizeWeight = textSizeProps(textSizes, textWeights, (next) => patch(next))

  return (
    <section className="hero" id="inicio" ref={sectionRef}>
      <div className="hero-slides" id="heroSlides">
        {slides.map((s, i) =>
          edit ? (
            <EditableImage
              key={i}
              edit
              fill
              src={s.url}
              alt={s.alt}
              imgClassName={i === current ? 'active' : undefined}
              focalX={s.focalX}
              focalY={s.focalY}
              aspectRatio={16 / 9}
              onChange={(url) => {
                const next = slides.slice()
                next[i] = { ...s, url }
                patch({ slides: next })
              }}
              onFocalChange={(x, y) => {
                const next = slides.slice()
                next[i] = { ...s, focalX: x, focalY: y }
                patch({ slides: next })
              }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={s.url}
              src={s.url}
              alt={s.alt || ''}
              className={i === current ? 'active' : undefined}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'auto'}
              style={s.focalX != null && s.focalY != null ? { objectPosition: `${s.focalX}% ${s.focalY}%` } : undefined}
            />
          )
        )}
      </div>
      <div className="scrim" />
      <div className="inner">
        <h1 style={isMobile ? { fontSize: '30px' } : undefined}>
          {edit ? (
            <EditableText as="span" edit value={title} onChange={(v) => patch({ title: v })} {...color('title')} {...sizeWeight('title')} />
          ) : (
            lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))
          )}
        </h1>
        {(list.length > 0 || edit) && (
          <div className="cta">
            <ButtonsArea
              sectionLabel="Portada"
              sectionRef={sectionRef}
              buttons={list}
              edit={edit}
              buttonClassName={heroButtonClass}
              onChange={(next) => patch({ buttons: next })}
              staticRender={() => (
                <>
                  {list.map((b) => (
                    <a key={b.id} href={resolveButtonHref(b)} className="btn-ghost">
                      {b.text}
                    </a>
                  ))}
                </>
              )}
            />
          </div>
        )}
      </div>
    </section>
  )
}
