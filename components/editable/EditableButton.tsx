'use client'

import Link from 'next/link'

import type { ButtonRef } from '@/lib/types'

import { EditableText } from './EditableText'

function isSafeHref(href: string) {
  return !/^\s*(javascript:|data:)/i.test(href)
}

/**
 * Botón editable: texto (EditableText) + URL destino (input aparte, porque
 * el href no se puede editar dentro de un contentEditable). Rechaza
 * javascript: y data: como destino.
 */
export function EditableButton({
  button,
  edit,
  onChange,
  className,
  textClassName,
}: {
  button: ButtonRef
  edit?: boolean
  onChange?: (next: ButtonRef) => void
  className?: string
  textClassName?: string
}) {
  if (!edit) {
    return (
      <Link href={button.href || '#'} className={className}>
        {button.text}
      </Link>
    )
  }

  return (
    <span className={`${className ?? ''} inline-flex flex-col items-start gap-1`}>
      <EditableText
        as="span"
        edit
        value={button.text}
        className={textClassName}
        onChange={(text) => onChange?.({ ...button, text })}
      />
      <input
        type="text"
        value={button.href}
        onChange={(e) => {
          const href = e.target.value
          if (isSafeHref(href)) onChange?.({ ...button, href })
        }}
        placeholder="URL del botón"
        className="w-full rounded border border-admin-line px-1.5 py-0.5 text-xs text-admin-ink"
      />
    </span>
  )
}
