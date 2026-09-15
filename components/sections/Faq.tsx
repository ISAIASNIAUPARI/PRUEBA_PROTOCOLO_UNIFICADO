'use client'

import { EditableText } from '@/components/editable/EditableText'
import { newButtonId } from '@/lib/buttons'
import { textColorProps } from '@/lib/text-colors'
import type { FaqData, FaqItem } from '@/lib/types'

import { SectionShell } from './SectionShell'

export function Faq({
  id,
  data,
  edit,
  onChange,
}: {
  id: string
  data: FaqData
  edit?: boolean
  onChange?: (next: FaqData) => void
}) {
  function patch(next: Partial<FaqData>) {
    onChange?.({ ...data, ...next })
  }

  const color = textColorProps(data.textColors, (tc) => patch({ textColors: tc }))

  function updateItem(itemId: string, next: Partial<FaqItem>) {
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
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-4 text-left">
        {data.items.map((item) => (
          <div key={item.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                <EditableText as="span" edit={edit} value={item.question} onChange={(v) => updateItem(item.id, { question: v })} {...color(`items.${item.id}.question`)} />
              </span>
              {edit && (
                <button type="button" onClick={() => patch({ items: data.items.filter((it) => it.id !== item.id) })} className="text-xs text-red-600 hover:underline">
                  eliminar
                </button>
              )}
            </div>
            <p className="text-sm opacity-80" style={{ color: 'var(--color-accent)' }}>
              <EditableText as="span" edit={edit} value={item.answer} onChange={(v) => updateItem(item.id, { answer: v })} {...color(`items.${item.id}.answer`)} />
            </p>
          </div>
        ))}
      </div>

      {edit && (
        <button
          type="button"
          onClick={() => patch({ items: [...data.items, { id: newButtonId(), question: 'Nueva pregunta', answer: '' }] })}
          className="mt-6 rounded-md border border-dashed px-4 py-2 text-sm"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          + Añadir pregunta
        </button>
      )}
    </SectionShell>
  )
}
