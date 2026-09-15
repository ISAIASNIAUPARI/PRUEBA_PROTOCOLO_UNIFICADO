'use client'

import { useRef } from 'react'

import { ColorSwatchPicker } from '@/components/admin/ColorSwatchPicker'
import { ButtonsArea } from '@/components/editable/ButtonsArea'
import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { resolveButtonHref, themeColorVar } from '@/lib/buttons'
import type { CtaBannerData } from '@/lib/types'

function ctaButtonClass(i: number) {
  return i === 0
    ? 'inline-block rounded px-6 py-3 text-sm font-medium text-white'
    : 'inline-block rounded border px-6 py-3 text-sm font-medium'
}

/** No usa SectionShell: necesita la imagen de fondo detrás de TODO el
 * contenido (subtitle/heading/body/botones), no solo de una franja aparte. */
export function CtaBanner({
  id,
  data,
  edit,
  onChange,
}: {
  id: string
  data: CtaBannerData
  edit?: boolean
  onChange?: (next: CtaBannerData) => void
}) {
  const sectionRef = useRef<HTMLElement>(null)

  function patch(next: Partial<CtaBannerData>) {
    onChange?.({ ...data, ...next })
  }

  const bg = themeColorVar(data.backgroundColor)
  const hasImage = !!data.backgroundImage?.url

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative flex min-h-[420px] items-center justify-center overflow-hidden px-6 py-20"
      style={{ backgroundColor: bg ?? 'var(--color-accent)' }}
    >
      {(hasImage || edit) && (
        <EditableImage
          edit={!!edit}
          fill
          src={data.backgroundImage?.url}
          alt={data.backgroundImage?.alt}
          aspectRatio={16 / 9}
          imgClassName="h-full w-full object-cover"
          focalX={data.backgroundImage?.focalX}
          focalY={data.backgroundImage?.focalY}
          onChange={(url) => patch({ backgroundImage: { ...(data.backgroundImage ?? {}), url } })}
          onFocalChange={(x, y) => patch({ backgroundImage: { ...(data.backgroundImage ?? { url: '' }), focalX: x, focalY: y } })}
        />
      )}
      {hasImage && <div className="absolute inset-0 bg-black/45" />}

      {edit && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-white/90 px-2 py-1.5 shadow">
          <ColorSwatchPicker value={data.backgroundColor} onChange={(v) => patch({ backgroundColor: v })} />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {(data.subtitle || edit) && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--color-primary)' }}>
            <EditableText as="span" edit={edit} value={data.subtitle} onChange={(v) => patch({ subtitle: v })} />
          </div>
        )}
        <h2 className="mb-4 text-3xl font-semibold" style={{ color: hasImage ? '#fff' : 'var(--color-accent)' }}>
          <EditableText as="span" edit={edit} value={data.heading} onChange={(v) => patch({ heading: v })} />
        </h2>
        <p className="mb-8 text-base" style={{ color: hasImage ? 'rgba(255,255,255,0.85)' : 'var(--color-accent)' }}>
          <EditableText as="span" edit={edit} value={data.body} onChange={(v) => patch({ body: v })} />
        </p>

        {(data.buttons.length > 0 || edit) && (
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonsArea
              sectionLabel="Llamada a la acción"
              sectionRef={sectionRef}
              buttons={data.buttons}
              edit={edit}
              buttonClassName={ctaButtonClass}
              onChange={(next) => patch({ buttons: next.slice(0, 2) })}
              staticRender={() => (
                <>
                  {data.buttons.map((b, i) => (
                    <a
                      key={b.id}
                      href={resolveButtonHref(b)}
                      className={ctaButtonClass(i)}
                      style={i === 0 ? { background: 'var(--color-primary)' } : { borderColor: 'var(--color-primary)', color: hasImage ? '#fff' : 'var(--color-primary)' }}
                    >
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
