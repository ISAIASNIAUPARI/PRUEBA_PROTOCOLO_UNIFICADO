'use client'

import React, { useEffect, useId } from 'react'

import { useSelectionOptional } from '@/components/admin/Selection'
import type { ThemeColorChoice } from '@/lib/types'

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span' | 'strong'

const INLINE_TAGS: Tag[] = ['span', 'strong']

type Props = {
  as?: Tag
  value?: string
  onChange?: (value: string) => void
  /** En el admin: el texto es SELECCIONABLE (no se escribe encima). */
  edit?: boolean
  className?: string
  /** Evita que un <a> padre navegue al seleccionar el texto de adentro. */
  stopClickNavigation?: boolean
  /**
   * Color del texto, guardado como ALIAS del slot del tema ("primary") y no
   * como hex: si el cliente cambia el tema global después, el texto sigue el
   * slot correcto en vez de quedarse pegado a un color viejo.
   */
  textColor?: ThemeColorChoice
  onTextColorChange?: (next: ThemeColorChoice | undefined) => void
  /** Nombre legible que muestra el sidebar al seleccionarlo. */
  label?: string
}

/**
 * Texto del sitio. En `edit` NO es editable en línea: se marca con un outline
 * al pasar el mouse y, al hacer clic, se selecciona para editarlo desde el
 * sidebar (Fase E).
 *
 * Nota histórica: antes esto era `contentEditable` y el texto se sincronizaba
 * a mano por ref para que el cursor no saltara al inicio en cada tecleo (ver
 * error #1 del cerebro). Al mover la edición al sidebar, ese problema
 * desaparece de raíz: acá el texto vuelve a ser un render normal de React.
 */
export function EditableText({
  as = 'div',
  value,
  onChange,
  edit,
  className,
  stopClickNavigation,
  textColor,
  onTextColorChange,
  label,
}: Props) {
  const selection = useSelectionOptional()
  const autoId = useId()
  const id = autoId

  const selected = !!selection && selection.selected?.id === id
  const payload = {
    id,
    kind: 'text' as const,
    label: label || 'Texto',
    value: value ?? '',
    textColor,
  }

  // Mientras está seleccionado, se reenvían datos y callbacks frescos al
  // sidebar: los callbacks son flechas en línea que cambian en cada render,
  // por eso viven en un ref y no en el estado (ver Selection.tsx).
  useEffect(() => {
    if (!selected || !selection) return
    selection.refresh(payload, { onChange, onTextColorChange })
  })

  const isInline = INLINE_TAGS.includes(as)
  const editClasses = edit
    ? [
        isInline ? 'inline-block' : 'block',
        'admin-selectable',
        selected ? 'admin-selected' : '',
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  // El override se aplica igual en el admin y en el sitio público.
  const style = textColor ? { color: `var(--color-${textColor})` } : undefined

  return React.createElement(
    as,
    {
      className: [className, editClasses].filter(Boolean).join(' ') || undefined,
      style,
      onClick:
        edit && selection
          ? (e: React.MouseEvent) => {
              if (stopClickNavigation) e.preventDefault()
              e.stopPropagation()
              selection.select(payload, { onChange, onTextColorChange })
            }
          : undefined,
    },
    value ?? ''
  )
}
