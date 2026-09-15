'use client'

import React, { useLayoutEffect, useRef } from 'react'

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span' | 'strong'

const INLINE_TAGS: Tag[] = ['span', 'strong']

type Props = {
  as?: Tag
  value?: string
  onChange?: (value: string) => void
  edit?: boolean
  className?: string
  /** Evita que un <a> padre navegue mientras se edita el texto de adentro. */
  stopClickNavigation?: boolean
}

/**
 * Texto editable en línea. El contenido se sincroniza SOLO vía ref
 * (useLayoutEffect + textContent), nunca como children de React — si se
 * renderiza como children, cada tecleo reposiciona el cursor al inicio.
 * En edit=false renderiza exactamente igual que un <tag> normal, sin
 * ninguna clase ni comportamiento de edición.
 */
export function EditableText({ as = 'div', value, onChange, edit, className, stopClickNavigation }: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const next = value ?? ''
    if (el.textContent !== next) {
      el.textContent = next
    }
  }, [value])

  const isInline = INLINE_TAGS.includes(as)
  const editClasses = edit
    ? [
        isInline ? 'inline-block' : 'block',
        'cursor-text rounded-sm outline outline-1 outline-transparent transition-[outline-color] hover:outline-admin-primary/50 focus:outline-admin-primary',
      ].join(' ')
    : ''

  return React.createElement(as, {
    ref,
    className: [className, editClasses].filter(Boolean).join(' ') || undefined,
    contentEditable: !!edit,
    suppressContentEditableWarning: true,
    onClick: stopClickNavigation && edit ? (e: React.MouseEvent) => e.preventDefault() : undefined,
    onBlur: edit
      ? (e: React.FocusEvent<HTMLElement>) => {
          const text = e.currentTarget.textContent ?? ''
          if (text !== (value ?? '')) onChange?.(text)
        }
      : undefined,
  })
}
