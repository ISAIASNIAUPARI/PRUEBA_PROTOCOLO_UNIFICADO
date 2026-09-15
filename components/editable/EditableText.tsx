'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { ColorSwatchPicker } from '@/components/admin/ColorSwatchPicker'
import type { ThemeColorChoice } from '@/lib/types'

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
  /**
   * Color del texto, guardado como ALIAS del slot del tema ("primary") y no
   * como hex: si el cliente cambia el tema global después, el texto sigue el
   * slot correcto en vez de quedarse pegado a un color viejo.
   */
  textColor?: ThemeColorChoice
  /** Si se pasa, aparece el lápiz para elegir color. Sin esto no hay lápiz. */
  onTextColorChange?: (next: ThemeColorChoice | undefined) => void
}

/**
 * Texto editable en línea. El contenido se sincroniza SOLO vía ref
 * (useLayoutEffect + textContent), nunca como children de React — si se
 * renderiza como children, cada tecleo reposiciona el cursor al inicio.
 * En edit=false renderiza exactamente igual que un <tag> normal, sin
 * ninguna clase ni comportamiento de edición.
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
}: Props) {
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

  // El override se aplica igual en el admin y en el sitio público.
  const style = textColor ? { color: `var(--color-${textColor})` } : undefined

  const element = React.createElement(as, {
    ref,
    className: [className, editClasses].filter(Boolean).join(' ') || undefined,
    style,
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

  // Sin handler de color no se envuelve en nada: los componentes que no usan
  // la función renderizan exactamente el mismo DOM que antes.
  if (!edit || !onTextColorChange) return element

  return (
    <TextColorWrapper isInline={isInline} textColor={textColor} onTextColorChange={onTextColorChange}>
      {element}
    </TextColorWrapper>
  )
}

/**
 * Envoltorio que añade el lápiz de color. Solo existe en modo edición y solo
 * cuando la sección pasa `onTextColorChange`, para no alterar el DOM público.
 * El lápiz va FUERA del elemento contentEditable — dentro pasaría a formar
 * parte del texto que el usuario edita.
 */
function TextColorWrapper({
  isInline,
  textColor,
  onTextColorChange,
  children,
}: {
  isInline: boolean
  textColor?: ThemeColorChoice
  onTextColorChange: (next: ThemeColorChoice | undefined) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span ref={wrapRef} className={`relative ${isInline ? 'inline-block' : 'block'}`}>
      {children}
      <button
        type="button"
        title="Color del texto"
        aria-label="Color del texto"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={`absolute -right-5 top-0 flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none transition-opacity ${
          open ? 'opacity-100' : 'opacity-45 hover:opacity-100'
        }`}
        style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
      >
        ✏️
      </button>

      {open && (
        <span
          className="absolute right-0 top-5 z-[950] rounded-md border border-admin-line bg-white p-2 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ColorSwatchPicker
            value={textColor}
            onChange={(next) => {
              onTextColorChange(next)
              setOpen(false)
            }}
          />
        </span>
      )}
    </span>
  )
}
