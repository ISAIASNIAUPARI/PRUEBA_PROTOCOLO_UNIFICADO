'use client'

import { useIsMobileView } from '@/components/admin/useIsMobileView'
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
  const isMobile = useIsMobileView()

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
                className="h-full w-full"
                src={imageLeft?.url}
                alt={imageLeft?.alt}
                imgClassName="h-full w-full object-cover"
                aspectRatio={230 / 500}
                onChange={(url) => patch({ imageLeft: { ...(imageLeft ?? {}), url } })}
                onFocalChange={(x, y) => patch({ imageLeft: { ...(imageLeft ?? { url: '' }), focalX: x, focalY: y } })}
                focalX={imageLeft?.focalX}
                focalY={imageLeft?.focalY}
              />
            ) : (
              imageLeft && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageLeft.url}
                  alt={imageLeft.alt || ''}
                  loading="lazy"
                  decoding="async"
                  style={{
                    objectPosition:
                      imageLeft.focalX != null && imageLeft.focalY != null
                        ? `${imageLeft.focalX}% ${imageLeft.focalY}%`
                        : 'center top',
                  }}
                />
              )
            )}
          </div>
          <div className="about-copy reveal">
            <h2 style={isMobile ? { fontSize: '24px' } : undefined}>
              <EditableText as="span" edit={edit} value={heading} onChange={(v) => patch({ heading: v })} />
            </h2>
            {(body || edit) && (
              <p style={isMobile ? { fontSize: '15px' } : undefined}>
                <EditableText as="span" edit={edit} value={body} onChange={(v) => patch({ body: v })} />
              </p>
            )}
          </div>
          <div className="framed reveal">
            {edit ? (
              <EditableImage
                edit
                className="h-full w-full"
                src={imageRight?.url}
                alt={imageRight?.alt}
                imgClassName="h-full w-full object-cover"
                aspectRatio={230 / 500}
                onChange={(url) => patch({ imageRight: { ...(imageRight ?? {}), url } })}
                onFocalChange={(x, y) => patch({ imageRight: { ...(imageRight ?? { url: '' }), focalX: x, focalY: y } })}
                focalX={imageRight?.focalX}
                focalY={imageRight?.focalY}
              />
            ) : (
              imageRight && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageRight.url}
                  alt={imageRight.alt || ''}
                  loading="lazy"
                  decoding="async"
                  style={
                    imageRight.focalX != null && imageRight.focalY != null
                      ? { objectPosition: `${imageRight.focalX}% ${imageRight.focalY}%` }
                      : undefined
                  }
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
