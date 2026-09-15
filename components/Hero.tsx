'use client'

import { useEffect, useState } from 'react'

import { EditableButton } from '@/components/editable/EditableButton'
import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import type { ButtonRef, ImageRef } from '@/lib/types'

type HeroData = {
  title?: string
  slides: ImageRef[]
  buttons?: ButtonRef[]
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
              onChange={(url) => {
                const next = slides.slice()
                next[i] = { ...s, url }
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
        {!!buttons?.length && (
          <div className="cta">
            {buttons.map((c, i) => (
              <EditableButton
                key={i}
                edit={edit}
                button={c}
                className="btn-ghost"
                onChange={(next) => {
                  const nextButtons = buttons.slice()
                  nextButtons[i] = next
                  patch({ buttons: nextButtons })
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
