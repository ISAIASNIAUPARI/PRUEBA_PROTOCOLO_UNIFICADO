'use client'

import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
import { newParagraphId, normalizeParagraphs, type TextBlockData } from '@/lib/types'

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

  const color = textColorProps(data.textColors, (tc) => patch({ textColors: tc }))

  const sizeWeight = textSizeProps(data.textSizes, data.textWeights, (next) => patch(next))

  // El contenido viejo trae `string[]`; se normaliza al leer y se vuelve a
  // guardar ya con ids, así el JSON migra solo en el primer cambio.
  const paragraphs = normalizeParagraphs(data.paragraphs)

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
      textColors={data.textColors}
      onTextColorsChange={(tc) => patch({ textColors: tc })}
      textSizes={data.textSizes}
      textWeights={data.textWeights}
      onTextStylesChange={(next) => patch(next)}
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
          {paragraphs.map((p) => (
            <p key={p.id} className="mb-4 text-base leading-relaxed" style={{ color: 'var(--color-accent)' }}>
              <EditableText
                as="span"
                edit={edit}
                value={p.text}
                onChange={(v) => {
                  patch({ paragraphs: paragraphs.map((q) => (q.id === p.id ? { ...q, text: v } : q)) })
                }}
                {...color(`paragraphs.${p.id}.paragraph`)} {...sizeWeight(`paragraphs.${p.id}.paragraph`)}
              />
              {edit && paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() => patch({ paragraphs: paragraphs.filter((q) => q.id !== p.id) })}
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
              onClick={() => patch({ paragraphs: [...paragraphs, { id: newParagraphId(), text: '' }] })}
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
