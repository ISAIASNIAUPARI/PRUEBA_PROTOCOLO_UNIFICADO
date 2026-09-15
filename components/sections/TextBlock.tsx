'use client'

import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import type { TextBlockData } from '@/lib/types'

import { SectionShell } from './SectionShell'

export function TextBlock({
  id,
  data,
  edit,
  onChange,
}: {
  id: string
  data: TextBlockData
  edit?: boolean
  onChange?: (next: TextBlockData) => void
}) {
  function patch(next: Partial<TextBlockData>) {
    onChange?.({ ...data, ...next })
  }

  return (
    <SectionShell
      id={id}
      subtitle={data.subtitle}
      heading={data.heading}
      backgroundColor={data.backgroundColor}
      edit={edit}
      onSubtitleChange={(v) => patch({ subtitle: v })}
      onHeadingChange={(v) => patch({ heading: v })}
      onBackgroundColorChange={(v) => patch({ backgroundColor: v })}
    >
      <div className="grid grid-cols-1 items-center gap-8 text-left md:grid-cols-2">
        {(data.image?.url || edit) && (
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <EditableImage
              edit={!!edit}
              fill
              src={data.image?.url}
              alt={data.image?.alt}
              aspectRatio={3 / 2}
              imgClassName="h-full w-full object-cover"
              focalX={data.image?.focalX}
              focalY={data.image?.focalY}
              onChange={(url) => patch({ image: { ...(data.image ?? {}), url } })}
              onFocalChange={(x, y) => patch({ image: { ...(data.image ?? { url: '' }), focalX: x, focalY: y } })}
            />
          </div>
        )}
        <div className={data.image?.url || edit ? '' : 'md:col-span-2'}>
          {data.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-base leading-relaxed" style={{ color: 'var(--color-accent)' }}>
              <EditableText
                as="span"
                edit={edit}
                value={p}
                onChange={(v) => {
                  const next = data.paragraphs.slice()
                  next[i] = v
                  patch({ paragraphs: next })
                }}
              />
              {edit && data.paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() => patch({ paragraphs: data.paragraphs.filter((_, j) => j !== i) })}
                  className="ml-2 text-xs text-red-600 hover:underline"
                >
                  eliminar
                </button>
              )}
            </p>
          ))}
          {edit && (
            <button
              type="button"
              onClick={() => patch({ paragraphs: [...data.paragraphs, ''] })}
              className="rounded-md border border-dashed px-3 py-1.5 text-sm"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              + Añadir párrafo
            </button>
          )}
        </div>
      </div>
    </SectionShell>
  )
}
