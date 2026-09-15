'use client'

import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import type { ImageRef } from '@/lib/types'

type AboutData = {
  heading?: string
  body?: string
  imageLeft?: ImageRef | null
  imageRight?: ImageRef | null
}

export function About({
  heading,
  body,
  imageLeft,
  imageRight,
  edit,
  onChange,
}: AboutData & {
  edit?: boolean
  onChange?: (next: AboutData) => void
}) {
  function patch(next: Partial<AboutData>) {
    onChange?.({ heading, body, imageLeft, imageRight, ...next })
  }

  return (
    <section className="about" id="sobre">
      <div className="plate" />
      <div className="wrap">
        <div className="about-grid">
          <div className="framed reveal">
            {edit ? (
              <EditableImage
                edit
                src={imageLeft?.url}
                alt={imageLeft?.alt}
                imgClassName="h-full w-full object-cover"
                onChange={(url) => patch({ imageLeft: { ...(imageLeft ?? {}), url } })}
              />
            ) : (
              imageLeft && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageLeft.url}
                  alt={imageLeft.alt || ''}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: 'center top' }}
                />
              )
            )}
          </div>
          <div className="about-copy reveal">
            <h2>
              <EditableText as="span" edit={edit} value={heading} onChange={(v) => patch({ heading: v })} />
            </h2>
            {(body || edit) && (
              <p>
                <EditableText as="span" edit={edit} value={body} onChange={(v) => patch({ body: v })} />
              </p>
            )}
          </div>
          <div className="framed reveal">
            {edit ? (
              <EditableImage
                edit
                src={imageRight?.url}
                alt={imageRight?.alt}
                imgClassName="h-full w-full object-cover"
                onChange={(url) => patch({ imageRight: { ...(imageRight ?? {}), url } })}
              />
            ) : (
              imageRight && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imageRight.url} alt={imageRight.alt || ''} loading="lazy" decoding="async" />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
