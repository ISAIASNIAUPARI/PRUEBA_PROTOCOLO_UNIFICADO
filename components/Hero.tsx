'use client'

import { useEffect, useState } from 'react'

import { ButtonsArea } from '@/components/editable/ButtonsArea'
import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { resolveButtonHref } from '@/lib/buttons'
import type { ButtonRef, ImageRef } from '@/lib/types'

type HeroData = {
  title?: string
  slides: ImageRef[]
  buttons?: ButtonRef[]
}

function heroButtonClass() {
  return 'btn-ghost'
}

export function Hero({
  title,
  slides,
  buttons,
  edit,
  onChange,
}: HeroData & {
  edit?: boolean
  onChange?: (next: HeroData) => void
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

  // El titular admite un salto de línea escrito desde el admin.
  const lines = (title || '').split('\n')
  const list = buttons ?? []

  function patch(next: Partial<HeroData>) {
    onChange?.({ title, slides, buttons, ...next })
  }

  return (
    <section className="hero" id="inicio">
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
        <h1>
          {edit ? (
            <EditableText as="span" edit value={title} onChange={(v) => patch({ title: v })} />
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
