'use client'

import { ColorSwatchPicker } from '@/components/admin/ColorSwatchPicker'
import { EditableText } from '@/components/editable/EditableText'
import { themeColorVar } from '@/lib/buttons'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
import type { TextColors, TextSizes, TextWeights, ThemeColorChoice } from '@/lib/types'

/**
 * Wrapper compartido por las 5 plantillas de sección (Fase D, Parte 3):
 * subtitle (eyebrow, opcional) + heading + selector de fondo (4 círculos,
 * arriba a la derecha, solo en edición) + slot para el contenido propio.
 */
export function SectionShell({
  id,
  subtitle,
  heading,
  backgroundColor,
  textColors,
  textSizes,
  textWeights,
  edit,
  onSubtitleChange,
  onHeadingChange,
  onBackgroundColorChange,
  onTextColorsChange,
  onTextStylesChange,
  children,
}: {
  id: string
  subtitle?: string
  heading?: string
  backgroundColor?: ThemeColorChoice
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
  edit?: boolean
  onTextColorsChange?: (next: TextColors) => void
  onTextStylesChange?: (next: { textSizes?: TextSizes; textWeights?: TextWeights }) => void
  onSubtitleChange?: (v: string) => void
  onHeadingChange?: (v: string) => void
  onBackgroundColorChange?: (v: ThemeColorChoice | undefined) => void
  children: React.ReactNode
}) {
  const bg = themeColorVar(backgroundColor)
  const color = textColorProps(textColors, (tc) => onTextColorsChange?.(tc))
  const sizeWeight = textSizeProps(textSizes, textWeights, (next) => onTextStylesChange?.(next))

  return (
    <section id={id} className="relative px-6 py-20" style={bg ? { backgroundColor: bg } : undefined}>
      {edit && onBackgroundColorChange && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2 py-1.5 shadow">
          <ColorSwatchPicker value={backgroundColor} onChange={onBackgroundColorChange} />
        </div>
      )}
      <div className="mx-auto max-w-5xl text-center">
        {(subtitle || edit) && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--color-primary)' }}>
            <EditableText as="span" edit={edit} value={subtitle} onChange={onSubtitleChange} {...color('subtitle')} {...sizeWeight('subtitle')} />
          </div>
        )}
        <h2 className="mb-10 text-3xl font-semibold" style={{ color: 'var(--color-accent)' }}>
          <EditableText as="span" edit={edit} value={heading} onChange={onHeadingChange} {...color('heading')} {...sizeWeight('heading')} />
        </h2>
        {children}
      </div>
    </section>
  )
}
