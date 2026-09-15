'use client'

import type { ThemeColorChoice } from '@/lib/types'

const SLOTS: ThemeColorChoice[] = ['primary', 'secondary', 'accent']

/**
 * 4 círculos: primary/secondary/accent + "sin color". Pintan su fondo
 * directo con la variable CSS en vivo (var(--color-primary) etc.), nunca
 * leyendo theme.json — así muestran el color correcto incluso con un
 * cambio de "Personalizar tema" sin guardar todavía.
 */
export function ColorSwatchPicker({
  value,
  onChange,
  variant = 'light',
}: {
  value?: ThemeColorChoice
  onChange: (next: ThemeColorChoice | undefined) => void
  variant?: 'light' | 'dark'
}) {
  const idleBorder = variant === 'dark' ? 'border-white/40' : 'border-black/20'

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {SLOTS.map((slot) => (
        <button
          key={slot}
          type="button"
          title={slot}
          aria-label={`Color ${slot}`}
          onClick={() => onChange(slot)}
          className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
            value === slot ? 'scale-110 border-admin-primary' : idleBorder
          }`}
          style={{ background: `var(--color-${slot})` }}
        />
      ))}
      <button
        type="button"
        title="Sin color"
        aria-label="Sin color"
        onClick={() => onChange(undefined)}
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-dashed text-[9px] leading-none ${
          !value ? 'border-admin-primary' : `${idleBorder} ${variant === 'dark' ? 'text-white/60' : 'text-admin-ink/50'}`
        }`}
      >
        ×
      </button>
    </div>
  )
}
