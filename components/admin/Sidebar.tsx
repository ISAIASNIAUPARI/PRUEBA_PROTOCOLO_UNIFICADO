'use client'

import { SIZE_PX, SIZE_STEPS, WEIGHT_STEPS, type SizeStep, type TextSize } from '@/lib/text-colors'

import { ColorSwatchPicker } from './ColorSwatchPicker'
import { useSelection } from './Selection'

/**
 * Columna de edición del elemento seleccionado (Fase E).
 *
 * Es EXCLUSIVA de la edición: texto y color, o los controles propios de una
 * imagen/video/objeto 3D. Todo lo demás —organizar página, tema,
 * configuración, guardar, salir— vive en la barra superior.
 *
 * Solo se monta cuando hay algo seleccionado: sin selección, el preview ocupa
 * el ancho completo.
 */
export function Sidebar() {
  const { selected, handlers, clear } = useSelection()
  if (!selected) return null

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-head">
        <span className="admin-sidebar-label">{selected.label}</span>
        <button type="button" onClick={clear} className="admin-sidebar-close" title="Cerrar edición">
          ×
        </button>
      </div>

      <div className="admin-sidebar-body">
        {selected.kind === 'text' && (
          <div className="flex flex-col gap-4">
            <textarea
              autoFocus
              value={selected.value ?? ''}
              onChange={(e) => handlers.current.onChange?.(e.target.value)}
              rows={5}
              className="admin-sidebar-input"
              placeholder="Escribe el texto…"
            />

            {handlers.current.onTextColorChange && (
              <div>
                <span className="admin-sidebar-sublabel">Color de texto</span>
                <div className="mt-2">
                  <ColorSwatchPicker
                    variant="dark"
                    value={selected.textColor}
                    onChange={(next) => handlers.current.onTextColorChange?.(next)}
                  />
                </div>
              </div>
            )}

            {handlers.current.onFontSizeChange && (
              <SizeControl
                value={selected.fontSize}
                onChange={(next) => handlers.current.onFontSizeChange?.(next)}
              />
            )}

            {handlers.current.onFontWeightChange && (
              <WeightControl
                value={selected.fontWeight}
                onChange={(next) => handlers.current.onFontWeightChange?.(next)}
              />
            )}
          </div>
        )}

        {selected.kind === 'media' && <div className="admin-sidebar-media">{handlers.current.renderControls?.()}</div>}
      </div>
    </aside>
  )
}

/**
 * Tamaño de letra, en dos filas independientes: escritorio y móvil.
 *
 * Se separan a propósito — el mismo valor en px se ve mucho más grande en una
 * pantalla de 390px, así que un único control obligaría a elegir cuál de las
 * dos vistas se sacrifica. Sin valor guardado no hay ningún botón activo: el
 * texto hereda el tamaño del CSS del sitio.
 */
function SizeControl({ value, onChange }: { value?: TextSize; onChange: (next: TextSize | undefined) => void }) {
  const rows: { view: 'd' | 'm'; label: string }[] = [
    { view: 'd', label: '🖥 Escritorio' },
    { view: 'm', label: '📱 Móvil' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="admin-sidebar-sublabel">Tamaño de letra</span>
        {(value?.d != null || value?.m != null) && (
          <button type="button" className="admin-sidebar-clear" title="Quitar tamaño" onClick={() => onChange(undefined)}>
            ×
          </button>
        )}
      </div>

      {rows.map((row) => (
        <div key={row.view} className="mt-2">
          <span className="admin-sidebar-rowlabel">{row.label}</span>
          <div className="admin-sidebar-steps">
            {SIZE_STEPS.map((step: SizeStep) => {
              const px = SIZE_PX[row.view][step]
              const active = value?.[row.view] === px
              return (
                <button
                  key={step}
                  type="button"
                  title={`${px}px`}
                  className={`admin-sidebar-step ${active ? 'is-active' : ''}`}
                  onClick={() => onChange({ ...value, [row.view]: active ? undefined : px })}
                >
                  {step}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Grosor: un solo valor para ambas vistas. */
function WeightControl({ value, onChange }: { value?: number; onChange: (next: number | undefined) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="admin-sidebar-sublabel">Grosor</span>
        {value != null && (
          <button type="button" className="admin-sidebar-clear" title="Quitar grosor" onClick={() => onChange(undefined)}>
            ×
          </button>
        )}
      </div>
      <div className="admin-sidebar-steps mt-2">
        {WEIGHT_STEPS.map((w) => (
          <button
            key={w.value}
            type="button"
            style={{ fontWeight: w.value }}
            className={`admin-sidebar-step ${value === w.value ? 'is-active' : ''}`}
            onClick={() => onChange(value === w.value ? undefined : w.value)}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  )
}
