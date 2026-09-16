'use client'

import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { newButtonId } from '@/lib/buttons'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
import type { MenuGridData, MenuGridItem } from '@/lib/types'

import { SectionShell } from './SectionShell'

export function MenuGrid({
  id,
  data,
  edit,
  onChange,
}: {
  id: string
  data: MenuGridData
  edit?: boolean
  onChange?: (next: MenuGridData) => void
}) {
  function patch(next: Partial<MenuGridData>) {
    onChange?.({ ...data, ...next })
  }

  const color = textColorProps(data.textColors, (tc) => patch({ textColors: tc }))

  const sizeWeight = textSizeProps(data.textSizes, data.textWeights, (next) => patch(next))

  function updateItem(itemId: string, next: Partial<MenuGridItem>) {
    patch({ items: data.items.map((it) => (it.id === itemId ? { ...it, ...next } : it)) })
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
      textColors={data.textColors}
      onTextColorsChange={(tc) => patch({ textColors: tc })}
      textSizes={data.textSizes}
      textWeights={data.textWeights}
      onTextStylesChange={(next) => patch(next)}
    >
      <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-lg border" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="relative aspect-square w-full overflow-hidden">
              <EditableImage
                edit={!!edit}
                fill
                src={item.image?.url}
                alt={item.image?.alt}
                aspectRatio={1}
                imgClassName="h-full w-full object-cover"
                focalX={item.image?.focalX}
                focalY={item.image?.focalY}
                onChange={(url) => updateItem(item.id, { image: { ...(item.image ?? {}), url } })}
                onFocalChange={(x, y) => updateItem(item.id, { image: { ...(item.image ?? { url: '' }), focalX: x, focalY: y } })}
              />
            </div>
            <div className="p-4">
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                  <EditableText as="span" edit={edit} value={item.name} onChange={(v) => updateItem(item.id, { name: v })} {...color(`items.${item.id}.name`)} {...sizeWeight(`items.${item.id}.name`)} />
                </span>
                <span className="whitespace-nowrap font-medium" style={{ color: 'var(--color-primary)' }}>
                  <EditableText as="span" edit={edit} value={item.price} onChange={(v) => updateItem(item.id, { price: v })} {...color(`items.${item.id}.price`)} {...sizeWeight(`items.${item.id}.price`)} />
                </span>
              </div>
              <p className="text-sm opacity-70" style={{ color: 'var(--color-accent)' }}>
                <EditableText as="span" edit={edit} value={item.description} onChange={(v) => updateItem(item.id, { description: v })} {...color(`items.${item.id}.description`)} {...sizeWeight(`items.${item.id}.description`)} />
              </p>
              {edit && (
                <button
                  type="button"
                  onClick={() => patch({ items: data.items.filter((it) => it.id !== item.id) })}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Eliminar tarjeta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <button
          type="button"
          onClick={() =>
            patch({
              items: [...data.items, { id: newButtonId(), image: null, name: 'Nuevo plato', price: '$0', description: '' }],
            })
          }
          className="mt-6 rounded-md border border-dashed px-4 py-2 text-sm"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          + Añadir tarjeta
        </button>
      )}
    </SectionShell>
  )
}
